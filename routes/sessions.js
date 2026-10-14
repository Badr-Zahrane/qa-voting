// Stories #1 (Create session) and #2 (Join session with code) - Badr
const express = require('express');
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

// #1: POST /api/sessions -> create a session, return { id, code }
router.post('/', (req, res) => {
  let code;
  do {
    code = generateCode();
  } while (db.prepare('SELECT id FROM sessions WHERE code = ?').get(code)); // codes must be unique

  const result = db.prepare('INSERT INTO sessions (code) VALUES (?)').run(code);
  res.status(201).json({ id: result.lastInsertRowid, code });
});

// #2: GET /api/sessions/:code -> return the session, or 404 if the code doesn't exist
router.get('/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const session = db.prepare('SELECT id, code, created_at FROM sessions WHERE code = ?').get(code);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

module.exports = router;
