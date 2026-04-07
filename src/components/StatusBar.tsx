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
    <footer className="h-7 shrink-0 bg-surface border-t border-border flex items-center px-5 gap-3 text-[11px] text-text3 font-mono">
      <div className="w-1.5 h-1.5 rounded-full bg-green" />
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
