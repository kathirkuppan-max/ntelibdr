'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { BdrEvent } from '@/lib/types'

const RELEVANCE_BADGE: Record<string, string> = {
  High: 'bg-amber-bg text-amber',
  Medium: 'bg-blue-bg text-blue',
  Low: 'bg-surface2 text-text3',
}

const TYPE_BADGE: Record<string, string> = {
  'Trade Show': 'bg-blue-bg text-blue',
  Association: 'bg-purple-bg text-purple',
  Conference: 'bg-purple-bg text-purple',
  Expo: 'bg-green-bg text-green',
  Meetup: 'bg-amber-bg text-amber',
  'Co-working': 'bg-green-bg text-green',
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
      const [, mon, d1, d2, yr] = rangeMatch; const m = months[mon] || '01'
      startDate = `${yr}-${m}-${d1.padStart(2, '0')}`; endDate = `${yr}-${m}-${(parseInt(d2) + 1).toString().padStart(2, '0')}`
    } else if (singleMatch) {
      const [, mon, d, yr] = singleMatch; const m = months[mon] || '01'
      startDate = `${yr}-${m}-${d.padStart(2, '0')}`; endDate = `${yr}-${m}-${(parseInt(d) + 1).toString().padStart(2, '0')}`
    } else {
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.name)}&details=${encodeURIComponent(evt.why)}&location=${encodeURIComponent(evt.location)}`, '_blank')
      return
    }
    if (!gmailConnected) return
    try {
      const r = await fetch('/api/gmail?action=calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: evt.name, location: evt.location, description: `${evt.why}\n\n${evt.notes || ''}${evt.url ? `\n\n${evt.url}` : ''}`, startDate, endDate }) })
      const d = await r.json()
      if (d.success && d.htmlLink) window.open(d.htmlLink, '_blank')
    } catch { /* handled */ }
  }

  function getNearbyAccounts(evt: BdrEvent) {
    const cityKey = evt.location.toLowerCase()
    return accounts.filter(a => cityKey.includes(a.city.toLowerCase().split(' ')[0])).slice(0, 3)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden px-6 py-5 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-[20px] font-bold text-text">Event Planning Board</h1>
          <p className="text-[12px] text-text3 mt-1">{events.length} verified events · Austin · Houston · Dallas · National</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={cityFilter} onChange={setCityFilter} options={[
            { value: 'all', label: 'All Cities' }, { value: 'Austin', label: 'Austin' },
            { value: 'Houston', label: 'Houston' }, { value: 'Dallas', label: 'Dallas / DFW' },
            { value: 'national', label: 'National' },
          ]} />
          <Select value={typeFilter} onChange={setTypeFilter} options={[
            { value: 'all', label: 'All Types' }, { value: 'trade_show', label: 'Trade Shows' },
            { value: 'conference', label: 'Conferences' }, { value: 'meetup', label: 'Meetups' },
          ]} />
          <Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'all', label: 'All Status' }, { value: 'attending', label: 'Attending' },
            { value: 'not', label: 'Not Yet Decided' },
          ]} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 shrink-0">
        <StatCard label="Total Events" value={events.length} />
        <StatCard label="Attending" value={attendingCount} accent="green" />
        <StatCard label="Showing" value={filtered.length} />
        <div className="bg-white border border-border rounded-xl px-5 py-3 flex-1 min-w-[120px] shadow-sm">
          <div className="text-[11px] text-text3 uppercase tracking-wider font-semibold">Cities</div>
          <div className="text-[13px] font-semibold mt-1.5 text-text">Austin · Houston · Dallas</div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        {filtered.length === 0 && (
          <p className="text-text3 text-[13px] text-center py-12">No events match your filters.</p>
        )}
        {filtered.map(evt => {
          const nearby = getNearbyAccounts(evt)
          return (
            <div
              key={evt.id}
              className={`bg-white border border-border rounded-xl p-5 shadow-sm transition-all ${evt.attending ? 'border-l-[3px] border-l-green' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[15px] font-bold text-text">
                    {evt.attending && <span className="text-green mr-1.5">&#10003;</span>}
                    {evt.name}
                  </div>
                  <div className="text-[12px] text-text2 font-medium mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{evt.dates}</div>
                </div>
                <div className="flex gap-1.5">
                  <Badge className={RELEVANCE_BADGE[evt.relevance]}>{evt.relevance}</Badge>
                  <Badge className={TYPE_BADGE[evt.type] || 'bg-surface2 text-text3'}>{evt.type}</Badge>
                </div>
              </div>
              <div className="text-[12px] text-text3 mb-2">{evt.location}</div>
              <p className="text-[13px] text-text2 leading-relaxed mb-2">{evt.why}</p>
              {nearby.length > 0 && (
                <div className="text-[12px] text-blue font-medium mb-2">
                  Target accounts nearby: {nearby.map(a => a.company).join(', ')}
                </div>
              )}
              {evt.notes && <div className="text-[12px] text-text3 italic mb-3">{evt.notes}</div>}
              <div className="flex gap-2 flex-wrap">
                <Btn onClick={() => toggleAttend(evt)} active={evt.attending}>
                  {evt.attending ? '✓ Attending' : 'Mark Attending'}
                </Btn>
                {evt.attending && <Btn onClick={() => addToCalendar(evt)}>Add to Calendar</Btn>}
                {evt.url && (
                  <a href={evt.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border border-border rounded-lg text-text2 hover:bg-surface2 transition-colors">
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
    <div className={`border rounded-xl px-5 py-3 flex-1 min-w-[120px] shadow-sm ${isGreen ? 'bg-green-bg border-green-border' : 'bg-white border-border'}`}>
      <div className={`text-[11px] uppercase tracking-wider font-semibold ${isGreen ? 'text-green' : 'text-text3'}`}>{label}</div>
      <div className={`text-[24px] font-bold mt-0.5 ${isGreen ? 'text-green' : 'text-text'}`}>{value}</div>
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  )
}

function Btn({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border rounded-lg cursor-pointer transition-colors ${
        active
          ? 'bg-green-bg border-green-border text-green hover:bg-green hover:text-white'
          : 'border-border text-text2 bg-white hover:bg-surface2'
      }`}
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
      className="bg-white border border-border text-text text-[12px] px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-border2 transition-colors"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
