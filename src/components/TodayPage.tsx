'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account, BdrEvent } from '@/lib/types'
import { PRE_ENRICHED } from '@/lib/contacts'
import { MeetingLoggerModal } from './MeetingLoggerModal'
import { EmailEditorModal } from './EmailEditorModal'
import { EventDetailDrawer } from './EventDetailDrawer'
import { AccountDetailDrawer } from './AccountDetailDrawer'

export function TodayPage({ firstName }: { firstName: string }) {
  const { accounts, events, updateEvent, saveEvents, gmailConnected, updateAccount, save } = useStore()

  // Modal/drawer state
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; accountId?: number; eventId?: string; contactName?: string }>({ open: false })
  const [emailModal, setEmailModal] = useState<{ open: boolean; accountId?: number; meetingIdx?: number; fuIdx?: number }>({ open: false })
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null)

  // Computed data
  const pendingFollowUps: { account: Account; meetingIdx: number; fuIdx: number }[] = []
  accounts.forEach(a => {
    (a.meetings || []).forEach((m, mi) => {
      m.followUps.forEach((_, fi) => {
        if (m.followUps[fi].status === 'ready') pendingFollowUps.push({ account: a, meetingIdx: mi, fuIdx: fi })
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
      const tagCount = (e.eventTags || []).length
      return { ...e, daysUntil, tagCount }
    }).sort((a, b) => a.daysUntil - b.daysUntil)
  }, [events])

  const accountsToPrep = useMemo(() => {
    return accounts.filter(a => {
      const hasContacts = (a.contacts?.length || PRE_ENRICHED[a.company]?.length) ?? 0
      return hasContacts > 0 && !a.meetings?.length && a.priority === 'High'
    }).slice(0, 6)
  }, [accounts])

  const suggestedEvents = events.filter(e => !e.attending && e.relevance === 'High').slice(0, 3)
  const activeEvent = events.find(e => e.id === activeEventId) || null
  const activeAccount = accounts.find(a => a.id === activeAccountId) || null

  // Helpers for follow-up cards
  function getFuData(item: { account: Account; meetingIdx: number; fuIdx: number }) {
    const meeting = item.account.meetings![item.meetingIdx]
    const fu = meeting.followUps[item.fuIdx]
    return { meeting, fu }
  }

  return (
    <div className="max-w-[960px] mx-auto px-8 py-12">
      {/* Hero */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-text tracking-tight">Hey {firstName} — here&apos;s your day.</h1>
          <p className="text-[16px] text-text2 mt-3">
            {pendingFollowUps.length > 0
              ? `${pendingFollowUps.length} follow-up${pendingFollowUps.length > 1 ? 's' : ''} ready to send.`
              : 'No pending follow-ups. Meet people at events to start sequences.'}
          </p>
        </div>
        <button
          onClick={() => setMeetingModal({ open: true })}
          className="shrink-0 px-5 py-2.5 text-[13px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 cursor-pointer transition-colors shadow-sm"
        >
          + Log Meeting
        </button>
      </div>

      {/* Gmail warning */}
      {!gmailConnected && (
        <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-amber-bg border border-amber-border mb-10">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-[14px] font-semibold text-amber">Gmail isn&apos;t connected</p>
            <p className="text-[13px] text-amber/80 mt-0.5">You won&apos;t be able to send follow-ups. <a href="/api/gmail?action=auth" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Connect Gmail →</a></p>
          </div>
        </div>
      )}

      {/* ═══ FOLLOW-UPS ═══ */}
      {pendingFollowUps.length > 0 && (
        <Section label="Emails to send" count={pendingFollowUps.length} accent>
          <div className="space-y-4">
            {pendingFollowUps.map((item, i) => {
              const { meeting, fu } = getFuData(item)
              return (
                <div key={i} className="bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-bg flex items-center justify-center text-[14px] font-bold text-blue">
                          {meeting.contact.split(' ').map(w => w[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[16px] font-semibold text-text">{meeting.contact}</p>
                          <p className="text-[13px] text-text2">{item.account.company} · Day {fu.day}</p>
                        </div>
                      </div>
                      {meeting.contactEmail && <span className="text-[12px] font-medium text-green bg-green-bg px-3 py-1.5 rounded-full">{meeting.contactEmail}</span>}
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="bg-surface2 px-5 py-3 border-b border-border flex gap-3">
                        <span className="text-[12px] text-text3 w-16">Subject</span>
                        <span className="text-[13px] font-medium text-text">{fu.subject}</span>
                      </div>
                      <div className="px-5 py-4 text-[14px] text-text leading-relaxed whitespace-pre-wrap">{fu.body}</div>
                    </div>
                  </div>

                  <div className="flex border-t border-border">
                    <button
                      onClick={() => setEmailModal({ open: true, accountId: item.account.id, meetingIdx: item.meetingIdx, fuIdx: item.fuIdx })}
                      className="flex-1 py-3.5 text-[14px] font-semibold text-blue hover:bg-blue-bg cursor-pointer transition-colors text-center border-r border-border"
                    >
                      Review & Send
                    </button>
                    <button
                      onClick={() => {
                        const meetings = [...(item.account.meetings || [])]
                        meetings[item.meetingIdx].followUps[item.fuIdx].status = 'pending'
                        updateAccount(item.account.id, { meetings })
                        setTimeout(save, 100)
                      }}
                      className="flex-1 py-3.5 text-[14px] font-medium text-text3 hover:bg-surface2 cursor-pointer transition-colors text-center"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ ACCOUNTS ═══ */}
      {accountsToPrep.length > 0 && (
        <Section label="Accounts to work" count={accountsToPrep.length}>
          <p className="text-[14px] text-text3 mb-5 -mt-2">You have contacts here but haven&apos;t met anyone yet.</p>
          <div className="grid grid-cols-1 gap-3">
            {accountsToPrep.map(a => {
              const contacts = a.contacts || PRE_ENRICHED[a.company] || []
              const top = contacts[0]
              return (
                <div key={a.id} className="bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow flex items-center justify-between gap-4 cursor-pointer" onClick={() => setActiveAccountId(a.id)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-surface2 flex items-center justify-center text-[13px] font-bold text-text3 shrink-0">{a.company.substring(0, 2).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-text truncate">{a.company}</p>
                      <p className="text-[13px] text-text3 mt-0.5 truncate">{top ? `${top.name}, ${top.title}` : `${contacts.length} contacts`} · {a.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setMeetingModal({ open: true, accountId: a.id }) }}
                    className="shrink-0 px-4 py-2 text-[12px] font-semibold text-text border border-border rounded-xl hover:bg-surface2 cursor-pointer transition-colors"
                  >
                    I met them
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ═══ YOUR EVENTS ═══ */}
      {upcomingEvents.length > 0 && (
        <Section label="Your events" count={upcomingEvents.length}>
          <div className="space-y-4">
            {upcomingEvents.map(evt => (
              <div key={evt.id} onClick={() => setActiveEventId(evt.id)} className="bg-white rounded-2xl border border-border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-bg text-blue">{evt.type}</span>
                      <span className={`text-[12px] font-semibold ${evt.daysUntil <= 7 ? 'text-red' : evt.daysUntil <= 30 ? 'text-amber' : 'text-text3'}`}>
                        {evt.daysUntil <= 0 ? 'Today!' : evt.daysUntil === 1 ? 'Tomorrow' : `in ${evt.daysUntil} days`}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-bold text-text">{evt.name}</h3>
                    <p className="text-[13px] text-text2 mt-1">📅 {evt.dates} · 📍 {evt.location}</p>
                  </div>
                  {evt.tagCount > 0 && (
                    <span className="text-[12px] font-semibold text-green bg-green-bg px-3 py-1 rounded-full shrink-0">{evt.tagCount} contacts tagged</span>
                  )}
                </div>
                <p className="text-[13px] text-blue mt-3 font-medium">Click to prep →</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ SUGGESTED EVENTS ═══ */}
      {suggestedEvents.length > 0 && (
        <Section label="Should you attend?">
          <div className="space-y-4">
            {suggestedEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-2xl border border-border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-bg text-purple">{evt.type}</span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-bg text-amber">High relevance</span>
                    </div>
                    <h3 className="text-[17px] font-bold text-text">{evt.name}</h3>
                    <p className="text-[13px] text-text2 mt-1">📅 {evt.dates} · 📍 {evt.location}</p>
                    <p className="text-[14px] text-text2 mt-3 leading-relaxed">{evt.why}</p>
                  </div>
                  <button
                    onClick={() => { updateEvent(evt.id, { attending: true }); setTimeout(saveEvents, 100) }}
                    className="shrink-0 px-5 py-2.5 text-[13px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 cursor-pointer transition-colors shadow-sm"
                  >
                    I&apos;ll go
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="h-20" />

      {/* ═══ MODALS & DRAWERS ═══ */}
      <MeetingLoggerModal
        open={meetingModal.open}
        onClose={() => setMeetingModal({ open: false })}
        defaultAccountId={meetingModal.accountId}
        defaultEventId={meetingModal.eventId}
        defaultContactName={meetingModal.contactName}
      />

      {emailModal.open && emailModal.accountId !== undefined && emailModal.meetingIdx !== undefined && emailModal.fuIdx !== undefined && (() => {
        const acct = accounts.find(a => a.id === emailModal.accountId)
        if (!acct?.meetings?.[emailModal.meetingIdx!]) return null
        return (
          <EmailEditorModal
            open={true}
            onClose={() => setEmailModal({ open: false })}
            account={acct}
            meeting={acct.meetings[emailModal.meetingIdx!]}
            meetingIdx={emailModal.meetingIdx!}
            followUpIdx={emailModal.fuIdx!}
          />
        )
      })()}

      {activeEventId && (
        <EventDetailDrawer
          event={activeEvent}
          onClose={() => setActiveEventId(null)}
          onLogMeeting={(accountId, contactName) => {
            setActiveEventId(null)
            setMeetingModal({ open: true, accountId, eventId: activeEventId, contactName })
          }}
        />
      )}

      {activeAccountId && (
        <AccountDetailDrawer
          account={activeAccount}
          onClose={() => setActiveAccountId(null)}
          onLogMeeting={(accountId) => {
            setActiveAccountId(null)
            setMeetingModal({ open: true, accountId })
          }}
          onEditEmail={(accountId, meetingIdx, fuIdx) => {
            setActiveAccountId(null)
            setEmailModal({ open: true, accountId, meetingIdx, fuIdx })
          }}
        />
      )}
    </div>
  )
}

function Section({ label, count, accent, children }: { label: string; count?: number; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-text3">{label}</h2>
        {count !== undefined && (
          <span className={`text-[11px] font-bold min-w-[22px] text-center py-0.5 px-2 rounded-full ${accent ? 'bg-blue text-white' : 'bg-surface3 text-text2'}`}>{count}</span>
        )}
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  )
}
