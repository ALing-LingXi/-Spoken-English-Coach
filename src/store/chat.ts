import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ChatMessage,
  Conversation,
  ConversationListItem,
  InputType,
  LLMessage,
  MessageRole,
  SceneType,
} from '@/types'

const MAX_MESSAGES = 100

export const useChatStore = defineStore('chat', () => {
  // ========== 多对话管理 ==========
  const conversations = ref<Conversation[]>(
    loadFromStorage<Conversation[]>('conversations', [
      { id: 'default', name: '新对话', scene: 'daily', createdAt: Date.now() },
    ]),
  )
  const activeConversationId = ref<string>(
    loadFromStorage<string>('activeConversationId', 'default'),
  )

  const activeConversation = computed<Conversation>(
    () =>
      conversations.value.find((c) => c.id === activeConversationId.value) ||
      conversations.value[0],
  )

  const currentScene = computed<SceneType>(
    () => activeConversation.value?.scene || 'daily',
  )

  const messages = ref<ChatMessage[]>(
    loadMessagesFromStorage(
      loadFromStorage<string>('activeConversationId', 'default'),
    ),
  )

  // 连接与交互状态
  const isConnected = ref(false)
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const isPlaying = ref(false)
  const error = ref<string | null>(null)
  const currentReply = ref('')

  // 当前回复的纠错和评分
  const lastCorrection = ref<string | null>(null)
  const lastScore = ref<number | null>(null)
  const lastFeedback = ref<string | null>(null)

  let errorTimer: ReturnType<typeof setTimeout> | null = null

  const isWaitingReply = computed(() => isProcessing.value && !isPlaying.value)

  // ========== 对话管理 ==========

  function createConversation(): string {
    const id = `conv_${Date.now()}`
    const conv: Conversation = {
      id,
      name: `对话 ${conversations.value.length + 1}`,
      scene: 'daily',
      createdAt: Date.now(),
    }
    conversations.value.push(conv)
    activeConversationId.value = id
    messages.value = []
    currentReply.value = ''
    persistConversations()
    return id
  }

  function switchConversation(id: string): void {
    if (id === activeConversationId.value) return
    saveMessagesToStorage(activeConversationId.value, messages.value)
    activeConversationId.value = id
    messages.value = loadMessagesFromStorage(id)
    currentReply.value = ''
    lastCorrection.value = null
    lastScore.value = null
    lastFeedback.value = null
    isProcessing.value = false
    isPlaying.value = false
    persistConversations()
  }

  function deleteConversation(id: string): void {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx <= 0) return

    localStorage.removeItem(`chat_conv_${id}`)
    conversations.value.splice(idx, 1)

    if (activeConversationId.value === id) {
      activeConversationId.value = conversations.value[0].id
      messages.value = loadMessagesFromStorage(conversations.value[0].id)
      currentReply.value = ''
      // 完全清理相关状态
      lastCorrection.value = null
      lastScore.value = null
      lastFeedback.value = null
      isProcessing.value = false
      isPlaying.value = false
    }
    persistConversations()
  }

  function getConversationList(): ConversationListItem[] {
    return conversations.value.map((c, i) => ({
      id: c.id,
      name: c.name,
      isFirst: i === 0,
    }))
  }

  // ========== 消息方法 ==========

  function addMessage(
    role: MessageRole,
    content: string,
    inputType: InputType = 'text',
    correction: string | null = null,
    score: number | null = null,
    feedback: string | null = null,
  ): void {
    messages.value.push({
      id: Date.now(),
      role,
      content,
      inputType,
      correction,
      score,
      feedback,
      timestamp: new Date().toLocaleTimeString(),
    })
    if (messages.value.length > MAX_MESSAGES) {
      messages.value = messages.value.slice(-MAX_MESSAGES)
    }
    saveMessagesToStorage(activeConversationId.value, messages.value)
  }

  function getLLMMessages(): LLMessage[] {
    return messages.value.slice(-20).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      inputType: m.role === 'user' ? m.inputType : undefined,
    }))
  }

  function startReply(): void {
    currentReply.value = ''
    isProcessing.value = true
  }

  function appendReply(chunk: string): void {
    currentReply.value += chunk
  }

  function finishReply(): void {
    if (currentReply.value) {
      addMessage(
        'assistant',
        currentReply.value,
        'voice',
        lastCorrection.value,
        lastScore.value,
        lastFeedback.value,
      )
    }
    currentReply.value = ''
    lastCorrection.value = null
    lastScore.value = null
    lastFeedback.value = null
    isProcessing.value = false
  }

  function setCorrection(text: string): void {
    lastCorrection.value = text
  }

  function setScore(score: number, feedback: string | null): void {
    lastScore.value = score
    lastFeedback.value = feedback
  }

  // ========== 状态设置 ==========

  function setConnected(val: boolean): void { isConnected.value = val }
  function setRecording(val: boolean): void { isRecording.value = val }
  function setPlaying(val: boolean): void { isPlaying.value = val }
  function setProcessing(val: boolean): void { isProcessing.value = val }

  function setError(msg: string): void {
    error.value = msg
    if (errorTimer) clearTimeout(errorTimer)
    errorTimer = setTimeout(() => { error.value = null }, 5000)
  }

  function clearError(): void { error.value = null }

  function clearMessages(): void {
    messages.value = []
    currentReply.value = ''
    saveMessagesToStorage(activeConversationId.value, [])
  }

  function switchScene(scene: SceneType): void {
    const conv = conversations.value.find(
      (c) => c.id === activeConversationId.value,
    )
    if (conv) conv.scene = scene
    currentReply.value = ''
    persistConversations()
  }

  // ========== 持久化 ==========

  function persistConversations(): void {
    saveToStorage('conversations', conversations.value)
    saveToStorage('activeConversationId', activeConversationId.value)
  }

  return {
    messages,
    currentScene,
    conversations,
    activeConversationId,
    activeConversation,
    isConnected,
    isRecording,
    isProcessing,
    isPlaying,
    error,
    currentReply,
    isWaitingReply,
    createConversation,
    switchConversation,
    deleteConversation,
    getConversationList,
    addMessage,
    getLLMMessages,
    startReply,
    appendReply,
    finishReply,
    setCorrection,
    setScore,
    setConnected,
    setRecording,
    setPlaying,
    setProcessing,
    setError,
    clearError,
    clearMessages,
    switchScene,
  }
})

// ========== localStorage 工具函数 ==========

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 满了，忽略
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveMessagesToStorage(convId: string, msgs: ChatMessage[]): void {
  saveToStorage(`chat_conv_${convId}`, msgs)
}

function loadMessagesFromStorage(convId: string): ChatMessage[] {
  return loadFromStorage<ChatMessage[]>(`chat_conv_${convId}`, [])
}
