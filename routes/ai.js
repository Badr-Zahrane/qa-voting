// Stories #20 (AI grouping of similar questions) and #21 (AI categories by topic) - Zaighum
// Montato in server.js su /api/sessions
const express = require('express');
const db = require('../db');
const ai = require('../services/aiClient');

const router = express.Router();

const MAX_QUESTIONS = 100; // the most recent ones, to keep the AI request small

// POST /api/sessions/:code/analyze
// Sends the questions of the session to the AI service, saves the category and
// the group of each question, and returns a short summary. The page then
// reloads the list with GET /api/sessions/:code/questions.
router.post('/:code/analyze', async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = db.prepare('SELECT id FROM sessions WHERE code = ?').get(code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const questions = db
    .prepare('SELECT id, text FROM questions WHERE session_id = ? ORDER BY id DESC LIMIT ?')
    .all(session.id, MAX_QUESTIONS);
  if (questions.length === 0) {
    return res.json({ analyzed: 0, groups: 0, mode: null });
  }

  let categorized;
  let grouped;
  try {
    [categorized, grouped] = await Promise.all([ai.categorize(questions), ai.group(questions)]);
  } catch (err) {
    console.error('AI service error:', err.message);
    return res.status(502).json({ error: 'AI service not available. Is it running?' });
  }

  const groupOf = new Map();
  grouped.groups.forEach((g) => g.questionIds.forEach((id) => groupOf.set(id, g.id)));

  const update = db.prepare('UPDATE questions SET category = ?, group_id = ? WHERE id = ?');
  db.transaction(() => {
    for (const q of questions) {
      update.run(categorized.categories.get(q.id) ?? null, groupOf.get(q.id) ?? null, q.id);
    }
  })();

  res.json({ analyzed: questions.length, groups: grouped.groups.length, mode: categorized.mode });
});

module.exports = router;