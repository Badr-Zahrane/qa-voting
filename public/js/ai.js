// AI assistance - #20 Grouping of similar questions, #21 Categories by topic (Zaighum)
// Asks the server to analyze the questions of this session, then reloads the list.
// Uses SESSION_CODE (from session.js) and loadQuestions() (from questions.js).

const analyzeBtn = document.getElementById('analyze-btn');
const aiStatus = document.getElementById('ai-status');

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    aiStatus.className = 'ai-status';
    aiStatus.textContent = 'Analyzing...';

    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(SESSION_CODE)}/analyze`, {
        method: 'POST'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      await loadQuestions();
      aiStatus.textContent = data.analyzed === 0
        ? 'No questions to analyze yet.'
        : `Done: ${data.groups} group(s) of similar questions found.`;
    } catch (err) {
      aiStatus.className = 'ai-status error';
      aiStatus.textContent = err.message;
    } finally {
      analyzeBtn.disabled = false;
    }
  });
}