const axios = require("axios");
const config = require("../config");
const { retry } = require("../utils/retry");

const SILICONFLOW_TTS_URL = `${config.SILICONFLOW_BASE_URL}/audio/speech`;

/**
 * 调用 TTS API 合成语音
 * @param {string} text - 要合成的文字
 * @param {string} voice - 音色，默认 alex
 * @returns {Promise<Buffer|null>} 音频 Buffer，失败返回 null
 */
async function synthesizeSpeech(text, voice = "claire") {
  console.log("[TTS] 开始合成, 文本:", text, "音色:", voice);

  try {
    return await retry(async () => {
      const requestBody = {
        model: "FunAudioLLM/CosyVoice2-0.5B",
        input: text,
        voice: `FunAudioLLM/CosyVoice2-0.5B:${voice}`,
        response_format: "mp3",
        stream: false,
      };

      console.log(
        "[TTS DEBUG] 发送给 SiliconFlow 的 payload:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await axios.post(SILICONFLOW_TTS_URL, requestBody, {
        headers: {
          Authorization: `Bearer ${config.SILICONFLOW_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      });

      console.log(
        "[TTS] 响应状态:",
        response.status,
        "数据大小:",
        response.data?.length,
        "bytes",
      );
      return Buffer.from(response.data);
    });
  } catch (error) {
    if (error.response) {
      const errMsg = error.response.data?.toString?.() || "";
      console.error(
        "[TTS] API 错误状态:",
        error.response.status,
        "错误体:",
        errMsg,
      );
    } else {
      console.error("[TTS] 网络错误:", error.message);
    }
    return null;
  }
}

module.exports = { synthesizeSpeech };
