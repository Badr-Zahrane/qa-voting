// AI service - small HTTP server used by the main app (stories #20 and #21).
//   POST /categorize  { questions: [{ id, text }] } -> { mode, results: [{ id, category }] }
//   POST /group       { questions: [{ id, text }] } -> { mode, groups: [{ id, questionIds }] }
//   GET  /health                                    -> { status, mode }
const express = require('express');
const analyzer = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 4000;
const MAX_QUESTIONS = 200;
const MAX_TEXT = 500;

app.use(express.json({ limit: '1mb' }));

// Validates the body and returns a clean list, or sends a 400 and returns null
function readQuestions(req, res) {
  const list = req.body && req.body.questions;
  if (!Array.isArray(list) || list.length > MAX_QUESTIONS) {
    res.status(400).json({ error: `"questions" must be an array of at most ${MAX_QUESTIONS} items` });
    return null;
  }
  const questions = [];
  for (const q of list) {
    if (!q || !Number.isInteger(q.id) || typeof q.text !== 'string') {
      res.status(400).json({ error: 'Each question needs an integer "id" and a string "text"' });
      return null;
    }
    questions.push({ id: q.id, text: q.text.trim().slice(0, MAX_TEXT) });
  }
  return questions;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: analyzer.mode() });
});

app.post('/categorize', async (req, res) => {
  const questions = readQuestions(req, res);
  if (!questions) return;
  res.json(await analyzer.categorize(questions));
});

app.post('/group', async (req, res) => {
  const questions = readQuestions(req, res);
  if (!questions) return;
  res.json(await analyzer.group(questions));
});

app.listen(PORT, () => {
  console.log(`AI service running on http://localhost:${PORT} (mode: ${analyzer.mode()})`);
});