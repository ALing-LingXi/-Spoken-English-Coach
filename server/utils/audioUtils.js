/**
 * 音频工具函数
 * 处理音频格式转换、合并等
 */

/**
 * 合并音频块
 * @param {Array<Buffer>} chunks 音频块数组
 * @returns {Buffer} 合并后的音频
 */
function mergeAudioChunks(chunks) {
  return Buffer.concat(chunks)
}

/**
 * 转换音频格式
 * @param {Buffer} audioData 原始音频数据
 * @param {string} fromFormat 源格式
 * @param {string} toFormat 目标格式
 * @returns {Promise<Buffer>} 转换后的音频
 */
async function convertAudioFormat(audioData, fromFormat, toFormat) {
  // TODO: 使用 ffmpeg 或其他库实现格式转换
  return audioData
}

/**
 * 计算 WAV 文件头
 * @param {number} dataLength 音频数据长度
 * @param {number} sampleRate 采样率
 * @param {number} channels 声道数
 * @returns {Buffer} WAV 文件头
 */
function createWavHeader(dataLength, sampleRate = 16000, channels = 1) {
  const header = Buffer.alloc(44)
  // RIFF chunk descriptor
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataLength, 4)
  header.write('WAVE', 8)
  // fmt sub-chunk
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16) // Subchunk1Size
  header.writeUInt16LE(1, 20) // AudioFormat (PCM)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * channels * 2, 28) // ByteRate
  header.writeUInt16LE(channels * 2, 32) // BlockAlign
  header.writeUInt16LE(16, 34) // BitsPerSample
  // data sub-chunk
  header.write('data', 36)
  header.writeUInt32LE(dataLength, 40)
  return header
}

module.exports = {
  mergeAudioChunks,
  convertAudioFormat,
  createWavHeader,
}
