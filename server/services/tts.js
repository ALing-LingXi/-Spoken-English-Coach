const axios = require('axios');
const config = require('../config');

const SILICONFLOW_TTS_URL = `${config.SILICONFLOW_BASE_URL}/audio/speech`;

/**
 * 调用 TTS API 合成语音
 * @param {string} text - 要合成的文字
 * @param {string} voice - 音色，默认 alex
 * @returns {Promise<Buffer|null>} 音频 Buffer，失败返回 null
 */
async function synthesizeSpeech(text, voice = 'alex') {
  try {
    const response = await axios.post(SILICONFLOW_TTS_URL, {
      model: 'fishaudio/fish-speech-1.5',
      input: text,
      voice: `fishaudio/fish-speech-1.5:${voice}`,
      response_format: 'mp3',
    }, {
      headers: {
        Authorization: `Bearer ${config.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    if (error.response) {
      console.error('[TTS] API 错误:', error.response.status, error.response.data?.toString());
    } else {
      console.error('[TTS] 网络错误:', error.message);
    }
    return null;
  }
}

module.exports = { synthesizeSpeech };
