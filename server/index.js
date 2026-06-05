const express = require('express');
const config = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI 英语口语陪练服务运行中' });
});

app.listen(config.PORT, () => {
  console.log(`服务器已启动: http://localhost:${config.PORT}`);
  console.log('配置验证:', {
    PORT: config.PORT,
    API_KEY: config.SILICONFLOW_API_KEY ? '已配置' : '未配置',
    BASE_URL: config.SILICONFLOW_BASE_URL,
  });
});
