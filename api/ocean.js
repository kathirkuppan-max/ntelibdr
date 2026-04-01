export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OCEAN_KEY = process.env.OCEAN_API_KEY;
  if (!OCEAN_KEY) return res.status(500).json({ error: 'OCEAN_API_KEY not set in Vercel env vars' });

  try {
    const { endpoint = 'v3/search/companies', body = {} } = req.body;
    const allowed = ['v3/search/companies', 'v3/search/people', 'v2/enrich/company'];
    const path = endpoint.startsWith('v') ? endpoint : `v3/${endpoint}`;
    if (!allowed.includes(path)) return res.status(400).json({ error: `Endpoint not allowed: ${path}` });

    const r = await fetch(`https://api.ocean.io/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': OCEAN_KEY },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
