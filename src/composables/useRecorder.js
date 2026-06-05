import { ref } from 'vue'
import { useChatStore } from '../store/chat'

/** 录音 Hook：提供麦克风权限申请、录音控制、音频转 base64 */
export function useRecorder() {
  const store = useChatStore()
  const mediaRecorder = ref(null)
  const audioChunks = ref([])

  /** 请求麦克风权限 */
  async function requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 获取权限后立即释放，录音时再重新获取
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err) {
      console.error('[Recorder] 麦克风权限获取失败:', err.message)
      store.setError('麦克风权限被拒绝')
      return false
    }
  }

  /** 开始录音 */
  async function startRecording() {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.value.push(e.data)
      }
    }

    mediaRecorder.value.start()
    store.setRecording(true)
  }

  /** 停止录音，返回 base64 音频数据 */
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        store.setRecording(false)
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = async () => {
        // 释放麦克风
        mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
        store.setRecording(false)

        if (audioChunks.value.length === 0) {
          resolve(null)
          return
        }

        const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
        const base64 = await blobToBase64(blob)
        resolve(base64)
      }

      mediaRecorder.value.stop()
    })
  }

  /** Blob 转 base64 字符串 */
  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // 去掉 data:audio/webm;base64, 前缀
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.readAsDataURL(blob)
    })
  }

  return { requestPermission, startRecording, stopRecording, blobToBase64 }
}
