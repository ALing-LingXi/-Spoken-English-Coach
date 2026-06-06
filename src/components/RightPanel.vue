<template>
  <aside class="right-panel" :class="{ open: open }">
    <div class="right-panel__overlay" @click="$emit('close')"></div>
    <div class="right-panel__content">
      <!-- 标签页 -->
      <div class="right-panel__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="right-panel__tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 设置面板 -->
      <div v-if="activeTab === 'settings'" class="right-panel__body">
        <SettingsPanel :embedded="true" @change="handleSettingsChange" />
      </div>

      <!-- 关于面板 -->
      <div v-if="activeTab === 'about'" class="right-panel__body">
        <div class="about-section">
          <div class="about-logo">E</div>
          <h3 class="about-title">EnglishMate</h3>
          <p class="about-desc">AI 英语口语陪练，帮助你提升英语口语能力</p>
          <div class="about-info">
            <div class="about-info-item">
              <span class="about-info-label">版本</span>
              <span class="about-info-value">2.0.0</span>
            </div>
            <div class="about-info-item">
              <span class="about-info-label">模型</span>
              <span class="about-info-value">Qwen2.5-7B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SettingsPanel from './SettingsPanel.vue'
import type { SettingsData } from '@/types'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  settingsChange: [settings: SettingsData]
}>()

const activeTab = ref<'settings' | 'about'>('settings')

const tabs = [
  { key: 'settings' as const, label: '设置' },
  { key: 'about' as const, label: '关于' },
]

function handleSettingsChange(settings: SettingsData): void {
  emit('settingsChange', settings)
}
</script>

<style scoped>
.right-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

.right-panel.open {
  pointer-events: auto;
}

.right-panel__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.right-panel.open .right-panel__overlay {
  opacity: 1;
  pointer-events: auto;
}

.right-panel__content {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(22, 33, 62, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  transform: translateX(100%);
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
}

.right-panel.open .right-panel__content {
  transform: translateX(0);
}

.right-panel__tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 16px;
}

.right-panel__tab {
  padding: 14px 20px;
  background: none;
  border: none;
  color: #8b8b9e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.right-panel__tab:hover {
  color: #eaeaea;
}

.right-panel__tab.active {
  color: #e94560;
}

.right-panel__tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e94560;
  border-radius: 1px;
}

.right-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 关于面板 */
.about-section {
  text-align: center;
  padding: 40px 20px;
}

.about-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #e94560, #f5a623);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
  color: #fff;
}

.about-title {
  font-size: 20px;
  font-weight: 700;
  color: #eaeaea;
  margin: 0 0 8px;
}

.about-desc {
  font-size: 14px;
  color: #8b8b9e;
  margin: 0 0 24px;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(42, 42, 74, 0.4);
  border-radius: 8px;
}

.about-info-label {
  color: #8b8b9e;
  font-size: 13px;
}

.about-info-value {
  color: #eaeaea;
  font-size: 13px;
  font-weight: 500;
}
</style>
