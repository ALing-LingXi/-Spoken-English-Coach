/**
 * 测试音频工具函数
 */
const { base64ToBuffer, bufferToBase64, createWavHeader } = require('./utils/audio');

console.log('='.repeat(50));
console.log('测试 base64ToBuffer 函数');
console.log('='.repeat(50));

// 测试 1: 简单的 Base64 字符串
const testBase64 = 'SGVsbG8gV29ybGQh';
console.log('\n测试 1: 简单的 Base64 字符串');
console.log('输入:', testBase64);

const buffer = base64ToBuffer(testBase64);
console.log('输出类型:', buffer.constructor.name);
console.log('输出字符串:', buffer.toString('utf-8'));
console.log('- 是否为 Buffer 类型:', Buffer.isBuffer(buffer));
console.log('- Buffer 长度:', buffer.length);

// 测试 2: 带 data URI 前缀的 Base64
const testBase64WithPrefix = 'data:audio/wav;base64,SGVsbG8gV29ybGQh';
console.log('\n测试 2: 带 data URI 前缀的 Base64');

const buffer2 = base64ToBuffer(testBase64WithPrefix);
console.log('输出字符串:', buffer2.toString('utf-8'));
console.log('- 是否为 Buffer 类型:', Buffer.isBuffer(buffer2));

console.log('\n' + '='.repeat(50));
console.log('测试 bufferToBase64 函数');
console.log('='.repeat(50));

const testBuffer = Buffer.from('Hello World!');
const base64Result = bufferToBase64(testBuffer);
console.log('\n输入 Buffer:', testBuffer);
console.log('输出 Base64:', base64Result);
console.log('- 是否为字符串类型:', typeof base64Result === 'string');

// 验证互相转换
const roundTrip = base64ToBuffer(base64Result);
console.log('\n验证互相转换:');
console.log('- 原始内容:', testBuffer.toString('utf-8'));
console.log('- 转换后内容:', roundTrip.toString('utf-8'));
console.log('- 内容一致:', testBuffer.toString('utf-8') === roundTrip.toString('utf-8'));

console.log('\n' + '='.repeat(50));
console.log('测试 createWavHeader 函数');
console.log('='.repeat(50));

const dataLength = 1024;
const wavHeader = createWavHeader(dataLength);

console.log('\n输入数据长度:', dataLength);
console.log('输出类型:', wavHeader.constructor.name);
console.log('输出长度:', wavHeader.length);
console.log('- 长度是否为 44 字节:', wavHeader.length === 44);

// 验证 WAV 头格式
console.log('\n验证 WAV 头格式:');
console.log('- RIFF 标识:', wavHeader.toString('ascii', 0, 4));
console.log('- WAVE 标识:', wavHeader.toString('ascii', 8, 12));
console.log('- fmt 标识:', wavHeader.toString('ascii', 12, 16));
console.log('- data 标识:', wavHeader.toString('ascii', 36, 40));
console.log('- 文件总长度:', wavHeader.readUInt32LE(4));
console.log('- 音频格式 (1=PCM):', wavHeader.readUInt16LE(20));
console.log('- 声道数:', wavHeader.readUInt16LE(22));
console.log('- 采样率:', wavHeader.readUInt32LE(24));
console.log('- 字节率:', wavHeader.readUInt32LE(28));
console.log('- 块对齐:', wavHeader.readUInt16LE(32));
console.log('- 位深度:', wavHeader.readUInt16LE(34));
console.log('- 数据长度:', wavHeader.readUInt32LE(40));

// 验证关键字段
console.log('\n验证结果:');
console.log('- RIFF 正确:', wavHeader.toString('ascii', 0, 4) === 'RIFF');
console.log('- WAVE 正确:', wavHeader.toString('ascii', 8, 12) === 'WAVE');
console.log('- fmt 正确:', wavHeader.toString('ascii', 12, 16) === 'fmt ');
console.log('- data 正确:', wavHeader.toString('ascii', 36, 40) === 'data');
console.log('- 文件总长度正确:', wavHeader.readUInt32LE(4) === 36 + dataLength);

console.log('\n' + '='.repeat(50));
console.log('所有测试完成！');
console.log('='.repeat(50));
