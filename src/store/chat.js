import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  /** 添加消息 */
  function addMessage(msg) {
    messages.value.push(msg)
  }

  /** 设置连接状态 */
  function setConnected(val) {
    isConnected.value = val
  }

  /** 设置录音状态 */
  function setRecording(val) {
    isRecording.value = val
  }

  /** 设置处理状态 */
  function setProcessing(val) {
    isProcessing.value = val
  }

  /** 设置播放状态 */
  function setPlaying(val) {
    isPlaying.value = val
  }

  /** 设置错误信息 */
  function setError(msg) {
    error.value = msg
  }

  /** 清除错误信息 */
  function clearError() {
    error.value = null
  }

  return {
    messages, isConnected, isRecording, isProcessing, isPlaying, error,
    addMessage, setConnected, setRecording, setProcessing, setPlaying,
    setError, clearError
  }
})
