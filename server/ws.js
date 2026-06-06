const { WebSocketServer } = require("ws");
const {
  base64ToBuffer,
  bufferToBase64,
  createWavHeader,
} = require("./utils/audio");
const { recognizeSpeech } = require("./services/asr");
const { generateReplyStream } = require("./services/llm");
const { synthesizeSpeech } = require("./services/tts");
const { parseScore, removeScoreFromReply } = require("./services/scoring");

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
async function handleAudio(ws, audioBase64, clientMessages) {
  console.log("[WS] 收到音频, base64 长度:", audioBase64?.length);

  // 重置打断标记
  ws.interrupted = false;

  // 1. base64 音频转 Buffer
  const audioBuffer = base64ToBuffer(audioBase64);
  console.log("[WS] 音频 Buffer 大小:", audioBuffer?.length, "bytes");

  // 2. ASR 识别语音
  const transcript = await recognizeSpeech(audioBuffer);
  if (ws.interrupted) return;
  console.log("[WS] ASR 识别结果:", transcript);
  if (!transcript) {
    sendMessage(ws, "error", { message: "语音识别失败" });
    return;
  }
  sendMessage(ws, "transcript", { text: transcript });

  // 3. 构建多轮对话消息
  const messages = buildMessages(clientMessages, transcript);

  // 4. LLM 流式生成回复
  let fullReply = "";

  for await (const chunk of generateReplyStream(messages)) {
    if (ws.interrupted) return;
    fullReply += chunk;
    sendMessage(ws, "llm_chunk", { text: chunk });
  }
  if (ws.interrupted) return;
  console.log("[WS] LLM 完整回复:", fullReply);

  // 5. 解析纠错标记，发送纠错消息
  const { reply, correction } = parseCorrection(fullReply);
  if (correction) {
    sendMessage(ws, "correction", { text: correction });
  }

  // 5.5 解析评分标记，发送评分消息
  const { score, feedback } = parseScore(reply);
  if (score) {
    sendMessage(ws, "score", { score, feedback });
  }

  // 6. TTS 合成语音（用清理后的正文，不含纠错和评分标记）
  const cleanReply = removeScoreFromReply(reply);
  if (!cleanReply) {
    sendMessage(ws, "error", { message: "LLM 回复为空" });
    return;
  }

  console.log("[WS] 开始调用 TTS...");
  const ttsBuffer = await synthesizeSpeech(cleanReply);
  if (ws.interrupted) return;
  console.log("[WS] TTS 返回 Buffer 大小:", ttsBuffer?.length, "bytes");
  if (!ttsBuffer) {
    sendMessage(ws, "error", { message: "语音合成失败" });
    return;
  }

  // 6. 返回音频数据
  sendMessage(ws, "audio", { audio: bufferToBase64(ttsBuffer) });
  console.log("[WS] 音频已发送给客户端");
}

/**
 * 构建多轮对话消息数组
 */
function buildMessages(clientMessages, currentTranscript) {
  // 使用客户端传来的历史消息，追加当前用户输入
  const history = Array.isArray(clientMessages)
    ? clientMessages.slice(-20)
    : [];
  history.push({ role: "user", content: currentTranscript });
  return history;
}

/**
 * 解析纠错标记，分离正文和纠错内容
 * @param {string} text - LLM 完整回复
 * @returns {{ reply: string, correction: string|null }}
 */
function parseCorrection(text) {
  const regex = /\[纠错\]([\s\S]*?)\[\/纠错\]/;
  const match = text.match(regex);

  if (!match) {
    return { reply: text.trim(), correction: null };
  }

  // 正文去掉纠错标记部分
  const reply = text.replace(regex, "").trim();
  const correction = match[1].trim();

  return { reply, correction };
}

/**
 * 根据消息类型分发处理
 */
function routeMessage(ws, parsed) {
  const { type, data } = parsed;

  switch (type) {
    case "audio":
      handleAudio(ws, data?.audio, data?.messages).catch((err) => {
        console.error("[WS] 处理音频流程错误:", err.message);
        sendMessage(ws, "error", { message: "处理失败，请重试" });
      });
      break;
    case "interrupt":
      // 客户端打断，标记中止
      ws.interrupted = true;
      console.log("[WS] 收到打断请求");
      break;
    case "ping":
      // 心跳响应
      sendMessage(ws, "pong", {});
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
