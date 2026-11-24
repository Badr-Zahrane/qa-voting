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

// Columns added for the AI features (#20, #21). The migration also works on an
// existing qa.sqlite, because CREATE TABLE IF NOT EXISTS does not change old tables.
function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
addColumnIfMissing('questions', 'category', 'TEXT');    // #21 topic assigned by the AI
addColumnIfMissing('questions', 'group_id', 'INTEGER'); // #20 group of similar questions (per session)

module.exports = db;
