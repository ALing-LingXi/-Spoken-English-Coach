// WebSocket 连接地址（开发环境通过 Vite 代理）
const WS_URL = `ws://${window.location.host}/ws`

let socket = null
const callbacks = {}

/**
 * 注册消息回调
 * @param {string} type - 消息类型
 * @param {Function} callback - 回调函数
 */
function on(type, callback) {
  callbacks[type] = callback
}

/**
 * 触发已注册的回调
 */
function emit(type, data) {
  if (callbacks[type]) callbacks[type](data)
}

/**
 * 连接 WebSocket 服务器
 * @returns {Promise<WebSocket>} 连接成功返回 WebSocket 实例
 */
function connectWebSocket() {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(WS_URL)

    socket.onopen = () => {
      console.log('[WS] 已连接')
      emit('open', null)
      resolve(socket)
    }

    socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        emit(type, data)
      } catch (err) {
        console.error('[WS] 消息解析失败:', err.message)
      }
    }

    socket.onclose = () => {
      console.log('[WS] 已断开')
      emit('close', null)
    }

    socket.onerror = (err) => {
      console.error('[WS] 连接错误')
      emit('error', err)
      reject(err)
    }
  })
}

/**
 * 发送消息到服务器
 * @param {string} type - 消息类型
 * @param {object} data - 消息数据
 */
function sendMessage(type, data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }))
  }
}

export { connectWebSocket, sendMessage, on }
