<template>
  <div class="chat-area">
    <!-- 消息列表 -->
    <div class="chat-area__messages" ref="messagesRef">
      <!-- 空状态 -->
      <div v-if="messages.length === 0 && !currentReply" class="chat-area__empty">
        <div class="chat-area__empty-bg"></div>
        <div class="chat-area__empty-content">
          <div class="chat-area__empty-icon-wrapper">
            <div class="chat-area__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <div class="chat-area__empty-ring chat-area__empty-ring--outer"></div>
            <div class="chat-area__empty-ring chat-area__empty-ring--inner"></div>
          </div>
          <h2 class="chat-area__empty-title">开始你的英语练习之旅</h2>
          <p class="chat-area__empty-desc">输入文字或按住语音按钮，开启与 AI 的对话练习</p>
          <div class="chat-area__empty-tips">
            <div class="tip-item">💬 支持日常、商务、旅行等多种场景</div>
            <div class="tip-item">🎯 智能纠错与发音评分</div>
            <div class="tip-item">🔊 语音交互更自然</div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="msg in messages" :key="msg.id" class="chat-msg" :class="`chat-msg--${msg.role}`">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="chat-msg__bubble chat-msg__bubble--user">
          <p>{{ msg.content }}</p>
          <span v-if="msg.timestamp" class="chat-msg__time">{{ msg.timestamp }}</span>
        </div>

        <!-- AI 消息 -->
        <div v-else class="chat-msg__ai-row">
          <div class="chat-msg__avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div class="chat-msg__bubble chat-msg__bubble--ai">
            <p>{{ msg.content }}</p>
            <span v-if="msg.timestamp" class="chat-msg__time">{{ msg.timestamp }}</span>
            <!-- 纠错 -->
            <div v-if="msg.correction" class="chat-msg__correction">
              <span class="correction-badge">纠错</span>
              <span class="correction-text">{{ msg.correction }}</span>
            </div>
            <!-- 评分 -->
            <div v-if="msg.score" class="chat-msg__score">
              <span class="score-stars">{{ '★'.repeat(msg.score) }}{{ '☆'.repeat(5 - msg.score) }}</span>
              <span v-if="msg.feedback" class="score-feedback">{{ msg.feedback }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 流式回复 -->
      <div v-if="currentReply" class="chat-msg chat-msg--assistant chat-msg--typing">
        <div class="chat-msg__ai-row">
          <div class="chat-msg__avatar chat-msg__avatar--typing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div class="chat-msg__bubble chat-msg__bubble--ai">
            <p class="typing-text">{{ currentReply }}<span class="typing-cursor"></span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <MessageInput
      :waveformData="waveformData"
      @sendText="handleSendText"
      @startRecording="$emit('startRecording')"
      @stopRecording="$emit('stopRecording')"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chat'
import { sendMessage } from '../api/ws'
import MessageInput from './MessageInput.vue'

const store = useChatStore()
const { messages, currentReply } = storeToRefs(store)
const messagesRef = ref(null)

const props = defineProps({
  waveformData: { type: Object, default: () => new Uint8Array(0) },
})

const emit = defineEmits(['startRecording', 'stopRecording'])

/** 发送文字消息 */
function handleSendText(text) {
  store.addMessage('user', text)
  store.startReply()
  sendMessage('text', { text, messages: store.getLLMMessages() })
}

// 新消息或流式更新时自动滚动到底部
watch(
  () => [messages.value.length, currentReply.value],
  () => {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.chat-area__messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 空状态 */
.chat-area__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  position: relative;
}

.chat-area__empty-bg {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(108, 140, 255, 0.1) 0%, transparent 70%);
  animation: pulse-glow 4s ease-in-out infinite;
}

.chat-area__empty-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.chat-area__empty-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
}

.chat-area__empty-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  color: var(--accent-purple);
  animation: float 3s ease-in-out infinite;
}

.chat-area__empty-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(108, 140, 255, 0.2);
  animation: ring-expand 3s ease-in-out infinite;
}

.chat-area__empty-ring--outer {
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}

.chat-area__empty-ring--inner {
  width: 60px;
  height: 60px;
  animation-delay: 0.5s;
}

.chat-area__empty-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.chat-area__empty-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 24px;
}

.chat-area__empty-tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.tip-item {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 消息通用 */
.chat-msg {
  animation: msg-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-msg--user {
  display: flex;
  justify-content: flex-end;
}

.chat-msg--assistant {
  display: flex;
  justify-content: flex-start;
}

.chat-msg--typing .chat-msg__avatar {
  animation: avatar-bounce 1.5s ease-in-out infinite;
}

.chat-msg__ai-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  max-width: 75%;
}

.chat-msg__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(108, 140, 255, 0.3);
  transition: transform 0.2s;
}

.chat-msg__avatar:hover {
  transform: scale(1.05);
}

/* 气泡 */
.chat-msg__bubble {
  max-width: 75%;
  padding: 14px 18px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.75;
  word-break: break-word;
  position: relative;
}

.chat-msg__bubble p {
  margin: 0;
}

.chat-msg__time {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 6px;
}

.chat-msg__bubble--user {
  background: linear-gradient(135deg, var(--accent-red), #c93048);
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 4px 16px rgba(233, 69, 96, 0.3);
}

.chat-msg__bubble--user .chat-msg__time {
  text-align: right;
}

.chat-msg__bubble--ai {
  background: rgba(35, 35, 55, 0.85);
  color: var(--text-primary);
  border-bottom-left-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.chat-msg__bubble--ai::before {
  content: '';
  position: absolute;
  top: 14px;
  left: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid rgba(35, 35, 55, 0.85);
}

/* 纠错 */
.chat-msg__correction {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(245, 166, 35, 0.1);
  border-radius: 10px;
  border-left: 3px solid var(--accent-gold);
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.correction-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-gold);
  background: rgba(245, 166, 35, 0.15);
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.correction-text {
  font-size: 13px;
  color: #ffd591;
  line-height: 1.5;
}

/* 评分 */
.chat-msg__score {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-stars {
  color: var(--accent-gold);
  font-size: 15px;
  letter-spacing: 2px;
}

.score-feedback {
  font-size: 12px;
  color: #8b8b9e;
}

/* 打字光标 */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 18px;
  background: var(--accent-purple);
  margin-left: 4px;
  animation: cursor-blink 0.8s infinite;
  border-radius: 1px;
}

/* 动画 */
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes msg-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-8px); }
}

@keyframes ring-expand {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

@keyframes avatar-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
