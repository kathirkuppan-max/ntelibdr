'use client'

import type { FollowUp } from '@/lib/types'

const STATUS_COLORS: Record<string, { bg: string; ring: string; icon: string }> = {
  pending: { bg: 'bg-surface3', ring: 'ring-surface3', icon: '⏳' },
  ready: { bg: 'bg-blue', ring: 'ring-blue-border', icon: '📧' },
  sent: { bg: 'bg-green', ring: 'ring-green-border', icon: '✓' },
  opened: { bg: 'bg-amber', ring: 'ring-amber-border', icon: '👁' },
  replied: { bg: 'bg-purple', ring: 'ring-purple-border', icon: '💬' },
}

export function DripTimeline({ followUps, onClickFollowUp }: { followUps: FollowUp[]; onClickFollowUp?: (idx: number) => void }) {
  return (
    <div className="flex items-center gap-0">
      {followUps.map((fu, i) => {
        const s = STATUS_COLORS[fu.status] || STATUS_COLORS.pending
        const isLast = i === followUps.length - 1
        return (
          <div key={i} className="flex items-center">
            <button
              onClick={() => onClickFollowUp?.(i)}
              className={`flex flex-col items-center gap-1 cursor-pointer group ${onClickFollowUp ? '' : 'cursor-default'}`}
            >
              <div className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center text-[12px] text-white font-bold ring-2 ${s.ring} group-hover:scale-110 transition-transform`}>
                {fu.status === 'sent' ? '✓' : fu.status === 'ready' ? '!' : '·'}
              </div>
              <span className="text-[10px] text-text3 font-medium">Day {fu.day}</span>
              {fu.sentAt && <span className="text-[9px] text-green">{new Date(fu.sentAt).toLocaleDateString()}</span>}
            </button>
            {!isLast && <div className={`w-8 h-0.5 ${followUps[i + 1]?.status !== 'pending' ? 'bg-green' : 'bg-surface3'} -mt-4`} />}
          </div>
        )
      })}
    </div>
  )
}
