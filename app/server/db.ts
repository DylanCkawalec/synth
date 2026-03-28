import Database from 'better-sqlite3'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

const DATA_DIR = resolve(import.meta.dirname, '..', '..', 'data')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = resolve(DATA_DIR, 'synth.db')
export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('busy_timeout = 5000')

db.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('real','sim')),
    name TEXT,
    balance_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_wallets_mode ON wallets(mode);

  CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('real','sim')),
    snapshot_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    model_version TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_pred_wallet_mode ON predictions(wallet_id, mode);
  CREATE INDEX IF NOT EXISTS idx_pred_created ON predictions(created_at);

  CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    params_json TEXT NOT NULL DEFAULT '{}',
    prediction_id TEXT,
    mode TEXT NOT NULL DEFAULT 'real',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    order_result_json TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
  CREATE INDEX IF NOT EXISTS idx_approvals_mode ON approvals(mode);

  CREATE TABLE IF NOT EXISTS sim_mints (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_mint_wallet_date ON sim_mints(wallet_id, date);

  CREATE TABLE IF NOT EXISTS summaries (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL,
    content TEXT NOT NULL,
    period TEXT CHECK(period IN ('run','daily','weekly','monthly')),
    prediction_ids TEXT DEFAULT '[]',
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sum_tag ON summaries(tag);
  CREATE INDEX IF NOT EXISTS idx_sum_period ON summaries(period);
`)

// ── Wallet Store ──────────────────────────────────────────────────
export const walletStore = {
  get(id: string) {
    return db.prepare('SELECT * FROM wallets WHERE id = ?').get(id) as DbWallet | undefined
  },
  getByWalletAndMode(walletId: string, mode: string) {
    return db.prepare('SELECT * FROM wallets WHERE wallet_id = ? AND mode = ?').get(walletId, mode) as DbWallet | undefined
  },
  getByMode(mode: string) {
    return db.prepare('SELECT * FROM wallets WHERE mode = ?').all(mode) as DbWallet[]
  },
  listAll() {
    return db.prepare('SELECT * FROM wallets ORDER BY created_at DESC').all() as DbWallet[]
  },
  upsert(w: DbWallet) {
    db.prepare(`INSERT INTO wallets (id, wallet_id, mode, name, balance_json, created_at, updated_at)
      VALUES (@id, @wallet_id, @mode, @name, @balance_json, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET balance_json=@balance_json, name=@name, updated_at=@updated_at`
    ).run(w)
  },
}

// ── Prediction Store ──────────────────────────────────────────────
export const predictionStore = {
  insert(p: DbPrediction) {
    db.prepare('INSERT INTO predictions (id, wallet_id, mode, snapshot_json, created_at, model_version) VALUES (@id, @wallet_id, @mode, @snapshot_json, @created_at, @model_version)').run(p)
  },
  getById(id: string) {
    return db.prepare('SELECT * FROM predictions WHERE id = ?').get(id) as DbPrediction | undefined
  },
  listByWallet(walletId: string, limit = 50) {
    return db.prepare('SELECT * FROM predictions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ?').all(walletId, limit) as DbPrediction[]
  },
  listByMode(mode: string, limit = 50) {
    return db.prepare('SELECT * FROM predictions WHERE mode = ? ORDER BY created_at DESC LIMIT ?').all(mode, limit) as DbPrediction[]
  },
  listAll(limit = 50) {
    return db.prepare('SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?').all(limit) as DbPrediction[]
  },
  deleteOlderThan(isoDate: string) {
    return db.prepare('DELETE FROM predictions WHERE created_at < ?').run(isoDate)
  },
  countByDateAndMode(date: string, mode: string) {
    return (db.prepare("SELECT COUNT(*) as c FROM predictions WHERE created_at LIKE ? AND mode = ?").get(`${date}%`, mode) as { c: number }).c
  },
}

// ── Summary Store ─────────────────────────────────────────────────
export const summaryStore = {
  insert(s: DbSummary) {
    db.prepare('INSERT INTO summaries (id, tag, content, period, prediction_ids, created_at) VALUES (@id, @tag, @content, @period, @prediction_ids, @created_at)').run(s)
  },
  getByTag(tagPrefix: string, limit = 50) {
    return db.prepare("SELECT * FROM summaries WHERE tag LIKE ? ORDER BY created_at DESC LIMIT ?").all(`${tagPrefix}%`, limit) as DbSummary[]
  },
  listByPeriod(period: string, limit = 50) {
    return db.prepare('SELECT * FROM summaries WHERE period = ? ORDER BY created_at DESC LIMIT ?').all(period, limit) as DbSummary[]
  },
  listRecent(limit = 50) {
    return db.prepare('SELECT * FROM summaries ORDER BY created_at DESC LIMIT ?').all(limit) as DbSummary[]
  },
  listRunSummariesSince(since: string) {
    return db.prepare("SELECT * FROM summaries WHERE period = 'run' AND created_at > ? ORDER BY created_at ASC").all(since) as DbSummary[]
  },
}

// ── Approval Store ────────────────────────────────────────────────
export const approvalStore = {
  insert(a: DbApproval) {
    db.prepare(`INSERT INTO approvals (id, type, params_json, prediction_id, mode, status, created_at)
      VALUES (@id, @type, @params_json, @prediction_id, @mode, @status, @created_at)`).run(a)
  },
  listPending(mode?: string) {
    if (mode) return db.prepare("SELECT * FROM approvals WHERE status = 'pending' AND mode = ? ORDER BY created_at DESC").all(mode) as DbApproval[]
    return db.prepare("SELECT * FROM approvals WHERE status = 'pending' ORDER BY created_at DESC").all() as DbApproval[]
  },
  listAll(limit = 100) {
    return db.prepare('SELECT * FROM approvals ORDER BY created_at DESC LIMIT ?').all(limit) as DbApproval[]
  },
  getById(id: string) {
    return db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as DbApproval | undefined
  },
  updateStatus(id: string, status: string, orderResultJson?: string) {
    db.prepare('UPDATE approvals SET status = ?, resolved_at = ?, order_result_json = ? WHERE id = ?')
      .run(status, new Date().toISOString(), orderResultJson || null, id)
  },
  count(status: string) {
    return (db.prepare('SELECT COUNT(*) as c FROM approvals WHERE status = ?').get(status) as { c: number }).c
  },
}

// ── Mint Store ────────────────────────────────────────────────────
export const mintStore = {
  // Returns total minted today (local date string YYYY-MM-DD)
  todayTotal(walletId: string, date: string): number {
    const row = db.prepare(
      'SELECT COALESCE(SUM(amount),0) as total FROM sim_mints WHERE wallet_id = ? AND date = ?'
    ).get(walletId, date) as { total: number }
    return row.total
  },
  // Returns how many individual mints happened today
  todayCount(walletId: string, date: string): number {
    const row = db.prepare(
      'SELECT COUNT(*) as c FROM sim_mints WHERE wallet_id = ? AND date = ?'
    ).get(walletId, date) as { c: number }
    return row.c
  },
  record(id: string, walletId: string, amount: number, date: string) {
    db.prepare(
      'INSERT INTO sim_mints (id, wallet_id, amount, date, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, walletId, amount, date, new Date().toISOString())
  },
  history(walletId: string, limit = 30) {
    return db.prepare(
      'SELECT * FROM sim_mints WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(walletId, limit) as DbMint[]
  },
}

// ── Types ─────────────────────────────────────────────────────────
export interface DbWallet {
  id: string
  wallet_id: string
  mode: 'real' | 'sim'
  name: string | null
  balance_json: string
  created_at: string
  updated_at: string
}

export interface DbPrediction {
  id: string
  wallet_id: string
  mode: 'real' | 'sim'
  snapshot_json: string
  created_at: string
  model_version: string | null
}

export interface DbApproval {
  id: string; type: string; params_json: string; prediction_id: string | null
  mode: string; status: string; created_at: string; resolved_at: string | null; order_result_json: string | null
}

export interface DbMint {
  id: string
  wallet_id: string
  amount: number
  date: string
  created_at: string
}

export interface DbSummary {
  id: string
  tag: string
  content: string
  period: 'run' | 'daily' | 'weekly' | 'monthly'
  prediction_ids: string
  created_at: string
}
