import type { Contact } from './types'

// Clay-verified contacts — real LinkedIn profiles pulled Apr 2026
// Source: Clay find-and-enrich-contacts-at-company MCP
export const PRE_ENRICHED: Record<string, Contact[]> = {
  'Elite Pharmaceuticals': [
    {name:'Khaled Youssef Mayouf',initials:'KM',title:'Chief Executive Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/khaled-youssef-mayouf-b2674017',location:'Amman, Jordan',source:'clay'},
    {name:'Jeff Whitnell',initials:'JW',title:'Director (CPA)',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/jeffwhitnell',location:'Greater Chicago Area',source:'clay'},
    {name:'Matthew Giles',initials:'MG',title:'Director, QC and AR&D',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/matthew-giles-431669104',location:'Princeton Junction, NJ',source:'clay'},
    {name:'Sharen Sharp',initials:'SS',title:'Director of Regulatory Affairs',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/sharen-sharp-ms-a707854a',location:'Hillsborough, NJ',source:'clay'},
    {name:'Peter Kinkel',initials:'PK',title:'Director, Quality Control',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/peter-kinkel-41433612b',location:'Paterson, NJ',source:'clay'},
  ],
  'Bionpharma': [
    {name:'Praveen Sirikonda',initials:'PS',title:'Sr. Director, Corporate Development',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/praveen-sirikonda-182a6012',location:'Princeton, NJ',source:'clay'},
    {name:'James Haselton',initials:'JH',title:'Associate VP — Sales',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/james-haselton-30333778',location:'Jersey City, NJ',source:'clay'},
    {name:'Varun Manikyarao',initials:'VM',title:'Director, Supply Chain Management',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/varun-manikyarao-58931638',location:'Saddle Brook, NJ',source:'clay'},
    {name:'Bob H.',initials:'BH',title:'VP — Sales & Operations',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/mjbr3333',location:'United States',source:'clay'},
    {name:'Jerri Lubke',initials:'JL',title:'Director, Sales Operations',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/jerri-lubke-21a64a12',location:'Raleigh, NC',source:'clay'},
  ],
  'TAGI Pharma': [
    {name:'Kenny Harrington',initials:'KH',title:'VP Sales & Marketing',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/kenny-harrington-540a7348',location:'United States',source:'clay'},
  ],
  'Heritage Pharmaceuticals': [
    {name:'Adele Templeton',initials:'AT',title:'Director of Strategic Partnerships',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/adele-templeton-b2893a340',location:'United States',source:'clay'},
  ],
  'Lannett Company': [
    {name:'Tony Meehan',initials:'TM',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/tony-meehan-b696951',location:'Greater Philadelphia',source:'clay'},
    {name:'John Abt, DBA',initials:'JA',title:'Chief Operating & Quality Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/john-abt-dba-4016598',location:'Ambler, PA',source:'clay'},
    {name:'Freddy Rosado',initials:'FR',title:'Director, Pricing and Contracts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/freddy-rosado-41816b4',location:'Greater Philadelphia',source:'clay'},
    {name:'Tracy Sullivan',initials:'TS',title:'Senior Director, National Accounts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/tracydivalerio',location:'Greater Philadelphia',source:'clay'},
    {name:'Thomas Lewis',initials:'TL',title:'VP, Global Supply Chain and CDMO Management',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/thomas-lewis-08a093ba',location:'Seymour, IN',source:'clay'},
  ],
  'Ascend Laboratories': [
    {name:'James Giuliano',initials:'JG',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/james-giuliano-17274b3',location:'Whitehouse Station, NJ',source:'clay'},
    {name:'Beth Hamilton',initials:'BH',title:'VP National Accounts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/beth-hamilton-1682b69',location:'Palm Coast, FL',source:'clay'},
    {name:'Greg Watkins',initials:'GW',title:'VP National Accounts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/greg-watkins-b092bb43',location:'Scottsdale, AZ',source:'clay'},
    {name:'Grant Butler',initials:'GB',title:'VP National Accounts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/grant-butler-0771b91a',location:'Fort Lauderdale, FL',source:'clay'},
    {name:'Timothy Keane',initials:'TK',title:'Financial Director',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/timothykeane1',location:'United States',source:'clay'},
  ],
  'Tris Pharma': [
    {name:'Ketan Mehta',initials:'KM',title:'Founder & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ketanmehta',location:'New York Metro',source:'clay'},
    {name:'Peter Ciano',initials:'PC',title:'CFO & SVP Corporate Development',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/peter-ciano-73773b7',location:'Westfield, NJ',source:'clay'},
    {name:'Franchesca M. Fowler',initials:'FF',title:'General Counsel, SVP & Chief Compliance Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/franchesca-m-fowler40457547',location:'Lebanon, NJ',source:'clay'},
    {name:'Saumya Mehta',initials:'SM',title:'Senior Director, Business Development',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/saumya-mehta-6a854244',location:'New York, NY',source:'clay'},
    {name:'Patricia Loughlin',initials:'PL',title:'Director, National Accounts',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/patricia-loughlin-080320a',location:'Minneapolis, MN',source:'clay'},
    {name:'Dana Zelig',initials:'DZ',title:'Director, Market Access Operations',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/danazelig',location:'New York, NY',source:'clay'},
  ],
}
