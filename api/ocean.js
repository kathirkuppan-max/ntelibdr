// api/ocean.js — Ocean.io server-side proxy (Vercel serverless)
// Auth: "x-api-token" header per https://docs.ocean.io/getting-started/authentication

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OCEAN_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OCEAN_API_KEY not configured on server' });

  const { endpoint, body } = req.body || {};
  if (!endpoint || !body) return res.status(400).json({ error: 'Missing endpoint or body' });

  const url = `https://api.ocean.io/${endpoint}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiKey,   // ← correct auth header per Ocean.io docs (was X-API-KEY)
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.detail || data?.message || data?.error || `Ocean.io HTTP ${upstream.status}`,
        upstream_body: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy fetch failed' });
  }
}
