

<div align="center">

# EnglishMate

**AI 驱动的英语口语陪练助手**

自然开口说，即时纠错，稳步提升英语口语

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883.svg)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg)](https://nodejs.org/)

</div>

***

## 为什么做 EnglishMate？

练口语最难的是——课本不会回话，语伴不是随时有空。EnglishMate 给你一个**全天候在线的 AI 对话伙伴**：它听你说、用语音回复、实时纠正语法、给出发音评分。按住说话，就这么简单。

## 功能特性

- **语音对话** — 按住说话，AI 用自然语音回复，支持随时打断
- **实时语法纠错** — AI 检测语法错误，以金色标注内联展示纠正内容
- **发音评分** — 每次回复 1-5 星评分 + 文字反馈，追踪进步
- **4 大练习场景** — 日常闲聊、商务英语、旅行英语、面试模拟，每个场景定制 Prompt
- **3 档难度** — 初级 / 中级 / 高级，AI 自动调整词汇和句式复杂度
- **流式 LLM 回复** — 实时看到 AI 逐字输出，无需等待完整生成
- **多种 TTS 音色** — 男声 / 女声可选
- **多对话管理** — 新建、切换、删除对话，聊天记录 localStorage 持久化
- **深色毛玻璃 UI** — 现代感暗色主题，模糊背景 + 流畅动画
- **WebSocket 实时通信** — 低延迟双向通信，心跳保活 + 断线自动重连

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                       浏览器 (Vue 3)                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  侧边栏   │  │  聊天区   │  │  右侧面板  │  │  语音按钮   │  │
│  │ 对话列表   │  │ 消息列表   │  │   设置     │  │  环形频谱   │  │
│  │ 场景切换   │  │  输入框   │  │   关于     │  │   录音      │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│         │            │              │              │          │
│  ┌──────┴────────────┴──────────────┴──────────────┐        │
│  │              Pinia 状态管理 (chat.ts)              │        │
│  │    消息 · 对话列表 · 设置 · 交互状态               │        │
│  └──────────────────────┬───────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────┐        │
│  │            WebSocket 客户端 (ws.ts)                │        │
│  │     心跳 · 重连 · 消息路由                          │        │
│  └──────────────────────┬───────────────────────────┘        │
│                         │  WebSocket (JSON + Base64 音频)     │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                   Node.js 服务端                               │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────┐        │
│  │            WebSocket 服务端 (ws.js)                │        │
│  │   路由: audio / text / interrupt / setting / scene  │        │
│  └──┬──────────┬──────────────┬──────────────┬───────┘        │
│     │          │              │              │                │
│  ┌──┴───┐  ┌──┴───┐  ┌──────┴─────┐  ┌────┴─────┐         │
│  │ ASR  │  │ LLM  │  │   评分      │  │   TTS    │         │
│  │      │  │      │  │            │  │          │         │
│  │Sense │  │Qwen  │  │  解析 &    │  │CosyVoice │         │
│  │Voice │  │2.5-7B│  │  评估      │  │  2-0.5B  │         │
│  └──┬───┘  └──┬───┘  └──────┬─────┘  └────┬─────┘         │
│     │         │              │              │                │
│  ┌──┴─────────┴──────────────┴──────────────┴───────────┐   │
│  │              SiliconFlow API（统一平台）                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 架构设计决策

### 为什么用 WebSocket 而不是 HTTP REST？

口语对话要求低延迟和双向通信。一次语音交互涉及 4 个串行 API 调用（ASR → LLM 流式 → 评分 → TTS）。WebSocket 保持一条持久连接，省去每次交互的 HTTP 握手开销，同时支持**服务端推送** LLM 流式片段和实时打断。

### 为什么用 Base64 传输音频而不是二进制帧？

项目所有 WebSocket 通信统一使用 JSON 格式（`{ type, data }`）。将音频编码为 Base64 嵌入 JSON，保持协议**统一简洁**——一种消息格式、一个解析器。约 33% 的体积开销对短语音（通常 < 100KB）可以接受，同时简化了 Vite 开发代理的配置。

### 为什么所有 AI 服务都用 SiliconFlow？

SiliconFlow 在**一个 API Key 和一个 Base URL** 下提供 ASR（SenseVoice）、LLM（Qwen）和 TTS（CosyVoice）。大幅简化配置和部署——无需管理 3 个不同供应商的凭证。同时国内节点延迟低，对国内用户友好。

### 为什么用 Pinia + localStorage 持久化？

Pinia 提供简洁的响应式状态管理和 TypeScript 支持。localStorage 持久化让对话在页面刷新后不丢失，无需数据库。作为 MVP，这避免了后端存储的复杂度，同时保证了良好的用户体验。

### 为什么用 LLM 评分而不是 ASR 置信度？

大多数 ASR API（包括 SenseVoice）不返回逐词置信度分数。我们利用 LLM 本身来评估用户的英语表达质量——它能从语法、词汇、连贯性等维度综合评估，提供比原始置信度更有意义的反馈。

## 技术栈

| 层级     | 技术                  | 用途                  |
| ------ | ------------------- | ------------------- |
| 前端     | Vue 3 + TypeScript  | 响应式 UI 框架           |
| 状态管理   | Pinia               | 集中式状态管理             |
| UI 组件库 | Element Plus        | 滑块、开关、单选等组件         |
| 构建工具   | Vite                | 快速开发服务器 + WS 代理     |
| 后端     | Express + ws        | HTTP + WebSocket 服务 |
| 语音识别   | SenseVoice Small    | 语音转文字               |
| 大语言模型  | Qwen2.5-7B-Instruct | 对话 + 纠错 + 评分        |
| 语音合成   | CosyVoice2-0.5B     | 文字转语音               |
| API 平台 | SiliconFlow         | 统一 AI 服务提供商         |

## 数据流

一次典型的语音交互流程：

```
用户按住说话
      │
      ▼
┌─ 浏览器 ──────────────────────────────────────┐
│  MediaRecorder → Base64 音频 → WebSocket 发送   │
└───────────────────────┬────────────────────────┘
                        │
┌─ 服务端 ──────────────┼────────────────────────┐
│                       ▼                         │
│  1. ASR：音频 → 识别文字                          │
│     ── ws.send("transcript") ──► 浏览器展示      │
│                       │                         │
│  2. LLM：流式生成回复                              │
│     ── ws.send("llm_chunk") ──► 浏览器逐字追加   │
│                       │                         │
│  3. 解析：提取 [纠错] 和 [评分] 标记               │
│     ── ws.send("correction") ──► 浏览器展示纠错  │
│     ── ws.send("score") ──► 浏览器展示评分       │
│                       │                         │
│  4. TTS：清理后文本 → 音频                         │
│     ── ws.send("audio") ──► 浏览器播放           │
└─────────────────────────────────────────────────┘
```

## 快速开始

### 环境要求

- Node.js >= 18
- 一个 [SiliconFlow](https://siliconflow.cn/) API Key

### 1. 克隆 & 安装

```bash
git clone https://github.com/your-username/-Spoken-English-Coach.git
cd -Spoken-English-Coach

# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 2. 配置 API Key

创建 `server/.env`：

```env
SILICONFLOW_API_KEY=你的API密钥
PORT=3000
```

### 3. 启动开发

```bash
# 终端 1：启动后端
cd server && npm run dev

# 终端 2：启动前端
npm run dev
```

浏览器打开 `http://localhost:5173`。

### 4. 生产构建

```bash
npm run build          # 构建前端
cd server && npm start # 启动后端
```

## 项目结构

```
├── src/                          # 前端 (Vue 3 + TypeScript)
│   ├── api/
│   │   └── ws.ts                 # WebSocket 客户端（重连 + 心跳）
│   ├── components/
│   │   ├── ChatArea.vue          # 消息列表 + 流式回复展示
│   │   ├── ChatPanel.vue        # 聊天面板容器
│   │   ├── MessageInput.vue      # 文字输入 + 语音按钮
│   │   ├── RightPanel.vue        # 侧滑设置 & 关于面板
│   │   ├── SceneSelector.vue     # 场景选择器（日常/商务/旅行/面试）
│   │   ├── SettingsPanel.vue     # 音色、难度、纠错、评分设置
│   │   ├── Sidebar.vue           # 对话列表 + 场景切换 + 连接状态
│   │   └── VoiceButton.vue       # 按住说话按钮 + 环形频谱动画
│   ├── composables/
│   │   ├── usePlayer.ts          # 音频播放队列（支持打断）
│   │   └── useRecorder.ts        # 麦克风录音 + 波形分析
│   ├── store/
│   │   └── chat.ts               # Pinia 状态：消息、对话、交互状态
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── App.vue                   # 根组件（布局 + 事件编排）
│   └── main.ts                   # 应用入口
│
├── server/                       # 后端 (Node.js + Express)
│   ├── services/
│   │   ├── asr.js                # 语音识别（SenseVoice）
│   │   ├── llm.js                # LLM 流式调用（Qwen2.5-7B）+ Prompt 工程
│   │   ├── scoring.js            # 评分解析 & 评分 Prompt 生成
│   │   └── tts.js                # 语音合成（CosyVoice2）
│   ├── utils/
│   │   ├── audio.js              # Base64/Buffer 转换 + WAV 头生成
│   │   └── retry.js              # 指数退避重试工具
│   ├── config.js                 # 环境配置
│   ├── ws.js                     # WebSocket 服务端 + 消息路由
│   └── index.js                  # Express + WebSocket 服务入口
│
├── vite.config.ts                # Vite 配置（含 WS 代理）
├── package.json                  # 前端依赖
└── LICENSE                       # MIT 许可证
```

## 核心实现细节

### 打断机制

用户在 AI 播放期间按下语音按钮，客户端发送 `interrupt` 消息。服务端设置 `ws.interrupted = true`，在流水线的每个阶段（ASR 完成后、每个 LLM chunk 后、TTS 调用前）检查该标记，确保流水线干净地停止，不会产生孤立的 API 调用。

### 流式 LLM + 纠错评分

LLM 被 Prompt 指示在回复中嵌入 `[纠错]...[/纠错]` 和 `[评分]X分：评语[/评分]` 标记。流式输出完成后，服务端解析这些标记，作为独立的 WebSocket 消息发送给前端，并在 TTS 前从文本中剥离——确保语音只播报对话内容，不会读出纠错和评分标记。

### 音频管道

- **录音**：MediaRecorder 采集 WebM 音频 → Base64 → 通过 WebSocket 发送
- **播放**：服务端返回 MP3 Base64 → 解码为 Blob → HTMLAudioElement 播放，支持队列管理
- **波形**：Web Audio API AnalyserNode 提供实时频率数据，驱动环形频谱可视化

### 容错机制

- **服务端**：所有 SiliconFlow API 调用使用指数退避重试（1s → 2s → 4s），仅对网络错误和 5xx 重试
- **客户端**：WebSocket 断线自动重连，指数退避（最多 10 次），30s 心跳 + 10s 超时检测

## 许可证

[MIT](LICENSE) © 2026 林希
