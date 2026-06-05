<template>
  <button
    class="voice-btn"
    :class="{ 'voice-btn--recording': isRecording, 'voice-btn--disabled': isProcessing || isPlaying }"
    :disabled="isProcessing || isPlaying"
    @mousedown="handleStart"
    @mouseup="handleStop"
    @mouseleave="handleStop"
    @touchstart.prevent="handleStart"
    @touchend.prevent="handleStop"
  >
    <span class="voice-btn__icon">{{ isRecording ? '⏹' : '🎤' }}</span>
    <span class="voice-btn__label">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

const emit = defineEmits(['start', 'stop'])

const store = useChatStore()
const { isRecording, isProcessing, isPlaying } = storeToRefs(store)

const label = computed(() => {
  if (isProcessing.value) return '处理中...'
  if (isPlaying.value) return '播放中...'
  if (isRecording.value) return '松开停止'
  return '按住说话'
})

function handleStart() {
  if (isProcessing.value || isPlaying.value) return
  emit('start')
}

function handleStop() {
  if (!isRecording.value) return
  emit('stop')
}
</script>

<style scoped>
.voice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 32px;
  border: none;
  border-radius: 16px;
  background: #4a90d9;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: background 0.2s, transform 0.1s;
}

.voice-btn:active:not(.voice-btn--disabled) {
  transform: scale(0.96);
}

.voice-btn--recording {
  background: #e74c3c;
}

.voice-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn__icon {
  font-size: 32px;
}

.voice-btn__label {
  font-size: 14px;
}
</style>
