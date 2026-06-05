# Tasks

## 阶段 1：后端项目初始化

### Task 1: 创建后端目录结构
- [x] SubTask 1.1: 创建 server 目录
- [x] SubTask 1.2: 创建 server/services 目录
- [x] SubTask 1.3: 创建 server/utils 目录
- [x] SubTask 1.4: 验证目录结构创建成功

### Task 2: 创建 package.json
- [x] SubTask 2.1: 创建 server/package.json 文件
- [x] SubTask 2.2: 添加项目名称、版本、描述
- [x] SubTask 2.3: 添加 scripts（start, dev）
- [x] SubTask 2.4: 添加 dependencies（express, ws, axios, dotenv）
- [x] SubTask 2.5: 验证 package.json 格式正确

### Task 3: 安装依赖
- [x] SubTask 3.1: 在 server 目录运行 npm install
- [x] SubTask 3.2: 验证 node_modules 目录创建成功
- [x] SubTask 3.3: 验证 package-lock.json 文件生成

### Task 4: 创建环境变量文件
- [ ] SubTask 4.1: 创建 server/.env 文件
- [ ] SubTask 4.2: 添加 SILICONFLOW_API_KEY 变量
- [ ] SubTask 4.3: 添加 PORT=3000 变量
- [ ] SubTask 4.4: 创建 server/.gitignore 文件
- [ ] SubTask 4.5: 添加 .env 到 .gitignore
- [ ] SubTask 4.6: 验证文件创建成功

### Task 5: 创建入口文件
- [ ] SubTask 5.1: 创建 server/index.js 文件
- [ ] SubTask 5.2: 导入 express 模块
- [ ] SubTask 5.3: 创建 express 应用
- [ ] SubTask 5.4: 添加根路由 GET /
- [ ] SubTask 5.5: 监听端口
- [ ] SubTask 5.6: 添加启动日志
- [ ] SubTask 5.7: 运行 node index.js 测试服务器启动
- [ ] SubTask 5.8: 访问 http://localhost:3000 验证服务器运行

---

## 阶段 2：后端配置和工具模块

### Task 6: 创建配置模块
- [x] SubTask 6.1: 创建 server/config.js 文件
- [x] SubTask 6.2: 导入 dotenv 模块
- [x] SubTask 6.3: 调用 dotenv.config()
- [x] SubTask 6.4: 导出 SILICONFLOW_API_KEY
- [x] SubTask 6.5: 导出 PORT（默认 3000）
- [x] SubTask 6.6: 导出 SILICONFLOW_BASE_URL
- [x] SubTask 6.7: 在 index.js 中导入 config 并打印配置验证

### Task 7: 创建音频工具 - base64ToBuffer
- [x] SubTask 7.1: 创建 server/utils/audio.js 文件
- [x] SubTask 7.2: 导出 base64ToBuffer 函数
- [x] SubTask 7.3: 实现 base64ToBuffer 函数（输入 base64 字符串，输出 Buffer）
- [x] SubTask 7.4: 创建测试文件 server/test-audio.js
- [x] SubTask 7.5: 测试 base64ToBuffer 函数
- [x] SubTask 7.6: 验证输出是 Buffer 类型

### Task 8: 创建音频工具 - bufferToBase64
- [ ] SubTask 8.1: 导出 bufferToBase64 函数
- [ ] SubTask 8.2: 实现 bufferToBase64 函数（输入 Buffer，输出 base64 字符串）
- [ ] SubTask 8.3: 在 test-audio.js 中测试 bufferToBase64 函数
- [ ] SubTask 8.4: 验证输出是字符串类型
- [ ] SubTask 8.5: 验证 base64ToBuffer 和 bufferToBase64 可以互相转换

### Task 9: 创建音频工具 - createWavHeader
- [ ] SubTask 9.1: 导出 createWavHeader 函数
- [ ] SubTask 9.2: 实现 createWavHeader 函数（输入音频数据长度，输出 44 字节 WAV 头）
- [ ] SubTask 9.3: 在 test-audio.js 中测试 createWavHeader 函数
- [ ] SubTask 9.4: 验证输出长度是 44 字节
- [ ] SubTask 9.5: 验证 WAV 头格式正确（RIFF, WAVE, fmt, data）

---

## 阶段 3：后端 ASR 服务

### Task 10: 创建 ASR 服务文件
- [ ] SubTask 10.1: 创建 server/services/asr.js 文件
- [ ] SubTask 10.2: 导入 axios 模块
- [ ] SubTask 10.3: 导入 config 模块
- [ ] SubTask 10.4: 定义 SILICONFLOW_ASR_URL 常量

### Task 11: 实现 ASR API 调用函数
- [ ] SubTask 11.1: 导出 recognizeSpeech 函数
- [ ] SubTask 11.2: 定义函数签名（输入 audioBuffer，输出 text）
- [ ] SubTask 11.3: 创建 FormData 对象
- [ ] SubTask 11.4: 添加 audio 文件到 FormData
- [ ] SubTask 11.5: 设置请求头（Authorization）
- [ ] SubTask 11.6: 发送 POST 请求到 ASR API
- [ ] SubTask 11.7: 解析 API 响应
- [ ] SubTask 11.8: 提取识别的文字
- [ ] SubTask 11.9: 返回文字结果

### Task 12: 实现 ASR 错误处理
- [ ] SubTask 12.1: 添加 try-catch 包裹 API 调用
- [ ] SubTask 12.2: 捕获网络错误
- [ ] SubTask 12.3: 捕获 API 错误响应
- [ ] SubTask 12.4: 打印错误日志
- [ ] SubTask 12.5: 抛出错误或返回 null

### Task 13: 测试 ASR 服务
- [ ] SubTask 13.1: 创建 server/test-asr.js 文件
- [ ] SubTask 13.2: 创建一个测试音频 Buffer（可以是空 Buffer）
- [ ] SubTask 13.3: 调用 recognizeSpeech 函数
- [ ] SubTask 13.4: 打印结果验证函数可以正常调用
- [ ] SubTask 13.5: 验证错误处理可以正常工作

---

## 阶段 4：后端 LLM 服务

### Task 14: 创建 LLM 服务文件
- [ ] SubTask 14.1: 创建 server/services/llm.js 文件
- [ ] SubTask 14.2: 导入 axios 模块
- [ ] SubTask 14.3: 导入 config 模块
- [ ] SubTask 14.4: 定义 SILICONFLOW_LLM_URL 常量
- [ ] SubTask 14.5: 定义默认 system prompt

### Task 15: 实现 LLM API 调用函数（非流式）
- [ ] SubTask 15.1: 导出 generateReply 函数
- [ ] SubTask 15.2: 定义函数签名（输入 messages 数组，输出 text）
- [ ] SubTask 15.3: 构建请求体（model, messages, stream: false）
- [ ] SubTask 15.4: 设置请求头（Authorization, Content-Type）
- [ ] SubTask 15.5: 发送 POST 请求到 LLM API
- [ ] SubTask 15.6: 解析 API 响应
- [ ] SubTask 15.7: 提取生成的文字
- [ ] SubTask 15.8: 返回文字结果

### Task 16: 实现 LLM 流式返回
- [ ] SubTask 16.1: 导出 generateReplyStream 函数
- [ ] SubTask 16.2: 定义函数签名（输入 messages 数组，输出 AsyncGenerator）
- [ ] SubTask 16.3: 构建请求体（model, messages, stream: true）
- [ ] SubTask 16.4: 发送 POST 请求（responseType: 'stream'）
- [ ] SubTask 16.5: 处理流式响应（SSE 格式）
- [ ] SubTask 16.6: 解析每个 data: 行
- [ ] SubTask 16.7: 提取增量文字
- [ ] SubTask 16.8: yield 每个增量文字
- [ ] SubTask 16.9: 处理 [DONE] 标记

### Task 17: 实现 LLM 错误处理
- [ ] SubTask 17.1: 添加 try-catch 包裹 API 调用
- [ ] SubTask 17.2: 捕获网络错误
- [ ] SubTask 17.3: 捕获 API 错误响应
- [ ] SubTask 17.4: 打印错误日志
- [ ] SubTask 17.5: 抛出错误或返回 null

### Task 18: 测试 LLM 服务
- [ ] SubTask 18.1: 创建 server/test-llm.js 文件
- [ ] SubTask 18.2: 创建测试 messages 数组
- [ ] SubTask 18.3: 调用 generateReply 函数
- [ ] SubTask 18.4: 打印结果验证函数可以正常调用
- [ ] SubTask 18.5: 调用 generateReplyStream 函数
- [ ] SubTask 18.6: 验证流式返回可以正常工作
- [ ] SubTask 18.7: 验证错误处理可以正常工作

---

## 阶段 5：后端 TTS 服务

### Task 19: 创建 TTS 服务文件
- [ ] SubTask 19.1: 创建 server/services/tts.js 文件
- [ ] SubTask 19.2: 导入 axios 模块
- [ ] SubTask 19.3: 导入 config 模块
- [ ] SubTask 19.4: 定义 SILICONFLOW_TTS_URL 常量

### Task 20: 实现 TTS API 调用函数
- [ ] SubTask 20.1: 导出 synthesizeSpeech 函数
- [ ] SubTask 20.2: 定义函数签名（输入 text，输出 audioBuffer）
- [ ] SubTask 20.3: 构建请求体（model, input, voice）
- [ ] SubTask 20.4: 设置请求头（Authorization, Content-Type）
- [ ] SubTask 20.5: 发送 POST 请求（responseType: 'arraybuffer'）
- [ ] SubTask 20.6: 将响应数据转换为 Buffer
- [ ] SubTask 20.7: 返回音频 Buffer

### Task 21: 实现 TTS 错误处理
- [ ] SubTask 21.1: 添加 try-catch 包裹 API 调用
- [ ] SubTask 21.2: 捕获网络错误
- [ ] SubTask 21.3: 捕获 API 错误响应
- [ ] SubTask 21.4: 打印错误日志
- [ ] SubTask 21.5: 抛出错误或返回 null

### Task 22: 测试 TTS 服务
- [ ] SubTask 22.1: 创建 server/test-tts.js 文件
- [ ] SubTask 22.2: 创建测试文字
- [ ] SubTask 22.3: 调用 synthesizeSpeech 函数
- [ ] SubTask 22.4: 打印结果验证函数可以正常调用
- [ ] SubTask 22.5: 验证输出是 Buffer 类型
- [ ] SubTask 22.6: 验证错误处理可以正常工作

---

## 阶段 6：后端 WebSocket 服务器

### Task 23: 创建 WebSocket 服务器文件
- [ ] SubTask 23.1: 创建 server/ws.js 文件
- [ ] SubTask 23.2: 导入 ws 模块
- [ ] SubTask 23.3: 导入 WebSocketServer 类
- [ ] SubTask 23.4: 导出 createWebSocketServer 函数

### Task 24: 初始化 WebSocket 服务器
- [ ] SubTask 24.1: 实现 createWebSocketServer 函数
- [ ] SubTask 24.2: 创建 WebSocketServer 实例（传入 server）
- [ ] SubTask 24.3: 监听 connection 事件
- [ ] SubTask 24.4: 打印客户端连接日志
- [ ] SubTask 24.5: 在 index.js 中调用 createWebSocketServer
- [ ] SubTask 24.6: 启动服务器验证 WebSocket 可以正常创建

### Task 25: 实现 WebSocket 连接处理
- [ ] SubTask 25.1: 在 connection 回调中获取 ws 对象
- [ ] SubTask 25.2: 监听 message 事件
- [ ] SubTask 25.3: 监听 close 事件
- [ ] SubTask 25.4: 监听 error 事件
- [ ] SubTask 25.5: 打印客户端断开连接日志
- [ ] SubTask 25.6: 打印错误日志

### Task 26: 实现 WebSocket 消息解析
- [ ] SubTask 26.1: 在 message 回调中解析 JSON 数据
- [ ] SubTask 26.2: 提取 type 字段
- [ ] SubTask 26.3: 提取 payload 字段
- [ ] SubTask 26.4: 打印接收到的消息日志
- [ ] SubTask 26.5: 处理 JSON 解析错误

### Task 27: 实现 WebSocket 消息发送
- [ ] SubTask 27.1: 创建 sendMessage 函数
- [ ] SubTask 27.2: 定义函数签名（输入 ws, type, payload）
- [ ] SubTask 27.3: 构建消息对象（type, payload）
- [ ] SubTask 27.4: 转换为 JSON 字符串
- [ ] SubTask 27.5: 调用 ws.send 发送消息
- [ ] SubTask 27.6: 打印发送消息日志

### Task 28: 实现 WebSocket 消息路由
- [ ] SubTask 28.1: 创建 handleMessage 函数
- [ ] SubTask 28.2: 根据 type 分发到不同处理函数
- [ ] SubTask 28.3: 实现 'audio' 类型处理
- [ ] SubTask 28.4: 实现 'start' 类型处理
- [ ] SubTask 28.5: 实现 'stop' 类型处理
- [ ] SubTask 28.6: 实现未知类型处理（返回错误）

### Task 29: 实现 ASR 处理流程
- [ ] SubTask 29.1: 在 'audio' 类型处理中提取音频数据
- [ ] SubTask 29.2: 将 base64 音频转换为 Buffer
- [ ] SubTask 29.3: 调用 ASR 服务识别文字
- [ ] SubTask 29.4: 发送 'transcript' 消息返回识别结果
- [ ] SubTask 29.5: 处理 ASR 错误

### Task 30: 实现 LLM 处理流程
- [ ] SubTask 30.1: 创建对话历史数组（存储在 ws 对象上）
- [ ] SubTask 30.2: 将用户消息添加到历史
- [ ] SubTask 30.3: 调用 LLM 服务生成回复（流式）
- [ ] SubTask 30.4: 对每个增量文字发送 'llm_chunk' 消息
- [ ] SubTask 30.5: 流结束后发送 'llm_done' 消息
- [ ] SubTask 30.6: 将 AI 回复添加到历史
- [ ] SubTask 30.7: 处理 LLM 错误

### Task 31: 实现 TTS 处理流程
- [ ] SubTask 31.1: 在 LLM 流结束后调用 TTS 服务
- [ ] SubTask 31.2: 传入完整的 AI 回复文字
- [ ] SubTask 31.3: 获取音频 Buffer
- [ ] SubTask 31.4: 将 Buffer 转换为 base64
- [ ] SubTask 31.5: 发送 'audio' 消息返回音频数据
- [ ] SubTask 31.6: 处理 TTS 错误

### Task 32: 测试 WebSocket 服务器
- [ ] SubTask 32.1: 创建 server/test-ws.html 文件
- [ ] SubTask 32.2: 创建 WebSocket 客户端连接
- [ ] SubTask 32.3: 测试连接成功
- [ ] SubTask 32.4: 测试发送 'start' 消息
- [ ] SubTask 32.5: 测试发送 'audio' 消息
- [ ] SubTask 32.6: 测试接收 'transcript' 消息
- [ ] SubTask 32.7: 测试接收 'llm_chunk' 消息
- [ ] SubTask 32.8: 测试接收 'audio' 消息
- [ ] SubTask 32.9: 测试错误处理

---

## 阶段 7：前端项目初始化

### Task 33: 清理前端项目
- [ ] SubTask 33.1: 删除 src/components/HelloWorld.vue
- [ ] SubTask 33.2: 删除 src/components/TheWelcome.vue
- [ ] SubTask 33.3: 删除 src/components/WelcomeItem.vue
- [ ] SubTask 33.4: 删除 src/components/icons 目录
- [ ] SubTask 33.5: 删除 src/assets/logo.svg
- [ ] SubTask 33.6: 验证清理完成

### Task 34: 安装前端依赖
- [ ] SubTask 34.1: 运行 npm install pinia
- [ ] SubTask 34.2: 验证 package.json 中添加了 pinia 依赖
- [ ] SubTask 34.3: 验证 node_modules 中存在 pinia

### Task 35: 更新 main.js
- [ ] SubTask 35.1: 导入 createApp
- [ ] SubTask 35.2: 导入 createPinia
- [ ] SubTask 35.3: 导入 App 组件
- [ ] SubTask 35.4: 创建 Vue 应用
- [ ] SubTask 35.5: 使用 Pinia 插件
- [ ] SubTask 35.6: 挂载应用
- [ ] SubTask 35.7: 启动前端验证无错误

---

## 阶段 8：前端 WebSocket 客户端

### Task 36: 创建 WebSocket 客户端文件
- [ ] SubTask 36.1: 创建 src/api 目录
- [ ] SubTask 36.2: 创建 src/api/ws.js 文件
- [ ] SubTask 36.3: 定义 WebSocket URL 常量

### Task 37: 实现 WebSocket 连接函数
- [ ] SubTask 37.1: 导出 connectWebSocket 函数
- [ ] SubTask 37.2: 创建 WebSocket 实例
- [ ] SubTask 37.3: 返回 WebSocket 实例
- [ ] SubTask 37.4: 打印连接日志

### Task 38: 实现 WebSocket 事件处理
- [ ] SubTask 38.1: 监听 onopen 事件
- [ ] SubTask 38.2: 打印连接成功日志
- [ ] SubTask 38.3: 监听 onmessage 事件
- [ ] SubTask 38.4: 解析 JSON 数据
- [ ] SubTask 38.5: 根据 type 调用不同回调
- [ ] SubTask 38.6: 监听 onclose 事件
- [ ] SubTask 38.7: 打印断开连接日志
- [ ] SubTask 38.8: 监听 onerror 事件
- [ ] SubTask 38.9: 打印错误日志

### Task 39: 实现 WebSocket 消息发送
- [ ] SubTask 39.1: 导出 sendMessage 函数
- [ ] SubTask 39.2: 定义函数签名（输入 ws, type, payload）
- [ ] SubTask 39.3: 构建消息对象
- [ ] SubTask 39.4: 转换为 JSON 字符串
- [ ] SubTask 39.5: 调用 ws.send 发送
- [ ] SubTask 39.6: 打印发送日志

### Task 40: 实现回调注册机制
- [ ] SubTask 40.1: 创建回调对象 callbacks
- [ ] SubTask 40.2: 导出 onMessage 函数（注册回调）
- [ ] SubTask 40.3: 在 onmessage 中调用注册的回调
- [ ] SubTask 40.4: 支持多个回调

### Task 41: 测试 WebSocket 客户端
- [ ] SubTask 41.1: 在 App.vue 中导入 ws 模块
- [ ] SubTask 41.2: 在 onMounted 中连接 WebSocket
- [ ] SubTask 41.3: 注册 onMessage 回调
- [ ] SubTask 41.4: 打印接收到的消息
- [ ] SubTask 41.5: 启动前端验证连接成功
- [ ] SubTask 41.6: 打开浏览器控制台验证日志

---

## 阶段 9：前端状态管理

### Task 42: 创建 Pinia Store 文件
- [ ] SubTask 42.1: 创建 src/store 目录
- [ ] SubTask 42.2: 创建 src/store/chat.js 文件
- [ ] SubTask 42.3: 导入 defineStore

### Task 43: 定义状态
- [ ] SubTask 43.1: 定义 messages 状态（数组）
- [ ] SubTask 43.2: 定义 isConnected 状态（布尔）
- [ ] SubTask 43.3: 定义 isRecording 状态（布尔）
- [ ] SubTask 43.4: 定义 isProcessing 状态（布尔）
- [ ] SubTask 43.5: 定义 isPlaying 状态（布尔）
- [ ] SubTask 43.6: 定义 error 状态（字符串）

### Task 44: 定义方法
- [ ] SubTask 44.1: 实现 addMessage 方法（添加消息到 messages）
- [ ] SubTask 44.2: 实现 setConnected 方法（设置连接状态）
- [ ] SubTask 44.3: 实现 setRecording 方法（设置录音状态）
- [ ] SubTask 44.4: 实现 setProcessing 方法（设置处理状态）
- [ ] SubTask 44.5: 实现 setPlaying 方法（设置播放状态）
- [ ] SubTask 44.6: 实现 setError 方法（设置错误信息）
- [ ] SubTask 44.7: 实现 clearError 方法（清除错误信息）

### Task 45: 测试 Pinia Store
- [ ] SubTask 45.1: 在 App.vue 中导入 useChatStore
- [ ] SubTask 45.2: 调用 useChatStore 获取 store 实例
- [ ] SubTask 45.3: 调用 addMessage 方法
- [ ] SubTask 45.4: 打印 messages 验证添加成功
- [ ] SubTask 45.5: 启动前端验证无错误

---

## 阶段 10：前端录音功能

### Task 46: 创建录音 Hook 文件
- [ ] SubTask 46.1: 创建 src/composables 目录
- [ ] SubTask 46.2: 创建 src/composables/useRecorder.js 文件
- [ ] SubTask 46.3: 导入 ref 从 vue

### Task 47: 实现获取麦克风权限
- [ ] SubTask 47.1: 导出 useRecorder 函数
- [ ] SubTask 47.2: 定义 isRecording 状态（ref）
- [ ] SubTask 47.3: 定义 mediaRecorder 状态（ref）
- [ ] SubTask 47.4: 定义 audioChunks 状态（ref）
- [ ] SubTask 47.5: 实现 requestPermission 函数
- [ ] SubTask 47.6: 调用 navigator.mediaDevices.getUserMedia
- [ ] SubTask 47.7: 返回 mediaStream
- [ ] SubTask 47.8: 处理权限拒绝错误

### Task 48: 实现开始录音
- [ ] SubTask 48.1: 实现 startRecording 函数
- [ ] SubTask 48.2: 调用 requestPermission 获取 mediaStream
- [ ] SubTask 48.3: 创建 MediaRecorder 实例
- [ ] SubTask 48.4: 监听 ondataavailable 事件
- [ ] SubTask 48.5: 将音频数据添加到 audioChunks
- [ ] SubTask 48.6: 调用 mediaRecorder.start()
- [ ] SubTask 48.7: 设置 isRecording 为 true

### Task 49: 实现停止录音
- [ ] SubTask 49.1: 实现 stopRecording 函数
- [ ] SubTask 49.2: 调用 mediaRecorder.stop()
- [ ] SubTask 49.3: 设置 isRecording 为 false
- [ ] SubTask 49.4: 监听 onstop 事件
- [ ] SubTask 49.5: 合并 audioChunks 为 Blob
- [ ] SubTask 49.6: 清空 audioChunks
- [ ] SubTask 49.7: 返回 audioBlob

### Task 50: 实现音频转换
- [ ] SubTask 50.1: 实现 blobToBase64 函数
- [ ] SubTask 50.2: 创建 FileReader 实例
- [ ] SubTask 50.3: 调用 readAsDataURL
- [ ] SubTask 50.4: 在 onload 中提取 base64 部分
- [ ] SubTask 50.5: 返回 Promise<string>

### Task 51: 测试录音功能
- [ ] SubTask 51.1: 在 App.vue 中导入 useRecorder
- [ ] SubTask 51.2: 创建按钮调用 startRecording
- [ ] SubTask 51.3: 创建按钮调用 stopRecording
- [ ] SubTask 51.4: 打印 audioBlob 验证录音成功
- [ ] SubTask 51.5: 调用 blobToBase64 验证转换成功
- [ ] SubTask 51.6: 启动前端测试录音功能

---

## 阶段 11：前端播放功能

### Task 52: 创建播放 Hook 文件
- [ ] SubTask 52.1: 创建 src/composables/usePlayer.js 文件
- [ ] SubTask 52.2: 导入 ref 从 vue

### Task 53: 实现音频播放
- [ ] SubTask 53.1: 导出 usePlayer 函数
- [ ] SubTask 53.2: 定义 isPlaying 状态（ref）
- [ ] SubTask 53.3: 定义 audioQueue 状态（ref）
- [ ] SubTask 53.4: 实现 playAudio 函数
- [ ] SubTask 53.5: 创建 Audio 实例
- [ ] SubTask 53.6: 设置 src 为 base64 音频
- [ ] SubTask 53.7: 调用 audio.play()
- [ ] SubTask 53.8: 设置 isPlaying 为 true
- [ ] SubTask 53.9: 监听 onended 事件
- [ ] SubTask 53.10: 设置 isPlaying 为 false

### Task 54: 实现播放队列
- [ ] SubTask 54.1: 实现 addToQueue 函数
- [ ] SubTask 54.2: 将音频添加到 audioQueue
- [ ] SubTask 54.3: 如果未播放则开始播放
- [ ] SubTask 54.4: 在 onended 中播放下一个
- [ ] SubTask 54.5: 实现 clearQueue 函数

### Task 55: 测试播放功能
- [ ] SubTask 55.1: 在 App.vue 中导入 usePlayer
- [ ] SubTask 55.2: 创建测试 base64 音频数据
- [ ] SubTask 55.3: 调用 playAudio 验证播放成功
- [ ] SubTask 55.4: 调用 addToQueue 验证队列工作
- [ ] SubTask 55.5: 启动前端测试播放功能

---

## 阶段 12：前端 UI 组件

### Task 56: 创建录音按钮组件
- [ ] SubTask 56.1: 创建 src/components/VoiceButton.vue 文件
- [ ] SubTask 56.2: 创建 template 部分
- [ ] SubTask 56.3: 创建 button 元素
- [ ] SubTask 56.4: 添加 @mousedown 事件
- [ ] SubTask 56.5: 添加 @mouseup 事件
- [ ] SubTask 56.6: 添加 @touchstart 事件
- [ ] SubTask 56.7: 添加 @touchend 事件
- [ ] SubTask 56.8: 显示按钮文字"按住说话"
- [ ] SubTask 56.9: 创建 script setup 部分
- [ ] SubTask 56.10: 定义 props（onStart, onStop）
- [ ] SubTask 56.11: 实现 handleStart 函数
- [ ] SubTask 56.12: 实现 handleStop 函数
- [ ] SubTask 56.13: 创建 style 部分
- [ ] SubTask 56.14: 添加极简样式

### Task 57: 创建聊天面板组件
- [ ] SubTask 57.1: 创建 src/components/ChatPanel.vue 文件
- [ ] SubTask 57.2: 创建 template 部分
- [ ] SubTask 57.3: 创建消息列表容器
- [ ] SubTask 57.4: 使用 v-for 遍历 messages
- [ ] SubTask 57.5: 显示消息文字
- [ ] SubTask 57.6: 区分用户和 AI 消息样式
- [ ] SubTask 57.7: 创建 script setup 部分
- [ ] SubTask 57.8: 定义 props（messages）
- [ ] SubTask 57.9: 创建 style 部分
- [ ] SubTask 57.10: 添加极简样式

### Task 58: 创建 App.vue 主页面
- [ ] SubTask 58.1: 更新 src/App.vue 文件
- [ ] SubTask 58.2: 创建 template 部分
- [ ] SubTask 58.3: 添加 ChatPanel 组件
- [ ] SubTask 58.4: 添加 VoiceButton 组件
- [ ] SubTask 58.5: 显示连接状态
- [ ] SubTask 58.6: 显示错误信息
- [ ] SubTask 58.7: 创建 script setup 部分
- [ ] SubTask 58.8: 导入 useChatStore
- [ ] SubTask 58.9: 导入 useRecorder
- [ ] SubTask 58.10: 导入 usePlayer
- [ ] SubTask 58.11: 导入 ws 模块
- [ ] SubTask 58.12: 在 onMounted 中连接 WebSocket
- [ ] SubTask 58.13: 注册 WebSocket 消息回调
- [ ] SubTask 58.14: 实现 handleStart 函数（开始录音）
- [ ] SubTask 58.15: 实现 handleStop 函数（停止录音并发送）
- [ ] SubTask 58.16: 实现 handleTranscript 回调（处理识别结果）
- [ ] SubTask 58.17: 实现 handleLLMChunk 回调（处理 LLM 流式回复）
- [ ] SubTask 58.18: 实现 handleAudio 回调（处理音频并播放）
- [ ] SubTask 58.19: 创建 style 部分
- [ ] SubTask 58.20: 添加极简布局样式

---

## 阶段 13：集成测试

### Task 59: 后端集成测试
- [ ] SubTask 59.1: 启动后端服务器
- [ ] SubTask 59.2: 验证服务器启动无错误
- [ ] SubTask 59.3: 验证 WebSocket 服务器创建成功
- [ ] SubTask 59.4: 使用 test-ws.html 测试连接
- [ ] SubTask 59.5: 测试发送音频消息
- [ ] SubTask 59.6: 验证收到 transcript 消息
- [ ] SubTask 59.7: 验证收到 llm_chunk 消息
- [ ] SubTask 59.8: 验证收到 audio 消息

### Task 60: 前端集成测试
- [ ] SubTask 60.1: 启动前端开发服务器
- [ ] SubTask 60.2: 验证前端启动无错误
- [ ] SubTask 60.3: 打开浏览器访问前端
- [ ] SubTask 60.4: 验证控制台无错误
- [ ] SubTask 60.5: 验证 WebSocket 连接成功
- [ ] SubTask 60.6: 验证 UI 正常显示

### Task 61: 端到端测试
- [ ] SubTask 61.1: 同时启动前后端服务器
- [ ] SubTask 61.2: 打开浏览器访问前端
- [ ] SubTask 61.3: 按住录音按钮录音
- [ ] SubTask 61.4: 松开按钮发送音频
- [ ] SubTask 61.5: 验证显示识别的文字
- [ ] SubTask 61.6: 验证显示 AI 回复
- [ ] SubTask 61.7: 验证播放 AI 音频
- [ ] SubTask 61.8: 验证聊天记录显示

### Task 62: 错误处理测试
- [ ] SubTask 62.1: 测试麦克风权限拒绝
- [ ] SubTask 62.2: 测试 WebSocket 断开连接
- [ ] SubTask 62.3: 测试 API 错误
- [ ] SubTask 62.4: 验证错误提示显示

### Task 63: 最终验收
- [ ] SubTask 63.1: 验证所有功能可以正常工作
- [ ] SubTask 63.2: 验证无控制台错误
- [ ] SubTask 63.3: 验证用户体验流畅
- [ ] SubTask 63.4: 创建 README.md 使用说明
- [ ] SubTask 63.5: 最终提交代码

---

# Task Dependencies

## 严格串行依赖（必须按顺序执行）

### 后端依赖链
- Task 2-5 依赖 Task 1（需要目录结构）
- Task 6 依赖 Task 2-5（需要项目初始化完成）
- Task 7-9 依赖 Task 6（需要配置模块）
- Task 10-13 依赖 Task 7-9（需要音频工具）
- Task 14-18 依赖 Task 6（需要配置模块）
- Task 19-22 依赖 Task 6（需要配置模块）
- Task 23-32 依赖 Task 10-22（需要所有服务完成）

### 前端依赖链
- Task 34-35 依赖 Task 33（需要清理完成）
- Task 36-41 依赖 Task 35（需要 main.js 完成）
- Task 42-45 依赖 Task 35（需要 Pinia 安装）
- Task 46-51 依赖 Task 35（需要项目初始化）
- Task 52-55 依赖 Task 35（需要项目初始化）
- Task 56-57 依赖 Task 42-55（需要 Store 和 Hooks）
- Task 58 依赖 Task 56-57（需要组件）
- Task 59-63 依赖 Task 58（需要完整前端）

## 可并行执行的任务

### 后端可并行
- Task 7, Task 8, Task 9（音频工具函数独立）
- Task 10-13, Task 14-18, Task 19-22（三个服务独立）

### 前端可并行
- Task 36-41, Task 42-45, Task 46-51, Task 52-55（四个模块独立）
- Task 56, Task 57（两个组件独立）

---

# 执行建议

## AI 执行策略
1. **严格按照任务顺序执行**，不要跳过任何 SubTask
2. **每个 SubTask 完成后立即验证**，确保功能正确
3. **遇到错误立即修复**，不要继续执行后续任务
4. **使用 console.log 调试**，确保每个步骤都有日志输出
5. **保持代码简单**，避免过度设计

## 验证策略
1. **每个函数完成后立即测试**
2. **每个模块完成后进行模块测试**
3. **每个阶段完成后进行集成测试**
4. **最终进行端到端测试**

## 时间估算
- 后端：约 50 个 SubTask，每个 5-10 分钟，总计 4-8 小时
- 前端：约 50 个 SubTask，每个 5-10 分钟，总计 4-8 小时
- 集成测试：约 20 个 SubTask，每个 5-10 分钟，总计 2-3 小时
- **总计：10-19 小时**（两天内可完成）
