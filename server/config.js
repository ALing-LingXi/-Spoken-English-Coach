const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  SILICONFLOW_API_KEY: process.env.SILICONFLOW_API_KEY,
  PORT: process.env.PORT || 3000,
  SILICONFLOW_BASE_URL: 'https://api.siliconflow.cn/v1',
};
