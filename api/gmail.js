// Gmail API Integration — OAuth, Send, Track, Status
// Vercel Serverless Function: /api/gmail?action=auth|callback|send|track|status|check

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || (req.body && req.body.action);
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
  const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

  // ── AUTH: Redirect to Google OAuth consent ──
  if (action === 'auth') {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return res.status(500).json({ error: 'GMAIL_CLIENT_ID and GMAIL_REDIRECT_URI not configured. Add them in Vercel Environment Variables.' });
    }
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ].join(' ');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&access_type=offline` +
      `&prompt=consent`;
    return res.redirect(302, url);
  }

  // ── CALLBACK: Exchange code for tokens ──
  if (action === 'callback') {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: 'No authorization code received' });
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) return res.status(400).json({ error: tokens.error_description || tokens.error });

      // Display the refresh token for the user to save as env var
      return res.status(200).send(`
        <html><head><title>Gmail Connected</title>
        <style>body{font-family:system-ui;background:#0D1117;color:#E6EDF3;padding:40px;max-width:700px;margin:0 auto;}
        h1{color:#3FB950;}code{background:#161B22;padding:12px 16px;border-radius:8px;display:block;margin:12px 0;word-break:break-all;font-size:13px;border:1px solid #2A3446;color:#58A6FF;}
        .steps{background:#161B22;padding:20px;border-radius:8px;border:1px solid #2A3446;margin:20px 0;}
        .steps li{margin:8px 0;line-height:1.6;}</style></head>
        <body>
          <h1>Gmail Connected Successfully</h1>
          <p>Copy the refresh token below and add it as <strong>GMAIL_REFRESH_TOKEN</strong> in your Vercel Environment Variables.</p>
          <code>${tokens.refresh_token || 'No refresh token returned — you may have already authorized. Revoke access at myaccount.google.com/permissions and try again.'}</code>
          <div class="steps">
            <strong>Next steps:</strong>
            <ol>
              <li>Go to <a href="https://vercel.com" target="_blank" style="color:#58A6FF;">Vercel Dashboard</a> &rarr; your project &rarr; Settings &rarr; Environment Variables</li>
              <li>Add: <strong>GMAIL_REFRESH_TOKEN</strong> = the token above</li>
              <li>Redeploy your project</li>
              <li>Go back to NTELI BDR and start sending emails</li>
            </ol>
          </div>
          <a href="/" style="color:#58A6FF;">&larr; Back to NTELI BDR</a>
        </body></html>
      `);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Helper: Get fresh access token ──
  async function getAccessToken() {
    if (!REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Gmail not configured. Add GMAIL_REFRESH_TOKEN, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET to Vercel env vars.');
    }
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });
    const data = await tokenRes.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data.access_token;
  }

  // ── SEND: Send email via Gmail API ──
  if (action === 'send') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { to, subject, body, fromName, emailId } = req.body;
      if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, body required' });

      const accessToken = await getAccessToken();

      // Get sender email from profile
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();
      const from = fromName ? `${fromName} <${profile.emailAddress}>` : profile.emailAddress;

      // Build HTML body with tracking pixel
      const host = req.headers.host || req.headers['x-forwarded-host'] || '';
      const trackUrl = `https://${host}/api/gmail?action=track&eid=${encodeURIComponent(emailId || 'unknown')}`;
      const htmlBody = body.replace(/\n/g, '<br>') +
        `<img src="${trackUrl}" width="1" height="1" style="display:none;" alt="">`;

      // Construct MIME message
      const mime = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        htmlBody,
      ].join('\r\n');

      // Base64url encode
      const encoded = Buffer.from(mime).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      // Send via Gmail API
      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encoded }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) return res.status(sendRes.status).json({ error: sendData.error?.message || 'Send failed' });

      return res.status(200).json({
        success: true,
        messageId: sendData.id,
        threadId: sendData.threadId,
        from: profile.emailAddress,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── TRACK: Serve 1x1 tracking pixel ──
  if (action === 'track') {
    // 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Note: In v1, open tracking is best-effort. The pixel serves but we can't persist opens
    // in stateless Vercel. Client-side polls thread status instead.
    return res.status(200).send(pixel);
  }

  // ── STATUS: Check Gmail connection and get sender info ──
  if (action === 'status') {
    if (!REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
      return res.status(200).json({ connected: false, reason: 'Missing env vars' });
    }
    try {
      const accessToken = await getAccessToken();
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();
      if (!profileRes.ok) return res.status(200).json({ connected: false, reason: profile.error?.message });
      return res.status(200).json({ connected: true, email: profile.emailAddress });
    } catch (err) {
      return res.status(200).json({ connected: false, reason: err.message });
    }
  }

  // ── CHECK: Check thread for replies ──
  if (action === 'check') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    try {
      const { threadIds } = req.body;
      if (!threadIds || !threadIds.length) return res.status(400).json({ error: 'threadIds required' });

      const accessToken = await getAccessToken();
      const results = {};

      for (const tid of threadIds.slice(0, 20)) {
        try {
          const threadRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${tid}?format=metadata&metadataHeaders=From`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const thread = await threadRes.json();
          if (thread.messages && thread.messages.length > 1) {
            // Check if any reply is from someone other than us
            const profile = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then(r => r.json());

            const replies = thread.messages.filter(m => {
              const fromHeader = (m.payload?.headers || []).find(h => h.name === 'From');
              return fromHeader && !fromHeader.value.includes(profile.emailAddress);
            });
            results[tid] = { replied: replies.length > 0, replyCount: replies.length, totalMessages: thread.messages.length };
          } else {
            results[tid] = { replied: false, replyCount: 0, totalMessages: thread.messages?.length || 1 };
          }
        } catch {
          results[tid] = { replied: false, error: true };
        }
      }

      return res.status(200).json({ results });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action. Use: auth, callback, send, track, status, check' });
}
