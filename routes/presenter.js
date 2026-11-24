// Presenter actions - #9 Mark as answered, #10 Delete question, #11 Close session (Badr)
// Only the presenter can do these: every request must send the secret presenter key
// (header "X-Presenter-Key") that was returned when the session was created.
const express = require('express');
const db = require('../db');

const router = express.Router();

// Returns the session if the key is right, otherwise answers with 404/403 and returns null
function presenterSession(req, res) {
  const code = req.params.code.trim().toUpperCase();
  const session = db
    .prepare('SELECT id, code, presenter_key, closed FROM sessions WHERE code = ?')
    .get(code);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return null;
  }
  if (!session.presenter_key || req.get('X-Presenter-Key') !== session.presenter_key) {
    res.status(403).json({ error: 'Only the presenter can do this' });
    return null;
  }
  return session;
}

// #11: POST /api/sessions/:code/close -> no new questions from now on
router.post('/:code/close', (req, res) => {
  const session = presenterSession(req, res);
  if (!session) return;

  db.prepare('UPDATE sessions SET closed = 1 WHERE id = ?').run(session.id);
  res.json({ code: session.code, closed: true });
});

// #9: PATCH /api/sessions/:code/questions/:id/answered   body: { "answered": true | false }
router.patch('/:code/questions/:id/answered', (req, res) => {
  const session = presenterSession(req, res);
  if (!session) return;

  const answered = req.body?.answered === false ? 0 : 1;
  const result = db
    .prepare('UPDATE questions SET answered = ? WHERE id = ? AND session_id = ?')
    .run(answered, Number(req.params.id), session.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ id: Number(req.params.id), answered: answered === 1 });
});

// #10: DELETE /api/sessions/:code/questions/:id -> remove an inappropriate question
router.delete('/:code/questions/:id', (req, res) => {
  const session = presenterSession(req, res);
  if (!session) return;

  const result = db
    .prepare('DELETE FROM questions WHERE id = ? AND session_id = ?')
    .run(Number(req.params.id), session.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.status(204).end();
});

module.exports = router;
