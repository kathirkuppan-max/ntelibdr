'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { Account, Stage } from '@/lib/types'

const STAGE_COLOR: Record<string, string> = {
  Prospect: 'bg-surface2 text-text3',
  Connected: 'bg-blue-bg text-blue',
  Met: 'bg-amber-bg text-amber',
  'Following Up': 'bg-purple-bg text-purple',
  Engaged: 'bg-blue-bg text-blue',
  Meeting: 'bg-green-bg text-green',
  Proposal: 'bg-amber-bg text-amber',
  Won: 'bg-green-bg text-green',
  Lost: 'bg-red-bg text-red',
}

export function DashboardPage() {
  const { accounts, events } = useStore()

  const stats = useMemo(() => {
    let totalMeetings = 0
    let totalFollowUpsSent = 0
    let totalFollowUpsPending = 0
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        totalMeetings++
        m.followUps.forEach(fu => {
          if (fu.status === 'sent') totalFollowUpsSent++
          if (fu.status === 'ready') totalFollowUpsPending++
        })
      })
    })
    const attendingEvents = events.filter(e => e.attending).length
    return { totalMeetings, totalFollowUpsSent, totalFollowUpsPending, attendingEvents, totalAccounts: accounts.length }
  }, [accounts, events])

  // Pipeline breakdown
  const pipeline = useMemo(() => {
    const stages: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']
    return stages.map(s => ({ stage: s, count: accounts.filter(a => a.stage === s).length })).filter(s => s.count > 0)
  }, [accounts])

  // Activity log — all meetings + follow-ups sorted by date
  const activity = useMemo(() => {
    const items: { date: string; type: string; desc: string; account: string; detail?: string }[] = []
    accounts.forEach(a => {
      (a.meetings || []).forEach(m => {
        items.push({ date: m.date, type: 'meeting', desc: `Met ${m.contact}`, account: a.company, detail: `at ${m.event}` })
        m.followUps.forEach(fu => {
          if (fu.status === 'sent' && fu.sentAt) {
            items.push({ date: fu.sentAt, type: 'email', desc: `Sent Day ${fu.day} follow-up to ${m.contact}`, account: a.company, detail: fu.subject })
          }
        })
      })
    })
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [accounts])

  // Accounts with activity
  const activeAccounts = useMemo(() => {
    return accounts
      .filter(a => a.meetings && a.meetings.length > 0)
      .map(a => {
        const meetingCount = a.meetings!.length
        const sentCount = a.meetings!.reduce((sum, m) => sum + m.followUps.filter(fu => fu.status === 'sent').length, 0)
        const pendingCount = a.meetings!.reduce((sum, m) => sum + m.followUps.filter(fu => fu.status === 'ready').length, 0)
        const lastActivity = a.meetings![a.meetings!.length - 1].date
        return { ...a, meetingCount, sentCount, pendingCount, lastActivity }
      })
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
  }, [accounts])

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <h1 className="text-[28px] font-bold text-text mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <Stat label="Accounts" value={stats.totalAccounts} />
        <Stat label="Meetings" value={stats.totalMeetings} />
        <Stat label="Emails Sent" value={stats.totalFollowUpsSent} accent="green" />
        <Stat label="Pending" value={stats.totalFollowUpsPending} accent={stats.totalFollowUpsPending > 0 ? 'amber' : undefined} />
        <Stat label="Events" value={stats.attendingEvents} />
      </div>

      {/* Pipeline */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-text mb-3">Pipeline</h2>
        <div className="flex gap-2 flex-wrap">
          {pipeline.map(p => (
            <div key={p.stage} className={`px-3 py-2 rounded-lg text-[13px] font-medium ${STAGE_COLOR[p.stage] || 'bg-surface2 text-text2'}`}>
              {p.stage} <span className="font-bold ml-1">{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Activity Table */}
      {activeAccounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[16px] font-semibold text-text mb-3">Account Activity</h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Account</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Stage</th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Meetings</th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Sent</th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Pending</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {activeAccounts.map(a => (
                  <tr key={a.id} className="border-b border-border last:border-b-0 hover:bg-surface2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[14px] font-medium text-text">{a.company}</div>
                      <div className="text-[11px] text-text3">{a.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STAGE_COLOR[a.stage] || 'bg-surface2 text-text2'}`}>{a.stage}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-[14px] font-semibold text-text">{a.meetingCount}</td>
                    <td className="px-4 py-3 text-center text-[14px] font-semibold text-green">{a.sentCount}</td>
                    <td className="px-4 py-3 text-center text-[14px] font-semibold text-amber">{a.pendingCount || '—'}</td>
                    <td className="px-4 py-3 text-right text-[12px] text-text3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-text mb-3">Activity Log</h2>
        {activity.length === 0 ? (
          <p className="text-[13px] text-text3 py-6 text-center">No activity yet. Meet someone at an event to get started.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
                <span className="text-[16px] mt-0.5">{item.type === 'meeting' ? '🤝' : '📧'}</span>
                <div className="flex-1">
                  <div className="text-[13px] text-text">{item.desc}</div>
                  <div className="text-[12px] text-text3">{item.account}{item.detail ? ` · ${item.detail}` : ''}</div>
                </div>
                <span className="text-[11px] text-text3 shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const colorClass = accent === 'green' ? 'text-green' : accent === 'amber' ? 'text-amber' : 'text-text'
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
      <div className="text-[11px] text-text3 uppercase tracking-wider font-semibold">{label}</div>
      <div className={`text-[28px] font-bold mt-0.5 ${colorClass}`}>{value}</div>
    </div>
  )
}
