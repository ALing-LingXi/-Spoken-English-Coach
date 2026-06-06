<template>
  <el-button
    :type="isRecording ? 'danger' : 'primary'"
    :disabled="isProcessing || isPlaying"
    :loading="isProcessing || isPlaying"
    size="large"
    round
    class="voice-btn"
    @mousedown="handleStart"
    @mouseup="handleStop"
    @mouseleave="handleStop"
    @touchstart.prevent="handleStart"
    @touchend.prevent="handleStop"
  >
    <el-icon :size="24" class="voice-btn__icon">
      <Microphone v-if="!isRecording" />
      <VideoPause v-else />
    </el-icon>
    <span class="voice-btn__label">{{ label }}</span>
  </el-button>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Microphone, VideoPause } from '@element-plus/icons-vue'
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
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
}

.voice-btn__icon {
  font-size: 24px;
}

.voice-btn__label {
  font-size: 14px;
}
</style>
