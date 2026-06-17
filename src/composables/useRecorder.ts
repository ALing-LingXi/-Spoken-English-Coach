import { ref } from 'vue'
import { useChatStore } from '@/store/chat'

/** 录音 Hook：麦克风权限、录音、base64 转换、波形数据 */
export function useRecorder() {
  const store = useChatStore()

  const mediaRecorder = ref<MediaRecorder | null>(null)
  const audioChunks = ref<Blob[]>([])
  const waveformData = ref<Uint8Array>(new Uint8Array(0))

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let animFrameId: number | null = null
  let sourceNode: MediaStreamAudioSourceNode | null = null
  let recordingStartTime = 0

  const MIN_RECORDING_DURATION = 500

  /** 请求麦克风权限 */
  async function requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      return true
    } catch {
      return false
    }
  }

  /** 实时更新波形数据 */
  function updateWaveform(): void {
    if (!analyser || !store.isRecording) return

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    waveformData.value = data

    animFrameId = requestAnimationFrame(updateWaveform)
  }

  /** 开始录音 */
  async function startRecording(): Promise<void> {
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

    mediaRecorder.value.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) audioChunks.value.push(e.data)
    }

    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    sourceNode = audioContext.createMediaStreamSource(stream)
    sourceNode.connect(analyser)

    mediaRecorder.value.start()
    store.setRecording(true)
    recordingStartTime = Date.now()

    updateWaveform()
  }

  /** 停止录音，返回 base64 音频（太短返回 null） */
  function stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        store.setRecording(false)
        releaseAudioResources()
        resolve(null)
        return
      }

      const duration = Date.now() - recordingStartTime
      if (duration < MIN_RECORDING_DURATION) {
        mediaRecorder.value.onstop = null
        mediaRecorder.value.stop()
        mediaRecorder.value.stream.getTracks().forEach((t) => t.stop())
        mediaRecorder.value = null
        store.setRecording(false)
        releaseAudioResources()
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = () => {
        const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
        blobToBase64(blob).then(resolve)
        mediaRecorder.value?.stream.getTracks().forEach((t) => t.stop())
        store.setRecording(false)
        releaseAudioResources()
      }

      mediaRecorder.value.stop()
    })
  }

  /** 释放音频分析资源 */
  function releaseAudioResources(): void {
    if (animFrameId !== null) {
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
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.readAsDataURL(blob)
    })
  }

  return {
    waveformData,
    requestPermission,
    startRecording,
    stopRecording,
  }
}
