// Stories #1 (Create session) and #2 (Join session with code) - Badr
const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// Random 4-character code, e.g. "AB12" (no 0/O and 1/I to avoid confusion)
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// #1: POST /api/sessions -> create a session, return { id, code, presenterKey }
// The presenterKey is a secret only the creator gets: it opens the presenter page (#9-#11).
router.post('/', (req, res) => {
  let code;
  do {
    code = generateCode();
  } while (db.prepare('SELECT id FROM sessions WHERE code = ?').get(code)); // codes must be unique

  const presenterKey = crypto.randomBytes(12).toString('hex');
  const result = db
    .prepare('INSERT INTO sessions (code, presenter_key) VALUES (?, ?)')
    .run(code, presenterKey);
  res.status(201).json({ id: result.lastInsertRowid, code, presenterKey });
});

// #2: GET /api/sessions/:code -> return the session, or 404 if the code doesn't exist
router.get('/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = db.prepare('SELECT id, code, closed, created_at FROM sessions WHERE code = ?').get(code);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

module.exports = router;
