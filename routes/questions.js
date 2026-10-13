// Stories #3 (Submit question) and #4 (See all questions) - Zaighum
const express = require('express');
const db = require('../db');

const router = express.Router();

// TODO #3: POST /api/sessions/:code/questions   body: { text }  -> save the question
// TODO #4: GET  /api/sessions/:code/questions                   -> list of the session's questions

module.exports = router;
