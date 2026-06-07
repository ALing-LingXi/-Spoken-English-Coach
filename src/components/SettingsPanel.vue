<template>
  <component :is="embedded ? 'div' : 'el-drawer'" v-model="visible" title="设置" direction="rtl" size="280px">
    <div class="settings">
      <!-- 语速 -->
      <div class="settings__item">
        <label>语速</label>
        <div class="settings__slider">
          <el-slider v-model="speed" :min="0.5" :max="2" :step="0.1" :show-tooltip="false" />
          <span class="settings__value">{{ speed.toFixed(1) }}x</span>
        </div>
      </div>

      <!-- 音色 -->
      <div class="settings__item">
        <label>音色</label>
        <el-radio-group v-model="voice">
          <el-radio-button value="claire">女声</el-radio-button>
          <el-radio-button value="alex">男声</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 难度 -->
      <div class="settings__item">
        <label>难度</label>
        <el-radio-group v-model="difficulty">
          <el-radio-button value="easy">初级</el-radio-button>
          <el-radio-button value="medium">中级</el-radio-button>
          <el-radio-button value="hard">高级</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 纠错开关 -->
      <div class="settings__item">
        <label>语法纠错</label>
        <el-switch v-model="correctionEnabled" />
      </div>

      <!-- 评分开关 -->
      <div class="settings__item">
        <label>发音评分</label>
        <el-switch v-model="scoringEnabled" />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SettingsData, VoiceId, DifficultyLevel } from '@/types'

defineProps<{
  modelValue?: boolean
  embedded?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  change: [settings: SettingsData]
}>()

const visible = ref(false)

// 设置项，从 localStorage 恢复
const speed = ref<number>(loadSetting('speed', 1.0))
const voice = ref<VoiceId>(loadSetting<VoiceId>('voice', 'claire'))
const difficulty = ref<DifficultyLevel>(loadSetting<DifficultyLevel>('difficulty', 'medium'))
const correctionEnabled = ref<boolean>(loadSetting('correctionEnabled', true))
const scoringEnabled = ref<boolean>(loadSetting('scoringEnabled', true))

/** 从 localStorage 读取设置 */
function loadSetting<T>(key: string, defaultVal: T): T {
  const saved = localStorage.getItem(`setting_${key}`)
  return saved !== null ? (JSON.parse(saved) as T) : defaultVal
}

/** 保存设置到 localStorage 并通知父组件 */
watch([speed, voice, difficulty, correctionEnabled, scoringEnabled], () => {
  const settings: SettingsData = {
    speed: speed.value,
    voice: voice.value,
    difficulty: difficulty.value,
    correctionEnabled: correctionEnabled.value,
    scoringEnabled: scoringEnabled.value,
  }

  Object.entries(settings).forEach(([k, v]) => {
    localStorage.setItem(`setting_${k}`, JSON.stringify(v))
  })

  emit('change', settings)
}, { deep: true, flush: 'post' })
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings__item label {
  font-size: 14px;
  font-weight: 500;
  color: #eaeaea;
}

.settings__slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings__slider .el-slider {
  flex: 1;
}

.settings__value {
  font-size: 13px;
  color: #8b8b9e;
  min-width: 36px;
  text-align: right;
}
</style>
