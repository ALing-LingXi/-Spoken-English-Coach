import { ref } from 'vue'

/**
 * 音频播放 Hook：队列管理、播放打断
 */
export function usePlayer() {
  const isPlaying = ref(false)
  const currentAudio = ref(null)
  const queue = ref([])

  /** base64 转 Audio URL */
  function base64ToAudioUrl(base64Audio) {
    const binary = atob(base64Audio)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'audio/mp3' })
    return URL.createObjectURL(blob)
  }

  /** 播放单条音频 */
  function playAudio(base64Audio) {
    return new Promise((resolve) => {
      stopCurrent()

      const url = base64ToAudioUrl(base64Audio)
      const audio = new Audio(url)
      currentAudio.value = audio
      isPlaying.value = true

      audio.onended = () => {
        isPlaying.value = false
        currentAudio.value = null
        URL.revokeObjectURL(url)
        resolve()
      }

      audio.onerror = () => {
        isPlaying.value = false
        currentAudio.value = null
        URL.revokeObjectURL(url)
        resolve()
      }

      audio.play().catch(() => {
        isPlaying.value = false
        currentAudio.value = null
        URL.revokeObjectURL(url)
        resolve()
      })
    })
  }

  /** 停止当前播放（不清队列） */
  function stopCurrent() {
    if (currentAudio.value) {
      currentAudio.value.onended = null
      currentAudio.value.onerror = null
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value = null
    }
    isPlaying.value = false
  }

  /** 完全停止：停当前 + 清空队列 */
  function stop() {
    stopCurrent()
    queue.value = []
  }

  /** 打断当前播放，但保留队列 */
  function interrupt() {
    stopCurrent()
    // 队列中下一条会由 playNext 继续
    playNext()
  }

  /** 添加到队列并自动播放 */
  function addToQueue(base64Audio) {
    queue.value.push(base64Audio)
    if (!isPlaying.value) {
      playNext()
    }
  }

  /** 播放队列中下一条 */
  async function playNext() {
    if (queue.value.length === 0) return

    const next = queue.value.shift()
    await playAudio(next)
    // 播完自动播下一条
    playNext()
  }

  /** 清空队列 */
  function clearQueue() {
    queue.value = []
  }

  return {
    isPlaying,
    addToQueue,
    stop,
    interrupt,
    clearQueue,
  }
}
