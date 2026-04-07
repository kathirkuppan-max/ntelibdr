'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Meeting, Stage } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

const STAGES: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']

const STAGE_BADGE: Record<string, string> = {
  Prospect: 'bg-surface2 text-text2',
  Connected: 'bg-blue-bg text-blue',
  Met: 'bg-amber-bg text-amber',
  'Following Up': 'bg-purple-bg text-purple',
  Engaged: 'bg-blue-bg text-blue',
  Meeting: 'bg-green-bg text-green',
  Proposal: 'bg-amber-bg text-amber',
  Won: 'bg-green-bg text-green',
  Lost: 'bg-red-bg text-red',
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
    const preEnriched = PRE_ENRICHED[sel.company]
    if (preEnriched?.length) {
      updateAccount(sel.id, { contacts: preEnriched, contactsDate: 'Apr 2026 (Clay verified)', contactsSource: 'clay' })
      setTimeout(save, 100)
      setEnriching(false)
      return
    }
    try {
      let bizId = sel.explorium_id
      if (!bizId) {
        const matchR = await fetch('/api/vibe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'match-business', payload: { businesses_to_match: [{ name: sel.company, domain: sel.website || null }] } }) })
        const matchData = await matchR.json()
        bizId = (matchData.matched_businesses || matchData.data || [])[0]?.business_id
        if (bizId) updateAccount(sel.id, { explorium_id: bizId })
      }
      if (!bizId) {
        updateAccount(sel.id, { contacts: [{ name: `${sel.company} — not in Explorium`, initials: '?', title: 'Use Clay MCP to enrich contacts', email: '', emailValid: false, phone: '', linkedin: '', simulated: true }], contactsDate: new Date().toLocaleDateString(), contactsSource: 'not_found' })
        setTimeout(save, 100)
        setEnriching(false)
        return
      }
      const r = await fetch('/api/vibe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'fetch-prospects', payload: { mode: 'full', size: 5, page_size: 5, filters: { business_id: { values: [bizId] }, job_level: { values: ['c-suite'] }, has_email: { value: true } } } }) })
      const data = await r.json()
      const prospects = data.data || data.prospects || data.results || []
      const contacts = prospects.map((p: Record<string, string>) => ({ name: p.full_name || p.name || `${p.first_name} ${p.last_name}` || 'Unknown', initials: ((p.first_name || '')[0] || '') + ((p.last_name || '')[0] || ''), title: p.job_title || p.title || 'Unknown', email: p.email || p.business_email || '', emailValid: !!(p.email || p.business_email), phone: p.phone_number || p.phone || '', linkedin: p.linkedin_url || p.linkedin || '' }))
      updateAccount(sel.id, { contacts: contacts.length ? contacts : [{ name: 'No verified contacts', initials: '?', title: 'Check VIBE_API_KEY', email: '', emailValid: false, phone: '', linkedin: '', simulated: true }], contactsDate: new Date().toLocaleDateString(), contactsSource: contacts.length ? 'explorium' : 'simulated' })
      setTimeout(save, 100)
    } catch { /* handled */ }
    setEnriching(false)
  }

  return (
    <div className="bg-bg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-bold text-text leading-tight">{sel.company}</h2>
            <p className="text-[13px] text-text2 mt-1">{sel.vertical} · {sel.city} · {sel.rev}</p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <select
              value={sel.stage}
              onChange={e => saveStage(e.target.value as Stage)}
              className="bg-white border border-border text-text text-[13px] px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-border2 transition-colors"
            >
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            {sel.website && (
              <a href={`https://${sel.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 text-[13px] font-medium border border-border rounded-lg text-text2 hover:bg-surface2 hover:text-text transition-colors">
                Website
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge className={sel.priority === 'High' ? 'bg-amber-bg text-amber' : 'bg-blue-bg text-blue'}>
            {sel.priority} Priority
          </Badge>
          {sel.pe && <Badge className="bg-purple-bg text-purple">PE-Backed</Badge>}
          <Badge className={STAGE_BADGE[sel.stage] || 'bg-surface2 text-text2'}>{sel.stage}</Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
        {/* Account Intel */}
        <Card title="Account Intel" action={
          sel.website ? <a href={`https://${sel.website}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue hover:underline font-medium">Visit Website</a> : undefined
        }>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {([
              ['Revenue', sel.rev],
              ['Employees', sel.emp],
              ['Ownership', sel.ownership],
              ['CXO Targets', sel.cxo],
              ['Website', sel.website],
              ['Source', sel.source || 'Manual'],
            ] as const).map(([label, value]) => (
              <div key={label} className="bg-surface2 rounded-lg p-3">
                <div className="text-[11px] text-text3 font-medium mb-1 uppercase tracking-wide">{label}</div>
                <div className="text-[13px] font-medium text-text">
                  {label === 'CXO Targets' ? <span className="text-blue font-semibold">{value}</span> : value}
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text3 mb-2">Pain Points for RCA</div>
          <div className="space-y-2">
            {sel.pains.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-bg rounded-lg border-l-[3px] border-l-blue">
                <span className="text-[11px] font-bold text-blue min-w-[20px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{i + 1}</span>
                <span className="text-[13px] text-text">{p}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Contacts */}
        <Card
          title="Key Contacts"
          action={
            <button
              onClick={enrichContacts}
              disabled={enriching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-purple-bg text-purple border border-purple-border rounded-lg hover:bg-purple hover:text-white disabled:opacity-40 cursor-pointer transition-colors"
            >
              {enriching && <span className="spinner" style={{ borderColor: 'var(--color-purple-border)', borderTopColor: 'var(--color-purple)', width: 12, height: 12 }} />}
              Enrich
            </button>
          }
        >
          {sel.contacts?.length ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-purple font-semibold px-2.5 py-1 bg-purple-bg rounded-lg">
                {sel.contactsSource === 'clay' ? 'Clay Verified' : sel.contactsSource === 'explorium' ? 'Explorium' : 'Unverified'} · {sel.contacts.length} contacts
              </div>
              {sel.contacts.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-surface2 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-bg text-blue flex items-center justify-center text-[13px] font-semibold shrink-0">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-text">{c.name}</div>
                    <div className="text-[12px] text-text2 mt-0.5 mb-2">{c.title}</div>
                    <div className="flex gap-2 flex-wrap">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${c.emailValid ? 'border-green-border text-green bg-green-bg hover:bg-green hover:text-white' : 'border-border text-text2 bg-white'}`}>
                          {c.email}
                        </a>
                      )}
                      {c.linkedin && (
                        <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-border text-text2 bg-white hover:text-blue hover:border-blue-border transition-colors">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                  <Badge className={c.emailValid ? 'bg-green-bg text-green' : 'bg-amber-bg text-amber'}>
                    {c.emailValid ? 'Valid' : 'Unverified'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text3 text-[13px] py-4 text-center">Click &quot;Enrich&quot; to pull verified contacts.</p>
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
    const eventName = attendingEvents.length === 1 ? attendingEvents[0].name : prompt('Which event?\n' + attendingEvents.map((e, i) => `${i + 1}. ${e.name}`).join('\n'), attendingEvents[0].name)
    if (!eventName) return
    const contactName = sel.contacts?.length ? prompt('Who did you meet?\n' + sel.contacts.map((c, i) => `${i + 1}. ${c.name} (${c.title})`).join('\n'), sel.contacts[0].name) : prompt('Who did you meet? (name)')
    if (!contactName) return
    const notes = prompt('What did you discuss? (key topics, follow-up items)')
    if (!notes) return
    const contact = (sel.contacts || []).find(c => c.name.includes(contactName) || contactName.includes(c.name)) || { name: contactName, email: '', title: '' }
    const meeting: Meeting = { id: 'm_' + Date.now(), event: eventName, contact: contact.name, contactEmail: contact.email || '', contactTitle: contact.title || '', notes, date: new Date().toLocaleDateString(), followUps: [{ day: 1, status: 'pending', subject: '', body: '', sentAt: null }, { day: 5, status: 'pending', subject: '', body: '', sentAt: null }, { day: 10, status: 'pending', subject: '', body: '', sentAt: null }] }
    const meetings = [...(sel.meetings || []), meeting]
    const stage = ['Prospect', 'Connected'].includes(sel.stage) ? 'Met' as Stage : sel.stage
    updateAccount(sel.id, { meetings, stage })
    setTimeout(save, 100)
    setGenerating(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const senderName = sig.split('|')[0].trim()
      const stories = localStorage.getItem('nteli_stories') || CASE_STUDY_KB.CRO
      const r = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: `Generate a 3-email follow-up sequence for a manufacturing executive I just met at an event.\n\nMEETING CONTEXT:\n- Met: ${meeting.contact} (${meeting.contactTitle}) at ${sel.company}\n- Event: ${meeting.event}\n- What we discussed: ${meeting.notes}\n- Company: ${sel.company} (${sel.vertical}, ${sel.city}, ${sel.rev})\n- Sender: ${senderName}\n\nCUSTOMER STORIES TO REFERENCE:\n${stories}\n\nGENERATE 3 EMAILS:\nEmail 1 (send next day): Brief follow-up. 3 sentences max.\nEmail 2 (send day 5): Check if case study resonated. 3 sentences max.\nEmail 3 (send day 10): Suggest 30-min meeting. 3 sentences max.\n\nRULES: Sound human, no buzzwords, use first names, each email: subject + body.\n\nReturn JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]\nONLY JSON array.` }] }) })
      const data = await r.json()
      const text = data.content?.[0]?.text || ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const emails = JSON.parse(jsonMatch[0])
        if (emails.length === 3) {
          const updatedMeetings = [...meetings]
          const idx = updatedMeetings.length - 1
          emails.forEach((email: { subject: string; body: string }, i: number) => { updatedMeetings[idx].followUps[i].subject = email.subject; updatedMeetings[idx].followUps[i].body = email.body; updatedMeetings[idx].followUps[i].status = 'ready' })
          updateAccount(sel.id, { meetings: updatedMeetings })
          setTimeout(save, 100)
        }
      }
    } catch { /* handled */ }
    setGenerating(false)
  }

  async function sendFollowUp(meetingIdx: number, followUpIdx: number) {
    if (!sel) return
    if (!gmailConnected) { alert('Connect Gmail first (Settings)'); return }
    const meetings = [...(sel.meetings || [])]
    const meeting = meetings[meetingIdx]
    const fu = meeting.followUps[followUpIdx]
    if (!meeting.contactEmail) { alert(`No email for ${meeting.contact}`); return }
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const r = await fetch('/api/gmail?action=send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: meeting.contactEmail, subject: fu.subject, body: fu.body, fromName: sig.split('|')[0].trim(), emailId: 'fu_' + Date.now() }) })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.error || 'Send failed')
      fu.status = 'sent'
      fu.sentAt = new Date().toLocaleDateString()
      updateAccount(sel.id, { meetings, stage: sel.stage === 'Met' ? 'Following Up' as Stage : sel.stage })
      setTimeout(save, 100)
    } catch (e) { alert('Send failed: ' + (e instanceof Error ? e.message : 'Unknown error')) }
  }

  const STATUS_ICON: Record<string, string> = { pending: '⏳', ready: '📧', sent: '✅', opened: '👁️', replied: '💬' }
  const STATUS_LABEL: Record<string, string> = { pending: 'Generating...', ready: 'Ready to send', sent: 'Sent', opened: 'Opened', replied: 'Replied' }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Meetings &amp; Follow-ups
          {gmailConnected ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-bg text-green font-semibold">Gmail Connected</span>
          ) : (
            <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-bg text-red font-semibold cursor-pointer hover:bg-red hover:text-white transition-colors">Connect Gmail</a>
          )}
        </span>
      }
      action={
        <button
          onClick={logMeeting}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-blue text-white rounded-lg hover:bg-blue2 cursor-pointer disabled:opacity-40 transition-colors shadow-sm"
        >
          {generating && <span className="spinner" style={{ width: 12, height: 12, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />}
          Met at Event
        </button>
      }
    >
      {!sel.meetings?.length ? (
        <p className="text-text3 text-[13px] py-6 text-center">
          No meetings yet. Meet someone at an event and click &quot;Met at Event&quot; to start the follow-up sequence.
        </p>
      ) : (
        <div className="space-y-4">
          {[...sel.meetings].reverse().map((m, ri) => {
            const mi = sel.meetings!.length - 1 - ri
            return (
              <div key={m.id} className="bg-surface2 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[14px] font-semibold text-text">{m.contact}</div>
                    <div className="text-[12px] text-text2 mt-0.5">{m.contactTitle} · {m.event} · {m.date}</div>
                  </div>
                  {m.contactEmail ? (
                    <Badge className="bg-green-bg text-green">{m.contactEmail}</Badge>
                  ) : (
                    <Badge className="bg-amber-bg text-amber">No email</Badge>
                  )}
                </div>
                <div className="text-[13px] text-text2 leading-relaxed mb-4 p-3 bg-white rounded-lg border border-border italic">
                  &quot;{m.notes}&quot;
                </div>
                <div className="text-[11px] font-semibold text-text3 uppercase tracking-wider mb-2">Follow-up Sequence</div>
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  {m.followUps.map((fu, fi) => (
                    <div key={fi} className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 text-[12px]">
                      <span className="text-[14px]">{STATUS_ICON[fu.status] || '⏳'}</span>
                      <span className="text-text3 min-w-[42px]" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>Day {fu.day}</span>
                      <span className="flex-1 truncate text-text">{fu.subject || 'Generating...'}</span>
                      <span className="text-[10px] text-text3 font-medium">{STATUS_LABEL[fu.status]}</span>
                      {fu.status === 'ready' && (
                        <button onClick={() => sendFollowUp(mi, fi)} className="px-3 py-1 text-[11px] font-semibold bg-blue text-white rounded-md cursor-pointer hover:bg-blue2 transition-colors">
                          Send
                        </button>
                      )}
                      {fu.status === 'sent' && fu.sentAt && (
                        <span className="text-[10px] text-green font-medium">{fu.sentAt}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function Card({ title, action, children }: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="text-[14px] font-semibold text-text">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${className}`}>
      {children}
    </span>
  )
}
