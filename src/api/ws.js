// WebSocket 连接地址（开发环境通过 Vite 代理）
const WS_URL = `ws://${window.location.host}/ws`

let socket = null
const callbacks = {}

// 重连参数
const MAX_RETRIES = 10
const BASE_DELAY = 1000
let retryCount = 0
let reconnectTimer = null

// 心跳参数
const HEARTBEAT_INTERVAL = 30000
const HEARTBEAT_TIMEOUT = 10000
let heartbeatTimer = null
let heartbeatTimeoutTimer = null

/**
 * 注册消息回调
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
 * 启动心跳定时器
 */
function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping', data: {} }))
      // 启动超时检测
      heartbeatTimeoutTimer = setTimeout(() => {
        console.warn('[WS] 心跳超时，触发重连')
        socket.close()
      }, HEARTBEAT_TIMEOUT)
    }
  }, HEARTBEAT_INTERVAL)
}

/**
 * 停止心跳定时器
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (heartbeatTimeoutTimer) {
    clearTimeout(heartbeatTimeoutTimer)
    heartbeatTimeoutTimer = null
  }
}

/**
 * 收到 pong 时重置超时
 */
function handlePong() {
  if (heartbeatTimeoutTimer) {
    clearTimeout(heartbeatTimeoutTimer)
    heartbeatTimeoutTimer = null
  }
}

/**
 * 连接 WebSocket 服务器
 */
function connectWebSocket() {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(WS_URL)

    socket.onopen = () => {
      console.log('[WS] 已连接')
      retryCount = 0
      emit('open', null)
      startHeartbeat()
      resolve(socket)
    }

    socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        if (type === 'pong') {
          handlePong()
          return
        }
        emit(type, data)
      } catch (err) {
        console.error('[WS] 消息解析失败:', err.message)
      }
    }

    socket.onclose = () => {
      console.log('[WS] 已断开')
      stopHeartbeat()
      emit('close', null)
      scheduleReconnect()
    }

    socket.onerror = (err) => {
      console.error('[WS] 连接错误')
      emit('error', err)
      reject(err)
    }
  })
}

/**
 * 指数退避重连
 */
function scheduleReconnect() {
  if (retryCount >= MAX_RETRIES) {
    console.error('[WS] 达到最大重试次数，停止重连')
    emit('reconnect_failed', null)
    return
  }

  const delay = BASE_DELAY * Math.pow(2, retryCount)
  retryCount++
  console.log(`[WS] ${delay}ms 后进行第 ${retryCount} 次重连...`)

  reconnectTimer = setTimeout(() => {
    connectWebSocket().catch(() => {
      // 连接失败，onclose 会触发下一次重连
    })
  }, delay)
}

/**
 * 停止重连
 */
function stopReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  retryCount = 0
}

/**
 * 发送消息到服务器
 */
function sendMessage(type, data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }))
  }
}

/**
 * 主动断开连接（不重连）
 */
function disconnect() {
  stopReconnect()
  stopHeartbeat()
  if (socket) {
    socket.onclose = null // 防止触发重连
    socket.close()
    socket = null
  }
}

export { connectWebSocket, sendMessage, on, disconnect }
