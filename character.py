"""
虚拟人物模块 - 管理虚拟人物的创建、编辑和属性
"""
import uuid
from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime


# 预设情绪列表
PRESET_MOODS = [
    "喜悦", "狂喜", "平静", "满足",
    "淡淡的忧伤", "悲伤", "忧郁", "绝望",
    "愤怒", "烦躁", "焦虑", "恐惧",
    "惊讶", "好奇", "期待", "怀念",
    "浪漫", "甜蜜", "思念", "孤独",
    "释然", "淡然", "倔强", "倔强而温暖",
]

# 预设音乐风格
PRESET_MUSIC_STYLES = [
    "民谣", "慢摇滚", "流行", "电子",
    "古典", "爵士", "蓝调", "嘻哈",
    "独立音乐", "后摇", "氛围音乐", "R&B",
]

# 预设性格类型
PRESET_PERSONALITY_TYPES = [
    "内向敏感", "开朗乐观", "深沉内敛", "叛逆不羁",
    "温柔细腻", "热情奔放", "忧郁文艺", "理性冷静",
]

# 创意偏好设置
CREATIVE_PREFERENCES = [
    "求稳",        # 低随机性，生成保守稳定
    "适中",        # 中等随机性，有变化但不极端
    "爱折腾",      # 高随机性，每次都像摇色子
]


@dataclass
class MoodEntry:
    """情绪记录条目"""
    mood: str
    timestamp: str
    note: str = ""


@dataclass
class GenerationEntry:
    """生成记录条目"""
    o3ics: str
    timestamp: str
    mood: str
    structure: str = ""


@dataclass
class Character:
    """虚拟人物数据类"""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = ""
    age: int = 25
    personality: str = "内向敏感"
    background: str = ""
    music_style: str = "民谣"
    o3ic_style: str = ""  # 自定义的歌词风格描述
    current_mood: str = "平静"
    creative_preference: str = "适中"  # 创意偏好：求稳/适中/爱折腾
    mood_history: List[MoodEntry] = field(default_factory=list)
    generation_history: List[GenerationEntry] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        """转换为字典"""
        data = asdict(self)
        data['mood_history'] = [asdict(m) for m in self.mood_history]
        data['generation_history'] = [asdict(g) for g in self.generation_history]
        return data

    @classmethod
    def from_dict(cls, data: dict) -> 'Character':
        """从字典创建实例"""
        if 'mood_history' in data:
            data['mood_history'] = [
                MoodEntry(**m) for m in data['mood_history']
            ]
        if 'generation_history' in data:
            data['generation_history'] = [
                GenerationEntry(**g) for g in data['generation_history']
            ]
        return cls(**data)

    def add_mood_entry(self, mood: str, note: str = ""):
        """添加情绪记录"""
        entry = MoodEntry(
            mood=mood,
            timestamp=datetime.now().isoformat(),
            note=note
        )
        self.mood_history.append(entry)
        self.current_mood = mood

    def add_generation(self, o3ics: str, mood: str = "", structure: str = ""):
        """添加歌词生成记录"""
        entry = GenerationEntry(
            o3ics=o3ics,
            timestamp=datetime.now().isoformat(),
            mood=mood or self.current_mood,
            structure=structure
        )
        self.generation_history.append(entry)
        if len(self.generation_history) > 20:
            self.generation_history = self.generation_history[-20:]

    def get_recent_o3ics(self, count: int = 5) -> List[str]:
        """获取最近生成的歌词"""
        recent = self.generation_history[-count:]
        return [entry.o3ics for entry in recent]

    def get_system_prompt(self) -> str:
        """生成用于 AI 的系统提示词"""
        prompt = f"""你是一位名叫"{self.name}"的虚拟歌手，{self.age}岁。
性格特点：{self.personality}。
背景故事：{self.background or '暂无详细背景故事。'}
音乐风格偏好：{self.music_style}。"""

        if self.o3ic_style:
            prompt += f"\n歌词风格：{self.o3ic_style}。"

        prompt += f"\n\n今天你感到 [{self.current_mood}]。"

        return prompt


def create_default_character() -> Character:
    """创建默认示例人物"""
    character = Character(
        name="艾莉",
        age=23,
        personality="内向敏感",
        background="一个在城市边缘游走的独立音乐人，喜欢在深夜独自创作。歌词总是充满画面感，喜欢使用自然意象。",
        music_style="民谣",
        o3ic_style="充满画面感，喜欢使用自然意象如月光、雨、火车、旧吉他。语言简洁但情感深沉。",
        current_mood="淡淡的忧伤，但带着一丝释然",
    )
    character.add_mood_entry("淡淡的忧伤，但带着一丝释然", "首次创建")
    return character


def create_character(
    name: str,
    age: int = 25,
    personality: str = "内向敏感",
    background: str = "",
    music_style: str = "民谣",
    o3ic_style: str = "",
    current_mood: str = "平静",
    creative_preference: str = "适中"
) -> Character:
    """便捷函数：创建新人物"""
    character = Character(
        name=name,
        age=age,
        personality=personality,
        background=background,
        music_style=music_style,
        o3ic_style=o3ic_style,
        current_mood=current_mood,
        creative_preference=creative_preference,
    )
    character.add_mood_entry(current_mood, "创建时设置")
    return character
