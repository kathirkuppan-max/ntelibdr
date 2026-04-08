'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Meeting, Stage, BdrEvent } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

export function TodayPage({ firstName }: { firstName: string }) {
  const { accounts, events, updateAccount, updateEvent, save, saveEvents, gmailConnected } = useStore()

  // ── Compute action items ──
  const pendingFollowUps: { account: Account; meeting: Meeting; meetingIdx: number; fuIdx: number; fu: Meeting['followUps'][0] }[] = []
  accounts.forEach(a => {
    (a.meetings || []).forEach((m, mi) => {
      m.followUps.forEach((fu, fi) => {
        if (fu.status === 'ready') pendingFollowUps.push({ account: a, meeting: m, meetingIdx: mi, fuIdx: fi, fu })
      })
    })
  })

  // Events coming up (attending) with days until
  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.attending).map(e => {
      const dateMatch = e.dates.match(/(\w+)\s+(\d+).*?(\d{4})/)
      let daysUntil = 999
      if (dateMatch) {
        const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
        const d = new Date(parseInt(dateMatch[3]), months[dateMatch[1]] ?? 0, parseInt(dateMatch[2]))
        daysUntil = Math.ceil((d.getTime() - Date.now()) / 86400000)
      }
      // Find target accounts near this event
      const nearbyAccounts = accounts.filter(a => {
        const city = e.location.toLowerCase()
        return city.includes(a.city.toLowerCase().split(' ')[0])
      }).slice(0, 3)
      // Find contacts at those accounts
      const contacts = nearbyAccounts.flatMap(a => (a.contacts || PRE_ENRICHED[a.company] || []).slice(0, 1).map(c => ({ ...c, company: a.company })))
      return { ...e, daysUntil, nearbyAccounts, contacts }
    }).sort((a, b) => a.daysUntil - b.daysUntil)
  }, [events, accounts])

  // Accounts with contacts but no meeting yet
  const accountsToPrep = useMemo(() => {
    return accounts.filter(a => {
      const hasContacts = (a.contacts?.length || PRE_ENRICHED[a.company]?.length) ?? 0
      return hasContacts > 0 && !a.meetings?.length && a.priority === 'High'
    }).slice(0, 5)
  }, [accounts])

  // Not-yet-attending events
  const suggestedEvents = events.filter(e => !e.attending && e.relevance === 'High').slice(0, 3)

  // ── Count total actions ──
  const actionCount = pendingFollowUps.length + (upcomingEvents.length > 0 ? 1 : 0) + (accountsToPrep.length > 0 ? 1 : 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-text">Hey {firstName} — here&apos;s your day.</h1>
      <p className="text-sm text-text2 mt-2 leading-relaxed">
        {actionCount === 0
          ? 'Nothing urgent. Browse events below and start building your pipeline.'
          : `You have ${actionCount} thing${actionCount > 1 ? 's' : ''} to act on.`}
      </p>

      {/* ── Gmail warning ── */}
      {!gmailConnected && (
        <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-amber-bg border border-amber-border">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber"><strong>Gmail isn&apos;t connected.</strong> You won&apos;t be able to send follow-ups. <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Fix this →</a></p>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* SECTION 1: FOLLOW-UPS TO SEND           */}
      {/* ════════════════════════════════════════ */}
      {pendingFollowUps.length > 0 && (
        <div className="mt-8">
          <SectionBadge color="blue" label={`${pendingFollowUps.length} email${pendingFollowUps.length > 1 ? 's' : ''} ready to send`} />
          <p className="text-sm text-text2 mt-1 mb-4">Review and approve each follow-up. They&apos;ll send from your Gmail.</p>
          <div className="space-y-4">
            {pendingFollowUps.map((item, i) => <FollowUpCard key={i} item={item} />)}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* SECTION 2: UPCOMING EVENTS — PREP       */}
      {/* ════════════════════════════════════════ */}
      {upcomingEvents.length > 0 && (
        <div className="mt-10">
          <SectionBadge color="amber" label="Events coming up" />
          <p className="text-sm text-text2 mt-1 mb-4">Prep for these. Know who&apos;ll be there and what to talk about.</p>
          <div className="space-y-3">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-text">{evt.name}</h3>
                    <p className="text-xs text-text2 mt-0.5">{evt.dates} · {evt.location}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    evt.daysUntil <= 7 ? 'bg-red-bg text-red' :
                    evt.daysUntil <= 30 ? 'bg-amber-bg text-amber' :
                    'bg-surface2 text-text3'
                  }`}>
                    {evt.daysUntil <= 0 ? 'Today!' : evt.daysUntil === 1 ? 'Tomorrow' : `${evt.daysUntil} days`}
                  </span>
                </div>

                {/* Who to find */}
                {evt.contacts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-2">People to find at this event</p>
                    {evt.contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div>
                          <span className="text-sm font-medium text-text">{c.name}</span>
                          <span className="text-xs text-text3 ml-2">{c.title} · {c.company}</span>
                        </div>
                        {c.linkedin && (
                          <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue hover:underline">LinkedIn</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Nearby accounts */}
                {evt.nearbyAccounts.length > 0 && evt.contacts.length === 0 && (
                  <p className="text-xs text-blue mt-2">Target accounts nearby: {evt.nearbyAccounts.map(a => a.company).join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* SECTION 3: ACCOUNTS TO PREP             */}
      {/* ════════════════════════════════════════ */}
      {accountsToPrep.length > 0 && (
        <div className="mt-10">
          <SectionBadge color="green" label="Accounts to work" />
          <p className="text-sm text-text2 mt-1 mb-4">You have contacts at these companies but haven&apos;t met anyone yet. Log a meeting after you connect.</p>
          <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-border">
            {accountsToPrep.map(a => <AccountRow key={a.id} account={a} events={events} />)}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* SECTION 4: EVENTS TO CONSIDER           */}
      {/* ════════════════════════════════════════ */}
      {suggestedEvents.length > 0 && (
        <div className="mt-10">
          <SectionBadge color="purple" label="Should you attend?" />
          <p className="text-sm text-text2 mt-1 mb-4">High-relevance events you haven&apos;t signed up for yet.</p>
          <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-border">
            {suggestedEvents.map(evt => (
              <div key={evt.id} className="px-5 py-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{evt.name}</p>
                  <p className="text-xs text-text3 mt-0.5">{evt.dates} · {evt.location}</p>
                  <p className="text-xs text-text2 mt-1">{evt.why}</p>
                </div>
                <button
                  onClick={() => { updateEvent(evt.id, { attending: true }); setTimeout(saveEvents, 100) }}
                  className="ml-4 shrink-0 px-3 py-1.5 text-xs font-semibold text-blue border border-blue-border rounded-lg hover:bg-blue hover:text-white cursor-pointer transition-colors"
                >
                  I&apos;ll go
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-12" /> {/* bottom spacer */}
    </div>
  )
}

/* ── Section Badge ── */
function SectionBadge({ color, label }: { color: 'blue' | 'amber' | 'green' | 'purple'; label: string }) {
  const styles = {
    blue: 'bg-blue text-white',
    amber: 'bg-amber text-white',
    green: 'bg-green text-white',
    purple: 'bg-purple text-white',
  }
  return <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${styles[color]}`}>{label}</span>
}

/* ── Follow-up Card ── */
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
    <div className="flex items-center gap-3 p-4 bg-green-bg border border-green-border rounded-xl text-sm text-green font-medium">
      <span className="text-lg">✓</span> Sent to {item.meeting.contact} at {item.account.company}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[15px] font-semibold text-text">
              Email {item.meeting.contact}
              <span className="text-text2 font-normal"> at {item.account.company}</span>
            </p>
            <p className="text-xs text-text3 mt-1">Day {item.fu.day} follow-up · Met at {item.meeting.event}</p>
          </div>
          {item.meeting.contactEmail ? (
            <span className="text-[11px] font-medium text-green bg-green-bg px-2.5 py-1 rounded-full shrink-0 ml-3">{item.meeting.contactEmail}</span>
          ) : (
            <span className="text-[11px] font-medium text-red bg-red-bg px-2.5 py-1 rounded-full shrink-0 ml-3">No email on file</span>
          )}
        </div>
      </div>

      {/* Email preview */}
      <div className="mx-5 mb-3 rounded-lg bg-surface2 border border-border">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[11px] text-text3">To: </span>
          <span className="text-[11px] font-medium text-text">{item.meeting.contactEmail || '—'}</span>
        </div>
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[11px] text-text3">Subject: </span>
          <span className="text-[11px] font-medium text-text">{item.fu.subject}</span>
        </div>
        <div className="px-4 py-3 text-[13px] text-text2 leading-relaxed whitespace-pre-wrap">{item.fu.body}</div>
      </div>

      {/* Context */}
      <div className="px-5 pb-3">
        <p className="text-[11px] text-text3">
          <span className="font-semibold">Your notes:</span> &quot;{item.meeting.notes}&quot;
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border divide-x divide-border">
        <button onClick={send} disabled={sending || !item.meeting.contactEmail}
          className="flex-1 py-3 text-[13px] font-semibold text-blue hover:bg-blue-bg disabled:opacity-30 cursor-pointer transition-colors text-center">
          {sending ? 'Sending...' : '✓ Send it'}
        </button>
        <button className="flex-1 py-3 text-[13px] font-medium text-text2 hover:bg-surface2 cursor-pointer transition-colors text-center">
          Edit first
        </button>
        <button className="flex-1 py-3 text-[13px] font-medium text-text3 hover:bg-surface2 cursor-pointer transition-colors text-center">
          Skip
        </button>
      </div>
    </div>
  )
}

/* ── Account Row ── */
function AccountRow({ account, events }: { account: Account; events: BdrEvent[] }) {
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
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text">{account.company}</p>
        <p className="text-xs text-text3 mt-0.5">
          {topContact ? `${topContact.name}, ${topContact.title}` : `${contacts.length} contacts`}
          <span className="mx-1.5">·</span>{account.city}
        </p>
      </div>
      <button onClick={handleLog} disabled={logging}
        className="ml-4 shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-blue rounded-lg hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors">
        {logging ? 'Writing emails...' : 'I met them'}
      </button>
    </div>
  )
}
