'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account } from '@/lib/types'
import { PRE_ENRICHED } from '@/lib/contacts'
import { MeetingLoggerModal } from './MeetingLoggerModal'
import { EmailEditorModal } from './EmailEditorModal'
import { AccountDetailDrawer } from './AccountDetailDrawer'

export function TodayPage({ firstName }: { firstName: string }) {
  const { accounts, updateAccount, save, gmailConnected } = useStore()

  const [meetingModal, setMeetingModal] = useState<{ open: boolean; accountId?: number; contactName?: string }>({ open: false })
  const [emailModal, setEmailModal] = useState<{ open: boolean; accountId?: number; meetingIdx?: number; fuIdx?: number }>({ open: false })
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null)

  // Pending follow-ups
  const pendingFollowUps: { account: Account; meetingIdx: number; fuIdx: number }[] = []
  accounts.forEach(a => {
    (a.meetings || []).forEach((m, mi) => {
      m.followUps.forEach((_, fi) => {
        if (m.followUps[fi].status === 'ready') pendingFollowUps.push({ account: a, meetingIdx: mi, fuIdx: fi })
      })
    })
  })

  // Accounts ranked by signal heat (most signals, most recent first)
  const hotAccounts = useMemo(() => {
    return accounts
      .filter(a => (a.signals?.length ?? 0) > 0)
      .map(a => {
        const latest = [...(a.signals || [])].sort((x, y) => (y.date || '').localeCompare(x.date || ''))[0]
        return { ...a, latestSignal: latest, signalCount: (a.signals || []).length }
      })
      .sort((a, b) => (b.latestSignal?.date || '').localeCompare(a.latestSignal?.date || ''))
      .slice(0, 10)
  }, [accounts])

  // Accounts with contacts but no meetings yet (high priority work list)
  const accountsToWork = useMemo(() => {
    return accounts
      .filter(a => {
        const hasContacts = (a.contacts?.length || PRE_ENRICHED[a.company]?.length) ?? 0
        return hasContacts > 0 && !a.meetings?.length && a.priority === 'High'
      })
      .slice(0, 8)
  }, [accounts])

  const activeAccount = accounts.find(a => a.id === activeAccountId) || null

  function getFuData(item: { account: Account; meetingIdx: number; fuIdx: number }) {
    const meeting = item.account.meetings![item.meetingIdx]
    const fu = meeting.followUps[item.fuIdx]
    return { meeting, fu }
  }

  return (
    <div className="max-w-[960px] mx-auto px-8 py-12">
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-[32px] font-bold text-text tracking-tight">Hey {firstName}.</h1>
          <p className="text-[16px] text-text2 mt-3">
            {pendingFollowUps.length > 0
              ? `${pendingFollowUps.length} follow-up${pendingFollowUps.length > 1 ? 's' : ''} ready to send · ${accounts.length} accounts in pipeline`
              : `${accounts.length} accounts in pipeline · ${hotAccounts.length} have fresh signals`}
          </p>
        </div>
        <button
          onClick={() => setMeetingModal({ open: true })}
          className="shrink-0 px-5 py-2.5 text-[13px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 cursor-pointer transition-colors shadow-sm"
        >
          + Log Meeting
        </button>
      </div>

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
                <div key={i} className="bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
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

      {/* ═══ HOT ACCOUNTS (signal-driven) ═══ */}
      {hotAccounts.length > 0 && (
        <Section label="Hot accounts · recent signals" count={hotAccounts.length} accent>
          <div className="space-y-3">
            {hotAccounts.map(a => (
              <div
                key={a.id}
                onClick={() => setActiveAccountId(a.id)}
                className="bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-surface2 flex items-center justify-center text-[13px] font-bold text-text3 shrink-0">{a.company.substring(0, 2).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-text">{a.company}</p>
                      <p className="text-[12px] text-text3 mt-0.5">{a.city} · {a.rev} · {a.emp} emps</p>
                      {a.latestSignal && (
                        <div className="mt-2 flex items-start gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-bg text-amber shrink-0 mt-px">{signalTypeLabel(a.latestSignal.type)}</span>
                          <span className="text-[12px] text-text2 line-clamp-1">{a.latestSignal.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-semibold text-amber bg-amber-bg px-2.5 py-0.5 rounded-full inline-block">{a.signalCount} signals</div>
                    {a.latestSignal?.date && <div className="text-[10px] text-text3 font-mono mt-1">{a.latestSignal.date}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ═══ ACCOUNTS TO WORK ═══ */}
      {accountsToWork.length > 0 && (
        <Section label="Accounts to work" count={accountsToWork.length}>
          <p className="text-[14px] text-text3 mb-5 -mt-2">Contacts on file but no meeting yet.</p>
          <div className="space-y-3">
            {accountsToWork.map(a => {
              const contacts = a.contacts || PRE_ENRICHED[a.company] || []
              const top = contacts[0]
              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setActiveAccountId(a.id)}
                >
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

      <div className="h-20" />

      <MeetingLoggerModal
        open={meetingModal.open}
        onClose={() => setMeetingModal({ open: false })}
        defaultAccountId={meetingModal.accountId}
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

      {activeAccountId && (
        <AccountDetailDrawer
          account={activeAccount}
          onClose={() => setActiveAccountId(null)}
          onLogMeeting={(id) => { setActiveAccountId(null); setMeetingModal({ open: true, accountId: id }) }}
          onEditEmail={(id, mi, fi) => { setActiveAccountId(null); setEmailModal({ open: true, accountId: id, meetingIdx: mi, fuIdx: fi }) }}
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

function signalTypeLabel(type: string) {
  const m: Record<string, string> = {
    new_product: 'Product / ANDA',
    new_funding_round: 'Funding',
    merger_and_acquisitions: 'M&A',
    ipo_announcement: 'IPO',
    lawsuits_and_legal_issues: 'Legal',
    hiring_in_finance_department: 'Finance hire',
    new_executive: 'Exec hire',
    other: 'Signal',
  }
  return m[type] || 'Signal'
}
