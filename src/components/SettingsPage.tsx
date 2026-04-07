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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { sig, stories, storiesUrl } }),
      }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const highEvents = events.filter(e => e.relevance === 'High').slice(0, 4)

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-[600px] p-6">
        <h1 className="text-[22px] font-bold mb-5">Settings</h1>

        {/* Deployment Info */}
        <SectionLabel>Deployment</SectionLabel>
        <div className="bg-blue-bg border border-blue-border rounded-lg p-4 mb-4">
          <p className="text-[13px] text-text2 leading-relaxed">
            API keys are stored as Vercel server-side environment variables — never in the browser.
            <br /><br />
            <strong>Vercel → ntelibdr → Settings → Environment Variables:</strong><br />
            Set <code className="text-blue text-xs">OCEAN_API_KEY</code>, <code className="text-blue text-xs">VIBE_API_KEY</code>, <code className="text-blue text-xs">ANTHROPIC_API_KEY</code>
          </p>
        </div>

        {/* Sender Identity */}
        <SectionLabel>Sender Identity</SectionLabel>
        <div className="bg-surface border border-border rounded-lg p-4 mb-3">
          <Label>Your Name &amp; Title</Label>
          <input
            className="w-full bg-surface border border-border text-text px-2.5 py-1.5 rounded-md text-[13px] outline-none mb-2.5 focus:border-blue2"
            value={sig}
            onChange={e => setSig(e.target.value)}
          />

          <Label>Customer Stories URL</Label>
          <input
            className="w-full bg-surface border border-border text-text px-2.5 py-1.5 rounded-md text-[13px] outline-none mb-2.5 focus:border-blue2"
            placeholder="https://nteligroup.com/customers"
            value={storiesUrl}
            onChange={e => setStoriesUrl(e.target.value)}
          />

          <Label>Customer Success Stories</Label>
          <textarea
            className="w-full bg-surface border border-border text-text px-2.5 py-1.5 rounded-md text-xs outline-none resize-y leading-relaxed mb-2.5 focus:border-blue2"
            rows={6}
            placeholder="Sauer Compressors: Cut quote turnaround from 4 days to 4 hours..."
            value={stories}
            onChange={e => setStories(e.target.value)}
          />

          <Label>Upcoming Events for CTAs</Label>
          <div className="text-xs text-text3 leading-relaxed mb-3">
            {highEvents.length > 0
              ? highEvents.map(e => `📅 ${e.name} — ${e.dates} (${e.location})`).join('\n').split('\n').map((line, i) => <div key={i}>{line}</div>)
              : 'No high-relevance events'
            }
          </div>

          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-blue2 text-white border border-blue2 rounded-md hover:bg-blue cursor-pointer"
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>

        {/* Gmail Integration */}
        <SectionLabel className="mt-4">Gmail Integration</SectionLabel>
        <div className="bg-surface border border-border rounded-lg p-4 mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-text3 mb-3">Gmail API Connection</div>
          <div className="text-[13px] text-text2 mb-3">
            {gmailConnected ? (
              <span className="text-green">Connected as {gmailEmail}</span>
            ) : (
              <span className="text-red">Not connected. Follow setup steps below.</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            <a
              href="/api/gmail?action=auth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-[13px] font-semibold bg-blue2 text-white border border-blue2 rounded-md hover:bg-blue"
            >
              Connect Gmail
            </a>
          </div>
          <div className="text-xs text-text3 leading-relaxed">
            <strong>Setup steps:</strong><br />
            1. Go to Google Cloud Console and create a project<br />
            2. Enable the Gmail API + Calendar API<br />
            3. Create OAuth 2.0 credentials (Web application)<br />
            4. Set redirect URI to your Vercel domain + <code className="text-blue">/api/gmail?action=callback</code><br />
            5. Add env vars to Vercel<br />
            6. Click &quot;Connect Gmail&quot; above, authorize, then save the refresh token
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-wider text-text3 mb-1.5 ${className}`}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text3 mb-1">
      {children}
    </label>
  )
}
