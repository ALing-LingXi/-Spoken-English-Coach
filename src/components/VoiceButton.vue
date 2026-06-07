<template>
  <div class="voice-btn-wrapper">
    <!-- 脉冲波纹 -->
    <div v-if="isRecording" class="voice-btn__pulse"></div>
    <div v-if="isRecording" class="voice-btn__pulse voice-btn__pulse--delay"></div>

    <!-- 环形频谱 canvas -->
    <canvas ref="canvasRef" :width="canvasSize" :height="canvasSize" class="voice-btn-canvas" />

    <!-- 中心按钮 -->
    <button class="voice-btn" :class="{
      'voice-btn--recording': isRecording,
      'voice-btn--processing': isProcessing && !isPlaying,
      'voice-btn--playing': isPlaying,
    }" :disabled="isProcessing && !isPlaying" @mousedown="handleStart" @mouseup="handleStop"
      @touchstart.prevent="handleStart" @touchend.prevent="handleStop">
      <svg v-if="!isRecording && !isProcessing && !isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
      <svg v-else-if="isRecording" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
      <div v-else class="voice-btn__spinner"></div>
    </button>

    <!-- 状态文字 -->
    <span class="voice-btn__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store/chat'

const props = defineProps({
  waveformData: { type: Object, default: () => new Uint8Array(0) },
})

const emit = defineEmits(['start', 'stop', 'interrupt'])

const store = useChatStore()
const { isRecording, isProcessing, isPlaying } = storeToRefs(store)

const canvasRef = ref(null)
const canvasSize = 180
const animFrameId = ref(null)

const label = computed(() => {
  if (isProcessing.value && !isPlaying.value) return '处理中...'
  if (isPlaying.value) return '点击打断'
  if (isRecording.value) return '松开结束'
  return '按住说话'
})

function handleStart() {
  // 正在处理中（非播放状态），禁止操作
  if (isProcessing.value && !isPlaying.value) return
  // 正在播放，先打断再开始录音
  if (isPlaying.value) {
    emit('interrupt')
    // 延迟一小段时间再开始录音，确保播放完全停止
    setTimeout(() => {
      emit('start')
    }, 100)
    return
  }
  emit('start')
}

function handleStop() {
  if (!isRecording.value) return
  emit('stop')
}

function drawSpectrum() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const cx = canvasSize / 2
  const cy = canvasSize / 2
  const innerRadius = 36
  const maxBarHeight = 32

  ctx.clearRect(0, 0, canvasSize, canvasSize)

  const data = props.waveformData
  if (!data || data.length === 0) {
    animFrameId.value = requestAnimationFrame(drawSpectrum)
    return
  }

  const barCount = Math.min(data.length, 64)
  const step = Math.floor(data.length / barCount)
  const angleStep = (Math.PI * 2) / barCount

  for (let i = 0; i < barCount; i++) {
    const value = data[i * step] / 255
    const barHeight = Math.max(2, value * maxBarHeight)
    const angle = i * angleStep - Math.PI / 2

    const x1 = cx + Math.cos(angle) * innerRadius
    const y1 = cy + Math.sin(angle) * innerRadius
    const x2 = cx + Math.cos(angle) * (innerRadius + barHeight)
    const y2 = cy + Math.sin(angle) * (innerRadius + barHeight)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = isRecording.value
      ? `rgba(108, 140, 255, ${0.3 + value * 0.7})`
      : `rgba(108, 140, 255, ${0.2 + value * 0.5})`
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  animFrameId.value = requestAnimationFrame(drawSpectrum)
}

watch(isRecording, (recording) => {
  if (recording) {
    drawSpectrum()
  } else if (animFrameId.value) {
    cancelAnimationFrame(animFrameId.value)
    animFrameId.value = null
    const canvas = canvasRef.value
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvasSize, canvasSize)
  }
})
</script>

<style scoped>
.voice-btn-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}

.voice-btn-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  pointer-events: none;
}

/* 中心按钮 */
.voice-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid var(--accent-purple);
  background: rgba(108, 140, 255, 0.1);
  color: var(--accent-purple);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.voice-btn:active {
  transform: scale(0.92);
}

.voice-btn--recording {
  background: var(--accent-purple);
  color: #fff;
  border-color: var(--accent-purple);
  box-shadow: 0 0 24px rgba(108, 140, 255, 0.4);
  animation: btn-breathe 1.5s ease-in-out infinite;
}

.voice-btn--processing {
  border-color: var(--text-muted);
  color: var(--text-muted);
  background: rgba(30, 30, 50, 0.7);
  cursor: not-allowed;
}

.voice-btn--playing {
  border-color: #34d399;
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
}

@keyframes btn-breathe {

  0%,
  100% {
    box-shadow: 0 0 24px rgba(108, 140, 255, 0.4);
  }

  50% {
    box-shadow: 0 0 40px rgba(108, 140, 255, 0.4), 0 0 60px rgba(108, 140, 255, 0.15);
  }
}

/* 脉冲波纹 */
.voice-btn__pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid var(--accent-purple);
  transform: translate(-50%, -65%);
  z-index: 0;
  animation: pulse-ring 2s ease-out infinite;
}

.voice-btn__pulse--delay {
  animation-delay: 0.6s;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -65%) scale(1);
    opacity: 0.6;
  }

  100% {
    transform: translate(-50%, -65%) scale(1.8);
    opacity: 0;
  }
}

/* 加载旋转 */
.voice-btn__spinner {
  width: 22px;
  height: 22px;
  border: 2px solid var(--text-muted);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 状态文字 */
.voice-btn__label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.3px;
}
</style>
