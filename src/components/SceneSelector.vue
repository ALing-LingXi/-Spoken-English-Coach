<template>
  <div class="scene-selector">
    <div
      v-for="item in scenes"
      :key="item.value"
      class="scene-tab"
      :class="{ active: currentScene === item.value }"
      @click="selectScene(item.value)"
    >
      <span class="scene-icon">{{ item.icon }}</span>
      <span class="scene-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'daily' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentScene = ref(props.modelValue)

// 同步外部 modelValue 变化
watch(() => props.modelValue, (val) => { currentScene.value = val })

const scenes = [
  { value: 'daily', label: '日常', icon: '💬' },
  { value: 'business', label: '商务', icon: '💼' },
  { value: 'travel', label: '旅行', icon: '✈️' },
  { value: 'interview', label: '面试', icon: '🎯' },
]

function selectScene(scene) {
  currentScene.value = scene
  emit('update:modelValue', scene)
  emit('change', scene)
}
</script>

<style scoped>
.scene-selector {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(20, 20, 35, 0.7);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.scene-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.scene-tab:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.scene-tab.active {
  background: linear-gradient(135deg, rgba(108, 140, 255, 0.2), rgba(108, 140, 255, 0.1));
  color: var(--accent-purple);
  border: 1px solid rgba(108, 140, 255, 0.2);
}

.scene-icon {
  font-size: 14px;
}

.scene-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
