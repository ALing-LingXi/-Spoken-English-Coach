<template>
  <div class="msg-input">
    <div class="msg-input__wrapper">
      <textarea
        ref="textareaRef"
        v-model="text"
        class="msg-input__textarea"
        placeholder="输入英语消息..."
        rows="1"
        @keydown.enter.exact="handleEnter"
        @input="autoResize"
      ></textarea>
      <button class="msg-input__send" :disabled="!text.trim()" @click="sendText">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
        </svg>
      </button>
    </div>
    <div class="msg-input__voice">
      <button
        class="msg-input__voice-btn"
        :class="{ recording: isRecording, playing: isPlaying }"
        @mousedown="handleVoiceStart"
        @mouseup="handleVoiceStop"
        @mouseleave="handleVoiceStop"
        @touchstart.prevent="handleVoiceStart"
        @touchend.prevent="handleVoiceStop"
      >
        <svg v-if="!isRecording && !isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <span v-else-if="isRecording" class="voice-pulse"></span>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>
      <span class="msg-input__voice-label">{{ voiceLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'

const store = useChatStore()
const { isRecording, isProcessing, isPlaying } = storeToRefs(store)

const props = defineProps({
  waveformData: { type: Object, default: () => new Uint8Array(0) },
})

const emit = defineEmits(['sendText', 'startRecording', 'stopRecording'])

const text = ref('')
const textareaRef = ref(null)

const voiceLabel = computed(() => {
  if (isProcessing.value && !isPlaying.value) return '处理中'
  if (isPlaying.value) return '点击打断'
  if (isRecording.value) return '松开停止'
  return '语音'
})

/** 发送文字 */
function sendText() {
  if (!text.value.trim()) return
  emit('sendText', text.value.trim())
  text.value = ''
  nextTick(() => autoResize())
}

/** Enter 发送，Shift+Enter 换行 */
function handleEnter(e) {
  if (e.shiftKey) return
  e.preventDefault()
  sendText()
}

/** 自动调整高度 */
function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

/** 语音按钮交互 */
function handleVoiceStart() {
  if (isProcessing.value && !isPlaying.value) return
  emit('startRecording')
}

function handleVoiceStop() {
  if (!isRecording.value) return
  emit('stopRecording')
}
</script>

<style scoped>
.msg-input {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 16px 32px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(18, 18, 30, 0.9);
  backdrop-filter: blur(20px);
}

.msg-input__wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: rgba(30, 30, 50, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: 10px 16px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.msg-input__wrapper:focus-within {
  border-color: rgba(108, 140, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(108, 140, 255, 0.08);
}

.msg-input__textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  font-family: inherit;
  max-height: 120px;
}

.msg-input__textarea::placeholder {
  color: var(--text-muted);
}

.msg-input__send {
  background: rgba(108, 140, 255, 0.15);
  border: 1px solid rgba(108, 140, 255, 0.3);
  color: var(--accent-purple);
  cursor: pointer;
  padding: 10px;
  border-radius: var(--radius-sm);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.msg-input__send:hover:not(:disabled) {
  background: rgba(108, 140, 255, 0.25);
  border-color: rgba(108, 140, 255, 0.5);
  transform: translateY(-1px);
}

.msg-input__send:active:not(:disabled) {
  transform: translateY(0);
}

.msg-input__send:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.msg-input__voice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.msg-input__voice-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(233, 69, 96, 0.3);
  background: rgba(233, 69, 96, 0.08);
  color: var(--accent-red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.msg-input__voice-btn:hover {
  background: rgba(233, 69, 96, 0.15);
  border-color: rgba(233, 69, 96, 0.5);
  transform: scale(1.05);
}

.msg-input__voice-btn:active {
  transform: scale(0.98);
}

.msg-input__voice-btn.recording {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.3), rgba(233, 69, 96, 0.15));
  border-color: var(--accent-red);
  animation: voice-pulse-anim 1.8s infinite;
}

.msg-input__voice-btn.playing {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.5);
  color: #34d399;
}

.voice-pulse {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent-red);
  animation: inner-pulse 0.5s infinite alternate;
}

.msg-input__voice-label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  font-weight: 500;
}

@keyframes voice-pulse-anim {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.4); 
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(233, 69, 96, 0); 
  }
}

@keyframes inner-pulse {
  from { transform: scale(0.7); opacity: 0.5; }
  to { transform: scale(1.3); opacity: 1; }
}
</style>
