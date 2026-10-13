// Stories #1 (Create session) and #2 (Join session with code) - Badr
const express = require('express');
const db = require('../db');

const router = express.Router();

// TODO #1: POST /api/sessions          -> create a session, return { id, code }
// TODO #2: GET  /api/sessions/:code    -> return the session, or 404 if the code doesn't exist

module.exports = router;
