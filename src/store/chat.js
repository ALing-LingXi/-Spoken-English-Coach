import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 消息列表
  const messages = ref([])

  // 连接与交互状态
  const isConnected = ref(false)
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const isPlaying = ref(false)

  // 错误信息
  const error = ref(null)

  // 当前 AI 回复（流式拼接中）
  const currentReply = ref('')

  // 是否正在等待 AI 回复
  const isWaitingReply = computed(() => isProcessing.value && !isPlaying.value)

  /** 添加消息 */
  function addMessage(role, content) {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toLocaleTimeString(),
    })
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
      addMessage('assistant', currentReply.value)
    }
    currentReply.value = ''
    isProcessing.value = false
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
  }

  return {
    messages,
    isConnected,
    isRecording,
    isProcessing,
    isPlaying,
    error,
    currentReply,
    isWaitingReply,
    addMessage,
    startReply,
    appendReply,
    finishReply,
    setConnected,
    setRecording,
    setPlaying,
    setError,
    clearError,
    clearMessages,
  }
})
