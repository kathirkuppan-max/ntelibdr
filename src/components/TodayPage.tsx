'use client'

import { useState } from 'react'
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

  const upcomingEvents = events.filter(e => e.attending)
  const notAttendingEvents = events.filter(e => !e.attending).slice(0, 5)
  const accountsToMeet = accounts.filter(a => {
    const hasContacts = a.contacts?.length || PRE_ENRICHED[a.company]?.length
    return hasContacts && !a.meetings?.length && a.priority === 'High'
  }).slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-text">Good morning, {firstName}</h1>
        <p className="text-sm text-text2 mt-1">
          {pendingFollowUps.length > 0
            ? `${pendingFollowUps.length} follow-up${pendingFollowUps.length > 1 ? 's' : ''} ready to send.`
            : 'No pending follow-ups. Meet people at events to start sequences.'}
        </p>
      </div>

      {/* Gmail warning */}
      {!gmailConnected && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-bg border border-amber-border text-sm text-amber">
          <span className="text-lg">⚠️</span>
          <span>Gmail not connected. <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Connect Gmail</a> to send follow-ups.</span>
        </div>
      )}

      {/* Follow-ups to send */}
      {pendingFollowUps.length > 0 && (
        <Card>
          <CardHeader title={`📧 Follow-ups to Send`} count={pendingFollowUps.length} />
          <div className="divide-y divide-border">
            {pendingFollowUps.map((item, i) => <FollowUpRow key={i} item={item} />)}
          </div>
        </Card>
      )}

      {/* Accounts to meet */}
      {accountsToMeet.length > 0 && (
        <Card>
          <CardHeader title="🎯 Accounts to Meet" count={accountsToMeet.length} />
          <div className="divide-y divide-border">
            {accountsToMeet.map(a => (
              <AccountRow key={a.id} account={a} events={events} onLogMeeting={(meeting) => {
                updateAccount(a.id, { meetings: [...(a.meetings || []), meeting], stage: 'Met' as Stage })
                setTimeout(save, 100)
              }} />
            ))}
          </div>
        </Card>
      )}

      {/* Attending events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader title="📅 Events You're Attending" count={upcomingEvents.length} />
          <div className="divide-y divide-border">
            {upcomingEvents.map(evt => <EventAttendingRow key={evt.id} event={evt} accounts={accounts} />)}
          </div>
        </Card>
      )}

      {/* Events to consider */}
      {notAttendingEvents.length > 0 && (
        <Card>
          <CardHeader title="🗓️ Events to Consider" />
          <div className="divide-y divide-border">
            {notAttendingEvents.map(evt => (
              <div key={evt.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-text">{evt.name}</p>
                  <p className="text-xs text-text3 mt-0.5">{evt.dates} · {evt.location}</p>
                </div>
                <button
                  onClick={() => { updateEvent(evt.id, { attending: true }); setTimeout(saveEvents, 100) }}
                  className="text-xs font-medium text-blue hover:underline cursor-pointer shrink-0 ml-4"
                >
                  + Attend
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ═══ Reusable Card ═══ */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">{children}</div>
}

function CardHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface2">
      <h2 className="text-[13px] font-semibold text-text">{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] font-bold text-blue bg-blue-bg px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

/* ═══ Follow-up Row ═══ */
function FollowUpRow({ item }: { item: { account: Account; meeting: Meeting; meetingIdx: number; fuIdx: number; fu: Meeting['followUps'][0] } }) {
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
    <div className="px-5 py-3 text-sm text-green font-medium bg-green-bg">
      ✓ Sent to {item.meeting.contact} at {item.account.company}
    </div>
  )

  return (
    <div className="px-5 py-4">
      {/* Who */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text">{item.meeting.contact} <span className="font-normal text-text2">at {item.account.company}</span></p>
          <p className="text-xs text-text3 mt-0.5">Day {item.fu.day} · Met at {item.meeting.event} · {item.meeting.date}</p>
        </div>
        {item.meeting.contactEmail && (
          <span className="text-[11px] text-green bg-green-bg px-2 py-0.5 rounded-full font-medium shrink-0">{item.meeting.contactEmail}</span>
        )}
      </div>

      {/* Email */}
      <div className="mt-3 rounded-lg border border-border bg-surface2 p-4">
        <p className="text-xs text-text3 font-medium mb-1">SUBJECT</p>
        <p className="text-sm font-medium text-text">{item.fu.subject}</p>
        <p className="text-sm text-text2 mt-2 leading-relaxed whitespace-pre-wrap">{item.fu.body}</p>
      </div>

      {/* Notes */}
      <p className="text-xs text-text3 italic mt-2">Notes: &quot;{item.meeting.notes}&quot;</p>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button onClick={send} disabled={sending || !item.meeting.contactEmail}
          className="px-4 py-1.5 text-xs font-semibold bg-blue text-white rounded-lg hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors">
          {sending ? 'Sending...' : '✓ Approve & Send'}
        </button>
        <button className="px-4 py-1.5 text-xs font-medium border border-border rounded-lg text-text2 hover:bg-surface2 cursor-pointer">Edit</button>
        <button className="px-4 py-1.5 text-xs font-medium border border-border rounded-lg text-text3 hover:bg-surface2 cursor-pointer">Skip</button>
      </div>
    </div>
  )
}

/* ═══ Account Row ═══ */
function AccountRow({ account, events, onLogMeeting }: { account: Account; events: BdrEvent[]; onLogMeeting: (m: Meeting) => void }) {
  const { updateAccount, save } = useStore()
  const [logging, setLogging] = useState(false)
  const contacts = account.contacts || PRE_ENRICHED[account.company] || []

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
    onLogMeeting(meeting)
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
    <div className="flex items-center justify-between px-5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text truncate">{account.company}</p>
        <p className="text-xs text-text3 mt-0.5">{account.city} · {account.vertical} · {contacts.length} contacts</p>
      </div>
      <button onClick={handleLog} disabled={logging}
        className="ml-4 shrink-0 px-3 py-1.5 text-xs font-semibold bg-blue text-white rounded-lg hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors">
        {logging ? 'Generating...' : 'Log Meeting'}
      </button>
    </div>
  )
}

/* ═══ Event Attending Row ═══ */
function EventAttendingRow({ event, accounts }: { event: BdrEvent; accounts: Account[] }) {
  const nearby = accounts.filter(a => event.location.toLowerCase().includes(a.city.toLowerCase().split(' ')[0])).slice(0,4)
  return (
    <div className="px-5 py-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text">{event.name}</p>
          <p className="text-xs text-text3 mt-0.5">{event.dates} · {event.location}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3 ${event.relevance==='High'?'bg-amber-bg text-amber':'bg-surface2 text-text3'}`}>{event.relevance}</span>
      </div>
      {nearby.length > 0 && <p className="text-xs text-blue mt-1">Nearby accounts: {nearby.map(a=>a.company).join(', ')}</p>}
    </div>
  )
}
