// Database API — Neon Postgres CRUD
// Uses Neon's serverless HTTP API (no npm dependencies)
// Routes: ?action=setup|load|save-accounts|save-account|save-events|save-settings

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!POSTGRES_URL) return res.status(500).json({ error: 'POSTGRES_URL not configured' });

  const action = req.query.action || (req.body && req.body.action);

  // ── Helper: Execute SQL via Neon HTTP ──
  async function sql(query, params = []) {
    // Parse connection string for Neon HTTP endpoint
    const url = new URL(POSTGRES_URL);
    const host = url.hostname;
    const httpUrl = `https://${host}/sql`;

    const r = await fetch(httpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': POSTGRES_URL,
      },
      body: JSON.stringify({ query, params }),
    });

    if (!r.ok) {
      const err = await r.text();
      throw new Error(`SQL error: ${err}`);
    }
    return await r.json();
  }

  // ── SETUP: Create tables ──
  if (action === 'setup') {
    try {
      await sql(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          account_id INTEGER UNIQUE NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await sql(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await sql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);
      return res.status(200).json({ success: true, message: 'Tables created' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── LOAD: Load all data ──
  if (action === 'load') {
    try {
      const [accounts, events, settings] = await Promise.all([
        sql('SELECT data FROM accounts ORDER BY account_id'),
        sql('SELECT data FROM events ORDER BY created_at'),
        sql('SELECT key, value FROM settings'),
      ]);

      return res.status(200).json({
        accounts: (accounts.rows || []).map(r => r.data || r[0]),
        events: (events.rows || []).map(r => r.data || r[0]),
        settings: Object.fromEntries((settings.rows || []).map(r => [r.key || r[0], r.value || r[1]])),
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

      // Delete all existing and re-insert (simple full sync)
      await sql('DELETE FROM accounts');

      for (const acct of accounts) {
        await sql(
          'INSERT INTO accounts (account_id, data) VALUES ($1, $2)',
          [acct.id, JSON.stringify(acct)]
        );
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

      await sql(
        `INSERT INTO accounts (account_id, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (account_id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [account.id, JSON.stringify(account)]
      );

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

      await sql('DELETE FROM events');

      for (const evt of events) {
        await sql(
          'INSERT INTO events (id, data) VALUES ($1, $2)',
          [evt.id, JSON.stringify(evt)]
        );
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
        await sql(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = $2`,
          [key, String(value)]
        );
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action. Use: setup, load, save-accounts, save-account, save-events, save-settings' });
}
