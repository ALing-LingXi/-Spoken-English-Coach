<template>
  <div class="voice-btn-wrapper">
    <!-- 环形频谱 canvas -->
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      class="voice-btn-canvas"
    />

    <!-- 中心按钮 -->
    <el-button
      :type="isRecording ? 'danger' : 'primary'"
      :disabled="isProcessing && !isPlaying"
      :loading="isProcessing && !isPlaying"
      circle
      size="large"
      class="voice-btn"
      @mousedown="handleStart"
      @mouseup="handleStop"
      @mouseleave="handleStop"
      @touchstart.prevent="handleStart"
      @touchend.prevent="handleStop"
    >
      <el-icon :size="28">
        <Microphone v-if="!isRecording && !isPlaying" />
        <VideoPause v-else-if="isRecording" />
        <VideoPlay v-else />
      </el-icon>
    </el-button>

    <!-- 状态文字 -->
    <span class="voice-btn__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Microphone, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { useChatStore } from '../store/chat'

const props = defineProps({
  waveformData: { type: Object, default: () => new Uint8Array(0) },
})

const emit = defineEmits(['start', 'stop'])

const store = useChatStore()
const { isRecording, isProcessing, isPlaying } = storeToRefs(store)

const canvasRef = ref(null)
const canvasSize = 160
const animFrameId = ref(null)

const label = computed(() => {
  if (isProcessing.value && !isPlaying.value) return '处理中...'
  if (isPlaying.value) return '点击打断'
  if (isRecording.value) return '松开停止'
  return '按住说话'
})

/** 按下：如果正在播放则打断，否则开始录音 */
function handleStart() {
  if (isProcessing.value && !isPlaying.value) return
  emit('start')
}

/** 松开：停止录音 */
function handleStop() {
  if (!isRecording.value) return
  emit('stop')
}

/** 绘制环形频谱 */
function drawSpectrum() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const cx = canvasSize / 2
  const cy = canvasSize / 2
  const innerRadius = 38
  const maxBarHeight = 28

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
      ? `rgba(245, 108, 108, ${0.4 + value * 0.6})`
      : `rgba(64, 158, 255, ${0.4 + value * 0.6})`
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  animFrameId.value = requestAnimationFrame(drawSpectrum)
}

// 录音状态变化时启动/停止动画
watch(isRecording, (recording) => {
  if (recording) {
    drawSpectrum()
  } else if (animFrameId.value) {
    cancelAnimationFrame(animFrameId.value)
    animFrameId.value = null
    // 清空 canvas
    const canvas = canvasRef.value
    if (canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvasSize, canvasSize)
    }
  }
})
</script>

<style scoped>
.voice-btn-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.voice-btn-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  pointer-events: none;
}

.voice-btn {
  width: 64px;
  height: 64px;
  position: relative;
  z-index: 1;
  transition: transform 0.15s ease;
}

.voice-btn:active {
  transform: scale(0.92);
}

.voice-btn__label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
