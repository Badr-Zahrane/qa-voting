// Session page logic - loads the session from the code in the URL (Badr)
// Other scripts can use SESSION_CODE.
const SESSION_CODE = (new URLSearchParams(window.location.search).get('code') || '').toUpperCase();
document.getElementById('session-code').textContent = SESSION_CODE;

// #2: if the code doesn't exist, show an error
fetch(`/api/sessions/${encodeURIComponent(SESSION_CODE)}`).then((res) => {
  if (!res.ok) {
    document.getElementById('session-error').textContent = 'This session does not exist.';
  }
});
