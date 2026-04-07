'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'

export function SettingsPage() {
  const { gmailConnected, gmailEmail, events, dbReady } = useStore()
  const [sig, setSig] = useState('Kathir | CEO, Nteli LLC | Revenue Cloud for Manufacturing')
  const [stories, setStories] = useState('')
  const [storiesUrl, setStoriesUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('nteli_sig')
    const st = localStorage.getItem('nteli_stories')
    const su = localStorage.getItem('nteli_stories_url')
    if (s) setSig(s)
    if (st) setStories(st)
    if (su) setStoriesUrl(su)
  }, [])

  function saveSettings() {
    localStorage.setItem('nteli_sig', sig)
    localStorage.setItem('nteli_stories', stories)
    localStorage.setItem('nteli_stories_url', storiesUrl)
    if (dbReady) {
      fetch('/api/db?action=save-settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { sig, stories, storiesUrl } }),
      }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const highEvents = events.filter(e => e.relevance === 'High').slice(0, 4)

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-[640px] px-8 py-8">
        <h1 className="text-[22px] font-bold text-text mb-6">Settings</h1>

        {/* Deployment Info */}
        <SectionLabel>Deployment</SectionLabel>
        <div className="bg-blue-bg border border-blue-border rounded-xl p-5 mb-6">
          <p className="text-[13px] text-text2 leading-relaxed">
            API keys are stored as Vercel server-side environment variables — never in the browser.
            <br /><br />
            <strong className="text-text">Vercel → ntelibdr → Settings → Environment Variables:</strong><br />
            Set <code className="text-blue text-[12px] bg-white px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code>, <code className="text-blue text-[12px] bg-white px-1.5 py-0.5 rounded">VIBE_API_KEY</code>, <code className="text-blue text-[12px] bg-white px-1.5 py-0.5 rounded">OCEAN_API_KEY</code>
          </p>
        </div>

        {/* Sender Identity */}
        <SectionLabel>Sender Identity</SectionLabel>
        <div className="bg-white border border-border rounded-xl p-5 mb-4 shadow-sm">
          <Label>Your Name &amp; Title</Label>
          <input className="w-full bg-surface2 border border-border text-text px-3 py-2.5 rounded-lg text-[13px] outline-none mb-4 focus:border-blue focus:ring-1 focus:ring-blue-border transition-all" value={sig} onChange={e => setSig(e.target.value)} />

          <Label>Customer Stories URL</Label>
          <input className="w-full bg-surface2 border border-border text-text px-3 py-2.5 rounded-lg text-[13px] outline-none mb-4 focus:border-blue focus:ring-1 focus:ring-blue-border transition-all" placeholder="https://nteligroup.com/customers" value={storiesUrl} onChange={e => setStoriesUrl(e.target.value)} />

          <Label>Customer Success Stories</Label>
          <textarea className="w-full bg-surface2 border border-border text-text px-3 py-2.5 rounded-lg text-[12px] outline-none resize-y leading-relaxed mb-4 focus:border-blue focus:ring-1 focus:ring-blue-border transition-all" rows={6} placeholder="Sauer Compressors: Cut quote turnaround from 4 days to 4 hours..." value={stories} onChange={e => setStories(e.target.value)} />

          <Label>Upcoming Events for CTAs</Label>
          <div className="text-[12px] text-text2 leading-relaxed mb-4 p-3 bg-surface2 rounded-lg">
            {highEvents.length > 0
              ? highEvents.map((e, i) => <div key={i} className="mb-0.5">{e.name} — {e.dates}</div>)
              : <span className="text-text3">No high-relevance events</span>
            }
          </div>

          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold bg-blue text-white rounded-lg hover:bg-blue2 cursor-pointer transition-colors shadow-sm"
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>

        {/* Gmail Integration */}
        <SectionLabel className="mt-6">Gmail Integration</SectionLabel>
        <div className="bg-white border border-border rounded-xl p-5 mb-4 shadow-sm">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-text3 mb-3">Gmail API Connection</div>
          <div className="text-[13px] mb-4">
            {gmailConnected ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-bg text-green rounded-lg font-medium">Connected as {gmailEmail}</span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-bg text-red rounded-lg font-medium">Not connected</span>
            )}
          </div>
          <a
            href="/api/gmail?action=auth"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2.5 text-[13px] font-semibold bg-blue text-white rounded-lg hover:bg-blue2 transition-colors shadow-sm mb-4"
          >
            Connect Gmail
          </a>
          <div className="text-[12px] text-text3 leading-relaxed p-4 bg-surface2 rounded-lg">
            <strong className="text-text2">Setup steps:</strong><br />
            1. Go to Google Cloud Console → create project<br />
            2. Enable Gmail API + Calendar API<br />
            3. Create OAuth 2.0 credentials (Web application)<br />
            4. Set redirect URI to <code className="text-blue text-[11px]">/api/gmail?action=callback</code><br />
            5. Add env vars to Vercel, click Connect Gmail above
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[11px] font-semibold uppercase tracking-wider text-text3 mb-2 ${className}`}>{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-text2 mb-1.5">{children}</label>
}
