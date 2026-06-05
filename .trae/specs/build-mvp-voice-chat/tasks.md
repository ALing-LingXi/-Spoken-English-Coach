# Tasks

## 阶段 1：后端项目初始化

### Task 1: 创建后端目录结构 ✅
- [x] SubTask 1.1: 创建 server 目录
- [x] SubTask 1.2: 创建 server/services 目录
- [x] SubTask 1.3: 创建 server/utils 目录
- [x] SubTask 1.4: 验证目录结构创建成功

### Task 2: 创建 package.json ✅
- [x] SubTask 2.1: 创建 server/package.json 文件
- [x] SubTask 2.2: 添加项目名称、版本、描述
- [x] SubTask 2.3: 添加 scripts（start, dev）
- [x] SubTask 2.4: 添加 dependencies（express, ws, axios, dotenv）
- [x] SubTask 2.5: 验证 package.json 格式正确

### Task 3: 安装依赖 ✅
- [x] SubTask 3.1: 在 server 目录运行 npm install
- [x] SubTask 3.2: 验证 node_modules 目录创建成功
- [x] SubTask 3.3: 验证 package-lock.json 文件生成

### Task 4: 创建环境变量文件 ✅
- [x] SubTask 4.1: 创建 server/.env 文件（文件存在但内容为空）
- [x] SubTask 4.2: 添加 SILICONFLOW_API_KEY 变量
- [x] SubTask 4.3: 添加 PORT=3000 变量
- [x] SubTask 4.4: 创建 server/.gitignore 文件（文件存在但内容为空）
- [x] SubTask 4.5: 添加 .env 到 .gitignore
- [x] SubTask 4.6: 验证文件创建成功

### Task 5: 创建入口文件 ✅
- [x] SubTask 5.1: 创建 server/index.js 文件（文件存在但内容为空）
- [x] SubTask 5.2: 导入 express 模块
- [x] SubTask 5.3: 创建 express 应用
- [x] SubTask 5.4: 添加根路由 GET /
- [x] SubTask 5.5: 监听端口
- [x] SubTask 5.6: 添加启动日志
- [x] SubTask 5.7: 运行 node index.js 测试服务器启动
- [x] SubTask 5.8: 访问 http://localhost:3000 验证服务器运行

---

## 阶段 2：后端配置和工具模块

### Task 6: 创建配置模块 ✅
- [x] SubTask 6.1: 创建 server/config.js 文件（文件存在但内容为空）
- [x] SubTask 6.2: 导入 dotenv 模块
- [x] SubTask 6.3: 调用 dotenv.config()
- [x] SubTask 6.4: 导出 SILICONFLOW_API_KEY
- [x] SubTask 6.5: 导出 PORT（默认 3000）
- [x] SubTask 6.6: 导出 SILICONFLOW_BASE_URL
- [x] SubTask 6.7: 在 index.js 中导入 config 并打印配置验证

### Task 7: 创建音频工具 - base64ToBuffer ✅
- [x] SubTask 7.1: 创建 server/utils/audio.js 文件（文件存在但内容为空）
- [x] SubTask 7.2: 导出 base64ToBuffer 函数
- [x] SubTask 7.3: 实现 base64ToBuffer 函数（输入 base64 字符串，输出 Buffer）

### Task 8: 创建音频工具 - bufferToBase64 ✅
- [x] SubTask 8.1: 导出 bufferToBase64 函数
- [x] SubTask 8.2: 实现 bufferToBase64 函数（输入 Buffer，输出 base64 字符串）

### Task 9: 创建音频工具 - createWavHeader ✅
- [x] SubTask 9.1: 导出 createWavHeader 函数
- [x] SubTask 9.2: 实现 createWavHeader 函数（输入音频数据长度，输出 44 字节 WAV 头）

---

## 阶段 3：后端 ASR 服务

### Task 10: 创建 ASR 服务文件 ✅
- [x] SubTask 10.1: 创建 server/services/asr.js 文件（文件存在但内容为空）
- [x] SubTask 10.2: 导入 axios 模块
- [x] SubTask 10.3: 导入 config 模块
- [x] SubTask 10.4: 定义 SILICONFLOW_ASR_URL 常量

### Task 11: 实现 ASR API 调用函数 ✅
- [x] SubTask 11.1: 导出 recognizeSpeech 函数
- [x] SubTask 11.2: 定义函数签名（输入 audioBuffer，输出 text）
- [x] SubTask 11.3: 创建 FormData 对象
- [x] SubTask 11.4: 添加 audio 文件到 FormData
- [x] SubTask 11.5: 设置请求头（Authorization）
- [x] SubTask 11.6: 发送 POST 请求到 ASR API
- [x] SubTask 11.7: 解析 API 响应
- [x] SubTask 11.8: 提取识别的文字
- [x] SubTask 11.9: 返回文字结果

### Task 12: 实现 ASR 错误处理 ✅
- [x] SubTask 12.1: 添加 try-catch 包裹 API 调用
- [x] SubTask 12.2: 捕获网络错误
- [x] SubTask 12.3: 捕获 API 错误响应
- [x] SubTask 12.4: 打印错误日志
- [x] SubTask 12.5: 抛出错误或返回 null

---

## 阶段 4：后端 LLM 服务

### Task 13: 创建 LLM 服务文件 ✅
- [x] SubTask 13.1: 创建 server/services/llm.js 文件（文件存在但内容为空）
- [x] SubTask 13.2: 导入 axios 模块
- [x] SubTask 13.3: 导入 config 模块
- [x] SubTask 13.4: 定义 SILICONFLOW_LLM_URL 常量
- [x] SubTask 13.5: 定义默认 system prompt

### Task 14: 实现 LLM API 调用函数（非流式） ✅
- [x] SubTask 14.1: 导出 generateReply 函数
- [x] SubTask 14.2: 定义函数签名（输入 messages 数组，输出 text）
- [x] SubTask 14.3: 构建请求体（model, messages, stream: false）
- [x] SubTask 14.4: 设置请求头（Authorization, Content-Type）
- [x] SubTask 14.5: 发送 POST 请求到 LLM API
- [x] SubTask 14.6: 解析 API 响应
- [x] SubTask 14.7: 提取生成的文字
- [x] SubTask 14.8: 返回文字结果

### Task 15: 实现 LLM 流式返回 ✅
- [x] SubTask 15.1: 导出 generateReplyStream 函数
- [x] SubTask 15.2: 定义函数签名（输入 messages 数组，输出 AsyncGenerator）
- [x] SubTask 15.3: 构建请求体（model, messages, stream: true）
- [x] SubTask 15.4: 发送 POST 请求（responseType: 'stream'）
- [x] SubTask 15.5: 处理流式响应（SSE 格式）
- [x] SubTask 15.6: 解析每个 data: 行
- [x] SubTask 15.7: 提取增量文字
- [x] SubTask 15.8: yield 每个增量文字
- [x] SubTask 15.9: 处理 [DONE] 标记

### Task 16: 实现 LLM 错误处理 ✅
- [x] SubTask 16.1: 添加 try-catch 包裹 API 调用
- [x] SubTask 16.2: 捕获网络错误
- [x] SubTask 16.3: 捕获 API 错误响应
- [x] SubTask 16.4: 打印错误日志
- [x] SubTask 16.5: 抛出错误或返回 null

---

## 阶段 5：后端 TTS 服务

### Task 17: 创建 TTS 服务文件 ✅
- [x] SubTask 17.1: 创建 server/services/tts.js 文件（文件存在但内容为空）
- [x] SubTask 17.2: 导入 axios 模块
- [x] SubTask 17.3: 导入 config 模块
- [x] SubTask 17.4: 定义 SILICONFLOW_TTS_URL 常量

### Task 18: 实现 TTS API 调用函数 ✅
- [x] SubTask 18.1: 导出 synthesizeSpeech 函数
- [x] SubTask 18.2: 定义函数签名（输入 text，输出 audioBuffer）
- [x] SubTask 18.3: 构建请求体（model, input, voice）
- [x] SubTask 18.4: 设置请求头（Authorization, Content-Type）
- [x] SubTask 18.5: 发送 POST 请求（responseType: 'arraybuffer'）
- [x] SubTask 18.6: 将响应数据转换为 Buffer
- [x] SubTask 18.7: 返回音频 Buffer

### Task 19: 实现 TTS 错误处理 ✅
- [x] SubTask 19.1: 添加 try-catch 包裹 API 调用
- [x] SubTask 19.2: 捕获网络错误
- [x] SubTask 19.3: 捕获 API 错误响应
- [x] SubTask 19.4: 打印错误日志
- [x] SubTask 19.5: 抛出错误或返回 null

---

## 阶段 6：后端 WebSocket 服务器

### Task 20: 创建 WebSocket 服务器文件 ✅
- [x] SubTask 20.1: 创建 server/ws.js 文件（文件存在但内容为空）
- [x] SubTask 20.2: 导入 ws 模块
- [x] SubTask 20.3: 导入 WebSocketServer 类
- [x] SubTask 20.4: 导出 createWebSocketServer 函数

### Task 21: 初始化 WebSocket 服务器 ✅
- [x] SubTask 21.1: 实现 createWebSocketServer 函数
- [x] SubTask 21.2: 创建 WebSocketServer 实例（传入 server）
- [x] SubTask 21.3: 监听 connection 事件
- [x] SubTask 21.4: 打印客户端连接日志
- [x] SubTask 21.5: 在 index.js 中调用 createWebSocketServer
- [x] SubTask 21.6: 启动服务器验证 WebSocket 可以正常创建

### Task 22: 实现 WebSocket 连接处理 ✅
- [x] SubTask 22.1: 在 connection 回调中获取 ws 对象
- [x] SubTask 22.2: 监听 message 事件
- [x] SubTask 22.3: 监听 close 事件
- [x] SubTask 22.4: 监听 error 事件
- [x] SubTask 22.5: 打印客户端断开连接日志
- [x] SubTask 22.6: 打印错误日志

### Task 23: 实现 WebSocket 消息解析与路由 ✅
- [x] SubTask 23.1: 在 message 回调中解析 JSON 数据
- [x] SubTask 23.2: 提取 type 字段
- [x] SubTask 23.3: 根据 type 分发到不同处理函数
- [x] SubTask 23.4: 创建 sendMessage 辅助函数
- [x] SubTask 23.5: 实现 'audio' 类型处理
- [x] SubTask 23.6: 处理 JSON 解析错误

### Task 24: 实现 ASR → LLM → TTS 完整流程 ✅
- [x] SubTask 24.1: 在 'audio' 类型处理中提取音频数据
- [x] SubTask 24.2: 将 base64 音频转换为 Buffer
- [x] SubTask 24.3: 调用 ASR 服务识别文字
- [x] SubTask 24.4: 发送 'transcript' 消息返回识别结果
- [x] SubTask 24.5: 调用 LLM 服务生成回复（流式）
- [x] SubTask 24.6: 对每个增量文字发送 'llm_chunk' 消息
- [x] SubTask 24.7: 流结束后调用 TTS 服务
- [x] SubTask 24.8: 将 TTS 音频 Buffer 转换为 base64
- [x] SubTask 24.9: 发送 'audio' 消息返回音频数据
- [x] SubTask 24.10: 处理各环节错误

---

## 阶段 7：前端项目初始化

### Task 25: 前端项目配置 ✅
- [x] SubTask 25.1: 创建 package.json（Vue 3 + Pinia + Vite）
- [x] SubTask 25.2: 创建 vite.config.js（含 WebSocket 代理）
- [x] SubTask 25.3: 创建 index.html 入口文件

### Task 26: 安装前端依赖 ✅
- [x] SubTask 26.1: 在根目录运行 npm install
- [x] SubTask 26.2: 验证 node_modules 目录创建成功
- [x] SubTask 26.3: 验证 package.json 中添加了 pinia 依赖

### Task 27: 更新 main.js ✅
- [x] SubTask 27.1: 导入 createApp（文件存在但内容为空）
- [x] SubTask 27.2: 导入 createPinia
- [x] SubTask 27.3: 导入 App 组件
- [x] SubTask 27.4: 创建 Vue 应用
- [x] SubTask 27.5: 使用 Pinia 插件
- [x] SubTask 27.6: 挂载应用

---

## 阶段 8：前端 WebSocket 客户端

### Task 28: 创建 WebSocket 客户端 🔴
- [ ] SubTask 28.1: 创建 src/api/ws.js 文件（文件存在但内容为空）
- [ ] SubTask 28.2: 定义 WebSocket URL 常量
- [ ] SubTask 28.3: 导出 connectWebSocket 函数
- [ ] SubTask 28.4: 实现 WebSocket 事件处理（onopen, onmessage, onclose, onerror）
- [ ] SubTask 28.5: 导出 sendMessage 函数
- [ ] SubTask 28.6: 实现回调注册机制

---

## 阶段 9：前端状态管理

### Task 29: 创建 Pinia Store 🔴
- [ ] SubTask 29.1: 创建 src/store/chat.js 文件（文件存在但内容为空）
- [ ] SubTask 29.2: 定义 messages 状态
- [ ] SubTask 29.3: 定义 isConnected / isRecording / isProcessing / isPlaying 状态
- [ ] SubTask 29.4: 定义 error 状态
- [ ] SubTask 29.5: 实现 addMessage / setConnected / setRecording 等方法
- [ ] SubTask 29.6: 实现 setError / clearError 方法

---

## 阶段 10：前端录音功能

### Task 30: 创建录音 Hook 🔴
- [ ] SubTask 30.1: 创建 src/composables/useRecorder.js 文件（文件存在但内容为空）
- [ ] SubTask 30.2: 实现 requestPermission 函数（获取麦克风权限）
- [ ] SubTask 30.3: 实现 startRecording 函数
- [ ] SubTask 30.4: 实现 stopRecording 函数
- [ ] SubTask 30.5: 实现 blobToBase64 函数

---

## 阶段 11：前端播放功能

### Task 31: 创建播放 Hook 🔴
- [ ] SubTask 31.1: 创建 src/composables/usePlayer.js 文件（文件存在但内容为空）
- [ ] SubTask 31.2: 实现 playAudio 函数
- [ ] SubTask 31.3: 实现播放队列（addToQueue, clearQueue）

---

## 阶段 12：前端 UI 组件

### Task 32: 创建录音按钮组件 🔴
- [ ] SubTask 32.1: 创建 src/components/VoiceButton.vue 文件（文件存在但内容为空）
- [ ] SubTask 32.2: 实现按住录音交互（mousedown/mouseup, touchstart/touchend）
- [ ] SubTask 32.3: 添加极简样式

### Task 33: 创建聊天面板组件 🔴
- [ ] SubTask 33.1: 创建 src/components/ChatPanel.vue 文件（文件存在但内容为空）
- [ ] SubTask 33.2: 使用 v-for 遍历 messages 显示对话记录
- [ ] SubTask 33.3: 区分用户和 AI 消息样式
- [ ] SubTask 33.4: 添加极简样式

### Task 34: 创建 App.vue 主页面 🔴
- [ ] SubTask 34.1: 更新 src/App.vue 文件（文件存在但内容为空）
- [ ] SubTask 34.2: 添加 ChatPanel 组件
- [ ] SubTask 34.3: 添加 VoiceButton 组件
- [ ] SubTask 34.4: 显示连接状态和错误信息
- [ ] SubTask 34.5: 在 onMounted 中连接 WebSocket
- [ ] SubTask 34.6: 注册 WebSocket 消息回调
- [ ] SubTask 34.7: 实现 handleStart / handleStop 函数
- [ ] SubTask 34.8: 实现 handleTranscript / handleLLMChunk / handleAudio 回调
- [ ] SubTask 34.9: 添加极简布局样式

---

## 阶段 13：集成测试

### Task 35: 后端集成测试
- [ ] SubTask 35.1: 启动后端服务器
- [ ] SubTask 35.2: 验证服务器启动无错误
- [ ] SubTask 35.3: 验证 WebSocket 服务器创建成功

### Task 36: 前端集成测试
- [ ] SubTask 36.1: 启动前端开发服务器
- [ ] SubTask 36.2: 验证前端启动无错误
- [ ] SubTask 36.3: 验证 WebSocket 连接成功

### Task 37: 端到端测试
- [ ] SubTask 37.1: 同时启动前后端服务器
- [ ] SubTask 37.2: 按住录音按钮录音
- [ ] SubTask 37.3: 验证显示识别的文字
- [ ] SubTask 37.4: 验证显示 AI 回复
- [ ] SubTask 37.5: 验证播放 AI 音频

---

# 当前状态总结

## ✅ 已完成（23 项）
| Task | 说明 |
|------|------|
| Task 1 | 后端目录结构 |
| Task 2 | server/package.json |
| Task 3 | 安装后端依赖 |
| Task 4 | 创建 .env 和 .gitignore |
| Task 5 | 创建入口文件 index.js |
| Task 6 | 创建配置模块 config.js |
| Task 7 | 音频工具 - base64ToBuffer |
| Task 8 | 音频工具 - bufferToBase64 |
| Task 9 | 音频工具 createWavHeader |
| Task 10 | ASR 服务文件 asr.js |
| Task 11 | ASR API 调用函数 recognizeSpeech |
| Task 12 | ASR 错误处理 |
| Task 13 | 创建 LLM 服务文件 |
| Task 14 | LLM API 调用函数 generateReply |
| Task 15 | LLM 流式返回 generateReplyStream |
| Task 16 | LLM 错误处理 |
| Task 17 | TTS 服务文件 tts.js |
| Task 18 | TTS API 调用函数 synthesizeSpeech |
| Task 19 | TTS 错误处理 |
| Task 20 | WebSocket 服务器文件 ws.js |
| Task 21 | 初始化 WebSocket 服务器 |
| Task 22 | WebSocket 连接处理 |
| Task 23 | WebSocket 消息解析与路由 |
| Task 24 | ASR → LLM → TTS 完整流程 |
| Task 25 | 前端项目配置（package.json, vite.config.js, index.html）|
| Task 26 | 安装前端依赖 |
| Task 27 | 更新 main.js |

## 🔴 需要完成（11 项）
| Task | 说明 | 文件状态 |
|------|------|----------|
| Task 28 | WebSocket 客户端 ws.js | 文件存在但内容为空 |
| Task 29 | Pinia Store chat.js | 文件存在但内容为空 |
| Task 30 | 录音 Hook useRecorder.js | 文件存在但内容为空 |
| Task 31 | 播放 Hook usePlayer.js | 文件存在但内容为空 |
| Task 32 | 录音按钮 VoiceButton.vue | 文件存在但内容为空 |
| Task 33 | 聊天面板 ChatPanel.vue | 文件存在但内容为空 |
| Task 34 | 主页面 App.vue | 文件存在但内容为空 |
| Task 35 | 后端集成测试 | 未开始 |
| Task 36 | 前端集成测试 | 未开始 |
| Task 37 | 端到端测试 | 未开始 |

---

# Task Dependencies

## 严格串行依赖（必须按顺序执行）

### 后端依赖链
- Task 3 → Task 4-5（需要依赖安装）
- Task 5-6 → Task 7-9（需要入口和配置）
- Task 7-9 → Task 10-12（需要音频工具）
- Task 6 → Task 13-16, Task 17-19（需要配置模块）
- Task 10-19 → Task 20-24（需要所有服务完成）

### 前端依赖链
- Task 26 → Task 27（需要依赖安装）
- Task 27 → Task 28-31（需要 main.js）
- Task 28-31 → Task 32-34（需要 Store 和 Hooks）

## 可并行执行的任务

### 后端可并行
- Task 7-9（音频工具函数独立）
- Task 10-12, Task 13-16, Task 17-19（三个服务独立）

### 前端可并行
- Task 28, Task 29, Task 30, Task 31（四个模块独立）
- Task 32, Task 33（两个组件独立）
