'use client'

import { useState } from 'react'
import { Drawer } from './ui/Drawer'
import { useStore } from '@/lib/store'
import { DripTimeline } from './DripTimeline'
import type { Account, Stage } from '@/lib/types'
import { PRE_ENRICHED } from '@/lib/contacts'

const STAGES: Stage[] = ['Prospect', 'Connected', 'Met', 'Following Up', 'Engaged', 'Meeting', 'Proposal', 'Won', 'Lost']
const STAGE_COLORS: Record<string, string> = {
  Prospect: 'bg-surface3 text-text2', Connected: 'bg-blue-bg text-blue', Met: 'bg-amber-bg text-amber',
  'Following Up': 'bg-purple-bg text-purple', Engaged: 'bg-blue-bg text-blue', Meeting: 'bg-green-bg text-green',
  Proposal: 'bg-amber-bg text-amber', Won: 'bg-green-bg text-green', Lost: 'bg-red-bg text-red',
}

interface Props {
  account: Account | null
  onClose: () => void
  onLogMeeting: (accountId: number) => void
  onEditEmail: (accountId: number, meetingIdx: number, fuIdx: number) => void
}

export function AccountDetailDrawer({ account, onClose, onLogMeeting, onEditEmail }: Props) {
  const { updateAccountWithStage, updateAccount, save } = useStore()
  const [notesValue, setNotesValue] = useState(account?.notes || '')

  if (!account) return null

  const contacts = account.contacts || PRE_ENRICHED[account.company] || []
  const meetings = account.meetings || []

  // Build activity timeline
  const timeline: { date: string; type: 'stage' | 'meeting' | 'email'; title: string; detail: string }[] = []
  for (const sh of (account.stageHistory || [])) {
    timeline.push({ date: sh.date, type: 'stage', title: `Stage → ${sh.stage}`, detail: sh.note || '' })
  }
  for (const m of meetings) {
    timeline.push({ date: m.date, type: 'meeting', title: `Met ${m.contact}`, detail: `at ${m.event}` })
    for (const fu of m.followUps) {
      if (fu.status === 'sent' && fu.sentAt) {
        timeline.push({ date: fu.sentAt, type: 'email', title: `Sent Day ${fu.day} to ${m.contact}`, detail: fu.subject })
      }
    }
  }
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function handleSaveNotes() {
    updateAccount(account!.id, { notes: notesValue })
    setTimeout(save, 100)
  }

  const TYPE_ICON = { stage: '🔄', meeting: '🤝', email: '📧' }

  return (
    <Drawer open={true} onClose={onClose} title={account.company}>
      <div className="px-6 py-5 space-y-6">
        {/* Company Info */}
        <div className="grid grid-cols-2 gap-3">
          {[['Revenue', account.rev], ['Employees', account.emp], ['City', account.city], ['Vertical', account.vertical], ['Ownership', account.ownership], ['Website', account.website]].map(([label, value]) => (
            <div key={label} className="bg-surface2 rounded-xl p-3">
              <p className="text-[11px] text-text3 font-medium">{label}</p>
              <p className="text-[13px] font-medium text-text mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Stage */}
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3 mb-2">Pipeline Stage</h3>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s}
                onClick={() => { updateAccountWithStage(account!.id, s); setTimeout(save, 100) }}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                  account.stage === s
                    ? `${STAGE_COLORS[s]} ring-2 ring-offset-1 ring-current`
                    : 'bg-surface2 text-text3 hover:bg-surface3'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Points */}
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3 mb-2">Chargeback &amp; Ship-Debit Pain Points</h3>
          <div className="space-y-1.5">
            {account.pains.map((p, i) => (
              <div key={i} className="text-[13px] text-text2 bg-surface2 rounded-lg px-3 py-2">{p}</div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3">Contacts ({contacts.length})</h3>
          </div>
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface2 rounded-xl px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-bg flex items-center justify-center text-[11px] font-bold text-blue shrink-0">{c.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text truncate">{c.name}</p>
                  <p className="text-[11px] text-text3 truncate">{c.title}</p>
                </div>
                {c.linkedin && <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue hover:underline shrink-0">LinkedIn</a>}
              </div>
            ))}
          </div>
          <button
            onClick={() => onLogMeeting(account!.id)}
            className="w-full mt-3 py-2.5 text-[13px] font-semibold text-blue border border-blue-border rounded-xl hover:bg-blue-bg cursor-pointer transition-colors"
          >
            + Log a meeting
          </button>
        </div>

        {/* Meetings & Drip */}
        {meetings.length > 0 && (
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3 mb-2">Meetings ({meetings.length})</h3>
            <div className="space-y-3">
              {[...meetings].reverse().map((m, ri) => {
                const mi = meetings.length - 1 - ri
                return (
                  <div key={m.id} className="bg-white border border-border rounded-xl p-4">
                    <p className="text-[14px] font-semibold text-text">{m.contact}</p>
                    <p className="text-[12px] text-text3 mt-0.5">{m.event} · {new Date(m.date).toLocaleDateString()}</p>
                    <p className="text-[12px] text-text2 italic mt-2">&quot;{m.notes}&quot;</p>
                    <div className="mt-3">
                      <DripTimeline
                        followUps={m.followUps}
                        onClickFollowUp={(fi) => onEditEmail(account!.id, mi, fi)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        {timeline.length > 0 && (
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3 mb-2">Activity Timeline</h3>
            <div className="space-y-1">
              {timeline.slice(0, 15).map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-[14px] mt-0.5">{TYPE_ICON[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-text">{item.title}</p>
                    {item.detail && <p className="text-[11px] text-text3 truncate">{item.detail}</p>}
                  </div>
                  <span className="text-[10px] text-text3 shrink-0 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-text3 mb-2">Notes</h3>
          <textarea
            value={notesValue}
            onChange={e => setNotesValue(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Free-form notes about this account..."
            rows={3}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[13px] text-text outline-none focus:border-blue transition-colors resize-y leading-relaxed"
          />
        </div>
      </div>
    </Drawer>
  )
}
