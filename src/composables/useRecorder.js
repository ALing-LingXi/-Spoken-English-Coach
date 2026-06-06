import { ref } from 'vue'

/**
 * 录音 Hook：麦克风权限、录音、base64 转换、波形数据
 */
export function useRecorder() {
  const isRecording = ref(false)
  const mediaRecorder = ref(null)
  const audioChunks = ref([])

  // 波形分析
  const waveformData = ref(new Uint8Array(0))
  let audioContext = null
  let analyser = null
  let animFrameId = null
  let sourceNode = null

  /** 请求麦克风权限 */
  async function requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      return true
    } catch {
      return false
    }
  }

  /** 实时更新波形数据 */
  function updateWaveform() {
    if (!analyser || !isRecording.value) return

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    waveformData.value = data

    animFrameId = requestAnimationFrame(updateWaveform)
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

    // 创建音频分析节点
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    sourceNode = audioContext.createMediaStreamSource(stream)
    sourceNode.connect(analyser)

    mediaRecorder.value.start()
    isRecording.value = true

    // 启动波形数据更新
    updateWaveform()
  }

  /** 停止录音，返回 base64 音频 */
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        isRecording.value = false
        releaseAudioResources()
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = () => {
        const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
        blobToBase64(blob).then(resolve)
        mediaRecorder.value.stream.getTracks().forEach((t) => t.stop())
        isRecording.value = false
        releaseAudioResources()
      }

      mediaRecorder.value.stop()
    })
  }

  /** 释放音频分析资源 */
  function releaseAudioResources() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (sourceNode) {
      sourceNode.disconnect()
      sourceNode = null
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    analyser = null
    waveformData.value = new Uint8Array(0)
  }

  /** Blob 转 base64 */
  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.readAsDataURL(blob)
    })
  }

  return {
    isRecording,
    waveformData,
    requestPermission,
    startRecording,
    stopRecording,
  }
}
