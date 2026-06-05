/**
 * SiliconFlow API 客户端封装
 * 统一管理鉴权、baseURL、错误处理
 */

const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1'

/**
 * 创建请求配置
 */
function createRequestOptions() {
  return {
    headers: {
      Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
}

/**
 * 统一错误处理
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  return response
}

module.exports = {
  SILICONFLOW_BASE_URL,
  createRequestOptions,
  handleResponse,
}
