'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Account, Stage, ProductId } from './types'
import { SEED_ACCOUNTS } from './seed-accounts'
import { SEED_SEMICONDUCTORS } from './seed-semiconductors'
import { PRE_ENRICHED } from './contacts'
import { computeAllFitScores } from './fit-score'

// Either a real product or 'all' (UI-only filter — not stored on accounts).
export type ProductFilter = ProductId | 'all'

interface AppState {
  accounts: Account[]
  selectedId: number | null
  selectedProduct: ProductFilter
  gmailConnected: boolean
  gmailEmail: string
  dbReady: boolean
  user: { email: string; name: string; picture: string } | null
}

interface AppActions {
  setAccounts: (accounts: Account[]) => void
  updateAccount: (id: number, patch: Partial<Account>) => void
  selectAccount: (id: number | null) => void
  setSelectedProduct: (p: ProductFilter) => void
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

// Apply default invariants + always-fresh fit scores to every account on
// load. Older Neon JSONB rows may be missing meetings / signals / products
// so default them here.
function hydrateAccount(a: Account): Account {
  if (!a.meetings) a.meetings = []
  if (!a.signals) a.signals = []
  if (!a.stageHistory) a.stageHistory = [{ stage: a.stage, date: new Date().toISOString() }]
  if (!a.contacts && PRE_ENRICHED[a.company]) {
    a.contacts = PRE_ENRICHED[a.company]
    a.contactsSource = 'clay'
    a.contactsDate = 'Apr 2026 (Clay verified)'
  }
  if (!a.products || a.products.length === 0) a.products = ['recapture']
  // Always recompute multi-product fit scores on load (cheap, keeps signals fresh)
  const fitScores = computeAllFitScores(a)
  a.fitScores = fitScores
  a.fitScore340B = fitScores.recapture
  return a
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccountsState] = useState<Account[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedProduct, setSelectedProductState] = useState<ProductFilter>('recapture')
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [dbReady, setDbReadyState] = useState(false)
  const [user, setUser] = useState<AppState['user']>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const SEED_VERSION = 'v11-multiproduct'
    const storedVersion = localStorage.getItem('nteli_seed_version')
    const isStale = storedVersion !== SEED_VERSION

    let accts: Account[]

    if (isStale) {
      accts = [...SEED_ACCOUNTS, ...SEED_SEMICONDUCTORS].map(a => ({ ...a }))
      localStorage.setItem('nteli_seed_version', SEED_VERSION)
      localStorage.removeItem('nteli_v8')
      localStorage.removeItem('nteli_events_v5')
    } else {
      const savedAccounts = localStorage.getItem('nteli_v8')
      accts = savedAccounts ? JSON.parse(savedAccounts) : [...SEED_ACCOUNTS, ...SEED_SEMICONDUCTORS].map(a => ({ ...a }))
    }

    accts = accts.map(hydrateAccount)

    // Restore selected product
    const savedProduct = localStorage.getItem('nteli_selected_product') as ProductFilter | null
    if (savedProduct === 'recapture' || savedProduct === 'crm_erp' || savedProduct === 'all') {
      setSelectedProductState(savedProduct)
    }

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
            const hydrated = (ld.accounts as Account[]).map(hydrateAccount)
            setAccountsState(hydrated)
            localStorage.setItem('nteli_v8', JSON.stringify(hydrated))
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
        const dbAccts: Account[] = (d.accounts as Account[]).map(hydrateAccount)
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
        products: account.products || ['recapture'],
      }
      const fitScores = computeAllFitScores(fullAccount)
      fullAccount.fitScores = fitScores
      fullAccount.fitScore340B = fitScores.recapture
      return [...prev, fullAccount]
    })
    return newId
  }, [])

  const selectAccount = useCallback((id: number | null) => setSelectedId(id), [])
  const setSelectedProduct = useCallback((p: ProductFilter) => {
    setSelectedProductState(p)
    localStorage.setItem('nteli_selected_product', p)
  }, [])
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
      accounts, selectedId, selectedProduct, gmailConnected, gmailEmail, dbReady, user,
      setAccounts, updateAccount, selectAccount, setSelectedProduct,
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
