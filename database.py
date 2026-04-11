# -*- coding: utf-8 -*-
"""
Moodify - 数据库管理模块
支持歌单和视频管理
"""

import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

# 路径配置
BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "moodify.db"
MUSIC_DIR = BASE_DIR / "music"
VIDEOS_DIR = BASE_DIR / "videos"


def get_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """初始化数据库"""
    conn = get_connection()
    cursor = conn.cursor()

    # 创建歌单表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            cover_color TEXT DEFAULT '#A8B8C9',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 创建歌曲表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlist_id INTEGER,
            name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            mood TEXT DEFAULT 'unknown',
            duration INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE SET NULL
        )
    """)

    # 创建视频表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            folder TEXT DEFAULT 'default',
            duration INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 创建视频文件夹表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS video_folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT DEFAULT '',
            cover_icon TEXT DEFAULT '📁',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    # 确保文件夹存在
    MUSIC_DIR.mkdir(exist_ok=True)
    VIDEOS_DIR.mkdir(exist_ok=True)

    print(f"[数据库] 初始化完成 - {DB_PATH}")


# ============ 歌单管理 ============

class PlaylistManager:
    """歌单管理器"""

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有歌单"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, COUNT(s.id) as song_count
            FROM playlists p
            LEFT JOIN songs s ON s.playlist_id = p.id
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        """)
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def get_by_id(playlist_id: int) -> Optional[Dict]:
        """获取指定歌单"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM playlists WHERE id = ?", (playlist_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(name: str, description: str = '', cover_color: str = '#A8B8C9') -> int:
        """创建歌单"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO playlists (name, description, cover_color) VALUES (?, ?, ?)",
            (name, description, cover_color)
        )
        playlist_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return playlist_id

    @staticmethod
    def update(playlist_id: int, name: str = None, description: str = None, cover_color: str = None):
        """更新歌单"""
        conn = get_connection()
        cursor = conn.cursor()

        updates = []
        params = []
        if name is not None:
            updates.append("name = ?")
            params.append(name)
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        if cover_color is not None:
            updates.append("cover_color = ?")
            params.append(cover_color)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(playlist_id)
            cursor.execute(
                f"UPDATE playlists SET {', '.join(updates)} WHERE id = ?",
                params
            )
            conn.commit()
        conn.close()

    @staticmethod
    def delete(playlist_id: int):
        """删除歌单"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM songs WHERE playlist_id = ?", (playlist_id,))
        cursor.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
        conn.commit()
        conn.close()


# ============ 歌曲管理 ============

class SongManager:
    """歌曲管理器"""

    @staticmethod
    def get_by_playlist(playlist_id: int) -> List[Dict]:
        """获取歌单中的歌曲"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM songs WHERE playlist_id = ? ORDER BY created_at DESC",
            (playlist_id,)
        )
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有歌曲"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM songs ORDER BY created_at DESC")
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def add(playlist_id: int, name: str, file_path: str, mood: str = 'unknown', duration: int = 0) -> int:
        """添加歌曲到歌单"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO songs (playlist_id, name, file_path, mood, duration) VALUES (?, ?, ?, ?, ?)",
            (playlist_id, name, file_path, mood, duration)
        )
        song_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return song_id

    @staticmethod
    def delete(song_id: int):
        """删除歌曲"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def scan_music_folder() -> List[Dict]:
        """扫描音乐文件夹，返回所有音频文件"""
        music_files = []
        if MUSIC_DIR.exists():
            for ext in ('.mp3', '.wav', '.flac', '.ogg', '.m4a'):
                for file in MUSIC_DIR.glob(f'*{ext}'):
                    music_files.append({
                        'name': file.stem,
                        'file_path': str(file),
                        'size': file.stat().st_size
                    })
        return music_files


# ============ 视频文件夹管理 ============

class VideoFolderManager:
    """视频文件夹管理器"""

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有视频文件夹"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT vf.*, COUNT(v.id) as video_count
            FROM video_folders vf
            LEFT JOIN videos v ON v.folder = vf.name
            GROUP BY vf.id
            ORDER BY vf.created_at DESC
        """)
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def create(name: str, description: str = '', cover_icon: str = '📁') -> int:
        """创建视频文件夹"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO video_folders (name, description, cover_icon) VALUES (?, ?, ?)",
            (name, description, cover_icon)
        )
        folder_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # 创建对应的物理文件夹
        folder_path = VIDEOS_DIR / name
        folder_path.mkdir(exist_ok=True)

        return folder_id

    @staticmethod
    def delete(folder_name: str):
        """删除视频文件夹"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM videos WHERE folder = ?", (folder_name,))
        cursor.execute("DELETE FROM video_folders WHERE name = ?", (folder_name,))
        conn.commit()
        conn.close()


# ============ 视频管理 ============

class VideoManager:
    """视频管理器"""

    @staticmethod
    def get_by_folder(folder_name: str = None) -> List[Dict]:
        """获取指定文件夹中的视频"""
        conn = get_connection()
        cursor = conn.cursor()
        if folder_name:
            cursor.execute(
                "SELECT * FROM videos WHERE folder = ? ORDER BY created_at DESC",
                (folder_name,)
            )
        else:
            cursor.execute("SELECT * FROM videos ORDER BY created_at DESC")
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def get_all() -> List[Dict]:
        """获取所有视频"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos ORDER BY created_at DESC")
        result = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return result

    @staticmethod
    def add(folder_name: str, name: str, file_path: str, duration: int = 0) -> int:
        """添加视频"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO videos (folder, name, file_path, duration) VALUES (?, ?, ?, ?)",
            (folder_name, name, file_path, duration)
        )
        video_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return video_id

    @staticmethod
    def delete(video_id: int):
        """删除视频"""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM videos WHERE id = ?", (video_id,))
        conn.commit()
        conn.close()

    @staticmethod
    def scan_folder(folder_name: str) -> List[Dict]:
        """扫描视频文件夹，返回所有视频文件"""
        video_files = []
        folder_path = VIDEOS_DIR / folder_name
        if folder_path.exists():
            for ext in ('.mp4', '.avi', '.mkv', '.mov', '.webm'):
                for file in folder_path.glob(f'*{ext}'):
                    video_files.append({
                        'name': file.stem,
                        'file_path': str(file),
                        'folder': folder_name,
                        'size': file.stat().st_size
                    })
        return video_files

    @staticmethod
    def get_all_video_files() -> List[Dict]:
        """扫描所有视频文件夹，返回所有视频文件"""
        all_videos = []
        for folder_info in VideoFolderManager.get_all():
            folder_name = folder_info['name']
            videos = VideoManager.scan_folder(folder_name)
            for v in videos:
                v['folder_icon'] = folder_info.get('cover_icon', '📁')
            all_videos.extend(videos)
        return all_videos


# ============ 初始化 ============

if __name__ == "__main__":
    init_database()
    print("[数据库] 初始化测试完成")
