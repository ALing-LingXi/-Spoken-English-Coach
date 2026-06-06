<template>
  <div class="chat-panel" ref="panelRef">
    <div v-if="messages.length === 0 && !currentReply" class="chat-panel__empty">
      <div class="chat-panel__empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p class="chat-panel__empty-text">按住下方按钮，开始英语对话</p>
    </div>

    <div v-for="(msg, index) in messages" :key="msg.id || index" class="chat-msg" :class="`chat-msg--${msg.role}`">
      <!-- 用户消息 -->
      <div v-if="msg.role === 'user'" class="chat-bubble chat-bubble--user">
        <p>{{ msg.content }}</p>
      </div>

      <!-- AI 消息 -->
      <div v-else class="chat-bubble chat-bubble--ai">
        <p>{{ msg.content }}</p>
        <!-- 纠错内容 -->
        <div v-if="msg.correction" class="chat-correction">
          <span class="chat-correction__label">纠错</span>
          <span class="chat-correction__text">{{ msg.correction }}</span>
        </div>
        <!-- 评分 -->
        <div v-if="msg.score" class="chat-score">
          <span class="chat-score__stars">{{ '★'.repeat(msg.score) }}{{ '☆'.repeat(5 - msg.score) }}</span>
          <span v-if="msg.feedback" class="chat-score__feedback">{{ msg.feedback }}</span>
        </div>
      </div>
    </div>

    <!-- 流式回复中 -->
    <transition name="fade-up">
      <div v-if="currentReply" class="chat-msg chat-msg--assistant">
        <div class="chat-bubble chat-bubble--ai chat-bubble--typing">
          <p>{{ currentReply }}<span class="chat-cursor">▊</span></p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

const store = useChatStore()
const { messages, currentReply } = storeToRefs(store)
const panelRef = ref(null)

watch(
  () => [messages.value.length, currentReply.value],
  () => {
    nextTick(() => {
      if (panelRef.value) panelRef.value.scrollTop = panelRef.value.scrollHeight
    })
  }
)
</script>

<style scoped>
.chat-panel {
  height: 100%;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.chat-panel::-webkit-scrollbar {
  width: 4px;
}

.chat-panel::-webkit-scrollbar-track {
  background: transparent;
}

.chat-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* 空状态 */
.chat-panel__empty {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.chat-panel__empty-icon {
  color: var(--text-muted);
  opacity: 0.5;
}

.chat-panel__empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

/* 消息行 */
.chat-msg {
  display: flex;
  animation: msg-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.chat-msg--user {
  justify-content: flex-end;
}

.chat-msg--assistant {
  justify-content: flex-start;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 气泡通用 */
.chat-bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.chat-bubble p {
  margin: 0;
}

/* 用户气泡 */
.chat-bubble--user {
  background: linear-gradient(135deg, var(--accent-red), #c93048);
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 12px rgba(233, 69, 96, 0.3);
}

/* AI 气泡 */
.chat-bubble--ai {
  background: rgba(35, 35, 55, 0.85);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

/* 打字光标 */
.chat-cursor {
  animation: blink 0.8s infinite;
  color: var(--accent-purple);
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* 纠错 */
.chat-correction {
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(245, 166, 35, 0.1);
  border-radius: 8px;
  border-left: 3px solid var(--accent-gold);
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.chat-correction__label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-gold);
  background: rgba(245, 166, 35, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chat-correction__text {
  font-size: 13px;
  color: #ffd591;
  line-height: 1.5;
}

/* 评分 */
.chat-score {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-score__stars {
  color: var(--accent-gold);
  font-size: 13px;
  letter-spacing: 1px;
}

.chat-score__feedback {
  font-size: 12px;
  color: var(--text-muted);
}

/* 流式回复动画 */
.fade-up-enter-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
