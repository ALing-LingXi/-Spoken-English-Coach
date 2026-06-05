/**
 * 将 base64 字符串转换为 Buffer
 * @param {string} base64Str - base64 编码的字符串
 * @returns {Buffer} 解码后的 Buffer
 */
function base64ToBuffer(base64Str) {
  return Buffer.from(base64Str, 'base64')
}

/**
 * 将 Buffer 转换为 base64 字符串
 * @param {Buffer} buffer - 音频 Buffer
 * @returns {string} base64 编码的字符串
 */
function bufferToBase64(buffer) {
  return buffer.toString('base64')
}

/**
 * 生成 PCM 数据的 WAV 文件头（44 字节）
 * @param {number} dataLength - 音频数据长度（字节数）
 * @param {number} sampleRate - 采样率，默认 16000
 * @param {number} channels - 声道数，默认 1（单声道）
 * @param {number} bitsPerSample - 位深度，默认 16
 * @returns {Buffer} 44 字节的 WAV 头
 */
function createWavHeader(dataLength, sampleRate = 16000, channels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)
  const buffer = Buffer.alloc(44)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataLength, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)           // 子块大小
  buffer.writeUInt16LE(1, 20)            // PCM 格式
  buffer.writeUInt16LE(channels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataLength, 40)

  return buffer
}

module.exports = { base64ToBuffer, bufferToBase64, createWavHeader }
