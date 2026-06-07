/**
 * 通用请求重试工具
 * 指数退避：只对网络错误和 5xx 重试，4xx 不重试
 */

/**
 * 判断错误是否可重试
 */
function isRetryableError(error) {
  // 网络错误（无 response）
  if (!error.response) return true
  // 5xx 服务端错误
  const status = error.response.status
  return status >= 500 && status < 600
}

/**
 * 延迟指定毫秒
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 带重试的异步函数执行器
 * @param {Function} fn - 要执行的异步函数
 * @param {number} maxRetries - 最大重试次数，默认 3
 * @param {number} baseDelay - 基础延迟毫秒，默认 1000
 * @returns {Promise<*>} fn 的返回值
 */
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 最后一次尝试或不可重试的错误，直接抛出
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error
      }

      // 指数退避：1s, 2s, 4s...
      const waitMs = baseDelay * Math.pow(2, attempt)
      console.log(`[RETRY] 第 ${attempt + 1} 次重试，${waitMs}ms 后执行...`)
      await delay(waitMs)
    }
  }

  throw lastError
}

module.exports = { retry, isRetryableError }
