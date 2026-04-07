'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Meeting, Stage, FollowUp } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

const STAGES: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']

const STAGE_BADGE: Record<string, string> = {
  Prospect: 'bg-surface2 text-text3 border-border',
  Connected: 'bg-blue-bg text-blue border-blue-border',
  Met: 'bg-amber-bg text-amber border-amber-border',
  'Following Up': 'bg-purple-bg text-purple border-purple-border',
  Engaged: 'bg-blue-bg text-blue border-blue-border',
  Meeting: 'bg-green-bg text-green border-green-border',
  Proposal: 'bg-gold-bg text-gold border-gold-border',
  Won: 'bg-green-bg text-green border-green-border',
  Lost: 'bg-red-bg text-red border-red-border',
}

export function AccountDetail() {
  const { selectedAccount: sel, updateAccount, save, events, gmailConnected } = useStore()
  const [enriching, setEnriching] = useState(false)

  if (!sel) return null

  function saveStage(stage: Stage) {
    updateAccount(sel!.id, { stage })
    setTimeout(save, 100)
  }

  async function enrichContacts() {
    if (!sel) return
    setEnriching(true)

    // Check pre-enriched first
    const preEnriched = PRE_ENRICHED[sel.company]
    if (preEnriched?.length) {
      updateAccount(sel.id, {
        contacts: preEnriched,
        contactsDate: 'Apr 2026 (Clay verified)',
        contactsSource: 'clay',
      })
      setTimeout(save, 100)
      setEnriching(false)
      return
    }

    // Try Explorium API
    try {
      let bizId = sel.explorium_id
      if (!bizId) {
        const matchR = await fetch('/api/vibe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'match-business',
            payload: { businesses_to_match: [{ name: sel.company, domain: sel.website || null }] },
          }),
        })
        const matchData = await matchR.json()
        const matched = matchData.matched_businesses || matchData.data || []
        bizId = matched[0]?.business_id
        if (bizId) updateAccount(sel.id, { explorium_id: bizId })
      }

      if (!bizId) {
        updateAccount(sel.id, {
          contacts: [{ name: `${sel.company} — not in Explorium`, initials: '?', title: 'Use Clay MCP to enrich contacts', email: '', emailValid: false, phone: '', linkedin: '', simulated: true }],
          contactsDate: new Date().toLocaleDateString(),
          contactsSource: 'not_found',
        })
        setTimeout(save, 100)
        setEnriching(false)
        return
      }

      const r = await fetch('/api/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch-prospects',
          payload: {
            mode: 'full', size: 5, page_size: 5,
            filters: { business_id: { values: [bizId] }, job_level: { values: ['c-suite'] }, has_email: { value: true } },
          },
        }),
      })
      const data = await r.json()
      const prospects = data.data || data.prospects || data.results || []
      const contacts = prospects.map((p: Record<string, string>) => ({
        name: p.full_name || p.name || `${p.first_name} ${p.last_name}` || 'Unknown',
        initials: ((p.first_name || '')[0] || '') + ((p.last_name || '')[0] || ''),
        title: p.job_title || p.title || 'Unknown',
        email: p.email || p.business_email || '',
        emailValid: !!(p.email || p.business_email),
        phone: p.phone_number || p.phone || '',
        linkedin: p.linkedin_url || p.linkedin || '',
      }))

      updateAccount(sel.id, {
        contacts: contacts.length ? contacts : [{ name: 'No verified contacts', initials: '?', title: 'Check VIBE_API_KEY', email: '', emailValid: false, phone: '', linkedin: '', simulated: true }],
        contactsDate: new Date().toLocaleDateString(),
        contactsSource: contacts.length ? 'explorium' : 'simulated',
      })
      setTimeout(save, 100)
    } catch {
      // handled
    }
    setEnriching(false)
  }

  return (
    <div className="bg-bg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 pb-3.5 bg-surface2 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold leading-tight">{sel.company}</h2>
            <p className="text-[13px] text-text3 mt-0.5">{sel.vertical} · {sel.city} · {sel.rev}</p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <select
              value={sel.stage}
              onChange={e => saveStage(e.target.value as Stage)}
              className="bg-surface border border-border text-text text-[13px] px-2.5 py-1.5 rounded-md outline-none cursor-pointer"
            >
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            {sel.website && (
              <a href={`https://${sel.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-border2 rounded-md text-text2 hover:bg-surface2">
                Website
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <Badge className={sel.priority === 'High' ? 'bg-gold-bg text-gold border-gold-border' : 'bg-blue-bg text-blue border-blue-border'}>
            {sel.priority} Priority
          </Badge>
          {sel.pe && <Badge className="bg-purple-bg text-purple border-purple-border">PE-Backed</Badge>}
          <Badge className={STAGE_BADGE[sel.stage] || 'bg-surface2 text-text3 border-border'}>{sel.stage}</Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
        {/* Account Intel */}
        <Card title="Account Intel" action={
          sel.website ? <a href={`https://${sel.website}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue hover:underline">Website</a> : undefined
        }>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              ['Revenue', sel.rev],
              ['Employees', sel.emp],
              ['Ownership', sel.ownership],
              ['CXO Targets', sel.cxo],
              ['Website', sel.website],
              ['Source', sel.source || 'Manual'],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface2 rounded-md p-2.5">
                <div className="text-[11px] text-text3 font-medium mb-1">{label}</div>
                <div className="text-[13px] font-medium">{label === 'CXO Targets' ? <span className="text-blue font-semibold">{value}</span> : value}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text3 mb-1.5">Pain Points for RCA</div>
          {sel.pains.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-bg rounded-md border-l-3 border-l-blue-border mb-1.5">
              <span className="text-[10px] font-bold text-blue font-mono min-w-[16px]">#{i + 1}</span>
              <span className="text-[13px]">{p}</span>
            </div>
          ))}
        </Card>

        {/* Key Contacts */}
        <Card
          title="Key Contacts"
          action={
            <button
              onClick={enrichContacts}
              disabled={enriching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-bg text-purple border border-purple-border rounded-md hover:opacity-80 disabled:opacity-40 cursor-pointer"
            >
              {enriching && <span className="spinner" style={{ borderColor: 'var(--color-purple-border)', borderTopColor: 'var(--color-purple)' }} />}
              Enrich
            </button>
          }
        >
          {sel.contacts?.length ? (
            <>
              <div className="text-[11px] text-purple font-semibold mb-2.5 px-2.5 py-1 bg-purple-bg border border-purple-border rounded-sm inline-block">
                {sel.contactsSource === 'clay' ? 'Clay Verified' : sel.contactsSource === 'explorium' ? 'Explorium' : 'Unverified'} · {sel.contacts.length} contacts · {sel.contactsDate || ''}
              </div>
              {sel.contacts.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-surface2 rounded-md border border-border mb-2">
                  <div className="w-9 h-9 rounded-full bg-blue-bg text-blue flex items-center justify-center text-[13px] font-semibold shrink-0">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-text3 mt-px mb-1.5">{c.title}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-medium ${c.emailValid ? 'border-green-border text-green' : 'border-border text-text2'}`}>
                          ✉ {c.email}
                        </a>
                      )}
                      {c.linkedin && (
                        <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-border text-text2 hover:text-blue">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                  <Badge className={c.emailValid ? 'bg-green-bg text-green border-green-border' : 'bg-amber-bg text-amber border-amber-border'}>
                    {c.emailValid ? '✓ Valid' : 'Unverified'}
                  </Badge>
                </div>
              ))}
            </>
          ) : (
            <p className="text-text3 text-[13px] italic">Click &quot;Enrich&quot; to pull verified contacts.</p>
          )}
        </Card>

        {/* Meetings & Follow-ups */}
        <MeetingsCard />
      </div>
    </div>
  )
}

function MeetingsCard() {
  const { selectedAccount: sel, updateAccount, save, events, gmailConnected } = useStore()
  const [generating, setGenerating] = useState(false)

  if (!sel) return null

  async function logMeeting() {
    if (!sel) return
    const attendingEvents = events.filter(e => e.attending)
    if (!attendingEvents.length) { alert('Mark an event as attending first (Events tab)'); return }

    const eventName = attendingEvents.length === 1
      ? attendingEvents[0].name
      : prompt('Which event?\n' + attendingEvents.map((e, i) => `${i + 1}. ${e.name}`).join('\n'), attendingEvents[0].name)
    if (!eventName) return

    const contactName = sel.contacts?.length
      ? prompt('Who did you meet?\n' + sel.contacts.map((c, i) => `${i + 1}. ${c.name} (${c.title})`).join('\n'), sel.contacts[0].name)
      : prompt('Who did you meet? (name)')
    if (!contactName) return

    const notes = prompt('What did you discuss? (key topics, follow-up items)')
    if (!notes) return

    const contact = (sel.contacts || []).find(c => c.name.includes(contactName) || contactName.includes(c.name)) || { name: contactName, email: '', title: '' }

    const meeting: Meeting = {
      id: 'm_' + Date.now(),
      event: eventName,
      contact: contact.name,
      contactEmail: contact.email || '',
      contactTitle: contact.title || '',
      notes,
      date: new Date().toLocaleDateString(),
      followUps: [
        { day: 1, status: 'pending', subject: '', body: '', sentAt: null },
        { day: 5, status: 'pending', subject: '', body: '', sentAt: null },
        { day: 10, status: 'pending', subject: '', body: '', sentAt: null },
      ],
    }

    const meetings = [...(sel.meetings || []), meeting]
    const stage = ['Prospect', 'Connected'].includes(sel.stage) ? 'Met' as Stage : sel.stage
    updateAccount(sel.id, { meetings, stage })
    setTimeout(save, 100)

    // Generate follow-ups
    setGenerating(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const senderName = sig.split('|')[0].trim()
      const stories = localStorage.getItem('nteli_stories') || CASE_STUDY_KB.CRO

      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Generate a 3-email follow-up sequence for a manufacturing executive I just met at an event.

MEETING CONTEXT:
- Met: ${meeting.contact} (${meeting.contactTitle}) at ${sel.company}
- Event: ${meeting.event}
- What we discussed: ${meeting.notes}
- Company: ${sel.company} (${sel.vertical}, ${sel.city}, ${sel.rev})
- Sender: ${senderName}

CUSTOMER STORIES TO REFERENCE:
${stories}

GENERATE 3 EMAILS:
Email 1 (send next day): Brief follow-up referencing the conversation. Attach case study mention. 3 sentences max.
Email 2 (send day 5): Check if the case study resonated. Reference specific topic from meeting notes. 3 sentences max.
Email 3 (send day 10): Suggest a 30-min meeting to dive deeper. Reference their specific challenge from notes. 3 sentences max.

RULES:
- Sound like a real person, not a sales rep
- No buzzwords, no fluff
- Use first names
- Each email: subject line + body, 3 sentences max

Return JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]
ONLY JSON array.`,
          }],
        }),
      })
      const data = await r.json()
      const text = data.content?.[0]?.text || ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const emails = JSON.parse(jsonMatch[0])
        if (emails.length === 3) {
          const updatedMeetings = [...meetings]
          const idx = updatedMeetings.length - 1
          emails.forEach((email: { subject: string; body: string }, i: number) => {
            updatedMeetings[idx].followUps[i].subject = email.subject
            updatedMeetings[idx].followUps[i].body = email.body
            updatedMeetings[idx].followUps[i].status = 'ready'
          })
          updateAccount(sel.id, { meetings: updatedMeetings })
          setTimeout(save, 100)
        }
      }
    } catch {
      // handled
    }
    setGenerating(false)
  }

  async function sendFollowUp(meetingIdx: number, followUpIdx: number) {
    if (!sel) return
    if (!gmailConnected) { alert('Connect Gmail first (Settings)'); return }
    const meetings = [...(sel.meetings || [])]
    const meeting = meetings[meetingIdx]
    const fu = meeting.followUps[followUpIdx]
    if (!meeting.contactEmail) { alert(`No email for ${meeting.contact} — add manually`); return }

    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const fromName = sig.split('|')[0].trim()
      const emailId = 'fu_' + Date.now()
      const r = await fetch('/api/gmail?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: meeting.contactEmail, subject: fu.subject, body: fu.body, fromName, emailId }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.error || 'Send failed')

      fu.status = 'sent'
      fu.sentAt = new Date().toLocaleDateString()
      const stage = sel.stage === 'Met' ? 'Following Up' as Stage : sel.stage
      updateAccount(sel.id, { meetings, stage })
      setTimeout(save, 100)
    } catch (e) {
      alert('Send failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

  const STATUS_ICON: Record<string, string> = { pending: '⏳', ready: '📧', sent: '✅', opened: '👁️', replied: '💬' }
  const STATUS_LABEL: Record<string, string> = { pending: 'Generating...', ready: 'Ready to send', sent: 'Sent', opened: 'Opened', replied: 'Replied' }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Meetings &amp; Follow-ups
          {gmailConnected ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-bg text-green border border-green-border">Gmail Connected</span>
          ) : (
            <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-0.5 rounded-full bg-red-bg text-red border border-red-border cursor-pointer">Gmail: Connect</a>
          )}
        </span>
      }
      action={
        <button
          onClick={logMeeting}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue2 text-white border border-blue2 rounded-md hover:bg-blue cursor-pointer disabled:opacity-40"
        >
          {generating && <span className="spinner" />}
          Met at Event
        </button>
      }
    >
      {!sel.meetings?.length ? (
        <p className="text-text3 text-[13px] italic py-2">
          No meetings yet. Meet someone at an event and click &quot;Met at Event&quot; to start the follow-up sequence.
        </p>
      ) : (
        [...sel.meetings].reverse().map((m, ri) => {
          const mi = sel.meetings!.length - 1 - ri
          return (
            <div key={m.id} className="bg-surface2 border border-border rounded-md p-3 mb-2.5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-semibold">{m.contact}</div>
                  <div className="text-xs text-text3">{m.contactTitle} · {m.event} · {m.date}</div>
                </div>
                {m.contactEmail ? (
                  <Badge className="bg-green-bg text-green border-green-border">✉ {m.contactEmail}</Badge>
                ) : (
                  <Badge className="bg-amber-bg text-amber border-amber-border">No email</Badge>
                )}
              </div>
              <div className="text-[13px] text-text2 leading-relaxed mb-2.5 p-2 bg-surface3 rounded-md italic">
                &quot;{m.notes}&quot;
              </div>
              <div className="text-[11px] font-semibold text-text3 uppercase tracking-wider mb-1.5">Follow-up Sequence</div>
              {m.followUps.map((fu, fi) => (
                <div key={fi} className="flex items-center gap-2 px-2 py-1.5 border-b border-border text-xs">
                  <span>{STATUS_ICON[fu.status] || '⏳'}</span>
                  <span className="text-text3 font-mono min-w-[40px]">Day {fu.day}</span>
                  <span className="flex-1 truncate">{fu.subject || 'Generating...'}</span>
                  <span className="text-[10px] text-text3">{STATUS_LABEL[fu.status]}</span>
                  {fu.status === 'ready' && (
                    <button onClick={() => sendFollowUp(mi, fi)} className="px-2 py-0.5 text-[11px] font-semibold bg-blue2 text-white rounded cursor-pointer hover:bg-blue">
                      Send
                    </button>
                  )}
                  {fu.status === 'sent' && fu.sentAt && (
                    <span className="text-[10px] text-green">{fu.sentAt}</span>
                  )}
                </div>
              ))}
            </div>
          )
        })
      )}
    </Card>
  )
}

function Card({ title, action, children }: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="text-[13px] font-semibold">{title}</div>
        {action}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${className}`}>
      {children}
    </span>
  )
}
