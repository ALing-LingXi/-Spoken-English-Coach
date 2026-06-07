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
 * 支持多种格式变体：
 * - [评分]5分：评语[/评分]
 * - [评分]5分：评语
 * - [评分]5分[/评分]
 * - [评分]5分
 * - [评分]5[/评分] (不带"分"字)
 * - 评分X分：评语[/评分] (无方括号前缀)
 * @param {string} text - LLM 完整回复
 * @returns {{ score: number|null, feedback: string|null }}
 */
function parseScore(text) {
  // 1. 匹配有冒号有闭合标签
  const r1 = /\[评分\](\d)分[：:]([\s\S]*?)\[\/评分\]/;
  const m1 = text.match(r1);
  if (m1) return { score: parseInt(m1[1], 10), feedback: m1[2].trim() || null };

  // 2. 匹配有冒号无闭合标签
  const r2 = /\[评分\](\d)分[：:]([^\[]+)$/;
  const m2 = text.match(r2);
  if (m2) return { score: parseInt(m2[1], 10), feedback: m2[2].trim() || null };

  // 3. 匹配无冒号有闭合标签
  const r3 = /\[评分\](\d)分\]\[\/评分\]|\[评分\](\d)分\[\/评分\]/;
  const r3b = /\[评分\](\d)分\s*\[\/评分\]/;
  const m3 = text.match(r3b);
  if (m3) return { score: parseInt(m3[1], 10), feedback: null };

  // 4. 匹配无冒号无闭合标签（直接到行尾或字符串末）
  const r4 = /\[评分\](\d)分[^\[]*$/;
  const m4 = text.match(r4);
  if (m4) return { score: parseInt(m4[1], 10), feedback: null };

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
