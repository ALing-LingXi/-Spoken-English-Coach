<template>
  <div class="app">
    <!-- 顶部状态栏 -->
    <header class="app__header">
      <h1 class="app__title">AI 英语口语陪练</h1>
      <span :class="['app__status', isConnected ? 'app__status--on' : 'app__status--off']">
        {{ isConnected ? '已连接' : '未连接' }}
      </span>
    </header>

    <!-- 错误提示 -->
    <div v-if="error" class="app__error">
      {{ error }}
      <button class="app__error-close" @click="clearError">&times;</button>
    </div>

    <!-- 聊天面板 -->
    <ChatPanel />

    <!-- 录音按钮 -->
    <div class="app__footer">
      <VoiceButton @start="handleStart" @stop="handleStop" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
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
  // 流结束，将完整 AI 回复写入消息
  if (currentAiText) {
    addMessage({ role: 'ai', content: currentAiText })
    currentAiText = ''
  }

  // 播放音频
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
}

.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.app__title {
  font-size: 18px;
  margin: 0;
}

.app__status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
}

.app__status--on {
  background: #e6f7e6;
  color: #2e7d32;
}

.app__status--off {
  background: #fdecea;
  color: #c62828;
}

.app__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff3e0;
  color: #e65100;
  font-size: 13px;
}

.app__error-close {
  background: none;
  border: none;
  color: #e65100;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.app__footer {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>
