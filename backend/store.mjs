import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

/** Local preview only. This database must never be served, committed or copied into dist. */
export function openStore(filename) {
  mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, fingerprint TEXT NOT NULL,
      kind TEXT NOT NULL, payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS submission_retry ON submissions(fingerprint, created_at);
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY, submission_id TEXT NOT NULL REFERENCES submissions(id),
      created_at TEXT NOT NULL, recipient TEXT, subject TEXT NOT NULL,
      body TEXT NOT NULL, status TEXT NOT NULL CHECK(status = 'captured')
    );`);
  return {
    save(payload, mail) {
      const now = new Date().toISOString();
      const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      db.exec('BEGIN IMMEDIATE');
      try {
        const previous = db.prepare('SELECT id FROM submissions WHERE fingerprint=? AND created_at>=? ORDER BY created_at DESC LIMIT 1')
          .get(fingerprint, new Date(Date.now() - 10 * 60_000).toISOString());
        if (previous) { db.exec('COMMIT'); return { id: previous.id, duplicate: true }; }
        const id = randomUUID();
        db.prepare('INSERT INTO submissions VALUES (?,?,?,?,?)').run(id, now, fingerprint, payload.kind, JSON.stringify(payload));
        db.prepare('INSERT INTO outbox VALUES (?,?,?,?,?,?,?)')
          .run(randomUUID(), id, now, mail.to || null, mail.subject, mail.text, 'captured');
        db.exec('COMMIT');
        return { id, duplicate: false };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    // Operator CLI/tests only: there is deliberately no HTTP route for personal data.
    recent() {
      return {
        submissions: db.prepare('SELECT id,created_at,kind,payload FROM submissions ORDER BY created_at DESC LIMIT 20').all()
          .map(row => ({ ...row, payload: JSON.parse(row.payload) })),
        outbox: db.prepare('SELECT * FROM outbox ORDER BY created_at DESC LIMIT 20').all(),
      };
    },
    close() { db.close(); },
  };
}
