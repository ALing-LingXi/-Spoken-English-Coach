<template>
  <div class="app-container">
    <!-- 动态渐变背景 -->
    <div class="app-gradient-bg"></div>

    <div class="app-layout">
      <!-- 左侧栏 -->
      <Sidebar :collapsed="sidebarCollapsed" :isConnected="isConnected" :chats="chatList" :activeChatId="activeChatId"
        :modelScene="currentScene" @toggle="sidebarCollapsed = !sidebarCollapsed" @newChat="handleNewChat"
        @selectChat="handleSelectChat" @deleteChat="handleDeleteChat" @sceneChange="handleSceneChange" />

      <!-- 主聊天区域 -->
      <main class="app-main">
        <ChatArea :waveformData="waveformData" :isProcessing="isProcessing" :isPlaying="isPlaying"
          @startRecording="handleStart" @stopRecording="handleStop" @interrupt="handleInterrupt" />
      </main>

      <!-- 右侧面板 -->
      <RightPanel :open="showRightPanel" @close="showRightPanel = false" @settingsChange="handleSettingsChange" />

      <!-- 顶栏设置按钮（浮动） -->
      <button class="app-layout__settings-btn" @click="showRightPanel = !showRightPanel">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <!-- 错误提示 -->
      <Transition name="slide-down">
        <div v-if="error" class="app-layout__error">
          <span>{{ error }}</span>
          <button @click="clearError">✕</button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store/chat'
import { connectWebSocket, sendMessage, on, disconnect } from '@/api/ws'
import { useRecorder } from '@/composables/useRecorder'
import { usePlayer } from '@/composables/usePlayer'
import Sidebar from '@/components/Sidebar.vue'
import ChatArea from '@/components/ChatArea.vue'
import RightPanel from '@/components/RightPanel.vue'
import type { SceneType, TranscriptData, LLMChunkData, AudioResponseData, CorrectionData, ScoreData, ErrorData, SettingsData, VoiceId, DifficultyLevel } from '@/types'

const store = useChatStore()
const { isConnected, error, isProcessing, isPlaying } = storeToRefs(store)
const { setConnected, setProcessing, addMessage, appendReply, setError, clearError, switchScene, createConversation, switchConversation, deleteConversation, getConversationList } = store

const { startRecording, stopRecording, waveformData, requestPermission } = useRecorder()
const { addToQueue, stop: stopPlayer, clearQueue } = usePlayer()

// 布局状态
const sidebarCollapsed = ref(false)
const showRightPanel = ref(false)

// 对话列表（从 Store 读取）
const chatList = computed(() => getConversationList())
const activeChatId = computed(() => store.activeConversationId)

// 场景
const currentScene = computed<SceneType>(() => store.currentScene)

/** 新建对话 */
function handleNewChat(): void {
  stopPlayer()
  clearQueue()
  createConversation()
}

/** 选择对话 */
function handleSelectChat(id: string): void {
  stopPlayer()
  clearQueue()
  switchConversation(id)
}

/** 删除对话 */
function handleDeleteChat(id: string): void {
  stopPlayer()
  clearQueue()
  deleteConversation(id)
}

/** 按下：打断播放或开始录音 */
async function handleStart(): Promise<void> {
  if (isConnected.value) {
    stopPlayer()
    sendMessage('interrupt', {})
  }
  const hasPermission = await requestPermission()
  if (!hasPermission) {
    setError('请允许麦克风权限')
    return
  }
  await startRecording()
}

/** 打断播放 */
function handleInterrupt(): void {
  stopPlayer()
  sendMessage('interrupt', {})
}

/** 松开录音 */
async function handleStop(): Promise<void> {
  store.setRecording(false)
  const base64 = await stopRecording()
  if (!base64) return

  setProcessing(true)
  sendMessage('audio', { audio: base64, messages: store.getLLMMessages() })
}

/** 处理语音识别结果 */
function handleTranscript(data: unknown): void {
  const d = data as TranscriptData
  store.addMessage('user', d.text, 'voice')
  store.startReply()
}

/** 处理 LLM 流式片段 */
function handleLLMChunk(data: unknown): void {
  const d = data as LLMChunkData
  appendReply(d.text)
}

/** 处理 TTS 音频返回 */
function handleAudio(data: unknown): void {
  const d = data as AudioResponseData
  store.finishReply()
  if (d.audio) {
    addToQueue(d.audio)
  }
  setProcessing(false)
}

/** 处理纠错内容 */
function handleCorrection(data: unknown): void {
  const d = data as CorrectionData
  store.setCorrection(d.text)
}

/** 处理评分 */
function handleScore(data: unknown): void {
  const d = data as ScoreData
  if (d.score) {
    store.setScore(d.score, d.feedback ?? null)
  }
}

/** 场景切换 */
function handleSceneChange(scene: SceneType): void {
  switchScene(scene)
  sendMessage('scene', { scene })
}

/** 设置变更 */
function handleSettingsChange(settings: SettingsData): void {
  sendMessage('setting', settings)
}

/** 同步当前设置到后端 */
function syncSettings(): void {
  sendMessage('setting', {
    difficulty: (localStorage.getItem('setting_difficulty') ? JSON.parse(localStorage.getItem('setting_difficulty')!) : 'medium') as DifficultyLevel,
    voice: (localStorage.getItem('setting_voice') ? JSON.parse(localStorage.getItem('setting_voice')!) : 'claire') as VoiceId,
    scene: currentScene.value,
  })
}

/** 注册 WebSocket 回调 */
function registerCallbacks(): void {
  on('open', () => {
    setConnected(true)
    syncSettings()
  })
  on('close', () => setConnected(false))
  on('transcript', handleTranscript)
  on('llm_chunk', handleLLMChunk)
  on('audio', handleAudio)
  on('correction', handleCorrection)
  on('score', handleScore)
  on('error', (data: unknown) => {
    const d = data as ErrorData | null
    setError(d?.message || '服务器错误')
    setProcessing(false)
  })
}

onMounted(async () => {
  registerCallbacks()
  try {
    await connectWebSocket()
    syncSettings()
  } catch {
    setError('WebSocket 连接失败')
  }
})

onUnmounted(() => {
  stopPlayer()
  disconnect()
})
</script>

<style>
/* 全局深色主题 CSS 变量 - 升级版 */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-gradient-start: #1a1a2e;
  --bg-gradient-end: #16213e;
  --bg-gradient-accent: #0f0c29;
  --bg-sidebar: rgba(20, 20, 35, 0.85);
  --bg-card: rgba(30, 30, 50, 0.7);
  --bg-card-hover: rgba(40, 40, 65, 0.8);
  --accent-red: #e94560;
  --accent-gold: #f5a623;
  --accent-purple: #6c8cff;
  --accent-blue: #4facfe;
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --text-muted: #6a6a7a;
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-hover: rgba(255, 255, 255, 0.1);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'SF Pro Display', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  min-height: 100vh;
}

/* 动态渐变背景 */
.app-gradient-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(108, 140, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(233, 69, 96, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(79, 172, 254, 0.04) 0%, transparent 60%),
    linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-accent) 50%, var(--bg-gradient-end) 100%);
  pointer-events: none;
  z-index: -1;
}

/* Element Plus 深色主题覆盖 */
.el-drawer {
  background: rgba(18, 18, 26, 0.98) !important;
  backdrop-filter: blur(20px);
}

.el-drawer__header {
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-subtle);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 全局动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes glow {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}
</style>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(20, 20, 35, 0.4);
  backdrop-filter: blur(20px);
}

/* 设置按钮 */
.app-layout__settings-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: rgba(30, 30, 50, 0.7);
  backdrop-filter: blur(12px);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-sm);
}

.app-layout__settings-btn:hover {
  background: rgba(42, 42, 74, 0.9);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.12);
}

/* 错误提示 */
.app-layout__error {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(233, 69, 96, 0.18);
  border: 1px solid rgba(233, 69, 96, 0.35);
  border-radius: var(--radius-lg);
  color: #ff8888;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.2);
}

.app-layout__error button {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 响应式：小屏折叠侧边栏 */
@media (max-width: 1024px) {
  .app-layout__settings-btn {
    top: 12px;
    right: 12px;
  }
}
</style>
