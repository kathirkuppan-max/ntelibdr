// /api/onepager — Generate a personalized 1-page pitch for a prospect
//
// RECOMMENDED: Vercel AI SDK + AI Gateway (provider-agnostic, observability, failover).
//   → https://sdk.vercel.ai/docs
//   → https://vercel.com/docs/ai-gateway
//
// TODO to wire this up:
//   1. npm install ai
//   2. Authenticate · prefer OIDC token via `vercel env pull` for production (auto-rotated)
//   3. (Optional) Email the resulting PDF/HTML via Resend or SendGrid
//
// Frontend: add a form to landing.html where prospect enters company + role + email.
// POST { company, role, email } here → returns personalized HTML or generates a PDF.

const PROMPT_TEMPLATE = (company, role) => `
You are writing a personalized one-page pitch for Nteli Channel — Channel Revenue
Management for semiconductor and electronics manufacturers.

Target reader: ${role} at ${company}.

Write a 4-section one-pager:
  1. "Why this matters at ${company}" — reference their publicly known business
     (distribution model, BUs, product lines, recent news)
  2. "Three specific scenarios from your channel ops" — concrete examples
     tailored to a semi/electronics manufacturer at ${company}'s scale
  3. "Estimated leakage exposure" — using 5–15% industry benchmark on
     their estimated channel revenue
  4. "Suggested Phase 1 scope" — recommend 1 distributor + 1 BU + 1 quarter
     parallel run, with fixed-fee estimate ($80K–$200K)

Style: direct, technical, no marketing fluff. The reader is sophisticated and time-poor.
End with the Calendly link: https://calendly.com/n-teli-salesforce/nteli-io
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { company, role, email } = req.body || {};
    if (!company || !email) {
      res.status(400).json({ error: 'Company and email required' });
      return;
    }

    console.log('[ONEPAGER]', JSON.stringify({ company, role, email, ts: new Date().toISOString() }));

    // --- RECOMMENDED: Vercel AI SDK + AI Gateway ---
    //
    // import { generateText } from 'ai';
    //
    // const result = await generateText({
    //   model: '<provider>/<current-model-id>',
    //   prompt: PROMPT_TEMPLATE(company, role || 'channel ops director'),
    // });
    // const onepager = result.text;
    //
    // To email the result, integrate Resend or SendGrid here.

    const onepager = `[ONE-PAGER PLACEHOLDER for ${company}]\n\nThis endpoint isn't wired to an AI provider yet. Once configured, it will return a 4-section personalized pitch tailored to ${company} and ${role || 'your role'}. For now, book a call: https://calendly.com/n-teli-salesforce/nteli-io`;

    res.status(200).json({ onepager });
  } catch (err) {
    console.error('[ONEPAGER ERROR]', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
