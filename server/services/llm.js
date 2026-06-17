const axios = require('axios');
const config = require('../config');
const { retry } = require('../utils/retry');

const SILICONFLOW_LLM_URL = `${config.SILICONFLOW_BASE_URL}/chat/completions`;

const DEFAULT_SYSTEM_PROMPT_BASE = `你是英语口语陪练助手。用英语回复用户，保持对话自然。

规则：
1. 回复简洁，每次1-3句
2. 用户说中文时，用英语回复并鼓励
3. 用户消息开头的[语音输入]或[文字输入]是系统标记，忽略它，回复用户实际内容

纠错：用户有语法错误时，回复末尾加[纠错]错误→正确[/纠错]`;

function getScoringPrompt() {
  return `

【评分】
根据用户的英语表达给出1-5分评分：
1分=难以理解，2分=错误较多，3分=基本流畅，4分=自然流畅，5分=接近母语

在回复末尾添加评分，格式：[评分]3分：简短评语[/评分]
注意：数字和"分"之间不要重复。`;
}

const DEFAULT_SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT_BASE + getScoringPrompt();

/** 难度对应的 prompt 补充 */
const DIFFICULTY_PROMPTS = {
  easy: '用户是英语初学者，请使用简单词汇和短句，语速较慢，多给鼓励。',
  medium: '',
  hard: '用户有较好的英语基础，请使用较复杂的词汇和长句，可以讨论深入话题。',
};

/** 场景对应的 prompt */
const SCENE_PROMPTS = {
  daily: '当前场景：日常闲聊。话题广泛，轻松自然。',
  business: '当前场景：商务英语。使用正式用语，模拟会议、邮件、谈判等场景。',
  travel: '当前场景：旅行英语。模拟机场、酒店、点餐、问路等实用场景。',
  interview: '当前场景：面试模拟。提出面试常见问题，评估回答并给出建议。',
};

/**
 * 根据难度和场景生成 system prompt
 * @param {string} difficulty - easy/medium/hard
 * @param {string} scene - daily/business/travel/interview
 * @param {boolean} enableScoring - 是否启用评分（文字输入不评分）
 * @returns {string}
 */
function getSystemPrompt(difficulty = 'medium', scene = 'daily', enableScoring = true) {
  let prompt = DEFAULT_SYSTEM_PROMPT_BASE;

  if (enableScoring) {
    prompt += getScoringPrompt();
  }

  const difficultyExtra = DIFFICULTY_PROMPTS[difficulty] || '';
  if (difficultyExtra) prompt += '\n\n' + difficultyExtra;

  const sceneExtra = SCENE_PROMPTS[scene] || '';
  if (sceneExtra) prompt += '\n\n' + sceneExtra;

  return prompt;
}

/**
 * 构建发送给 LLM 的请求体
 */
function buildRequestBody(messages, stream, systemPrompt) {
  return {
    model: 'Qwen/Qwen2.5-14B-Instruct',  // 使用更强的模型
    messages: [
      { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages,
    ],
    stream,
    temperature: 0.7,      // 降低随机性
    max_tokens: 500,       // 限制回复长度
    top_p: 0.9,
  };
}

/**
 * 获取 LLM 请求的公共 headers
 */
function getRequestHeaders() {
  return {
    Authorization: `Bearer ${config.SILICONFLOW_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * 调用 LLM API 生成回复（非流式）
 * @param {Array} messages - 消息数组
 * @returns {Promise<string|null>} 生成的文字，失败返回 null
 */
async function generateReply(messages, systemPrompt) {
  try {
    return await retry(async () => {
      const response = await axios.post(
        SILICONFLOW_LLM_URL,
        buildRequestBody(messages, false, systemPrompt),
        { headers: getRequestHeaders() },
      );
      return response.data?.choices?.[0]?.message?.content || null;
    });
  } catch (error) {
    handleLLMError(error);
    return null;
  }
}

/**
 * 调用 LLM API 流式生成回复
 * @param {Array} messages - 消息数组
 * @param {string} systemPrompt - 自定义 system prompt
 * @yields {string} 增量文字片段
 */
async function* generateReplyStream(messages, systemPrompt) {
  try {
    const response = await axios.post(
      SILICONFLOW_LLM_URL,
      buildRequestBody(messages, true, systemPrompt),
      {
        headers: getRequestHeaders(),
        responseType: 'stream',
      },
    );

    let buffer = '';

    for await (const chunk of response.data) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      // 保留最后一个可能不完整的行
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // 跳过无法解析的行
        }
      }
    }
  } catch (error) {
    handleLLMError(error);
  }
}

/**
 * LLM 错误处理
 */
function handleLLMError(error) {
  if (error.response) {
    console.error('[LLM] API 错误:', error.response.status, error.response.data);
  } else {
    console.error('[LLM] 网络错误:', error.message);
  }
}

module.exports = {
  SILICONFLOW_LLM_URL,
  DEFAULT_SYSTEM_PROMPT,
  getSystemPrompt,
  generateReply,
  generateReplyStream,
};
