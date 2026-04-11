# -*- coding: utf-8 -*-
"""
Moodify 后端服务器
Flask + 音乐播放控制
"""

import os
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# 调试日志
DEBUG_LOG = 'c:\\Users\\Administrator\\Desktop\\moodify\\.cursor\\debug.log'

def log(msg, data=None):
    """写日志"""
    try:
        with open(DEBUG_LOG, 'a', encoding='utf-8') as f:
            entry = {'timestamp': 1234567890, 'message': msg}
            if data:
                entry['data'] = data
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    except:
        pass

# 音乐文件夹
MUSIC_DIR = os.path.join(os.path.dirname(__file__), 'music')

app = Flask(__name__)
CORS(app)  # 允许跨域访问


@app.route('/')
def index():
    """首页"""
    return jsonify({
        'name': 'Moodify',
        'status': 'running',
        'message': '情绪的潮汐，终将抵达彼岸'
    })


@app.route('/api/music')
def get_music():
    """获取音乐列表"""
    log('get_music', {'event': 'call'})
    
    if not os.path.exists(MUSIC_DIR):
        os.makedirs(MUSIC_DIR)
    
    songs = []
    for file in os.listdir(MUSIC_DIR):
        if file.lower().endswith(('.mp3', '.wav', '.flac', '.ogg', '.m4a')):
            name = os.path.splitext(file)[0]
            songs.append({
                'id': len(songs),
                'name': name,
                'file': file,
                'path': f'/api/music/file/{file}'
            })
    
    log('get_music', {'count': len(songs)})
    return jsonify({'songs': songs, 'count': len(songs)})


@app.route('/api/music/file/<filename>')
def serve_music(filename):
    """播放音乐文件"""
    log('serve_music', {'file': filename})
    return send_from_directory(MUSIC_DIR, filename)


def main():
    log('server', {'event': 'start'})
    print('=' * 50)
    print('🎵 Moodify 服务器启动中...')
    print('=' * 50)
    print(f'📁 音乐文件夹: {MUSIC_DIR}')
    print(f'🌐 访问地址: http://127.0.0.1:5000')
    print(f'📋 API 文档: http://127.0.0.1:5000/api/music')
    print('=' * 50)
    print('提示：保持此窗口打开，用浏览器打开 index.html')
    print('=' * 50)
    app.run(host='127.0.0.1', port=5000, debug=False)


if __name__ == '__main__':
    main()
