/**
 * 教师角色状态管理 (Pinia Store)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 预设教师角色
const defaultTeachers = [
  {
    id: 'emma',
    name: 'Emma',
    avatar: '/teachers/emma.png',
    description: '美式英语，耐心友善',
    voiceId: 'emma_voice',
    systemPrompt: 'You are Emma, a friendly American English teacher...',
    personality: 'friendly',
  },
  {
    id: 'james',
    name: 'James',
    avatar: '/teachers/james.png',
    description: '英式英语，绅士风度',
    voiceId: 'james_voice',
    systemPrompt: 'You are James, a British English teacher...',
    personality: 'gentleman',
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: '/teachers/luna.png',
    description: '活泼开朗，适合初学者',
    voiceId: 'luna_voice',
    systemPrompt: 'You are Luna, an energetic English teacher...',
    personality: 'energetic',
  },
]

export const useTeacherStore = defineStore('teacher', () => {
  // 状态
  const teachers = ref(defaultTeachers)
  const currentTeacher = ref(null)
  const customVoices = ref([])

  // 计算属性
  const currentTeacherId = computed(() => currentTeacher.value?.id)
  const hasCustomVoice = computed(() => customVoices.value.length > 0)

  // 操作方法
  function selectTeacher(teacherId) {
    const teacher = teachers.value.find((t) => t.id === teacherId)
    if (teacher) {
      currentTeacher.value = teacher
    }
  }

  function addCustomVoice(voice) {
    customVoices.value.push({
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...voice,
    })
  }

  function removeCustomVoice(voiceId) {
    const index = customVoices.value.findIndex((v) => v.id === voiceId)
    if (index !== -1) {
      customVoices.value.splice(index, 1)
    }
  }

  function updateTeacherPrompt(teacherId, prompt) {
    const teacher = teachers.value.find((t) => t.id === teacherId)
    if (teacher) {
      teacher.systemPrompt = prompt
    }
  }

  // 初始化默认选择第一个教师
  function init() {
    if (!currentTeacher.value && teachers.value.length > 0) {
      currentTeacher.value = teachers.value[0]
    }
  }

  return {
    // 状态
    teachers,
    currentTeacher,
    customVoices,
    // 计算属性
    currentTeacherId,
    hasCustomVoice,
    // 方法
    selectTeacher,
    addCustomVoice,
    removeCustomVoice,
    updateTeacherPrompt,
    init,
  }
})
