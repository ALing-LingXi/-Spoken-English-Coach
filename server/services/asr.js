const axios = require('axios');
const config = require('../config');
const { retry } = require('../utils/retry');

const SILICONFLOW_ASR_URL = `${config.SILICONFLOW_BASE_URL}/audio/transcriptions`;

/**
 * 调用 ASR API 识别语音
 * @param {Buffer} audioBuffer - 音频数据
 * @returns {Promise<string|null>} 识别的文字，失败返回 null
 */
async function recognizeSpeech(audioBuffer) {
  try {
    return await retry(async () => {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
      form.append('model', 'FunAudioLLM/SenseVoiceSmall');

      const response = await axios.post(SILICONFLOW_ASR_URL, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${config.SILICONFLOW_API_KEY}`,
        },
      });

      return response.data?.text || null;
    });
  } catch (error) {
    if (error.response) {
      console.error('[ASR] API 错误:', error.response.status, error.response.data);
    } else {
      console.error('[ASR] 网络错误:', error.message);
    }
    return null;
  }
}

module.exports = { recognizeSpeech };
