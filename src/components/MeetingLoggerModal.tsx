'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { useStore } from '@/lib/store'
import type { Meeting, Stage, Contact } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

interface Props {
  open: boolean
  onClose: () => void
  defaultAccountId?: number
  defaultEventId?: string
  defaultContactName?: string
}

export function MeetingLoggerModal({ open, onClose, defaultAccountId, defaultEventId, defaultContactName }: Props) {
  const { accounts, events, updateAccount, save } = useStore()
  const attendingEvents = events.filter(e => e.attending)

  const [accountId, setAccountId] = useState<number | null>(defaultAccountId ?? null)
  const [eventId, setEventId] = useState(defaultEventId || '')
  const [contactName, setContactName] = useState(defaultContactName || '')
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [newContact, setNewContact] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const account = accounts.find(a => a.id === accountId)
  const contacts: Contact[] = account ? (account.contacts || PRE_ENRICHED[account.company] || []) : []
  const event = events.find(e => e.id === eventId)

  async function handleSubmit() {
    if (!accountId || !eventId || (!contactName && !newName) || !notes) return
    const acct = accounts.find(a => a.id === accountId)
    if (!acct) return

    const cName = newContact ? newName : contactName
    const c = newContact
      ? { name: newName, title: newTitle, email: newEmail, initials: newName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() }
      : contacts.find(x => x.name === contactName) || { name: cName, email: '', title: '' }

    const meeting: Meeting = {
      id: 'm_' + Date.now(),
      event: event?.name || eventId,
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

    // Generate follow-ups
    setGenerating(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const stories = localStorage.getItem('nteli_stories') || CASE_STUDY_KB.CRO
      const r = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1024,
          messages: [{ role: 'user', content: `Generate 3 follow-up emails for ${c.name} (${'title' in c ? c.title : ''}) at ${acct.company}. Met at ${event?.name || eventId}. Discussed: ${notes}. Company: ${acct.vertical}, ${acct.rev}. Their pain: ${acct.pains.join(', ')}. Sender: ${sig.split('|')[0].trim()}.\n\nStories: ${stories}\n\nEmail 1 (day 1): 3 sentences. Email 2 (day 5): 3 sentences. Email 3 (day 10): 3 sentences. Sound human, first names.\n\nReturn ONLY JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]` }],
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
        {/* Account */}
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

        {/* Event */}
        <Field label="Event">
          <select
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors"
          >
            <option value="">Select event...</option>
            {attendingEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          {attendingEvents.length === 0 && (
            <p className="text-[12px] text-amber mt-1">No events marked as attending. Go to Today page and click &quot;I&apos;ll go&quot; on an event first.</p>
          )}
        </Field>

        {/* Contact */}
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

        {/* Notes */}
        <Field label="What did you discuss?">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key topics, their challenges, what you promised to send..."
            rows={4}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors resize-y leading-relaxed"
          />
        </Field>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!accountId || !eventId || (!contactName && !newName) || !notes || generating}
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
