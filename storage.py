"""
存储模块 - 管理人物和历史数据的持久化
"""
import json
import os
from typing import List, Optional
from pathlib import Path
from character import Character


class Storage:
    """数据存储管理器"""

    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.characters_file = self.data_dir / "characters.json"
        self.history_file = self.data_dir / "history.json"
        self._characters: List[Character] = []
        self._history: List[dict] = []
        self._load()

    def _load(self):
        """加载数据"""
        # 加载人物
        if self.characters_file.exists():
            try:
                with open(self.characters_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._characters = [Character.from_dict(c) for c in data]
            except Exception:
                self._characters = []
        else:
            self._characters = []

        # 加载历史
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self._history = json.load(f)
            except Exception:
                self._history = []
        else:
            self._history = []

    def _save_characters(self):
        """保存人物数据"""
        with open(self.characters_file, 'w', encoding='utf-8') as f:
            data = [c.to_dict() for c in self._characters]
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _save_history(self):
        """保存历史数据"""
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self._history, f, ensure_ascii=False, indent=2)

    # ============ 人物管理 ============

    def load_characters(self) -> List[Character]:
        """加载所有人物"""
        return self._characters.copy()

    def add_character(self, character: Character):
        """添加人物"""
        self._characters.append(character)
        self._save_characters()

    def update_character(self, character: Character):
        """更新人物"""
        for i, c in enumerate(self._characters):
            if c.id == character.id:
                self._characters[i] = character
                self._save_characters()
                return
        raise ValueError(f"Character {character.id} not found")

    def delete_character(self, character_id: str):
        """删除人物"""
        self._characters = [c for c in self._characters if c.id != character_id]
        self._save_characters()

    def get_character(self, character_id: str) -> Optional[Character]:
        """获取单个人物"""
        for c in self._characters:
            if c.id == character_id:
                return c
        return None

    # ============ 历史管理 ============

    def load_history(self) -> List[dict]:
        """加载历史记录"""
        return self._history.copy()

    def add_history(self,
                   character_id: str,
                   character_name: str,
                   mood: str,
                   o3ics: str,
                   params: dict = None):
        """添加历史记录"""
        entry = {
            "id": f"{character_id}_{len(self._history)}",
            "character_id": character_id,
            "character_name": character_name,
            "mood": mood,
            "o3ics": o3ics,
            "params": params or {},
            "created_at": self._get_timestamp()
        }
        self._history.append(entry)
        # 只保留最近 500 条
        if len(self._history) > 500:
            self._history = self._history[-500:]
        self._save_history()

    def clear_history(self):
        """清空历史"""
        self._history = []
        self._save_history()

    def get_history_by_character(self, character_id: str) -> List[dict]:
        """获取指定人物的历史"""
        return [h for h in self._history if h.get("character_id") == character_id]

    @staticmethod
    def _get_timestamp() -> str:
        """获取当前时间戳"""
        from datetime import datetime
        return datetime.now().isoformat()


# 全局实例
_storage: Optional[Storage] = None


def get_storage() -> Storage:
    """获取全局存储实例"""
    global _storage
    if _storage is None:
        _storage = Storage()
    return _storage
