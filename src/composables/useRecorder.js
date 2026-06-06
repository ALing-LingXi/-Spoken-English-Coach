import { ref } from 'vue'

/**
 * 录音 Hook：麦克风权限、录音、base64 转换
 */
export function useRecorder() {
  const isRecording = ref(false)
  const mediaRecorder = ref(null)
  const audioChunks = ref([])

  /** 请求麦克风权限 */
  async function requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 立即释放，录音时会重新获取
      stream.getTracks().forEach((t) => t.stop())
      return true
    } catch {
      return false
    }
  }

  /** 开始录音 */
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    audioChunks.value = []
    mediaRecorder.value = new MediaRecorder(stream, { mimeType: 'audio/webm' })

    mediaRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.value.push(e.data)
    }

    mediaRecorder.value.start()
    isRecording.value = true
  }

  /** 停止录音，返回 base64 音频 */
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        isRecording.value = false
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = () => {
        const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
        blobToBase64(blob).then(resolve)
        // 释放麦克风
        mediaRecorder.value.stream.getTracks().forEach((t) => t.stop())
        isRecording.value = false
      }

      mediaRecorder.value.stop()
    })
  }

  /** Blob 转 base64 */
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

  return {
    isRecording,
    requestPermission,
    startRecording,
    stopRecording,
  }
}
