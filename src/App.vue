<template>
  <el-container class="app">
    <!-- 顶部导航栏 -->
    <el-header class="app__header">
      <div class="app__header-left">
        <el-icon :size="24">
          <Microphone />
        </el-icon>
        <span class="app__title">AI 英语口语陪练</span>
      </div>
      <div class="app__header-right">
        <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" round size="small">
          {{ isConnected ? '已连接' : '未连接' }}
        </el-tag>
        <el-button :icon="Setting" circle size="small" @click="showSettings = true" />
      </div>
    </el-header>

    <!-- 场景切换 -->
    <div class="app__scene">
      <SceneSelector v-model="currentScene" @change="handleSceneChange" />
    </div>

    <!-- 错误提示 -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="true" @close="clearError"
      class="app__alert" />

    <!-- 聊天面板 -->
    <el-main class="app__main">
      <ChatPanel />
    </el-main>

    <!-- 底部录音区域 -->
    <el-footer class="app__footer" height="auto">
      <VoiceButton :waveformData="waveformData" @start="handleStart" @stop="handleStop" />
    </el-footer>

    <!-- 设置面板 -->
    <SettingsPanel v-model="showSettings" @change="handleSettingsChange" />
  </el-container>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Microphone, Setting } from '@element-plus/icons-vue'
import { useChatStore } from './store/chat'
import { connectWebSocket, sendMessage, on, disconnect } from './api/ws'
import { useRecorder } from './composables/useRecorder'
import { usePlayer } from './composables/usePlayer'
import ChatPanel from './components/ChatPanel.vue'
import VoiceButton from './components/VoiceButton.vue'
import SceneSelector from './components/SceneSelector.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const store = useChatStore()
const { isConnected, error } = storeToRefs(store)
const { setConnected, setProcessing, setRecording, setPlaying, addMessage, appendReply, setError, clearError, switchScene } = store
const { startRecording, stopRecording, waveformData, requestPermission, isRecording: recorderRecording } = useRecorder()
const { addToQueue, interrupt, stop: stopPlayer, isPlaying: playerPlaying } = usePlayer()

// 设置面板
const showSettings = ref(false)

// 当前场景
const currentScene = ref(store.currentScene)

// 当前 AI 回复的缓冲（用于最终写入消息时带上纠错/评分）
let currentAiText = ''

// 同步录音/播放状态到 Store
watch(recorderRecording, (val) => setRecording(val))
watch(playerPlaying, (val) => setPlaying(val))

/** 按下：打断播放或开始录音 */
async function handleStart() {
  if (isConnected.value) {
    stopPlayer()
    sendMessage('interrupt', {})
  }
  // 检查麦克风权限
  const hasPermission = await requestPermission()
  if (!hasPermission) {
    setError('请允许麦克风权限')
    return
  }
  await startRecording()
}

/** 松开录音 */
async function handleStop() {
  setRecording(false)
  const base64 = await stopRecording()
  if (!base64) return

  setProcessing(true)
  sendMessage('audio', { audio: base64, messages: store.getLLMMessages() })
}

/** 处理语音识别结果 */
function handleTranscript(data) {
  addMessage('user', data.text)
  // 启动流式回复
  store.startReply()
  currentAiText = ''
}

/** 处理 LLM 流式片段 */
function handleLLMChunk(data) {
  currentAiText += data.text
  appendReply(data.text)
}

/** 处理 TTS 音频返回 */
function handleAudio(data) {
  // 结束流式回复，写入消息列表（带纠错和评分）
  store.finishReply()
  currentAiText = ''

  if (data.audio) {
    addToQueue(data.audio)
  }

  setProcessing(false)
}

/** 处理纠错内容 */
function handleCorrection(data) {
  store.setCorrection(data.text)
}

/** 处理评分 */
function handleScore(data) {
  if (data.score) {
    store.setScore(data.score, data.feedback || null)
  }
}

/** 场景切换 */
function handleSceneChange(scene) {
  currentScene.value = scene
  switchScene(scene)
  sendMessage('scene', { scene })
}

/** 设置变更 */
function handleSettingsChange(settings) {
  sendMessage('setting', settings)
}

/** 注册 WebSocket 回调 */
function registerCallbacks() {
  on('open', () => setConnected(true))
  on('close', () => setConnected(false))
  on('transcript', handleTranscript)
  on('llm_chunk', handleLLMChunk)
  on('audio', handleAudio)
  on('correction', handleCorrection)
  on('score', handleScore)
  on('error', (data) => {
    setError(data?.message || '服务器错误')
    setProcessing(false)
  })
}

onMounted(async () => {
  registerCallbacks()
  // 连接后发送初始设置
  try {
    await connectWebSocket()
    sendMessage('setting', {
      difficulty: localStorage.getItem('setting_difficulty') ? JSON.parse(localStorage.getItem('setting_difficulty')) : 'medium',
      voice: localStorage.getItem('setting_voice') ? JSON.parse(localStorage.getItem('setting_voice')) : 'alex',
      scene: currentScene.value,
    })
  } catch (err) {
    setError('WebSocket 连接失败')
  }
})

onUnmounted(() => {
  stopPlayer()
  disconnect()
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

.app__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app__title {
  font-size: 18px;
  font-weight: 600;
}

.app__scene {
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
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
