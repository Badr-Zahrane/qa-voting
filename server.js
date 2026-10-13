const express = require('express');
const path = require('path');

const sessionsRouter = require('./routes/sessions');
const questionsRouter = require('./routes/questions');
const votesRouter = require('./routes/votes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes - one file per area, so we don't edit the same file
app.use('/api/sessions', sessionsRouter);   // #1, #2  (Badr)
app.use('/api/sessions', questionsRouter);  // #3, #4  (Zaighum)
app.use('/api/questions', votesRouter);     // #5, #6  (Stefano)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
