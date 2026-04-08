import type { BdrEvent } from './types'

// Events relevant to manufacturers with distributor networks in Texas
export const SEED_EVENTS: BdrEvent[] = [
  // ═══ DISTRIBUTION & CHANNEL ═══
  {id:'d1',name:'NAW Executive Summit',dates:'May 14–16, 2026',location:'Dallas, TX (Hilton Anatole)',type:'Conference',category:'conference',why:'National Association of Wholesaler-Distributors. Top event for manufacturer-distributor relationships. Ship & debit, SPAs, and channel pricing are core topics.',relevance:'High',url:'https://www.naw.org',attending:false,notes:'Must attend. Every major distributor exec will be here. Book meetings in advance.'},
  {id:'d2',name:'HARDI Annual Conference',dates:'Dec 5–8, 2026',location:'Dallas, TX (Gaylord Texan)',type:'Conference',category:'conference',why:'Heating, AC & Refrigeration Distributors International. HVAC distributor-manufacturer pricing, ship & debit programs, and co-op funds are hot topics.',relevance:'High',url:'https://hardinet.org',attending:false,notes:'Target Lennox, CSW Industrials contacts. HVAC ship & debit is their #1 pain.'},
  {id:'d3',name:'ISA (Industrial Supply Association) Convention',dates:'Apr 20–22, 2026',location:'Houston, TX (GRB Convention Center)',type:'Trade Show',category:'trade_show',why:'Industrial distributors and their manufacturer partners. SPAs, rebates, and ship & debit workflows are center stage.',relevance:'High',url:'https://www.isapartners.org',attending:false,notes:'Pelican, Enerpac, Forum Energy contacts attend. MRO ship & debit is the universal pain point.'},

  // ═══ ELECTRONICS DISTRIBUTION ═══
  {id:'e1',name:'EDS (Electronic Distribution Show)',dates:'May 19–21, 2026',location:'Las Vegas (attend virtually or fly)',type:'Trade Show',category:'trade_show',why:'Arrow, Avnet, Mouser, Digi-Key all attend. Ship & debit, design-in rebates, and price protection are the core business model.',relevance:'High',url:'https://www.edsc.org',attending:false,notes:'Not in TX but critical. TI, NXP, Vicor all run ship & debit through these distributors.'},
  {id:'e2',name:'ECIA Executive Conference',dates:'Oct 12–14, 2026',location:'Austin, TX (JW Marriott)',type:'Conference',category:'conference',why:'Electronic Components Industry Association. Manufacturer and distributor execs discuss pricing models, SPAs, and ship & debit automation.',relevance:'High',url:'https://www.ecianow.org',attending:false,notes:'Intimate event. Perfect for TI, NXP, Benchmark, Vicor conversations about distributor pricing pain.'},

  // ═══ CHEMICALS & MATERIALS ═══
  {id:'c1',name:'NACD Annual Meeting — Southern Region',dates:'Sep 15–17, 2026',location:'Houston, TX (Hyatt Regency)',type:'Conference',category:'conference',why:'National Association of Chemical Distributors. Manufacturer-distributor pricing, rebates, and ship & debit for chemicals.',relevance:'High',url:'https://www.nacd.com',attending:false,notes:'Huntsman, Kraton, Altivia, Ascend all work with NACD members. Chemical ship & debit is messy.'},
  {id:'c2',name:'IHS Markit World Petrochemical Conference',dates:'Mar 23–25, 2026',location:'Houston, TX (Hilton Americas)',type:'Conference',category:'conference',why:'Pricing and market dynamics for chemical manufacturers. Distributor pricing strategies are a key track.',relevance:'Medium',url:'',attending:false,notes:'Good for Huntsman, Ascend, Altivia. Focus on pricing complexity with distributors.'},

  // ═══ MANUFACTURING / GENERAL ═══
  {id:'m1',name:'OTC 2026 (Offshore Technology Conference)',dates:'May 4–7, 2026',location:'Houston, TX (NRG Park)',type:'Trade Show',category:'trade_show',why:'Massive energy + industrial event. NOV, Forum Energy, Dover all have distributor networks here. Ship & debit is how they sell.',relevance:'High',url:'https://2026.otcnet.org/',attending:false,notes:'Book meetings with NOV and Dover distribution leads. Their ship & debit volume is enormous.'},
  {id:'m2',name:'FABTECH 2026',dates:'Oct 21–23, 2026',location:'Las Vegas, NV (LVCC)',type:'Trade Show',category:'trade_show',why:'Metal fabrication and industrial manufacturing. Many exhibitors sell through distributors with ship & debit programs.',relevance:'Medium',url:'https://www.fabtechexpo.com',attending:false,notes:'Not TX but worth flying to. Host dinner for TX manufacturer distribution leads.'},

  // ═══ AUSTIN / LOCAL ═══
  {id:'a1',name:'Austin Manufacturing Network Meetup',dates:'Monthly · 3rd Thursday',location:'Austin, TX (Capital Factory)',type:'Meetup',category:'meetup',why:'30-50 Austin-area manufacturing and tech leaders. Good for NXP, Flex, Vicor relationship building.',relevance:'Medium',url:'',attending:false,notes:'Low commitment. Show up, meet people, build trust over time.'},
  {id:'a2',name:'InnoTech Austin',dates:'May 12, 2026',location:'Austin, TX (Palmer Events Center)',type:'Conference',category:'conference',why:'Tech leaders including semiconductor and electronics companies. Good for NXP and Flex contacts.',relevance:'Medium',url:'',attending:false,notes:'Tech-focused but good for meeting IT/ops leaders at electronics manufacturers.'},

  // ═══ HOUSTON / LOCAL ═══
  {id:'h1',name:'Houston Industrial Distributors Roundtable',dates:'Quarterly · check HID site',location:'Houston, TX',type:'Meetup',category:'meetup',why:'Intimate gathering of Houston industrial distributor and manufacturer executives. Ship & debit, rebates, and channel strategy are regular topics.',relevance:'High',url:'',attending:false,notes:'Small group, high signal. Perfect for Enerpac, Dover, NOV, Haynes Wire conversations.'},
  {id:'h2',name:'Connected Worker & Smart Manufacturing Summit',dates:'Jun 11–12, 2026',location:'Houston, TX',type:'Conference',category:'conference',why:'VPs, directors, ops leaders from manufacturers. Good for discussing distributor portal and pricing automation.',relevance:'Medium',url:'',attending:false,notes:'Target ops leaders who deal with distributor shipment and debit reconciliation.'},

  // ═══ DALLAS / LOCAL ═══
  {id:'dl1',name:'DFW Manufacturing Alliance',dates:'Bi-monthly · check DFWMA site',location:'Dallas, TX',type:'Meetup',category:'meetup',why:'Dallas-area manufacturer executives. Lennox, CSW Industrials, and Welbilt leaders participate.',relevance:'Medium',url:'',attending:false,notes:'Good for building HVAC and industrial manufacturer relationships in DFW.'},
]
