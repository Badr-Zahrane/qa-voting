// Database setup (SQLite). Tables are created automatically on first start.
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'qa.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    code       TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id),
    text       TEXT NOT NULL,
    votes      INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Columns added in Sprint 2 (#9 answered, #11 closed, presenter key).
// ALTER TABLE adds them also to a qa.sqlite created before this change.
function addColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumn('sessions', 'presenter_key', 'TEXT');
addColumn('sessions', 'closed', 'INTEGER NOT NULL DEFAULT 0');
addColumn('questions', 'answered', 'INTEGER NOT NULL DEFAULT 0');

module.exports = db;
