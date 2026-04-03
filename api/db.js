// Database API — Neon Postgres CRUD
// Uses @neondatabase/serverless for HTTP-based SQL
// Routes: ?action=setup|load|save-accounts|save-account|save-events|save-settings

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  const sql = neon(DATABASE_URL);
  const action = req.query.action || (req.body && req.body.action);

  // ── SETUP: Create tables ──
  if (action === 'setup') {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          account_id INTEGER UNIQUE NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;
      return res.status(200).json({ success: true, message: 'Tables created' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── LOAD: Load all data ──
  if (action === 'load') {
    try {
      const accounts = await sql`SELECT data FROM accounts ORDER BY account_id`;
      const events = await sql`SELECT data FROM events ORDER BY created_at`;
      const settings = await sql`SELECT key, value FROM settings`;

      return res.status(200).json({
        accounts: accounts.map(r => r.data),
        events: events.map(r => r.data),
        settings: Object.fromEntries(settings.map(r => [r.key, r.value])),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SAVE-ACCOUNTS: Upsert all accounts ──
  if (action === 'save-accounts') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { accounts } = req.body;
      if (!accounts || !Array.isArray(accounts)) return res.status(400).json({ error: 'accounts array required' });

      await sql`DELETE FROM accounts`;

      for (const acct of accounts) {
        await sql`
          INSERT INTO accounts (account_id, data)
          VALUES (${acct.id}, ${JSON.stringify(acct)})
        `;
      }

      return res.status(200).json({ success: true, count: accounts.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SAVE-ACCOUNT: Upsert single account ──
  if (action === 'save-account') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { account } = req.body;
      if (!account || !account.id) return res.status(400).json({ error: 'account with id required' });

      await sql`
        INSERT INTO accounts (account_id, data, updated_at)
        VALUES (${account.id}, ${JSON.stringify(account)}, NOW())
        ON CONFLICT (account_id) DO UPDATE SET data = ${JSON.stringify(account)}, updated_at = NOW()
      `;

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SAVE-EVENTS: Upsert all events ──
  if (action === 'save-events') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { events } = req.body;
      if (!events || !Array.isArray(events)) return res.status(400).json({ error: 'events array required' });

      await sql`DELETE FROM events`;

      for (const evt of events) {
        await sql`
          INSERT INTO events (id, data)
          VALUES (${evt.id}, ${JSON.stringify(evt)})
        `;
      }

      return res.status(200).json({ success: true, count: events.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SAVE-SETTINGS: Upsert settings ──
  if (action === 'save-settings') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { settings } = req.body;
      if (!settings) return res.status(400).json({ error: 'settings object required' });

      for (const [key, value] of Object.entries(settings)) {
        await sql`
          INSERT INTO settings (key, value) VALUES (${key}, ${String(value)})
          ON CONFLICT (key) DO UPDATE SET value = ${String(value)}
        `;
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action. Use: setup, load, save-accounts, save-account, save-events, save-settings' });
}
