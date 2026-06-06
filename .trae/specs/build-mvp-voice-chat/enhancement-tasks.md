# 增强方案实施计划

> 基于 [中等增强方案设计](../../docs/plans/2026-06-06-moderate-enhancement-design.md)
> 前置条件：Phase 0（MVP）已全部完成

---

## Phase 1：工程化基础

### Task 38: 创建请求重试工具 ✅
- [x] SubTask 38.1: 创建 server/utils/retry.js 文件
- [x] SubTask 38.2: 实现 retry(fn, maxRetries, baseDelay) 函数
- [x] SubTask 38.3: 实现指数退避延迟计算
- [x] SubTask 38.4: 只对网络错误和 5xx 重试，4xx 不重试
- [x] SubTask 38.5: 导出 retry 函数

### Task 39: ASR 服务接入重试 ✅
- [x] SubTask 39.1: 在 asr.js 中导入 retry
- [x] SubTask 39.2: 用 retry 包裹 axios.post 调用
- [x] SubTask 39.3: 验证 ASR 请求失败时自动重试

### Task 40: LLM 服务接入重试 ✅
- [x] SubTask 40.1: 在 llm.js 中导入 retry
- [x] SubTask 40.2: 用 retry 包裹 generateReply 的 axios 调用
- [x] SubTask 40.3: 用 retry 包裹 generateReplyStream 的 axios 调用（仅初始连接）
- [x] SubTask 40.4: 验证 LLM 请求失败时自动重试

### Task 41: TTS 服务接入重试 ✅
- [x] SubTask 41.1: 在 tts.js 中导入 retry
- [x] SubTask 41.2: 用 retry 包裹 synthesizeSpeech 的 axios 调用
- [x] SubTask 41.3: 验证 TTS 请求失败时自动重试

### Task 42: WebSocket 断线重连 ✅
- [x] SubTask 42.1: 在 api/ws.js 中添加重连状态变量
- [x] SubTask 42.2: 实现 exponentialBackoff 重连逻辑
- [x] SubTask 42.3: onclose 时自动触发重连
- [x] SubTask 42.4: 最大重试次数限制（10次）
- [x] SubTask 42.5: 重连成功后重置计数器
- [x] SubTask 42.6: 暴露 disconnect 方法主动断开

### Task 43: WebSocket 心跳机制 ✅
- [x] SubTask 43.1: 连接成功后启动定时器，每 30s 发送 ping
- [x] SubTask 43.2: 后端 ws.js 处理 ping 消息，回复 pong
- [x] SubTask 43.3: 前端收到 pong 重置超时计时器
- [x] SubTask 43.4: 超时未收到 pong 则触发重连
- [x] SubTask 43.5: 断开连接时清除心跳定时器

### Task 44: 前端错误恢复 ✅
- [x] SubTask 44.1: Store 中添加 error 状态和 setError/clearError 方法
- [x] SubTask 44.2: ASR 失败时显示"识别失败，请重试"提示
- [x] SubTask 44.3: LLM 超时（5s 无 chunk）时提示重试
- [x] SubTask 44.4: TTS 失败时文字正常显示，提示"语音合成失败"
- [x] SubTask 44.5: 麦克风权限拒绝时显示引导提示
- [x] SubTask 44.6: App.vue 中显示错误提示区域

---

## Phase 2：UI 视觉重构

### Task 45: 全局深色主题样式 ✅
- [x] SubTask 45.1: 在 App.vue 中定义 CSS 变量（背景色、文字色、强调色等）
- [x] SubTask 45.2: 实现深色渐变背景（深蓝→深紫）
- [x] SubTask 45.3: 设置全局字体和基础样式
- [x] SubTask 45.4: 定义毛玻璃效果 mixin/class

### Task 46: 聊天面板气泡样式 ✅
- [x] SubTask 46.1: 用户消息右对齐蓝色气泡
- [x] SubTask 46.2: AI 消息左对齐灰色气泡
- [x] SubTask 46.3: 消息出现时滑入 + 淡入动画
- [x] SubTask 46.4: AI 回复打字机效果（逐字显示）
- [x] SubTask 46.5: 时间戳显示

### Task 47: 录音按钮视觉增强 ✅
- [x] SubTask 47.1: 中心大圆形按钮，渐变背景
- [x] SubTask 47.2: 按下时缩放动画
- [x] SubTask 47.3: 录音中脉冲波纹扩散动画
- [x] SubTask 47.4: 不同状态（空闲/录音中/处理中）不同颜色
- [x] SubTask 47.5: 状态文字提示（"按住说话"/"松开结束"/"处理中..."）

### Task 48: 整体布局优化 ✅
- [x] SubTask 48.1: 顶部标题栏 + 连接状态指示灯
- [x] SubTask 48.2: 中间聊天区域自适应高度，可滚动
- [x] SubTask 48.3: 底部录音按钮居中固定
- [x] SubTask 48.4: 毛玻璃卡片包裹聊天区域
- [x] SubTask 48.5: 移动端适配（响应式布局）

---

## Phase 3：学习体验增强

### Task 49: 多轮对话上下文 ✅
- [x] SubTask 49.1: Store 中 messages 数组增加 role/content 字段
- [x] SubTask 49.2: 发送音频时带上 messages 历史到后端
- [x] SubTask 49.3: 后端 ws.js 从客户端消息中提取 messages
- [x] SubTask 49.4: 将 messages 传给 generateReplyStream
- [x] SubTask 49.5: AI 回复追加到 messages 数组
- [x] SubTask 49.6: 验证多轮对话上下文连贯

### Task 50: LLM 语法纠错 prompt ✅
- [x] SubTask 50.1: 修改 llm.js 的 DEFAULT_SYSTEM_PROMPT，加入纠错指令
- [x] SubTask 50.2: 定义纠错标记格式（[纠错]...[/纠错]）
- [x] SubTask 50.3: 后端 ws.js 解析纠错标记，分离回复正文和纠错内容
- [x] SubTask 50.4: 发送 llm_chunk 时附带纠错标记
- [x] SubTask 50.5: 发送独立 correction 消息类型

### Task 51: 前端纠错高亮显示 ✅
- [x] SubTask 51.1: Store 消息模型增加 correction 字段
- [x] SubTask 51.2: ChatPanel 解析纠错内容，橙色高亮显示
- [x] SubTask 51.3: 纠错内容折叠/展开交互
- [x] SubTask 51.4: 验证纠错显示效果

### Task 52: 发音评分服务 ✅
- [x] SubTask 52.1: 验证 SiliconFlow ASR 是否返回置信度（不返回）
- [x] SubTask 52.2: 创建 server/services/scoring.js
- [x] SubTask 52.3: 采用 LLM 评分方案（ASR 无置信度）
- [x] SubTask 52.4: 在 LLM prompt 中加评分指令
- [x] SubTask 52.5: 后端发送 score 消息类型
- [x] SubTask 52.6: 前端显示评分（星级 + 评语）

---

## Phase 4：交互增强

### Task 53: 播放打断机制 ✅
- [x] SubTask 53.1: usePlayer 新增 stop() 方法
- [x] SubTask 53.2: usePlayer 暴露 isPlaying 状态
- [x] SubTask 53.3: VoiceButton mousedown 时检查 isPlaying 并 stop
- [x] SubTask 53.4: 前端发送 interrupt 消息
- [x] SubTask 53.5: 后端 ws.js 处理 interrupt 消息类型
- [x] SubTask 53.6: 验证打断后可立即重新录音

### Task 54: 音频队列管理 ✅
- [x] SubTask 54.1: usePlayer 新增 queue 数组
- [x] SubTask 54.2: 实现 addToQueue 方法
- [x] SubTask 54.3: 当前播放完自动播下一条
- [x] SubTask 54.4: stop() 清空队列并停止当前
- [x] SubTask 54.5: interrupt() 停止当前但保留队列

### Task 55: 录音波形数据 ✅
- [x] SubTask 55.1: useRecorder 中创建 AudioContext + AnalyserNode
- [x] SubTask 55.2: 录音时实时获取频域数据
- [x] SubTask 55.3: 暴露 waveformData 响应式引用
- [x] SubTask 55.4: 停止录音时释放 AudioContext 资源

### Task 56: 波形可视化渲染 ✅
- [x] SubTask 56.1: VoiceButton 中添加 canvas 元素
- [x] SubTask 56.2: 用 requestAnimationFrame 渲染环形频谱
- [x] SubTask 56.3: 录音中显示动态波形，停止时归零
- [x] SubTask 56.4: 波形颜色与按钮状态联动
- [x] SubTask 56.5: 验证波形动画流畅度

---

## Phase 5：产品功能

### Task 57: 设置面板组件 🔴
- [ ] SubTask 57.1: 创建 src/components/SettingsPanel.vue
- [ ] SubTask 57.2: 实现语速滑块（0.5x-2x）
- [ ] SubTask 57.3: 实现音色下拉选择
- [ ] SubTask 57.4: 实现难度选择（初级/中级/高级）
- [ ] SubTask 57.5: 实现纠错开关
- [ ] SubTask 57.6: 设置变更时发送 setting 消息到后端
- [ ] SubTask 57.7: 设置存入 localStorage
- [ ] SubTask 57.8: 页面加载时从 localStorage 恢复设置

### Task 58: 后端设置处理 🔴
- [ ] SubTask 58.1: ws.js 处理 setting 消息类型
- [ ] SubTask 58.2: 将设置存入 ws 实例（ws.settings）
- [ ] SubTask 58.3: TTS 调用时传入 speed/voice 参数
- [ ] SubTask 58.4: LLM 调用时根据难度调整 system prompt
- [ ] SubTask 58.5: 验证设置变更生效

### Task 59: 场景模式切换 🔴
- [ ] SubTask 59.1: 创建 src/components/SceneSelector.vue
- [ ] SubTask 59.2: 定义场景配置（日常/商务/旅行/面试）
- [ ] SubTask 59.3: 场景切换时发送 scene 消息到后端
- [ ] SubTask 59.4: 场景切换时清空对话历史
- [ ] SubTask 59.5: 后端根据场景选择不同 system prompt
- [ ] SubTask 59.6: 选中态下划线动画 + 切换淡入淡出

### Task 60: 聊天记录持久化 🔴
- [ ] SubTask 60.1: Store 中实现 saveToLocalStorage 方法
- [ ] SubTask 60.2: Store 中实现 loadFromLocalStorage 方法
- [ ] SubTask 60.3: 每次消息变更时自动保存
- [ ] SubTask 60.4: 页面加载时恢复历史消息
- [ ] SubTask 60.5: 每个场景独立存储（key 含场景名）
- [ ] SubTask 60.6: 超过 100 条消息自动清理旧消息
- [ ] SubTask 60.7: 实现"清空记录"按钮

### Task 61: App.vue 整合所有组件 🔴
- [ ] SubTask 61.1: 引入 SceneSelector 到顶部
- [ ] SubTask 61.2: 引入 SettingsPanel 右侧抽屉
- [ ] SubTask 61.3: 设置按钮（齿轮图标）触发抽屉
- [ ] SubTask 61.4: 整合所有 WebSocket 回调
- [ ] SubTask 61.5: 整合错误提示区域
- [ ] SubTask 61.6: 验证所有功能联动正常

---

# 当前状态总结

## ✅ 已完成（19 项）
| Task | 说明 |
|------|------|
| Task 38 | 请求重试工具 retry.js |
| Task 39 | ASR 接入重试 |
| Task 40 | LLM 接入重试 |
| Task 41 | TTS 接入重试 |
| Task 42 | WS 断线重连 |
| Task 43 | WS 心跳机制 |
| Task 44 | 前端错误恢复 |
| Task 45 | 全局深色主题样式 |
| Task 46 | 聊天面板气泡样式 |
| Task 47 | 录音按钮视觉增强 |
| Task 48 | 整体布局优化 |
| Task 49 | 多轮对话上下文 |
| Task 50 | LLM 语法纠错 prompt |
| Task 51 | 前端纠错高亮显示 |
| Task 52 | 发音评分服务 |
| Task 53 | 播放打断机制 |
| Task 54 | 音频队列管理 |
| Task 55 | 录音波形数据 |
| Task 56 | 波形可视化渲染 |

## 🔴 需要完成（5 项）
| Task | 说明 | 依赖 |
|------|------|------|
| Task 57 | 设置面板组件 | Phase 2 完成 |
| Task 58 | 后端设置处理 | Task 57 |
| Task 59 | 场景模式切换 | Task 57 |
| Task 60 | 聊天记录持久化 | MVP Store 完成 |
| Task 61 | App.vue 整合 | Task 57-60 |

---

# Task Dependencies

## Phase 1 依赖链
- Task 38 → Task 39, 40, 41（重试工具先完成）
- Task 42 → Task 43（重连先完成，再加心跳）
- Task 44 独立

## Phase 2 依赖链
- Task 45 独立（可最先开始）
- Task 46 依赖 MVP ChatPanel 完成
- Task 47 依赖 MVP VoiceButton 完成
- Task 48 依赖 Task 45, 46, 47

## Phase 3 依赖链
- Task 49 独立（可最先开始）
- Task 50 → Task 51（prompt 先改，前端再适配）
- Task 52 依赖 Task 49

## Phase 4 依赖链
- Task 53, 55 独立可并行
- Task 54 依赖 Task 53
- Task 56 依赖 Task 55

## Phase 5 依赖链
- Task 57 → Task 58, 59（组件先完成）
- Task 60 独立
- Task 61 依赖 Task 57-60 全部完成

## 跨 Phase 可并行
- Phase 1 和 Phase 2 可并行
- Phase 3 和 Phase 4 可并行
- Phase 5 必须等前面全部完成
