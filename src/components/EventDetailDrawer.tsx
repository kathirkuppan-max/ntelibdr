'use client'

import { useState } from 'react'
import { Drawer } from './ui/Drawer'
import { useStore } from '@/lib/store'
import type { BdrEvent } from '@/lib/types'
import { PRE_ENRICHED } from '@/lib/contacts'

interface Props {
  event: BdrEvent | null
  onClose: () => void
  onLogMeeting: (accountId: number, contactName: string) => void
}

export function EventDetailDrawer({ event, onClose, onLogMeeting }: Props) {
  const { accounts, tagContactToEvent, removeTagFromEvent, saveEvents } = useStore()
  const [addingTag, setAddingTag] = useState(false)
  const [tagAccountId, setTagAccountId] = useState<number | ''>('')
  const [tagContactName, setTagContactName] = useState('')

  if (!event) return null

  const tags = event.eventTags || []

  // Get contacts for selected account
  const tagAccount = accounts.find(a => a.id === tagAccountId)
  const tagContacts = tagAccount ? (tagAccount.contacts || PRE_ENRICHED[tagAccount.company] || []) : []

  function handleAddTag() {
    if (!tagAccountId || !tagContactName) return
    tagContactToEvent(event!.id, Number(tagAccountId), tagContactName)
    setTimeout(saveEvents, 100)
    setAddingTag(false)
    setTagAccountId('')
    setTagContactName('')
  }

  function handleRemoveTag(accountId: number, contactName: string) {
    removeTagFromEvent(event!.id, accountId, contactName)
    setTimeout(saveEvents, 100)
  }

  // Resolve tags to full contact info
  const resolvedTags = tags.map(tag => {
    const account = accounts.find(a => a.id === tag.accountId)
    const contacts = account ? (account.contacts || PRE_ENRICHED[account.company] || []) : []
    const contact = contacts.find(c => c.name === tag.contactName)
    return { ...tag, account, contact }
  })

  return (
    <Drawer open={true} onClose={onClose} title={event.name}>
      <div className="px-6 py-5 space-y-6">
        {/* Event Info */}
        <div>
          <p className="text-[13px] text-text2">📅 {event.dates}</p>
          <p className="text-[13px] text-text3 mt-1">📍 {event.location}</p>
          <p className="text-[14px] text-text2 mt-3 leading-relaxed">{event.why}</p>
          {event.notes && <p className="text-[13px] text-text3 italic mt-2">{event.notes}</p>}
          {event.url && <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue hover:underline mt-2 inline-block">Event website →</a>}
        </div>

        {/* Tagged Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text3">People to meet</h3>
            <button
              onClick={() => setAddingTag(true)}
              className="text-[12px] font-semibold text-blue cursor-pointer hover:underline"
            >
              + Add contact
            </button>
          </div>

          {resolvedTags.length === 0 && !addingTag && (
            <p className="text-[13px] text-text3 py-4 text-center bg-surface2 rounded-xl">
              No contacts tagged yet. Click &quot;+ Add contact&quot; to prep for this event.
            </p>
          )}

          {/* Add tag form */}
          {addingTag && (
            <div className="bg-surface2 rounded-xl p-4 mb-3 space-y-3">
              <select
                value={tagAccountId}
                onChange={e => { setTagAccountId(Number(e.target.value)); setTagContactName('') }}
                className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none"
              >
                <option value="">Select account...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.company}</option>)}
              </select>
              {tagContacts.length > 0 && (
                <select
                  value={tagContactName}
                  onChange={e => setTagContactName(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none"
                >
                  <option value="">Select contact...</option>
                  {tagContacts.map((c, i) => <option key={i} value={c.name}>{c.name} — {c.title}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={handleAddTag} disabled={!tagAccountId || !tagContactName} className="px-4 py-2 text-[12px] font-semibold bg-blue text-white rounded-lg disabled:opacity-40 cursor-pointer">Add</button>
                <button onClick={() => setAddingTag(false)} className="px-4 py-2 text-[12px] font-medium text-text3 cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {/* Contact list */}
          <div className="space-y-2">
            {resolvedTags.map((tag, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-bg flex items-center justify-center text-[12px] font-bold text-blue">
                    {tag.contact?.initials || tag.contactName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-text">{tag.contactName}</p>
                    <p className="text-[12px] text-text3">{tag.contact?.title || ''} · {tag.account?.company || ''}</p>
                    <div className="flex gap-2 mt-2">
                      {tag.contact?.linkedin && (
                        <a href={`https://${tag.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue bg-blue-bg px-2.5 py-1 rounded-full font-medium hover:bg-blue hover:text-white transition-colors">
                          LinkedIn
                        </a>
                      )}
                      {tag.contact?.email && (
                        <span className="text-[11px] text-green bg-green-bg px-2.5 py-1 rounded-full font-medium">{tag.contact.email}</span>
                      )}
                      <button
                        onClick={() => onLogMeeting(tag.accountId, tag.contactName)}
                        className="text-[11px] text-text2 bg-surface2 px-2.5 py-1 rounded-full font-medium hover:bg-surface3 cursor-pointer transition-colors"
                      >
                        I met them
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveTag(tag.accountId, tag.contactName)}
                  className="text-text3 hover:text-red cursor-pointer text-sm"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
