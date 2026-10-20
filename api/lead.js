// /api/lead — POST endpoint for exit-intent capture
//
// TODO: pick one of:
//   (A) SendGrid       — npm i @sendgrid/mail · set SENDGRID_API_KEY env var
//   (B) Resend         — npm i resend · set RESEND_API_KEY env var
//   (C) HubSpot Forms  — set HUBSPOT_PORTAL_ID + HUBSPOT_FORM_ID env vars
//   (D) Just log & email yourself manually for now
//
// Current implementation: option (D) — logs to Vercel Functions stdout.
// You'll see captures in the Vercel dashboard → Project → Logs.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, company, source, timestamp } = req.body || {};
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    // Log to Vercel Functions stdout (visible in dashboard)
    console.log('[LEAD]', JSON.stringify({ email, company, source, timestamp, ip: req.headers['x-forwarded-for'] || 'unknown' }));

    // --- OPTION A: SendGrid (uncomment + npm i @sendgrid/mail) ---
    // const sg = require('@sendgrid/mail');
    // sg.setApiKey(process.env.SENDGRID_API_KEY);
    // await sg.send({
    //   to: 'sales@nteli.io',
    //   from: 'hello@nteli.io',
    //   subject: `New exit-intent capture: ${company || email}`,
    //   text: `Email: ${email}\nCompany: ${company}\nSource: ${source}\nTimestamp: ${timestamp}`,
    // });

    // --- OPTION B: Resend (uncomment + npm i resend) ---
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    // --- OPTION C: HubSpot Forms ---
    // await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_ID}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fields: [{ name: 'email', value: email }, { name: 'company', value: company }] }),
    // });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[LEAD ERROR]', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
