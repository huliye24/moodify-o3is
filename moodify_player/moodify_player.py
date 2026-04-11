# -*- coding: utf-8 -*-
"""
Moodify - 情绪潮汐品牌官网
Material Design 3 风格实现
"""

import sys
import os
import json

from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QSlider, QLabel, QScrollArea, QFrame, QFileDialog,
    QGridLayout, QGraphicsDropShadowEffect, QSizeGrip
)
from PyQt5.QtCore import Qt, QUrl, QPropertyAnimation, QEasingCurve, QRect, QSize, pyqtSignal, QObject
from PyQt5.QtGui import QFont, QColor, QPalette, QPainter, QBrush, QLinearGradient
from PyQt5.QtMultimedia import QMediaPlayer, QMediaContent

# 调试日志
DEBUG_LOG = 'c:\\Users\\Administrator\\Desktop\\moodify\\.cursor\\debug.log'

def log(msg, data=None):
    try:
        with open(DEBUG_LOG, 'a', encoding='utf-8') as f:
            entry = {
                'timestamp': 1234567890,
                'message': msg,
            }
            if data:
                entry['data'] = data
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    except:
        pass

MUSIC_DIR = os.path.join(os.path.dirname(__file__), 'music')


# ===== 调色板 =====
class Colors:
    """Moodify 情绪色彩系统"""
    # 背景
    BG_DEEP = '#0A0A0F'
    BG_CARD = '#111118'
    BG_SURFACE = '#1A1A24'
    BG_HOVER = '#22222E'

    # 情绪四色
    MOOD_COLLAPSE = '#6B7A8F'   # 蜷缩
    MOOD_LOST = '#8B9EB7'        # 迷茫
    MOOD_AWAKE = '#A8B8C9'       # 觉醒
    MOOD_SPREAD = '#C4D4E4'      # 舒展

    # 文字
    TEXT_PRIMARY = '#C4D4E4'
    TEXT_SECONDARY = '#8B9EB7'
    TEXT_MUTED = '#6B7A8F'
    TEXT_DISABLED = '#4A5A6A'

    # 强调
    ACCENT = '#A8B8C9'

    # 状态
    SUCCESS = '#7AAA7A'
    ERROR = '#AA7A7A'


# ===== 自定义导航按钮 =====
class NavButton(QPushButton):
    """Material Design 3 风格导航按钮"""
    activated = pyqtSignal(str)

    def __init__(self, page_id, title, subtitle, icon="", parent=None):
        super().__init__(parent)
        self.page_id = page_id
        self.is_active = False
        self.setCursor(Qt.PointingHandCursor)
        log('NavButton.__init__', {'page_id': page_id, 'title': title})

        # 布局
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(12, 0, 12, 0)
        main_layout.setSpacing(12)

        # 图标
        self.icon_label = QLabel(icon)
        self.icon_label.setObjectName('NavIcon')
        self.icon_label.setFixedWidth(24)
        main_layout.addWidget(self.icon_label)

        # 文字区域
        text_layout = QVBoxLayout()
        text_layout.setSpacing(2)

        self.title_label = QLabel(title)
        self.title_label.setObjectName('NavTitle')
        text_layout.addWidget(self.title_label)

        self.subtitle_label = QLabel(subtitle)
        self.subtitle_label.setObjectName('NavSubtitle')
        text_layout.addWidget(self.subtitle_label)

        main_layout.addLayout(text_layout, 1)
        main_layout.addStretch()

        # 点击信号
        self.clicked.connect(lambda: self.activated.emit(page_id))

    def setActive(self, active):
        self.is_active = active
        log('NavButton.setActive', {'page_id': self.page_id, 'active': active})
        if active:
            self.setObjectName('NavButtonActive')
            self.title_label.setObjectName('NavTitleActive')
            self.subtitle_label.setObjectName('NavSubtitleActive')
            self.icon_label.setObjectName('NavIconActive')
        else:
            self.setObjectName('NavButton')
            self.title_label.setObjectName('NavTitle')
            self.subtitle_label.setObjectName('NavSubtitle')
            self.icon_label.setObjectName('NavIcon')
        self.style().unpolish(self)
        self.style().polish(self)


# ===== 主应用 =====
class MoodifyApp(QMainWindow):

    def __init__(self):
        super().__init__()
        log('MoodifyApp.__init__', {'event': 'start'})

        # 播放器
        self.player = QMediaPlayer()
        self.playlist = []
        self.current_index = -1
        self.current_page = 'index'

        # 字体
        self.font_cn = 'Microsoft YaHei'
        self.font_en = 'Georgia'

        # 初始化
        self.init_ui()
        self.load_music()
        self.navigate_to('index')

        log('MoodifyApp.__init__', {'event': 'complete'})

    def init_ui(self):
        """初始化界面"""
        log('init_ui', {'event': 'start'})

        self.setWindowTitle('Moodify | 情绪的潮汐，终将抵达彼岸')
        self.setGeometry(100, 100, 1400, 900)
        self.showMaximized()

        # 深色主题
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(Colors.BG_DEEP))
        palette.setColor(QPalette.Background, QColor(Colors.BG_DEEP))
        self.setPalette(palette)

        # 中央窗口
        central = QWidget()
        self.setCentralWidget(central)

        main_layout = QHBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 侧边栏
        self.side_panel = QFrame()
        self.side_panel.setObjectName('SidePanel')
        main_layout.addWidget(self.side_panel)

        # 内容区
        self.content_area = QScrollArea()
        self.content_area.setObjectName('ContentArea')
        self.content_area.setWidgetResizable(True)
        self.content_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        main_layout.addWidget(self.content_area, 1)

        # 构建界面
        self.build_sidebar()
        self.apply_styles()

        log('init_ui', {'event': 'complete'})

    def build_sidebar(self):
        """构建侧边栏"""
        log('build_sidebar START', {'event': 'start'})

        layout = QVBoxLayout(self.side_panel)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # ===== Logo 区域 =====
        logo_container = QFrame()
        logo_container.setObjectName('LogoContainer')
        logo_layout = QVBoxLayout(logo_container)
        logo_layout.setContentsMargins(24, 32, 24, 28)
        logo_layout.setSpacing(8)
        logo_layout.setAlignment(Qt.AlignCenter)

        logo_icon = QLabel('~')
        logo_icon.setObjectName('LogoIcon')
        logo_icon.setAlignment(Qt.AlignCenter)
        logo_layout.addWidget(logo_icon)

        logo_text = QLabel('Moodify')
        logo_text.setObjectName('LogoText')
        logo_text.setAlignment(Qt.AlignCenter)
        logo_layout.addWidget(logo_text)

        tagline = QLabel('情绪的潮汐，终将抵达彼岸')
        tagline.setObjectName('LogoTagline')
        tagline.setAlignment(Qt.AlignCenter)
        logo_layout.addWidget(tagline)

        layout.addWidget(logo_container, 0)

        # ===== 导航区域 =====
        nav_container = QFrame()
        nav_container.setObjectName('NavContainer')
        nav_layout = QVBoxLayout(nav_container)
        nav_layout.setContentsMargins(16, 24, 16, 16)
        nav_layout.setSpacing(4)

        nav_title = QLabel('探索')
        nav_title.setObjectName('NavSectionTitle')
        nav_layout.addWidget(nav_title)

        self.nav_buttons = {}
        pages = [
            ('index', '首页', '情绪潮汐', '⌂'),
            ('boundary', '边界', '音乐边界', '◈'),
            ('products', '容器', '情绪容器', '◇'),
            ('voice', '声音', '品牌声音', '♪'),
        ]

        for page_id, name, subtitle, icon in pages:
            btn = NavButton(page_id, name, subtitle, icon)
            btn.setObjectName('NavButton')
            btn.activated.connect(self.on_nav_activated)
            self.nav_buttons[page_id] = btn
            nav_layout.addWidget(btn)

        nav_layout.addStretch(1)
        layout.addWidget(nav_container, 1)

        # ===== 音乐控制区域 =====
        music_container = QFrame()
        music_container.setObjectName('MusicContainer')
        music_layout = QVBoxLayout(music_container)
        music_layout.setContentsMargins(16, 12, 16, 16)
        music_layout.setSpacing(12)

        # 分隔线
        divider = QFrame()
        divider.setObjectName('Divider')
        divider.setFixedHeight(1)
        music_layout.addWidget(divider)

        # 标题
        header = QHBoxLayout()
        header.setSpacing(8)

        music_title = QLabel('正在播放')
        music_title.setObjectName('MusicTitle')
        header.addWidget(music_title)
        header.addStretch()

        music_icon = QLabel('♫')
        music_icon.setObjectName('MusicIcon')
        header.addWidget(music_icon)
        music_layout.addLayout(header)

        # 曲目名
        self.now_playing = QLabel('选择音乐开始')
        self.now_playing.setObjectName('NowPlaying')
        self.now_playing.setWordWrap(True)
        music_layout.addWidget(self.now_playing)

        # 播放控制
        controls = QHBoxLayout()
        controls.setSpacing(8)

        self.prev_btn = QPushButton('⏮')
        self.prev_btn.setObjectName('ControlBtn')
        self.prev_btn.setFixedSize(36, 36)
        self.prev_btn.clicked.connect(self.prev_track)
        controls.addWidget(self.prev_btn)

        self.play_btn = QPushButton('▶')
        self.play_btn.setObjectName('PlayBtn')
        self.play_btn.setFixedSize(44, 44)
        self.play_btn.clicked.connect(self.toggle_play)
        controls.addWidget(self.play_btn)

        self.next_btn = QPushButton('⏭')
        self.next_btn.setObjectName('ControlBtn')
        self.next_btn.setFixedSize(36, 36)
        self.next_btn.clicked.connect(self.next_track)
        controls.addWidget(self.next_btn)

        controls.addStretch()
        music_layout.addLayout(controls)

        # 音量
        volume = QHBoxLayout()
        volume.setSpacing(8)

        vol_icon = QLabel('◉')
        vol_icon.setObjectName('VolumeIcon')
        vol_icon.setFixedWidth(20)
        volume.addWidget(vol_icon)

        self.volume_slider = QSlider(Qt.Horizontal)
        self.volume_slider.setObjectName('VolumeSlider')
        self.volume_slider.setRange(0, 100)
        self.volume_slider.setValue(60)
        self.volume_slider.setFixedHeight(20)
        self.volume_slider.valueChanged.connect(self.set_volume)
        volume.addWidget(self.volume_slider)

        music_layout.addLayout(volume)

        # 添加按钮
        add_btn = QPushButton('⊕ 添加音乐')
        add_btn.setObjectName('AddBtn')
        add_btn.setFixedHeight(36)
        add_btn.clicked.connect(self.add_music)
        music_layout.addWidget(add_btn)

        layout.addWidget(music_container, 0)

        # 信号连接
        self.player.positionChanged.connect(self.position_changed)
        self.player.durationChanged.connect(self.duration_changed)
        self.player.stateChanged.connect(self.state_changed)

        log('build_sidebar END', {'nav_buttons': len(self.nav_buttons)})

    def on_nav_activated(self, page_id):
        """导航激活"""
        log('on_nav_activated', {'page_id': page_id})
        self.navigate_to(page_id)

    def navigate_to(self, page_id):
        """导航到页面"""
        log('navigate_to START', {'page_id': page_id, 'current': self.current_page})
        log('navigate_to', {'nav_buttons_count': len(self.nav_buttons) if hasattr(self, 'nav_buttons') else 0})

        self.current_page = page_id

        # 更新导航状态
        if hasattr(self, 'nav_buttons'):
            for pid, btn in self.nav_buttons.items():
                btn.setActive(pid == page_id)

        # 创建页面
        log('navigate_to', {'creating_content': True})
        content = QWidget()
        content.setObjectName('ContentPage')
        layout = QVBoxLayout(content)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        if page_id == 'index':
            self.build_index_page(layout)
        elif page_id == 'boundary':
            self.build_boundary_page(layout)
        elif page_id == 'products':
            self.build_products_page(layout)
        elif page_id == 'voice':
            self.build_voice_page(layout)

        layout.addStretch()
        self.content_area.setWidget(content)

        log('navigate_to END', {'page_id': page_id})

    # ===== 首页 =====
    def build_index_page(self, layout):
        """首页"""
        # Hero
        hero = QFrame()
        hero.setObjectName('HeroSection')
        hero_layout = QVBoxLayout(hero)
        hero_layout.setContentsMargins(60, 80, 60, 80)
        hero_layout.setSpacing(0)
        hero_layout.setAlignment(Qt.AlignCenter)

        hero_icon = QLabel('~')
        hero_icon.setObjectName('HeroIcon')
        hero_icon.setAlignment(Qt.AlignCenter)
        hero_layout.addWidget(hero_icon)

        hero_layout.addSpacing(30)

        title = QLabel('情绪的潮汐，\n终将抵达彼岸')
        title.setObjectName('HeroTitle')
        title.setAlignment(Qt.AlignCenter)
        title.setWordWrap(True)
        hero_layout.addWidget(title)

        hero_layout.addSpacing(20)

        subtitle = QLabel('Stay in the flow, stay in the soul.')
        subtitle.setObjectName('HeroSubtitle')
        subtitle.setAlignment(Qt.AlignCenter)
        hero_layout.addWidget(subtitle)

        hero_layout.addStretch()
        layout.addWidget(hero)

        # 情绪卡片网格
        self.build_mood_grid(layout)

        # 核心理念
        self.build_beliefs_section(layout)

        # 结尾
        footer = QFrame()
        footer.setObjectName('FooterSection')
        footer_layout = QVBoxLayout(footer)
        footer_layout.setContentsMargins(60, 60, 60, 60)
        footer_layout.setSpacing(20)
        footer_layout.setAlignment(Qt.AlignCenter)

        quote = QLabel('不为抵达，只为停留。')
        quote.setObjectName('FooterQuote')
        quote.setAlignment(Qt.AlignCenter)
        footer_layout.addWidget(quote)

        logo = QLabel('Moodify')
        logo.setObjectName('FooterLogo')
        logo.setAlignment(Qt.AlignCenter)
        footer_layout.addWidget(logo)

        layout.addWidget(footer)

    def build_mood_grid(self, parent_layout):
        """情绪卡片网格"""
        grid_container = QFrame()
        grid_container.setObjectName('MoodGridSection')
        grid_layout = QVBoxLayout(grid_container)
        grid_layout.setContentsMargins(60, 40, 60, 40)
        grid_layout.setSpacing(30)

        title = QLabel('情绪四重奏')
        title.setObjectName('SectionTitle')
        grid_layout.addWidget(title)

        grid_layout.addSpacing(20)

        grid = QGridLayout()
        grid.setSpacing(20)

        moods = [
            ('01', '蜷缩', '紧 · 沉 · 冷', Colors.MOOD_COLLAPSE, '身体在说：需要休息一下'),
            ('02', '迷茫', '不确定 · 悬浮', Colors.MOOD_LOST, '身体在问：想去哪里？'),
            ('03', '觉醒', '看见了什么', Colors.MOOD_AWAKE, '裂缝里透进来的光'),
            ('04', '舒展', '打开 · 呼吸', Colors.MOOD_SPREAD, '呼吸本身'),
        ]

        for i, (num, name, tags, color, desc) in enumerate(moods):
            row, col = i // 2, i % 2
            card = self.create_mood_card(num, name, tags, color, desc)
            grid.addWidget(card, row, col)

        grid_layout.addLayout(grid)
        parent_layout.addWidget(grid_container)

    def create_mood_card(self, num, name, tags, color, desc):
        """创建情绪卡片"""
        card = QFrame()
        card.setObjectName('MoodCard')
        card.setCursor(Qt.PointingHandCursor)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(12)

        # 顶部：编号 + 颜色条
        top = QHBoxLayout()
        top.setSpacing(12)

        color_bar = QFrame()
        color_bar.setObjectName('MoodColorBar')
        color_bar.setStyleSheet(f'background-color: {color}; border-radius: 4px;')
        color_bar.setFixedSize(8, 40)
        top.addWidget(color_bar)

        num_label = QLabel(num)
        num_label.setObjectName('MoodNum')
        top.addWidget(num_label)

        top.addStretch()

        layout.addLayout(top)

        # 情绪名
        name_label = QLabel(name)
        name_label.setObjectName('MoodName')
        layout.addWidget(name_label)

        # 标签
        tags_label = QLabel(tags)
        tags_label.setObjectName('MoodTags')
        layout.addWidget(tags_label)

        layout.addSpacing(8)

        # 描述
        desc_label = QLabel(desc)
        desc_label.setObjectName('MoodDesc')
        desc_label.setWordWrap(True)
        layout.addWidget(desc_label)

        layout.addStretch()

        return card

    def build_beliefs_section(self, parent_layout):
        """信念区块"""
        section = QFrame()
        section.setObjectName('BeliefsSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(30)

        title = QLabel('核心理念')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        layout.addSpacing(20)

        beliefs = [
            ('◐', '情绪是信号，不是缺陷', '焦虑是信号，迷茫是信号，崩溃也是信号。我们不压制信号，我们翻译信号。'),
            ('◇', '音乐可以是一种语言', '有些话说不出来，但音乐可以。一段旋律，可以表达"我懂你"。'),
            ('○', '陪伴是最珍贵的东西', '我们不相信"治愈"。治愈暗示着疾病。我们相信"陪伴"——我在这里，我不走。'),
        ]

        for icon, title_text, desc in beliefs:
            card = QFrame()
            card.setObjectName('BeliefCard')

            card_layout = QHBoxLayout(card)
            card_layout.setContentsMargins(20, 20, 20, 20)
            card_layout.setSpacing(20)

            icon_label = QLabel(icon)
            icon_label.setObjectName('BeliefIcon')
            icon_label.setFixedWidth(50)
            icon_label.setAlignment(Qt.AlignCenter)
            card_layout.addWidget(icon_label)

            text_layout = QVBoxLayout()
            text_layout.setSpacing(6)

            title_label = QLabel(title_text)
            title_label.setObjectName('BeliefTitle')
            text_layout.addWidget(title_label)

            desc_label = QLabel(desc)
            desc_label.setObjectName('BeliefDesc')
            desc_label.setWordWrap(True)
            text_layout.addWidget(desc_label)

            card_layout.addLayout(text_layout, 1)
            layout.addWidget(card)

        parent_layout.addWidget(section)

    # ===== 边界页面 =====
    def build_boundary_page(self, layout):
        """边界页面"""
        hero = self.create_page_hero('音乐的边界', 'The Boundary of Sound')
        layout.addWidget(hero)

        self.build_quadrants_section(layout)
        self.build_dos_section(layout)
        self.build_temp_section(layout)

    def create_page_hero(self, title, subtitle):
        """页面英雄区"""
        hero = QFrame()
        hero.setObjectName('PageHero')
        hero_layout = QVBoxLayout(hero)
        hero_layout.setContentsMargins(60, 60, 60, 60)
        hero_layout.setSpacing(12)
        hero_layout.setAlignment(Qt.AlignCenter)

        title_label = QLabel(title)
        title_label.setObjectName('PageTitle')
        title_label.setAlignment(Qt.AlignCenter)
        hero_layout.addWidget(title_label)

        subtitle_label = QLabel(subtitle)
        subtitle_label.setObjectName('PageSubtitle')
        subtitle_label.setAlignment(Qt.AlignCenter)
        hero_layout.addWidget(subtitle_label)

        return hero

    def build_quadrants_section(self, parent_layout):
        """四象限区块"""
        section = QFrame()
        section.setObjectName('QuadrantsSection')
        layout = QGridLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(20)

        title = QLabel('音乐四要素')
        title.setObjectName('SectionTitle')
        layout.addWidget(title, 0, 0, 1, 2)

        quadrants = [
            ('01', '听觉基调', 'Creamy Minimalism', '新极简主义 + 奶油质感。使用大量的 Ambient（氛围音）、Lo-Fi 采样。', Colors.MOOD_COLLAPSE),
            ('02', '旋律逻辑', 'Breathing Flow', '非效率竞争的"呼吸感"。采用长音（Drone）和慢速琶音，追求"留白"。', Colors.MOOD_LOST),
            ('03', '编曲结构', 'Evolving Loop', '演化循环结构。使用循环但带有细微变量的结构。', Colors.MOOD_AWAKE),
            ('04', '情绪调性', 'Cold with Warm Core', '治愈系治愈。追求"中性偏冷但带有底温"的色彩，像一双懂你的眼睛。', Colors.MOOD_SPREAD),
        ]

        for i, (num, title_text, subtitle, desc, color) in enumerate(quadrants):
            row, col = (i // 2) + 1, i % 2
            card = self.create_quadrant_card(num, title_text, subtitle, desc, color)
            layout.addWidget(card, row, col)

        parent_layout.addWidget(section)

    def create_quadrant_card(self, num, title, subtitle, desc, color):
        """创建象限卡片"""
        card = QFrame()
        card.setObjectName('QuadrantCard')

        layout = QVBoxLayout(card)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        color_bar = QFrame()
        color_bar.setStyleSheet(f'background-color: {color}; border-radius: 2px;')
        color_bar.setFixedHeight(4)
        layout.addWidget(color_bar)

        num_label = QLabel(num)
        num_label.setObjectName('QuadrantNum')
        layout.addWidget(num_label)

        title_label = QLabel(title)
        title_label.setObjectName('QuadrantTitle')
        layout.addWidget(title_label)

        subtitle_label = QLabel(subtitle)
        subtitle_label.setObjectName('QuadrantSubtitle')
        layout.addWidget(subtitle_label)

        layout.addSpacing(8)

        desc_label = QLabel(desc)
        desc_label.setObjectName('QuadrantDesc')
        desc_label.setWordWrap(True)
        layout.addWidget(desc_label)

        layout.addStretch()
        return card

    def build_dos_section(self, parent_layout):
        """边界清单区块"""
        section = QFrame()
        section.setObjectName('DosSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(20)

        title = QLabel('边界清单')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        items = [
            ('节奏', '呼吸律动、心跳频率', '工业重金属、BPM 舞曲'),
            ('音色', '磨砂感、奶油色温', '尖锐、刺耳'),
            ('旋律', '长音、留白、慢速演化', '紧凑副歌、洗脑 hook'),
            ('编曲', '演化循环、空间打开', '传统 A-B-A 结构'),
        ]

        for dim, do, dont in items:
            row = QFrame()
            row.setObjectName('DosRow')

            row_layout = QHBoxLayout(row)
            row_layout.setContentsMargins(16, 14, 16, 14)
            row_layout.setSpacing(20)

            dim_label = QLabel(dim)
            dim_label.setObjectName('DosDim')
            dim_label.setFixedWidth(60)
            row_layout.addWidget(dim_label)

            do_label = QLabel(f'✓ {do}')
            do_label.setObjectName('DosDo')
            row_layout.addWidget(do_label, 1)

            dont_label = QLabel(f'✗ {dont}')
            dont_label.setObjectName('DosDont')
            row_layout.addWidget(dont_label, 1)

            layout.addWidget(row)

        parent_layout.addWidget(section)

    def build_temp_section(self, parent_layout):
        """温度区块"""
        section = QFrame()
        section.setObjectName('TempSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 60)
        layout.setSpacing(30)
        layout.setAlignment(Qt.AlignCenter)

        concept = QLabel('中性偏冷，但有底温')
        concept.setObjectName('TempConcept')
        concept.setAlignment(Qt.AlignCenter)
        layout.addWidget(concept)

        desc = QLabel('想象冬天的一杯热水。杯子是冷的，但水是热的。\n不烫伤你，也不让你冷。')
        desc.setObjectName('TempDesc')
        desc.setAlignment(Qt.AlignCenter)
        desc.setWordWrap(True)
        layout.addWidget(desc)

        parent_layout.addWidget(section)

    # ===== 容器页面 =====
    def build_products_page(self, layout):
        """容器页面"""
        hero = self.create_page_hero('情绪容器', 'The Form of Emotion')
        layout.addWidget(hero)

        self.build_product_types_section(layout)
        self.build_naming_section(layout)

    def build_product_types_section(self, parent_layout):
        """产品类型区块"""
        section = QFrame()
        section.setObjectName('TypesSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(20)

        title = QLabel('产品形态')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        types = [
            ('◉', '情绪专辑', 'Mood Albums', '每个情绪状态 = 一张专辑。8-12 首演化循环音乐，约 45-60 分钟。'),
            ('◐', 'Moodify 时刻', 'Mood Moments', '音乐 + 场景 + 意图。不是功能，是陪伴。'),
            ('◇', 'Moodify 场景', 'Mood Scenes', '情绪场景，不是使用场景。独处 / 等待 / 想念。'),
            ('○', 'Moodify 演化', 'Mood Evolution', '情绪旅程，不是播放列表。音乐引导用户，跟随即可。'),
        ]

        for icon, name, en, desc in types:
            card = QFrame()
            card.setObjectName('TypeCard')

            card_layout = QHBoxLayout(card)
            card_layout.setContentsMargins(20, 16, 20, 16)
            card_layout.setSpacing(16)

            icon_label = QLabel(icon)
            icon_label.setObjectName('TypeIcon')
            icon_label.setFixedWidth(40)
            icon_label.setAlignment(Qt.AlignCenter)
            card_layout.addWidget(icon_label)

            text_layout = QVBoxLayout()
            text_layout.setSpacing(4)

            name_row = QHBoxLayout()
            name_row.setSpacing(8)

            name_label = QLabel(name)
            name_label.setObjectName('TypeName')
            name_row.addWidget(name_label)

            en_label = QLabel(en)
            en_label.setObjectName('TypeEN')
            name_row.addWidget(en_label)
            name_row.addStretch()

            text_layout.addLayout(name_row)

            desc_label = QLabel(desc)
            desc_label.setObjectName('TypeDesc')
            desc_label.setWordWrap(True)
            text_layout.addWidget(desc_label)

            card_layout.addLayout(text_layout, 1)
            layout.addWidget(card)

        parent_layout.addWidget(section)

    def build_naming_section(self, parent_layout):
        """命名体系区块"""
        section = QFrame()
        section.setObjectName('NamingSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(16)

        title = QLabel('情绪命名体系')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        layers = [
            ('01', '蜷缩', '紧、沉、冷', ['无力感', '崩溃边缘', '什么都不想做']),
            ('02', '迷茫', '不确定、悬浮', ['不知道方向', '停在原地', '想走但不知往哪']),
            ('03', '觉醒', '看见了什么', ['某句话击中了你', '突然明白了什么', '光透进来了']),
            ('04', '舒展', '打开了、呼吸', ['微光', '可以呼吸了', '刚刚好']),
        ]

        for num, name, feeling, subs in layers:
            row = QFrame()
            row.setObjectName('NamingRow')

            row_layout = QHBoxLayout(row)
            row_layout.setContentsMargins(16, 12, 16, 12)
            row_layout.setSpacing(16)

            num_label = QLabel(num)
            num_label.setObjectName('NamingNum')
            num_label.setFixedWidth(30)
            row_layout.addWidget(num_label)

            name_label = QLabel(name)
            name_label.setObjectName('NamingName')
            name_label.setFixedWidth(60)
            row_layout.addWidget(name_label)

            feeling_label = QLabel(feeling)
            feeling_label.setObjectName('NamingFeeling')
            row_layout.addWidget(feeling_label, 1)

            for sub in subs:
                tag = QLabel(sub)
                tag.setObjectName('NamingTag')
                row_layout.addWidget(tag)

            layout.addWidget(row)

        parent_layout.addWidget(section)

    # ===== 声音页面 =====
    def build_voice_page(self, layout):
        """声音页面"""
        hero = self.create_page_hero('品牌声音', 'The Voice of Moodify')
        layout.addWidget(hero)

        self.build_principles_section(layout)
        self.build_slogans_section(layout)
        self.build_donts_section(layout)
        self.build_colors_section(layout)

    def build_principles_section(self, parent_layout):
        """原则区块"""
        section = QFrame()
        section.setObjectName('PrinciplesSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(20)

        title = QLabel('声音三原则')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        principles = [
            ('—', '克制', 'Restraint', '我们不说"治愈"、"改善"、"解决"。我们说"陪伴"、"停留"、"呼吸"。'),
            ('◐', '诚实', 'Honesty', '我们承认音乐不会"让一切变好"。我们不会说"一切都会过去"。'),
            ('○', '邀请', 'Invitation', '我们不说"你应该"、"你需要"。我们说"你可以"、"你想吗"。'),
        ]

        for icon, name, en, desc in principles:
            card = QFrame()
            card.setObjectName('PrincipleCard')

            card_layout = QVBoxLayout(card)
            card_layout.setContentsMargins(24, 24, 24, 24)
            card_layout.setSpacing(12)
            card_layout.setAlignment(Qt.AlignCenter)

            icon_label = QLabel(icon)
            icon_label.setObjectName('PrincipleIcon')
            card_layout.addWidget(icon_label, 0, Qt.AlignCenter)

            name_row = QHBoxLayout()
            name_row.setSpacing(12)
            name_row.setAlignment(Qt.AlignCenter)

            name_label = QLabel(name)
            name_label.setObjectName('PrincipleName')
            name_row.addWidget(name_label)

            en_label = QLabel(en)
            en_label.setObjectName('PrincipleEN')
            name_row.addWidget(en_label)

            card_layout.addLayout(name_row)

            desc_label = QLabel(desc)
            desc_label.setObjectName('PrincipleDesc')
            desc_label.setAlignment(Qt.AlignCenter)
            desc_label.setWordWrap(True)
            card_layout.addWidget(desc_label)

            layout.addWidget(card)

        parent_layout.addWidget(section)

    def build_slogans_section(self, parent_layout):
        """标语区块"""
        section = QFrame()
        section.setObjectName('SlogansSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 60, 60, 60)
        layout.setSpacing(20)
        layout.setAlignment(Qt.AlignCenter)

        main = QLabel('Stay in the flow, stay in the soul.')
        main.setObjectName('SloganMain')
        main.setAlignment(Qt.AlignCenter)
        layout.addWidget(main)

        cn = QLabel('不为抵达，只为停留。')
        cn.setObjectName('SloganCN')
        cn.setAlignment(Qt.AlignCenter)
        layout.addWidget(cn)

        parent_layout.addWidget(section)

    def build_donts_section(self, parent_layout):
        """禁止语区块"""
        section = QFrame()
        section.setObjectName('DontsSection')
        layout = QHBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(40)

        # 左边：我们说
        do_column = QFrame()
        do_layout = QVBoxLayout(do_column)
        do_layout.setSpacing(16)

        do_title = QLabel('✓ 我们说')
        do_title.setObjectName('DontsTitle')
        do_layout.addWidget(do_title)

        for s in ['陪伴', '停留', '呼吸', '接纳', '允许自己', '在这里', '没关系']:
            label = QLabel(s)
            label.setObjectName('DontsItem')
            do_layout.addWidget(label)

        do_layout.addStretch()
        layout.addWidget(do_column, 1)

        # 分隔
        divider = QFrame()
        divider.setObjectName('DontsDivider')
        divider.setFixedWidth(1)
        layout.addWidget(divider)

        # 右边：我们不说
        dont_column = QFrame()
        dont_layout = QVBoxLayout(dont_column)
        dont_layout.setSpacing(16)

        dont_title = QLabel('✗ 我们不说')
        dont_title.setObjectName('DontsTitle')
        dont_layout.addWidget(dont_title)

        for s in ['"治愈"', '"改善"', '"解决"', '"应该开心"', '"必须放松"', '"积极心态"', '"加油"']:
            label = QLabel(s)
            label.setObjectName('DontsItemDont')
            dont_layout.addWidget(label)

        dont_layout.addStretch()
        layout.addWidget(dont_column, 1)

        parent_layout.addWidget(section)

    def build_colors_section(self, parent_layout):
        """色彩区块"""
        section = QFrame()
        section.setObjectName('ColorsSection')
        layout = QVBoxLayout(section)
        layout.setContentsMargins(60, 40, 60, 60)
        layout.setSpacing(24)

        title = QLabel('品牌色彩')
        title.setObjectName('SectionTitle')
        layout.addWidget(title)

        intro = QLabel('Moodify 的色彩体系：低饱和度的"情绪色谱"')
        intro.setObjectName('ColorsIntro')
        layout.addWidget(intro)

        layout.addSpacing(20)

        colors_layout = QHBoxLayout()
        colors_layout.setSpacing(16)

        colors = [
            ('蜷缩', '深灰蓝', Colors.MOOD_COLLAPSE, '紧、沉、冷'),
            ('迷茫', '灰蓝', Colors.MOOD_LOST, '不确定、悬浮'),
            ('觉醒', '淡灰蓝', Colors.MOOD_AWAKE, '看见了什么'),
            ('舒展', '透光蓝', Colors.MOOD_SPREAD, '打开、松开'),
        ]

        for name, color_name, hex_code, desc in colors:
            card = QFrame()
            card.setObjectName('ColorCard')

            card_layout = QVBoxLayout(card)
            card_layout.setSpacing(10)

            swatch = QFrame()
            swatch.setStyleSheet(f'background-color: {hex_code}; border-radius: 8px;')
            swatch.setFixedHeight(60)
            card_layout.addWidget(swatch)

            name_label = QLabel(name)
            name_label.setObjectName('ColorName')
            card_layout.addWidget(name_label)

            hex_label = QLabel(hex_code)
            hex_label.setObjectName('ColorHex')
            card_layout.addWidget(hex_label)

            desc_label = QLabel(desc)
            desc_label.setObjectName('ColorDesc')
            card_layout.addWidget(desc_label)

            colors_layout.addWidget(card)

        layout.addLayout(colors_layout)
        parent_layout.addWidget(section)

    # ===== 音乐控制 =====
    def load_music(self):
        """加载音乐"""
        if not os.path.exists(MUSIC_DIR):
            os.makedirs(MUSIC_DIR)

        self.playlist.clear()
        for file in os.listdir(MUSIC_DIR):
            if file.lower().endswith(('.mp3', '.wav', '.flac', '.ogg', '.m4a')):
                self.playlist.append(os.path.join(MUSIC_DIR, file))

        log('load_music', {'count': len(self.playlist)})

    def add_music(self):
        """添加音乐"""
        files, _ = QFileDialog.getOpenFileNames(
            self, '选择音乐', MUSIC_DIR,
            '音乐 (*.mp3 *.wav *.flac *.ogg *.m4a)'
        )
        for f in files:
            if f not in self.playlist:
                self.playlist.append(f)
        log('add_music', {'total': len(self.playlist)})

    def toggle_play(self):
        """切换播放"""
        if self.player.state() == self.player.PlayingState:
            self.player.pause()
        else:
            if self.current_index >= 0:
                self.player.play()
            elif len(self.playlist) > 0:
                self.play_index(0)

    def play_index(self, index):
        """播放指定索引"""
        if 0 <= index < len(self.playlist):
            self.current_index = index
            self.player.setMedia(QMediaContent(QUrl.fromLocalFile(self.playlist[index])))
            self.player.play()
            name = os.path.splitext(os.path.basename(self.playlist[index]))[0]
            self.now_playing.setText(name)
            log('play_index', {'index': index, 'name': name})

    def prev_track(self):
        """上一首"""
        if len(self.playlist) > 0:
            self.play_index((self.current_index - 1) % len(self.playlist))

    def next_track(self):
        """下一首"""
        if len(self.playlist) > 0:
            self.play_index((self.current_index + 1) % len(self.playlist))

    def set_volume(self, val):
        self.player.setVolume(val)

    def position_changed(self, pos):
        pass

    def duration_changed(self, dur):
        pass

    def state_changed(self, state):
        if state == self.player.PlayingState:
            self.play_btn.setText('⏸')
        else:
            self.play_btn.setText('▶')

    # ===== 样式 =====
    def apply_styles(self):
        """应用样式"""
        self.setStyleSheet(f"""
            QMainWindow {{ background-color: {Colors.BG_DEEP}; }}

            /* ===== 侧边栏 ===== */
            #SidePanel {{
                background-color: {Colors.BG_CARD};
                border-right: 1px solid {Colors.BG_SURFACE};
                min-width: 260px;
                max-width: 260px;
            }}

            #LogoContainer {{
                background-color: {Colors.BG_DEEP};
                border-bottom: 1px solid {Colors.BG_SURFACE};
            }}

            #LogoIcon {{
                font-size: 48px;
                color: {Colors.MOOD_SPREAD};
                font-family: {self.font_en}, serif;
            }}

            #LogoText {{
                font-size: 22px;
                font-weight: 600;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
                letter-spacing: 4px;
            }}

            #LogoTagline {{
                font-size: 10px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
            }}

            /* 导航 */
            #NavContainer {{ }}

            #NavSectionTitle {{
                font-size: 10px;
                color: {Colors.TEXT_DISABLED};
                letter-spacing: 2px;
                padding-left: 12px;
                margin-bottom: 8px;
            }}

            #NavButton {{
                background-color: transparent;
                border: none;
                border-radius: 8px;
                padding: 10px 8px;
            }}

            #NavButton:hover {{
                background-color: {Colors.BG_HOVER};
            }}

            #NavButtonActive {{
                background-color: {Colors.BG_HOVER};
                border-left: 3px solid {Colors.ACCENT};
            }}

            #NavIcon {{
                font-size: 18px;
                color: {Colors.TEXT_MUTED};
            }}

            #NavIconActive {{
                font-size: 18px;
                color: {Colors.ACCENT};
            }}

            #NavTitle {{
                font-size: 14px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                font-weight: 500;
            }}

            #NavTitleActive {{
                font-size: 14px;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
                font-weight: 500;
            }}

            #NavSubtitle {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #NavSubtitleActive {{
                font-size: 11px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            /* 音乐控制 */
            #MusicContainer {{
                background-color: {Colors.BG_DEEP};
                border-top: 1px solid {Colors.BG_SURFACE};
            }}

            #Divider {{
                background-color: {Colors.BG_SURFACE};
            }}

            #MusicTitle {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #MusicIcon {{
                font-size: 12px;
                color: {Colors.TEXT_MUTED};
            }}

            #NowPlaying {{
                font-size: 12px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                min-height: 28px;
            }}

            #PlayBtn {{
                background-color: {Colors.MOOD_LOST};
                border: none;
                border-radius: 22px;
                color: {Colors.BG_DEEP};
                font-size: 14px;
            }}

            #PlayBtn:hover {{
                background-color: {Colors.TEXT_PRIMARY};
            }}

            #ControlBtn {{
                background-color: transparent;
                border: none;
                color: {Colors.TEXT_MUTED};
                font-size: 16px;
            }}

            #ControlBtn:hover {{
                color: {Colors.TEXT_SECONDARY};
            }}

            #VolumeIcon {{
                font-size: 12px;
                color: {Colors.TEXT_MUTED};
            }}

            #VolumeSlider::groove:horizontal {{
                background-color: {Colors.BG_SURFACE};
                height: 4px;
                border-radius: 2px;
            }}

            #VolumeSlider::handle:horizontal {{
                background-color: {Colors.TEXT_MUTED};
                width: 10px;
                margin: -3px 0;
                border-radius: 5px;
            }}

            #VolumeSlider::sub-page:horizontal {{
                background-color: {Colors.TEXT_MUTED};
            }}

            #AddBtn {{
                background-color: {Colors.BG_SURFACE};
                border: 1px solid {Colors.BG_HOVER};
                color: {Colors.TEXT_MUTED};
                border-radius: 8px;
                font-family: '{self.font_cn}', sans-serif;
                font-size: 12px;
            }}

            #AddBtn:hover {{
                background-color: {Colors.BG_HOVER};
                color: {Colors.TEXT_SECONDARY};
            }}

            /* ===== 内容区域 ===== */
            #ContentArea {{
                background-color: {Colors.BG_DEEP};
                border: none;
            }}

            #ContentPage {{
                background-color: {Colors.BG_DEEP};
            }}

            QScrollBar:vertical {{
                background: transparent;
                width: 8px;
                margin: 0;
            }}

            QScrollBar::handle:vertical {{
                background: {Colors.BG_SURFACE};
                border-radius: 4px;
                min-height: 40px;
            }}

            QScrollBar::handle:vertical:hover {{
                background: {Colors.BG_HOVER};
            }}

            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}

            /* ===== 通用 ===== */
            #SectionTitle {{
                font-size: 24px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            /* 英雄区 */
            #HeroSection, #PageHero {{
                background-color: {Colors.BG_CARD};
            }}

            #HeroIcon {{
                font-size: 80px;
                color: {Colors.TEXT_MUTED};
                font-family: {self.font_en}, serif;
            }}

            #HeroTitle {{
                font-size: 36px;
                font-weight: 300;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.5;
            }}

            #HeroSubtitle {{
                font-size: 16px;
                color: {Colors.TEXT_SECONDARY};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            #PageTitle {{
                font-size: 32px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #PageSubtitle {{
                font-size: 14px;
                color: {Colors.TEXT_MUTED};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            /* 情绪卡片网格 */
            #MoodGridSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #MoodCard {{
                background-color: {Colors.BG_CARD};
                border-radius: 12px;
                min-height: 160px;
            }}

            #MoodCard:hover {{
                background-color: {Colors.BG_HOVER};
            }}

            #MoodColorBar {{
                border-radius: 4px;
            }}

            #MoodNum {{
                font-size: 12px;
                color: {Colors.TEXT_DISABLED};
                font-family: {self.font_en}, serif;
            }}

            #MoodName {{
                font-size: 20px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #MoodTags {{
                font-size: 12px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #MoodDesc {{
                font-size: 13px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.6;
            }}

            /* 信念区块 */
            #BeliefsSection {{
                background-color: {Colors.BG_CARD};
            }}

            #BeliefCard {{
                background-color: {Colors.BG_DEEP};
                border-radius: 10px;
            }}

            #BeliefIcon {{
                font-size: 28px;
                color: {Colors.MOOD_AWAKE};
            }}

            #BeliefTitle {{
                font-size: 16px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #BeliefDesc {{
                font-size: 13px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.7;
            }}

            /* 结尾 */
            #FooterSection {{
                background-color: {Colors.BG_CARD};
            }}

            #FooterQuote {{
                font-size: 18px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #FooterLogo {{
                font-size: 32px;
                font-weight: 200;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
                letter-spacing: 6px;
            }}

            /* 四象限 */
            #QuadrantsSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #QuadrantCard {{
                background-color: {Colors.BG_CARD};
                border-radius: 12px;
                min-height: 180px;
            }}

            #QuadrantNum {{
                font-size: 12px;
                color: {Colors.TEXT_DISABLED};
                font-family: {self.font_en}, serif;
            }}

            #QuadrantTitle {{
                font-size: 18px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #QuadrantSubtitle {{
                font-size: 12px;
                color: {Colors.TEXT_MUTED};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            #QuadrantDesc {{
                font-size: 13px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.6;
            }}

            /* 边界清单 */
            #DosSection {{
                background-color: {Colors.BG_CARD};
            }}

            #DosRow {{
                background-color: {Colors.BG_DEEP};
                border-radius: 8px;
            }}

            #DosDim {{
                font-size: 14px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #DosDo {{
                font-size: 13px;
                color: {Colors.SUCCESS};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #DosDont {{
                font-size: 13px;
                color: {Colors.ERROR};
                font-family: '{self.font_cn}', sans-serif;
            }}

            /* 温度 */
            #TempSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #TempConcept {{
                font-size: 28px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #TempDesc {{
                font-size: 14px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.8;
            }}

            /* 产品类型 */
            #TypesSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #TypeCard {{
                background-color: {Colors.BG_CARD};
                border-radius: 10px;
            }}

            #TypeIcon {{
                font-size: 24px;
                color: {Colors.MOOD_AWAKE};
            }}

            #TypeName {{
                font-size: 15px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #TypeEN {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            #TypeDesc {{
                font-size: 13px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.6;
            }}

            /* 命名体系 */
            #NamingSection {{
                background-color: {Colors.BG_CARD};
            }}

            #NamingRow {{
                background-color: {Colors.BG_DEEP};
                border-radius: 8px;
            }}

            #NamingNum {{
                font-size: 12px;
                color: {Colors.TEXT_DISABLED};
                font-family: {self.font_en}, serif;
            }}

            #NamingName {{
                font-size: 14px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #NamingFeeling {{
                font-size: 13px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #NamingTag {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
                background-color: {Colors.BG_SURFACE};
                padding: 4px 10px;
                border-radius: 12px;
            }}

            /* 原则 */
            #PrinciplesSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #PrincipleCard {{
                background-color: {Colors.BG_CARD};
                border-radius: 12px;
            }}

            #PrincipleIcon {{
                font-size: 40px;
                color: {Colors.MOOD_AWAKE};
            }}

            #PrincipleName {{
                font-size: 20px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #PrincipleEN {{
                font-size: 12px;
                color: {Colors.TEXT_MUTED};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            #PrincipleDesc {{
                font-size: 14px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                line-height: 1.7;
            }}

            /* 标语 */
            #SlogansSection {{
                background-color: {Colors.BG_CARD};
            }}

            #SloganMain {{
                font-size: 28px;
                color: {Colors.TEXT_PRIMARY};
                font-family: {self.font_en}, serif;
                font-style: italic;
            }}

            #SloganCN {{
                font-size: 16px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            /* 禁止语 */
            #DontsSection {{
                background-color: {Colors.BG_DEEP};
            }}

            #DontsDivider {{
                background-color: {Colors.BG_SURFACE};
            }}

            #DontsTitle {{
                font-size: 14px;
                font-weight: 500;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #DontsItem {{
                font-size: 14px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
                padding: 6px 0;
            }}

            #DontsItemDont {{
                font-size: 14px;
                color: {Colors.ERROR};
                font-family: '{self.font_cn}', sans-serif;
                padding: 6px 0;
            }}

            /* 色彩 */
            #ColorsSection {{
                background-color: {Colors.BG_CARD};
            }}

            #ColorsIntro {{
                font-size: 14px;
                color: {Colors.TEXT_SECONDARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #ColorCard {{
                background-color: {Colors.BG_DEEP};
                border-radius: 10px;
                min-width: 120px;
            }}

            #ColorName {{
                font-size: 14px;
                font-weight: 500;
                color: {Colors.TEXT_PRIMARY};
                font-family: '{self.font_cn}', sans-serif;
            }}

            #ColorHex {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: Consolas, monospace;
            }}

            #ColorDesc {{
                font-size: 11px;
                color: {Colors.TEXT_MUTED};
                font-family: '{self.font_cn}', sans-serif;
            }}
        """)

    def closeEvent(self, event):
        self.player.stop()
        log('closeEvent', {'event': 'close'})
        event.accept()


def main():
    app = QApplication(sys.argv)
    app.setApplicationName('Moodify')

    font = QFont()
    font.setFamily('Microsoft YaHei')
    app.setFont(font)

    log('main', {'event': 'start'})

    window = MoodifyApp()
    window.show()

    log('main', {'event': 'show'})

    sys.exit(app.exec_())


if __name__ == '__main__':
    main()
