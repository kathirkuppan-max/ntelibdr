import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_EMAILS = ['kathir@nteligroup.com', 'david@nteligroup.com']
const COOKIE_NAME = 'nteli_session'
const SESSION_DAYS = 7

export async function GET(req: NextRequest) {
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID || ''
  const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || ''
  const AUTH_REDIRECT = 'https://ntelibdr.vercel.app/api/auth?action=callback'

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'login') {
    if (!CLIENT_ID) return NextResponse.json({ error: 'GMAIL_CLIENT_ID not configured' }, { status: 500 })
    const scopes = ['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'].join(' ')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(AUTH_REDIRECT)}&response_type=code&scope=${encodeURIComponent(scopes)}&prompt=select_account`
    return NextResponse.redirect(url)
  }

  if (action === 'callback') {
    const code = searchParams.get('code')
    if (!code) return errorResponse('No authorization code received')

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: AUTH_REDIRECT, grant_type: 'authorization_code' }),
      })
      const tokens = await tokenRes.json()
      if (tokens.error) return errorResponse(tokens.error_description || tokens.error)

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const user = await userRes.json()
      const email = (user.email || '').toLowerCase()

      if (!ALLOWED_EMAILS.includes(email)) {
        return errorResponse(`Access denied for ${email}. Only authorized @nteligroup.com accounts can sign in.`, true)
      }

      const session = {
        email,
        name: user.name || email.split('@')[0],
        picture: user.picture || '',
        exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
      }
      const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
      const sig = createHmac('sha256', CLIENT_SECRET).update(payload).digest('base64url')
      const token = `${payload}.${sig}`

      const response = NextResponse.redirect(new URL('/', req.url))
      response.cookies.set(COOKIE_NAME, token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: SESSION_DAYS * 86400,
      })
      return response
    } catch (err: unknown) {
      return errorResponse((err as Error).message)
    }
  }

  if (action === 'check') {
    const session = validateSession(req, CLIENT_SECRET)
    if (!session) return NextResponse.json({ authenticated: false })
    return NextResponse.json({
      authenticated: true,
      email: session.email,
      name: session.name,
      picture: session.picture,
    })
  }

  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.set(COOKIE_NAME, '', { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0 })
    return response
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

function validateSession(req: NextRequest, secret: string) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null

  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  if (sig !== expected) return null

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!session.exp || Date.now() > session.exp) return null
    if (!ALLOWED_EMAILS.includes(session.email)) return null
    return session
  } catch {
    return null
  }
}

function errorResponse(message: string, showRetry = false) {
  const html = `<!DOCTYPE html><html><head><title>NTELI BDR — Access Denied</title>
    <style>body{font-family:system-ui;background:#FAFAFA;color:#171717;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
    .card{background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;padding:40px;max-width:400px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.1);}
    h1{color:#DC2626;font-size:20px;margin-bottom:12px;}
    p{color:#525252;line-height:1.6;font-size:14px;}
    a{color:#2563EB;text-decoration:none;display:inline-block;margin-top:16px;padding:8px 20px;border:1px solid #2563EB;border-radius:6px;}
    a:hover{background:#EFF6FF;}</style></head>
    <body><div class="card"><h1>Access Denied</h1><p>${message}</p>
    ${showRetry ? '<a href="/api/auth?action=login">Try Another Account</a>' : ''}
    <a href="/">Back to Home</a></div></body></html>`
  return new NextResponse(html, { status: 403, headers: { 'Content-Type': 'text/html' } })
}
