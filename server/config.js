/**
 * 配置模块
 * 加载环境变量并导出配置
 */
require('dotenv').config()

// 导出配置
module.exports = {
  // SiliconFlow API 配置
  SILICONFLOW_API_KEY: process.env.SILICONFLOW_API_KEY || '',
  SILICONFLOW_BASE_URL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',

  // 服务器配置
  PORT: process.env.PORT || 3000,

  // Node 环境
  NODE_ENV: process.env.NODE_ENV || 'development'
}
