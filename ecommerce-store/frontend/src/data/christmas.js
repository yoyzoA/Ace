// Christmas season settings. The banner, nav link and /christmas page show only
// between `startsOn` and `endsOn` (inclusive). To end the season early, set
// `enabled` to false. Next year, update the dates and the gift list.
export const christmas = {
  enabled: true,
  startsOn: '2026-11-20',
  endsOn: '2027-01-06',
  motto: 'Unwrap something brilliant.',
  intro:
    'Christmas gifts hand-picked at our Batroun store, from stocking stuffers to the big one under the tree.',
  path: '/christmas',
  navLabel: 'Christmas gifts',
  // Shown in the banner. Use products that have a clean photo.
  bannerProductIds: [
    '6a37ee7c3ccba133dd119262', // PlayStation 5 Slim
    '6a37eea63ccba133dd119646', // JBL Flip 6
    '6a37ee423ccba133dd118d1a' // AirPods 4
  ],
  // Recommended gifts. The page groups them by price and hides any that are
  // out of stock or no longer on the website.
  giftIds: [
    // Under $50
    '6a37eea73ccba133dd11965a', // JBL Go 3
    '6a37eea63ccba133dd119655', // JBL Go 2
    '6a37ee953ccba133dd1194b0', // Minecraft (PS5)
    '6a37ee703ccba133dd119149', // Super Mario Bros. Wonder
    '6a37eec83ccba133dd11998e', // Xbox One controller
    '6a37ee2e3ccba133dd118b30', // Fantech Atom63 keyboard
    '69873ec26837f9c37b4555dc', // Meetion MK600M rainbow mechanical keyboard
    '698745106837f9c37b455641', // Meetion GM20 gaming mouse
    '6a37edd83ccba133dd118344', // Blackview AirBuds 13
    '6a37ee943ccba133dd1194a8', // LEGO Star Wars (PS5)
    '6a37edfc3ccba133dd1186a9', // Kingston 128GB flash drive
    '6a37ee4a3ccba133dd118dd0', // Power bank
    // $50 to $150
    '6a37eea63ccba133dd119646', // JBL Flip 6
    '6a37eea63ccba133dd11964b', // JBL Clip 4
    '6a37ee133ccba133dd1188b7', // JBL Tune 520BT
    '6a37ee0e3ccba133dd11883f', // Beats headset PB2
    '6a37ee423ccba133dd118d1a', // AirPods 4
    '6a37ee123ccba133dd1188a4', // HyperX Cloud II
    '6a37ee7d3ccba133dd11927e', // DualSense, cobalt blue
    '6a37ee973ccba133dd1194d4', // Spider-Man 2 (PS5)
    '6a37eec93ccba133dd1199a8', // Xiaomi TV Stick 4K
    '6a37ee023ccba133dd118743', // Green Lion GPS smart watch
    '6a37ee993ccba133dd119506', // PXN V3 Pro racing wheel
    '698742eb6837f9c37b455614', // Meetion RGB lighting towers
    '6a37ee9f3ccba133dd11959f', // Mini projector
    '6a37eeb83ccba133dd11980c', // Blackview kids tablet
    // $150 and up
    '6a37ee7c3ccba133dd119262', // PlayStation 5 Slim
    '6a37eec83ccba133dd119996', // Xbox Series S
    '6a37ee743ccba133dd1191ad', // Nintendo Switch OLED
    '6a37ee743ccba133dd1191a1', // Nintendo Switch Lite
    '6a37ee983ccba133dd1194f0', // PlayStation Portal
    '6a37ee053ccba133dd118781', // Google Home
    '6a37ee4e3ccba133dd118e0f', // Dahua 27" 180Hz gaming monitor
    '6a37eeb93ccba133dd119816', // Blackview Tab 9
    '6a37ee443ccba133dd118d44', // iPad 7
    '6a37eec93ccba133dd1199a3', // Xiaomi Electric Scooter 5
    '695e55680482de50a21e1f9e', // Lenovo LOQ
    // More picks
    '6a37ee743ccba133dd119199', // Joy-Con pair SW020
    '6a37ee6e3ccba133dd11911d', // LEGO 2K Drive (Switch)
    '6a37ee713ccba133dd11915d', // Nintendo Switch Sports
    '6a37ee713ccba133dd119165', // Hot Wheels Unleashed (Switch)
    '6a37ee6f3ccba133dd119131', // LEGO The Incredibles (Switch)
    '6a37ee703ccba133dd119141', // Mario + Rabbids: Sparks of Hope
    '6a37ee703ccba133dd11913d', // Super Mario Odyssey
    '6a37ee923ccba133dd119478', // EA Sports FC 25 (PS5)
    '6a37ee973ccba133dd1194d8', // Spider-Man: Miles Morales (PS5)
    '6a37ee933ccba133dd11948c', // God of War Ragnarok (PS5)
    '6a37ee963ccba133dd1194c8', // Need for Speed Unbound (PS5)
    '6a37ee943ccba133dd119498', // Harry Potter: Quidditch Champions (PS5)
    '6a37ee953ccba133dd1194b8', // Mortal Kombat 1 (PS5)
    '6a37edff3ccba133dd1186ed', // Kingston 64GB microSD
    '6a37ee023ccba133dd11873b', // Green Lion smart glasses
    '6a37ee7e3ccba133dd1192a1', // iPega PS5 stand
    '69873b9c6837f9c37b4555be', // Meetion K9300 rainbow keyboard
    '698744a86837f9c37b45563c', // Meetion GM19 RGB mouse
    '698742426837f9c37b45560a', // Meetion CP3030 cooling pad
    '6a37ee3b3ccba133dd118c76', // Okade 15.6" laptop bag
    '6a37ee0e3ccba133dd118837', // Awei T3 wireless earbuds
    '6a37ee103ccba133dd118873', // Fantech HQ56 headphones
    '6a37ee143ccba133dd1188d0', // Meetion HP020 gaming headset
    '6a37ee553ccba133dd118ebc', // Fortnite mouse pad
    '6a37eea53ccba133dd11963d', // Beats Pill speaker
    '6a37ee313ccba133dd118b81', // Meetion 4-in-1 gaming combo
    '69873d836837f9c37b4555cd', // Meetion MK01 RGB mechanical keyboard
    '6a37ee7c3ccba133dd119276', // DualSense, black
    '6a37ee993ccba133dd11950b', // PXN V9 racing wheel
    '6a37ee143ccba133dd1188c6', // Marshall Monitor headphones
    '6a37ee133ccba133dd1188ad', // JBL Tune 500BT
    '6a37ee043ccba133dd118768', // Xiaomi TV Box S
    '6a37ee0a3ccba133dd1187d2', // Seagate 2TB external drive
    '6a37ee4d3ccba133dd118e0a', // Dahua 24" 144Hz monitor
    '6a37ee733ccba133dd119191', // Nintendo Joy-Con (original)
    '6a37ee7b3ccba133dd11924a', // PlayStation Pulse wireless headset
    '6a37eeb53ccba133dd1197c3', // Fantech gaming desk
    '6a37eeb93ccba133dd119811', // Blackview Mega 2 tablet
    '6a37ee803ccba133dd1192d8', // Logitech G29 racing wheel
    '695e49530482de50a21e1f71' // Lenovo X1 Carbon
  ],
  budgets: [
    { id: 'stocking', title: 'Stocking stuffers', note: 'Under $50', max: 50 },
    { id: 'gifts', title: 'Gifts they will use every day', note: '$50 to $150', max: 150 },
    { id: 'big', title: 'The big one under the tree', note: '$150 and up', max: Infinity }
  ]
};

const today = () => new Date().toISOString().slice(0, 10);

export const isChristmasSeason = () =>
  christmas.enabled && today() >= christmas.startsOn && today() <= christmas.endsOn;
