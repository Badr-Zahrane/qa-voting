// Session page logic - loads the session from the code in the URL (Badr)
// Other scripts can use SESSION_CODE.
const SESSION_CODE = new URLSearchParams(window.location.search).get('code');
document.getElementById('session-code').textContent = SESSION_CODE || '';
