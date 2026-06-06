/** 消息角色 */
export type MessageRole = 'user' | 'assistant'

/** 场景类型 */
export type SceneType = 'daily' | 'business' | 'travel' | 'interview'

/** 难度等级 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

/** 音色 ID */
export type VoiceId = 'alex' | 'benjamin' | 'charles' | 'david' | 'anna' | 'bella' | 'claire' | 'diana'

/** 聊天消息 */
export interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  correction: string | null
  score: number | null
  feedback: string | null
  timestamp: string
}

/** 对话 */
export interface Conversation {
  id: string
  name: string
  scene: SceneType
  createdAt: number
}

/** 对话列表项（含 UI 状态） */
export interface ConversationListItem {
  id: string
  name: string
  isFirst: boolean
}

/** LLM 消息格式 */
export interface LLMessage {
  role: 'user' | 'assistant'
  content: string
}

/** WebSocket 消息类型 */
export type WSMessageType =
  | 'audio'
  | 'text'
  | 'interrupt'
  | 'setting'
  | 'scene'
  | 'ping'
  | 'transcript'
  | 'llm_chunk'
  | 'correction'
  | 'score'
  | 'error'
  | 'pong'
  | 'open'
  | 'close'
  | 'reconnect_failed'

/** WebSocket 消息 */
export interface WSMessage {
  type: WSMessageType
  data: unknown
}

/** 客户端→服务端：音频消息 */
export interface AudioMessageData {
  audio: string
  messages: LLMessage[]
}

/** 客户端→服务端：文字消息 */
export interface TextMessageData {
  text: string
  messages: LLMessage[]
}

/** 客户端→服务端：设置消息 */
export interface SettingMessageData {
  difficulty?: DifficultyLevel
  voice?: VoiceId
  scene?: SceneType
  speed?: number
  correctionEnabled?: boolean
  scoringEnabled?: boolean
}

/** 服务端→客户端：识别结果 */
export interface TranscriptData {
  text: string
}

/** 服务端→客户端：LLM 流式片段 */
export interface LLMChunkData {
  text: string
}

/** 服务端→客户端：纠错内容 */
export interface CorrectionData {
  text: string
}

/** 服务端→客户端：评分 */
export interface ScoreData {
  score: number
  feedback?: string
}

/** 服务端→客户端：TTS 音频 */
export interface AudioResponseData {
  audio: string
}

/** 服务端→客户端：错误 */
export interface ErrorData {
  message: string
}

/** 设置面板数据 */
export interface SettingsData {
  speed: number
  voice: VoiceId
  difficulty: DifficultyLevel
  correctionEnabled: boolean
  scoringEnabled: boolean
}

/** 回调函数类型 */
export type WSCallback = (data: unknown) => void
