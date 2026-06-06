<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <!-- 顶部装饰 -->
    <div class="sidebar__top-decoration"></div>
    
    <!-- 顶部：Logo + 折叠按钮 -->
    <div class="sidebar__header">
      <div v-if="!collapsed" class="sidebar__brand">
        <div class="sidebar__logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <div class="sidebar__title-wrap">
          <span class="sidebar__title">EnglishMate</span>
          <span class="sidebar__subtitle">AI 英语练习</span>
        </div>
      </div>
      <button class="sidebar__toggle" @click="$emit('toggle')">
        <svg v-if="collapsed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 新建对话 -->
    <button v-if="!collapsed" class="sidebar__new-chat" @click="$emit('newChat')">
      <span class="sidebar__new-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </span>
      <span>新对话</span>
    </button>

    <!-- 对话列表 -->
    <div v-if="!collapsed" class="sidebar__chats">
      <div class="sidebar__chats-label">对话</div>
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="sidebar__chat-item"
        :class="{ active: chat.id === activeChatId }"
        @click="$emit('selectChat', chat.id)"
      >
        <div class="sidebar__chat-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span class="sidebar__chat-name">{{ chat.name }}</span>
        <button class="sidebar__chat-delete" @click.stop="$emit('deleteChat', chat.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 场景切换 -->
    <div v-if="!collapsed" class="sidebar__scenes">
      <div class="sidebar__scenes-label">练习场景</div>
      <SceneSelector v-model="currentScene" @change="handleSceneChange" />
    </div>

    <!-- 连接状态 -->
    <div class="sidebar__status">
      <span class="sidebar__status-dot" :class="{ connected: isConnected }">
        <span v-if="isConnected" class="sidebar__status-pulse"></span>
      </span>
      <span v-if="!collapsed" class="sidebar__status-text">{{ isConnected ? '已连接' : '未连接' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import SceneSelector from './SceneSelector.vue'

const props = defineProps({
  collapsed: Boolean,
  isConnected: Boolean,
  chats: { type: Array, default: () => [] },
  activeChatId: { type: [String, Number], default: null },
  modelScene: { type: String, default: 'daily' },
})

const emit = defineEmits(['toggle', 'newChat', 'selectChat', 'deleteChat', 'sceneChange'])

const currentScene = ref(props.modelScene)
watch(() => props.modelScene, (val) => { currentScene.value = val })

function handleSceneChange(scene) {
  emit('sceneChange', scene)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100%;
  background: rgba(18, 18, 32, 0.92);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

/* 顶部装饰渐变 */
.sidebar__top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(180deg, rgba(108, 140, 255, 0.08) 0%, transparent 100%);
  pointer-events: none;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar__logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(108, 140, 255, 0.3);
}

.sidebar__title-wrap {
  display: flex;
  flex-direction: column;
}

.sidebar__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.sidebar__subtitle {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 1px;
  letter-spacing: 0.5px;
}

.sidebar__toggle {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.sidebar__new-chat {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.18), rgba(233, 69, 96, 0.08));
  border: 1px solid rgba(233, 69, 96, 0.25);
  border-radius: var(--radius-md);
  color: var(--accent-red);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
}

.sidebar__new-chat:hover {
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.25), rgba(233, 69, 96, 0.12));
  border-color: rgba(233, 69, 96, 0.4);
  transform: translateX(4px);
}

.sidebar__new-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__chats {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: relative;
  z-index: 1;
}

.sidebar__chats-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  padding: 4px 12px;
  margin-bottom: 4px;
}

.sidebar__chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  color: var(--text-secondary);
  font-size: 13px;
}

.sidebar__chat-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.sidebar__chat-item.active {
  background: linear-gradient(135deg, rgba(108, 140, 255, 0.15), rgba(108, 140, 255, 0.05));
  color: var(--text-primary);
  border-left: 3px solid var(--accent-purple);
}

.sidebar__chat-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.sidebar__chat-item.active .sidebar__chat-icon {
  background: rgba(108, 140, 255, 0.2);
  color: var(--accent-purple);
}

.sidebar__chat-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__chat-delete {
  opacity: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__chat-item:hover .sidebar__chat-delete {
  opacity: 1;
}

.sidebar__chat-delete:hover {
  color: var(--accent-red);
  background: rgba(233, 69, 96, 0.15);
  border-color: rgba(233, 69, 96, 0.2);
}

.sidebar__scenes {
  padding: 14px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.sidebar__scenes-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.sidebar__status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.sidebar__status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-red);
  flex-shrink: 0;
  position: relative;
}

.sidebar__status-dot.connected {
  background: #34d399;
}

.sidebar__status-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #34d399;
  animation: status-pulse 2s ease-out infinite;
}

.sidebar__status-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

@keyframes status-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
</style>
