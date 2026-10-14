// Stories #5 (Upvote question) and #6 (Sort questions by votes) - Stefano
const express = require('express');
const db = require('../db');

const router = express.Router();

// Story #5: POST /api/questions/:id/upvote -> votes + 1, restituisce il nuovo numero di voti
router.post('/:id/upvote', (req, res) => {
  const { id } = req.params;

  // Verifica che l'id sia un numero valido
  const questionId = parseInt(id, 10);
  if (isNaN(questionId)) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }

  // Incrementa il contatore dei voti
  const stmt = db.prepare('UPDATE questions SET votes = votes + 1 WHERE id = ?');
  const result = stmt.run(questionId);

  // Se nessuna riga è stata modificata, la domanda non esiste
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Question not found' });
  }

  // Recupera il valore aggiornato dei voti
  const updatedQuestion = db.prepare('SELECT id, votes FROM questions WHERE id = ?').get(questionId);

  res.json({
    id: updatedQuestion.id,
    votes: updatedQuestion.votes
  });
});

module.exports = router;
