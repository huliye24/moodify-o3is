# NodeNet 方法论

> 软件开发的本质，是对结构进行分形拆解，使所有改动收敛到最小单元，从而实现系统稳定与可演化。

---

## 一、核心定义

**NodeNet** = Node（节点）+ Network（网络）

- **Node**：最小的结构单元，每个 Node 有明确的输入、处理、输出
- **Network**：由多个 Node 组成的结构树，上层 Node 组合下层 Node

```
Moodify (Root)
└── UI层 (结构稳定)
    └── Page: 歌词创作
        └── Section: 创作面板
            └── Component: 参数选择器
                └── Node: useParams (逻辑)
    └── Page: 情绪播放
        └── Section: 播放控制
            └── Node: useMoodPlayer (逻辑)
```

---

## 二、三层结构模型

### L1 — 结构层（UI Layer）: LOCKED

**职责**：定义"是什么"，不定义"怎么做"

- 文件：`src/components/*.tsx`
- 规则：**结构不可修改**，只能改样式
- 目的：UI 永远稳定，不因功能变化而崩溃

### L2 — 逻辑层（Node Layer）: LOGIC_ONLY

**职责**：定义"怎么做"

- 文件：`src/hooks/*.ts`, `src/stores/*.ts`
- 规则：**只改逻辑，不改接口**
- 约束：每个 Node 有固定输入输出，禁止跨 Node 修改

### L3 — 配置层（Flow Layer）: CONFIG_DRIVEN

**职责**：定义"用什么配置"

- 文件：`ports.json`, `.nodesplit.json`
- 规则：**配置驱动，不硬编码**
- 目的：改流程不改代码

---

## 三、分形拆分原则

### 拆分标准

一个 Node 满足以下全部条件时，才应该被拆分：

1. 有**独立的输入**（明确的入参）
2. 有**独立的输出**（明确的返回值）
3. 可以**独立测试**（不依赖其他 Node 的内部实现）
4. 有**明确的边界**（不跨文件修改）

### 拆分收益

```
❌ 不拆分：
  MainContent.tsx
  ├── 1000行
  └── 改一处 → 全文件风险

✅ 拆分后：
  MainContent.tsx (结构)
  ├── useProject.ts (项目逻辑)
  ├── useO3ics.ts (歌词逻辑)
  ├── useRules.ts (规则逻辑)
  └── useDice.ts (骰子逻辑)
  └── 改一处 → 只影响对应Node
```

---

## 四、人机协作范式

### 核心分工

| 角色 | 职责 | 范围 |
|------|------|------|
| 人 | 结构设计 | L1 (决定有哪些Node) |
| AI | 逻辑实现 | L2 (实现Node内部) |
| 配置 | 参数驱动 | L3 (JSON配置) |

### AI 提示词规范

**修改逻辑时**：
```
修改 {Node名称} 的 process() 逻辑
输入：{明确的入参}
输出：{明确的返回值}
不要修改其他文件，不要修改组件结构
```

**新增功能时**：
```
在 src/hooks/ 下创建 {功能名}.ts
遵循 Node 规范：input() → process() → output()
不要修改现有组件的 JSX 结构
```

**修改样式时**：
```
只修改 src/index.css 中的颜色和样式
不要修改组件的 HTML 结构
```

---

## 五、防崩策略

### 规则 1：结构锁定
- L1 层组件的 JSX 结构、props 接口**永久锁定**
- 除非用户明确要求，否则不修改

### 规则 2：单节点修改
- 一次只修改一个 Node
- 不跨 Node 写逻辑

### 规则 3：接口不变
- Node 的输入输出接口保持稳定
- 改内部实现不影响调用方

### 规则 4：错误隔离
- 单个 Node 崩溃不影响其他 Node
- UI 层永远可用

---

## 六、Moodify Node 映射

| Node 名称 | 文件路径 | 输入 | 输出 |
|-----------|----------|------|------|
| useProject | src/hooks/useProject.ts | 项目名称 | 项目列表 |
| useO3ics | src/hooks/useO3ics.ts | 创作内容+参数 | 歌词数据 |
| useRules | src/hooks/useRules.ts | 选中的规则 | 规则列表 |
| useDice | src/hooks/useDice.ts | 无 | 骰子结果 |
| useMoodPlayer | src/hooks/useMoodPlayer.ts | 情绪类型 | 播放状态 |
| useLibrary | src/stores/useLibraryStore.ts | 扫描路径 | 音乐列表 |

---

## 七、演进路径

### 阶段 1：结构固化（当前）
- 确立 L1/L2/L3 三层分离
- 编写 NODESPLIT_RULES.md
- 所有 Node 映射到文件

### 阶段 2：Node 可视化
- 类似 ComfyUI 的节点编辑器
- 人通过拖拽定义结构
- AI 通过拖入生成逻辑

### 阶段 3：Node 市场
- 预制 Node 库
- 一键导入第三方 Node
- Node 版本管理

---

## 八、一句话总结

> **人负责切分结构，AI 负责填充细节，所有改动收敛到叶子节点。**