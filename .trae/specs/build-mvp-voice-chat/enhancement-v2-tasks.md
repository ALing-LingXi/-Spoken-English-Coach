# 增强方案 V2 实施任务

## Phase 1：Bug 修复 + UI 重构

### Task 1: 修复录音/播放状态同步 ✅
- [x] SubTask 1.1: 修改 useRecorder.js，移除内部 isRecording ref，改为操作 Store
- [x] SubTask 1.2: 修改 usePlayer.js，移除内部 isPlaying ref，改为操作 Store
- [x] SubTask 1.3: 修改 App.vue，删除 let currentAiText，改用 Store 的 startReply/appendReply/finishReply
- [x] SubTask 1.4: 修改 VoiceButton.vue，确认从 Store 读取 isRecording/isPlaying
- [x] SubTask 1.5: 验证录音→播放完整流程状态正确

### Task 2: 修复依赖与参数问题 ✅
- [x] SubTask 2.1: server/package.json 添加 form-data 依赖
- [x] SubTask 2.2: 修复 TTS voice 传参链路（前端 setting → 后端 ws.settings.voice → tts.js）
- [x] SubTask 2.3: SettingsPanel.vue 音色列表补全为 8 种
- [x] SubTask 2.4: SceneSelector.vue 添加 watch 响应外部 modelValue 变化
- [x] SubTask 2.5: 验证音色切换和场景切换功能

### Task 3: 后端新增 text 消息路由 ✅
- [x] SubTask 3.1: ws.js routeMessage 新增 'text' case
- [x] SubTask 3.2: 实现 handleText 函数（跳过 ASR，直接 LLM → TTS）
- [x] SubTask 3.3: 验证文字消息走通 LLM 流式回复 + TTS

### Task 4: 创建 Sidebar 组件 ✅
- [x] SubTask 4.1: 创建 src/components/Sidebar.vue
- [x] SubTask 4.2: 实现对话列表（新建对话、切换对话、删除对话）
- [x] SubTask 4.3: 实现场景切换区域（移入侧边栏底部）
- [x] SubTask 4.4: 添加深色主题样式 + hover 高亮 + 左侧强调色条
- [x] SubTask 4.5: 添加新建对话和切换对话的 Store 方法

### Task 5: 创建 ChatArea 组件 ✅
- [x] SubTask 5.1: 创建 src/components/ChatArea.vue
- [x] SubTask 5.2: 实现消息列表区域（复用 ChatPanel 逻辑）
- [x] SubTask 5.3: 实现自动滚动到底部
- [x] SubTask 5.4: 添加空状态提示
- [x] SubTask 5.5: 添加深色主题消息气泡样式

### Task 6: 创建 MessageInput 组件 ✅
- [x] SubTask 6.1: 创建 src/components/MessageInput.vue
- [x] SubTask 6.2: 实现 textarea 自动增高（最大 4 行）
- [x] SubTask 6.3: 实现 Enter 发送 / Shift+Enter 换行
- [x] SubTask 6.4: 集成语音按钮（VoiceButton 缩小版）
- [x] SubTask 6.5: 添加输入框聚焦发光样式

### Task 7: 创建 RightPanel 组件 ✅
- [x] SubTask 7.1: 创建 src/components/RightPanel.vue
- [x] SubTask 7.2: 实现可折叠抽屉（毛玻璃背景）
- [x] SubTask 7.3: 集成 SettingsPanel
- [x] SubTask 7.4: 添加折叠/展开动画

### Task 8: 重写 App.vue 为三栏布局 ✅
- [x] SubTask 8.1: 重写 App.vue 模板为三栏布局（Sidebar + ChatArea + RightPanel）
- [x] SubTask 8.2: 添加顶栏（Logo + 连接状态指示灯 + 设置图标）
- [x] SubTask 8.3: 注册 WebSocket 回调（适配新的消息处理逻辑）
- [x] SubTask 8.4: 实现录音/播放/打断交互逻辑
- [x] SubTask 8.5: 添加全局深色主题 CSS 变量
- [x] SubTask 8.6: 添加响应式适配（1024px 以下左侧栏折叠）

### Task 9: 升级 ChatPanel 消息气泡样式 ✅
- [x] SubTask 9.1: AI 气泡改为深色 + 左侧渐变边框
- [x] SubTask 9.2: 用户气泡改为珊瑚红 + 微弱发光
- [x] SubTask 9.3: 纠错标注样式升级（橙色底色 + 左边框）
- [x] SubTask 9.4: 评分星级样式升级
- [x] SubTask 9.5: 添加消息出现 fadeInUp 动画

### Task 10: 升级 VoiceButton 样式 ✅
- [x] SubTask 10.1: 缩小为输入框旁 48px 圆形按钮
- [x] SubTask 10.2: 录音时红色脉冲 + box-shadow 呼吸灯
- [x] SubTask 10.3: 适配新布局的频谱可视化

### Task 11: 全局样式与动效 ✅
- [x] SubTask 11.1: 定义 CSS 变量（配色、字体、圆角、阴影）
- [x] SubTask 11.2: 添加全局过渡动画（fadeInUp、slideIn）
- [x] SubTask 11.3: 添加流式回复打字机效果 + 光标闪烁
- [x] SubTask 11.4: 连接状态指示灯呼吸灯动画
- [x] SubTask 11.5: 侧边栏展开/折叠动画

---

## Phase 2：用户系统 + 学习进度

### Task 12: 创建用户档案 Store 🔴
- [ ] SubTask 12.1: 创建 src/store/user.js
- [ ] SubTask 12.2: 定义 profile 状态（nickname, avatar, createdAt）
- [ ] SubTask 12.3: 实现 updateProfile 方法
- [ ] SubTask 12.4: 实现 localStorage 持久化

### Task 13: 创建学习进度 Store 🔴
- [ ] SubTask 13.1: 创建 src/store/progress.js
- [ ] SubTask 13.2: 定义 dailyStats 状态
- [ ] SubTask 13.3: 实现 recordConversation 方法
- [ ] SubTask 13.4: 实现连续天数计算逻辑
- [ ] SubTask 13.5: 实现 localStorage 持久化

### Task 14: 创建 UserProfile 组件 🔴
- [ ] SubTask 14.1: 创建 src/components/UserProfile.vue
- [ ] SubTask 14.2: 实现昵称编辑
- [ ] SubTask 14.3: 实现头像选择
- [ ] SubTask 14.4: 显示注册日期和连续学习天数

### Task 15: 创建 LearningStats 组件 🔴
- [ ] SubTask 15.1: 创建 src/components/LearningStats.vue
- [ ] SubTask 15.2: 实现 7 天趋势图（Canvas 绘制）
- [ ] SubTask 15.3: 实现统计卡片（对话次数、总时长、平均评分、连续天数）
- [ ] SubTask 15.4: 添加深色主题样式

### Task 16: 集成用户系统到主界面 🔴
- [ ] SubTask 16.1: RightPanel 添加 UserProfile 和 LearningStats 标签页
- [ ] SubTask 16.2: App.vue 在对话结束时调用 recordConversation
- [ ] SubTask 16.3: Sidebar 顶部显示用户头像和昵称

---

## Phase 3：词库 + 生词本

### Task 17: 后端关键词提取 🔴
- [ ] SubTask 17.1: LLM system prompt 增加关键词标记指令
- [ ] SubTask 17.2: scoring.js 新增 parseVocabulary() 函数
- [ ] SubTask 17.3: scoring.js 新增 removeVocabularyFromReply() 函数
- [ ] SubTask 17.4: ws.js handleAudio/handleText 中发送 vocabulary 消息

### Task 18: 创建生词本 Store 🔴
- [ ] SubTask 18.1: 创建 src/store/vocabulary.js
- [ ] SubTask 18.2: 定义 words 状态
- [ ] SubTask 18.3: 实现 addWord / removeWord / getWordsByScene / searchWord
- [ ] SubTask 18.4: 实现 localStorage 持久化

### Task 19: 创建 WordBook 组件 🔴
- [ ] SubTask 19.1: 创建 src/components/WordBook.vue
- [ ] SubTask 19.2: 实现生词列表 + 搜索 + 场景筛选
- [ ] SubTask 19.3: 实现删除生词功能
- [ ] SubTask 19.4: 添加深色主题样式

### Task 20: 创建 WordCard 组件 🔴
- [ ] SubTask 20.1: 创建 src/components/WordCard.vue
- [ ] SubTask 20.2: 实现英文 + 中文释义 + 例句展示
- [ ] SubTask 20.3: 实现收藏/取消收藏按钮
- [ ] SubTask 20.4: 添加翻转动画

### Task 21: 创建 WordTag 组件 🔴
- [ ] SubTask 21.1: 创建 src/components/WordTag.vue
- [ ] SubTask 21.2: 实现消息中的单词标签
- [ ] SubTask 21.3: 点击标签可收藏或查看释义
- [ ] SubTask 21.4: 添加 hover 高亮样式

### Task 22: 集成词库到主界面 🔴
- [ ] SubTask 22.1: ChatPanel 消息气泡下方显示 WordTag
- [ ] SubTask 22.2: RightPanel 添加 WordBook 标签页
- [ ] SubTask 22.3: App.vue 注册 vocabulary 消息回调
- [ ] SubTask 22.4: 验证收藏→查看→删除完整流程

---

# 当前状态总结

## ✅ 已完成（11 项）
| Task | 说明 | 阶段 |
|------|------|------|
| Task 1 | 修复录音/播放状态同步 | Phase 1 |
| Task 2 | 修复依赖与参数问题 | Phase 1 |
| Task 3 | 后端新增 text 消息路由 | Phase 1 |
| Task 4 | 创建 Sidebar 组件 | Phase 1 |
| Task 5 | 创建 ChatArea 组件 | Phase 1 |
| Task 6 | 创建 MessageInput 组件 | Phase 1 |
| Task 7 | 创建 RightPanel 组件 | Phase 1 |
| Task 8 | 重写 App.vue 为三栏布局 | Phase 1 |
| Task 9 | 升级 ChatPanel 消息气泡样式 | Phase 1 |
| Task 10 | 升级 VoiceButton 样式 | Phase 1 |
| Task 11 | 全局样式与动效 | Phase 1 |

## 🔴 需要完成（11 项）
| Task | 说明 | 阶段 |
|------|------|------|
| Task 12 | 创建用户档案 Store | Phase 2 |
| Task 13 | 创建学习进度 Store | Phase 2 |
| Task 14 | 创建 UserProfile 组件 | Phase 2 |
| Task 15 | 创建 LearningStats 组件 | Phase 2 |
| Task 16 | 集成用户系统到主界面 | Phase 2 |
| Task 17 | 后端关键词提取 | Phase 3 |
| Task 18 | 创建生词本 Store | Phase 3 |
| Task 19 | 创建 WordBook 组件 | Phase 3 |
| Task 20 | 创建 WordCard 组件 | Phase 3 |
| Task 21 | 创建 WordTag 组件 | Phase 3 |
| Task 22 | 集成词库到主界面 | Phase 3 |
