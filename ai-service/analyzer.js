// Chooses how to analyze: with an LLM if ANTHROPIC_API_KEY is set,
// otherwise (or if the LLM call fails) with the local keyword heuristic.
const heuristic = require('./heuristic');
const llm = require('./llm');

function mode() {
  return llm.isConfigured() ? 'llm' : 'heuristic';
}

async function categorize(questions) {
  const fallback = heuristic.categorize(questions);
  if (questions.length === 0 || !llm.isConfigured()) {
    return { mode: 'heuristic', results: fallback };
  }
  try {
    const fromLlm = new Map((await llm.categorize(questions)).map((r) => [r.id, r.category]));
    // if the LLM skipped a question, use the heuristic category for it
    const results = fallback.map((r) => ({ id: r.id, category: fromLlm.get(r.id) || r.category }));
    return { mode: 'llm', results };
  } catch (err) {
    console.error('LLM categorize failed, using heuristic:', err.message);
    return { mode: 'heuristic', results: fallback };
  }
}

async function group(questions) {
  let mode_ = 'heuristic';
  let groups;
  if (questions.length > 1 && llm.isConfigured()) {
    try {
      groups = await llm.group(questions);
      mode_ = 'llm';
    } catch (err) {
      console.error('LLM group failed, using heuristic:', err.message);
    }
  }
  if (!groups) groups = heuristic.group(questions);
  return {
    mode: mode_,
    groups: groups.map((questionIds, i) => ({ id: i + 1, questionIds })),
  };
}

module.exports = { mode, categorize, group };