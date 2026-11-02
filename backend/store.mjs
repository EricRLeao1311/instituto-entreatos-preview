import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID, randomBytes } from 'node:crypto';
import { subscriptionToken } from './forms.mjs';

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
    );
    CREATE TABLE IF NOT EXISTS local_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audience (
      email TEXT PRIMARY KEY, name TEXT NOT NULL, sources TEXT NOT NULL,
      subscribed INTEGER NOT NULL, consent TEXT, token_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL, unsubscribed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS audience_events (
      id TEXT PRIMARY KEY, email TEXT NOT NULL, source TEXT NOT NULL,
      opted_in INTEGER NOT NULL, created_at TEXT NOT NULL, consent TEXT
    );`);
  db.prepare('INSERT OR IGNORE INTO local_meta VALUES (?,?)').run('subscription_secret', randomBytes(32).toString('hex'));
  const secret = db.prepare('SELECT value FROM local_meta WHERE key=?').get('subscription_secret').value;
  return {
    tokenFor(email) { return subscriptionToken(secret, email); },
    save(payload, mail) {
      const now = new Date().toISOString();
      const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      db.exec('BEGIN IMMEDIATE');
      try {
        const previous = db.prepare('SELECT id FROM submissions WHERE fingerprint=? AND created_at>=? ORDER BY created_at DESC LIMIT 1')
          .get(fingerprint, new Date(Date.now() - 10 * 60_000).toISOString());
        const audienceState = payload.updatesOptIn ? db.prepare('SELECT subscribed FROM audience WHERE email=?').get(payload.email) : null;
        if (previous && audienceState?.subscribed !== 0) { db.exec('COMMIT'); return { id: previous.id, duplicate: true }; }
        const id = randomUUID();
        db.prepare('INSERT INTO submissions VALUES (?,?,?,?,?)').run(id, now, fingerprint, payload.kind, JSON.stringify(payload));
        db.prepare('INSERT INTO outbox VALUES (?,?,?,?,?,?,?)')
          .run(randomUUID(), id, now, mail.to || null, mail.subject, mail.text, 'captured');
        if (['research','publications'].includes(payload.kind)) {
          const previousAudience = db.prepare('SELECT * FROM audience WHERE email=?').get(payload.email);
          const sources = JSON.stringify([...new Set([...(previousAudience ? JSON.parse(previousAudience.sources) : []), payload.source])]);
          const optedIn = payload.updatesOptIn || !!previousAudience?.subscribed;
          const consent = payload.updatesOptIn ? JSON.stringify(payload.updatesConsent) : previousAudience?.consent || null;
          db.prepare(`INSERT INTO audience VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET
            name=excluded.name,sources=excluded.sources,subscribed=excluded.subscribed,consent=excluded.consent,
            token_hash=excluded.token_hash,updated_at=excluded.updated_at,unsubscribed_at=excluded.unsubscribed_at`)
            .run(payload.email, payload.name, sources, Number(optedIn), consent, payload.unsubscribeTokenHash, now, payload.updatesOptIn ? null : previousAudience?.unsubscribed_at || null);
          db.prepare('INSERT INTO audience_events VALUES (?,?,?,?,?,?)').run(randomUUID(), payload.email, payload.source, Number(payload.updatesOptIn), now, payload.updatesConsent ? JSON.stringify(payload.updatesConsent) : null);
        }
        db.exec('COMMIT');
        return { id, duplicate: false };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    unsubscribe(hash) {
      const now = new Date().toISOString();
      db.exec('BEGIN IMMEDIATE');
      try {
        const entry = db.prepare('SELECT email,subscribed FROM audience WHERE token_hash=?').get(hash);
        if (entry?.subscribed) db.prepare('INSERT INTO audience_events VALUES (?,?,?,?,?,?)').run(randomUUID(),entry.email,'unsubscribe',0,now,null);
        db.prepare('UPDATE audience SET subscribed=0,unsubscribed_at=?,updated_at=? WHERE token_hash=?').run(now,now,hash);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    audience() { return db.prepare('SELECT email,name,sources,subscribed,consent,updated_at,unsubscribed_at FROM audience ORDER BY email').all(); },
    events() { return db.prepare('SELECT email,source,opted_in,created_at,consent FROM audience_events ORDER BY created_at').all(); },
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
