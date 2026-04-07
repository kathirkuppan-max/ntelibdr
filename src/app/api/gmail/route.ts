import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = () => process.env.GMAIL_CLIENT_ID || ''
const CLIENT_SECRET = () => process.env.GMAIL_CLIENT_SECRET || ''
const REDIRECT_URI = () => process.env.GMAIL_REDIRECT_URI || ''
const REFRESH_TOKEN = () => process.env.GMAIL_REFRESH_TOKEN || ''

async function getAccessToken() {
  const rt = REFRESH_TOKEN(), cid = CLIENT_ID(), cs = CLIENT_SECRET()
  if (!rt || !cid || !cs) throw new Error('Gmail not configured')
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: rt, client_id: cid, client_secret: cs, grant_type: 'refresh_token' }),
  })
  const data = await tokenRes.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data.access_token as string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'auth') {
    const cid = CLIENT_ID(), ruri = REDIRECT_URI()
    if (!cid || !ruri) return NextResponse.json({ error: 'GMAIL_CLIENT_ID and GMAIL_REDIRECT_URI not configured' }, { status: 500 })
    const scopes = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar.events'].join(' ')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(ruri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`
    return NextResponse.redirect(url)
  }

  if (action === 'callback') {
    const code = searchParams.get('code')
    if (!code) return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: CLIENT_ID(), client_secret: CLIENT_SECRET(), redirect_uri: REDIRECT_URI(), grant_type: 'authorization_code' }),
      })
      const tokens = await tokenRes.json()
      if (tokens.error) return NextResponse.json({ error: tokens.error_description || tokens.error }, { status: 400 })
      const html = `<html><head><title>Gmail Connected</title>
        <style>body{font-family:system-ui;background:#FAFAFA;color:#171717;padding:40px;max-width:700px;margin:0 auto;}
        h1{color:#16A34A;}code{background:#F5F5F5;padding:12px 16px;border-radius:8px;display:block;margin:12px 0;word-break:break-all;font-size:13px;border:1px solid #E5E5E5;color:#2563EB;}</style></head>
        <body><h1>Gmail Connected</h1><p>Copy refresh token below and add as GMAIL_REFRESH_TOKEN in Vercel.</p>
        <code>${tokens.refresh_token || 'No refresh token — revoke access at myaccount.google.com/permissions and retry.'}</code>
        <a href="/" style="color:#2563EB;">&larr; Back to NTELI BDR</a></body></html>`
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'status') {
    const rt = REFRESH_TOKEN(), cid = CLIENT_ID(), cs = CLIENT_SECRET()
    if (!rt || !cid || !cs) return NextResponse.json({ connected: false, reason: 'Missing env vars' })
    try {
      const accessToken = await getAccessToken()
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = await profileRes.json()
      if (!profileRes.ok) return NextResponse.json({ connected: false, reason: profile.error?.message })
      return NextResponse.json({ connected: true, email: profile.emailAddress })
    } catch (err: unknown) {
      return NextResponse.json({ connected: false, reason: (err as Error).message })
    }
  }

  if (action === 'track') {
    const eid = searchParams.get('eid') || 'unknown'
    const KV_URL = process.env.KV_REST_API_URL
    const KV_TOKEN = process.env.KV_REST_API_TOKEN
    if (KV_URL && KV_TOKEN && eid !== 'unknown') {
      try {
        await fetch(`${KV_URL}/set/open:${eid}/${Date.now()}`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` },
        })
      } catch { /* best-effort */ }
    }
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { body = {} }

  if (action === 'send') {
    const { to, subject, body: emailBody, fromName, emailId } = body as Record<string, string>
    if (!to || !subject || !emailBody) return NextResponse.json({ error: 'to, subject, body required' }, { status: 400 })
    try {
      const accessToken = await getAccessToken()
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = await profileRes.json()
      const from = fromName ? `${fromName} <${profile.emailAddress}>` : profile.emailAddress
      const host = req.headers.get('host') || ''
      const trackUrl = `https://${host}/api/gmail?action=track&eid=${encodeURIComponent(emailId || 'unknown')}`
      const htmlBody = emailBody.replace(/\n/g, '<br>') + `<img src="${trackUrl}" width="1" height="1" style="display:none;" alt="">`
      const mime = [`From: ${from}`, `To: ${to}`, `Subject: ${subject}`, 'MIME-Version: 1.0', 'Content-Type: text/html; charset=utf-8', '', htmlBody].join('\r\n')
      const encoded = Buffer.from(mime).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encoded }),
      })
      const sendData = await sendRes.json()
      if (!sendRes.ok) return NextResponse.json({ error: sendData.error?.message || 'Send failed' }, { status: sendRes.status })
      return NextResponse.json({ success: true, messageId: sendData.id, threadId: sendData.threadId, from: profile.emailAddress })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'opens') {
    const KV_URL = process.env.KV_REST_API_URL
    const KV_TOKEN = process.env.KV_REST_API_TOKEN
    if (!KV_URL || !KV_TOKEN) return NextResponse.json({ results: {}, kvConfigured: false })
    const { emailIds } = body as { emailIds: string[] }
    if (!emailIds?.length) return NextResponse.json({ error: 'emailIds required' }, { status: 400 })
    const results: Record<string, { opened: boolean; openedAt?: string }> = {}
    for (const eid of emailIds.slice(0, 50)) {
      try {
        const r = await fetch(`${KV_URL}/get/open:${eid}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } })
        const d = await r.json()
        results[eid] = d.result ? { opened: true, openedAt: new Date(parseInt(d.result)).toLocaleDateString() } : { opened: false }
      } catch { results[eid] = { opened: false } }
    }
    return NextResponse.json({ results, kvConfigured: true })
  }

  if (action === 'check') {
    const { threadIds } = body as { threadIds: string[] }
    if (!threadIds?.length) return NextResponse.json({ error: 'threadIds required' }, { status: 400 })
    try {
      const accessToken = await getAccessToken()
      const results: Record<string, { replied: boolean; replyCount: number; totalMessages: number; error?: boolean }> = {}
      for (const tid of threadIds.slice(0, 20)) {
        try {
          const threadRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${tid}?format=metadata&metadataHeaders=From`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const thread = await threadRes.json()
          if (thread.messages?.length > 1) {
            const profile = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then(r => r.json())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const replies = thread.messages.filter((m: any) => {
              const fromHeader = (m.payload?.headers || []).find((h: any) => h.name === 'From')
              return fromHeader && !fromHeader.value.includes(profile.emailAddress)
            })
            results[tid] = { replied: replies.length > 0, replyCount: replies.length, totalMessages: thread.messages.length }
          } else {
            results[tid] = { replied: false, replyCount: 0, totalMessages: thread.messages?.length || 1 }
          }
        } catch { results[tid] = { replied: false, replyCount: 0, totalMessages: 1, error: true } }
      }
      return NextResponse.json({ results })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  if (action === 'calendar') {
    const { summary, location, description, startDate, endDate } = body as Record<string, string>
    if (!summary || !startDate) return NextResponse.json({ error: 'summary and startDate required' }, { status: 400 })
    try {
      const accessToken = await getAccessToken()
      const event = {
        summary, location: location || '', description: description || '',
        start: { date: startDate }, end: { date: endDate || startDate },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }] },
      }
      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
      const calData = await calRes.json()
      if (!calRes.ok) return NextResponse.json({ error: calData.error?.message || 'Calendar error' }, { status: calRes.status })
      return NextResponse.json({ success: true, eventId: calData.id, htmlLink: calData.htmlLink })
    } catch (err: unknown) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }

  // Also handle status via POST (legacy compat)
  if (action === 'status') {
    const rt = REFRESH_TOKEN(), cid = CLIENT_ID(), cs = CLIENT_SECRET()
    if (!rt || !cid || !cs) return NextResponse.json({ connected: false, reason: 'Missing env vars' })
    try {
      const accessToken = await getAccessToken()
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = await profileRes.json()
      if (!profileRes.ok) return NextResponse.json({ connected: false, reason: profile.error?.message })
      return NextResponse.json({ connected: true, email: profile.emailAddress })
    } catch (err: unknown) {
      return NextResponse.json({ connected: false, reason: (err as Error).message })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
