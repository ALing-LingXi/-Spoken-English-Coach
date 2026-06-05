/**
 * 聊天状态管理 (Pinia Store)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref([])
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const isPlaying = ref(false)
  const currentTranscript = ref('')
  const error = ref(null)

  // 计算属性
  const messageCount = computed(() => messages.value.length)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])

  // 操作方法
  function addMessage(message) {
    messages.value.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...message,
    })
  }

  function updateMessage(id, updates) {
    const index = messages.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function setRecording(status) {
    isRecording.value = status
  }

  function setProcessing(status) {
    isProcessing.value = status
  }

  function setPlaying(status) {
    isPlaying.value = status
  }

  function setTranscript(text) {
    currentTranscript.value = text
  }

  function setError(err) {
    error.value = err
  }

  function clearError() {
    error.value = null
  }

  return {
    // 状态
    messages,
    isRecording,
    isProcessing,
    isPlaying,
    currentTranscript,
    error,
    // 计算属性
    messageCount,
    lastMessage,
    // 方法
    addMessage,
    updateMessage,
    clearMessages,
    setRecording,
    setProcessing,
    setPlaying,
    setTranscript,
    setError,
    clearError,
  }
})
