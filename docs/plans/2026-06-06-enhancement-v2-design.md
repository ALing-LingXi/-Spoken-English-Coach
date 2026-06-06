# AI 英语陪练增强设计说明

## 背景与目标

当前项目是一个 AI 英语口语陪练应用，核心流程（录音→ASR→LLM→TTS→播放）已跑通，但存在多个 Bug 和体验问题。目标是：

1. **修复现有 Bug**，确保核心流程稳定
2. **UI 重构为 ChatGPT 风格桌面端布局**，同时支持文字和语音对话，视觉精致美观
3. **新增用户系统 + 学习进度**（本地存储）
4. **新增词库 + 生词本**功能

## 现状与约束

### 技术栈
- 前端：Vue 3 + Pinia + Element Plus + Vite
- 后端：Node.js + Express + ws + axios
- API：SiliconFlow（ASR: SenseVoiceSmall, LLM: Qwen2.5-7B, TTS: CosyVoice2-0.5B）
- 通信：WebSocket（JSON 消息 + base64 音频）
- 存储：前端 localStorage（无后端数据库）

### 已知 Bug
1. 录音/播放状态不同步（composable 与 Store 各自维护）
2. `form-data` 依赖缺失（asr.js 引用但未声明）
3. TTS voice 参数传参链路断裂（前端设置无法传到后端）
4. SceneSelector 不响应外部 modelValue 变化
5. App.vue `currentAiText` 用普通 let 变量，与 Store 流式回复逻辑并存

### 约束
- 不引入后端数据库，数据全部存 localStorage
- 保持 WebSocket 通信架构不变
- 保持 SiliconFlow API 不变

## 方案对比

### 方案一：最小增量（推荐）
- 分 3 阶段渐进推进：Bug 修复 + UI 重构 → 用户系统 → 词库
- 每阶段独立可交付
- 不改动后端核心架构

### 方案二：大重构
- 同时做 TypeScript 迁移 + 工程化 + 新功能
- 改动面大，周期长

### 方案三：仅修 Bug + 轻量词库
- 最快见效，但功能单薄

## 推荐方案

**方案一：最小增量**，分 3 阶段推进，每阶段可独立运行和验证。

## 详细设计

### Phase 1：Bug 修复 + UI 重构

#### 1.1 状态同步修复

**问题**：`useRecorder` 和 `usePlayer` 各自维护 `isRecording`/`isPlaying` ref，Store 中也有同名状态但从未被设置，VoiceButton 读 Store 值始终为 false。

**修复方案**：
- composable 不再内部维护 `isRecording`/`isPlaying`
- 录音/播放状态变更直接写入 Store（`store.setRecording(true/false)`、`store.setPlaying(true/false)`）
- composable 仍返回频谱数据 `frequencyData` 等内部状态
- App.vue 删除 `let currentAiText`，统一用 Store 的 `startReply/appendReply/finishReply`

#### 1.2 依赖与参数修复

- `server/package.json` 添加 `"form-data": "^4.0.0"`
- 修复 TTS voice 传参链路：前端 setting 消息 → 后端 ws.settings.voice → synthesizeSpeech(text, voice)
- SettingsPanel 音色列表补全为 8 种（alex/benjamin/charles/david/anna/bella/claire/diana）
- SceneSelector 添加 `watch(() => props.modelValue)` 响应外部变化

#### 1.3 后端新增文字消息路由

当前后端只处理 `audio` 类型消息，需新增 `text` 类型：

```js
// server/ws.js routeMessage 新增
case 'text':
  handleText(ws, data?.text, data?.messages)
  break
```

`handleText` 与 `handleAudio` 类似，但跳过 ASR 步骤，直接进入 LLM → TTS 流程。

#### 1.4 UI 重构为 ChatGPT 风格

##### 布局结构

```
┌─────────────────────────────────────────────────────────┐
│  顶栏：Logo + 应用名 + 连接状态指示灯 + 设置图标         │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  左侧栏   │      主聊天区域               │   右侧面板     │
│  240px   │      flex-1                  │   320px       │
│          │                              │  可折叠        │
│  · 新对话  │  ┌──────────────────────┐   │               │
│  · 对话1   │  │ AI 消息气泡           │   │  设置面板      │
│  · 对话2   │  │   纠错标注            │   │  生词本        │
│  · ...    │  │   评分星级            │   │  学习统计      │
│          │  ├──────────────────────┤   │               │
│  场景切换  │  │ 用户消息气泡          │   │               │
│  · 日常   │  └──────────────────────┘   │               │
│  · 商务   │                              │               │
│  · 旅行   │  ┌──────────────────────┐   │               │
│  · 面试   │  │ 文字输入框  🎤语音按钮 │   │               │
│          │  └──────────────────────┘   │               │
├──────────┴──────────────────────────────┴───────────────┤
```

##### 视觉设计规范

**配色方案**：深色主题 + 暖色点缀
- 背景：`#1a1a2e`（深蓝黑）→ `#16213e`（深蓝）
- 侧边栏：`#0f3460`（深蓝）带半透明毛玻璃
- 消息区背景：`#1a1a2e` 带微弱网格纹理
- AI 气泡：`#2a2a4a` 带左侧 3px 渐变边框（`#e94560` → `#f5a623`）
- 用户气泡：`#e94560`（珊瑚红）带微弱发光
- 强调色：`#e94560`（珊瑚红）、`#f5a623`（琥珀金）
- 文字：`#eaeaea`（主文字）、`#8b8b9e`（次要文字）

**字体**：
- 英文对话：`'Inter', 'Segoe UI', sans-serif`
- 中文 UI：`'PingFang SC', 'Microsoft YaHei', sans-serif`
- 代码/评分：`'JetBrains Mono', monospace`

**动效**：
- 消息出现：`fadeInUp` 0.3s ease-out
- 侧边栏展开/折叠：`slideIn` 0.25s ease
- 语音按钮：录音时脉冲发光动画（`box-shadow` 呼吸灯）
- 流式回复：打字机效果 + 光标闪烁
- 场景切换：淡入淡出 0.2s

**组件细节**：
- 左侧栏对话列表项：hover 时微弱高亮 + 左侧 2px 强调色条
- 输入框：圆角 12px，聚焦时边框渐变发光
- 语音按钮：圆形 48px，录音时红色脉冲 + 波形可视化
- 设置面板：右侧抽屉，毛玻璃背景 `backdrop-filter: blur(20px)`
- 连接状态：绿色/红色小圆点 + 呼吸灯动画

##### 新增/修改组件

| 组件 | 说明 |
|------|------|
| `App.vue` | 重写为三栏布局 |
| `Sidebar.vue` | 新增：左侧栏（对话列表 + 场景切换） |
| `ChatArea.vue` | 新增：主聊天区域（消息列表 + 输入区） |
| `MessageInput.vue` | 新增：底部输入区（文字框 + 语音按钮） |
| `RightPanel.vue` | 新增：右侧可折叠面板（设置/词库/统计） |
| `ChatPanel.vue` | 修改：消息气泡样式升级 |
| `VoiceButton.vue` | 修改：适配新布局，缩小为输入框旁按钮 |
| `SceneSelector.vue` | 修改：移入左侧栏底部 |
| `SettingsPanel.vue` | 修改：移入右侧面板 |

##### 文字输入交互

- 输入框支持多行（`textarea` 自动增高，最大 4 行）
- Enter 发送，Shift+Enter 换行
- 发送后清空输入框
- 文字消息通过 WebSocket `text` 类型发送
- 后端收到 `text` 类型后跳过 ASR，直接进入 LLM → TTS 流程

### Phase 2：用户系统 + 学习进度

#### 2.1 用户档案 Store

`src/store/user.js`：
- `profile`：`{ nickname, avatar, createdAt }`
- `updateProfile(nickname, avatar)`：更新档案
- localStorage 持久化（key: `user_profile`）

#### 2.2 学习进度 Store

`src/store/progress.js`：
- `dailyStats`：`{ date, conversationCount, totalDuration, avgScore, wordsLearned }`
- `streakDays`：连续学习天数
- `weeklyData`：最近 7 天统计数组
- `recordConversation(duration, score)`：记录一次对话
- localStorage 持久化（key: `learning_progress`）

#### 2.3 新增组件

| 组件 | 说明 |
|------|------|
| `UserProfile.vue` | 个人中心：昵称编辑、头像选择、注册日期 |
| `LearningStats.vue` | 学习统计：7天趋势图、连续天数、总时长 |
| `StreakBadge.vue` | 连续学习徽章 |

#### 2.4 数据采集

- 每次对话结束时自动记录：时长（从录音开始到播放结束）、评分（从 Store 的 lastScore）
- 切换场景时不重置统计
- 页面加载时检查连续天数（对比 localStorage 中的最后活跃日期）

### Phase 3：词库 + 生词本

#### 3.1 生词本 Store

`src/store/vocabulary.js`：
- `words`：`[{ id, word, meaning, example, scene, addedAt }]`
- `addWord(word, meaning, example, scene)`：添加生词
- `removeWord(id)`：删除生词
- `getWordsByScene(scene)`：按场景筛选
- `searchWord(keyword)`：搜索
- localStorage 持久化（key: `vocabulary_words`）

#### 3.2 关键词提取

- LLM system prompt 中增加指令：在回复末尾用 `[词汇]word1, word2[/词汇]` 标记关键词
- 后端 `scoring.js` 新增 `parseVocabulary()` 和 `removeVocabularyFromReply()` 函数
- 前端收到 `vocabulary` 类型消息后，在消息气泡下方显示可收藏的单词标签

#### 3.3 新增组件

| 组件 | 说明 |
|------|------|
| `WordBook.vue` | 生词本面板（右侧栏展示）：列表 + 搜索 + 场景筛选 |
| `WordCard.vue` | 单词卡片：英文 + 中文释义 + 例句 + 收藏按钮 |
| `WordTag.vue` | 消息中的单词标签：点击可收藏/查看释义 |

#### 3.4 WebSocket 协议扩展

新增消息类型：
- 服务端→客户端：`vocabulary` `{ words: [{word, meaning, example}] }`

## 异常与边界处理

- localStorage 满：捕获 `QuotaExceededError`，提示用户清理旧数据
- 生词重复：添加前检查是否已存在
- 语音按钮权限拒绝：显示友好提示，引导用户授权
- 文字输入空消息：禁止发送
- 长时间无对话：统计中显示 0，不崩溃

## 测试策略

- Phase 1：手动验证录音/播放状态同步、音色切换、文字输入、UI 布局响应式
- Phase 2：验证 localStorage 读写、连续天数计算、统计图表渲染
- Phase 3：验证生词收藏/删除、关键词提取、搜索筛选

## 风险与待确认项

1. **localStorage 5MB 限制**：生词本 + 学习数据 + 对话历史可能接近上限，需监控
2. **LLM 关键词提取准确度**：依赖 prompt 工程，可能需要调优
3. **TTS 音色实际效果**：8 种音色需逐一测试，部分音色可能不适合英语场景
4. **桌面端响应式**：需考虑 1024px 以下屏幕的布局适配（左侧栏可折叠）
