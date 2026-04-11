"""
Prompt 存储模块 - 管理 Prompt 的持久化
"""
import json
import os
from typing import List, Optional
from pathlib import Path
from prompt import SunoPrompt, PromptType, PromptStatus


class PromptStorage:
    """Prompt 存储管理器"""

    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.prompts_file = self.data_dir / "prompts.json"
        self._prompts: List[SunoPrompt] = []
        self._load()

    def _load(self):
        """加载数据"""
        if self.prompts_file.exists():
            try:
                with open(self.prompts_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._prompts = [SunoPrompt.from_dict(p) for p in data]
            except Exception:
                self._prompts = []
        else:
            self._prompts = []

    def _save(self):
        """保存数据"""
        with open(self.prompts_file, 'w', encoding='utf-8') as f:
            data = [p.to_dict() for p in self._prompts]
            json.dump(data, f, ensure_ascii=False, indent=2)

    def add_prompt(self, prompt: SunoPrompt) -> SunoPrompt:
        """添加 Prompt"""
        self._prompts.append(prompt)
        self._save()
        return prompt

    def update_prompt(self, prompt: SunoPrompt):
        """更新 Prompt"""
        for i, p in enumerate(self._prompts):
            if p.id == prompt.id:
                self._prompts[i] = prompt
                self._save()
                return
        raise ValueError(f"Prompt {prompt.id} not found")

    def delete_prompt(self, prompt_id: str):
        """删除 Prompt"""
        self._prompts = [p for p in self._prompts if p.id != prompt_id]
        self._save()

    def get_prompt(self, prompt_id: str) -> Optional[SunoPrompt]:
        """获取单个 Prompt"""
        for p in self._prompts:
            if p.id == prompt_id:
                return p
        return None

    def get_all_prompts(self) -> List[SunoPrompt]:
        """获取所有 Prompt"""
        return self._prompts.copy()

    def get_prompts_by_type(self, prompt_type: PromptType) -> List[SunoPrompt]:
        """按类型获取 Prompt"""
        return [p for p in self._prompts if p.prompt_type == prompt_type.value]

    def get_random_prompts(self, count: int = 5) -> List[SunoPrompt]:
        """获取随机 Prompt（用于生成）"""
        import random
        active_random = [p for p in self._prompts
                        if p.prompt_type == PromptType.RANDOM.value
                        and p.status == PromptStatus.ACTIVE.value]
        if len(active_random) <= count:
            return active_random
        return random.sample(active_random, count)

    def get_internal_prompts(self) -> List[SunoPrompt]:
        """获取内部 Prompt（优质资产）"""
        return [p for p in self._prompts
                if p.prompt_type == PromptType.INTERNAL.value
                and p.status == PromptStatus.ACTIVE.value]

    def get_top_liked(self, count: int = 10) -> List[SunoPrompt]:
        """获取点赞最多的 Prompt"""
        return sorted(self._prompts,
                     key=lambda p: p.like_count,
                     reverse=True)[:count]

    def get_recent(self, count: int = 20) -> List[SunoPrompt]:
        """获取最近的 Prompt"""
        return sorted(self._prompts,
                     key=lambda p: p.created_at,
                     reverse=True)[:count]

    def mark_liked(self, prompt_id: str) -> Optional[SunoPrompt]:
        """标记点赞（核心操作：将随机转为内部）"""
        prompt = self.get_prompt(prompt_id)
        if prompt:
            prompt.mark_liked()
            self.update_prompt(prompt)
        return prompt

    def increment_usage(self, prompt_id: str):
        """增加使用次数"""
        prompt = self.get_prompt(prompt_id)
        if prompt:
            prompt.increment_usage()
            self.update_prompt(prompt)

    def increment_test(self, prompt_id: str):
        """增加测试次数"""
        prompt = self.get_prompt(prompt_id)
        if prompt:
            prompt.increment_test()
            self.update_prompt(prompt)

    def get_stats(self) -> dict:
        """获取统计数据"""
        total = len(self._prompts)
        random_count = len(self.get_prompts_by_type(PromptType.RANDOM))
        internal_count = len(self.get_prompts_by_type(PromptType.INTERNAL))
        total_likes = sum(p.like_count for p in self._prompts)
        total_usage = sum(p.usage_count for p in self._prompts)
        total_tests = sum(p.test_count for p in self._prompts)

        return {
            "total": total,
            "random": random_count,
            "internal": internal_count,
            "total_likes": total_likes,
            "total_usage": total_usage,
            "total_tests": total_tests,
            "conversion_rate": round(internal_count / total * 100, 1) if total > 0 else 0
        }

    def search(self, keyword: str) -> List[SunoPrompt]:
        """搜索 Prompt"""
        keyword = keyword.lower()
        results = []
        for p in self._prompts:
            if (keyword in p.content.lower() or
                keyword in p.mood.lower() or
                keyword in p.style.lower() or
                any(keyword in tag.lower() for tag in p.tags)):
                results.append(p)
        return results


# 全局实例
_storage: Optional[PromptStorage] = None


def get_prompt_storage() -> PromptStorage:
    """获取全局存储实例"""
    global _storage
    if _storage is None:
        _storage = PromptStorage()
    return _storage
