export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  try {
    const body = req.body;
    const stream = body.stream === true;
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
    } else {
      const data = await upstream.json();
      return res.status(upstream.ok ? 200 : upstream.status).json(data);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
