"""
Prompt 数据模型 - 管理随机 Prompt 和优质 Prompt
"""
import uuid
from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PromptType(Enum):
    """Prompt 类型"""
    RANDOM = "random"           # 随机 Prompt - 生命力
    INTERNAL = "internal"       # 内部 Prompt - 核心资产


class PromptStatus(Enum):
    """Prompt 状态"""
    ACTIVE = "active"           # 活跃中
    ARCHIVED = "archived"        # 已归档
    TESTING = "testing"          # 测试中


@dataclass
class SunoPrompt:
    """Suno Prompt 数据结构"""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    prompt_type: str = PromptType.RANDOM.value  # random 或 internal
    status: str = PromptStatus.ACTIVE.value      # active, archived, testing

    # Prompt 内容
    mood: str = ""                       # 情绪标签
    style: str = ""                      # 曲风标签
    content: str = ""                    # 完整 Prompt 内容

    # 元数据
    tags: List[str] = field(default_factory=list)    # 自定义标签
    source: str = ""                     # 来源描述

    # 统计
    usage_count: int = 0                 # 使用次数
    like_count: int = 0                  # 点赞数
    test_count: int = 0                  # 测试次数

    # 关联
    character_id: str = ""                # 关联人物 ID
    generation_id: str = ""               # 关联生成记录 ID

    # 时间
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    liked_at: str = ""                   # 点赞时间

    def to_dict(self) -> dict:
        """转换为字典"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'SunoPrompt':
        """从字典创建实例"""
        return cls(**data)

    def mark_liked(self):
        """标记为点赞"""
        self.like_count += 1
        self.liked_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()

        # 点赞后转为内部 Prompt
        if self.prompt_type == PromptType.RANDOM.value:
            self.prompt_type = PromptType.INTERNAL.value
            self.status = PromptStatus.ACTIVE.value

    def increment_usage(self):
        """增加使用次数"""
        self.usage_count += 1
        self.updated_at = datetime.now().isoformat()

    def increment_test(self):
        """增加测试次数"""
        self.test_count += 1
        self.updated_at = datetime.now().isoformat()

    def archive(self):
        """归档"""
        self.status = PromptStatus.ARCHIVED.value
        self.updated_at = datetime.now().isoformat()

    def activate(self):
        """激活"""
        self.status = PromptStatus.ACTIVE.value
        self.updated_at = datetime.now().isoformat()


# 曲风预设库
STYLE_PRESETS = [
    # 主流风格
    "Pop", "Rock", "Hip-Hop", "R&B", "Country", "Electronic", "Jazz", "Classical",
    "Indie", "Alternative", "Folk", "Metal", "Punk", "Blues", "Reggae", "Soul",

    # 中文/华语风格
    "华语流行", "国风", "古风", "民谣", "摇滚", "说唱", "R&B", "独立音乐",
    "慢摇滚", "后摇", "英伦摇滚", "朋克", "氛围音乐", "后朋克",

    # 细分风格
    "Lo-fi", "Dream Pop", "Synthwave", "Ambient", "Post-Rock", "Shoegaze",
    "Chamber Pop", "Baroque Pop", "City Pop", "Vaporwave", "Hyperpop",
    "Phonk", "Drill", "Trap", "Boom Bap", "Mumble Rap",

    # 融合风格
    "Indie Folk", "Electronic Pop", "Synth Pop", "Art Pop", "Dark Pop",
    "Bedroom Pop", "Alt-Country", "Southern Rock", "Glam Rock",

    # 情绪风格
    "Chill", "Melancholic", "Euphoric", "Nostalgic", "Dark", "Bright",
    "Dreamy", "Uplifting", "Melancholic Pop", "Sad Boy", "Sad Girl",

    # 器乐风格
    "Acoustic", "Piano Ballad", "Guitar Driven", "Strings", "Orchestral",
    "A cappella", "Beat-driven", "Sample-based",
]


# 情绪预设库
MOOD_PRESETS = [
    # 正面情绪
    "Joy", "Happiness", "Excitement", "Love", "Romance", "Passion",
    "Euphoria", "Peace", "Calm", "Contentment", "Gratitude", "Hope",
    "狂喜", "喜悦", "幸福", "满足", "平静", "甜蜜", "浪漫",

    # 中性/复杂情绪
    "Nostalgia", "Longing", "Bittersweet", "Melancholy", "Wistful",
    "Reflective", "Contemplative", "Ambivalent", "Tender", "Yearning",
    "怀念", "思念", "释然", "淡然", "倔强", "倔强而温暖",

    # 负面情绪
    "Sadness", "Grief", "Anger", "Frustration", "Anxiety", "Fear",
    "Loneliness", "Despair", "Heartbreak", "Regret", "Bitterness",
    "悲伤", "忧郁", "绝望", "愤怒", "孤独", "焦虑",

    # 特殊情绪
    "Rebellious", "Empowering", "Defiant", "Mysterious", "Enigmatic",
    "叛逆", "倔强", "释怀", "释然", "期待", "好奇",
]


# Prompt 模板库
PROMPT_TEMPLATES = [
    # 情绪驱动型
    "[mood], [style] song with [mood_desc]",
    "A [style] track about [mood]. [emotion_intensity]. [tempo_hint]",

    # 场景驱动型
    "[scene], [style] atmosphere, [mood]",
    "[place] at night, [style] vibes, feeling [mood]",

    # 意象驱动型
    "[imagery], [style] textures, [mood] mood",
    "[natural_element] and [urban_element], [style] fusion, [mood]",

    # 故事驱动型
    "[character_type] in [setting], [mood], [style] narrative",
    "A story about [theme], [mood] emotions, [style] production",

    # 中文曲风型
    "[mood_cn]的情绪,[style_cn]风格,中文歌词",
    "[emotion],华语[style_cn],中文流行",

    # 混合型
    "[mood], [style] with [secondary_style] influences, [unique_element]",
    "Inspired by [reference], [style], feeling [mood]",
]


# 歌词风格描述
LYRICS_STYLES = [
    "POV: 视角歌词，讲述个人故事",
    "Metaphorical: 大量使用隐喻和象征",
    "Narrative: 叙事性强，有完整故事线",
    "Lyrical: 诗意化，表达抽象情感",
    "Direct: 直白表达，情感强烈",
    "Intimate: 私密感，像在耳边低语",
    "Cinematic: 电影感，画面感强",
    "Conversational: 对话式，像在倾诉",
]


# 参考艺术家/风格标签
REFERENCE_TAGS = [
    "Taylor Swift", "The Weeknd", "Billie Eilish", "Lana Del Rey",
    "王菲", "周杰伦", "林俊杰", "陈奕迅",
    "Radiohead", "Cigarettes After Sex", "Bon Iver", "Phoebe Bridgers",
    "Beach House", "Mazzy Star", "Cocteau Twins", "Slowdive",
]
