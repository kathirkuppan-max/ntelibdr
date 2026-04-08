'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Stage } from '@/lib/types'
import { AccountDetailDrawer } from './AccountDetailDrawer'
import { MeetingLoggerModal } from './MeetingLoggerModal'
import { EmailEditorModal } from './EmailEditorModal'

const STAGE_ORDER: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']
const STAGE_COLOR: Record<string, string> = {
  Prospect: 'bg-surface3 text-text2', Connected: 'bg-blue-bg text-blue', Met: 'bg-amber-bg text-amber',
  'Following Up': 'bg-purple-bg text-purple', Engaged: 'bg-blue-bg text-blue', Meeting: 'bg-green-bg text-green',
  Proposal: 'bg-amber-bg text-amber', Won: 'bg-green-bg text-green', Lost: 'bg-red-bg text-red',
}

export function DashboardPage() {
  const { accounts, events } = useStore()
  const [expandedStage, setExpandedStage] = useState<Stage | null>(null)
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null)
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; accountId?: number }>({ open: false })
  const [emailModal, setEmailModal] = useState<{ open: boolean; accountId?: number; meetingIdx?: number; fuIdx?: number }>({ open: false })

  const stats = useMemo(() => {
    let totalMeetings = 0, totalSent = 0, totalPending = 0
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        totalMeetings++
        m.followUps.forEach(fu => { if (fu.status === 'sent') totalSent++; if (fu.status === 'ready') totalPending++ })
      })
    })
    return { totalMeetings, totalSent, totalPending, attending: events.filter(e => e.attending).length, total: accounts.length }
  }, [accounts, events])

  const pipeline = useMemo(() => {
    return STAGE_ORDER.map(s => ({ stage: s, accounts: accounts.filter(a => a.stage === s) })).filter(s => s.accounts.length > 0)
  }, [accounts])

  const activity = useMemo(() => {
    const items: { date: string; type: string; desc: string; account: string; accountId: number }[] = []
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        items.push({ date: m.date, type: 'meeting', desc: `Met ${m.contact}`, account: a.company, accountId: a.id })
        m.followUps.forEach(fu => {
          if (fu.status === 'sent' && fu.sentAt) items.push({ date: fu.sentAt, type: 'email', desc: `Sent Day ${fu.day} to ${m.contact}`, account: a.company, accountId: a.id })
        })
      })
    })
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20)
  }, [accounts])

  const activeAccount = accounts.find(a => a.id === activeAccountId) || null

  return (
    <div className="max-w-[960px] mx-auto px-8 py-12">
      <h1 className="text-[32px] font-bold text-text tracking-tight mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-10">
        <StatCard label="Accounts" value={stats.total} />
        <StatCard label="Meetings" value={stats.totalMeetings} />
        <StatCard label="Emails Sent" value={stats.totalSent} color="green" />
        <StatCard label="Pending" value={stats.totalPending} color={stats.totalPending > 0 ? 'amber' : undefined} />
        <StatCard label="Events" value={stats.attending} />
      </div>

      {/* Pipeline */}
      <Section label="Pipeline">
        <div className="flex flex-wrap gap-2 mb-4">
          {pipeline.map(p => (
            <button
              key={p.stage}
              onClick={() => setExpandedStage(expandedStage === p.stage ? null : p.stage)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${
                expandedStage === p.stage
                  ? `${STAGE_COLOR[p.stage]} ring-2 ring-offset-1 ring-current`
                  : `${STAGE_COLOR[p.stage]} hover:opacity-80`
              }`}
            >
              {p.stage} <span className="font-bold ml-1">{p.accounts.length}</span>
            </button>
          ))}
        </div>
        {expandedStage && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {pipeline.find(p => p.stage === expandedStage)?.accounts.map((a, i, arr) => (
              <div
                key={a.id}
                onClick={() => setActiveAccountId(a.id)}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-surface2 transition-colors ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface2 flex items-center justify-center text-[12px] font-bold text-text3">{a.company.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="text-[14px] font-medium text-text">{a.company}</p>
                    <p className="text-[12px] text-text3">{a.city} · {a.rev}</p>
                  </div>
                </div>
                <span className="text-[12px] text-text3">{(a.meetings || []).length} meetings</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Activity Log */}
      <Section label="Activity Log">
        {activity.length === 0 ? (
          <p className="text-[14px] text-text3 py-8 text-center">No activity yet. Meet someone at an event to get started.</p>
        ) : (
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {activity.map((item, i) => (
              <div
                key={i}
                onClick={() => setActiveAccountId(item.accountId)}
                className={`flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface2 transition-colors ${i < activity.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-[16px] mt-0.5">{item.type === 'meeting' ? '🤝' : '📧'}</span>
                <div className="flex-1">
                  <p className="text-[13px] text-text">{item.desc}</p>
                  <p className="text-[12px] text-text3">{item.account}</p>
                </div>
                <span className="text-[11px] text-text3 font-mono shrink-0">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="h-20" />

      {/* Drawers/Modals */}
      {activeAccountId && (
        <AccountDetailDrawer
          account={activeAccount}
          onClose={() => setActiveAccountId(null)}
          onLogMeeting={(id) => { setActiveAccountId(null); setMeetingModal({ open: true, accountId: id }) }}
          onEditEmail={(id, mi, fi) => { setActiveAccountId(null); setEmailModal({ open: true, accountId: id, meetingIdx: mi, fuIdx: fi }) }}
        />
      )}

      <MeetingLoggerModal open={meetingModal.open} onClose={() => setMeetingModal({ open: false })} defaultAccountId={meetingModal.accountId} />

      {emailModal.open && emailModal.accountId !== undefined && (() => {
        const acct = accounts.find(a => a.id === emailModal.accountId)
        if (!acct?.meetings?.[emailModal.meetingIdx!]) return null
        return <EmailEditorModal open={true} onClose={() => setEmailModal({ open: false })} account={acct} meeting={acct.meetings[emailModal.meetingIdx!]} meetingIdx={emailModal.meetingIdx!} followUpIdx={emailModal.fuIdx!} />
      })()}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color === 'green' ? 'text-green' : color === 'amber' ? 'text-amber' : 'text-text'
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-[11px] text-text3 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-[28px] font-bold mt-1 ${c}`}>{value}</p>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-text3">{label}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  )
}
