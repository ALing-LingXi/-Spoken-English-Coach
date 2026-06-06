import { ref } from 'vue'

/**
 * 音频播放 Hook：播放 base64 音频、播放状态管理
 */
export function usePlayer() {
  const isPlaying = ref(false)
  const currentAudio = ref(null)

  /** 播放 base64 音频 */
  function playAudio(base64Audio) {
    return new Promise((resolve) => {
      stop()

      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
      currentAudio.value = audio
      isPlaying.value = true

      audio.onended = () => {
        isPlaying.value = false
        currentAudio.value = null
        resolve()
      }

      audio.onerror = () => {
        isPlaying.value = false
        currentAudio.value = null
        resolve()
      }

      audio.play().catch(() => {
        isPlaying.value = false
        currentAudio.value = null
        resolve()
      })
    })
  }

  /** 停止播放 */
  function stop() {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value = null
    }
    isPlaying.value = false
  }

  return {
    isPlaying,
    playAudio,
    stop,
  }
}
