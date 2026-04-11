# -*- coding: utf-8 -*-
"""
Moodify - Flask API 服务器
提供歌单和视频管理 API
"""

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import os
from pathlib import Path
import mimetypes

from database import (
    init_database,
    PlaylistManager,
    SongManager,
    VideoFolderManager,
    VideoManager,
    MUSIC_DIR,
    VIDEOS_DIR
)

# 初始化 Flask
app = Flask(__name__, static_folder='moodify_web', static_url_path='')
CORS(app)

# 确保数据库和文件夹存在
BASE_DIR = Path(__file__).parent
init_database()


# ============ 通用响应 ============

def success(data=None, message='OK'):
    return jsonify({'success': True, 'data': data, 'message': message})


def error(message='Error', code=400):
    return jsonify({'success': False, 'message': message}), code


# ============ 健康检查 ============

@app.route('/api/health', methods=['GET'])
def health_check():
    return success({'status': 'running', 'version': '1.0.0'})


# ============ 歌单 API ============

@app.route('/api/playlists', methods=['GET'])
def get_playlists():
    """获取所有歌单"""
    playlists = PlaylistManager.get_all()
    return success(playlists)


@app.route('/api/playlists', methods=['POST'])
def create_playlist():
    """创建歌单"""
    data = request.json
    name = data.get('name', '新歌单')
    description = data.get('description', '')
    cover_color = data.get('cover_color', '#A8B8C9')
    playlist_id = PlaylistManager.create(name, description, cover_color)
    return success({'id': playlist_id}, '歌单创建成功')


@app.route('/api/playlists/<int:playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    """获取歌单详情"""
    playlist = PlaylistManager.get_by_id(playlist_id)
    if not playlist:
        return error('歌单不存在', 404)
    songs = SongManager.get_by_playlist(playlist_id)
    playlist['songs'] = songs
    return success(playlist)


@app.route('/api/playlists/<int:playlist_id>', methods=['PUT'])
def update_playlist(playlist_id):
    """更新歌单"""
    data = request.json
    PlaylistManager.update(
        playlist_id,
        name=data.get('name'),
        description=data.get('description'),
        cover_color=data.get('cover_color')
    )
    return success(message='歌单更新成功')


@app.route('/api/playlists/<int:playlist_id>', methods=['DELETE'])
def delete_playlist(playlist_id):
    """删除歌单"""
    PlaylistManager.delete(playlist_id)
    return success(message='歌单删除成功')


# ============ 歌曲 API ============

@app.route('/api/songs', methods=['GET'])
def get_songs():
    """获取所有歌曲"""
    songs = SongManager.get_all()
    return success(songs)


@app.route('/api/songs/scan', methods=['POST'])
def scan_music():
    """扫描音乐文件夹"""
    files = SongManager.scan_music_folder()
    return success(files, f'发现 {len(files)} 个音频文件')


@app.route('/api/playlists/<int:playlist_id>/songs', methods=['POST'])
def add_song_to_playlist(playlist_id):
    """添加歌曲到歌单"""
    data = request.json
    name = data.get('name')
    file_path = data.get('file_path')
    mood = data.get('mood', 'unknown')
    duration = data.get('duration', 0)

    if not name or not file_path:
        return error('歌曲名称和路径不能为空')

    song_id = SongManager.add(playlist_id, name, file_path, mood, duration)
    return success({'id': song_id}, '歌曲添加成功')


@app.route('/api/songs/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    """删除歌曲"""
    SongManager.delete(song_id)
    return success(message='歌曲删除成功')


# ============ 视频文件夹 API ============

@app.route('/api/video-folders', methods=['GET'])
def get_video_folders():
    """获取所有视频文件夹"""
    folders = VideoFolderManager.get_all()
    return success(folders)


@app.route('/api/video-folders', methods=['POST'])
def create_video_folder():
    """创建视频文件夹"""
    data = request.json
    name = data.get('name', '新文件夹')
    description = data.get('description', '')
    cover_icon = data.get('cover_icon', '📁')

    try:
        folder_id = VideoFolderManager.create(name, description, cover_icon)
        return success({'id': folder_id}, '文件夹创建成功')
    except Exception as e:
        return error(f'创建失败: {str(e)}')


@app.route('/api/video-folders/<folder_name>', methods=['DELETE'])
def delete_video_folder(folder_name):
    """删除视频文件夹"""
    VideoFolderManager.delete(folder_name)
    return success(message='文件夹删除成功')


# ============ 视频 API ============

@app.route('/api/videos', methods=['GET'])
def get_videos():
    """获取所有视频"""
    folder = request.args.get('folder')
    if folder:
        videos = VideoManager.get_by_folder(folder)
    else:
        videos = VideoManager.get_all()
    return success(videos)


@app.route('/api/videos/scan', methods=['POST'])
def scan_videos():
    """扫描视频文件夹"""
    data = request.json
    folder_name = data.get('folder')

    if folder_name:
        files = VideoManager.scan_folder(folder_name)
    else:
        files = VideoManager.get_all_video_files()

    return success(files, f'发现 {len(files)} 个视频文件')


@app.route('/api/videos/<int:video_id>', methods=['POST'])
def add_video(video_id=None):
    """添加视频到数据库"""
    data = request.json
    folder = data.get('folder', 'default')
    name = data.get('name')
    file_path = data.get('file_path')
    duration = data.get('duration', 0)

    if not name or not file_path:
        return error('视频名称和路径不能为空')

    video_id = VideoManager.add(folder, name, file_path, duration)
    return success({'id': video_id}, '视频添加成功')


@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    """删除视频"""
    VideoManager.delete(video_id)
    return success(message='视频删除成功')


# ============ 文件服务 ============

@app.route('/music/<path:filename>')
def serve_music(filename):
    """提供音乐文件"""
    return send_from_directory(str(MUSIC_DIR), filename)


@app.route('/video/<path:filename>')
def serve_video(filename):
    """提供视频文件"""
    return send_from_directory(str(VIDEOS_DIR), filename)


@app.route('/api/folders/<folder_name>/<path:filename>')
def serve_folder_video(folder_name, filename):
    """提供指定文件夹的视频文件"""
    folder_path = VIDEOS_DIR / folder_name
    return send_from_directory(str(folder_path), filename)


# ============ 前端页面 ============

@app.route('/')
def index():
    """返回前端页面"""
    return send_file('moodify_web/index.html')


@app.route('/player')
def player():
    """独立的播放器页面"""
    player_html = BASE_DIR / 'moodify_web' / 'player.html'
    if player_html.exists():
        return send_file(str(player_html))
    return send_file('moodify_web/index.html')


# ============ 启动服务器 ============

if __name__ == '__main__':
    print("=" * 50)
    print("🎵 Moodify 媒体服务器")
    print("=" * 50)
    print(f"📂 音乐目录: {MUSIC_DIR}")
    print(f"📂 视频目录: {VIDEOS_DIR}")
    print(f"🗄️  数据库: {BASE_DIR / 'moodify.db'}")
    print("=" * 50)
    print("🚀 API 服务启动中...")
    print("📍 http://localhost:5000")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
