# AI 英语口语陪练项目 - MVP 实施计划

## 一、项目概述

### 1.1 目标
在两天内用 AI (solocode) 完成一个可运行的 AI 英语口语陪练 MVP 版本。

### 1.2 核心功能
- 录音：用户按住按钮录音
- ASR：语音识别转文字
- LLM：AI 生成英语回复
- TTS：文字转语音播放
- 极简 UI：简单实用，无复杂样式

### 1.3 技术栈
**前端：**
- Vue 3 + Composition API
- Pinia（状态管理）
- Axios（HTTP 请求）
- 原生 MediaRecorder API（录音）
- 原生 Audio API（播放）

**后端：**
- Node.js + Express
- ws（WebSocket 库）
- Axios（HTTP 请求）
- dotenv（环境变量）

**第三方服务：**
- SiliconFlow API（ASR、LLM、TTS）

---

## 二、简化架构设计

### 2.1 架构图

```
┌─────────────┐
│  Vue Client │
│  (录音/播放) │
└──────┬──────┘
       │ WebSocket
       ▼
┌──────────────┐
│ Express + WS │
└──────┬───────┘
       │
       ├─→ ASR Service (SiliconFlow)
       ├─→ LLM Service (SiliconFlow)
       └─→ TTS Service (SiliconFlow)
```

### 2.2 文件结构（极简版）

```
项目根目录/
├── server/                    # 后端（12 个文件）
│   ├── index.js              # 入口文件
│   ├── config.js             # 配置
│   ├── ws.js                 # WebSocket 服务器
│   ├── services/
│   │   ├── asr.js           # ASR 服务
│   │   ├── llm.js           # LLM 服务
│   │   └── tts.js           # TTS 服务
│   ├── utils/
│   │   └── audio.js         # 音频工具
│   └── .env                 # 环境变量
│
└── src/                      # 前端（8 个文件）
    ├── main.js              # 入口
    ├── App.vue              # 根组件
    ├── api/
    │   └── ws.js            # WebSocket 客户端
    ├── store/
    │   └── chat.js          # 聊天状态
    ├── composables/
    │   ├── useRecorder.js   # 录音
    │   └── usePlayer.js     # 播放
    └── components/
        ├── VoiceButton.vue  # 录音按钮
        └── ChatPanel.vue    # 聊天面板
```

**总计：20 个文件**（原架构 55+ 个文件）

---

## 三、实施计划（两天）

### 第 1 天：后端开发（8-10 小时）

#### 上午（4 小时）
1. **项目初始化**（30 分钟）
   - 创建 server/ 目录
   - 初始化 package.json
   - 安装依赖：express, ws, axios, dotenv

2. **配置文件**（30 分钟）
   - [server/config.js](file:///server/config.js) - 配置管理
   - [server/.env](file:///server/.env) - 环境变量

3. **WebSocket 服务器**（1 小时）
   - [server/index.js](file:///server/index.js) - Express + WebSocket 服务器
   - [server/ws.js](file:///server/ws.js) - WebSocket 处理逻辑

4. **音频工具**（1 小时）
   - [server/utils/audio.js](file:///server/utils/audio.js) - 音频格式转换

#### 下午（4 小时）
5. **ASR 服务**（1 小时）
   - [server/services/asr.js](file:///server/services/asr.js) - 调用 SiliconFlow ASR API

6. **LLM 服务**（1.5 小时）
   - [server/services/llm.js](file:///server/services/llm.js) - 调用 SiliconFlow LLM API（流式）

7. **TTS 服务**（1 小时）
   - [server/services/tts.js](file:///server/services/tts.js) - 调用 SiliconFlow TTS API

8. **集成测试**（30 分钟）
   - 测试 WebSocket 连接
   - 测试 ASR → LLM → TTS 流程

---

### 第 2 天：前端开发（8-10 小时）

#### 上午（4 小时）
1. **项目初始化**（30 分钟）
   - 清理现有文件
   - 安装依赖：pinia, axios

2. **WebSocket 客户端**（1 小时）
   - [src/api/ws.js](file:///src/api/ws.js) - WebSocket 连接管理

3. **状态管理**（1 小时）
   - [src/store/chat.js](file:///src/store/chat.js) - Pinia Store

4. **录音功能**（1.5 小时）
   - [src/composables/useRecorder.js](file:///src/composables/useRecorder.js) - MediaRecorder API

#### 下午（4 小时）
5. **播放功能**（1 小时）
   - [src/composables/usePlayer.js](file:///src/composables/usePlayer.js) - Audio API

6. **UI 组件**（2 小时）
   - [src/components/VoiceButton.vue](file:///src/components/VoiceButton.vue) - 录音按钮
   - [src/components/ChatPanel.vue](file:///src/components/ChatPanel.vue) - 聊天面板
   - [src/App.vue](file:///src/App.vue) - 主页面

7. **集成测试**（1 小时）
   - 测试完整流程
   - 修复 bug
   - 优化体验

---

## 四、关键技术实现

### 4.1 WebSocket 消息协议

**客户端 → 服务端**
```javascript
// 发送音频
{
  type: 'audio',
  data: '<base64 audio>'
}

// 开始录音
{
  type: 'start'
}

// 停止录音
{
  type: 'stop'
}
```

**服务端 → 客户端**
```javascript
// 转录结果
{
  type: 'transcript',
  text: 'Hello'
}

// AI 回复（流式）
{
  type: 'llm',
  text: 'Hi there!',
  done: false
}

// 音频回复
{
  type: 'audio',
  data: '<base64 audio>'
}

// 错误
{
  type: 'error',
  message: 'ASR failed'
}
```

### 4.2 音频处理流程

```
用户录音 (WebM)
    ↓
前端：转 Base64 发送
    ↓
后端：转 Buffer
    ↓
ASR：识别文字
    ↓
LLM：生成回复
    ↓
TTS：生成音频
    ↓
后端：转 Base64 返回
    ↓
前端：播放音频
```

### 4.3 错误处理策略

- **网络错误**：前端提示"网络错误，请重试"
- **API 错误**：后端记录日志，返回友好错误信息
- **音频错误**：提示"录音失败，请检查麦克风权限"

---

## 五、文件清单与职责

### 5.1 后端文件（12 个）

| 文件 | 职责 | 预计代码行数 |
|------|------|------------|
| index.js | Express + WS 服务器入口 | 30 行 |
| config.js | 配置管理 | 20 行 |
| ws.js | WebSocket 消息处理 | 80 行 |
| services/asr.js | ASR API 调用 | 40 行 |
| services/llm.js | LLM API 调用 | 60 行 |
| services/tts.js | TTS API 调用 | 40 行 |
| utils/audio.js | 音频工具函数 | 30 行 |
| .env | 环境变量 | 5 行 |
| package.json | 依赖配置 | 20 行 |
| .gitignore | Git 忽略文件 | 10 行 |
| README.md | 项目说明 | 50 行 |
| test.http | API 测试文件 | 20 行 |

**总计：约 405 行代码**

### 5.2 前端文件（8 个）

| 文件 | 职责 | 预计代码行数 |
|------|------|------------|
| main.js | 入口文件 | 15 行 |
| App.vue | 根组件 | 50 行 |
| api/ws.js | WebSocket 客户端 | 60 行 |
| store/chat.js | Pinia Store | 60 行 |
| composables/useRecorder.js | 录音功能 | 80 行 |
| composables/usePlayer.js | 播放功能 | 40 行 |
| components/VoiceButton.vue | 录音按钮 | 60 行 |
| components/ChatPanel.vue | 聊天面板 | 80 行 |

**总计：约 445 行代码**

### 5.3 总代码量
- 后端：405 行
- 前端：445 行
- **总计：850 行代码**

---

## 六、风险控制

### 6.1 技术风险
- **SiliconFlow API 限制**：准备备用 API（如 OpenAI）
- **浏览器兼容性**：使用 Chrome 最新版测试
- **音频格式问题**：优先使用 WAV 格式

### 6.2 时间风险
- **第一天未完成后端**：削减 TTS 功能，只保留文字回复
- **第二天未完成前端**：使用更简单的 UI，减少动画

### 6.3 质量保证
- **每个模块完成后立即测试**
- **使用 console.log 调试**
- **保持代码简单，避免过度设计**

---

## 七、验收标准

### 7.1 功能验收
- [ ] 用户可以按住按钮录音
- [ ] 录音可以被识别为文字
- [ ] AI 可以生成英语回复
- [ ] 回复可以被转换为语音播放
- [ ] 聊天记录可以正常显示

### 7.2 技术验收
- [ ] 项目可以正常启动（npm run dev）
- [ ] 前后端可以正常通信
- [ ] 没有控制台错误
- [ ] 代码可以正常运行

### 7.3 体验验收
- [ ] 录音响应及时（< 2 秒）
- [ ] AI 回复流畅（< 5 秒）
- [ ] 界面简洁清晰
- [ ] 操作简单直观

---

## 八、后续优化方向

完成 MVP 后，可以考虑：
1. 增加语法纠错功能
2. 增加教师角色选择
3. 增加音色克隆功能
4. 优化 UI 设计
5. 增加动画效果
6. 增加历史记录
7. 增加用户设置

---

## 九、总结

### 9.1 简化要点
- 文件数量：55+ → 20（减少 64%）
- 代码行数：预计 2000+ → 850（减少 57%）
- 功能模块：7 个 → 4 个（减少 43%）

### 9.2 成功关键
1. **保持简单**：只实现核心功能
2. **快速迭代**：先跑通，再优化
3. **及时测试**：每个模块完成后立即测试
4. **灵活调整**：遇到问题及时调整方案

### 9.3 时间分配
- 第 1 天：后端开发（8-10 小时）
- 第 2 天：前端开发（8-10 小时）
- **总计：16-20 小时**

这个计划确保在两天内完成一个可运行的 MVP 版本。
