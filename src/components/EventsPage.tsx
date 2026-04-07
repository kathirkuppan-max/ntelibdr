'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { BdrEvent } from '@/lib/types'

const RELEVANCE_BADGE: Record<string, string> = {
  High: 'bg-gold-bg text-gold border-gold-border',
  Medium: 'bg-blue-bg text-blue border-blue-border',
  Low: 'bg-surface2 text-text3 border-border',
}

const TYPE_BADGE: Record<string, string> = {
  'Trade Show': 'bg-blue-bg text-blue border-blue-border',
  Association: 'bg-purple-bg text-purple border-purple-border',
  Conference: 'bg-purple-bg text-purple border-purple-border',
  Expo: 'bg-green-bg text-green border-green-border',
  Meetup: 'bg-amber-bg text-amber border-amber-border',
  'Co-working': 'bg-green-bg text-green border-green-border',
}

export function EventsPage() {
  const { events, updateEvent, saveEvents, accounts, gmailConnected } = useStore()
  const [cityFilter, setCityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    let f = events
    if (typeFilter !== 'all') f = f.filter(e => e.category === typeFilter)
    if (cityFilter === 'national') f = f.filter(e => !e.location.includes('TX') && !e.location.includes('Texas'))
    else if (cityFilter !== 'all') f = f.filter(e => e.location.toLowerCase().includes(cityFilter.toLowerCase()))
    if (statusFilter === 'attending') f = f.filter(e => e.attending)
    else if (statusFilter === 'not') f = f.filter(e => !e.attending)
    return f
  }, [events, cityFilter, typeFilter, statusFilter])

  const attendingCount = events.filter(e => e.attending).length

  function toggleAttend(evt: BdrEvent) {
    updateEvent(evt.id, { attending: !evt.attending })
    setTimeout(saveEvents, 100)
  }

  async function addToCalendar(evt: BdrEvent) {
    const dateStr = evt.dates.replace(/·.*$/, '').trim()
    const months: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }
    const rangeMatch = dateStr.match(/(\w+)\s+(\d+)[–-](\d+),?\s*(\d{4})/)
    const singleMatch = dateStr.match(/(\w+)\s+(\d+),?\s*(\d{4})/)

    let startDate: string, endDate: string

    if (rangeMatch) {
      const [, mon, d1, d2, yr] = rangeMatch
      const m = months[mon] || '01'
      startDate = `${yr}-${m}-${d1.padStart(2, '0')}`
      endDate = `${yr}-${m}-${(parseInt(d2) + 1).toString().padStart(2, '0')}`
    } else if (singleMatch) {
      const [, mon, d, yr] = singleMatch
      const m = months[mon] || '01'
      startDate = `${yr}-${m}-${d.padStart(2, '0')}`
      endDate = `${yr}-${m}-${(parseInt(d) + 1).toString().padStart(2, '0')}`
    } else {
      window.open(
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.name)}&details=${encodeURIComponent(evt.why)}&location=${encodeURIComponent(evt.location)}`,
        '_blank'
      )
      return
    }

    if (!gmailConnected) return

    try {
      const r = await fetch('/api/gmail?action=calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: evt.name,
          location: evt.location,
          description: `${evt.why}\n\n${evt.notes || ''}${evt.url ? `\n\n${evt.url}` : ''}`,
          startDate,
          endDate,
        }),
      })
      const d = await r.json()
      if (d.success && d.htmlLink) window.open(d.htmlLink, '_blank')
    } catch { /* handled */ }
  }

  function getNearbyAccounts(evt: BdrEvent) {
    const cityKey = evt.location.toLowerCase()
    return accounts.filter(a => cityKey.includes(a.city.toLowerCase().split(' ')[0])).slice(0, 3)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-5 gap-3">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold">Event Planning Board</h1>
          <p className="text-xs text-text3 mt-0.5">
            {events.length} verified events · Austin · Houston · Dallas · National
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={cityFilter} onChange={setCityFilter} options={[
            { value: 'all', label: 'All Cities' },
            { value: 'Austin', label: 'Austin' },
            { value: 'Houston', label: 'Houston' },
            { value: 'Dallas', label: 'Dallas / DFW' },
            { value: 'national', label: 'National' },
          ]} />
          <Select value={typeFilter} onChange={setTypeFilter} options={[
            { value: 'all', label: 'All Types' },
            { value: 'trade_show', label: 'Trade Shows' },
            { value: 'conference', label: 'Conferences' },
            { value: 'meetup', label: 'Meetups' },
          ]} />
          <Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'all', label: 'All Status' },
            { value: 'attending', label: 'Attending' },
            { value: 'not', label: 'Not Yet Decided' },
          ]} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 shrink-0 flex-wrap">
        <StatCard label="Total Events" value={events.length} />
        <StatCard label="Attending" value={attendingCount} accent="green" />
        <StatCard label="Showing" value={filtered.length} />
        <div className="bg-surface border border-border rounded-md px-4 py-2.5 flex-1 min-w-[120px]">
          <div className="text-[11px] text-text3 uppercase tracking-wider font-semibold">Cities</div>
          <div className="text-[13px] font-semibold mt-1">Austin · Houston · Dallas</div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5">
        {filtered.length === 0 && (
          <p className="text-text3 text-sm italic text-center py-10">No events match your filters.</p>
        )}
        {filtered.map(evt => {
          const nearby = getNearbyAccounts(evt)
          return (
            <div
              key={evt.id}
              className={`bg-surface border border-border rounded-lg p-4 shadow-sm ${evt.attending ? 'border-l-3 border-l-green' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-[15px] font-bold">
                    {evt.attending && <span className="text-green mr-1">✓</span>}
                    {evt.name}
                  </div>
                  <div className="text-[11px] text-text2 font-medium font-mono mt-0.5">{evt.dates}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={RELEVANCE_BADGE[evt.relevance]}>{evt.relevance}</Badge>
                  <Badge className={TYPE_BADGE[evt.type] || 'bg-surface2 text-text3 border-border'}>{evt.type}</Badge>
                </div>
              </div>
              <div className="text-xs text-text3 mb-1.5">{evt.location}</div>
              <p className="text-[13px] text-text2 leading-relaxed mb-1.5">{evt.why}</p>
              {nearby.length > 0 && (
                <div className="text-[11px] text-blue mb-1.5">
                  Target accounts nearby: {nearby.map(a => a.company).join(', ')}
                </div>
              )}
              {evt.notes && (
                <div className="text-xs text-text3 italic mb-2">{evt.notes}</div>
              )}
              <div className="flex gap-1.5 flex-wrap">
                <Btn
                  onClick={() => toggleAttend(evt)}
                  className={evt.attending ? '!bg-green-bg !border-green-border !text-green' : ''}
                >
                  {evt.attending ? '✓ Attending' : 'Mark Attending'}
                </Btn>
                {evt.attending && (
                  <Btn onClick={() => addToCalendar(evt)}>Add to Calendar</Btn>
                )}
                {evt.url && (
                  <a href={evt.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border2 rounded-md text-text2 hover:bg-surface2 transition-all">
                    Website
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const isGreen = accent === 'green'
  return (
    <div className={`border rounded-md px-4 py-2.5 flex-1 min-w-[120px] ${isGreen ? 'bg-green-bg border-green-border' : 'bg-surface border-border'}`}>
      <div className={`text-[11px] uppercase tracking-wider font-semibold ${isGreen ? 'text-green' : 'text-text3'}`}>{label}</div>
      <div className={`text-[22px] font-bold ${isGreen ? 'text-green' : ''}`}>{value}</div>
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${className}`}>
      {children}
    </span>
  )
}

function Btn({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border2 rounded-md text-text2 hover:bg-surface2 transition-all cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface border border-border text-text text-xs px-2 py-1 rounded-md outline-none cursor-pointer focus:border-blue2"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
