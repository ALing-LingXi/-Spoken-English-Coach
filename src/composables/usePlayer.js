import { ref } from 'vue'
import { useChatStore } from '../store/chat'

// 播放队列
const queue = ref([])
let isPlayingQueue = false
let currentAudio = null

/** 将 base64 音频数据转为可播放的 Blob URL */
function base64ToAudioUrl(base64Str) {
  const binaryStr = atob(base64Str)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'audio/mp3' })
  return URL.createObjectURL(blob)
}

/** 播放单条音频 */
function playAudio(base64Str) {
  return new Promise((resolve) => {
    const url = base64ToAudioUrl(base64Str)
    const audio = new Audio(url)
    currentAudio = audio
    const store = useChatStore()
    store.setPlaying(true)

    audio.onended = () => {
      store.setPlaying(false)
      currentAudio = null
      URL.revokeObjectURL(url)
      resolve()
    }

    audio.onerror = () => {
      console.error('[Player] 音频播放失败')
      store.setPlaying(false)
      currentAudio = null
      URL.revokeObjectURL(url)
      resolve()
    }

    audio.play().catch((err) => {
      console.error('[Player] 播放启动失败:', err.message)
      store.setPlaying(false)
      currentAudio = null
      URL.revokeObjectURL(url)
      resolve()
    })
  })
}

/** 依次播放队列中的音频 */
async function processQueue() {
  if (isPlayingQueue) return
  isPlayingQueue = true

  while (queue.value.length > 0) {
    const base64Str = queue.value.shift()
    await playAudio(base64Str)
  }

  isPlayingQueue = false
}

/** 添加音频到播放队列 */
function addToQueue(base64Str) {
  queue.value.push(base64Str)
  processQueue()
}

/** 清空播放队列并停止当前播放 */
function clearQueue() {
  queue.value = []
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  isPlayingQueue = false
  const store = useChatStore()
  store.setPlaying(false)
}

export function usePlayer() {
  return { playAudio, addToQueue, clearQueue }
}
