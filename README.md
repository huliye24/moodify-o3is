# Moodify - 虚拟人物情绪歌词生成器

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置 API Key

复制 `.env.example` 为 `.env`，然后填入你的 DeepSeek API Key：

```bash
copy .env.example .env
```

然后编辑 `.env` 文件，将 `your_api_key_here` 替换为你的实际 API Key。

### 3. 运行应用

```bash
cd c:\Users\Administrator\Desktop\moodify
streamlit run app.py
```

## 功能

- 创建和管理虚拟人物（性格、背景故事、音乐风格偏好）
- 设置人物当前情绪状态
- 基于人物设定和情绪生成歌词
- 支持手动编辑和导出歌词

## 项目结构

```
moodify/
├── app.py              # Streamlit 主界面
├── character.py        # 虚拟人物管理
├── o3ics_generator.py # DeepSeek API 歌词生成
├── storage.py          # 数据持久化
├── .env                # 环境变量（API Key）
├── .env.example        # 环境变量模板
└── requirements.txt    # Python 依赖
```

## 获取 DeepSeek API Key

1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 将生成的 Key 填入 `.env` 文件

## 使用说明

1. 首次运行会自动创建 `data` 目录和示例人物
2. 在左侧面板创建/选择虚拟人物
3. 设置人物的当前情绪
4. 点击"生成歌词"按钮
5. 生成的歌词可手动编辑，点击按钮复制

## 技术栈

- **前端**: Streamlit
- **AI**: DeepSeek API (deepseek-chat)
- **存储**: 本地 JSON 文件
