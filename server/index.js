/**
 * 后端入口文件
 */
const express = require('express');
const config = require('./config');

// 打印配置验证
console.log('='.repeat(50));
console.log('配置加载成功:');
console.log('- PORT:', config.PORT);
console.log('- NODE_ENV:', config.NODE_ENV);
console.log('- SILICONFLOW_BASE_URL:', config.SILICONFLOW_BASE_URL);
console.log('- SILICONFLOW_API_KEY:', config.SILICONFLOW_API_KEY ? '已设置' : '未设置');
console.log('='.repeat(50));

// 创建 express 应用
const app = express();

// 根路由
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI 英语口语陪练服务运行中' });
});

// 监听端口
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});
