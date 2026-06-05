const { WebSocketServer } = require("ws");
const {
  base64ToBuffer,
  bufferToBase64,
  createWavHeader,
} = require("./utils/audio");
const { recognizeSpeech } = require("./services/asr");
const { generateReplyStream } = require("./services/llm");
const { synthesizeSpeech } = require("./services/tts");

/**
 * 向客户端发送 JSON 消息
 */
function sendMessage(ws, type, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

/**
 * 处理音频消息：ASR → LLM(流式) → TTS
 */
async function handleAudio(ws, audioBase64) {
  console.log("[WS] 收到音频, base64 长度:", audioBase64?.length);

  // 1. base64 音频转 Buffer
  const audioBuffer = base64ToBuffer(audioBase64);
  console.log("[WS] 音频 Buffer 大小:", audioBuffer?.length, "bytes");

  // 2. ASR 识别语音
  const transcript = await recognizeSpeech(audioBuffer);
  console.log("[WS] ASR 识别结果:", transcript);
  if (!transcript) {
    sendMessage(ws, "error", { message: "语音识别失败" });
    return;
  }
  sendMessage(ws, "transcript", { text: transcript });

  // 3. LLM 流式生成回复
  const messages = [{ role: "user", content: transcript }];
  let fullReply = "";

  for await (const chunk of generateReplyStream(messages)) {
    fullReply += chunk;
    sendMessage(ws, "llm_chunk", { text: chunk });
  }
  console.log("[WS] LLM 完整回复:", fullReply);

  // 4. TTS 合成语音
  if (!fullReply) {
    sendMessage(ws, "error", { message: "LLM 回复为空" });
    return;
  }

  console.log("[WS] 开始调用 TTS...");
  const ttsBuffer = await synthesizeSpeech(fullReply);
  console.log("[WS] TTS 返回 Buffer 大小:", ttsBuffer?.length, "bytes");
  if (!ttsBuffer) {
    sendMessage(ws, "error", { message: "语音合成失败" });
    return;
  }

  // 5. 返回音频数据
  sendMessage(ws, "audio", { audio: bufferToBase64(ttsBuffer) });
  console.log("[WS] 音频已发送给客户端");
}

/**
 * 根据消息类型分发处理
 */
function routeMessage(ws, parsed) {
  const { type, data } = parsed;

  switch (type) {
    case "audio":
      handleAudio(ws, data?.audio).catch((err) => {
        console.error("[WS] 处理音频流程错误:", err.message);
        sendMessage(ws, "error", { message: "处理失败，请重试" });
      });
      break;
    default:
      console.warn("[WS] 未知消息类型:", type);
  }
}

/**
 * 创建 WebSocket 服务器
 */
function createWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("[WS] 客户端已连接");

    ws.on("message", (raw) => {
      try {
        const parsed = JSON.parse(raw.toString());
        routeMessage(ws, parsed);
      } catch (err) {
        console.error("[WS] 消息解析失败:", err.message);
        sendMessage(ws, "error", { message: "消息格式错误" });
      }
    });

    ws.on("close", () => {
      console.log("[WS] 客户端已断开");
    });

    ws.on("error", (err) => {
      console.error("[WS] 连接错误:", err.message);
    });
  });

  return wss;
}

module.exports = { createWebSocketServer };
