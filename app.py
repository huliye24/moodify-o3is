"""
Moodify - 虚拟人物情绪歌词生成器
Streamlit 主界面
"""
import streamlit as st
import os
import sys
import importlib
from pathlib import Path
from typing import Optional

# 强制重新加载模块以避免缓存问题
for mod_name in list(sys.modules.keys()):
    if mod_name in ('character', 'storage', 'o3ics_generator', 'prompt', 'prompt_storage', 'prompt_generator'):
        del sys.modules[mod_name]

from character import (
    Character, PRESET_MOODS, PRESET_MUSIC_STYLES,
    PRESET_PERSONALITY_TYPES, CREATIVE_PREFERENCES, create_character
)
from storage import get_storage
from o3ics_generator import get_generator, reset_generator
from prompt_storage import get_prompt_storage
from prompt_generator import get_prompt_generator
from prompt import SunoPrompt, PromptType, PromptStatus


# 页面配置
st.set_page_config(
    page_title="Moodify - 情绪歌词生成器",
    page_icon="🎵",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============ 初始化 ============
from pathlib import Path

# 获取 logo 路径
LOGO_PATH = Path(__file__).parent / "logo.png"

def init_session_state():
    """初始化会话状态"""
    if 'current_character' not in st.session_state:
        st.session_state.current_character = None
    if 'generated_o3ics' not in st.session_state:
        st.session_state.generated_o3ics = ""
    if 'edited_o3ics' not in st.session_state:
        st.session_state.edited_o3ics = ""
    if 'show_history' not in st.session_state:
        st.session_state.show_history = False
    if 'generated_prompts' not in st.session_state:
        st.session_state.generated_prompts = []
    if 'dice_result' not in st.session_state:
        st.session_state.dice_result = None
    if 'seed_hint' not in st.session_state:
        st.session_state.seed_hint = ""


init_session_state()


# ============ 侧边栏：人物管理 ============

def render_sidebar():
    """渲染侧边栏"""
    # 侧边栏 Logo
    if LOGO_PATH.exists():
        st.sidebar.image(str(LOGO_PATH), width=100)
    st.sidebar.title("🎭 虚拟人物管理")
    st.sidebar.markdown("---")

    storage = get_storage()
    characters = storage.load_characters()

    # 人物选择
    character_names = ["[新建人物]"] + [c.name for c in characters]
    selected_name = st.sidebar.selectbox(
        "选择人物",
        character_names,
        index=0
    )

    # 新建人物表单
    if selected_name == "[新建人物]" or not characters:
        render_new_character_form(storage)
    else:
        # 选中已有人物
        selected_char = next((c for c in characters if c.name == selected_name), None)
        if selected_char:
            st.session_state.current_character = selected_char
            render_character_detail(selected_char, storage)


def render_new_character_form(storage):
    """新建人物表单"""
    st.sidebar.subheader("➕ 创建新人物")

    with st.form("new_character_form"):
        name = st.text_input("姓名", placeholder="例如：艾莉")
        age = st.number_input("年龄", min_value=1, max_value=100, value=25)
        personality = st.selectbox("性格", PRESET_PERSONALITY_TYPES)
        music_style = st.selectbox("音乐风格", PRESET_MUSIC_STYLES)
        background = st.text_area(
            "背景故事",
            placeholder="描述这个人物的背景故事...",
            height=100
        )
        o3ic_style = st.text_area(
            "歌词风格描述",
            placeholder="描述这个人物的歌词风格特点...",
            height=80
        )
        creative_preference = st.selectbox(
            "🎲 创意偏好",
            CREATIVE_PREFERENCES,
            index=CREATIVE_PREFERENCES.index(character.creative_preference)
            if 'current_character' in st.session_state and st.session_state.current_character
               and st.session_state.current_character.creative_preference in CREATIVE_PREFERENCES
            else 1,
            help="决定每次生成歌词时的随机程度。「爱折腾」会让每次生成更像摇色子，变化最大"
        )

        submitted = st.form_submit_button("创建人物", use_container_width=True)

        if submitted and name:
            new_char = create_character(
                name=name,
                age=age,
                personality=personality,
                background=background,
                music_style=music_style,
                o3ic_style=o3ic_style,
                creative_preference=creative_preference,
            )
            storage.add_character(new_char)
            st.session_state.current_character = new_char
            st.success(f"人物 '{name}' 创建成功！")
            st.rerun()
        elif submitted and not name:
            st.error("请输入人物姓名")


def render_character_detail(character: Character, storage):
    """显示人物详情"""
    st.sidebar.subheader(f"👤 {character.name}")

    # 情绪设置
    new_mood = st.sidebar.selectbox(
        "当前情绪",
        PRESET_MOODS,
        index=PRESET_MOODS.index(character.current_mood)
        if character.current_mood in PRESET_MOODS else 0,
        key=f"mood_{character.id}"
    )

    if new_mood != character.current_mood:
        character.current_mood = new_mood
        character.add_mood_entry(new_mood, "在界面修改")
        storage.update_character(character)

    # 删除人物按钮
    with st.sidebar.expander("⚠️ 危险操作"):
        if st.button("删除此人物", type="secondary", use_container_width=True):
            storage.delete_character(character.id)
            st.session_state.current_character = None
            st.success("人物已删除")
            st.rerun()

    # 显示人物信息
    st.sidebar.markdown("**基本信息**")
    st.sidebar.write(f"- 年龄: {character.age}")
    st.sidebar.write(f"- 性格: {character.personality}")
    st.sidebar.write(f"- 音乐风格: {character.music_style}")
    st.sidebar.write(f"- 创意偏好: **{character.creative_preference}**")
    creative_prefs = CREATIVE_PREFERENCES
    new_pref = st.sidebar.selectbox(
        "🎲 创意偏好",
        creative_prefs,
        index=creative_prefs.index(character.creative_preference)
               if character.creative_preference in creative_prefs else 1,
        key=f"pref_{character.id}"
    )
    if new_pref != character.creative_preference:
        character.creative_preference = new_pref
        storage.update_character(character)

    if character.background:
        st.sidebar.markdown("**背景故事**")
        st.sidebar.write(character.background[:100] + "..." if len(character.background) > 100 else character.background)

    # 情绪历史
    if character.mood_history:
        with st.sidebar.expander("📜 情绪历史"):
            for entry in reversed(character.mood_history[-5:]):
                from datetime import datetime
                dt = datetime.fromisoformat(entry.timestamp)
                st.write(f"• {entry.mood} ({dt.strftime('%m/%d %H:%M')})")

    # 生成统计
    if character.generation_history:
        with st.sidebar.expander("📊 创作统计"):
            total = len(character.generation_history)
            st.write(f"已创作 **{total}** 首歌曲")
            recent_moods = {}
            for entry in character.generation_history[-10:]:
                mood = entry.mood
                recent_moods[mood] = recent_moods.get(mood, 0) + 1
            if recent_moods:
                st.write("最近情绪分布：")
                for mood, count in sorted(recent_moods.items(), key=lambda x: -x[1])[:3]:
                    st.write(f"  • {mood}: {count}次")


# ============ 主界面：歌词生成 ============

def render_main():
    """渲染主界面"""
    # 显示 Logo
    if LOGO_PATH.exists():
        st.image(str(LOGO_PATH), width=120)

    st.title("🎵 Moodify - 虚拟人物情绪歌词生成器")
    st.markdown("---")

    # API 配置检查
    generator = get_generator()
    if not generator.is_configured():
        render_api_warning()
        return

    # 检查是否选择了人物
    character = st.session_state.get('current_character')
    if not character:
        render_no_character_state()
        return

    # 显示当前人物和情绪
    col1, col2 = st.columns([2, 1])
    with col1:
        st.subheader(f"📝 {character.name} 的歌词创作")
    with col2:
        st.info(f"当前情绪: **{character.current_mood}**")

    st.markdown("")

    # 生成参数
    with st.expander("⚙️ 高级选项", expanded=False):
        col1, col2, col3 = st.columns(3)
        with col1:
            structure = st.selectbox(
                "歌词结构",
                ["verse-chorus", "simple", "full", "free"],
                format_func=lambda x: {
                    "verse-chorus": "主歌+副歌+桥段",
                    "simple": "简单结构",
                    "full": "完整结构",
                    "free": "自由形式"
                }[x]
            )
        with col2:
            length = st.selectbox(
                "长度",
                ["short", "medium", "long"],
                format_func=lambda x: {"short": "短", "medium": "中", "long": "长"}[x]
            )
        with col3:
            rhyme = st.selectbox(
                "韵脚风格",
                ["押大致相近的韵", "自由押韵", "无韵脚", "AABB", "ABAB"],
            )

        custom_req = st.text_input(
            "自定义要求（可选）",
            placeholder="例如：加入钢琴伴奏暗示、使用英文词汇..."
        )

        # 随机性控制
        col_t1, col_t2 = st.columns([3, 1])
        with col_t1:
            temperature = st.slider(
                "🎲 随机程度",
                min_value=0.5,
                max_value=1.2,
                value=0.95,
                step=0.05,
                help="越高越随机（建议0.8-1.0）。值越低越保守，容易产生相似结果。"
            )
        with col_t2:
            st.write("")
            st.write(f"当前: `{temperature}`")

    st.markdown("")

    # 生成按钮
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("🎤 生成歌词", use_container_width=True, type="primary"):
            generate_o3ics(character, structure, length, rhyme, custom_req, temperature)

    # 显示生成的歌词
    if st.session_state.generated_o3ics:
        render_o3ics_editor()


def render_api_warning():
    """API 未配置警告"""
    st.warning("⚠️ DeepSeek API 未配置")

    st.markdown("""
    请按以下步骤配置 API Key：

    1. 复制 `.env.example` 为 `.env`：
       ```bash
       copy .env.example .env
       ```

    2. 编辑 `.env` 文件，填入你的 DeepSeek API Key：
       ```
       DEEPSEEK_API_KEY=your_actual_api_key
       ```

    3. 重启应用

    💡 获取 API Key: [platform.deepseek.com](https://platform.deepseek.com)
    """)


def render_no_character_state():
    """未选择人物状态"""
    st.info("👈 请先在左侧创建或选择一个虚拟人物")
    st.markdown("""
    **快速开始：**
    1. 在左侧输入人物信息并点击「创建人物」
    2. 设置人物的当前情绪
    3. 点击「生成歌词」按钮
    """)


def generate_o3ics(character, structure, length, rhyme, custom_req, temperature=0.95):
    """生成歌词"""
    generator = get_generator()
    storage = get_storage()

    try:
        # 根据人物的创意偏好调整参数
        pref = getattr(character, 'creative_preference', '适中')
        pref_temperature_map = {
            "求稳": 0.7,
            "适中": 0.95,
            "爱折腾": 1.2,
        }
        pref_top_p_map = {
            "求稳": 0.7,
            "适中": 0.85,
            "爱折腾": 0.95,
        }
        final_temperature = temperature
        final_top_p = pref_top_p_map.get(pref, 0.85)
        if pref != "适中":
            # 人物偏好覆盖 slider 设置，但用户仍可在高级选项里微调
            final_temperature = pref_temperature_map.get(pref, 0.95)

        # 获取最近生成的歌词（用于避免重复）
        recent_o3ics = character.get_recent_o3ics(count=5)

        # 提前掷色子，展示创意参数
        dice = generator._roll_dice_for_creative_variation()
        seed_hint = generator._generate_random_seed(character)

        with st.spinner("🎲 摇色子中..."):
            o3ics = generator.generate(
                character=character,
                structure=structure,
                length=length,
                rhyme_hint=rhyme,
                custom_requirements=custom_req,
                recent_o3ics=recent_o3ics,
                temperature=final_temperature,
                top_p=final_top_p
            )

        st.session_state.generated_o3ics = o3ics
        st.session_state.edited_o3ics = o3ics
        st.session_state.dice_result = dice
        st.session_state.seed_hint = seed_hint

        # 保存到人物的生成历史（用于后续上下文）
        character.add_generation(
            o3ics=o3ics,
            mood=character.current_mood,
            structure=structure
        )
        storage.update_character(character)

        # 保存到全局历史
        storage.add_history(
            character_id=character.id,
            character_name=character.name,
            mood=character.current_mood,
            o3ics=o3ics,
            params={
                "structure": structure,
                "length": length,
                "rhyme": rhyme,
                "temperature": final_temperature,
                "creative_pref": pref,
            }
        )

        st.success("✨ 歌词生成成功！本次摇色子结果：")
        _render_dice_result(dice, seed_hint, pref)

    except Exception as e:
        st.error(f"生成失败: {str(e)}")


def _render_dice_result(dice: dict, seed_hint: str, pref: str):
    """展示摇色子产生的创意参数"""
    emoji_map = {
        "求稳": "🎯",
        "适中": "🎲",
        "爱折腾": "🔥",
    }
    pref_emoji = emoji_map.get(pref, "🎲")

    cols = st.columns(4)
    with cols[0]:
        st.markdown(f"{pref_emoji} 创意偏好: **{pref}**")
    with cols[1]:
        st.markdown(f"📝 结尾: *{dice['closing_style']}*")
    with cols[2]:
        st.markdown(f"🔄 转折: *{dice['turning_point']}*")
    with cols[3]:
        st.markdown(f"👁️ 视角: *{dice['perspective']}*")

    cols2 = st.columns(4)
    with cols2[0]:
        st.markdown(f"✍️ 修辞: *{dice['rhetoric']}*")
    with cols2[1]:
        st.markdown(f"📏 句长: *{dice['line_length_variation']}*")
    with cols2[2]:
        st.markdown(f"🎯 意象数: *{dice['imagery_count']}*")
    with cols2[3]:
        st.markdown(f"🌱 种子: *{seed_hint[:40]}...*" if len(seed_hint) > 40 else f"🌱 种子: *{seed_hint}*")

    st.divider()


def render_o3ics_editor():
    """歌词编辑器"""
    st.markdown("---")
    st.subheader("📝 生成的歌词")

    # 编辑框
    edited = st.text_area(
        "歌词内容（可手动编辑）",
        value=st.session_state.generated_o3ics,
        height=300,
        key="o3ics_editor"
    )
    st.session_state.edited_o3ics = edited

    # 操作按钮
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        if st.button("📋 复制到剪贴板", use_container_width=True):
            st.code(edited, language=None)
            st.session_state.clipboard_content = edited
            st.toast("歌词已复制！")

    with col2:
        if st.button("💾 保存为新版本", use_container_width=True):
            character = st.session_state.current_character
            if character:
                storage = get_storage()
                storage.add_history(
                    character_id=character.id,
                    character_name=character.name,
                    mood=character.current_mood,
                    o3ics=edited,
                    params={"manual_save": True}
                )
                st.success("已保存！")

    with col3:
        if st.button("🔄 重新生成", use_container_width=True):
            st.session_state.generated_o3ics = ""
            st.rerun()

    with col4:
        if st.button("🗑️ 清空", use_container_width=True):
            st.session_state.generated_o3ics = ""
            st.session_state.edited_o3ics = ""
            st.rerun()

    # 显示历史记录
    st.markdown("---")
    if st.button("📜 查看生成历史", use_container_width=False):
        st.session_state.show_history = not st.session_state.show_history

    if st.session_state.show_history:
        render_history()


def render_history():
    """显示生成历史"""
    st.subheader("📜 生成历史")

    storage = get_storage()
    history = storage.load_history()

    if not history:
        st.info("暂无生成历史")
        return

    # 按人物分组显示
    by_character = {}
    for entry in history:
        name = entry.get("character_name", "未知")
        if name not in by_character:
            by_character[name] = []
        by_character[name].append(entry)

    for char_name, entries in by_character.items():
        with st.expander(f"👤 {char_name} ({len(entries)} 条)"):
            for entry in entries[:10]:
                from datetime import datetime
                dt = datetime.fromisoformat(entry["created_at"])
                st.write(f"**{entry['mood']}** - {dt.strftime('%Y-%m-%d %H:%M')}")
                st.code(entry["o3ics"][:200] + "..." if len(entry["o3ics"]) > 200 else entry["o3ics"])
                st.markdown("")


# ============ Prompt 灵感库 ============

def render_prompt_panel():
    """渲染 Prompt 灵感库面板"""
    st.markdown("---")
    st.subheader("Prompt 灵感库")
    st.caption("💡 随机 Prompt 是生命力，点赞收藏是核心资产")

    # 初始化存储
    prompt_storage = get_prompt_storage()
    prompt_generator = get_prompt_generator()

    # 统计信息
    stats = prompt_storage.get_stats()
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("总 Prompt", stats['total'])
    with col2:
        st.metric("随机 Prompt", stats['random'])
    with col3:
        st.metric("精选 Prompt", stats['internal'])
    with col4:
        st.metric("总点赞", stats['total_likes'])

    st.markdown("")

    # Tab 切换
    tab1, tab2, tab3, tab4 = st.tabs(["🎲 生成 Prompt", "📋 随机 Prompt", "✨ 精选 Prompt", "✏️ 手动创建"])

    with tab1:
        render_generate_tab(prompt_generator, prompt_storage)

    with tab2:
        render_random_tab(prompt_storage)

    with tab3:
        render_internal_tab(prompt_storage)

    with tab4:
        render_manual_create_tab(prompt_storage)


def render_generate_tab(generator, storage):
    """生成 Prompt Tab"""
    col1, col2 = st.columns([1, 3])

    with col1:
        mood_input = st.text_input("情绪（可选）", placeholder="留空随机")
        style_input = st.text_input("曲风（可选）", placeholder="留空随机")

    with col2:
        count = st.selectbox("生成数量", [3, 5, 8, 10], index=1, horizontal=True)

    if st.button("🎲 生成随机 Prompt", type="primary", use_container_width=True):
        prompts = generator.generate_batch(
            count=count,
            mood=mood_input if mood_input else None,
            style=style_input if style_input else None
        )

        st.session_state.generated_prompts = prompts

    # 显示生成的 Prompt
    if st.session_state.get('generated_prompts'):
        st.markdown("#### 生成的 Prompt")
        for prompt in st.session_state.generated_prompts:
            with st.container():
                col_t, col_a = st.columns([4, 1])
                with col_t:
                    st.text_area(
                        "Prompt 内容",
                        value=prompt.content,
                        height=80,
                        key=f"prompt_{prompt.id}"
                    )
                with col_a:
                    st.write("")
                    if st.button("❤️ 收藏", key=f"like_{prompt.id}"):
                        prompt.mark_liked()
                        storage.add_prompt(prompt)
                        st.success("已收藏到精选 Prompt！")

                    if st.button("📋 复制", key=f"copy_{prompt.id}"):
                        st.session_state.clipboard = prompt.content
                        st.toast("已复制到剪贴板")

                # 元信息
                c1, c2, c3 = st.columns(3)
                c1.write(f"**情绪:** {prompt.mood}")
                c2.write(f"**曲风:** {prompt.style}")
                c3.write(f"**类型:** {prompt.prompt_type}")

                st.markdown("---")


def render_random_tab(storage):
    """随机 Prompt Tab"""
    prompts = storage.get_prompts_by_type(PromptType.RANDOM)

    if not prompts:
        st.info("暂无随机 Prompt，去「生成 Prompt」标签页创建吧")
        return

    st.write(f"共 {len(prompts)} 个随机 Prompt")

    # 筛选
    search = st.text_input("搜索", placeholder="输入关键词搜索...")

    filtered = prompts
    if search:
        filtered = [p for p in prompts if search.lower() in p.content.lower() or search in p.mood]

    for prompt in filtered:
        with st.expander(f"🎲 {prompt.mood} - {prompt.style}"):
            st.text_area("内容", value=prompt.content, height=100, key=f"random_{prompt.id}", disabled=True)

            col1, col2, col3 = st.columns(3)
            col1.write(f"使用次数: {prompt.usage_count}")
            col2.write(f"点赞: {prompt.like_count}")
            col3.write(f"创建于: {prompt.created_at[:10]}")

            c1, c2 = st.columns(2)
            with c1:
                if st.button("❤️ 收藏为精选", key=f"like_random_{prompt.id}"):
                    prompt.mark_liked()
                    storage.update_prompt(prompt)
                    st.success("已收藏！")
                    st.rerun()

            with c2:
                if st.button("🗑️ 删除", key=f"del_random_{prompt.id}"):
                    storage.delete_prompt(prompt.id)
                    st.success("已删除")
                    st.rerun()


def render_internal_tab(storage):
    """精选 Prompt Tab"""
    prompts = storage.get_internal_prompts()

    if not prompts:
        st.info("暂无精选 Prompt，给喜欢的随机 Prompt 点收藏")
        return

    # 按点赞排序
    sorted_prompts = sorted(prompts, key=lambda p: p.like_count, reverse=True)

    st.write(f"共 {len(sorted_prompts)} 个精选 Prompt")

    for prompt in sorted_prompts:
        with st.expander(f"✨ {prompt.mood} - {prompt.style} (❤️ {prompt.like_count})"):
            st.text_area("内容", value=prompt.content, height=100, key=f"internal_{prompt.id}", disabled=True)

            col1, col2, col3 = st.columns(3)
            col1.write(f"使用次数: {prompt.usage_count}")
            col2.write(f"测试次数: {prompt.test_count}")
            col3.write(f"来源: {prompt.source or '收藏'}")

            c1, c2 = st.columns(2)
            with c1:
                if st.button("📋 复制", key=f"copy_internal_{prompt.id}"):
                    st.session_state.clipboard = prompt.content
                    st.toast("已复制到剪贴板")

            with c2:
                if st.button("🗑️ 删除", key=f"del_internal_{prompt.id}"):
                    storage.delete_prompt(prompt.id)
                    st.success("已删除")
                    st.rerun()


def render_manual_create_tab(storage):
    """手动创建 Prompt Tab"""
    st.write("手动创建一个精选 Prompt")

    content = st.text_area("Prompt 内容", placeholder="输入完整的 Suno Prompt...", height=100)

    col1, col2 = st.columns(2)
    with col1:
        mood = st.text_input("情绪标签", placeholder="例如：Joy, 悲伤, 浪漫")
    with col2:
        style = st.text_input("曲风标签", placeholder="例如：Pop, 民谣, 华语")

    tags = st.text_input("自定义标签（逗号分隔）", placeholder="例如：中文, 正面情绪, 治愈")

    if st.button("创建精选 Prompt", type="primary", use_container_width=True):
        if not content:
            st.error("请输入 Prompt 内容")
            return

        prompt = SunoPrompt(
            prompt_type=PromptType.INTERNAL.value,
            status=PromptStatus.ACTIVE.value,
            mood=mood or "未知",
            style=style or "未知",
            content=content,
            tags=[t.strip() for t in tags.split(',') if t.strip()] if tags else [],
            source="manual"
        )

        storage.add_prompt(prompt)
        st.success("精选 Prompt 创建成功！")
        st.rerun()


# ============ 主程序 ============

if __name__ == "__main__":
    render_sidebar()
    render_main()
    render_prompt_panel()
