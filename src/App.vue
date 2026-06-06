<template>
  <el-container class="app">
    <!-- 顶部导航栏 -->
    <el-header class="app__header">
      <div class="app__header-left">
        <el-icon :size="24"><Microphone /></el-icon>
        <span class="app__title">AI 英语口语陪练</span>
      </div>
      <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" round>
        {{ isConnected ? '已连接' : '未连接' }}
      </el-tag>
    </el-header>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="true"
      @close="clearError"
      class="app__alert"
    />

    <!-- 聊天面板 -->
    <el-main class="app__main">
      <ChatPanel />
    </el-main>

    <!-- 底部录音区域 -->
    <el-footer class="app__footer" height="auto">
      <VoiceButton @start="handleStart" @stop="handleStop" />
    </el-footer>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Microphone } from '@element-plus/icons-vue'
import { useChatStore } from './store/chat'
import { connectWebSocket, sendMessage, on } from './api/ws'
import { useRecorder } from './composables/useRecorder'
import { usePlayer } from './composables/usePlayer'
import ChatPanel from './components/ChatPanel.vue'
import VoiceButton from './components/VoiceButton.vue'

const store = useChatStore()
const { isConnected, error } = storeToRefs(store)
const { setConnected, setProcessing, addMessage, setError, clearError } = store
const { startRecording, stopRecording } = useRecorder()
const { addToQueue, clearQueue } = usePlayer()

// 当前 AI 回复的缓冲
let currentAiText = ''

/** 按下录音 */
async function handleStart() {
  clearQueue()
  await startRecording()
}

/** 松开录音 */
async function handleStop() {
  const base64 = await stopRecording()
  if (!base64) return

  setProcessing(true)
  sendMessage('audio', { audio: base64 })
}

/** 处理语音识别结果 */
function handleTranscript(data) {
  addMessage({ role: 'user', content: data.text })
}

/** 处理 LLM 流式片段 */
function handleLLMChunk(data) {
  currentAiText += data.text
}

/** 处理 TTS 音频返回 */
function handleAudio(data) {
  if (currentAiText) {
    addMessage({ role: 'ai', content: currentAiText })
    currentAiText = ''
  }

  if (data.audio) {
    addToQueue(data.audio)
  }

  setProcessing(false)
}

/** 注册 WebSocket 回调 */
function registerCallbacks() {
  on('open', () => setConnected(true))
  on('close', () => setConnected(false))
  on('transcript', handleTranscript)
  on('llm_chunk', handleLLMChunk)
  on('audio', handleAudio)
  on('error', (data) => {
    setError(data?.message || '服务器错误')
    setProcessing(false)
  })
}

onMounted(async () => {
  registerCallbacks()
  try {
    await connectWebSocket()
  } catch (err) {
    setError('WebSocket 连接失败')
  }
})

onUnmounted(() => {
  clearQueue()
})
</script>

<style scoped>
.app {
  max-width: 480px;
  margin: 0 auto;
  height: 100vh;
}

.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.app__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app__title {
  font-size: 18px;
  font-weight: 600;
}

.app__alert {
  border-radius: 0;
}

.app__main {
  padding: 0;
  overflow: hidden;
}

.app__footer {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
