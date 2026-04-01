export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.OCEAN_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'OCEAN_API_KEY not set' });
  try {
    const { endpoint = 'v3/search/companies', body = {} } = req.body;
    const r = await fetch(`https://api.ocean.io/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': KEY },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
