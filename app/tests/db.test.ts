import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'

describe('SQLite bucket stores', () => {
  let db: Database.Database

  beforeEach(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE wallets (id TEXT PRIMARY KEY, wallet_id TEXT, mode TEXT, name TEXT, balance_json TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE predictions (id TEXT PRIMARY KEY, wallet_id TEXT, mode TEXT, snapshot_json TEXT, created_at TEXT, model_version TEXT);
      CREATE TABLE summaries (id TEXT PRIMARY KEY, tag TEXT, content TEXT, period TEXT, prediction_ids TEXT, created_at TEXT);
    `)
  })

  it('inserts and retrieves a wallet', () => {
    db.prepare('INSERT INTO wallets VALUES (?,?,?,?,?,?,?)').run('w1', 'real-id', 'sim', 'Test', '{"total":"1000"}', '2026-01-01', '2026-01-01')
    const row = db.prepare('SELECT * FROM wallets WHERE id = ?').get('w1') as Record<string, string>
    expect(row.wallet_id).toBe('real-id')
    expect(row.mode).toBe('sim')
    expect(JSON.parse(row.balance_json).total).toBe('1000')
  })

  it('inserts immutable prediction snapshots', () => {
    const pred = { id: 'p1', thesis: 'test', confidence: 0.8 }
    db.prepare('INSERT INTO predictions VALUES (?,?,?,?,?,?)').run('p1', 'w1', 'real', JSON.stringify(pred), '2026-01-01', 'gpt-4o')
    db.prepare('INSERT INTO predictions VALUES (?,?,?,?,?,?)').run('p1_v2', 'w1', 'real', JSON.stringify({ ...pred, status: 'resolved' }), '2026-01-02', 'gpt-4o')
    const rows = db.prepare('SELECT * FROM predictions WHERE wallet_id = ? ORDER BY created_at').all('w1') as Record<string, string>[]
    expect(rows.length).toBe(2)
    expect(JSON.parse(rows[1].snapshot_json).status).toBe('resolved')
  })

  it('inserts and queries summaries by tag', () => {
    db.prepare('INSERT INTO summaries VALUES (?,?,?,?,?,?)').run('s1', 'w1_real_2026-01-01_gpt-4o', 'BUY Bitcoin 80%', 'run', '["p1"]', '2026-01-01')
    db.prepare('INSERT INTO summaries VALUES (?,?,?,?,?,?)').run('s2', 'w1_real_2026-01-01_gpt-4o', 'SELL Ethereum 60%', 'run', '["p2"]', '2026-01-01')
    db.prepare('INSERT INTO summaries VALUES (?,?,?,?,?,?)').run('s3', 'w1_sim_2026-01-01_gpt-4o', 'SIM prediction', 'run', '["p3"]', '2026-01-01')

    const realNotes = db.prepare("SELECT * FROM summaries WHERE tag LIKE ?").all('w1_real%') as Record<string, string>[]
    expect(realNotes.length).toBe(2)

    const simNotes = db.prepare("SELECT * FROM summaries WHERE tag LIKE ?").all('w1_sim%') as Record<string, string>[]
    expect(simNotes.length).toBe(1)
  })

  it('deletes predictions older than a date', () => {
    db.prepare('INSERT INTO predictions VALUES (?,?,?,?,?,?)').run('old', 'w1', 'real', '{}', '2025-01-01', 'v1')
    db.prepare('INSERT INTO predictions VALUES (?,?,?,?,?,?)').run('new', 'w1', 'real', '{}', '2026-06-01', 'v1')
    const result = db.prepare('DELETE FROM predictions WHERE created_at < ?').run('2026-01-01')
    expect(result.changes).toBe(1)
    const remaining = db.prepare('SELECT * FROM predictions').all()
    expect(remaining.length).toBe(1)
  })
})
