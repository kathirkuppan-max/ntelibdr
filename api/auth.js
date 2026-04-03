// Authentication — Google Sign-In with email allowlist
// Routes: ?action=login|callback|check|logout

import { createHmac } from 'crypto';

const ALLOWED_EMAILS = ['kathir@nteligroup.com', 'david@nteligroup.com'];
const COOKIE_NAME = 'nteli_session';
const SESSION_DAYS = 7;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
  const AUTH_REDIRECT = process.env.AUTH_REDIRECT_URI || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth?action=callback` : 'https://ntelibdr.vercel.app/api/auth?action=callback');

  const action = req.query.action;

  // ── LOGIN: Redirect to Google OAuth ──
  if (action === 'login') {
    if (!CLIENT_ID) return res.status(500).json({ error: 'GMAIL_CLIENT_ID not configured' });
    const scopes = [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(AUTH_REDIRECT)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&prompt=select_account`;
    return res.redirect(302, url);
  }

  // ── CALLBACK: Exchange code, validate email, set cookie ──
  if (action === 'callback') {
    const code = req.query.code;
    if (!code) return res.status(400).send(errorPage('No authorization code received'));

    try {
      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: AUTH_REDIRECT,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) return res.status(400).send(errorPage(tokens.error_description || tokens.error));

      // Get user info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const user = await userRes.json();
      const email = (user.email || '').toLowerCase();

      // Check allowlist
      if (!ALLOWED_EMAILS.includes(email)) {
        return res.status(403).send(errorPage(
          `Access denied for ${email}. Only authorized @nteligroup.com accounts can sign in.`,
          true
        ));
      }

      // Create session token (simple HMAC-signed JSON)
      const session = {
        email,
        name: user.name || email.split('@')[0],
        picture: user.picture || '',
        exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
      };
      const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
      const sig = createHmac('sha256', CLIENT_SECRET).update(payload).digest('base64url');
      const token = `${payload}.${sig}`;

      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', [
        `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`,
      ]);

      // Redirect to app
      return res.redirect(302, '/');
    } catch (err) {
      return res.status(500).send(errorPage(err.message));
    }
  }

  // ── CHECK: Validate session ──
  if (action === 'check') {
    const session = validateSession(req, CLIENT_SECRET);
    if (!session) return res.status(200).json({ authenticated: false });
    return res.status(200).json({
      authenticated: true,
      email: session.email,
      name: session.name,
      picture: session.picture,
    });
  }

  // ── LOGOUT: Clear cookie ──
  if (action === 'logout') {
    res.setHeader('Set-Cookie', [
      `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    ]);
    return res.redirect(302, '/');
  }

  return res.status(400).json({ error: 'Unknown action. Use: login, callback, check, logout' });
}

// ── Helpers ──

function validateSession(req, secret) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  // Verify signature
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return null;

  // Decode and check expiry
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!session.exp || Date.now() > session.exp) return null;
    if (!ALLOWED_EMAILS.includes(session.email)) return null;
    return session;
  } catch {
    return null;
  }
}

function parseCookies(str) {
  return Object.fromEntries(
    str.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k, v.join('=')])
  );
}

function errorPage(message, showRetry = false) {
  return `<!DOCTYPE html><html><head><title>NTELI BDR — Access Denied</title>
    <style>body{font-family:system-ui;background:#0D1117;color:#E6EDF3;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .card{background:#161B22;border:1px solid #2A3446;border-radius:12px;padding:40px;max-width:400px;text-align:center;}
    h1{color:#F85149;font-size:20px;margin-bottom:12px;}
    p{color:#8B949E;line-height:1.6;font-size:14px;}
    a{color:#58A6FF;text-decoration:none;display:inline-block;margin-top:16px;padding:8px 20px;border:1px solid #58A6FF;border-radius:6px;}
    a:hover{background:#58A6FF22;}</style></head>
    <body><div class="card"><h1>Access Denied</h1><p>${message}</p>
    ${showRetry ? '<a href="/api/auth?action=login">Try Another Account</a>' : ''}
    <a href="/">Back to Home</a></div></body></html>`;
}
