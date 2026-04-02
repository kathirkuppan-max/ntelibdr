export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OCEAN_API_KEY;
  if (!key) return res.status(500).json({ error: 'OCEAN_API_KEY not set in Vercel environment variables' });

  const { endpoint, body } = req.body || {};
  if (!endpoint || !body) return res.status(400).json({ error: 'Missing endpoint or body' });

  // Ocean.io v2 API uses apiToken as query param
  const url = `https://api.ocean.io/${endpoint}?apiToken=${encodeURIComponent(key)}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    let data;
    try { data = await r.json(); } catch (e) { data = { message: 'Non-JSON response from Ocean.io' }; }

    if (!r.ok) {
      return res.status(r.status).json({
        error: data.detail || data.message || 'Ocean.io API error',
        status: r.status,
        hint: r.status === 401 ? 'Invalid API key — check OCEAN_API_KEY in Vercel env vars'
            : r.status === 422 ? 'Request format rejected — check payload structure'
            : r.status === 429 ? 'Rate limit hit — wait a moment and retry'
            : 'Ocean.io returned an error'
      });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Proxy error: ' + e.message });
  }
}
