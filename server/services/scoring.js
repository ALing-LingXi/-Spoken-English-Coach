/**
 * 发音评分服务
 * 基于 LLM 评估用户英语水平（因为 ASR 不返回置信度）
 */

/**
 * 构建评分 prompt，追加到 system prompt 中
 * @returns {string} 评分指令
 */
function getScoringPrompt() {
  return `
【发音与表达评分】
请根据用户的英语表达，评估其英语水平并给出 1-5 分的评分。
评分标准：
1分：几乎无法理解
2分：能理解但有严重语法错误
3分：基本流畅，有一些语法错误
4分：流畅自然，偶有小错
5分：接近母语水平

请在回复末尾用 [评分]X分：简短评语[/评分] 标注。
示例：[评分]3分：语法基本正确，但发音用词可以更自然[/评分]
如果没有错误且表达优秀，也给4-5分。`;
}

/**
 * 从 LLM 回复中解析评分
 * @param {string} text - LLM 完整回复
 * @returns {{ score: number|null, feedback: string|null }}
 */
function parseScore(text) {
  const regex = /\[评分\](\d)分[：:](.*?)\[\/评分\]/;
  const match = text.match(regex);

  if (!match) {
    return { score: null, feedback: null };
  }

  return {
    score: parseInt(match[1], 10),
    feedback: match[2].trim(),
  };
}

/**
 * 从回复中移除评分标记
 * @param {string} text - LLM 完整回复
 * @returns {string} 清理后的回复
 */
function removeScoreFromReply(text) {
  return text.replace(/\[评分\]\d分[：:].*?\[\/评分\]/, '').trim();
}

module.exports = { getScoringPrompt, parseScore, removeScoreFromReply };
