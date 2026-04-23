export interface Contact {
  name: string
  initials: string
  title: string
  email: string
  emailValid: boolean
  phone: string
  linkedin: string
  location?: string
  source?: string
  simulated?: boolean
}

export interface FollowUp {
  day: number
  status: 'pending' | 'ready' | 'sent' | 'opened' | 'replied'
  subject: string
  body: string
  sentAt: string | null
  emailId?: string
  threadId?: string
}

export interface Meeting {
  id: string
  event: string
  contact: string
  contactEmail: string
  contactTitle: string
  notes: string
  date: string
  followUps: FollowUp[]
}

export type Stage =
  | 'Prospect'
  | 'Connected'
  | 'Met'
  | 'Following Up'
  | 'Engaged'
  | 'Meeting'
  | 'Proposal'
  | 'Won'
  | 'Lost'

export interface StageChange {
  stage: Stage
  date: string
  note?: string
}

export interface Account {
  id: number
  company: string
  city: string
  market: string
  vertical: string
  rev: string
  emp: string
  priority: 'High' | 'Medium' | 'Low'
  pe: boolean
  ownership: string
  pains: string[]
  cxo: string
  website: string
  liSearch: string
  stage: Stage
  source: string
  contacted: boolean
  signals: Signal[]
  contacts?: Contact[]
  contactsDate?: string
  contactsSource?: string
  meetings?: Meeting[]
  explorium_id?: string
  testContact?: { name: string; email: string; title: string }
  stageHistory?: StageChange[]
  notes?: string
}

export type SignalType =
  | 'new_product'            // ANDA approval / drug launch
  | 'new_funding_round'      // Capital raise
  | 'merger_and_acquisitions'// PE deal, acquisition, integration
  | 'ipo_announcement'
  | 'lawsuits_and_legal_issues' // Patent fight, FDA issue
  | 'hiring_in_finance_department' // New CFO/Controller
  | 'new_executive'          // Generic senior hire
  | 'other'

export interface Signal {
  type: SignalType
  title: string
  date: string       // ISO date
  link?: string
  snippet?: string
}

export type EventCategory = 'trade_show' | 'conference' | 'meetup' | 'coworking' | 'dinner'

export interface EventTag {
  accountId: number
  contactName: string
}

export interface BdrEvent {
  id: string
  name: string
  dates: string
  location: string
  type: string
  category: EventCategory
  why: string
  relevance: 'High' | 'Medium' | 'Low'
  url: string
  attending: boolean
  notes: string
  eventTags?: EventTag[]
}
