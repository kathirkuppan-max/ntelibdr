// api/ocean.js — Ocean.io server-side proxy (Vercel serverless)
// Accepts { endpoint, body } from the client and forwards to api.ocean.io
// The endpoint field comes from the client: e.g. "v3/search/companies"

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OCEAN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OCEAN_API_KEY not configured on server' });
  }

  // Client sends { endpoint: "v3/search/companies", body: { ... } }
  const { endpoint, body } = req.body || {};

  if (!endpoint || !body) {
    return res.status(400).json({ error: 'Missing endpoint or body in request' });
  }

  // Always use v3 — reject any legacy v1/v2 calls defensively
  const safeEndpoint = endpoint.replace(/^v[12]\//, 'v3/');
  const url = `https://api.ocean.io/${safeEndpoint}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Forward the upstream error with its status so the UI shows the real message
      return res.status(upstream.status).json({
        error: data?.message || data?.error || `Ocean.io returned HTTP ${upstream.status}`,
        upstream_status: upstream.status,
        upstream_body: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy fetch failed' });
  }
}
