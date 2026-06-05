<template>
  <div class="chat-panel">
    <div
      v-for="(msg, index) in messages"
      :key="index"
      :class="['message', msg.role === 'user' ? 'message--user' : 'message--ai']"
    >
      <span class="message__role">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
      <span class="message__text">{{ msg.content }}</span>
    </div>
    <div v-if="messages.length === 0" class="chat-panel__empty">
      按住下方按钮开始对话
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
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-panel__empty {
  margin: auto;
  color: #999;
  font-size: 14px;
}

.message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message--user {
  align-self: flex-end;
  background: #4a90d9;
  color: #fff;
}

.message--ai {
  align-self: flex-start;
  background: #f0f0f0;
  color: #333;
}

.message__role {
  font-size: 11px;
  opacity: 0.7;
}

.message__text {
  word-break: break-word;
}
</style>
