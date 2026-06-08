/**
 * 发音评分服务
 * 基于 LLM 评估用户英语水平（因为 ASR 不返回置信度）
 */

/**
 * 构建评分 prompt，追加到 system prompt 中
 * @returns {string} 评分指令
 */
function getScoringPrompt() {
  return `评分：根据用户表达给1-5分(1=差,3=一般,5=优秀)，末尾加[评分]X分：评语[/评分]`;
}

/**
 * 从 LLM 回复中解析评分
 * 支持多种格式变体，包括格式错误的情况
 * @param {string} text - LLM 完整回复
 * @returns {{ score: number|null, feedback: string|null }}
 */
function parseScore(text) {
  // 匹配各种可能的格式，包括 "4分分" 这种错误格式
  // 1. 有冒号有闭合标签
  let m = text.match(/\[评分\](\d)分+[\：:：]([\s\S]*?)\[\/评分\]/);
  if (m) return { score: parseInt(m[1], 10), feedback: m[2].trim() || null };

  // 2. 有冒号无闭合标签
  m = text.match(/\[评分\](\d)分+[\：:：]([^\[]+)$/);
  if (m) return { score: parseInt(m[1], 10), feedback: m[2].trim() || null };

  // 3. 无冒号有闭合标签
  m = text.match(/\[评分\](\d)分+\s*\[\/评分\]/);
  if (m) return { score: parseInt(m[1], 10), feedback: null };

  // 4. 无冒号无闭合标签
  m = text.match(/\[评分\](\d)分+[^\[]*$/);
  if (m) return { score: parseInt(m[1], 10), feedback: null };

  return { score: null, feedback: null };
}

/**
 * 从回复中移除评分标记及评语内容
 * 支持各种格式变体
 * @param {string} text - LLM 完整回复
 * @returns {string} 清理后的回复
 */
function removeScoreFromReply(text) {
  let result = text;
  // 移除有闭合标签的完整评分块（含评语）
  result = result.replace(/\[评分\][\s\S]*?\[\/评分\]/g, '');
  // 移除无闭合标签的评分块到行尾
  result = result.replace(/\[评分\][^\[]*$/gm, '');
  // 移除单独遗留的 [/评分]
  result = result.replace(/\[\/评分\]/g, '');
  return result.trim();
}

module.exports = { getScoringPrompt, parseScore, removeScoreFromReply };
