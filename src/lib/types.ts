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
}

export interface Signal {
  type: string
  text?: string
  date?: string
}

export type EventCategory = 'trade_show' | 'conference' | 'meetup' | 'coworking' | 'dinner'

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
}
