// Adapter for the AI service (AI Assistance context). It is the only place that
// knows the AI service's HTTP API, so its concepts do not leak into the core app.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4000';
const TIMEOUT_MS = 30000;

async function post(path, body) {
  const res = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`AI service answered ${res.status} on ${path}`);
  }
  return res.json();
}

const toPayload = (questions) => ({ questions: questions.map((q) => ({ id: q.id, text: q.text })) });

// -> { mode, categories: Map(questionId -> category) }
async function categorize(questions) {
  const data = await post('/categorize', toPayload(questions));
  const known = new Set(questions.map((q) => q.id));
  const categories = new Map();
  for (const r of data.results || []) {
    if (known.has(r.id) && typeof r.category === 'string' && r.category.trim()) {
      categories.set(r.id, r.category.trim().slice(0, 30));
    }
  }
  return { mode: data.mode, categories };
}

// -> { mode, groups: [{ id, questionIds }] }  (only groups with 2+ known questions)
async function group(questions) {
  const data = await post('/group', toPayload(questions));
  const known = new Set(questions.map((q) => q.id));
  const groups = [];
  for (const g of data.groups || []) {
    const questionIds = (g.questionIds || []).filter((id) => known.has(id));
    if (questionIds.length >= 2) groups.push({ id: groups.length + 1, questionIds });
  }
  return { mode: data.mode, groups };
}

module.exports = { categorize, group };