<template>
  <div class="chat-panel" ref="panelRef">
    <div v-if="messages.length === 0 && !currentReply" class="chat-panel__empty">
      <el-empty description="按住下方按钮开始对话" :image-size="80" />
    </div>

    <div v-for="(msg, index) in messages" :key="index" class="chat-msg">
      <!-- 用户消息 -->
      <div v-if="msg.role === 'user'" class="chat-msg__user">
        <el-avatar :size="32" class="chat-msg__avatar chat-msg__avatar--user">你</el-avatar>
        <el-card shadow="never" class="chat-msg__card chat-msg__card--user">
          <p>{{ msg.content }}</p>
        </el-card>
      </div>

      <!-- AI 消息 -->
      <div v-else class="chat-msg__ai">
        <el-avatar :size="32" class="chat-msg__avatar chat-msg__avatar--ai">AI</el-avatar>
        <el-card shadow="never" class="chat-msg__card chat-msg__card--ai">
          <p>{{ msg.content }}</p>
          <!-- 纠错内容 -->
          <div v-if="msg.correction" class="chat-msg__correction">
            <span class="correction-label">纠错</span>
            <span class="correction-text">{{ msg.correction }}</span>
          </div>
          <!-- 评分 -->
          <div v-if="msg.score" class="chat-msg__score">
            <span class="score-stars">{{ '★'.repeat(msg.score) }}{{ '☆'.repeat(5 - msg.score) }}</span>
            <span v-if="msg.feedback" class="score-feedback">{{ msg.feedback }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 流式回复中 -->
    <div v-if="currentReply" class="chat-msg chat-msg__ai">
      <el-avatar :size="32" class="chat-msg__avatar chat-msg__avatar--ai">AI</el-avatar>
      <el-card shadow="never" class="chat-msg__card chat-msg__card--ai">
        <p class="typing">{{ currentReply }}<span class="cursor">▊</span></p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '../store/chat'
import { storeToRefs } from 'pinia'

const store = useChatStore()
const { messages, currentReply } = storeToRefs(store)
const panelRef = ref(null)

// 新消息或流式更新时自动滚动到底部
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-panel__empty {
  margin: auto;
}

.chat-msg__user {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-direction: row-reverse;
}

.chat-msg__ai {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.chat-msg__avatar--user {
  background: var(--el-color-primary);
  color: #fff;
  flex-shrink: 0;
}

.chat-msg__avatar--ai {
  background: var(--el-color-success);
  color: #fff;
  flex-shrink: 0;
}

.chat-msg__card {
  max-width: 75%;
}

.chat-msg__card--user {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.chat-msg__card--user :deep(.el-card__body) {
  padding: 10px 14px;
}

.chat-msg__card--ai {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color-lighter);
}

.chat-msg__card--ai :deep(.el-card__body) {
  padding: 10px 14px;
}

.chat-msg__card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.chat-msg__correction {
  margin-top: 8px;
  padding: 6px 10px;
  background: #fff3e0;
  border-radius: 6px;
  border-left: 3px solid #ff9800;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.correction-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #e65100;
  background: #ffe0b2;
  padding: 1px 6px;
  border-radius: 3px;
}

.correction-text {
  font-size: 13px;
  color: #bf360c;
  line-height: 1.5;
}

.chat-msg__score {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-stars {
  color: #ffc107;
  font-size: 14px;
  letter-spacing: 1px;
}

.score-feedback {
  font-size: 12px;
  color: #888;
}

.typing .cursor {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
