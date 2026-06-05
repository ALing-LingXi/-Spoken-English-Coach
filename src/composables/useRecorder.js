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

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      }
    })
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

  /** 停止录音，返回 base64 音频数据（WAV 格式） */
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        store.setRecording(false)
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = async () => {
        mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
        store.setRecording(false)

        if (audioChunks.value.length === 0) {
          resolve(null)
          return
        }

        const webmBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
        const wavBase64 = await webmToWavBase64(webmBlob)
        resolve(wavBase64)
      }

      mediaRecorder.value.stop()
    })
  }

  /** 将 WebM Blob 转为 WAV 格式的 base64 */
  async function webmToWavBase64(webmBlob) {
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioCtx = new AudioContext({ sampleRate: 16000 })
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const wavBuffer = encodeWav(audioBuffer)
    await audioCtx.close()
    return arrayBufferToBase64(wavBuffer)
  }

  /** 将 AudioBuffer 编码为 WAV 格式的 ArrayBuffer */
  function encodeWav(audioBuffer) {
    const numChannels = 1
    const sampleRate = audioBuffer.sampleRate
    const pcmData = audioBuffer.getChannelData(0)
    const dataLength = pcmData.length * 2
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)

    let offset = 44
    for (let i = 0; i < pcmData.length; i++) {
      const sample = Math.max(-1, Math.min(1, pcmData[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }

    return buffer
  }

  /** 向 DataView 写入 ASCII 字符串 */
  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  /** ArrayBuffer 转 base64 字符串 */
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  return { requestPermission, startRecording, stopRecording }
}
