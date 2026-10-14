// Questions logic - #3 Submit question, #4 See all questions (Zaighum)
// #5 Upvote and #6 Sort by votes (Stefano) are added to the list rendering here.
// The current session code is in SESSION_CODE (from session.js).
// Riferimenti agli elementi del DOM (adatta gli ID se differiscono nell'HTML)




//parte mia (stefano)-------------------------------------------
const questionsList = document.getElementById('questions-list');
const questionForm = document.getElementById('question-form');
const questionInput = document.getElementById('question-input');

// Funzione di supporto per evitare attacchi XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// -------------------------------------------------------------
// Story #5: Logica di Upvote (Stefano)
// -------------------------------------------------------------
async function handleUpvote(questionId, voteCountEl, buttonEl) {
  try {
    buttonEl.disabled = true; // Previene doppi click rapidi

    const res = await fetch(`/api/questions/${questionId}/upvote`, {
      method: 'POST'
    });

    if (!res.ok) {
      throw new Error('Failed to upvote question');
    }

    const data = await res.json();
    
    // Aggiorna il numero mostrato nel badge del voto
    voteCountEl.textContent = data.votes;

    // Story #6: Ricarica la lista per riflettere il riordinamento per voti
    await loadQuestions();
  } catch (err) {
    console.error('Error upvoting:', err);
    alert('Errore durante il voto. Riprova.');
  } finally {
    buttonEl.disabled = false;
  }
}

// -------------------------------------------------------------
// Story #4 & #6: Rendering della lista ordinata (Zaighum + Stefano)
// -------------------------------------------------------------
async function loadQuestions() {
  if (!SESSION_CODE) return;

  try {
    const res = await fetch(`/api/sessions/${encodeURIComponent(SESSION_CODE)}/questions`);
    if (!res.ok) {
      throw new Error('Failed to fetch questions');
    }

    const questions = await res.json();
    questionsList.innerHTML = '';

    if (questions.length === 0) {
      questionsList.innerHTML = '<li class="no-questions">Nessuna domanda presente. Fanne una tu!</li>';
      return;
    }

    questions.forEach((q) => {
      const li = document.createElement('li');
      li.className = 'question-item';

      li.innerHTML = `
        <div class="question-body">
          <p class="question-text">${escapeHtml(q.text)}</p>
          <small class="question-date">${new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
        <div class="question-actions">
          <button class="upvote-btn" data-id="${q.id}">
            ▲ <span class="vote-count">${q.votes}</span>
          </button>
        </div>
      `;

      // Event listener per il pulsante upvote di Stefano
      const upvoteBtn = li.querySelector('.upvote-btn');
      const voteCountSpan = li.querySelector('.vote-count');

      upvoteBtn.addEventListener('click', () => {
        handleUpvote(q.id, voteCountSpan, upvoteBtn);
      });

      questionsList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading questions:', err);
  }
}

// -------------------------------------------------------------
// Story #3: Inserimento nuova domanda (Zaighum)
// -------------------------------------------------------------
if (questionForm) {
  questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = questionInput.value.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(SESSION_CODE)}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        questionInput.value = '';
        await loadQuestions();
      }
    } catch (err) {
      console.error('Error creating question:', err);
    }
  });
}

// Caricamento iniziale all'avvio della pagina
if (SESSION_CODE) {
  loadQuestions();
}// Questions logic - #3 Submit question, #4 See all questions (Zaighum)
// #5 Upvote and #6 Sort by votes (Stefano) are added to the list rendering here.
// The current session code is in SESSION_CODE (from session.js).
