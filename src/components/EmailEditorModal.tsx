'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { useStore } from '@/lib/store'
import type { Account, Meeting, FollowUp } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  account: Account
  meeting: Meeting
  meetingIdx: number
  followUpIdx: number
}

export function EmailEditorModal({ open, onClose, account, meeting, meetingIdx, followUpIdx }: Props) {
  const { updateAccount, save, gmailConnected } = useStore()
  const fu = meeting.followUps[followUpIdx]

  const [subject, setSubject] = useState(fu?.subject || '')
  const [body, setBody] = useState(fu?.body || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!gmailConnected) { alert('Connect Gmail first'); return }
    if (!meeting.contactEmail) { alert(`No email for ${meeting.contact}`); return }
    setSending(true)
    try {
      const sig = localStorage.getItem('nteli_sig') || 'Kathir'
      const r = await fetch('/api/gmail?action=send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: meeting.contactEmail, subject, body, fromName: sig.split('|')[0].trim(), emailId: 'fu_' + Date.now() }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.error || 'Failed')

      // Update the follow-up status
      const meetings = [...(account.meetings || [])]
      meetings[meetingIdx].followUps[followUpIdx] = { ...fu, subject, body, status: 'sent', sentAt: new Date().toISOString() }
      updateAccount(account.id, { meetings })
      setTimeout(save, 100)
      setSent(true)
      setTimeout(onClose, 1500)
    } catch (e) { alert('Send failed: ' + (e instanceof Error ? e.message : '')) }
    setSending(false)
  }

  function handleSaveDraft() {
    const meetings = [...(account.meetings || [])]
    meetings[meetingIdx].followUps[followUpIdx] = { ...fu, subject, body, status: 'ready' }
    updateAccount(account.id, { meetings })
    setTimeout(save, 100)
    onClose()
  }

  if (!fu) return null

  if (sent) {
    return (
      <Modal open={open} onClose={onClose} title="Email Sent">
        <div className="text-center py-10">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-[16px] font-semibold text-green">Sent to {meeting.contact}</p>
          <p className="text-[13px] text-text3 mt-1">{meeting.contactEmail}</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit Email — Day ${fu.day} Follow-up`}>
      <div className="space-y-4">
        {/* To */}
        <div className="flex items-center gap-3 px-4 py-3 bg-surface2 rounded-xl">
          <span className="text-[12px] text-text3 w-16 shrink-0">To</span>
          <span className="text-[13px] text-text">{meeting.contactEmail || 'No email on file'}</span>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[12px] font-semibold text-text2 mb-1.5">Subject</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-[12px] font-semibold text-text2 mb-1.5">Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[14px] text-text outline-none focus:border-blue transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Context */}
        <div className="text-[12px] text-text3 bg-surface2 rounded-xl p-3">
          <p><strong>Account:</strong> {account.company}</p>
          <p><strong>Met at:</strong> {meeting.event} · {new Date(meeting.date).toLocaleDateString()}</p>
          <p><strong>Notes:</strong> &quot;{meeting.notes}&quot;</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={sending || !meeting.contactEmail || !subject || !body}
            className="flex-1 py-3 text-[14px] font-semibold text-white bg-blue rounded-xl hover:bg-blue2 disabled:opacity-40 cursor-pointer transition-colors"
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 text-[14px] font-medium text-text2 border border-border rounded-xl hover:bg-surface2 cursor-pointer transition-colors"
          >
            Save Draft
          </button>
        </div>
      </div>
    </Modal>
  )
}
