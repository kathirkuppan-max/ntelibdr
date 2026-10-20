// /api/chat — RAG chatbot for product Q&A
//
// RECOMMENDED: Use the Vercel AI SDK with the AI Gateway for provider abstraction,
// cost tracking, failover, and observability without changing code to swap providers.
//   → https://sdk.vercel.ai/docs
//   → https://vercel.com/docs/ai-gateway
//
// TODO to wire this up:
//   1. npm install ai
//   2. Authenticate · prefer OIDC for production:
//        (a) Recommended: OIDC token via `vercel env pull` — auto-rotated, no manual key mgmt
//        (b) Simpler alternative: AI_GATEWAY_API_KEY env var (requires manual rotation)
//   3. Build the knowledge base · use channel.html, salesforce.html, and the glossary
//      as the RAG corpus. For a small product like this, an in-memory array of canonical
//      Q&A pairs is enough; for richer retrieval, use @vercel/postgres with pgvector
//      or Pinecone.
//   4. Verify the current model identifier at https://sdk.vercel.ai/providers — model
//      IDs evolve frequently and the latest documented one is the safest pick.
//
// Frontend wiring: add a floating chat bubble to landing.html that POSTs to this endpoint
// with { message, history } and renders the streamed response via the AI SDK UI helpers.

const SYSTEM_PROMPT = `You are the Nteli Channel product expert.
You answer questions from prospective customers (semiconductor and electronics manufacturers)
about how the product works.

You are honest, technical, and never overclaim.

Key facts:
- Nteli Channel is Channel Revenue Management software
- Sits between any CRM (Salesforce, Dynamics, HubSpot) and any ERP (SAP, Oracle, NetSuite, Dynamics 365, Infor, Epicor)
- Replaces spreadsheets and email threads for Ship & Debit, Design Registrations, POS reconciliation, Claim Aggregation, GL posting
- Private deployment in customer's environment (AWS, Azure, GCP, on-prem) — not SaaS
- 3–4 week deployment for Phase 1 (one distributor, one BU, one quarter parallel run)
- Pricing: Phase 1 $80K–$200K · Phase 2 $250K–$600K · fixed-fee deployment + annual support
- No customers yet · in early conversations with several fabless semi and power electronics manufacturers
- SOC 2 Type II readiness package included · customer attains certification typically within 6 months of go-live

If asked something not covered above, say "let me get you a 30-min call with the team"
and provide the Calendly link: https://calendly.com/n-teli-salesforce/nteli-io
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      res.status(400).json({ error: 'Message required' });
      return;
    }

    // --- RECOMMENDED: Vercel AI SDK + AI Gateway · provider-agnostic, streaming, tool calling ---
    //
    // Uncomment after installing:
    //   npm i ai
    //
    // import { generateText, streamText } from 'ai';
    //
    // // Route through AI Gateway using the "<provider>/<current-model-id>" string format.
    // // Look up the current model id at https://sdk.vercel.ai/providers — IDs change often.
    // const result = await generateText({
    //   model: '<provider>/<current-model-id>',  // e.g. an Anthropic or OpenAI model from the provider docs
    //   system: SYSTEM_PROMPT,
    //   messages: [...history, { role: 'user', content: message }],
    // });
    // const reply = result.text;
    //
    // For streaming (recommended for chat UX), use streamText() and return:
    //   return result.toUIMessageStreamResponse();   // for chat UIs
    //   // or: result.toTextStreamResponse();         // for text-only clients
    //
    // Provider failover, cost tracking, and observability come for free when routed
    // through the Gateway (just authenticate via AI_GATEWAY_API_KEY or OIDC).

    // Until wired, return a placeholder
    const reply = `Thanks for asking about: "${message}". The chatbot isn't wired to an AI provider yet. Book a 30-min call here: https://calendly.com/n-teli-salesforce/nteli-io`;

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[CHAT ERROR]', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
