import type { Contact } from './types'

// Specialty pharma contacts — CFOs, VP Finance, Directors of Contracts & Chargebacks
export const PRE_ENRICHED: Record<string, Contact[]> = {
  'Elite Pharmaceuticals': [
    {name:'Nasrat Hakim',initials:'NH',title:'President & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/nasrat-hakim',location:'Northvale, NJ',source:'clay'},
    {name:'Doug Plassche',initials:'DP',title:'Executive VP Operations',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/doug-plassche',location:'Northvale, NJ',source:'clay'},
    {name:'Carter Ward',initials:'CW',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/carter-ward',location:'Northvale, NJ',source:'clay'},
  ],
  'TAGI Pharma': [
    {name:'Munish Ghai',initials:'MG',title:'President & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/munish-ghai',location:'Lebanon, TN',source:'clay'},
    {name:'Sanjay Verma',initials:'SV',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/sanjay-verma-tagi',location:'Lebanon, TN',source:'clay'},
  ],
  'SunGen Pharma': [
    {name:'Vimal Kavuru',initials:'VK',title:'Chairman',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/vimal-kavuru',location:'Princeton, NJ',source:'clay'},
    {name:'Manish Shah',initials:'MS',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/manish-shah-sungen',location:'Princeton, NJ',source:'clay'},
  ],
  'Bionpharma': [
    {name:'Rafa Andino',initials:'RA',title:'President & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/rafa-andino',location:'Princeton, NJ',source:'clay'},
    {name:'Steve Cutrino',initials:'SC',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/steve-cutrino',location:'Princeton, NJ',source:'clay'},
    {name:'Laura Kelly',initials:'LK',title:'Director, Contracts & Chargebacks',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/laura-kelly-bionpharma',location:'Princeton, NJ',source:'clay'},
  ],
  'Epic Pharma': [
    {name:'Ashok Nigalaye',initials:'AN',title:'Chairman',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ashok-nigalaye',location:'Laurelton, NY',source:'clay'},
    {name:'Rajiv Patel',initials:'RP',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/rajiv-patel-epic',location:'Laurelton, NY',source:'clay'},
  ],
  'Chartwell Pharmaceuticals': [
    {name:'Jonathan Cano',initials:'JC',title:'President',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/jonathan-cano',location:'Congers, NY',source:'clay'},
    {name:'Peter Matarese',initials:'PM',title:'VP Finance',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/peter-matarese',location:'Congers, NY',source:'clay'},
  ],
  'Heritage Pharmaceuticals': [
    {name:'Bhavesh Shah',initials:'BS',title:'President & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/bhavesh-shah-heritage',location:'East Brunswick, NJ',source:'clay'},
    {name:'Anchen Phalgoo',initials:'AP',title:'Chief Financial Officer',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/anchen-phalgoo',location:'East Brunswick, NJ',source:'clay'},
  ],
  'Rising Pharmaceuticals': [
    {name:'Ira Baeringer',initials:'IB',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ira-baeringer',location:'Saddle Brook, NJ',source:'clay'},
    {name:'Dan Marvin',initials:'DM',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/dan-marvin-rising',location:'Saddle Brook, NJ',source:'clay'},
  ],
  'Ascend Laboratories': [
    {name:'Ramesh Singh',initials:'RS',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ramesh-singh-ascend',location:'Montvale, NJ',source:'clay'},
    {name:'Vinay Sharma',initials:'VS',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/vinay-sharma-ascend',location:'Montvale, NJ',source:'clay'},
  ],
  'Aurolife Pharma': [
    {name:'Krishnamohan Narasimhan',initials:'KN',title:'US President',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/krishnamohan-narasimhan',location:'East Windsor, NJ',source:'clay'},
    {name:'Rajesh Kumar',initials:'RK',title:'US CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/rajesh-kumar-aurolife',location:'East Windsor, NJ',source:'clay'},
  ],
  'Zydus Pharmaceuticals US': [
    {name:'Dr. Ganesh Nayak',initials:'GN',title:'US COO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ganesh-nayak-zydus',location:'Pennington, NJ',source:'clay'},
    {name:'Nitin Parekh',initials:'NP',title:'US CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/nitin-parekh-zydus',location:'Pennington, NJ',source:'clay'},
  ],
  'Slayback Pharma': [
    {name:'Ajay Singh',initials:'AS',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ajay-singh-slayback',location:'Princeton, NJ',source:'clay'},
    {name:'Venkat Sharma',initials:'VS',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/venkat-sharma-slayback',location:'Princeton, NJ',source:'clay'},
  ],
  'Tris Pharma': [
    {name:'Ketan Mehta',initials:'KM',title:'President & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ketan-mehta-tris',location:'Monmouth Junction, NJ',source:'clay'},
    {name:'Yatin Mehta',initials:'YM',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/yatin-mehta-tris',location:'Monmouth Junction, NJ',source:'clay'},
  ],
  'Lannett Company': [
    {name:'Tim Crew',initials:'TC',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/tim-crew-lannett',location:'Trevose, PA',source:'clay'},
    {name:'John Kozlowski',initials:'JK',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/john-kozlowski-lannett',location:'Trevose, PA',source:'clay'},
  ],
  'Rhodes Pharmaceuticals': [
    {name:'Craig Landau',initials:'CL',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/craig-landau',location:'Coventry, RI',source:'clay'},
    {name:'Michelle Smith',initials:'MS',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/michelle-smith-rhodes',location:'Coventry, RI',source:'clay'},
  ],
  'Arbor Pharmaceuticals': [
    {name:'Michael Dickinson',initials:'MD',title:'CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/michael-dickinson-arbor',location:'Atlanta, GA',source:'clay'},
    {name:'Brent Lickteig',initials:'BL',title:'CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/brent-lickteig',location:'Atlanta, GA',source:'clay'},
  ],
  'Lehigh Valley Technologies': [
    {name:'Khalid Iqbal',initials:'KI',title:'Founder & CEO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/khalid-iqbal-lvt',location:'Allentown, PA',source:'clay'},
  ],
  'Granules Pharmaceuticals': [
    {name:'Krishna Prasad Chigurupati',initials:'KC',title:'Chairman (Parent)',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/krishna-prasad-chigurupati',location:'India',source:'clay'},
    {name:'Sarat Menon',initials:'SM',title:'US President',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/sarat-menon-granules',location:'Chantilly, VA',source:'clay'},
    {name:'Ajay Agarwal',initials:'AA',title:'US CFO',email:'',emailValid:false,phone:'',linkedin:'linkedin.com/in/ajay-agarwal-granules',location:'Chantilly, VA',source:'clay'},
  ],
}
