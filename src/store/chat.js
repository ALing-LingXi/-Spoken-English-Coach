import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const MAX_MESSAGES = 100

export const useChatStore = defineStore('chat', () => {
  // 当前场景
  const currentScene = ref(loadFromStorage('currentScene', 'daily'))

  // 消息列表
  const messages = ref(loadMessages(currentScene.value))

  // 连接与交互状态
  const isConnected = ref(false)
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const isPlaying = ref(false)

  // 错误信息
  const error = ref(null)

  // 当前 AI 回复（流式拼接中）
  const currentReply = ref('')

  // 当前回复的纠错内容（流式结束后与回复一起写入消息）
  const lastCorrection = ref(null)

  // 当前回复的评分（流式结束后与回复一起写入消息）
  const lastScore = ref(null)
  const lastFeedback = ref(null)

  // 是否正在等待 AI 回复
  const isWaitingReply = computed(() => isProcessing.value && !isPlaying.value)

  /** 添加消息 */
  function addMessage(role, content, correction = null, score = null, feedback = null) {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      correction,
      score,
      feedback,
      timestamp: new Date().toLocaleTimeString(),
    })
    // 超过上限自动清理旧消息
    if (messages.value.length > MAX_MESSAGES) {
      messages.value = messages.value.slice(-MAX_MESSAGES)
    }
    saveMessages()
  }

  /** 获取用于 LLM 的消息历史（最近 10 轮） */
  function getLLMMessages() {
    // 只取最近 20 条消息（约 10 轮对话）
    const recent = messages.value.slice(-20)
    return recent.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))
  }

  /** 开始流式回复 */
  function startReply() {
    currentReply.value = ''
    isProcessing.value = true
  }

  /** 追加流式文字 */
  function appendReply(chunk) {
    currentReply.value += chunk
  }

  /** 结束流式回复，写入消息列表 */
  function finishReply() {
    if (currentReply.value) {
      addMessage('assistant', currentReply.value, lastCorrection.value, lastScore.value, lastFeedback.value)
    }
    currentReply.value = ''
    lastCorrection.value = null
    lastScore.value = null
    lastFeedback.value = null
    isProcessing.value = false
  }

  /** 设置纠错内容 */
  function setCorrection(text) {
    lastCorrection.value = text
  }

  /** 设置评分 */
  function setScore(score, feedback) {
    lastScore.value = score
    lastFeedback.value = feedback
  }

  /** 设置连接状态 */
  function setConnected(val) {
    isConnected.value = val
  }

  /** 设置录音状态 */
  function setRecording(val) {
    isRecording.value = val
  }

  /** 设置播放状态 */
  function setPlaying(val) {
    isPlaying.value = val
  }

  /** 设置处理状态 */
  function setProcessing(val) {
    isProcessing.value = val
  }

  /** 设置错误 */
  function setError(msg) {
    error.value = msg
  }

  /** 清除错误 */
  function clearError() {
    error.value = null
  }

  /** 清空消息 */
  function clearMessages() {
    messages.value = []
    currentReply.value = ''
    saveMessages()
  }

  /** 切换场景 */
  function switchScene(scene) {
    currentScene.value = scene
    saveToStorage('currentScene', scene)
    messages.value = loadMessages(scene)
    currentReply.value = ''
  }

  /** 保存消息到 localStorage */
  function saveMessages() {
    const key = `chat_messages_${currentScene.value}`
    saveToStorage(key, messages.value)
  }

  /** 从 localStorage 加载消息 */
  function loadMessages(scene) {
    return loadFromStorage(`chat_messages_${scene}`, [])
  }

  return {
    messages,
    currentScene,
    isConnected,
    isRecording,
    isProcessing,
    isPlaying,
    error,
    currentReply,
    isWaitingReply,
    addMessage,
    getLLMMessages,
    startReply,
    appendReply,
    finishReply,
    setCorrection,
    setScore,
    setConnected,
    setRecording,
    setPlaying,
    setProcessing,
    setError,
    clearError,
    clearMessages,
    switchScene,
  }
})

/** localStorage 工具函数 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 满了，忽略
  }
}

function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}
