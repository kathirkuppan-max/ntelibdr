'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Meeting, Stage, BdrEvent } from '@/lib/types'
import { CASE_STUDY_KB } from '@/lib/case-studies'
import { PRE_ENRICHED } from '@/lib/contacts'

export function TodayPage({ firstName }: { firstName: string }) {
  const { accounts, events, updateAccount, updateEvent, save, saveEvents, gmailConnected } = useStore()

  const upcomingEvents = events.filter(e => e.attending)
  const notAttendingEvents = events.filter(e => !e.attending).slice(0, 5)

  const pendingFollowUps: { account: Account; meeting: Meeting; meetingIdx: number; fuIdx: number; fu: Meeting['followUps'][0] }[] = []
  accounts.forEach(a => {
    (a.meetings || []).forEach((m, mi) => {
      m.followUps.forEach((fu, fi) => {
        if (fu.status === 'ready') pendingFollowUps.push({ account: a, meeting: m, meetingIdx: mi, fuIdx: fi, fu })
      })
    })
  })

  const accountsToMeet = accounts.filter(a => {
    const hasContacts = a.contacts?.length || PRE_ENRICHED[a.company]?.length
    return hasContacts && !a.meetings?.length && a.priority === 'High'
  }).slice(0, 5)

  return (
    <div className="max-w-[720px] mx-auto px-8 py-10">
      {/* Greeting */}
      <h1 className="text-[26px] font-bold text-text mb-1">Good morning, {firstName}</h1>
      <p className="text-[14px] text-text2 mb-8">
        {pendingFollowUps.length > 0
          ? `You have ${pendingFollowUps.length} follow-up${pendingFollowUps.length > 1 ? 's' : ''} to send today.`
          : 'No pending follow-ups. Time to meet people at events.'}
      </p>

      {/* Follow-ups Due */}
      {pendingFollowUps.length > 0 && (
        <Section title={`Follow-ups to Send (${pendingFollowUps.length})`}>
          {pendingFollowUps.map((item, i) => (
            <FollowUpCard key={i} item={item} />
          ))}
        </Section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Section title={`Events You're Attending (${upcomingEvents.length})`}>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {upcomingEvents.map((evt, i) => (
              <EventRow key={evt.id} event={evt} accounts={accounts} last={i === upcomingEvents.length - 1} />
            ))}
          </div>
        </Section>
      )}

      {/* People to Meet */}
      {accountsToMeet.length > 0 && (
        <Section title="High-Priority Accounts to Meet">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {accountsToMeet.map((a, i) => (
              <AccountToMeetRow key={a.id} account={a} events={events} last={i === accountsToMeet.length - 1} onLogMeeting={(meeting) => {
                updateAccount(a.id, { meetings: [...(a.meetings || []), meeting], stage: 'Met' as Stage })
                setTimeout(save, 100)
              }} />
            ))}
          </div>
        </Section>
      )}

      {/* Events to Consider */}
      {notAttendingEvents.length > 0 && (
        <Section title="Events to Consider">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {notAttendingEvents.map((evt, i) => (
              <div key={evt.id} className={`flex items-center justify-between px-5 py-3.5 ${i < notAttendingEvents.length - 1 ? 'border-b border-border' : ''}`}>
                <div>
                  <div className="text-[14px] font-medium text-text">{evt.name}</div>
                  <div className="text-[12px] text-text3 mt-0.5">{evt.dates} · {evt.location}</div>
                </div>
                <button
                  onClick={() => { updateEvent(evt.id, { attending: true }); setTimeout(saveEvents, 100) }}
                  className="text-[12px] font-medium text-blue hover:underline cursor-pointer shrink-0 ml-4"
                >
                  Mark Attending
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gmail status */}
      {!gmailConnected && (
        <div className="mt-8 p-5 bg-amber-bg border border-amber-border rounded-xl text-[13px] text-amber">
          <strong>Gmail not connected.</strong> You need Gmail to send follow-up emails.{' '}
          <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Connect Gmail</a>
        </div>
      )}
    </div>
  )
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
      item.fu.status = 'sent'
      item.fu.sentAt = new Date().toLocaleDateString()
      const meetings = [...(item.account.meetings || [])]
      updateAccount(item.account.id, { meetings })
      setTimeout(save, 100)
      setSent(true)
    } catch (e) { alert('Send failed: ' + (e instanceof Error ? e.message : '')) }
    setSending(false)
  }

  if (sent) {
    return (
      <div className="px-5 py-4 bg-green-bg border border-green-border rounded-xl mb-3 text-[13px] text-green font-medium">
        Sent to {item.meeting.contact} at {item.account.company}
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-xl mb-3 overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-[15px] font-semibold text-text">{item.meeting.contact}</div>
            <div className="text-[13px] text-text2">{item.account.company} · Day {item.fu.day} follow-up</div>
          </div>
          {item.meeting.contactEmail ? (
            <span className="text-[11px] text-green font-medium bg-green-bg px-2.5 py-1 rounded-full shrink-0 ml-4">{item.meeting.contactEmail}</span>
          ) : (
            <span className="text-[11px] text-amber font-medium bg-amber-bg px-2.5 py-1 rounded-full shrink-0 ml-4">No email</span>
          )}
        </div>
        <div className="text-[11px] text-text3 mb-3">Met at {item.meeting.event} · {item.meeting.date}</div>

        {/* Email preview */}
        <div className="bg-surface2 rounded-lg p-4 mb-3">
          <div className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-1">Subject</div>
          <div className="text-[14px] font-medium text-text mb-3">{item.fu.subject}</div>
          <div className="text-[13px] text-text2 leading-relaxed whitespace-pre-wrap">{item.fu.body}</div>
        </div>

        <div className="text-[12px] text-text3 italic mb-4">
          Meeting notes: &quot;{item.meeting.notes}&quot;
        </div>
      </div>

      <div className="flex gap-0 border-t border-border">
        <button
          onClick={send}
          disabled={sending || !item.meeting.contactEmail}
          className="flex-1 py-3 text-[13px] font-semibold text-blue hover:bg-blue-bg cursor-pointer disabled:opacity-40 transition-colors border-r border-border"
        >
          {sending ? 'Sending...' : 'Approve & Send'}
        </button>
        <button className="flex-1 py-3 text-[13px] font-medium text-text2 hover:bg-surface2 cursor-pointer transition-colors border-r border-border">
          Edit
        </button>
        <button className="flex-1 py-3 text-[13px] font-medium text-text3 hover:bg-surface2 cursor-pointer transition-colors">
          Skip
        </button>
      </div>
    </div>
  )
}

/* ── Event Row ── */
function EventRow({ event, accounts, last }: { event: BdrEvent; accounts: Account[]; last: boolean }) {
  const cityKey = event.location.toLowerCase()
  const nearby = accounts.filter(a => cityKey.includes(a.city.toLowerCase().split(' ')[0])).slice(0, 4)

  return (
    <div className={`px-5 py-4 ${!last ? 'border-b border-border' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-medium text-text">{event.name}</div>
          <div className="text-[12px] text-text2 mt-0.5">{event.dates} · {event.location}</div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ml-4 ${event.relevance === 'High' ? 'bg-amber-bg text-amber' : 'bg-surface2 text-text3'}`}>
          {event.relevance}
        </span>
      </div>
      {nearby.length > 0 && (
        <div className="text-[12px] text-blue mt-1.5">
          Accounts nearby: {nearby.map(a => a.company).join(', ')}
        </div>
      )}
    </div>
  )
}

/* ── Account to Meet Row ── */
function AccountToMeetRow({ account, events, last, onLogMeeting }: { account: Account; events: BdrEvent[]; last: boolean; onLogMeeting: (m: Meeting) => void }) {
  const { updateAccount, save } = useStore()
  const [logging, setLogging] = useState(false)
  const contacts = account.contacts || PRE_ENRICHED[account.company] || []

  async function handleLogMeeting() {
    const attendingEvents = events.filter(e => e.attending)
    if (!attendingEvents.length) { alert('Mark an event as attending first'); return }
    const eventName = attendingEvents.length === 1 ? attendingEvents[0].name : prompt('Which event?\n' + attendingEvents.map((e, i) => `${i + 1}. ${e.name}`).join('\n'))
    if (!eventName) return
    const contactName = contacts.length ? prompt('Who did you meet?\n' + contacts.map((c, i) => `${i + 1}. ${c.name} (${c.title})`).join('\n')) : prompt('Who did you meet?')
    if (!contactName) return
    const notes = prompt('What did you discuss?')
    if (!notes) return
    const contact = contacts.find(c => c.name.includes(contactName) || contactName.includes(c.name)) || { name: contactName, email: '', title: '' }
    const meeting: Meeting = {
      id: 'm_' + Date.now(), event: eventName, contact: contact.name, contactEmail: contact.email || '', contactTitle: contact.title || '', notes, date: new Date().toLocaleDateString(),
      followUps: [{ day: 1, status: 'pending', subject: '', body: '', sentAt: null }, { day: 5, status: 'pending', subject: '', body: '', sentAt: null }, { day: 10, status: 'pending', subject: '', body: '', sentAt: null }],
    }
    onLogMeeting(meeting)
    setLogging(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const stories = localStorage.getItem('nteli_stories') || CASE_STUDY_KB.CRO
      const r = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: `Generate 3 follow-up emails for ${meeting.contact} (${meeting.contactTitle}) at ${account.company}. Met at ${meeting.event}. Discussed: ${meeting.notes}. Company: ${account.vertical}, ${account.rev}. Sender: ${sig.split('|')[0].trim()}.\n\nStories: ${stories}\n\nEmail 1 (day 1): brief follow-up, 3 sentences. Email 2 (day 5): case study resonance, 3 sentences. Email 3 (day 10): suggest 30-min meeting, 3 sentences. Sound human, no buzzwords, first names.\n\nReturn ONLY JSON: [{"subject":"","body":""},{"subject":"","body":""},{"subject":"","body":""}]` }] }),
      })
      const data = await r.json()
      const text = data.content?.[0]?.text || ''
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        const emails = JSON.parse(match[0])
        if (emails.length === 3) {
          emails.forEach((email: { subject: string; body: string }, i: number) => {
            meeting.followUps[i].subject = email.subject; meeting.followUps[i].body = email.body; meeting.followUps[i].status = 'ready'
          })
          const meetings = [...(account.meetings || [])]
          meetings[meetings.length - 1] = meeting
          updateAccount(account.id, { meetings })
          setTimeout(save, 100)
        }
      }
    } catch { /* handled */ }
    setLogging(false)
  }

  return (
    <div className={`flex items-center justify-between px-5 py-3.5 ${!last ? 'border-b border-border' : ''}`}>
      <div>
        <div className="text-[14px] font-medium text-text">{account.company}</div>
        <div className="text-[12px] text-text3 mt-0.5">{account.city} · {account.vertical} · {contacts.length} contacts</div>
      </div>
      <button
        onClick={handleLogMeeting}
        disabled={logging}
        className="text-[12px] font-semibold text-white bg-blue px-4 py-2 rounded-lg hover:bg-blue2 cursor-pointer disabled:opacity-40 transition-colors shrink-0 ml-4"
      >
        {logging ? 'Generating...' : 'Met at Event'}
      </button>
    </div>
  )
}

/* ── Section wrapper ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-[14px] font-semibold text-text2 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  )
}
