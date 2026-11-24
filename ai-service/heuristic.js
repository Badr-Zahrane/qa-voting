// Local fallback: no API key, no network. Keyword categories and word-overlap grouping.
// Less smart than the LLM, but good enough for a demo and always available.

// Singular forms, lowercase, without accents (the text is normalized the same way)
const CATEGORIES = {
  Exam: ['exam', 'esame', 'esami', 'appello', 'grade', 'voto', 'voti', 'mark', 'point', 'punti', 'punto', 'oral', 'orale', 'written', 'scritto', 'retake', 'resit'],
  Project: ['project', 'progetto', 'sprint', 'team', 'deliverable', 'demo', 'presentation', 'presentazione', 'report', 'checkpoint', 'requirement', 'requisito', 'story', 'backlog', 'scrum', 'deadline', 'scadenza'],
  Docker: ['docker', 'container', 'dockerfile', 'image', 'kubernetes', 'compose', 'podman'],
  Git: ['git', 'github', 'gitlab', 'branch', 'merge', 'commit', 'pull', 'push', 'rebase', 'conflict', 'conflitto', 'repository', 'repo'],
  Database: ['database', 'sql', 'sqlite', 'query', 'table', 'tabella', 'schema', 'db', 'postgres', 'mysql', 'index'],
  Testing: ['test', 'testing', 'unit', 'jest', 'coverage', 'pipeline', 'mock', 'tdd', 'continuous', 'integration'],
  Organization: ['schedule', 'room', 'aula', 'lecture', 'lezione', 'slide', 'material', 'materiale', 'recording', 'registrazione', 'hour', 'ricevimento', 'attendance', 'frequenza', 'orario', 'calendar', 'break', 'pausa'],
};

const STOPWORDS = new Set(
  ('the a an is are was were be been to of in on at for and or it this that what when where who why how do does did can could will would should ' +
    'i we you they my our your with about from there have has any please ' +
    'il lo la i gli le un uno una di da con su per tra fra e o ma che chi cosa come quando dove perche sono siamo ho hai ha abbiamo si non mi ci vi ' +
    'del della dei delle al alla ai alle nel nella nei nelle sul sulla quale quali puo possiamo posso c l').split(' ')
);

function tokens(text) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stem(word) {
  const w = word.length > 3 ? word.replace(/s$/, '') : word;
  return w.length > 5 ? w.slice(0, 5) : w;
}

function categorizeOne(text) {
  const words = new Set();
  for (const t of tokens(text)) {
    words.add(t);
    if (t.length > 3) words.add(t.replace(/s$/, ''));
  }
  let best = 'Other';
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    const score = keywords.filter((k) => words.has(k)).length;
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return best;
}

function categorize(questions) {
  return questions.map((q) => ({ id: q.id, category: categorizeOne(q.text) }));
}

function signature(text) {
  return new Set(tokens(text).filter((t) => !STOPWORDS.has(t) && t.length > 2).map(stem));
}

function similarity(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / (a.size + b.size - common); // Jaccard
}

// Each question joins the first cluster whose first question is similar enough
// (comparing with the leader only avoids long chains of loosely related questions)
function group(questions, threshold = 0.5) {
  const clusters = [];
  for (const q of questions) {
    const sig = signature(q.text);
    const cluster = clusters.find((c) => similarity(c.sig, sig) >= threshold);
    if (cluster) cluster.ids.push(q.id);
    else clusters.push({ sig, ids: [q.id] });
  }
  return clusters.filter((c) => c.ids.length >= 2).map((c) => c.ids);
}

module.exports = { categorize, group };