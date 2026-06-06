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
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.scene-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all 0.2s;
  user-select: none;
}

.scene-tab:hover {
  background: var(--el-fill-color);
}

.scene-tab.active {
  background: var(--el-color-primary);
  color: #fff;
}

.scene-icon {
  font-size: 14px;
}

.scene-label {
  font-size: 12px;
}
</style>
