# 项目架构设计文档

## 一、整体架构

```
                     ┌───────────────┐
                     │  Vue Client   │
                     │ (录音/播放/UI)│
                     └───────┬───────┘
                             │ WebSocket (全双工)
                             ▼
                   ┌─────────────────────┐
                   │   Session Manager   │   ← 每个用户会话状态管理
                   └──────────┬──────────┘
                              │ 事件总线 (EventEmitter)
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ ASR Service│   │ LLM Service│   │ TTS Service│   ← 纯函数服务，无状态
    └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
          │                │                │
          ▼                ▼                ▼
    SenseVoiceSmall  DeepSeek-V3      FishSpeech
    (HTTP/SSE)       (Stream)         (HTTP/Stream)

           ┌──────────────────────────────┐
           │     Conversation Pipeline     │   ← 核心流水线
           │  ASR → LLM → Split → TTS     │
           └──────────────────────────────┘
```

---

## 二、后端架构

### 2.1 目录结构

```
server/
├── app.js                          # 主入口
├── config/                         # 配置管理
│   ├── index.js                    # 配置入口
│   └── siliconflow.js              # SiliconFlow API 配置
├── websocket/                      # WebSocket 模块
│   ├── wsServer.js                 # WebSocket 服务器初始化
│   ├── sessionManager.js           # 会话管理器
│   └── eventTypes.js               # WebSocket 事件类型定义
├── services/                       # 服务层（无状态）
│   ├── siliconflow/
│   │   └── client.js               # SiliconFlow API 客户端封装
│   ├── asr.service.js              # ASR 服务
│   ├── llm.service.js              # LLM 服务
│   ├── tts.service.js              # TTS 服务
│   └── grammar.service.js          # 语法纠错服务
├── pipeline/                       # 流水线
│   ├── speechPipeline.js           # 主流水线
│   ├── sentenceSplitter.js         # 句子分割器
│   └── audioQueue.js               # 音频缓冲队列
├── prompts/                        # Prompt 模板
│   └── teachers.js                 # AI 教师角色配置
├── middleware/                     # 中间件
│   ├── errorHandler.js             # 统一错误处理
│   └── logger.js                   # 日志中间件
├── utils/                          # 工具函数
│   ├── streamParser.js             # SSE 流解析
│   └── audioUtils.js               # 音频处理工具
├── types/                          # 类型定义（JSDoc）
│   ├── session.d.ts                # 会话类型
│   ├── message.d.ts                # 消息类型
│   └── audio.d.ts                  # 音频类型
└── uploads/                        # 上传文件存储
```

### 2.2 核心模块职责

#### 2.2.1 配置层 (config/)

**config/index.js**
- 加载环境变量
- 导出配置对象
- 配置验证

**config/siliconflow.js**
- API Key
- Base URL
- 模型配置
- 超时设置

#### 2.2.2 WebSocket 层 (websocket/)

**wsServer.js**
- 创建 WebSocket 服务器
- 心跳检测（30秒）
- 连接/断开处理
- 挂载 Session Manager

**sessionManager.js**
- 管理每个连接的会话状态
- 状态机：IDLE → LISTENING → PROCESSING → SPEAKING
- 持有当前 teacher、reference_audio
- 调用 Pipeline 处理请求

**eventTypes.js**
- 定义所有 WebSocket 事件类型
- 客户端 → 服务端事件
- 服务端 → 客户端事件

#### 2.2.3 服务层 (services/)

**siliconflow/client.js**
- 统一请求封装
- 鉴权处理
- 错误重试
- 响应解析

**asr.service.js**
- 调用 SenseVoiceSmall API
- 输入：音频 Buffer
- 输出：文本字符串

**llm.service.js**
- 调用 DeepSeek-V3 API
- 输入：消息数组 + system prompt
- 输出：AsyncGenerator（流式）

**tts.service.js**
- 调用 FishSpeech API
- 输入：文本 + reference_audio（可选）
- 输出：音频 Buffer 或 Stream

**grammar.service.js**
- 异步语法检查
- 输入：用户文本
- 输出：语法错误列表

#### 2.2.4 流水线层 (pipeline/)

**speechPipeline.js**
- 编排 ASR → LLM → Split → TTS 流程
- 使用 EventEmitter 解耦
- 错误处理和重试
- 超时控制

**sentenceSplitter.js**
- 流式切分 LLM 输出
- 按标点符号切分
- 支持中英文

**audioQueue.js**
- 音频缓冲管理
- 防止内存溢出
- 支持最大 10MB

#### 2.2.5 中间件层 (middleware/)

**errorHandler.js**
- 统一错误处理
- 错误分类（网络、API、业务）
- 返回友好错误信息

**logger.js**
- 请求日志
- 错误日志
- 性能日志

---

## 三、前端架构

### 3.1 目录结构

```
src/
├── main.js                         # 入口文件
├── App.vue                         # 根组件
├── router/                         # 路由
│   └── index.js                    # 路由配置
├── api/                            # API 层
│   ├── ws.js                       # WebSocket 管理器
│   ├── voice.js                    # 语音 API
│   └── config.js                   # API 配置
├── store/                          # Pinia 状态管理
│   ├── index.js                    # Store 入口
│   ├── chatStore.js                # 聊天状态
│   ├── teacherStore.js             # 教师状态
│   └── settingsStore.js            # 设置状态
├── composables/                    # 组合式函数
│   ├── useRecorder.js              # 录音 Hook
│   ├── usePlayer.js                # 播放 Hook
│   ├── useVoiceChat.js             # 语音聊天 Hook
│   └── useWebSocket.js             # WebSocket Hook
├── views/                          # 页面
│   ├── Home.vue                    # 主页
│   └── Settings.vue                # 设置页
├── components/                     # 组件
│   ├── ChatPanel.vue               # 聊天面板
│   ├── VoiceButton.vue             # 语音按钮
│   ├── TeacherSelector.vue         # 教师选择器
│   ├── GrammarBoard.vue            # 语法面板
│   ├── AudioWave.vue               # 音频波形
│   └── CloneVoiceDialog.vue        # 音色克隆对话框
├── constants/                      # 常量
│   ├── events.js                   # WebSocket 事件
│   ├── status.js                   # 状态枚举
│   └── messages.js                 # 提示消息
└── utils/                          # 工具函数
    ├── audioConverter.js           # 音频格式转换
    └── storage.js                  # 本地存储
```

### 3.2 核心模块职责

#### 3.2.1 API 层 (api/)

**ws.js**
- WebSocket 连接管理
- 自动重连（最多 5 次，指数退避）
- 心跳检测
- 事件订阅/发布

**voice.js**
- 语音相关 HTTP API
- 音色克隆上传

**config.js**
- API Base URL
- WebSocket URL
- 超时配置

#### 3.2.2 状态管理层 (store/)

**chatStore.js**
- 消息列表
- 录音/处理/播放状态
- 当前转录文本
- 错误状态

**teacherStore.js**
- 预设教师列表
- 当前选中教师
- 自定义声音列表

**settingsStore.js**
- 音量设置
- 语言设置
- 其他用户偏好

#### 3.2.3 组合式函数层 (composables/)

**useRecorder.js**
- MediaRecorder API 封装
- 音频采集
- 格式转换（WebM → WAV）
- 音量检测

**usePlayer.js**
- AudioContext 播放
- 音频队列管理
- 播放状态控制

**useVoiceChat.js**
- 整合 WebSocket + 录音 + 播放
- 状态机管理
- 错误处理

**useWebSocket.js**
- WebSocket 生命周期管理
- 消息发送/接收
- 连接状态

#### 3.2.4 组件层 (components/)

**ChatPanel.vue**
- 消息列表展示
- 滚动到底部
- 消息气泡样式

**VoiceButton.vue**
- 按住录音 / 点击切换
- 录音动画
- 状态提示

**TeacherSelector.vue**
- 教师卡片展示
- 选择交互
- 自定义声音入口

**GrammarBoard.vue**
- 语法错误展示
- 修正建议
- 高亮显示

**AudioWave.vue**
- 音频波形可视化
- 实时音量显示

**CloneVoiceDialog.vue**
- 上传音频样本
- 录制样本
- 预览和确认

---

## 四、数据流设计

### 4.1 语音对话流程

```
用户按下录音
    ↓
前端：开始录音，收集音频数据
    ↓
用户松开录音
    ↓
前端：停止录音，发送音频数据到后端
    ↓
后端：Session Manager 接收音频
    ↓
后端：调用 ASR Service 识别文本
    ↓
后端：返回转录文本到前端
    ↓
后端：调用 LLM Service 生成回复（流式）
    ↓
后端：Sentence Splitter 切分句子
    ↓
后端：对每个句子调用 TTS Service
    ↓
后端：流式返回音频到前端
    ↓
前端：播放音频，显示回复文本
```

### 4.2 WebSocket 事件定义

#### 客户端 → 服务端

```javascript
// 开始录音
{
  type: 'start_recording',
  payload: {
    teacherId: 'emma'
  }
}

// 发送音频数据
{
  type: 'audio_data',
  payload: {
    audio: '<base64 encoded audio>',
    format: 'webm'
  }
}

// 停止录音
{
  type: 'stop_recording'
}

// 切换教师
{
  type: 'switch_teacher',
  payload: {
    teacherId: 'james'
  }
}
```

#### 服务端 → 客户端

```javascript
// 转录结果
{
  type: 'transcript',
  payload: {
    text: 'Hello, how are you?',
    isFinal: true
  }
}

// LLM 回复（流式）
{
  type: 'llm_response',
  payload: {
    text: 'I am doing well, thank you!',
    isFinal: false
  }
}

// 音频回复
{
  type: 'audio_response',
  payload: {
    audio: '<base64 encoded audio>',
    format: 'wav',
    text: 'I am doing well, thank you!'
  }
}

// 错误
{
  type: 'error',
  payload: {
    code: 'ASR_ERROR',
    message: 'Speech recognition failed'
  }
}

// 状态更新
{
  type: 'status',
  payload: {
    state: 'processing'
  }
}
```

---

## 五、实现顺序建议

### 阶段 1：基础架构（第 1-2 天）

1. **后端基础**
   - 创建 server/app.js
   - 创建 config/ 配置
   - 创建 middleware/ 中间件
   - 创建 types/ 类型定义

2. **前端基础**
   - 创建 router/ 路由
   - 创建 constants/ 常量
   - 创建 utils/ 工具

### 阶段 2：WebSocket 通信（第 3-4 天）

1. **后端 WebSocket**
   - 实现 wsServer.js
   - 实现 sessionManager.js
   - 定义 eventTypes.js

2. **前端 WebSocket**
   - 实现 api/ws.js
   - 实现 useWebSocket.js
   - 测试连接和消息收发

### 阶段 3：服务层（第 5-7 天）

1. **后端服务**
   - 实现 siliconflow/client.js
   - 实现 asr.service.js
   - 实现 llm.service.js
   - 实现 tts.service.js

2. **独立测试**
   - 测试 ASR 服务
   - 测试 LLM 服务
   - 测试 TTS 服务

### 阶段 4：流水线（第 8-9 天）

1. **后端流水线**
   - 实现 sentenceSplitter.js
   - 实现 audioQueue.js
   - 实现 speechPipeline.js

2. **集成测试**
   - 测试完整流程
   - 测试错误处理

### 阶段 5：前端功能（第 10-12 天）

1. **录音和播放**
   - 实现 useRecorder.js
   - 实现 usePlayer.js
   - 实现 useVoiceChat.js

2. **状态管理**
   - 实现 chatStore.js
   - 实现 teacherStore.js
   - 实现 settingsStore.js

### 阶段 6：UI 组件（第 13-15 天）

1. **核心组件**
   - 实现 VoiceButton.vue
   - 实现 ChatPanel.vue
   - 实现 TeacherSelector.vue

2. **辅助组件**
   - 实现 AudioWave.vue
   - 实现 GrammarBoard.vue
   - 实现 CloneVoiceDialog.vue

### 阶段 7：集成和优化（第 16-18 天）

1. **页面集成**
   - 实现 Home.vue
   - 实现 Settings.vue
   - 整合所有组件

2. **优化和测试**
   - 性能优化
   - 错误处理完善
   - 端到端测试

---

## 六、关键技术点

### 6.1 音频处理

- 前端：WebM 格式录音，转 WAV 发送
- 后端：接收 WAV，直接传给 ASR
- TTS：返回 WAV 格式，前端直接播放

### 6.2 流式处理

- LLM：SSE 流式返回，逐字显示
- TTS：按句子切分，逐句合成和播放
- 音频：流式播放，边接收边播放

### 6.3 错误处理

- 网络错误：自动重连
- API 错误：友好提示，记录日志
- 业务错误：状态回退，允许重试

### 6.4 性能优化

- 音频压缩：减少传输量
- 缓冲管理：防止内存溢出
- 并发控制：限制同时处理的请求数

---

## 七、环境变量

```env
# SiliconFlow API
SILICONFLOW_API_KEY=your_api_key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1

# 服务器配置
PORT=3000
NODE_ENV=development

# WebSocket 配置
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_CONNECTIONS=100

# 音频配置
MAX_AUDIO_SIZE=10485760
AUDIO_SAMPLE_RATE=16000
```

---

## 八、依赖清单

### 后端依赖

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "dotenv": "^16.3.1",
    "eventemitter3": "^5.0.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 前端依赖

```json
{
  "dependencies": {
    "vue": "^3.3.8",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.0"
  }
}
```
