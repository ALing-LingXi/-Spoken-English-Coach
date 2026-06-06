<template>
  <div class="chat-panel">
    <div v-if="messages.length === 0" class="chat-panel__empty">
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
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '../store/chat'
import { storeToRefs } from 'pinia'

const store = useChatStore()
const { messages } = storeToRefs(store)
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
</style>
