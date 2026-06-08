const { WebSocketServer } = require("ws");
const {
  base64ToBuffer,
  bufferToBase64,
  createWavHeader,
} = require("./utils/audio");
const { recognizeSpeech } = require("./services/asr");
const { generateReplyStream, getSystemPrompt } = require("./services/llm");
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

  // 3. 构建多轮对话消息（根据难度和场景选择 prompt）
  const difficulty = ws.settings?.difficulty || "medium";
  const scene = ws.settings?.scene || "daily";
  const systemPrompt = getSystemPrompt(difficulty, scene);
  const messages = buildMessages(clientMessages, transcript, 'voice');

  // 4. LLM 流式生成回复
  let fullReply = "";

  for await (const chunk of generateReplyStream(messages, systemPrompt)) {
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
  const voice = ws.settings?.voice || "claire";
  const ttsBuffer = await synthesizeSpeech(cleanReply, voice);
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
 * @param {Array} clientMessages - 客户端历史消息
 * @param {string} currentTranscript - 当前用户输入
 * @param {string} inputType - 输入类型：'voice' 或 'text'
 */
function buildMessages(clientMessages, currentTranscript, inputType = 'voice') {
  const history = Array.isArray(clientMessages)
    ? clientMessages.slice(-20)
    : [];

  // 在用户消息中添加输入类型标记，让 LLM 知道是语音还是文字输入
  const inputTypeLabel = inputType === 'voice' ? '[语音输入]' : '[文字输入]';
  history.push({ role: 'user', content: `${inputTypeLabel} ${currentTranscript}` });

  return history;
}

/**
 * 解析纠错标记，分离正文和纠错内容
 * 支持有闭合标签和无闭合标签两种情况（LLM 经常漏掉闭合标签）
 * @param {string} text - LLM 完整回复
 * @returns {{ reply: string, correction: string|null }}
 */
function parseCorrection(text) {
  // 优先匹配有闭合标签的格式
  const regexWithClose = /\[纠错\]([\s\S]*?)\[\/纠错\]/;
  const matchWithClose = text.match(regexWithClose);

  if (matchWithClose) {
    const reply = text.replace(regexWithClose, '').trim();
    const correction = matchWithClose[1].trim();
    return { reply, correction };
  }

  // 兜底：匹配无闭合标签的格式
  const regexNoClose = /\[纠错\]([\s\S]*?)$/;
  const matchNoClose = text.match(regexNoClose);

  if (matchNoClose) {
    const reply = text.replace(regexNoClose, '').trim();
    const correction = matchNoClose[1].trim();
    return { reply, correction };
  }

  return { reply: text.trim(), correction: null };
}

/**
 * 处理文字消息：跳过 ASR，直接 LLM(流式) → TTS
 */
async function handleText(ws, text, clientMessages) {
  console.log("[WS] 收到文字消息:", text);

  // 重置打断标记
  ws.interrupted = false;

  if (!text) {
    sendMessage(ws, "error", { message: "文字消息为空" });
    return;
  }

  // 注意：文字消息不发送 transcript，前端已自行显示

  // 构建多轮对话消息
  const difficulty = ws.settings?.difficulty || "medium";
  const scene = ws.settings?.scene || "daily";
  const systemPrompt = getSystemPrompt(difficulty, scene);
  const messages = buildMessages(clientMessages, text, 'text');

  // LLM 流式生成回复
  let fullReply = "";

  for await (const chunk of generateReplyStream(messages, systemPrompt)) {
    if (ws.interrupted) return;
    fullReply += chunk;
    sendMessage(ws, "llm_chunk", { text: chunk });
  }
  if (ws.interrupted) return;

  // 解析纠错标记
  const { reply, correction } = parseCorrection(fullReply);
  if (correction) {
    sendMessage(ws, "correction", { text: correction });
  }

  // 解析评分标记
  const { score, feedback } = parseScore(reply);
  if (score) {
    sendMessage(ws, "score", { score, feedback });
  }

  // TTS 合成语音
  const cleanReply = removeScoreFromReply(reply);
  if (!cleanReply) {
    sendMessage(ws, "error", { message: "LLM 回复为空" });
    return;
  }

  const voice = ws.settings?.voice || "claire";
  const ttsBuffer = await synthesizeSpeech(cleanReply, voice);
  if (ws.interrupted) return;
  if (!ttsBuffer) {
    sendMessage(ws, "error", { message: "语音合成失败" });
    return;
  }

  sendMessage(ws, "audio", { audio: bufferToBase64(ttsBuffer) });
}

/**
 * 根据消息类型分发处理
 */
function routeMessage(ws, parsed) {
  const { type, data } = parsed;

  switch (type) {
    case "audio":
      console.log(
        "[WS DEBUG] 收到 audio 消息，当前 ws.settings:",
        JSON.stringify(ws.settings, null, 2),
      );
      handleAudio(ws, data?.audio, data?.messages).catch((err) => {
        console.error("[WS] 处理音频流程错误:", err.message);
        sendMessage(ws, "error", { message: "处理失败，请重试" });
      });
      break;
    case "text":
      handleText(ws, data?.text, data?.messages).catch((err) => {
        console.error("[WS] 处理文字流程错误:", err.message);
        sendMessage(ws, "error", { message: "处理失败，请重试" });
      });
      break;
    case "interrupt":
      // 客户端打断，标记中止
      ws.interrupted = true;
      console.log("[WS] 收到打断请求");
      break;
    case "setting":
      // 保存客户端设置
      ws.settings = { ...ws.settings, ...data };
      console.log("[WS] 更新设置:", ws.settings);
      break;
    case "scene":
      // 场景切换，保存场景并重置
      ws.settings = { ...ws.settings, scene: data?.scene };
      console.log("[WS] 切换场景:", data?.scene);
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

    // 初始化客户端设置
    ws.settings = { difficulty: "medium", voice: "claire", scene: "daily" };

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
