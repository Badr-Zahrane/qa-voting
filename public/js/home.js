// Home page logic - #1 Create session, #2 Join session with code (Badr)

// #1 Create session: ask the server for a new session and show its code
document.getElementById('create-btn').addEventListener('click', async () => {
  const res = await fetch('/api/sessions', { method: 'POST' });
  const session = await res.json();

  document.getElementById('new-code').textContent = session.code;
  document.getElementById('open-session-link').href = `session.html?code=${session.code}`;
  document.getElementById('create-result').hidden = false;
});

// #2 Join session: check that the code exists, then open the session page
document.getElementById('join-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // don't reload the page
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  const errorEl = document.getElementById('join-error');

  const res = await fetch(`/api/sessions/${encodeURIComponent(code)}`);
  if (res.ok) {
    window.location.href = `session.html?code=${code}`;
  } else {
    errorEl.textContent = 'Session not found. Check the code.';
  }
});
