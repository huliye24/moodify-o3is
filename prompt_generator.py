"""
Prompt 生成器 - 生成 Suno Prompt
"""
import random
from typing import List, Optional
from prompt import (
    SunoPrompt, PromptType, PromptStatus,
    STYLE_PRESETS, MOOD_PRESETS, PROMPT_TEMPLATES, LYRICS_STYLES, REFERENCE_TAGS
)


class PromptGenerator:
    """Suno Prompt 生成器"""

    def __init__(self):
        self.styles = STYLE_PRESETS
        self.moods = MOOD_PRESETS
        self.templates = PROMPT_TEMPLATES

    def generate_single(self,
                       mood: Optional[str] = None,
                       style: Optional[str] = None,
                       custom_content: Optional[str] = None) -> SunoPrompt:
        """
        生成单个随机 Prompt

        Args:
            mood: 指定情绪（可选）
            style: 指定曲风（可选）
            custom_content: 自定义内容（可选）

        Returns:
            SunoPrompt 对象
        """
        # 随机选择情绪和曲风
        selected_mood = mood or random.choice(self.moods)
        selected_style = style or random.choice(self.styles)

        # 构建 Prompt 内容
        if custom_content:
            content = custom_content
        else:
            template = random.choice(self.templates)
            content = self._fill_template(template, selected_mood, selected_style)

        # 添加参考标签
        reference = random.choice(REFERENCE_TAGS) if random.random() > 0.5 else ""
        if reference:
            content += f", {reference} style"

        # 添加歌词风格
        lyrics_style = random.choice(LYRICS_STYLES) if random.random() > 0.3 else ""
        if lyrics_style:
            content += f", {lyrics_style}"

        prompt = SunoPrompt(
            prompt_type=PromptType.RANDOM.value,
            status=PromptStatus.ACTIVE.value,
            mood=selected_mood,
            style=selected_style,
            content=content,
            tags=self._generate_tags(selected_mood, selected_style),
        )

        return prompt

    def generate_batch(self, count: int = 5,
                      mood: Optional[str] = None,
                      style: Optional[str] = None) -> List[SunoPrompt]:
        """
        批量生成 Prompt（每次生成5组）

        Args:
            count: 生成数量，默认5
            mood: 指定情绪（可选）
            style: 指定曲风（可选）

        Returns:
            SunoPrompt 列表
        """
        prompts = []
        for _ in range(count):
            prompt = self.generate_single(mood=mood, style=style)
            prompts.append(prompt)
        return prompts

    def _fill_template(self, template: str, mood: str, style: str) -> str:
        """填充模板"""
        # 中文情绪词
        mood_cn = [m for m in self.moods if any('\u4e00' <= c <= '\u9fff' for c in m)]
        mood_en = [m for m in self.moods if not any('\u4e00' <= c <= '\u9fff' for c in m)]

        # 中文曲风
        style_cn = [s for s in self.styles if any('\u4e00' <= c <= '\u9fff' for c in s)]
        style_en = [s for s in self.styles if not any('\u4e00' <= c <= '\u9fff' for c in s)]

        replacements = {
            '[mood]': mood,
            '[style]': style,
            '[mood_desc]': random.choice(['deeply emotional', 'soulful', 'raw', 'tender', 'intense']),
            '[tempo_hint]': random.choice(['upbeat', 'slow', 'mid-tempo', 'driving beat']),
            '[scene]': random.choice(['rainy window', 'empty streets', 'sunset boulevard', 'midnight cafe', 'train station']),
            '[place]': random.choice(['city', 'beach', 'forest', 'rooftop', 'bedroom']),
            '[imagery]': random.choice(['neon lights', 'autumn leaves', 'ocean waves', 'mountain peaks', 'city lights']),
            '[natural_element]': random.choice(['rain', 'moon', 'wind', 'stars', 'ocean']),
            '[urban_element]': random.choice(['street lights', 'subways', 'buildings', 'cars', 'billboards']),
            '[unique_element]': random.choice(['vintage synths', 'live drums', 'acoustic guitar', 'string arrangements', 'electronic beats']),
            '[mood_cn]': random.choice(mood_cn) if mood_cn else mood,
            '[style_cn]': random.choice(style_cn) if style_cn else style,
            '[theme]': random.choice(['love', 'loss', 'hope', 'regret', 'freedom', 'identity', 'time', 'memory']),
            '[character_type]': random.choice(['wanderer', 'lover', 'dreamer', 'outcast', 'survivor', 'storyteller']),
            '[setting]': random.choice(['small town', 'big city', 'countryside', 'dystopian future', 'golden era']),
            '[reference]': random.choice(REFERENCE_TAGS),
            '[secondary_style]': random.choice([s for s in self.styles if s != style] or self.styles),
            '[emotion]': random.choice(mood_en) if mood_en else mood,
            '[emotion_intensity]': random.choice(['intense', 'subtle', 'overwhelming', 'quiet', 'building']),
        }

        result = template
        for key, value in replacements.items():
            result = result.replace(key, value)

        return result

    def _generate_tags(self, mood: str, style: str) -> List[str]:
        """生成标签"""
        tags = [mood, style]

        # 添加相关标签
        if any('\u4e00' <= c <= '\u9fff' for c in mood):
            tags.append("中文")
        else:
            tags.append("English")

        # 情绪相关标签
        positive_moods = ["Joy", "Happiness", "Love", "Euphoria", "狂喜", "喜悦", "幸福", "甜蜜"]
        negative_moods = ["Sadness", "Grief", "Anger", "Loneliness", "悲伤", "忧郁", "绝望", "愤怒", "孤独"]

        if mood in positive_moods or any(m in mood for m in positive_moods):
            tags.append("正面情绪")
        elif mood in negative_moods or any(m in mood for m in negative_moods):
            tags.append("负面情绪")
        else:
            tags.append("中性情绪")

        return list(set(tags))

    def create_internal_prompt(self,
                              content: str,
                              mood: str,
                              style: str,
                              tags: Optional[List[str]] = None,
                              source: str = "manual") -> SunoPrompt:
        """
        创建内部优质 Prompt

        Args:
            content: Prompt 内容
            mood: 情绪标签
            style: 曲风标签
            tags: 自定义标签
            source: 来源描述

        Returns:
            SunoPrompt 对象（内部类型）
        """
        prompt = SunoPrompt(
            prompt_type=PromptType.INTERNAL.value,
            status=PromptStatus.ACTIVE.value,
            mood=mood,
            style=style,
            content=content,
            tags=tags or self._generate_tags(mood, style),
            source=source,
        )
        return prompt


# 全局实例
_generator: Optional[PromptGenerator] = None


def get_prompt_generator() -> PromptGenerator:
    """获取全局生成器实例"""
    global _generator
    if _generator is None:
        _generator = PromptGenerator()
    return _generator
