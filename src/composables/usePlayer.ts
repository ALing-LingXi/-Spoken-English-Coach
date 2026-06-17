import { ref, computed } from 'vue'
import { useChatStore } from '@/store/chat'

/** 音频播放 Hook：队列管理、播放打断 */
export function usePlayer() {
  const currentAudio = ref<HTMLAudioElement | null>(null)
  const queue = ref<string[]>([])

  /** 当前播放音频的 ObjectURL，用于释放 */
  let currentUrl: string | null = null

  /** base64 转 Audio URL */
  function base64ToAudioUrl(base64Audio: string): string {
    const binary = atob(base64Audio)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'audio/mp3' })
    return URL.createObjectURL(blob)
  }

  /** 播放单条音频 */
  function playAudio(base64Audio: string): Promise<void> {
    const store = useChatStore()
    return new Promise((resolve) => {
      stopCurrent()

      const url = base64ToAudioUrl(base64Audio)
      currentUrl = url
      const audio = new Audio(url)
      currentAudio.value = audio
      store.setPlaying(true)

      audio.onended = () => {
        store.setPlaying(false)
        currentAudio.value = null
        revokeCurrentUrl()
        resolve()
      }

      audio.onerror = () => {
        store.setPlaying(false)
        currentAudio.value = null
        revokeCurrentUrl()
        resolve()
      }

      audio.play().catch(() => {
        store.setPlaying(false)
        currentAudio.value = null
        revokeCurrentUrl()
        resolve()
      })
    })
  }

  /** 释放当前 ObjectURL */
  function revokeCurrentUrl(): void {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
      currentUrl = null
    }
  }

  /** 停止当前播放（不清队列） */
  function stopCurrent(): void {
    const store = useChatStore()
    if (currentAudio.value) {
      currentAudio.value.onended = null
      currentAudio.value.onerror = null
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value = null
    }
    revokeCurrentUrl()
    store.setPlaying(false)
  }

  /** 完全停止：停当前 + 清空队列 */
  function stop(): void {
    stopCurrent()
    queue.value = []
  }

  /** 打断当前播放，但保留队列 */
  function interrupt(): void {
    stopCurrent()
    playNext()
  }

  /** 添加到队列并自动播放 */
  function addToQueue(base64Audio: string): void {
    const store = useChatStore()
    queue.value.push(base64Audio)
    if (!store.isPlaying) {
      playNext()
    }
  }

  /** 播放队列中下一条 */
  async function playNext(): Promise<void> {
    if (queue.value.length === 0) return

    const next = queue.value.shift()!
    await playAudio(next)
    // 播放完成后继续下一条（如果未被停止）
    const store = useChatStore()
    if (!store.isPlaying && queue.value.length > 0) {
      playNext()
    }
  }

  /** 清空队列 */
  function clearQueue(): void {
    queue.value = []
  }

  return {
    addToQueue,
    stop,
    interrupt,
    clearQueue,
    isPlaying: computed(() => {
      const store = useChatStore()
      return store.isPlaying
    }),
  }
}
