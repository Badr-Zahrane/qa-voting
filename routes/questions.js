// Questions routes - #3 Submit question, #4 See all questions (Zaighum)
// Montato in server.js su /api/sessions
const express = require('express');
const db = require('../db');

const router = express.Router();

const MAX_LENGTH = 500;

// Trova la sessione a partire dal codice (es. "ABC123")
function findSession(code) {
  return db.prepare('SELECT id, code, closed FROM sessions WHERE code = ?').get(code);
}

// #3 - Submit question
// POST /api/sessions/:code/questions   body: { "text": "..." }
router.post('/:code/questions', (req, res) => {
  const session = findSession(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  // #11 Close session: a closed session accepts no new questions
  if (session.closed) {
    return res.status(403).json({ error: 'This session is closed' });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: 'Question text is required' });
  }
  if (text.length > MAX_LENGTH) {
    return res
      .status(400)
      .json({ error: `Question text must be at most ${MAX_LENGTH} characters` });
  }

  const result = db
    .prepare('INSERT INTO questions (session_id, text) VALUES (?, ?)')
    .run(session.id, text);

  const question = db
    .prepare('SELECT id, session_id, text, votes, answered, category, group_id, created_at FROM questions WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(question);
});

// #4 - See all questions
// GET /api/sessions/:code/questions
router.get('/:code/questions', (req, res) => {
  const session = findSession(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // #6 Sort by votes: most voted first, then the most recent.
  // #9 Answered questions go to the bottom.
  const questions = db
    .prepare(
      `SELECT id, session_id, text, votes, answered, category, group_id, created_at
       FROM questions
       WHERE session_id = ?
       ORDER BY answered ASC, votes DESC, created_at DESC, id DESC`
    )
    .all(session.id);

  res.json(questions);
});

module.exports = router;