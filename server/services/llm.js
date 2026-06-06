const axios = require('axios');
const config = require('../config');
const { retry } = require('../utils/retry');

const SILICONFLOW_LLM_URL = `${config.SILICONFLOW_BASE_URL}/chat/completions`;

const DEFAULT_SYSTEM_PROMPT = `你是一个友好的英语口语陪练助手。请用英语回复用户，保持对话自然流畅。
如果用户用中文说话，用英语回复并适当纠正表达。
回复尽量简短，每次2-3句话，鼓励用户继续对话。`;

/**
 * 构建发送给 LLM 的请求体
 */
function buildRequestBody(messages, stream) {
  return {
    model: 'Qwen/Qwen2.5-7B-Instruct',
    messages: [
      { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
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
async function generateReply(messages) {
  try {
    return await retry(async () => {
      const response = await axios.post(
        SILICONFLOW_LLM_URL,
        buildRequestBody(messages, false),
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
 * @yields {string} 增量文字片段
 */
async function* generateReplyStream(messages) {
  try {
    const response = await axios.post(
      SILICONFLOW_LLM_URL,
      buildRequestBody(messages, true),
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
  generateReply,
  generateReplyStream,
};
