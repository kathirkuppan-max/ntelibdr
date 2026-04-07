'use client'

import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'

export function StatusBar() {
  const { accounts, dbReady } = useStore()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString())
    update()
    const i = setInterval(update, 10000)
    return () => clearInterval(i)
  }, [])

  return (
    <footer className="h-[32px] shrink-0 bg-white border-t border-border flex items-center px-6 gap-3 text-[11px] text-text3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="w-[6px] h-[6px] rounded-full bg-green" />
      <span>{accounts.length} accounts</span>
      <span className="text-border2">·</span>
      <span>Ready</span>
      <span className="text-border2 ml-auto">·</span>
      <span>{dbReady ? 'DB: connected' : 'DB: local'}</span>
      <span className="text-border2">·</span>
      <span>{time}</span>
    </footer>
  )
}
