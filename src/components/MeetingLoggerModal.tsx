'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { useStore } from '@/lib/store'
import type { Meeting, Stage, Contact, ProductId } from '@/lib/types'
import { PRE_ENRICHED } from '@/lib/contacts'
import { PRODUCTS, pickPersonaForProduct } from '@/lib/products'

interface Props {
  open: boolean
  onClose: () => void
  defaultAccountId?: number
  defaultContactName?: string
}

export function MeetingLoggerModal({ open, onClose, defaultAccountId, defaultContactName }: Props) {
  const { accounts, updateAccount, save, selectedProduct } = useStore()

  const [accountId, setAccountId] = useState<number | null>(defaultAccountId ?? null)
  const [where, setWhere] = useState('')
  const [contactName, setContactName] = useState(defaultContactName || '')
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [newContact, setNewContact] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const account = accounts.find(a => a.id === accountId)
  const contacts: Contact[] = account ? (account.contacts || PRE_ENRICHED[account.company] || []) : []

  async function handleSubmit() {
    if (!accountId || !where || (!contactName && !newName) || !notes) return
    const acct = accounts.find(a => a.id === accountId)
    if (!acct) return

    const cName = newContact ? newName : contactName
    const c = newContact
      ? { name: newName, title: newTitle, email: newEmail, initials: newName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() }
      : contacts.find(x => x.name === contactName) || { name: cName, email: '', title: '' }

    const meeting: Meeting = {
      id: 'm_' + Date.now(),
      event: where,
      contact: c.name,
      contactEmail: ('email' in c ? c.email : '') || '',
      contactTitle: ('title' in c ? c.title : '') || '',
      notes,
      date: new Date().toISOString(),
      followUps: [
        { day: 1, status: 'pending', subject: '', body: '', sentAt: null },
        { day: 5, status: 'pending', subject: '', body: '', sentAt: null },
        { day: 10, status: 'pending', subject: '', body: '', sentAt: null },
      ],
    }

    const meetings = [...(acct.meetings || []), meeting]
    const stage: Stage = ['Prospect', 'Connected'].includes(acct.stage) ? 'Met' : acct.stage
    updateAccount(accountId, { meetings, stage })
    setTimeout(save, 100)

    setGenerating(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      // Pick the product to pitch: prefer the global selection if the
      // account is tagged for it; otherwise fall back to the account's first
      // tagged product.
      const acctProducts = (acct.products && acct.products.length ? acct.products : ['recapture']) as ProductId[]
      const drafProduct: ProductId = (selectedProduct !== 'all' && acctProducts.includes(selectedProduct as ProductId))
        ? (selectedProduct as ProductId)
        : acctProducts[0]
      const product = PRODUCTS[drafProduct]
      const stories = localStorage.getItem('nteli_stories') || product.caseStudies.CRO
      const contactTitle = 'title' in c ? c.title : ''
      const persona = pickPersonaForProduct(drafProduct, contactTitle || '')
      const signalContext = (acct.signals || []).slice(0, 2).map(s => `· ${s.type}: ${s.title}`).join('\n') || 'none'

      const r = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1024,
          messages: [{ role: 'user', content: `Generate 3 follow-up emails for ${c.name} (${contactTitle}) at ${acct.company}. Met at ${where}. Discussed: ${notes}.

Company: ${acct.vertical}, ${acct.rev}. Pains: ${acct.pains.join(', ')}.
Recent signals:\n${signalContext}

Sender: ${sig.split('|')[0].trim()}.

BUYER PERSONA: ${persona.persona}
HOOK TO USE: ${persona.hook}
DOMAIN INSIGHT: ${persona.insight}
MEETING ASK: ${persona.ask}
CASE STUDY TO REFERENCE: ${persona.case_study}

Product: ${product.productLineDescription}

Stories: ${stories}

Email 1 (day 1, ≤3 sentences): Thank + reference the specific topic discussed + tease the insight.
Email 2 (day 5, ≤3 sentences): Lead with one case-study data point. Ask the meeting.
Email 3 (day 10, ≤3 sentences): Re-ask + create a small urgency hook (e.g. a recent signal or regulatory date).

Sound human. Use first names. No buzzwords. No pronouncing-confident emoji.
Return ONLY JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]` }],
        }),
      })
      const data = await r.json()
      const text = data.content?.[0]?.text || ''
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const emails = JSON.parse(match[0])
        if (emails.length === 3) {
          emails.forEach((email: { subject: string; body: string }, i: number) => {
            meeting.followUps[i].subject = email.subject
            meeting.followUps[i].body = email.body
            meeting.followUps[i].status = 'ready'
          })
          const updatedMeetings = [...(acct.meetings || []).filter(m => m.id !== meeting.id), meeting]
          updateAccount(accountId, { meetings: updatedMeetings })
          setTimeout(save, 100)
        }
      }
    } catch { /* handled */ }
    setGenerating(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log a Meeting">
      <div className="space-y-5">
        <Field label="Account">
          <select
            value={accountId ?? ''}
            onChange={e => { setAccountId(Number(e.target.value)); setContactName(''); setNewContact(false) }}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors"
          >
            <option value="">Select account...</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.company} · {a.city}</option>)}
          </select>
        </Field>

        <Field label="Where did you meet? (event name, conference, coffee, etc.)">
          <input
            value={where}
            onChange={e => setWhere(e.target.value)}
            placeholder="e.g. CBI Pharma Contracting Summit"
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors"
          />
        </Field>

        <Field label="Who did you meet?">
          {!newContact ? (
            <>
              {contacts.length > 0 ? (
                <select
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors"
                >
                  <option value="">Select contact...</option>
                  {contacts.map((c, i) => <option key={i} value={c.name}>{c.name} — {c.title}</option>)}
                </select>
              ) : (
                <p className="text-[13px] text-text3">No contacts on file for this account.</p>
              )}
              <button onClick={() => setNewContact(true)} className="text-[12px] text-blue font-medium mt-2 cursor-pointer hover:underline">
                + Add new contact
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors" />
              <input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors" />
              <input placeholder="Email (optional)" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors" />
              <button onClick={() => setNewContact(false)} className="text-[12px] text-text3 cursor-pointer hover:underline">Cancel — pick existing</button>
            </div>
          )}
        </Field>

        <Field label="What did you discuss?">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key topics, their challenges, what you promised to send..."
            rows={4}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors resize-y leading-relaxed"
          />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!accountId || !where || (!contactName && !newName) || !notes || generating}
          className="w-full py-3.5 text-[14px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors"
        >
          {generating ? 'Generating follow-up emails...' : 'Log Meeting & Generate Follow-ups'}
        </button>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text2 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
