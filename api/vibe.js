export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.VIBE_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'VIBE_API_KEY not set' });
  try {
    const { action, payload = {} } = req.body;
    const urls = {
      'fetch-businesses': 'https://api.explorium.ai/v1/businesses/fetch',
      'fetch-prospects':  'https://api.explorium.ai/v1/prospects/fetch',
      'enrich-prospects': 'https://api.explorium.ai/v1/prospects/enrich',
      'business-events':  'https://api.explorium.ai/v1/businesses/events',
    };
    if (!urls[action]) return res.status(400).json({ error: `Unknown action: ${action}` });
    const r = await fetch(urls[action], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api_key': KEY },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
