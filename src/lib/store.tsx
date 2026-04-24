'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Account, Stage } from './types'
import { SEED_ACCOUNTS } from './seed-accounts'
import { PRE_ENRICHED } from './contacts'
import { compute340BFit } from './fit-score'

interface AppState {
  accounts: Account[]
  selectedId: number | null
  gmailConnected: boolean
  gmailEmail: string
  dbReady: boolean
  user: { email: string; name: string; picture: string } | null
}

interface AppActions {
  setAccounts: (accounts: Account[]) => void
  updateAccount: (id: number, patch: Partial<Account>) => void
  selectAccount: (id: number | null) => void
  setGmail: (connected: boolean, email: string) => void
  setDbReady: (ready: boolean) => void
  setUser: (user: AppState['user']) => void
  save: () => void
  selectedAccount: Account | null
  updateAccountWithStage: (id: number, newStage: Stage, note?: string) => void
  addDiscoveredAccount: (account: Omit<Account, 'id'>) => number | null
  reloadFromDb: () => Promise<void>
}

const StoreContext = createContext<(AppState & AppActions) | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccountsState] = useState<Account[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [dbReady, setDbReadyState] = useState(false)
  const [user, setUser] = useState<AppState['user']>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const SEED_VERSION = 'v10-recapture-fit'
    const storedVersion = localStorage.getItem('nteli_seed_version')
    const isStale = storedVersion !== SEED_VERSION

    let accts: Account[]

    if (isStale) {
      accts = SEED_ACCOUNTS.map(a => ({ ...a }))
      localStorage.setItem('nteli_seed_version', SEED_VERSION)
      localStorage.removeItem('nteli_v8')
      localStorage.removeItem('nteli_events_v5')
    } else {
      const savedAccounts = localStorage.getItem('nteli_v8')
      accts = savedAccounts ? JSON.parse(savedAccounts) : SEED_ACCOUNTS.map(a => ({ ...a }))
    }

    accts = accts.map((a: Account) => {
      if (!a.meetings) a.meetings = []
      if (!a.signals) a.signals = []
      if (!a.stageHistory) a.stageHistory = [{ stage: a.stage, date: new Date().toISOString() }]
      if (!a.contacts && PRE_ENRICHED[a.company]) {
        a.contacts = PRE_ENRICHED[a.company]
        a.contactsSource = 'clay'
        a.contactsDate = 'Apr 2026 (Clay verified)'
      }
      // Always recompute 340B fit on load (cheap, keeps signals fresh)
      a.fitScore340B = compute340BFit(a)
      return a
    })

    setAccountsState(accts)
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (!initialized) return
    const init = async () => {
      try {
        const r = await fetch('/api/db?action=setup', { method: 'POST' })
        const d = await r.json()
        if (d.success) {
          setDbReadyState(true)
          // Pull DB into state (source of truth is Neon once imports have run)
          const lr = await fetch('/api/db?action=load')
          const ld = await lr.json()
          if (ld.accounts?.length && ld.accounts.length >= accounts.length) {
            setAccountsState(ld.accounts)
            localStorage.setItem('nteli_v8', JSON.stringify(ld.accounts))
          } else {
            // Seed our local data up to DB
            fetch('/api/db?action=save-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accounts }) }).catch(() => {})
          }
        }
      } catch {}
    }
    init()
  }, [initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized) return
    fetch('/api/gmail?action=status').then(r => r.json()).then(d => { setGmailConnected(d.connected || false); setGmailEmail(d.email || '') }).catch(() => {})
  }, [initialized])

  const setAccounts = useCallback((accts: Account[]) => setAccountsState(accts), [])

  const updateAccount = useCallback((id: number, patch: Partial<Account>) => {
    setAccountsState(prev => prev.map(a => {
      if (a.id !== id) return a
      const updated = { ...a, ...patch }
      if (patch.stage && patch.stage !== a.stage) {
        const history = [...(updated.stageHistory || [])]
        history.push({ stage: patch.stage, date: new Date().toISOString() })
        updated.stageHistory = history
      }
      return updated
    }))
  }, [])

  const updateAccountWithStage = useCallback((id: number, newStage: Stage, note?: string) => {
    setAccountsState(prev => prev.map(a => {
      if (a.id !== id || a.stage === newStage) return a
      const history = [...(a.stageHistory || [])]
      history.push({ stage: newStage, date: new Date().toISOString(), note })
      return { ...a, stage: newStage, stageHistory: history }
    }))
  }, [])

  const reloadFromDb = useCallback(async () => {
    try {
      const r = await fetch('/api/db?action=load')
      const d = await r.json()
      if (d.accounts?.length) {
        const dbAccts: Account[] = d.accounts.map((a: Account) => {
          if (!a.meetings) a.meetings = []
          if (!a.signals) a.signals = []
          if (!a.stageHistory) a.stageHistory = [{ stage: a.stage, date: new Date().toISOString() }]
          a.fitScore340B = compute340BFit(a)
          return a
        })
        setAccountsState(dbAccts)
        localStorage.setItem('nteli_v8', JSON.stringify(dbAccts))
      }
    } catch { /* silent */ }
  }, [])

  const addDiscoveredAccount = useCallback((account: Omit<Account, 'id'>) => {
    let newId: number | null = null
    setAccountsState(prev => {
      const existing = prev.find(a =>
        (account.website && a.website === account.website) ||
        a.company.toLowerCase() === account.company.toLowerCase()
      )
      if (existing) { newId = null; return prev }
      const maxId = prev.reduce((m, a) => Math.max(m, a.id), 0)
      newId = maxId + 1
      const fullAccount: Account = {
        ...account, id: newId,
        meetings: account.meetings || [], signals: account.signals || [],
        stageHistory: account.stageHistory || [{ stage: account.stage, date: new Date().toISOString() }],
      }
      return [...prev, fullAccount]
    })
    return newId
  }, [])

  const selectAccount = useCallback((id: number | null) => setSelectedId(id), [])
  const setGmail = useCallback((connected: boolean, email: string) => { setGmailConnected(connected); setGmailEmail(email) }, [])
  const setDbReady = useCallback((ready: boolean) => setDbReadyState(ready), [])

  const save = useCallback(() => {
    localStorage.setItem('nteli_v8', JSON.stringify(accounts))
    if (dbReady) { fetch('/api/db?action=save-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accounts }) }).catch(() => {}) }
  }, [accounts, dbReady])

  const selectedAccount = accounts.find(a => a.id === selectedId) || null

  if (!initialized) return null

  return (
    <StoreContext.Provider value={{
      accounts, selectedId, gmailConnected, gmailEmail, dbReady, user,
      setAccounts, updateAccount, selectAccount,
      setGmail, setDbReady, setUser, save, selectedAccount,
      updateAccountWithStage, addDiscoveredAccount, reloadFromDb,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
