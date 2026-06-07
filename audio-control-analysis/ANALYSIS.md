# 声音控制代码分析文档

## 文件结构

```
audio-control-analysis/
├── usePlayer.js        # 前端音频播放控制
├── useRecorder.js      # 前端录音控制
├── SettingsPanel.vue   # 声音设置面板（音色选择）
├── tts.js              # 后端 TTS 语音合成服务
├── asr.js              # 后端 ASR 语音识别服务
└── ws-audio-handler.js # WebSocket 音频消息处理
```

---

## 1. 前端音频播放 - usePlayer.js

**核心功能**：管理音频播放、队列、打断

### 关键方法

| 方法 | 作用 | 参数 | 返回值 |
|------|------|------|--------|
| `playAudio(base64)` | 播放单个音频 | `base64`: 音频 base64 字符串 | Promise |
| `addToQueue(base64)` | 添加到播放队列 | `base64`: 音频 base64 字符串 | void |
| `stop()` | 停止播放并清空队列 | 无 | void |
| `interrupt()` | 停止当前播放但保留队列 | 无 | void |

### 状态

- `isPlaying`: 是否正在播放
- `queue`: 音频队列数组
- `currentAudio`: 当前播放的 Audio 对象

---

## 2. 前端录音 - useRecorder.js

**核心功能**：麦克风录音、波形数据采集

### 关键方法

| 方法 | 作用 | 参数 | 返回值 |
|------|------|------|--------|
| `startRecording()` | 开始录音 | 无 | Promise |
| `stopRecording()` | 停止录音 | 无 | Promise(base64) |
| `requestPermission()` | 请求麦克风权限 | 无 | Promise(boolean) |

### 状态

- `isRecording`: 是否正在录音
- `waveformData`: 实时波形数据 (Uint8Array)

### 波形数据流程

```
麦克风 → MediaStream → AudioContext → AnalyserNode → getByteFrequencyData → waveformData
```

---

## 3. 声音设置面板 - SettingsPanel.vue

**核心功能**：音色选择、语速调整

### 设置项

| 设置项 | 类型 | 默认值 | 可选值 |
|--------|------|--------|--------|
| `voice` | string | 'xiaoyun' | xiaoyun, xiaoyu, xiaoxiao, xiaofeng, xiaomei, xiaoshuai, xiaoyan, xiaolong |
| `speed` | number | 1.0 | 0.5-2.0 |

### 数据流

```
用户选择音色 → localStorage 持久化 → emit('change', settings) → App.vue → sendMessage('setting', settings) → 后端 ws.settings
```

---

## 4. 后端 TTS 服务 - tts.js

**核心功能**：调用 SiliconFlow TTS API

### 关键函数

```javascript
async function synthesizeSpeech(text, voice = "xiaoyun")
```

### API 参数

| 参数 | 说明 |
|------|------|
| `model` | FunAudioLLM/CosyVoice2-0.5B |
| `voice` | FunAudioLLM/CosyVoice2-0.5B:{voice} |
| `response_format` | mp3 |
| `stream` | false |

### 返回值

- `Buffer`: 音频数据 Buffer
- `null`: 失败时返回

---

## 5. 后端 ASR 服务 - asr.js

**核心功能**：调用 SiliconFlow ASR API

### 关键函数

```javascript
async function recognizeSpeech(audioBuffer)
```

### API 参数

| 参数 | 说明 |
|------|------|
| `model` | funasr-wenetspeech-paraformer-large |
| `audio` | base64 编码的音频 |
| `response_format` | json |

---

## 6. WebSocket 音频处理 - ws-audio-handler.js

**核心功能**：音频消息路由和处理流程

### 音频处理流程

```
客户端发送 audio 消息
        ↓
┌─────────────────────────────┐
│ 1. base64 转 Buffer         │
├─────────────────────────────┤
│ 2. ASR 识别语音 → transcript │
├─────────────────────────────┤
│ 3. LLM 流式生成回复          │
│    → llm_chunk (逐段)       │
├─────────────────────────────┤
│ 4. 解析纠错标记 → correction │
├─────────────────────────────┤
│ 5. 解析评分标记 → score      │
├─────────────────────────────┤
│ 6. TTS 合成语音 → audio     │
└─────────────────────────────┘
        ↓
客户端接收消息并播放
```

### 设置处理

```javascript
case "setting":
  ws.settings = { ...ws.settings, ...data };
  // ws.settings = { difficulty, voice, scene }
```

---

## 完整数据流图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          前端 (Browser)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SettingsPanel ── voice ──► localStorage ──► sendMessage('setting')     │
│        │                                      │                          │
│        │                                      ▼                          │
│        │                              ┌──────────────┐                   │
│        │                              │   WebSocket  │                   │
│        │                              └──────┬───────┘                   │
│        ▼                                     │                          │
│  VoiceButton ── startRecording ──► useRecorder                          │
│        │                                     │                          │
│        │                                     ▼                          │
│        │                              waveformData                        │
│        │                                     │                          │
│        │                                     ▼                          │
│        │                              stopRecording ──► base64          │
│        │                                     │                          │
│        │                                     ▼                          │
│        │                              sendMessage('audio')               │
│        │                                     │                          │
│        ▼                                     ▼                          │
│  ChatPanel ◄─────── usePlayer ◄─────── audio (播放)                     │
│      │                                          │                        │
│      │                                          ▼                        │
│      │                                    addToQueue / playAudio         │
│      ▼                                                                   │
│  messages (UI 渲染)                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      │ WebSocket
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          后端 (Node.js)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ws.on('message') ──► routeMessage                                      │
│        │                                                                 │
│        ├── audio ──► handleAudio                                         │
│        │       │                                                         │
│        │       ├── recognizeSpeech (asr.js)                              │
│        │       ├── generateReplyStream (llm.js)                          │
│        │       └── synthesizeSpeech (tts.js)                             │
│        │                                                                 │
│        └── setting ──► ws.settings = { voice, difficulty, scene }        │
│                                                                         │
│  synthesizeSpeech(text, voice)                                          │
│        │                                                                 │
│        └── axios.post(SILICONFLOW_TTS_URL, {                            │
│              model: "FunAudioLLM/CosyVoice2-0.5B",                      │
│              voice: `FunAudioLLM/CosyVoice2-0.5B:${voice}`,             │
│              ...                                                         │
│          })                                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 音色名称对应表

| 前端 value | API 音色名称 | 描述 |
|------------|--------------|------|
| xiaoyun | Xiaoyun | 标准女声 |
| xiaoyu | Xiaoyu | 标准男声 |
| xiaoxiao | Xiaoxiao | 温柔女声 |
| xiaofeng | Xiaofeng | 成熟男声 |
| xiaomei | Xiaomei | 甜美女声 |
| xiaoshuai | Xiaoshuai | 阳光男声 |
| xiaoyan | Xiaoyan | 亲切女声 |
| xiaolong | Xiaolong | 硬朗男声 |

---

## 常见问题排查

### 问题1：切换音色后声音不变

**排查步骤**：

1. 检查前端是否发送了 `setting` 消息
2. 检查后端 `ws.settings.voice` 是否更新
3. 检查 `synthesizeSpeech` 调用时是否使用了正确的 voice 参数
4. 检查控制台日志是否有错误

### 问题2：录音时波形不显示

**排查步骤**：

1. 检查麦克风权限是否已授权
2. 检查 `waveformData` 是否有数据
3. 检查 Canvas 渲染逻辑

### 问题3：音频播放失败

**排查步骤**：

1. 检查 base64 格式是否正确
2. 检查音频类型是否正确 (audio/mp3)
3. 检查浏览器控制台是否有错误

---

## 代码优化建议

### 1. 音色验证

```javascript
// 在 tts.js 中添加音色验证
const VALID_VOICES = ['xiaoyun', 'xiaoyu', 'xiaoxiao', 'xiaofeng', 'xiaomei', 'xiaoshuai', 'xiaoyan', 'xiaolong'];

function validateVoice(voice) {
  return VALID_VOICES.includes(voice) ? voice : 'xiaoyun';
}
```

### 2. 错误处理增强

```javascript
// 在 usePlayer.js 中添加错误处理
audio.onerror = (e) => {
  console.error('Audio playback error:', e);
  isPlaying.value = false;
  // 尝试播放下一个
  playNext();
};
```

### 3. 设置缓存优化

```javascript
// 在 SettingsPanel.vue 中优化 localStorage 操作
function saveSetting(key, value) {
  try {
    localStorage.setItem(`setting_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save setting:', key);
  }
}
```
