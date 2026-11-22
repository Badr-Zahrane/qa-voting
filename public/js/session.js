// Session page logic - loads the session from the code in the URL (Badr)
// Other scripts can use SESSION_CODE.
const SESSION_CODE = (new URLSearchParams(window.location.search).get('code') || '').toUpperCase();
document.getElementById('session-code').textContent = SESSION_CODE;

// #2: if the code doesn't exist, show an error
fetch(`/api/sessions/${encodeURIComponent(SESSION_CODE)}`).then(async (res) => {
  if (!res.ok) {
    document.getElementById('session-error').textContent = 'This session does not exist.';
    return;
  }
  // #11: in a closed session participants can no longer ask questions
  const session = await res.json();
  if (session.closed) {
    document.getElementById('session-error').textContent = 'This session is closed.';
    const form = document.getElementById('question-form-section');
    if (form) form.hidden = true;
  }
});
