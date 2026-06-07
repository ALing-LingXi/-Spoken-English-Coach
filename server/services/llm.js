const axios = require('axios');
const config = require('../config');
const { retry } = require('../utils/retry');
const { getScoringPrompt } = require('./scoring');

const SILICONFLOW_LLM_URL = `${config.SILICONFLOW_BASE_URL}/chat/completions`;

const DEFAULT_SYSTEM_PROMPT = `你是一个友好的英语口语陪练助手。请用英语回复用户，保持对话自然流畅。
如果用户用中文说话，用英语回复并适当纠正表达。
回复尽量简短，每次2-3句话，鼓励用户继续对话。

【语法纠错规则】
如果用户的英语有语法或表达错误，请在回复末尾用 [纠错]...[/纠错] 标注纠正内容。
格式：[纠错]错误表达 → 正确表达（简要说明）[/纠错]
示例：用户说 "I goes to school"，回复末尾加 [纠错]I goes → I go（主语I用动词原形）[/纠错]
如果没有错误，不需要加纠错标记。

${getScoringPrompt()}`;

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
 * @returns {string}
 */
function getSystemPrompt(difficulty = 'medium', scene = 'daily') {
  let prompt = DEFAULT_SYSTEM_PROMPT;

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
    model: 'Qwen/Qwen2.5-7B-Instruct',
    messages: [
      { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages,
    ],
    stream,
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
