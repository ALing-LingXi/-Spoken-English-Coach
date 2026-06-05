/**
 * 音频工具函数
 * 处理音频格式转换
 */

/**
 * 将 Base64 字符串转换为 Buffer
 * @param {string} base64String - Base64 编码的字符串
 * @returns {Buffer} - Buffer 对象
 */
function base64ToBuffer(base64String) {
  // 移除 Base64 前缀（如果有）
  const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * 将 Buffer 转换为 Base64 字符串
 * @param {Buffer} buffer - Buffer 对象
 * @returns {string} - Base64 编码的字符串
 */
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * 创建 WAV 文件头（44 字节）
 * @param {number} dataLength - 音频数据长度
 * @param {number} sampleRate - 采样率，默认 16000
 * @param {number} channels - 声道数，默认 1
 * @param {number} bitsPerSample - 位深度，默认 16
 * @returns {Buffer} - 44 字节的 WAV 头
 */
function createWavHeader(dataLength, sampleRate = 16000, channels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  // RIFF 标识
  header.write('RIFF', 0);
  // 文件总长度 - 8
  header.writeUInt32LE(36 + dataLength, 4);
  // WAVE 标识
  header.write('WAVE', 8);
  // fmt 子块标识
  header.write('fmt ', 12);
  // fmt 子块大小（16 表示 PCM）
  header.writeUInt32LE(16, 16);
  // 音频格式（1 表示 PCM）
  header.writeUInt16LE(1, 20);
  // 声道数
  header.writeUInt16LE(channels, 22);
  // 采样率
  header.writeUInt32LE(sampleRate, 24);
  // 字节率
  header.writeUInt32LE(byteRate, 28);
  // 块对齐
  header.writeUInt16LE(blockAlign, 32);
  // 位深度
  header.writeUInt16LE(bitsPerSample, 34);
  // data 子块标识
  header.write('data', 36);
  // data 子块大小
  header.writeUInt32LE(dataLength, 40);

  return header;
}

module.exports = {
  base64ToBuffer,
  bufferToBase64,
  createWavHeader
};
