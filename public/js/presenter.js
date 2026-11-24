// Presenter page - #9 Mark as answered, #10 Delete question, #11 Close session (Badr)
// URL: presenter.html?code=AB12&key=<presenter key>
const params = new URLSearchParams(window.location.search);
const CODE = (params.get('code') || '').toUpperCase();
const KEY = params.get('key') || '';

const listEl = document.getElementById('questions-list');
const errorEl = document.getElementById('presenter-error');
const statusEl = document.getElementById('session-status');
const closeBtn = document.getElementById('close-btn');

document.getElementById('session-code').textContent = CODE;
const participantUrl = `${window.location.origin}/session.html?code=${CODE}`;
const participantLink = document.getElementById('participant-link');
participantLink.href = participantUrl;
participantLink.textContent = participantUrl;

// Every presenter request sends the secret key
function presenterFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Presenter-Key': KEY },
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showClosed() {
  statusEl.textContent = 'This session is closed: participants can no longer ask questions.';
  closeBtn.hidden = true;
}

async function loadSession() {
  const res = await fetch(`/api/sessions/${encodeURIComponent(CODE)}`);
  if (!res.ok) {
    errorEl.textContent = 'This session does not exist.';
    return;
  }
  const session = await res.json();
  if (session.closed) showClosed();
}

async function loadQuestions() {
  const res = await fetch(`/api/sessions/${encodeURIComponent(CODE)}/questions`);
  if (!res.ok) return;
  const questions = await res.json();

  listEl.innerHTML = '';
  if (questions.length === 0) {
    listEl.innerHTML = '<li class="no-questions">No questions yet.</li>';
    return;
  }

  questions.forEach((q) => {
    const li = document.createElement('li');
    li.className = q.answered ? 'question-item answered' : 'question-item';
    li.innerHTML = `
      <span class="votes-badge">▲ ${q.votes}</span>
      <div class="question-body">
        <p class="question-text">${escapeHtml(q.text)}${q.answered ? ' <span class="answered-badge">✓ Answered</span>' : ''}</p>
      </div>
      <div class="presenter-actions">
        <button class="secondary answer-btn">${q.answered ? 'Undo' : '✓ Answered'}</button>
        <button class="danger delete-btn" title="Delete question">🗑</button>
      </div>`;

    // #9 Mark as answered (or undo)
    li.querySelector('.answer-btn').addEventListener('click', async () => {
      const res = await presenterFetch(
        `/api/sessions/${encodeURIComponent(CODE)}/questions/${q.id}/answered`,
        { method: 'PATCH', body: JSON.stringify({ answered: !q.answered }) }
      );
      if (res.status === 403) errorEl.textContent = 'Only the presenter can do this (wrong link).';
      loadQuestions();
    });

    // #10 Delete question
    li.querySelector('.delete-btn').addEventListener('click', async () => {
      if (!window.confirm('Delete this question?')) return;
      const res = await presenterFetch(
        `/api/sessions/${encodeURIComponent(CODE)}/questions/${q.id}`,
        { method: 'DELETE' }
      );
      if (res.status === 403) errorEl.textContent = 'Only the presenter can do this (wrong link).';
      loadQuestions();
    });

    listEl.appendChild(li);
  });
}

// #11 Close session
closeBtn.addEventListener('click', async () => {
  if (!window.confirm('Close the session? Participants will not be able to ask new questions.')) return;
  const res = await presenterFetch(`/api/sessions/${encodeURIComponent(CODE)}/close`, { method: 'POST' });
  if (res.ok) {
    showClosed();
  } else if (res.status === 403) {
    errorEl.textContent = 'Only the presenter can do this (wrong link).';
  }
});

loadSession();
loadQuestions();
setInterval(loadQuestions, 5000); // refresh every 5 seconds to see new questions and votes
