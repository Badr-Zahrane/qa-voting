// Stories #5 (Upvote question) and #6 (Sort questions by votes) - Stefano
const express = require('express');
const db = require('../db');

const router = express.Router();

// TODO #5: POST /api/questions/:id/upvote  -> votes + 1, return the new number of votes
// TODO #6: sorting by votes -> "ORDER BY votes DESC" in the GET of #4 (agree with Zaighum)

module.exports = router;
