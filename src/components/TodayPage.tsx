'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Meeting, Stage, BdrEvent } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

export function TodayPage({ firstName }: { firstName: string }) {
  const { accounts, events, updateAccount, updateEvent, save, saveEvents, gmailConnected } = useStore()

  const pendingFollowUps: { account: Account; meeting: Meeting; meetingIdx: number; fuIdx: number; fu: Meeting['followUps'][0] }[] = []
  accounts.forEach(a => {
    (a.meetings || []).forEach((m, mi) => {
      m.followUps.forEach((fu, fi) => {
        if (fu.status === 'ready') pendingFollowUps.push({ account: a, meeting: m, meetingIdx: mi, fuIdx: fi, fu })
      })
    })
  })

  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.attending).map(e => {
      const dateMatch = e.dates.match(/(\w+)\s+(\d+).*?(\d{4})/)
      let daysUntil = 999
      if (dateMatch) {
        const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
        const d = new Date(parseInt(dateMatch[3]), months[dateMatch[1]] ?? 0, parseInt(dateMatch[2]))
        daysUntil = Math.ceil((d.getTime() - Date.now()) / 86400000)
      }
      const nearbyAccounts = accounts.filter(a => e.location.toLowerCase().includes(a.city.toLowerCase().split(' ')[0])).slice(0, 3)
      const contacts = nearbyAccounts.flatMap(a => (a.contacts || PRE_ENRICHED[a.company] || []).slice(0, 1).map(c => ({ ...c, company: a.company })))
      return { ...e, daysUntil, nearbyAccounts, contacts }
    }).sort((a, b) => a.daysUntil - b.daysUntil)
  }, [events, accounts])

  const accountsToPrep = useMemo(() => {
    return accounts.filter(a => {
      const hasContacts = (a.contacts?.length || PRE_ENRICHED[a.company]?.length) ?? 0
      return hasContacts > 0 && !a.meetings?.length && a.priority === 'High'
    }).slice(0, 5)
  }, [accounts])

  const suggestedEvents = events.filter(e => !e.attending && e.relevance === 'High').slice(0, 3)

  return (
    <div className="max-w-[860px] mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[28px] font-bold text-text tracking-tight">Hey {firstName} — here&apos;s your day.</h1>
        <p className="text-[15px] text-text2 mt-2 leading-relaxed">
          {pendingFollowUps.length > 0
            ? `${pendingFollowUps.length} follow-up${pendingFollowUps.length > 1 ? 's' : ''} ready to send.`
            : 'No pending follow-ups. Meet people at events to start sequences.'}
        </p>
      </div>

      {/* Gmail warning */}
      {!gmailConnected && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-bg border border-amber-border mb-8">
          <span className="text-xl">⚠️</span>
          <p className="text-[13px] text-amber"><strong>Gmail isn&apos;t connected.</strong> You won&apos;t be able to send follow-ups. <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Fix this →</a></p>
        </div>
      )}

      {/* ═══ FOLLOW-UPS ═══ */}
      {pendingFollowUps.length > 0 && (
        <Section label="EMAILS TO SEND" count={pendingFollowUps.length} color="blue">
          <div className="space-y-4">
            {pendingFollowUps.map((item, i) => <FollowUpCard key={i} item={item} />)}
          </div>
        </Section>
      )}

      {/* ═══ ACCOUNTS TO WORK ═══ */}
      {accountsToPrep.length > 0 && (
        <Section label="ACCOUNTS TO WORK" count={accountsToPrep.length} color="default">
          <p className="text-[13px] text-text3 mb-4">You have contacts here but haven&apos;t met anyone. After an event, click &quot;I met them&quot; to start the follow-up sequence.</p>
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {accountsToPrep.map((a, i) => <AccountRow key={a.id} account={a} events={events} last={i === accountsToPrep.length - 1} />)}
          </div>
        </Section>
      )}

      {/* ═══ UPCOMING EVENTS ═══ */}
      {upcomingEvents.length > 0 && (
        <Section label="YOUR EVENTS" count={upcomingEvents.length} color="default">
          <div className="space-y-3">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-text">{evt.name}</h3>
                    <p className="text-[13px] text-text3 mt-1">{evt.dates} · {evt.location}</p>
                  </div>
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full shrink-0 ml-4 ${
                    evt.daysUntil <= 7 ? 'bg-red-bg text-red' :
                    evt.daysUntil <= 30 ? 'bg-amber-bg text-amber' :
                    'bg-surface2 text-text3'
                  }`}>
                    {evt.daysUntil <= 0 ? 'Today!' : evt.daysUntil === 1 ? 'Tomorrow' : `in ${evt.daysUntil} days`}
                  </span>
                </div>
                {evt.contacts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-2">People to find</p>
                    {evt.contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-[11px] font-bold text-text3">{c.initials}</div>
                          <div>
                            <span className="text-[13px] font-medium text-text">{c.name}</span>
                            <span className="text-[12px] text-text3 ml-2">{c.title}</span>
                          </div>
                        </div>
                        <span className="text-[12px] text-text3">{c.company}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ SUGGESTED EVENTS ═══ */}
      {suggestedEvents.length > 0 && (
        <Section label="SHOULD YOU ATTEND?" color="default">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {suggestedEvents.map((evt, i) => (
              <div key={evt.id} className={`px-5 py-4 ${i < suggestedEvents.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-[14px] font-semibold text-text">{evt.name}</p>
                    <p className="text-[12px] text-text3 mt-1">{evt.dates} · {evt.location}</p>
                    <p className="text-[13px] text-text2 mt-2 leading-relaxed">{evt.why}</p>
                  </div>
                  <button
                    onClick={() => { updateEvent(evt.id, { attending: true }); setTimeout(saveEvents, 100) }}
                    className="shrink-0 px-4 py-2 text-[12px] font-semibold text-text border border-border rounded-lg hover:bg-surface2 cursor-pointer transition-colors"
                  >
                    I&apos;ll go
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="h-16" />
    </div>
  )
}

/* ═══ Section ═══ */
function Section({ label, count, color, children }: { label: string; count?: number; color: 'blue' | 'default'; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[12px] font-bold tracking-widest text-text3">{label}</h2>
        {count !== undefined && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            color === 'blue' ? 'bg-blue text-white' : 'bg-surface3 text-text2'
          }`}>{count}</span>
        )}
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  )
}

/* ═══ Follow-up Card ═══ */
function FollowUpCard({ item }: { item: { account: Account; meeting: Meeting; meetingIdx: number; fuIdx: number; fu: Meeting['followUps'][0] } }) {
  const { updateAccount, save, gmailConnected } = useStore()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function send() {
    if (!gmailConnected) { alert('Connect Gmail first'); return }
    if (!item.meeting.contactEmail) { alert(`No email for ${item.meeting.contact}`); return }
    setSending(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const r = await fetch('/api/gmail?action=send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: item.meeting.contactEmail, subject: item.fu.subject, body: item.fu.body, fromName: sig.split('|')[0].trim(), emailId: 'fu_' + Date.now() }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.error || 'Failed')
      item.fu.status = 'sent'; item.fu.sentAt = new Date().toLocaleDateString()
      updateAccount(item.account.id, { meetings: [...(item.account.meetings || [])] })
      setTimeout(save, 100); setSent(true)
    } catch (e) { alert('Send failed: ' + (e instanceof Error ? e.message : '')) }
    setSending(false)
  }

  if (sent) return (
    <div className="flex items-center gap-3 px-5 py-4 bg-green-bg border border-green-border rounded-xl text-[13px] text-green font-medium">
      <span>✓</span> Sent to {item.meeting.contact} at {item.account.company}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        {/* Who + context */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[16px] font-semibold text-text">
              {item.meeting.contact}
              <span className="text-text3 font-normal text-[14px] ml-2">at {item.account.company}</span>
            </p>
            <p className="text-[12px] text-text3 mt-1">Day {item.fu.day} follow-up · Met at {item.meeting.event}</p>
          </div>
          {item.meeting.contactEmail && (
            <span className="text-[11px] font-medium text-green bg-green-bg px-3 py-1 rounded-full shrink-0">{item.meeting.contactEmail}</span>
          )}
        </div>

        {/* Email preview — looks like an actual email */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-surface2 px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text3 w-14">To</span>
              <span className="text-[12px] text-text">{item.meeting.contactEmail || '—'}</span>
            </div>
          </div>
          <div className="bg-surface2 px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text3 w-14">Subject</span>
              <span className="text-[12px] font-medium text-text">{item.fu.subject}</span>
            </div>
          </div>
          <div className="bg-white px-4 py-4 text-[13px] text-text leading-relaxed whitespace-pre-wrap">{item.fu.body}</div>
        </div>

        {/* Notes context */}
        <p className="text-[11px] text-text3 mt-3 italic">Your meeting notes: &quot;{item.meeting.notes}&quot;</p>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-border">
        <button onClick={send} disabled={sending || !item.meeting.contactEmail}
          className="flex-1 py-3.5 text-[13px] font-semibold text-blue hover:bg-blue-bg disabled:opacity-30 cursor-pointer transition-colors text-center border-r border-border">
          {sending ? 'Sending...' : '✓ Send it'}
        </button>
        <button className="flex-1 py-3.5 text-[13px] font-medium text-text2 hover:bg-surface2 cursor-pointer transition-colors text-center border-r border-border">
          Edit
        </button>
        <button className="flex-1 py-3.5 text-[13px] font-medium text-text3 hover:bg-surface2 cursor-pointer transition-colors text-center">
          Skip
        </button>
      </div>
    </div>
  )
}

/* ═══ Account Row ═══ */
function AccountRow({ account, events, last }: { account: Account; events: BdrEvent[]; last: boolean }) {
  const { updateAccount, save } = useStore()
  const [logging, setLogging] = useState(false)
  const contacts = account.contacts || PRE_ENRICHED[account.company] || []
  const topContact = contacts[0]

  async function handleLog() {
    const attending = events.filter(e => e.attending)
    if (!attending.length) { alert('Mark an event as attending first'); return }
    const eventName = attending.length === 1 ? attending[0].name : prompt('Which event?\n' + attending.map((e, i) => `${i+1}. ${e.name}`).join('\n'))
    if (!eventName) return
    const who = contacts.length ? prompt('Who?\n' + contacts.map((c, i) => `${i+1}. ${c.name} (${c.title})`).join('\n')) : prompt('Who did you meet?')
    if (!who) return
    const notes = prompt('What did you discuss?')
    if (!notes) return
    const c = contacts.find(x => x.name.includes(who) || who.includes(x.name)) || { name: who, email: '', title: '' }
    const meeting: Meeting = { id: 'm_'+Date.now(), event: eventName, contact: c.name, contactEmail: c.email||'', contactTitle: c.title||'', notes, date: new Date().toLocaleDateString(),
      followUps: [{day:1,status:'pending',subject:'',body:'',sentAt:null},{day:5,status:'pending',subject:'',body:'',sentAt:null},{day:10,status:'pending',subject:'',body:'',sentAt:null}] }
    updateAccount(account.id, { meetings: [...(account.meetings||[]), meeting], stage: 'Met' as Stage })
    setTimeout(save, 100)
    setLogging(true)
    try {
      const sig = localStorage.getItem('nteli_sig')||'Kathir'
      const stories = localStorage.getItem('nteli_stories')||CASE_STUDY_KB.CRO
      const r = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1024, messages:[{role:'user',
          content:`Generate 3 follow-up emails for ${c.name} (${c.title}) at ${account.company}. Met at ${eventName}. Discussed: ${notes}. Company: ${account.vertical}, ${account.rev}. Sender: ${sig.split('|')[0].trim()}.\n\nStories: ${stories}\n\nEmail 1 (day 1): 3 sentences. Email 2 (day 5): 3 sentences. Email 3 (day 10): 3 sentences. Sound human, first names.\n\nReturn ONLY JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]`}]}),
      })
      const data = await r.json(); const text = data.content?.[0]?.text||''; const match = text.match(/\[[\s\S]*\]/)
      if (match) { const emails = JSON.parse(match[0])
        if (emails.length===3) { emails.forEach((e:{subject:string;body:string},i:number) => { meeting.followUps[i].subject=e.subject; meeting.followUps[i].body=e.body; meeting.followUps[i].status='ready' })
          updateAccount(account.id, { meetings: [...(account.meetings||[]).slice(0,-1), meeting] }); setTimeout(save,100) } }
    } catch {}
    setLogging(false)
  }

  return (
    <div className={`flex items-center justify-between px-5 py-4 ${!last ? 'border-b border-border' : ''}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center text-[12px] font-bold text-text3 shrink-0">
          {account.company.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text truncate">{account.company}</p>
          <p className="text-[12px] text-text3 mt-0.5 truncate">
            {topContact ? `${topContact.name}, ${topContact.title}` : `${contacts.length} contacts`}
            <span className="mx-1.5 text-border2">·</span>{account.city}
          </p>
        </div>
      </div>
      <button onClick={handleLog} disabled={logging}
        className="ml-4 shrink-0 px-4 py-2 text-[12px] font-semibold text-text border border-border rounded-lg hover:bg-surface2 disabled:opacity-40 cursor-pointer transition-colors">
        {logging ? 'Writing emails...' : 'I met them'}
      </button>
    </div>
  )
}
