// Sněhový Dealer – verze 5.23
"use strict";

/* =====================================================================
   KONSTANTY A DATA
   ===================================================================== */
const VERSION = "5.23";
const BUILD = "2026-10-14.8";   // musí sedět s <meta name="build"> v index.html (hlídá nesoulad souborů)
const SAVE_KEY = "snowDealer.save.v5";
const ACH_KEY = "snowDealer.achievements.v5";

const GOAL_MONEY = 1000000;   // výhra: tolik Kč v hotovosti
const RENT_BASE = 12000;      // nájem v prvních dvou měsících
const RENT_STEP = 2000;       // o kolik nájem vzroste, a to jen každé 2 měsíce
const RENT_MAX = 40000;
const MAX_RAIDS = 2;          // druhý zátah = vězení
const NEGATIVE_PROB = 0.5;

const weekDays = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
// Poloha čtvrtí na mapě (zhruba v km, sever je nahoře). Doba cesty se počítá z aktuální polohy.
const districts = {
  "Dejvice": { x: -3.6, y: 3.3, side: "left" },       // severozápad
  "Letná": { x: -0.9, y: 2.5, side: "left" },         // hned vedle Holešovic, za řekou
  "Holešovice": { x: 0.8, y: 3.5, side: "right" },    // sever, ve smyčce Vltavy
  "Karlín": { x: 2.0, y: 1.8, side: "right" },        // severovýchod od centra
  "Žižkov": { x: 2.9, y: -0.1, side: "right" },        // východ
  "Vinohrady": { x: 3.1, y: -1.8, side: "right" },    // jihovýchod
  "Smíchov": { x: -1.7, y: -2.3, side: "left" },      // jihozápad, za řekou
  "Modřany": { x: 0.9, y: -7.2, side: "right" },      // daleko na jihu
  // čtvrti, které si můžeš odemknout (kontakty ve čtvrti)
  "Libeň": { x: 3.2, y: 4.8, side: "right" },
  "Vršovice": { x: 3.9, y: -3.6, side: "right" },
  "Břevnov": { x: -4.0, y: 1.0, side: "left" },
  "Nusle": { x: 1.3, y: -3.7, side: "left" }
};
const BASE_DISTRICTS = ["Dejvice", "Letná", "Holešovice", "Karlín", "Žižkov", "Vinohrady", "Smíchov", "Modřany"];
const EXTRA_DISTRICTS = { "Libeň": 60000, "Vršovice": 90000, "Břevnov": 120000, "Nusle": 150000 };   // cena odemčení
const HOME = { x: 0.3, y: 0.2 };       // tvůj byt blízko centra, odkud vyrážíš
const STREET_FACTOR = 1.25;            // ulice nejsou vzdušnou čarou
const HANDOVER_H = 0.17;               // předání ve stejné čtvrti = 10 minut
const districtCustomers = {
  "Žižkov": ["@zizman", "@needhelpdycky", "@VojtikPupik", "@parkovej", "@cmoud",
    "@televizni_vez_fan", "@pivni_pavel", "@bobo_z_parku", "@kebab_kral", "@zizkov_ekzem", "@hospoda_hugo"],
  "Vinohrady": ["@vinoqueen", "@prosecco_bae", "@panvino", "@mimiblog", "@Tom Zfoutera",
    "@flatwhite_lucie", "@pilates_pavlina", "@vegan_vendy", "@naplavka_nikol", "@yoga_ivo", "@oat_latte_olga"],
  "Karlín": ["@startuplord", "@devonacid", "@panblazer", "@karlincooler", "@scrummasterka",
    "@agile_ales", "@kanban_karel", "@burnout_bara", "@oatmilk_ondra", "@standup_stanley", "@meeting_marcel"],
  "Holešovice": ["@skaterh", "@MartinKocian14", "@techbro", "@holeboy", "@mina1337",
    "@trznice_tomas", "@dj_halovka", "@streetart_sam", "@pivovar_pepa", "@vltavska_vlad", "@vinyl_viki"],
  "Smíchov": ["@$PRYNC", "@lidltrader", "@tramvajguy", "@deckadaddy", "@babickaG.",
    "@andel_andy", "@nakupak_nora", "@kino_palace_pete", "@smichov_sasa", "@vodafone_vlasta", "@bilbord_bohous"],
  "Dejvice": ["@diplomatson", "@sugar-denny", "@MatroDaVinci", "@ambasadorcz", "@highclassh",
    "@docent_dobrota", "@prednaska_petr", "@vila_viktor", "@ambasada_alex", "@cvut_cenek", "@kolej_kuba"],
  "Letná": ["@letnapivo", "@Metr Párna", "@Hajzlberg", "@letna_influ", "@dogsitterka",
    "@letenska_lenka", "@sparta_fanda", "@hipster_hugo", "@metronom_mara", "@pivni_zahradka", "@kocarek_kamil"],
  "Modřany": ["@modranboy", "@vlakfetak", "@kralpanelaku", "@cyklosnek", "@kajakboss",
    "@panelak_pavel", "@rybar_rosta", "@bazen_bobo", "@tramvaj_17_tomas", "@vyhlidka_vilda", "@zahradkar_zdenek"],
  "Libeň": ["@libensky_most_milan", "@dopravak_dan", "@kulturak_karel", "@fotbal_filip", "@pivnice_pepik", "@spalovna_sasa",
    "@kraska_katka", "@trojsky_tomas", "@sidlisko_stan", "@taborak_ted", "@o2_arena_olda"],
  "Vršovice": ["@eden_edvard", "@slavia_sasa", "@kavarna_klara", "@ruzova_vila_ruda", "@sousedka_sona", "@vrsovicak_vasek",
    "@stadion_standa", "@kocar_karla", "@bohemka_boris", "@zahrada_zdena", "@tramvaj_6_tonda"],
  "Břevnov": ["@klaster_kuba", "@pivovar_petr", "@vila_vojta", "@motol_monika", "@bila_hora_hynek", "@strahov_stepan",
    "@dobrovic_dana", "@brevnovska_bara", "@hriste_honza", "@zeleny_zdenek", "@sparta_sasa_b"],
  "Nusle": ["@nuselak_nick", "@most_michal", "@pankrac_pavel", "@kongres_karolina", "@bytak_boris", "@nuselske_schody_sam",
    "@pivnice_pavla", "@lekarnik_lubos", "@tramvaj_11_tom", "@zumba_zita", "@budova_bruno"]
};
const districtNames = BASE_DISTRICTS.slice();   // aktivní čtvrti; viz syncDistricts()
function syncDistricts() {
  districtNames.length = 0;
  districtNames.push(...BASE_DISTRICTS, ...Object.keys(EXTRA_DISTRICTS).filter(d => S && S.unlocked && S.unlocked.includes(d)));
}

// Základní ceny pro zákaznické objednávky (1–5 g)
const customerBasePrices = { 1: 3000, 2: 5000, 3: 6500, 4: 8000, 5: 9500 };

// speed  = rychlost přesunu po městě (km za herní hodinu)
// pop    = jednorázový bonus popularity při koupi
// heat   = násobek pozornosti policie při doručení (nápadné auto = víc heatu)
// upkeep = denní provoz (palivo, servis). Bez peněz auto stojí a jedeš MHD
const CARS = [
  { name: "🚋 Tramvaj", price: 0, speed: 3.4, pop: 0, heat: 0.8, upkeep: 0, note: "nenápadná, ale pomalá" },
  { name: "🛵 Yamaha Aerox", price: 40000, speed: 4.6, pop: 0.1, heat: 0.9, upkeep: 100, note: "ojetý skútr, skoro nenápadný" },
  { name: "🚗 Golf 2001 1.9TDI", price: 60000, speed: 6, pop: 0.2, heat: 1, upkeep: 250, note: "ojetá, pracovní kůň" },
  { name: "🚙 BMW 330D", price: 220000, speed: 7.6, pop: 0.4, heat: 1.15, upkeep: 500, note: "ojeté, rychlé, ale už se na něj kouká" },
  { name: "🚙 Škoda Octavia RS", price: 600000, speed: 8.2, pop: 0.5, heat: 1.2, upkeep: 700, note: "ojetá, rodinné kombi, které umí" },
  { name: "🚘 Audi RS6 Avant", price: 1600000, speed: 8.9, pop: 0.65, heat: 1.3, upkeep: 1600, note: "ojeté, dodávka se sportovním srdcem" },
  { name: "🏎️ BMW M4", price: 2200000, speed: 9.5, pop: 0.75, heat: 1.4, upkeep: 1800, note: "nový, nejrychlejší a nejviditelnější" }
];
const carByName = name => CARS.find(c => c.name === name) || CARS[0];

const policeLevels = ["Neznámý", "Známý", "Sledovaný", "Hledaný"];

const SUPPLIERS = {
  "Sněžák": { mult: 0.85, scam: 0.20, note: "levný, ale 1 z 5 tě ošidí" },
  "Mráz": { mult: 1.00, scam: 0.05, note: "standard" },
  "Frozone": { mult: 1.10, scam: 0, note: "dražší, ale spolehlivý" },
  "Ledovec": { mult: 0.95, scam: 0.10, note: "výhodný pro větší zásilky (50 g+)" },
  "Chladič": { mult: 1.05, scam: 0.02, note: "skoro spolehlivý" }
};
// základ ~1 500 Kč za gram, větší zásilky o něco levněji; dodavatel a týdenní trh to posunou ±10 %.
// Nabízí se jen to, co se vejde do tvé kapacity stashe, a čím větší zázemí, tím větší zásilky (pro pozdní hru).
const SUPPLY_OPTIONS = [
  { grams: 5, basePrice: 7500 },
  { grams: 10, basePrice: 15000 },
  { grams: 20, basePrice: 29000 },
  { grams: 50, basePrice: 72500 },
  { grams: 100, basePrice: 140000 },
  { grams: 200, basePrice: 270000 },
  { grams: 300, basePrice: 396000 },
  { grams: 500, basePrice: 650000 }
];

const CAPACITY = [
  { name: "Batoh", cap: 20, price: 0 },
  { name: "Skrýš v bytě", cap: 50, price: 15000 },
  { name: "Garáž", cap: 150, price: 60000 },
  { name: "Sklad", cap: 500, price: 200000 }
];
const RUNNERS = [
  { price: 30000, upkeep: 500 },
  { price: 80000, upkeep: 1200 }
];
const LAWYER_PRICE = 40000;
// Policejní kontakty: pasivně snižují heat ve všech čtvrtích každý den, za denní provoz (místo pořád dokola kupovat SIM)
const CONTACTS = [
  { name: "Informátor na služebně", price: 60000, upkeep: 1500, cool: 0.15 },
  { name: "Důstojník na zakázku", price: 150000, upkeep: 3500, cool: 0.30 },
  { name: "Náměstek policejního ředitele", price: 400000, upkeep: 8000, cool: 0.50 }
];
// Prodejci: sami vyřizují poptávky ve své čtvrti (z tvého stashe), ale přidávají heat.
// Žádná pevná výplata: prodejce si bere 15 % z ceny objednávky (ty dostaneš 85 %).
// První prodejce stojí 100 000 Kč, každý další o 50 000 Kč víc (podle toho, kolik prodejců právě máš).
const DEALER = { hire: 100000, hireStep: 50000, heatPerG: 0.05, share: 0.85 };
const dealerHireCost = () => DEALER.hire + DEALER.hireStep * Object.keys(S.dealers).length;
// Kapacita: kolik poptávek denně prodejce vyřídí (základ 1 + 1,2 × popularita čtvrti, upgrade přidá pevný počet)
const DEALER_CAP_LVLS = [
  { cost: 50000, add: 2 }, { cost: 120000, add: 4 }, { cost: 300000, add: 7 }, { cost: 700000, add: 10 }
];
const poptavek = n => (n === 1 ? "poptávku" : n >= 2 && n <= 4 ? "poptávky" : "poptávek");   // 1 poptávku, 2 poptávky, 5 poptávek
const dealerBase = d => 1 + Math.floor(S.pop[d] * 1.2);
const dealerOffers = (d, dd) => dealerBase(d) + (dd.cap ? DEALER_CAP_LVLS[dd.cap - 1].add : 0);
// poptávky ze čtvrti s prodejcem vyřídí sám (do denní kapacity); tobě zůstane DEALER.share ceny, bonus za cenu to zvedá
const DEALER_REPLIES = [
  "beru to, šéfe, už jedu", "mám to pod kontrolou, ty si odpočiň", "klid, tohle je moje čtvrť, řeším",
  "jasný, doručím, už se to veze", "jdu na to, ozvu se po předání", "máš to, za chvíli je to hotový",
  "šéfe, tohle zvládnu sám, hotovo do hodinky"
];
// Vylepšení každého prodejce zvlášť: lepší cena za gram a opatrnost (méně heatu a menší šance na zatčení)
const DEALER_PRICE_LVLS = [
  { cost: 40000, bonus: 0.15 }, { cost: 80000, bonus: 0.30 }, { cost: 150000, bonus: 0.50 }
];
const DEALER_STEALTH_LVLS = [
  { cost: 40000, heat: 0.75, arrest: 0.07 }, { cost: 90000, heat: 0.50, arrest: 0.04 }, { cost: 180000, heat: 0.30, arrest: 0.02 }
];
// Bezpečný režim: prodejci se stáhnou, když je ve čtvrti policie nad touto hranicí (heat 3,5 = zátah)
const DEALER_SAFETY = [
  { label: "vypnuto", heat: null },
  { label: "při 70 % policie", heat: 2.45 },
  { label: "při 85 % policie", heat: 2.975 }
];

const ACHIEVEMENTS = {
  first: { name: "První kontakt", desc: "Doruč první objednávku" },
  regular: { name: "Stálice", desc: "Získej zákazníka s plnou věrností" },
  star: { name: "Hvězda čtvrti", desc: "Popularita 2+ v některé čtvrti" },
  raid: { name: "Přežil jsem zátah", desc: "Přežij policejní zátah" },
  month: { name: "Měsíc v Praze", desc: "Zaplať první nájem" },
  m4: { name: "Rychlý jako blesk", desc: "Kup BMW M4" },
  rich: { name: "Milionář", desc: "Vyhraj hru" }
};

const telegramMessages = [
  "🟢 Tenhle týpek dává bomby!",
  "🟢 Doručení 10/10, doporučím chábrům.",
  "🟢 Tenhle týpek má top kvalitu od Escobara.",
  "🟢 Včera bomba, dneska znova!",
  "🟢 To je MRDA!",
  "🟢 PIČO TO MĚ VYSTŘELILO JAK PRAK",
  "🟢 TY DEBILE :D JEBA",
  "🟢 Dealer roku, 5/5!",
  "🟢 Legendární úroveň služby.",
  "🟢 kéž by všechny služby fungovali takhle..",
  "🟢 I moje máma by od něj brala.",
  "🟢 Dorazil i když pršelo, to cením.",
  "🟢 Díky za rychlost, kámo.",
  "🟢 Objednávám denně!",
  "🟢 Prostě racing!",
  "🔴 Poslal mě do hajzlu, zklamání...",
  "🔴 Čekal jsem, ale neodepsal.",
  "🔴 Vysral se na mě a musel jsem jít spát v 10 jak šašek",
  "🔴 Nedodal, seru na to.",
  "🔴 Šašek",
  "🔴 Sergei z Wishe",
  "🔴 Hraje si na ballera, ale nedodá.",
  "🔴 Neodepsal stejně má jenom Pikain",
  "🔴 Je to jen hype, ve skutečnosti nic."
];

const randomCustomerMessages = [
  "čau, jak se máš, nepůjdeme někam?",
  "Už jsem ti někdy řekl, že jsi fakt dobrej kámoš?",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "Vozíš i půlky?",
  "Sry, špatný číslo",
  "Nabalil jsem včera ve studiu hodně nabitou roštěnku, za 2 ti jí přenechám",
  "VČERA TO BYLO MEGA",
  "Kolega z práce, prej od tebe taky bere :D",
  "Jdu do Atíku, budeš mít čas kolem 7? Ráno?",
  "Hm, tak jsem bez papíru, bro, včera jsem lízl opiáty",
  "Nevíš o někom, kdo by uměl zařídit kouli?",
  "Si zvanej na moje narozky, bro",
  "ahoj, tady Honza z minule. ne, nejsem Honza, spatny cislo, ale ty ses mi libil",
  "mas tip na dobrou pizzu v okoli? nejde o pizzu, jen se ptam",
  "bro videl jsem dneska holuba co mel lepsi bundu nez ja",
  "potkal jsem tvoji tramvaj. pozdravila me",
  "co delas? ja nic a jde mi to skvele",
  "nechces jit zitra na raftovani? ptam se vsech v kontaktech",
  "prosim te nauc me jak se rika ne sefovi na porade",
  "poslal jsem ti omylem fotku mojeho psa. je to dobrej pes.",
  "ty ses ten co ma ten telefon s prasklym displejem? to ne ja jsem to byl. nebo ty?",
  "dneska jsem poprve v zivote zaplatil kartou za kebab a cejtim se jako CEO",
  "hele mas nabijecku na iphone? nepotrebuju ji, jen kamosi",
  "zitra rano mam pohovor, drz mi palce. nebo aspon palec",
  "klidne mi nepis, ja si jen povidam sam se sebou, ale diky ze ctes",
  "co se stalo s nasim kamosem Pavlem? je nekde na Slovensku a prodava hrnky",
  "v kolik zavira Billa? nebo uz jsem tam byl?",
  "bro, rekli mi ze jsem moc mluvil na schuzce. koho mam obvinit, kafe?",
  "prisel jsem na to ze v pondeli se nerika dobry den, ale nejak to dopadne",
  "mam novou frizuru, nikdo si ji nevsiml. pises mi ze je dobra? diky.",
  "naucil jsem se rozlisit tramvaj 22 od tramvaje 9, jsem vlastne spojar",
  "mel bych dotaz, ale uz si nepamatuju jaky. mozna otazka byla jak se mas",
  "dneska jsem se 3x ztratil v metru a dvakrat v obchaku, pomaha ti nekdy gps?",
  "vsiml sis ze ahoj je vlastne zkraceny ahojte? dovolil jsem si to zkontrolovat"
];

/* =====================================================================
   POMOCNÉ FUNKCE
   ===================================================================== */
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const round2 = v => Math.round(v * 100) / 100;
const fmt = n => Math.round(n).toLocaleString("cs-CZ");
const fmtH = h => String(round2(h));

function weightedRandomChoice(choices) {
  const r = Math.random();
  let sum = 0;
  for (const c of choices) {
    sum += c.weight;
    if (r < sum) return c.value;
  }
  return choices[choices.length - 1].value;
}

/* =====================================================================
   STAV HRY (S se ukládá do localStorage)
   ===================================================================== */
let S = null;
let offerTimers = [];
let eventTimer = null;
let eventsPending = 0;   // dnešní eventy, které ještě nejsou vyřešené
let musicEnabled = false;
let flashTimer = null;

function newState() {
  const s = {
    day: 1, supply: 5, money: 5000, timeLeft: 5, car: CARS[0].name,
    over: false, won: false, endless: false,
    capLevel: 0, lawyer: false, runners: 0,
    strikes: 0, lastStrikeDay: 0, debt: 0,
    lastHaircutDay: null, secUsed: false, carDown: false,
    lastEventDay: 0, lastQuickDay: 0, recentEvents: [],
    loc: "home", offered: {}, boughtToday: false,
    contact: 0, dealers: {}, dealerSafety: 2, dealerSold: {}, dealerCount: {}, unlocked: [], vipToday: 0,
    market: 1, supplierOffers: [], pending: [], seq: 0,
    pop: {}, police: {}, warned: {}, idle: {}, freq: {},
    accepted: {}, loyalty: {}, usedToday: [], salesToday: false,
    today: { delivered: 0, grams: 0, startMoney: 5000 },
    stats: { delivered: 0, grams: 0, earned: 0, raids: 0, peak: 0 },   // peak = nejvyšší hotovost u sebe (žebříček)
    runId: genCode(), sent: {},   // id hry pro žebříček a příznaky, co už bylo odesláno
    popScale: 5                   // popularita je na stupnici 0–5 (uložení do verze 5.21 měla 0–10)
  };
  BASE_DISTRICTS.forEach(d => {
    s.pop[d] = 0; s.police[d] = 0; s.warned[d] = 0; s.idle[d] = 0; s.freq[d] = 0;
  });
  return s;
}
// uložená hra → stav; starší uložení s popularitou 0–10 se přepočítá na 0–5
function fromSave(s) {
  if (!s.popScale && s.pop) Object.keys(s.pop).forEach(d => { s.pop[d] = Math.min(5, s.pop[d] / 2); });
  return Object.assign(newState(), s);
}

const cap = () => CAPACITY[S.capLevel].cap;
// auto, které právě opravdu jede (bez peněz na provoz stojí a jedeš MHD)
const effCar = () => (S.carDown ? CARS[0] : carByName(S.car));
const runnerUpkeep = () => RUNNERS.slice(0, S.runners).reduce((a, r) => a + r.upkeep, 0);
// nájem roste jen každé 2 měsíce: měsíc 1–2 = základ, 3–4 = +2 000 Kč, …
const rentFor = day => Math.min(RENT_MAX, RENT_BASE + Math.floor((Math.floor(day / 30) - 1) / 2) * RENT_STEP);

// doba cesty z místa `from` ("home" nebo čtvrť) do čtvrti `to`; ve stejné čtvrti jen předání (10 min)
function travelTime(from, to) {
  if (from === to) return HANDOVER_H;
  const a = from === "home" ? HOME : districts[from];
  const b = districts[to];
  const km = Math.hypot(a.x - b.x, a.y - b.y) * STREET_FACTOR;
  return round2(HANDOVER_H + km / effCar().speed);
}

// Směna: pracuješ od 20:00 do 01:00 (5 h). Kurýr směnu prodlouží o hodinu.
// S.timeLeft jsou zbývající hodiny směny, z toho se odvozují hodiny na displeji.
const SHIFT_START_H = 20;
const SHIFT_BASE_H = 5;
const shiftLen = () => SHIFT_BASE_H + (S ? S.runners : 0);
function clockOf(hoursFromStart) {
  const total = Math.round((SHIFT_START_H + hoursFromStart) * 60) % (24 * 60);
  return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}
const clockAt = (offsetH = 0) => clockOf(shiftLen() - S.timeLeft + offsetH);   // teď (+ offset)
const shiftEndClock = () => clockOf(shiftLen());

// jak dlouho trvá doba cesty v čitelné podobě: "10 min", "1 h 20 min"
function fmtDur(h) {
  const m = Math.max(1, Math.round(h * 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}`;
}
const dayName = day => weekDays[(day - 1) % 7];

function saveLocal() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage nemusí být dostupné */ }
}
function saveGame() {
  saveLocal();
  cloudPush();   // záloha v cloudu (jen když má hráč kód uložení)
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.day !== "number" || s.over) return null;
    return fromSave(s);
  } catch (e) { return null; }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* nic */ }
}

/* Achievementy se ukládají mimo hru, přežijí restart */
let unlocked = new Set();
try { unlocked = new Set(JSON.parse(localStorage.getItem(ACH_KEY) || "[]")); } catch (e) { /* nic */ }
function unlock(id) {
  if (unlocked.has(id) || !ACHIEVEMENTS[id]) return;
  unlocked.add(id);
  try { localStorage.setItem(ACH_KEY, JSON.stringify([...unlocked])); } catch (e) { /* nic */ }
  logImportantMessage(`🏆 Achievement: ${ACHIEVEMENTS[id].name} – ${ACHIEVEMENTS[id].desc}`);
}

/* =====================================================================
   UI – LOG, ZVUKY
   ===================================================================== */
function playSound(id) {
  const audio = $(id);
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* zvuk není kritický */ }
}

function stopSound(id) {
  const audio = $(id);
  if (!audio) return;
  try { audio.pause(); audio.currentTime = 0; } catch (e) { /* nic */ }
}

// --- chat ve stylu Telegramu: bubliny zákazníků, tvoje odpovědi, systémové hlášky ---
// Text se „píše“ po písmenkách, ale celý je od začátku v bublině (průhledný), takže se rozložení
// nemění a tlačítka pod bublinou nikam neujíždějí.
function typeInto(el, text, speed = 15) {
  el.textContent = "";
  const typed = document.createElement("span");
  const ghost = document.createElement("span");
  ghost.className = "ghost";
  ghost.textContent = text;
  el.append(typed, ghost);
  let i = 0;
  (function step() {
    if (!el.isConnected || i >= text.length) return;
    i++;
    typed.textContent = text.slice(0, i);
    ghost.textContent = text.slice(i);
    setTimeout(step, speed);
  })();
}

// Chat se NIKDY sám neposouvá, když přijde nová zpráva (jinak bys kliknul na jinou nabídku, než chceš).
// Když je dole něco nového, objeví se šipka „↓“ s počtem nových zpráv.
let unreadCount = 0;
const chatGap = () => {
  const l = $("gameLog");
  return l.scrollHeight - l.scrollTop - l.clientHeight;
};

function updateScrollBtn() {
  const btn = $("scrollDown");
  if (!btn) return;
  const away = chatGap() > 50;
  if (!away) unreadCount = 0;
  btn.style.display = away ? "" : "none";
  $("unreadCount").textContent = unreadCount ? String(unreadCount) : "";
}

// tlačítko „↓“ a nový den (log se vyprázdní)
function scrollChat() {
  const l = $("gameLog");
  l.scrollTo({ top: l.scrollHeight, behavior: "smooth" });
}

// Pokud je nastavená kotva (zpráva, na kterou právě odpovídáš), nové zprávy se řadí hned pod ni,
// takže tvoje odpověď a výsledek stojí přímo pod danou poptávkou.
let chatAnchor = null;

function withAnchor(el, fn) {
  const prev = chatAnchor;
  chatAnchor = el;
  try { return fn(); } finally { chatAnchor = prev; }
}

function chatAppend(el) {
  const log = $("gameLog");
  if (chatAnchor && chatAnchor.parentNode === log) {
    chatAnchor.after(el);
    chatAnchor = el;
  } else {
    log.appendChild(el);
  }
  if (el.classList.contains("msg") && el.classList.contains("in") && chatGap() > 50) unreadCount++;
  updateScrollBtn();
  return el;
}
const clockNow = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};

function nickColor(nick) {
  let h = 0;
  for (const ch of nick) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 58% 55%)`;
}
function nickInitial(nick) {
  const m = nick.replace(/^@/, "").replace(/[^A-Za-zÀ-ž0-9]/g, "");
  return (m[0] || "?").toUpperCase();
}

// příchozí bublina s avatarem; vrací části, aby šlo doplnit objednávku a klávesnici
function incomingBubble(nick, district, avatarText) {
  const color = nickColor(nick);
  const row = document.createElement("div");
  row.className = "msg in";
  const av = document.createElement("div");
  av.className = "avatar";
  av.style.setProperty("--c", color);
  av.textContent = avatarText || nickInitial(nick);
  const col = document.createElement("div");
  col.className = "msg-col";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const name = document.createElement("div");
  name.className = "bubble-name";
  name.style.color = color;
  name.textContent = nick;
  if (district) {
    const where = document.createElement("span");
    where.className = "where";
    where.textContent = `📍 ${district}`;
    name.appendChild(where);
  }
  const text = document.createElement("div");
  text.className = "bubble-text";
  const time = document.createElement("div");
  time.className = "bubble-time";
  time.textContent = clockNow();
  bubble.append(name, text, time);
  col.appendChild(bubble);
  row.append(av, col);
  return { row, col, bubble, text, time };
}

// obyčejná zpráva od zákazníka (bez objednávky)
function customerBubble(nick, district, text) {
  const b = incomingBubble(nick, district);
  chatAppend(b.row);
  typeInto(b.text, text);
  return b;
}

// tvoje odpověď (modrá bublina vpravo); quote = {nick, text} je citace zprávy, na kterou odpovídáš
function playerBubble(text, quote, label) {
  const row = document.createElement("div");
  row.className = "msg out";
  const col = document.createElement("div");
  col.className = "msg-col";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (label) {
    const who = document.createElement("div");
    who.className = "bubble-name";
    who.style.color = "#ffd48a";
    who.textContent = label;
    bubble.appendChild(who);
  }
  if (quote) {
    const q = document.createElement("div");
    q.className = "quote";
    const qn = document.createElement("b");
    qn.textContent = quote.nick;
    const qt = document.createElement("span");
    qt.textContent = quote.text.length > 70 ? quote.text.slice(0, 70) + "…" : quote.text;
    q.append(qn, qt);
    bubble.appendChild(q);
  }
  const t = document.createElement("div");
  t.className = "bubble-text";
  t.textContent = text;
  const time = document.createElement("div");
  time.className = "bubble-time";
  time.textContent = clockNow() + " ✓✓";
  bubble.append(t, time);
  col.appendChild(bubble);
  row.appendChild(col);
  return chatAppend(row);
}

// systémová hláška uprostřed chatu; barva podle toho, jak dopadla
function sysMessage(msg, extra = "") {
  const d = document.createElement("div");
  const tone = /^(✅|💰|🎉|🏆|🎁|🤝|😎|💈|📦)/.test(msg) ? "good"
    : /^(❌|⚠️|🚨|😡|🚓|🚔|💀|😱|🤡|😤|🔧|🥶)/.test(msg) ? "bad" : "";
  d.className = ("sys " + tone + " " + extra).trim();
  d.textContent = msg;
  return chatAppend(d);
}

function logMessage(msg) {
  sysMessage(msg, msg.startsWith("📆") ? "day" : "");
}

function logImportantMessage(msg) {
  sysMessage(msg, "important");
}

const ACCEPT_REPLIES = [
  "jasně, jedu", "bude, za chvilku tam jsem", "domluveno, čekej u vchodu", "už letím 🚀",
  "ok, dovezu", "mám tě, 10 minut", "řeš nic, jsem na cestě", "tak jo, drž se"
];
const DECLINE_REPLIES = [
  "dneska ne, sorry", "teď nemůžu", "není skladem", "zkus zítra",
  "tohle ne, kámo", "jsem mimo, ozvi se jindy", "nejde to", "hele, dneska fakt ne"
];

function flashPolice() {
  document.body.classList.add("police-flash");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => document.body.classList.remove("police-flash"), 3000);
}

/* =====================================================================
   POPULARITA, HEAT, ZÁTAHY
   ===================================================================== */
// Popularita čtvrti jde od 0 do 5 (úrovně: Neznámý < 0,5 < Místní < 1 < Známý < 2 < Hvězda < 3 < Celebrita < 4 < Legenda).
// Roste jen doručenými objednávkami (+0,12 za každou) a událostmi, klesá jen nedoručenými objednávkami
// (50% šance na −0,05 za každou). Recenze v kanálu jsou jen vtípek a popularitu nemění.
const POP_MAX = 5;
const POP_PER_DELIVERY = 0.12;
const POP_MISS_CHANCE = 0.5, POP_MISS_LOSS = 0.05;
function addPop(d, v) {
  S.pop[d] = clamp(S.pop[d] + v, 0, POP_MAX);
  if (S.pop[d] >= 2) unlock("star");
}
function addPopAll(v) { districtNames.forEach(d => addPop(d, v)); }
// objednávka, která se nedoručila (odmítnutá, bez zásob, neodpovězená): někdy ubere popularitu
function missedOrder(d) {
  if (Math.random() < POP_MISS_CHANCE) addPop(d, -POP_MISS_LOSS);
}

function heatLevel(h) { return h >= 3 ? 2 : h >= 2.5 ? 1 : 0; }

function addHeat(d, v) {
  S.police[d] = clamp((S.police[d] || 0) + v, 0, 3.5);
  checkHeat(d);
}

function checkHeat(d) {
  if (S.over) return;
  const h = S.police[d];
  if (h >= 3.5) { triggerRaid(d); return; }
  const lvl = heatLevel(h);
  if (lvl > S.warned[d]) {
    logMessage(lvl === 2
      ? `🚨 ${d}: jsi HLEDANÝ – další chyba a přijde zátah!`
      : `👀 ${d}: policie tě sleduje.`);
  }
  S.warned[d] = lvl;
}

function triggerRaid(d) {
  if (S.over) return;
  S.stats.raids++;
  playSound("siren");
  setTimeout(() => stopSound("siren"), 5000);
  flashPolice();

  const lost = Math.ceil(S.supply * 0.5);
  const fine = Math.min(S.money, 10000);
  S.supply -= lost;
  S.money -= fine;
  S.timeLeft = Math.max(0, S.timeLeft - 1);
  // při zatčení heat nesnižujeme, ať tabulka ukazuje skutečnou hodnotu, která zátah spustila (100 %)
  const arrest = !S.lawyer && S.strikes + 1 >= MAX_RAIDS;
  if (!arrest) {
    S.police[d] = 1.5;
    S.warned[d] = 0;
    districtNames.forEach(x => { if (x !== d) S.police[x] = Math.max(0, S.police[x] - 0.3); });
  }

  if (S.lawyer) {
    S.lawyer = false;
    logImportantMessage(`⚖️ Zátah v ${d}! Přišel jsi o ${lost} g a ${fmt(fine)} Kč, ale právník tě vytáhl a nic se nepočítá. Právník je pryč.`);
  } else {
    S.strikes++;
    S.lastStrikeDay = S.day;
    if (S.strikes >= MAX_RAIDS) {
      logImportantMessage(`🚔 Druhý zátah! Policie tě zatkla v ${d} (policie tam byla na 100 %).`);
      updateStatus();
      endGame("🚔 VĚZENÍ", `Policie tě zatkla v ${d}, kde ti na teploměru policie vyskočilo na 100 %. Dva zátahy jsou na tebe moc.`);
      return;
    }
    logImportantMessage(`🚨 Zátah v ${d}! Přišel jsi o ${lost} g a ${fmt(fine)} Kč. Další zátah = vězení. (${S.strikes}/${MAX_RAIDS})`);
  }
  unlock("raid");
  updateStatus();
}

function checkHotDistricts() {
  for (const d of districtNames) {
    if (S.freq[d] >= 3 && Math.random() < 0.4) {
      telegramFeed({ custom: `🚨 Policie si všimla častých pohybů v ${d}.` });
      S.police[d] = Math.max(S.police[d], Math.min(3, S.police[d] + 0.5));
      S.freq[d] = 0;
      checkHeat(d);
      return;
    }
  }
}

/* =====================================================================
   TELEGRAM
   ===================================================================== */
function telegramFeed({ negative = false, nickname = null, district = null, custom = null } = {}) {
  if (custom) {
    // „🔴 text – @nick“ je recenze, cokoli jiného je zpráva kanálu
    const m = custom.match(/^(🟢|🔴)\s*(.*?)(?:\s+–\s+(\S+))?$/);
    if (m) addPost({ nick: m[3] || "@anonym", text: m[2], positive: m[1] === "🟢" });
    else addPost({ nick: "Snow Reviews", text: custom, positive: null, avatar: "📢" });
    return;
  }
  if (Math.random() >= 0.3) return;
  const pool = telegramMessages.filter(m => negative ? m.startsWith("🔴") : !m.startsWith("🔴"));
  addPost({ nick: nickname || "@anonym", text: rand(pool).replace(/^(🟢|🔴)\s*/, ""), positive: !negative });
  // recenze jsou jen vtípek, popularitu nemění (ta se mění jen doručením a nedoručením objednávek)
}

// příspěvek v kanálu Snow Reviews: avatar, jméno, text, reakce a čas
function addPost({ nick, text, positive, avatar }) {
  const box = $("telegramMessages");
  const post = document.createElement("div");
  post.className = "post" + (positive === false ? " neg" : "");
  const av = document.createElement("div");
  av.className = "avatar sm";
  av.style.setProperty("--c", nickColor(nick));
  av.textContent = avatar || nickInitial(nick);
  const body = document.createElement("div");
  body.className = "post-body";
  const name = document.createElement("div");
  name.className = "post-name";
  name.textContent = nick;
  const t = document.createElement("div");
  t.className = "post-text";
  t.textContent = text;
  const meta = document.createElement("div");
  meta.className = "post-meta";
  const react = document.createElement("span");
  react.className = "react";
  const n = Math.floor(Math.random() * 40) + 3;
  react.textContent = positive === false ? `👎 ${Math.ceil(n / 4)}` : positive ? `👍 ${n}  🔥 ${Math.ceil(n / 5)}` : `👀 ${n}`;
  const time = document.createElement("span");
  time.textContent = clockNow();
  meta.append(react, time);
  body.append(name, t, meta);
  post.append(av, body);
  box.appendChild(post);
  while (box.children.length > 40) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

/* =====================================================================
   VĚRNOST ZÁKAZNÍKŮ
   ===================================================================== */
const loyaltyOf = nick => S.loyalty[nick] || 0;
function changeLoyalty(nick, delta) {
  const v = clamp(loyaltyOf(nick) + delta, 0, 5);
  S.loyalty[nick] = v;
  if (v >= 5) unlock("regular");
  return v;
}

// zákazník, kterému jsi nevyhověl (odmítnutí, nedostatek zásob/času, ignorování)
function disappointCustomer(nick, district) {
  if (loyaltyOf(nick) >= 2) changeLoyalty(nick, -1);
  if (Math.random() < NEGATIVE_PROB) telegramFeed({ negative: true, nickname: nick, district });
}

/* =====================================================================
   NABÍDKY
   ===================================================================== */
function clearOfferTimers() {
  offerTimers.forEach(clearTimeout);
  offerTimers = [];
  eventsPending = 0;
  clearEventTimer();
}

// Známější čtvrť píše častěji, ale ne o řád víc než ostatní. Dlouho nenavštívené čtvrti
// dostanou bonus a čtvrť, která už dnes psala, je méně pravděpodobná (ať nepíšou pořád ze stejných míst).
function pickDistrict() {
  const weights = districtNames.map(d => {
    let w = 10 + S.pop[d] * 12;
    if (S.idle[d] >= 4) w += 8;
    return w * Math.pow(0.55, S.offered[d] || 0);
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  let pick = districtNames[0];
  for (let i = 0; i < districtNames.length; i++) {
    r -= weights[i];
    if (r < 0) { pick = districtNames[i]; break; }
  }
  S.offered[pick] = (S.offered[pick] || 0) + 1;
  return pick;
}

// "Karlín" → "karlin" (pro jména velkoodběratelů jako @klub_karlin)
const districtSlug = d => d.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function pickCustomer(d) {
  const list = districtCustomers[d];
  const unused = list.filter(n => !S.usedToday.includes(n));
  const regulars = unused.filter(n => loyaltyOf(n) >= 2);
  const nick = regulars.length && Math.random() < 0.5
    ? rand(regulars)
    : rand(unused.length ? unused : list);
  S.usedToday.push(nick);
  return nick;
}

// Kolik lidí dnes napíše. Každá čtvrť zvlášť podle své popularity (0 až 5): nízká popularita = skoro nic, hodně až u vysoké
// (popularita 0 → 0,14 denně, 1 → 0,16, 2 → 0,31, 3 → 0,70, 4 → 1,5, 5 → 2,8). Pak se násobí dnem v týdnu: pondělí až středa klid,
// čtvrtek se rozjíždí, nejvíc je v pátek a v sobotu, v neděli jen pár. Nejvýš 5 poptávek z jedné čtvrti za den,
// celkový limit objednávek neexistuje. Rozjezd na začátku závisí jen na popularitě čtvrtí, ne na počtu dní.
const WEEKDAY_DEMAND = {
  "Pondělí": 0.45, "Úterý": 0.5, "Středa": 0.55, "Čtvrtek": 1.0,
  "Pátek": 1.8, "Sobota": 1.8, "Neděle": 0.7
};
const MAX_OFFERS_PER_DISTRICT = 5;
const districtDemand = d => 0.14 + 2.66 * Math.pow(S.pop[d] / POP_MAX, 3);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// plán dne: seznam čtvrtí, ze kterých dnes přijde poptávka (v náhodném pořadí)
function planOffers() {
  const f = WEEKDAY_DEMAND[dayName(S.day)];
  const plan = [];
  districtNames.forEach(d => {
    const n = Math.min(MAX_OFFERS_PER_DISTRICT, Math.floor(districtDemand(d) * f + Math.random()));   // náhodné zaokrouhlení
    for (let i = 0; i < n; i++) plan.push(d);
  });
  // aspoň 1 poptávka denně, ať hra není mrtvá
  while (plan.length < 1) plan.push(pickDistrict());
  return shuffle(plan);
}
const offersForToday = () => planOffers().length;

function startDayOffers() {
  clearOfferTimers();
  const plan = planOffers();
  const n = plan.length;
  // při hodně poptávkách chodí rychleji, ať celý příval trvá nejvýš ~40 vteřin
  const gap = clamp(40000 / Math.max(1, n), 350, 2200);
  plan.forEach((d, i) => offerTimers.push(setTimeout(() => generateOffer(d), 300 + i * gap)));
  if (Math.random() < 0.15) offerTimers.push(setTimeout(randomCustomerMessage, 300 + n * gap + 800));
  scheduleEvents(300 + n * gap + 1800);
}
function generateOffer(forced) {
  // po konci směny poptávky nechodí, jen do čtvrtí s prodejcem (ty vyřizuje prodejce)
  if (S.over || (S.timeLeft <= 0 && !(forced && S.dealers[forced]))) return;

  let grams = weightedRandomChoice([
    { value: 1, weight: 0.42 }, { value: 2, weight: 0.33 }, { value: 3, weight: 0.15 },
    { value: 4, weight: 0.05 }, { value: 5, weight: 0.05 }
  ]);
  const district = forced || pickDistrict();
  // Velkoodběratel: ve hodně známé čtvrti občas napíše klub, hotel nebo firma. Chce 10–50 g
  // za lepší cenu za gram. Nejvýš čtyři za den a jen když máš aspoň 10 g.
  const pop = S.pop[district];
  const vip = pop >= 1.75 && S.vipToday < 4 && S.supply >= 10 && Math.random() < (pop >= 3.5 ? 0.35 : pop >= 2.25 ? 0.22 : 0.12);
  if (vip) {
    const sizes = [10, 15, 20, 30, 50].filter(g => g <= S.supply);
    grams = sizes[Math.floor(Math.pow(Math.random(), 1.6) * sizes.length)];   // menší zásilky jsou častější
    S.vipToday++;
  }
  const nickname = vip
    ? `@${rand(["klub", "hotel", "restaurace", "galerie", "kancelar", "festival"])}_${districtSlug(district)}`
    : pickCustomer(district);
  const loyal = !vip && loyaltyOf(nickname) >= 2;

  // cena: 78 % standard, 12 % sleva, 10 % prémiová (z toho šestina je past)
  const basePrice = customerBasePrices[grams];
  let price = basePrice, trap = false;
  if (vip) {
    // velká zásilka: čím víc gramů, tím líp za gram (2 700 až 3 200 Kč/g, běžně ~2 400)
    const perG = grams <= 15 ? 2700 : grams <= 20 ? 2850 : grams <= 30 ? 3000 : 3200;
    price = grams * perG;
  } else {
    const roll = Math.random();
    if (roll >= 0.90) {
      price = basePrice * (1.25 + Math.random() * 0.15);
      trap = Math.random() < 1 / 6;
    } else if (roll >= 0.78) {
      price = basePrice * (1 - (0.05 + Math.random() * 0.10));
    }
    // sláva se vyplácí: známá čtvrť platí víc (popularita 2,5 = +24 %, 5 = +54 %)
    price *= 1 + 0.12 * Math.max(0, pop - 0.5);
    if (loyal) price *= 1 + 0.04 * loyaltyOf(nickname);
  }
  price = Math.round(price / 100) * 100;

  // doba cesty závisí na tom, kde zrovna jsi; po každém doručení se přepočítá u všech otevřených nabídek
  const time = travelTime(S.loc, district);

  if (S.supply < grams) {
    // nesplněná objednávka = ušlý výdělek, dál ji netrestáme špatnou reputací
    // (jinak by zásoby dodávané jen v pondělí rozbily popularitu)
    logMessage(`⚠️ ${nickname} z ${district} – chtěl ${grams}g, ale nemáš stash. Ušlý zisk ${fmt(price)} Kč.`);
    updateStatus();
    return;
  }

  const messages = [
    `hej bro, mas ${grams}? mam ${price} kc, ale specham do ${district}`,
    `Čau, mohl bys mi prosím doručit ${grams}g do ${district}? Mám připraveno ${price} Kč.`,
    `ty vole kamo, potrebuju ${grams}g racingu, cash ready ${price}, kde se potkáme?`,
    `zdar, hodis mi ${grams} do ${district}? mam ${price}kc, ale fakt specham`,
    `hele, mam jen ${price}kc, jsem na mrdku na teambuildingu :DD co za to dostanu treba ${grams}?`,
    `Bráško, dneska fakt nutně potrebuju ${grams}g třeba za ${price}, jsem v ${district}, ozvi se pls.`,
    `yo, mas neco fresh? treba ${grams} za ${price}, ale rychle pls`,
    `Dobrý den, rád bych si objednal ${grams}g za ${price} Kč. Je to možné?`,
    `hej kamo, kamosz rikal ze mas kvalitu, vzal bych ${grams}g, cash ${price}kc`,
    `cau, jsem v ${district}, hodis mi ${grams}? mam ${price}kc, ale specham`,
    `ty kravo, potrebuju ${grams}g, jinak jsem v haji, mam ${price}kc`,
    `Zdarec, dovez ${grams}g racingu pls, cash ready ${price}kc, Praha jede`,
    `cs pls ${grams} pls,za  ${price}kc, u me ${district}`,
    `Kolik ${grams} v kolik co nejdřív a za zakolik ${price}kc ?`,
    `Yo, kamo, ${grams}g za ${price}kc, ale fakt rychle, jsem v ${district}`,
    `Hele, potřebuji nutně ${grams}g, mám ${price}, kde se potkáme?`,
    `Čau, máš čas? Vzal bych ${grams}g za ${price}, jsem v ${district}.`,
    `brasko, dneska fakt nutne potrebuju,je zima a snezi ${grams}g, cash ${price}`,
    `hej kamo, ${grams}g pls, ale specham, jsem v ${district}, mam ${price}`,
    `yo, mas racing na zkousku? treba ${grams}g, cash ready ${price}kc`,
    `Dobrý den, mohl byste mi doručit ${grams} do ${district}? Mám připraveno ${price} Kč.`,
    `bro vim ze je utery ale ${grams}g by mi zachranilo den, ${price}kc na ruku`,
    `kamo mam doma navstevu a nic k pivu... ${grams}g za ${price}kc pls ${district}`,
    `psal bych diskretne ale jsem v ${district} a stejne to vsichni vi, ${grams}g za ${price}`,
    `ahoj, od kolegy z prace, prej ${grams}g za ${price}kc je u tebe normal?`,
    `hele ${grams} do ${district} a jsem tvuj clovek na veky, cash ${price}kc`,
    `ty vole sef me zatezuje, potrebuju ${grams}g na zklidneni, ${price}kc ready`,
    `Dobry vecer, nevite nahodou o nekom kdo by mel ${grams}g? Nabizim ${price} Kc. Dekuji.`,
    `mam ${price}kc a zadny svedomi, kolik za ${grams}g?`,
    `bro jedu z afterky a potrebuju ${grams}, cash ${price}kc, jsem v ${district}`,
    `vole ja jsem uplne vyzmykanej, ${grams}g do ${district}, ${price}kc nepocitam`,
    `hele jestli mas ${grams}g tak ti polibim ruku, mam ${price}kc`,
    `nejde mi net, ale tobe pisu... ${grams}g za ${price}kc ${district}`,
    `zdar ty zmrde, ${grams}g za ${price}kc, fakt nutne, mam rande :D`,
    `pls ${grams}g, ${price}kc, jsem v ${district} za Billou, mam zelenou bundu`,
    `mrazi me, takze potrebuju ${grams}g racingu aby mi bylo tepleji :D ${price}kc`,
    `Dobry den, pisu ohledne inzeratu. ${grams}g za ${price} Kc, prevzeti ${district}.`,
    `bracho ${grams}g, ${price}kc, a kdyby ses zdrzel tak se nic nedeje... skoro`,
    `kamo promin ze pisu v takovou dobu, ${grams}g za ${price}kc?`,
    `ta posledni davka byla fakt dobra, dalsi ${grams}g za ${price}kc do ${district} pls`,
    `budu stat u trafiky v ${district}, ${grams}g, ${price}kc, poznas me podle krosny`,
    `cau mam ${price}kc z brigady, ${grams}g pls, ale nepovidej to nikomu`,
    `mel bys ${grams}g? ptam se pro kamose. kamos mi dava ${price}kc`,
    `ahoj nechtel bys ${price}kc? ja chci ${grams}g ty chces ${price}kc, win-win`,
    `Dobry den, zastupuji skupinu pratel, ktera by zadala ${grams}g za ${price} Kc. S pozdravem.`,
    `jsem na homeoffice a to se neda zvladnout bez ${grams}g, ${price}kc, ${district}`,
    `hej ${grams}g a nenech me cekat jak posledne, ${price}kc`,
    `${district} vola. ${grams}g, ${price}kc, bez keců`,
    `sorry za spam, ale ${grams}g za ${price}kc bych bral hned`,
    `jsem tu novej, rikali ze ty jsi ten pravej... ${grams}g za ${price}kc ${district}`,
    `kolega rikal ze mas ${grams}g na sklade, ja mam ${price}kc a na sklade nic, vymenime?`,
    `tvoje auto je na ${district} vsude videt, takze ${grams}g za ${price}kc bude easy ne`,
    `vole zrovna mi zdrazili najem, ${grams}g za ${price}kc at to prezijem`,
    `ahojky, ${grams}g do ${district} a ${price}kc, jinak budu muset jit spat v 10 jak sasek`,
    `ahoj, tohle neni podvod ani past, jen ${grams}g za ${price}kc, dik`,
    `kamo mam ${price}kc a plan co nema smysl, ${grams}g by ho zachranilo`,
    `dobry den, objednavam ${grams}g na firemni teambuilding, rozpocet ${price} Kc, tema: snih`,
    `tati rikal ze mam hledat praci, tak hledam: ${grams}g, ${price}kc, ${district}`,
    `yo, potrebuju ${grams}g na vcerejsi chyby, mam ${price}kc`,
    `zdar, ucim se na zkousku a potrebuju k tomu ${grams}g, ${price}kc, bez diskuze`,
    `hele ${grams}g do ${district}, ${price}kc, a kdyz to bude rychle tak mas u me pivo`,
    `pomoc, babicka prijizdi za hodinu a nic nemam doma: ${grams}g, ${price}kc, ${district}`,
    `dobry vecer, prosim ${grams}g, ${price} Kc, uhrazeno v hotovosti a s usmevem`,
    `bro nejsem hrdy ale ${grams}g za ${price}kc je dneska moje jedina jistota`,
    `mel jsem tezky tyden. ${grams}g, ${price}kc, ${district}. nechces si povidat? ne? ok`,
    `vol mi, pis mi, jen mi dones ${grams}g racingu do ${district}, ${price}kc cash`,
    `brasko ty jsi hrdina nasi doby. ${grams}g, ${price}kc, a hrdinum se neodmita`,
    `tahle zprava se po precteni nezničí, ale ${grams}g za ${price}kc je realna`,
    `ahoj, jsem z ${district}, mam rozpocet ${price}kc a velke ambice na ${grams}g`,
    `dneska mi koncilo kolo na lavicce, ty mi ho vynahradis: ${grams}g, ${price}kc`,
    `pls pls pls ${grams}g, ${price}kc, mam rande a chci byt v dobre forme`,
    `zdarec, delam inventuru v hlave: ${grams}g, ${price}kc, ${district}. mas na sklade?`,
    `kamo, kdyz mi doneses ${grams}g do ${district} do pulhodiny, napisu ti basen. ${price}kc`,
    `dobry den, hledam ${grams}g za ${price} Kc, nabizim tez nepovinny usmev`,
    `ty vole, moje kocka tvrdi ze potrebuju ${grams}g. ${price}kc. neposlouchat kocku je nezdrave`,
    `heyyy, ${grams}g za ${price}kc pls, jsem uz u ${district} a mam kabat naruby`,
    `${price}kc za ${grams}g je moje maximum, neprecenuj me`,
    `dneska jsem velmi smutny a velmi bohaty. ${grams}g, ${price}kc, ${district}`,
    `zdar, mam kupon ktery plati jen dnes: ${price}kc za ${grams}g, doufam ze sedi`,
    `kamo vim ze to neni legalni, ale ${grams}g za ${price}kc by mi dneska zachranilo den`,
    `mel jsem sen ze nosis ${grams}g a mel jsem pravdu. ${price}kc, ${district}`,
    `prosim te, uz jsem mluvil i s hlasem v hlave: ${grams}g, ${price}kc, a on souhlasi`,
    `bez ${grams}g jsem uplne bezradnej jako kocka v dest. ${price}kc, ${district}`,
    `zdarec, ja jsem ten co ti vcera psal ze nema ${price}kc. dneska je mam, ${grams}g!`,
    `Dobry den, zadavam objednavku c. 47: ${grams}g za ${price} Kc. Dekujeme za duveru a diskretnost.`,
    `ty jsi ta jedina ruzova pastelka v krabici. ${grams}g, ${price}kc, ${district}`,
    `mam hlad ale radsi ${grams}g nez rizek, ${price}kc, a kdyz stihnes tak ten rizek taky`,
    `kamo, volal jsem mamce a ona rekla at si objednam ${grams}g. ${price}kc, ${district}`,
    `ten ficak z konkurence mi rikal ze maji akci, ale ja verim tobe. ${grams}g, ${price}kc`,
    `hele nic neodpovidej, jen prijed s ${grams}g do ${district}. ${price}kc, bez keců i bez bankovnich prevodu`
  ];
  // velkoodběratelé píšou formálněji (a trochu vtipněji)
  const vipMessages = [
    `Dobrý den, zajišťujeme zásobování akce v ${district}. Potřebujeme ${grams}g, nabízíme ${fmt(price)} Kč, termín dnes večer.`,
    `Zdravím, tady provozovna z ${district}. Brali bychom ${grams}g najednou za ${fmt(price)} Kč, faktura ne, hotově.`,
    `Dobrý večer, firemní večírek v ${district} a došly nám zásoby. ${grams}g za ${fmt(price)} Kč, platíme ihned.`,
    `Čau, jsme tu na akci a hosté jsou nenasytní. Zvládneš ${grams}g do ${district}? ${fmt(price)} Kč cash.`,
    `Dobrý den, doporučil nás ${rand(["kolega", "kamarád", "bratranec"])}. Máte ${grams}g? Za ${fmt(price)} Kč jsme v ${district} do hodiny.`,
    `Hej, sháníme ${grams}g na dnešní sezení v ${district}, rozpočet ${fmt(price)} Kč. Diskrétnost samozřejmost.`
  ];
  // stálí zákazníci píšou trochu jinak
  const loyalMessages = [
    `to jsem zase ja, ${grams}g jako vzdycky? ${price}kc ready`,
    `kamo, tvuj stalej zakaznik hlasi, ${grams}g do ${district}, ${price}kc`,
    `bez tebe bych tu Prahu nezvladl, ${grams}g za ${price}kc pls`,
    `jako minule pls, ${grams}g a ${price}kc, ty vis kam v ${district}`,
    `šéfe, poprosil bych klasiku. ${grams}g, ${price}kc, ${district}`,
    `ty jsi muj nejlepsi dealer a to rikam i mamce. ${grams}g za ${price}kc`,
    `tvuj stalej tady, ${grams}g jako vzdy, ${price}kc, a pozdravuj mamku`,
    `mas me v kontaktech pod "ten dobrej"? tak ${grams}g, ${price}kc`,
    `klasika, ${grams}g do ${district}, ${price}kc. a pripadne kafe, kdyby se nahodou`,
    `uz je to tradice: ${grams}g, ${price}kc, a ja ti nikdy nerikam cim jsem`,
    `bez ${grams}g neprezijem ani pondeli. ${price}kc ready, ty to znas`,
    `boss, ${grams}g, ${price}kc, tvuj nejvernejsi zakaznik v ${district}. diplom?`,
    `kdyz uz mam tvoje cislo tak ${grams}g, ne? ${price}kc, a tentokrat bez drbu`,
    `stejne jako minule pls, ${grams}g, ${price}kc. nebo jako predminule, nepamatuju si`,
    `hele pro tebe rad, tvuj verny zakaznik tady, ${grams}g za ${price}kc`,
    `ty vis jak to mam rad. ${grams}g do ${district}, ${price}kc`,
    `recenzi ti dam nejak potom, ted ${grams}g za ${price}kc, jo?`,
    `jsem stalejsi nez tvuj sasek z konkurence. ${grams}g, ${price}kc`,
    `prosim te, ${grams}g, ${price}kc, a kdyz to bude sedet tak ti napisu zase zitra`,
    `snih je moje hobby, ty jsi muj dodavatel pomoci. ${grams}g, ${price}kc, ${district}`,
    `to jsem zase ja, nejsem zadna policie, jen ${grams}g za ${price}kc chci`
  ];

  const offer = { nickname, district, grams, price, time, trap, vip };
  // cenu nikde nehodnotíme – jestli je nabídka hodně nad nebo pod cenou, musí hráč poznat sám
  const badges = [];
  if (loyal) badges.push(`⭐ stálý zákazník`);
  if (vip) badges.push(`🏢 velkoodběratel`);

  playSound("notif");
  // bublina zákazníka + shrnutí objednávky + tlačítka pod ní jako inline klávesnice v Telegramu
  const b = incomingBubble(nickname, district);
  const card = b.row;
  card.classList.add("offer");
  card.dataset.nickname = nickname;
  card.dataset.district = district;
  card._offer = offer;
  chatAppend(card);   // musí být v DOM dřív, než začne psaní
  const msgText = vip ? rand(vipMessages) : loyal && Math.random() < 0.5 ? rand(loyalMessages) : rand(messages);
  typeInto(b.text, msgText);

  // máš ve čtvrti prodejce? Pak poptávku vyřídí on a ty uvidíš jeho odpověď
  const auto = dealerTakes(offer);
  const order = document.createElement("div");
  order.className = "order";
  order.innerHTML = auto
    ? `📦 <b>${grams} g</b> · 💰 <b>${fmt(price)} Kč</b> · 🧑‍💼 <b>vyřídí prodejce</b>`
    : `📦 <b>${grams} g</b> · 💰 <b>${fmt(price)} Kč</b> · ⏱️ <b class="t">${fmtDur(time)}</b> · 🕘 <b class="arr">${clockAt(time)}</b>`
      + badges.map(x => ` <span class="badge">${x}</span>`).join("");
  b.bubble.insertBefore(order, b.time);
  if (auto) {
    dealerSells(card, offer, msgText.length);
    updateStatus();
    return;
  }

  const kb = document.createElement("div");
  kb.className = "kb row";
  const yes = document.createElement("button");
  yes.className = "kb-btn good";
  yes.textContent = "✅ Přijmout";
  yes.onclick = () => acceptOffer(card, offer);
  const no = document.createElement("button");
  no.className = "kb-btn bad";
  no.textContent = "❌ Odmítnout";
  no.onclick = () => declineOffer(card, offer);
  kb.append(yes, no);
  b.col.appendChild(kb);
  updateScrollBtn();
  renderMap();
}

// po přesunu na nové místo se přepočítá doba cesty u všech otevřených nabídek
function refreshOfferTimes() {
  document.querySelectorAll("#gameLog .offer").forEach(card => {
    if (card.dataset.done || !card._offer) return;
    card._offer.time = travelTime(S.loc, card._offer.district);
    const t = card.querySelector(".order .t");
    const arr = card.querySelector(".order .arr");
    const late = card._offer.time > S.timeLeft;   // nestíhal bys to před koncem směny
    if (t) { t.textContent = fmtDur(card._offer.time); t.classList.toggle("far", late); }
    if (arr) { arr.textContent = clockAt(card._offer.time); arr.classList.toggle("far", late); }
  });
}

// vyřízená nabídka: zmizí klávesnice, bublina zůstane v chatu a můžeš zákazníkovi odpovědět
function closeOffer(card, reply) {
  const kb = card.querySelector(".kb");
  if (kb) kb.remove();
  card.classList.add("closed");
  if (reply) {
    const text = card.querySelector(".bubble-text");
    playerBubble(reply, { nick: card.dataset.nickname, text: text ? text.textContent : "" });
  }
}

function failOffer(card, o, msg) {
  closeOffer(card);
  logMessage(msg);
  missedOrder(o.district);
  disappointCustomer(o.nickname, o.district);
  updateStatus();
}

// odpověď i výsledek se zobrazí přímo pod danou poptávkou
const acceptOffer = (card, o) => withAnchor(card, () => acceptOfferInner(card, o));
const declineOffer = (card, o) => withAnchor(card, () => declineOfferInner(card, o));

function acceptOfferInner(card, o) {
  if (S.over || card.dataset.done) return;
  // čas se počítá z aktuální polohy v okamžiku kliknutí
  o.time = travelTime(S.loc, o.district);
  if (S.timeLeft < o.time) {
    // nabídka zůstane otevřená: nestíháš ji teď, ale po přesunu jinam třeba ano
    logMessage(`🕘 Do ${o.district} bys dorazil až v ${clockAt(o.time)}, ale směna končí v ${shiftEndClock()}.`);
    return;
  }
  card.dataset.done = "1";
  if (S.supply < o.grams) return failOffer(card, o, `❌ Nemáš dost stashe na doručení ${o.grams}g do ${o.district}. Nabídka propadla.`);

  closeOffer(card, rand(ACCEPT_REPLIES));
  S.timeLeft = round2(S.timeLeft - o.time);
  S.supply -= o.grams;
  S.loc = o.district;   // jsi tam, takže ostatní poptávky z téhle čtvrti jsou hned po ruce
  refreshOfferTimes();

  if (o.trap) {
    logMessage(`🚓 Past! ${o.nickname} byl převlečený policista. Zboží (${o.grams}g) je pryč a ${o.district} tě má v hledáčku.`);
    addHeat(o.district, 1.5);
    updateStatus();
    return;
  }

  S.money += o.price;
  S.salesToday = true;
  S.accepted[o.district] = true;
  S.idle[o.district] = 0;
  S.freq[o.district] = (S.freq[o.district] || 0) + 1;
  S.today.delivered++;
  S.today.grams += o.grams;
  S.stats.delivered++;
  S.stats.grams += o.grams;
  S.stats.earned += o.price;
  addPop(o.district, POP_PER_DELIVERY);
  unlock("first");

  const before = loyaltyOf(o.nickname);
  const after = o.vip ? before : changeLoyalty(o.nickname, 1);
  logMessage(`✅ Doručeno. -${o.grams}g, +${fmt(o.price)} Kč`);
  if (before < 2 && after >= 2) logMessage(`⭐ ${o.nickname} je teď stálý zákazník – platí víc a bude psát častěji.`);

  telegramFeed({ nickname: o.nickname, district: o.district });

  // heat se jen přičte; stav vidíš v tabulce čtvrtí a varování přijdou, až když to začne být vážné
  addHeat(o.district, deliveryHeat(o.district, o.grams));
  if (!S.over) checkHotDistricts();
  updateStatus();
}

// Heat za doručení roste s množstvím, popularitou čtvrti, opakováním v jedné čtvrti
// a nápadností auta. Rozprostři doručení po městě, ať se čtvrti stihnou zklidnit.
function deliveryHeat(d, grams) {
  const eg = grams <= 5 ? grams : 5 + (grams - 5) * 0.12;   // velká zásilka přitahuje víc pozornosti, ale ne lineárně
  let gain = (0.08 + 0.05 * eg) * (0.7 + S.pop[d] * 0.24)
    * (1 + 0.15 * Math.max(0, S.freq[d] - 1)) * effCar().heat;
  if (Math.random() < 0.25) gain += 0.5;   // někdo tě viděl
  return round2(gain);
}

function declineOfferInner(card, o) {
  if (S.over || card.dataset.done) return;
  card.dataset.done = "1";
  closeOffer(card, rand(DECLINE_REPLIES));
  missedOrder(o.district);
  disappointCustomer(o.nickname, o.district);
  updateStatus();
}

function randomCustomerMessage() {
  if (S.over) return;
  const d = rand(districtNames);
  customerBubble(rand(districtCustomers[d]), d, rand(randomCustomerMessages));
  playSound("notif");
}

/* =====================================================================
   NÁHODNÉ EVENTY (každý má volby; některé mají důsledky později)
   ===================================================================== */
function addSupply(g) {
  const room = Math.max(0, cap() - S.supply);
  const add = Math.min(g, room);
  S.supply += add;
  if (add < g) logMessage(`📦 Kapacita je plná – ${g - add} g navíc propadlo.`);
  return add;
}

const clothesEvent = (item, price) => () => ({
  text: `🧢 Kámoš ti nabídl ${item} za ${fmt(price)} Kč. Bereš?`,
  choices: [
    { label: `Koupit (${fmt(price)} Kč)`, run: () => {
      if (S.money < price) { logMessage("💸 Nemáš ani na to. Trapas."); return; }
      S.money -= price;
      if (Math.random() < 0.7) { addPopAll(0.15); logMessage("😎 Stylovej! Popularita +0,15 všude."); }
      else logMessage("🤡 Tak ty si dobrej šašek že nosíš fejky");
    } },
    { label: "Zůstat lowkey", run: () => logMessage("👖 Zůstáváš lowkey.") }
  ]
});

const EVENT_FACTORIES = [
  () => ({
    text: "🧼 V klubu ti z kapsy vypadlo 2g – zkusíš to najít?",
    choices: [
      { label: "Hledat", run: () => {
        if (Math.random() < 0.5) { if (addSupply(2)) logMessage("🕵️‍♂️ Našel jsi to pod gaučem! Jackpot."); }
        else { const d = rand(districtNames); logMessage(`👮 Někdo tě viděl hledat – zájem policie v ${d} ++!`); addHeat(d, 1); }
      } },
      { label: "Kašlat na to", run: () => logMessage("👋 Kašli na to, bude nový.") }
    ]
  }),
  () => ({
    text: "💸 Našel jsi na zemi 2000 Kč – vezmeš si je?",
    choices: [
      { label: "Vzít", run: () => {
        if (Math.random() < 0.8) { S.money += 2000; logMessage("💰 Vzal jsi je – easy money."); }
        else { S.money = Math.max(0, S.money - 1000); logMessage("🚓 Kamera tě nahrála, dostal jsi pokutu 1000 Kč."); }
      } },
      { label: "Nechat být", run: () => logMessage("😇 Nechal jsi je být. Karma čistá.") }
    ]
  }),
  () => ({
    text: "🧂 Napadlo tě seknout zásoby – chceš je naředit moukou?",
    choices: [
      { label: "Naředit", run: () => {
        if (Math.random() < 0.5) { addSupply(2); logMessage("😏 Naředil jsi a nikdo nic nepoznal. +2 g"); }
        else {
          const lost = Math.min(2, S.supply);   // zákazník to poznal: vrátí zboží zpátky
          S.supply -= lost;
          telegramFeed({ custom: "🔴 Naředěný, nedoporučuju. – anonym" });
          logMessage(`🤮 Zákazník to poznal a rozkecal to. Přišel jsi o ${lost} g.`);
        }
      } },
      { label: "Zůstat věrný kvalitě", run: () => logMessage("👌 Zůstal jsi věrný kvalitě.") }
    ]
  }),
  () => ({
    text: "🎂 Tvůj kámoš má narozky – dáš mu 1g jako dárek?",
    choices: [
      { label: "Dát 1 g", run: () => {
        if (S.supply >= 1) { S.supply -= 1; addPopAll(0.2); logMessage("🎁 Kámoš happy – rozkecá to dál! 🌟Popularita +0,2 všude."); }
        else logMessage("🤷‍♂️ Nemáš ani gram – trapas.");
      } },
      { label: "Nedat nic", run: () => logMessage("😒 Nedal jsi nic – zůstáváš tajemný.") }
    ]
  }),
  () => ({
    text: "📱 Našel jsi levnej burner telefon za 1000 Kč – koupíš ho?",
    choices: [
      { label: "Koupit (1 000 Kč)", run: () => {
        if (S.money >= 1000) {
          S.money -= 1000;
          const d = rand(districtNames);
          S.police[d] = Math.max(0, S.police[d] - 1);
          logMessage(`📴 Vzal jsi ho – policie zmatena v ${d}.`);
        } else logMessage("💸 Nemáš ani na levnej mobil.");
      } },
      { label: "Ne", run: () => logMessage("📵 Zůstáváš u starý Nokie.") }
    ]
  }),
  () => ({
    text: "🕵️ V klubu jsi slyšel drby o konkurenci – půjdeš to ověřit?",
    choices: [
      { label: "Ověřit", run: () => {
        if (Math.random() < 0.4) {
          const stolen = Math.min(S.supply, Math.floor(Math.random() * 3) + 1);
          S.supply -= stolen;
          logMessage(`😱 Byl to setup – ztratil jsi ${stolen}g.`);
        } else {
          const d = rand(districtNames);
          addPop(d, 0.15);
          logMessage(`🔍 Zjistil jsi, kde konkurence nestíhá. Popularita v ${d} +0,15.`);
        }
      } },
      { label: "Nechat to být", run: () => logMessage("🦺 Zůstal jsi v bezpečí.") }
    ]
  }),
  clothesEvent("pásek Moncler vestu", 6500),
  clothesEvent("pásek BURBERRY (je drip!)", 5000),
  () => {
    const qty = Math.floor(Math.random() * 5) + 1;
    return {
      text: `✉️ Vyděrač: "Dovez mi ${qty}g, nebo tě udám!"`,
      choices: [
        { label: `Vyhovět (${qty} g, −1 h)`, run: () => {
          if (S.supply >= qty) {
            S.supply -= qty;
            S.timeLeft = Math.max(0, S.timeLeft - 1);
            logMessage(`✅ Vydírání splněno: odebral jsi ${qty}g a ztratil 1 hodinu.`);
          } else logMessage("❌ Nemáš dost stash na splnění vydírání!");
        } },
        { label: "Ignorovat", run: () => {
          if (Math.random() < 0.5) logMessage("😏 Vydírání byl blaf, nic se nestalo.");
          else {
            const d = rand(districtNames);
            S.police[d] = Math.max(S.police[d], 3);
            logMessage(`🚨 Vydírání neblafoval – policie v ${d} tě HLEDÁ!`);
            checkHeat(d);
          }
        } }
      ]
    };
  },
  () => ({
    text: "❄️ Chceš uspořádat sněhovou párty? (stálo by to 10g)",
    choices: [
      { label: "Uspořádat (−10 g)", run: () => {
        if (S.supply >= 10) { S.supply -= 10; addPopAll(0.5); logMessage("🎉 Sněhová párty proběhla, popularita ve čtvrtích výrazně vzrostla (+0,5 všude)!"); }
        else logMessage("❌ Nemáš dost stash na sněhovou párty!");
      } },
      { label: "Odložit", run: () => logMessage("😐 Sněhová párty odložena.") }
    ]
  }),
  // --- nové eventy s důsledky ---
  () => ({
    text: "🦈 Lichvář: „Půjčím ti 20 000 Kč. Za týden chci 26 000.“",
    choices: [
      { label: "Půjčit si 20 000 Kč", run: () => {
        S.money += 20000;
        S.pending.push({ type: "loan", day: S.day + 7, amount: 26000 });
        logMessage("🦈 Půjčil sis 20 000 Kč. Za 7 dní chce lichvář 26 000 Kč.");
      } },
      { label: "Ne, díky", run: () => logMessage("🙅 S lichváři ses nezapletl.") }
    ]
  }),
  () => ({
    cond: () => S.supply >= 3,
    text: "🤝 Kamarád prosí o 3g na dluh: „Za 3 dny ti dám 6 000 Kč, slibuju.“",
    choices: [
      { label: "Dát na dluh (−3 g)", run: () => {
        S.supply -= 3;
        S.pending.push({ type: "credit", day: S.day + 3, amount: 6000, nick: rand(rand(Object.values(districtCustomers))) });
        logMessage("🤝 Dal jsi 3g na dluh. Uvidíme, jestli ti to vrátí.");
      } },
      { label: "Odmítnout", run: () => logMessage("🙅 Žádný dluhy.") }
    ]
  }),
  () => ({
    text: "👮 Policejní kontrola na ulici! Co uděláš?",
    choices: [
      { label: "Zachovat klid", run: () => {
        const risk = clamp(S.supply / 40, 0.05, 0.6);
        if (Math.random() < risk) {
          const d = rand(districtNames);
          logMessage(`🚨 Našli u tebe stash – policie v ${d} je ve střehu.`);
          addHeat(d, 1);
        } else logMessage("😌 Prošel jsi bez problémů.");
      } },
      { label: "Zdrhnout", run: () => {
        if (Math.random() < 0.6) logMessage("🏃 Utekl jsi!");
        else {
          const d = rand(districtNames);
          S.timeLeft = Math.max(0, S.timeLeft - 1);
          logMessage(`🚨 Dohnali tě – ztratil jsi hodinu a policie v ${d} je ve střehu.`);
          addHeat(d, 1.5);
        }
      } },
      { label: "Nabídnout 500 Kč", run: () => {
        if (S.money < 500) { logMessage("💸 Nemáš ani 500 Kč. Trapas."); return; }
        S.money -= 500;
        if (Math.random() < 0.8) logMessage("💵 Policajt se otočil a odešel.");
        else {
          const d = rand(districtNames);
          logMessage(`🚨 Úplatek nevyšel – policie v ${d} je ve střehu.`);
          addHeat(d, 1);
        }
      } }
    ]
  }),
  () => {
    const d = rand(districtNames);
    return {
      text: `🥶 Sergei z Wishe rozdává vzorky v ${d}. Co s tím?`,
      choices: [
        { label: "Přebít ho (−3 g)", run: () => {
          if (S.supply >= 3) { S.supply -= 3; addPop(d, 0.25); logMessage(`🥊 Rozdal jsi vzorky líp než Sergei. Popularita v ${d} +0,25.`); }
          else logMessage("🤷‍♂️ Nemáš čím přebít.");
        } },
        { label: "Ignorovat", run: () => logMessage(`😬 Sergei si v ${d} rozdává vzorky dál.`) }
      ]
    };
  },

  /* --- quicktime eventy: s `timeout` musíš stihnout odpovědět, jinak se spustí volba `fallback` --- */
  () => ({
    timeout: 6, fallback: 2,
    text: "🚓 Za tebou jede policejní auto a pomalu tě dojíždí!",
    choices: [
      { label: "Zahnout do uličky", run: () => {
        if (Math.random() < 0.65) logMessage("🏃 Zmizel jsi v uličce, hlídka jela dál.");
        else {
          const d = rand(districtNames);
          S.timeLeft = Math.max(0, round2(S.timeLeft - 0.5));
          logMessage(`🚨 Slepá ulička! Ztratil jsi půl hodiny a policie v ${d} je ve střehu.`);
          addHeat(d, 1);
        }
      } },
      { label: "Zrychlit", run: () => {
        if (Math.random() < 0.4) logMessage("💨 Ujel jsi jim, ale srdce ti bije jako o závod.");
        else { const d = rand(districtNames); logMessage(`🚨 Honička! Policie v ${d} je ve střehu.`); addHeat(d, 1.5); }
      } },
      { label: "Jet normálně", run: () => {
        if (Math.random() < clamp(S.supply / 50, 0.05, 0.5)) {
          const d = rand(districtNames);
          logMessage(`🚔 Zastavili tě na kontrolu. Policie v ${d} je ve střehu.`);
          addHeat(d, 1);
        } else logMessage("😌 Jeli za tebou jen náhodou.");
      } }
    ]
  }),
  () => ({
    timeout: 7, fallback: 0,
    text: "🧓 Domovník tě chytil na chodbě: „A co to máte v tom batohu, mladej?“",
    choices: [
      { label: "„Sportovní vybavení.“", run: () => {
        if (Math.random() < 0.7) logMessage("🏋️ Domovník kývl a šel dál.");
        else { const d = rand(districtNames); logMessage(`🧓 Domovník to nezbaštil a volá na policii. Policie v ${d} je ve střehu.`); addHeat(d, 1); }
      } },
      { label: "Dát mu 1 g", run: () => {
        if (S.supply >= 1) { S.supply -= 1; logMessage("🧓 Domovník si to vzal a od té doby se neptá."); }
        else logMessage("🤷‍♂️ Nemáš ani gram, domovník se naštval a práskl dveřmi.");
      } },
      { label: "Zdrhnout po schodech", run: () => {
        if (Math.random() < 0.5) logMessage("🏃 Utekl jsi po schodech.");
        else { S.timeLeft = Math.max(0, round2(S.timeLeft - 0.5)); logMessage("🤕 Zakopl jsi o rohožku a ztratil půl hodiny."); }
      } }
    ]
  }),
  () => ({
    timeout: 8, fallback: 1,
    text: "✉️ Anonym ti píše: „Vím, kdo jsi. Vím, kde roznášíš.“",
    choices: [
      { label: "Změnit SIM (5 000 Kč)", run: () => {
        if (S.money < 5000) { logMessage("💸 Nemáš ani na SIM."); return; }
        S.money -= 5000;
        districtNames.forEach(d => { S.police[d] = Math.max(0, S.police[d] - 0.5); });
        logMessage("📱 SIM změněna, anonym zmizel a policie je klidnější všude.");
      } },
      { label: "Ignorovat", run: () => {
        if (Math.random() < 0.35) { const d = rand(districtNames); logMessage(`🚨 Anonym to byl policajt. Policie v ${d} je ve střehu.`); addHeat(d, 1); }
        else logMessage("😏 Asi jen blbec z diskotéky.");
      } },
      { label: "Odepsat „kdo je tam?“", run: () => {
        if (Math.random() < 0.5) logMessage("🤡 Byl to kámoš, co si dělá srandu.");
        else { const d = rand(districtNames); logMessage(`🚨 Přečetli si to i jinde. Policie v ${d} je ve střehu.`); addHeat(d, 0.5); }
      } }
    ]
  }),
  () => ({
    cond: () => S.money >= 3000,
    text: "🃏 Kámoš tě zve na pokrovou hru, vstupné 3 000 Kč.",
    choices: [
      { label: "Hrát (−3 000 Kč)", run: () => {
        S.money -= 3000;
        if (Math.random() < 0.45) { S.money += 8000; logMessage("🎰 Vyhrál jsi! +8 000 Kč."); }
        else logMessage("🃏 Prohrál jsi všechno. Kámoš má nový mobil.");
      } },
      { label: "Ne, dík", run: () => logMessage("🙅 Raději zůstal doma.") }
    ]
  }),
  () => ({
    text: "🍕 Kurýr z Woltu tě předjel a vzal ti zákazníka!",
    choices: [
      { label: "Honit ho (−0,5 h)", run: () => {
        S.timeLeft = Math.max(0, round2(S.timeLeft - 0.5));
        addPop(rand(districtNames), 0.1);
        logMessage("🏃 Doběhl jsi ho a zákazník si to rozmyslel. Popularita +0,1.");
      } },
      { label: "Nechat to být", run: () => logMessage("😒 Zákazník je pryč.") }
    ]
  }),
  () => ({
    cond: () => S.money >= 14000 && S.supply + 10 <= cap(),
    text: "📞 Frozone píše: „Mám 10 g navíc za 14 000 Kč, ale jen teď.“",
    choices: [
      { label: "Koupit (14 000 Kč)", run: () => {
        S.money -= 14000;
        if (Math.random() < 0.3) logMessage("😡 Frozone se vypařil i s penězi. Napálil tě.");
        else { addSupply(10); logMessage("📦 Frozone dodal. +10 g mimo pondělí."); }
      } },
      { label: "Ne, počkám na pondělí", run: () => logMessage("🧠 Plánuješ. Zásoby jen v pondělí.") }
    ]
  }),
  () => ({
    text: "📸 Influencerka z Letné chce s tebou natočit story.",
    choices: [
      { label: "Natočit", run: () => {
        for (let i = 0; i < 3; i++) { const d = rand(districtNames); addPop(d, 0.25); S.police[d] = Math.min(3.4, S.police[d] + 0.4); }
        logMessage("📸 Story zabrala! Popularita +0,25 ve třech čtvrtích, ale policie to taky viděla.");
      } },
      { label: "Odmítnout", run: () => logMessage("🙅 Žádná kamera, žádné problémy.") }
    ]
  }),
  () => ({
    cond: () => S.supply >= 2,
    text: "🧹 Uklízečka našla v koši sáček a dívá se na tebe.",
    choices: [
      { label: "Zaplatit 1 000 Kč za mlčení", run: () => {
        if (S.money >= 1000) { S.money -= 1000; logMessage("🤐 Uklízečka mlčí jako hrob."); }
        else logMessage("💸 Nemáš ani tisícovku. Uklízečka už volá.");
      } },
      { label: "Zahrát to na cukr", run: () => {
        if (Math.random() < 0.5) logMessage("🍬 „To je moučkový cukr, paní.“ Uklízečka kývla.");
        else { const d = rand(districtNames); logMessage(`🚨 Neuvěřila ti. Policie v ${d} je ve střehu.`); addHeat(d, 1); }
      } }
    ]
  }),
  () => ({
    text: "🍺 Kámoši tě zvou na pivo. Půjdeš?",
    choices: [
      { label: "Jít (−1 h)", run: () => {
        S.timeLeft = Math.max(0, round2(S.timeLeft - 1));
        addPopAll(0.15);
        if (Math.random() < 0.2) { const d = rand(districtNames); logMessage(`🍻 Popularita +0,15 všude, ale po pár pivech ses prořekl. Policie v ${d} je ve střehu.`); addHeat(d, 0.5); }
        else logMessage("🍻 Dobrý večer. Popularita +0,15 všude.");
      } },
      { label: "Ne, mám práci", run: () => logMessage("💼 Makáš dál.") }
    ]
  }),
  () => ({
    text: "🚖 Taxikář: „Kam to bude, šéfe? Dovezu rychle.“",
    choices: [
      { label: "Taxi (−800 Kč, +1 h)", run: () => {
        if (S.money >= 800) { S.money -= 800; S.timeLeft = Math.min(shiftLen(), round2(S.timeLeft + 1)); logMessage("🚖 Svezli tě bez zdržení, získal jsi hodinu zpátky."); }
        else logMessage("💸 Nemáš na taxi.");
      } },
      { label: "Ne", run: () => logMessage("🚶 Půjdeš pěšky.") }
    ]
  }),
  () => ({
    cond: () => S.supply >= 8,
    text: "💼 Nějaká „firma“ chce hned 8 g za 24 000 Kč. Trochu podezřelé.",
    choices: [
      { label: "Přijmout (−8 g, +24 000 Kč)", run: () => {
        S.supply -= 8;
        S.money += 24000;
        if (Math.random() < 0.3) { const d = rand(districtNames); logMessage(`🚨 „Firma“ byla pod dohledem. Policie v ${d} je ve střehu.`); addHeat(d, 1.5); }
        else logMessage("💰 Čistá práce, peníze na stole.");
      } },
      { label: "Odmítnout", run: () => logMessage("🧠 Raději ne, smrdí to.") }
    ]
  }),
  () => ({
    text: "📰 Novinář píše o „sněhové vlně“ v Praze a chce rozhovor.",
    choices: [
      { label: "Dát rozhovor (anonymně)", run: () => {
        addPopAll(0.15);
        districtNames.forEach(d => { S.police[d] = Math.min(3.4, S.police[d] + 0.3); });
        logMessage("📰 Anonymní zdroj z podsvětí! Popularita +0,15, ale policie se o tebe zajímá víc.");
      } },
      { label: "Odmítnout", run: () => logMessage("🤫 Žádné komentáře.") }
    ]
  }),
  () => ({
    text: "😤 Zákazník píše, že poslední dávka byla slabá a chce kompenzaci.",
    choices: [
      { label: "Vrátit 2 500 Kč", run: () => {
        if (S.money >= 2500) { S.money -= 2500; addPop(rand(districtNames), 0.1); logMessage("🤝 Spokojený zákazník, popularita +0,1."); }
        else logMessage("💸 Nemáš ani 2 500 Kč.");
      } },
      { label: "Dát 1 g navíc", run: () => {
        if (S.supply >= 1) { S.supply -= 1; addPop(rand(districtNames), 0.05); logMessage("🎁 Zákazník utichl. Popularita +0,05."); }
        else logMessage("🤷‍♂️ Nemáš ani gram.");
      } },
      { label: "Ignorovat", run: () => {
        telegramFeed({ custom: "🔴 Slabý, nedoporučuju. – anonym" });
        logMessage("😒 Zákazník to rozkecal.");
      } }
    ]
  })
  ,
  /* --- dobré události --- */
  () => ({
    mood: "good",
    text: "💌 Spokojený zákazník ti poslal spropitné 2 000 Kč. Vezmeš ho?",
    choices: [
      { label: "Vzít", run: () => { S.money += 2000; logMessage("💰 Spropitné přistálo na účtu. +2 000 Kč."); } },
      { label: "Poděkovat a odmítnout", run: () => { addPop(rand(districtNames), 0.15); logMessage("🤝 Zákazník je dojatý a rozkecá to dál. Popularita +0,15."); } }
    ]
  }),
  () => ({
    mood: "good",
    text: "📣 Kamarád tě doporučil v kanálu Snow Reviews. Lidi se ptají, kde tě najdou.",
    choices: [
      { label: "Poděkovat", run: () => { addPop(rand(districtNames), 0.2); logMessage("📈 Doporučení zabralo. Popularita +0,2 v jedné čtvrti."); } },
      { label: "Odpovědět memem", run: () => {
        if (Math.random() < 0.5) { addPopAll(0.1); logMessage("😂 Meme se chytil! Popularita +0,1 všude."); }
        else logMessage("🤷 Meme nikoho nepobavil, ale nic se nestalo.");
      } }
    ]
  }),
  () => ({
    mood: "good",
    text: "🍀 Šťastný den: v kabátě jsi našel zapomenuté 3 g.",
    choices: [
      { label: "Super, do stashe", run: () => { if (addSupply(3)) logMessage("❄️ +3 g do zásob."); } },
      { label: "Dát je kamarádovi", run: () => { addPop(rand(districtNames), 0.15); logMessage("🎁 Kamarád je štěstím bez sebe. Popularita +0,15."); } }
    ]
  }),
  () => ({
    mood: "good",
    text: "🏆 Místní blog napsal, že jsi nejlepší dealer čtvrti. Jak naložíš s pozorností?",
    choices: [
      { label: "Užít si slávu", run: () => { addPop(rand(districtNames), 0.25); logMessage("🌟 Sláva! Popularita +0,25 v jedné čtvrti."); } },
      { label: "Zůstat v anonymitě", run: () => {
        for (let i = 0; i < 2; i++) { const d = rand(districtNames); S.police[d] = Math.max(0, S.police[d] - 0.3); }
        logMessage("🕶️ Nikdo tě nezná a policie je o trochu klidnější.");
      } }
    ]
  })];

function clearEventTimer() {
  if (eventTimer) { clearInterval(eventTimer); eventTimer = null; }
}

// Eventy se losují na začátku dne (aby je nešlo přeskočit kliknutím na „Další den“).
// Den nejde ukončit, dokud nejsou všechny dnešní eventy zobrazené a vyřešené.
// Event přijde nejdřív 7 dní po předchozím a pak s 25% šancí denně (průměrně jednou za ~10 dní).
function scheduleEvents(afterMs) {
  eventsPending = (S.day - S.lastEventDay >= 7 && Math.random() < 0.25) ? 1 : 0;
  if (eventsPending) offerTimers.push(setTimeout(tryShowEvent, afterMs));
}

function tryShowEvent() {
  if (S.over || eventsPending <= 0) return;
  if (document.querySelector("#gameLog .one-take-event")) {   // jedna otevřená událost stačí, druhá počká
    offerTimers.push(setTimeout(tryShowEvent, 1500));
    return;
  }
  showEvent();
}

// události, které hráči spíš pomohou
const GOOD_EVENT_RE = /Našel jsi na zemi|narozky|sněhovou párty|Influencerka|Taxikář|spropitné|doporučil|Šťastný den|blog|burner/;
const isGoodEvent = e => e.mood === "good" || GOOD_EVENT_RE.test(e.text);

function showEvent() {
  // nepoužij event, který byl nedávno (posledních 10), a quicktime event nejvýš jednou za 10 dní
  const quickOk = S.day - S.lastQuickDay >= 10;
  const pool = EVENT_FACTORIES
    .map((f, idx) => ({ e: f(), idx }))
    .filter(x => (!x.e.cond || x.e.cond()) && !S.recentEvents.includes(x.idx) && (!x.e.timeout || quickOk));
  if (!pool.length) { eventsPending = Math.max(0, eventsPending - 1); return; }
  // 40 % událostí je dobrých (nález peněz, pochvala, spropitné…), ať to není samé neštěstí
  const good = pool.filter(x => isGoodEvent(x.e));
  const picked = good.length && Math.random() < 0.4 ? rand(good) : rand(pool);
  const e = picked.e;
  S.recentEvents.push(picked.idx);
  if (S.recentEvents.length > 10) S.recentEvents.shift();
  S.lastEventDay = S.day;
  if (e.timeout) S.lastQuickDay = S.day;

  // událost přijde jako zpráva od „Náhody“ s inline klávesnicí; quicktime má odpočet
  const b = incomingBubble(e.timeout ? "⚡ Quicktime" : "🎲 Událost", "", e.timeout ? "⚡" : "🎲");
  const box = b.row;
  box.classList.add("one-take-event");
  b.text.textContent = e.text;

  const kb = document.createElement("div");
  kb.className = "kb";
  b.col.appendChild(kb);

  let clock = null, bar = null;
  const finish = choice => {
    if (S.over || box.dataset.done) return;
    box.dataset.done = "1";
    clearEventTimer();
    eventsPending = Math.max(0, eventsPending - 1);
    kb.remove();
    if (clock) clock.remove();
    if (bar) bar.remove();
    box.classList.remove("one-take-event");   // vyřízeno, den už jde ukončit
    // odpověď a výsledek stojí přímo pod událostí
    withAnchor(box, () => {
      playerBubble(choice.label, { nick: "🎲 Událost", text: e.text });
      choice.run();
    });
    updateStatus();
  };
  e.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "kb-btn";
    btn.textContent = c.label;
    btn.onclick = () => finish(c);
    kb.appendChild(btn);
  });

  if (e.timeout) {
    let left = e.timeout;
    clock = document.createElement("div");
    clock.className = "event-clock bubble-time";
    clock.textContent = `⏳ ${left} s – rozhodni se rychle!`;
    bar = document.createElement("div");
    bar.className = "timer-bar";
    const fill = document.createElement("span");
    fill.style.transition = `width ${e.timeout}s linear`;
    bar.appendChild(fill);
    b.bubble.insertBefore(clock, b.time);
    b.bubble.insertBefore(bar, b.time);
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = "0%"; }));
    clearEventTimer();
    eventTimer = setInterval(() => {
      if (!box.isConnected) { clearEventTimer(); return; }
      left--;
      if (left <= 0) {
        logMessage("⏱️ Nestihl jsi se rozhodnout, jednal jsi instinktivně.");
        finish(e.choices[e.fallback]);
      } else clock.textContent = `⏳ ${left} s – rozhodni se rychle!`;
    }, 1000);
  }
  chatAppend(box);
  playSound("notif");
}

// Noční provoz: policejní kontakty snižují heat a prodejci prodávají část zásob ve svých čtvrtích.
function processStaff() {
  if (S.contact > 0) {
    const c = CONTACTS[S.contact - 1];
    if (S.money >= c.upkeep) {
      S.money -= c.upkeep;
      districtNames.forEach(d => { S.police[d] = Math.max(0, S.police[d] - c.cool); });
    } else {
      S.contact--;
      logImportantMessage(`🤝 ${c.name} s tebou skončil – nemáš na denní provoz (${fmt(c.upkeep)} Kč).`);
    }
  }
  processDealers();
}

// každý prodejce má tým (1/2), úroveň ceny a opatrnosti a možnost pozastavení; staré uložené hry mají jen číslo
function dealerInfo(d) {
  const x = S.dealers[d];
  if (typeof x === "number") S.dealers[d] = { cap: x === 2 ? 1 : 0, price: 0, stealth: 0, paused: false };   // nejstarší uložení
  const dd = S.dealers[d];
  if (dd && "team" in dd) { dd.cap = dd.team === 2 ? 1 : 0; delete dd.team; }                          // dřívější „tým“ → kapacita 1
  if (dd && dd.cap === undefined) dd.cap = 0;
  return dd;
}

// Heat, který přidá prodejcova objednávka (opatrnost ho snižuje)
const dealerHeatGain = (o, dd) => DEALER.heatPerG * (dd.stealth ? DEALER_STEALTH_LVLS[dd.stealth - 1].heat : 1) * o.grams;
// Prodejce heat nikdy nezvedne nad hranici bezpečného režimu (když je zapnutý) a nikdy nad 3,4 (zátah je až 3,5).
function dealerHeat(d, add) {
  const safety = DEALER_SAFETY[S.dealerSafety] || DEALER_SAFETY[0];
  const limit = safety.heat === null ? 3.4 : Math.min(3.4, safety.heat);
  S.police[d] = Math.max(S.police[d], Math.min(S.police[d] + add, limit));
}

// Prodejce ve čtvrti vyřídí příchozí poptávku sám, pokud není pozastavený ani stažený a má ještě denní kapacitu.
// Velkoodběry (kluby, hotely, firmy) mu nikdy nepadnou: ty zůstávají tobě. V bezpečném režimu nevezme objednávku,
// po které by heat přesáhl hranici režimu.
function dealerTakes(o) {
  if (o.vip) return false;
  if (!S.dealers[o.district]) return false;
  const dd = dealerInfo(o.district);
  if (dd.paused) return false;
  const safety = DEALER_SAFETY[S.dealerSafety];
  if (safety.heat !== null && S.police[o.district] + dealerHeatGain(o, dd) > safety.heat) return false;
  if ((S.dealerCount[o.district] || 0) >= dealerOffers(o.district, dd)) return false;
  return S.supply >= o.grams;
}

// Provede prodej přes prodejce hned (peníze, zásoby, heat) a o chvíli později v chatu ukáže jeho odpověď a výsledek.
function dealerSells(card, o, msgLen) {
  const d = o.district;
  const dd = dealerInfo(d);
  card.dataset.done = "1";
  card.classList.add("closed", "handled");
  S.dealerSold[d] = (S.dealerSold[d] || 0) + o.grams;
  S.dealerCount[d] = (S.dealerCount[d] || 0) + 1;
  S.supply -= o.grams;
  let text, bad = false;
  if (o.trap) {
    // past: prodejce přijde o zboží, heat roste a může skončit v poutech (opatrnost šanci snižuje)
    dealerHeat(d, 1.5);
    const arrested = Math.random() < [0.4, 0.3, 0.2, 0.1][dd.stealth];
    if (arrested) delete S.dealers[d];
    text = `🚓 Past! ${o.nickname} byl převlečený policista. Prodejce přišel o zboží (${o.grams} g)${arrested ? " a skončil v poutech" : ""}.`;
    bad = true;
  } else {
    const bonus = dd.price ? DEALER_PRICE_LVLS[dd.price - 1].bonus : 0;
    const payout = Math.round(o.price * DEALER.share * (1 + bonus) / 100) * 100;
    S.money += payout;
    S.stats.delivered++; S.stats.grams += o.grams; S.stats.earned += payout;
    S.today.delivered++; S.today.grams += o.grams;
    dealerHeat(d, dealerHeatGain(o, dd));
    S.idle[d] = 0;
    addPop(d, POP_PER_DELIVERY);   // doručená objednávka zvedá popularitu i když ji vyřídí prodejce
    text = `✅ Prodejce doručil ${o.grams} g do ${d}: +${fmt(payout)} Kč`;
  }
  checkHeat(d);
  // odpověď prodejce a výsledek se ukážou přímo pod poptávkou, až se dopíše zpráva zákazníka
  const delay = Math.min(3500, msgLen * 15 + 450);
  setTimeout(() => {
    if (!card.isConnected) return;
    withAnchor(card, () => {
      const q = card.querySelector(".bubble-text");
      playerBubble(rand(DEALER_REPLIES), { nick: o.nickname, text: q ? q.textContent : "" }, `🧑‍💼 Tvůj prodejce · ${d}`);
      sysMessage(text);
    });
  }, delay);
}

// Prodejci NIKDY nezpůsobí zátah na tebe: heat ve čtvrti zvednou nejvýš na 3,4 (zátah je až při 3,5).
// Zatčen může být jen prodejce (ztrácíš ho). Pozastavení a bezpečný režim ho ale před tím stáhnou.
// Prodejci prodávají jen poptávky, které přijdou (viz dealerTakes / dealerSells), v noci nic navíc neprodávají.
// Nemají pevnou výplatu: z každé objednávky si berou 15 % (DEALER.share).
function processDealers() {
  const ds = Object.keys(S.dealers).filter(d => districtNames.includes(d));
  if (!ds.length) return;
  const safety = DEALER_SAFETY[S.dealerSafety] || DEALER_SAFETY[0];
  const arrested = [], withdrawn = [];
  ds.forEach(d => {
    const dd = dealerInfo(d);
    const hidden = dd.paused || (safety.heat !== null && S.police[d] >= safety.heat);
    if (hidden) { if (!dd.paused) withdrawn.push(d); return; }
    // prodejce ve čtvrti, kde je policie moc blízko, může skončit v poutech (opatrnost šanci snižuje)
    const arrestRate = dd.stealth ? DEALER_STEALTH_LVLS[dd.stealth - 1].arrest : 0.10;
    if (S.police[d] >= 3 && Math.random() < arrestRate) { delete S.dealers[d]; arrested.push(d); }
  });
  withdrawn.forEach(d => logMessage(`🕶️ Prodejce v ${d} se stáhl – policie je moc blízko. Čeká, až se to uklidní.`));
  arrested.forEach(d => logImportantMessage(`🚔 Tvého prodejce v ${d} zatkli. Policie tam byla moc blízko.`));
}
// odemknutí nové čtvrti
function unlockDistrict(d) {
  if (S.over || S.unlocked.includes(d) || !EXTRA_DISTRICTS[d]) return;
  S.unlocked.push(d);
  S.pop[d] = 0; S.police[d] = 0; S.warned[d] = 0; S.idle[d] = 0; S.freq[d] = 0;
  syncDistricts();
  logMessage(`🗺️ Nová čtvrť: ${d}. Zákazníci odtamtud ti začnou psát.`);
}

// důsledky eventů, které přijdou o pár dní později
function processPending() {
  const due = S.pending.filter(p => p.day <= S.day);
  S.pending = S.pending.filter(p => p.day > S.day);
  due.forEach(p => {
    if (p.type === "loan") {
      if (S.money >= p.amount) {
        S.money -= p.amount;
        logImportantMessage(`🦈 Lichvář si přišel pro ${fmt(p.amount)} Kč. Zaplaceno.`);
      } else {
        const missing = p.amount - S.money;
        S.money = 0;
        S.debt += Math.round(missing * 1.1);
        const d = rand(districtNames);
        logImportantMessage(`🦈 Lichvář nedostal všechno. Zbývá ${fmt(Math.round(missing * 1.1))} Kč dluhu (přičte se k nájmu) a rozkřiklo se to v ${d}.`);
        addHeat(d, 1);
      }
    } else if (p.type === "credit") {
      if (Math.random() < 0.75) {
        S.money += p.amount;
        logImportantMessage(`🤝 Kamarád to vrátil: +${fmt(p.amount)} Kč.`);
      } else {
        logImportantMessage("😤 Kamarád se vypařil i s tvým zbožím. Dluh se nevrátil.");
        telegramFeed({ negative: true, nickname: p.nick });
      }
    }
  });
}

/* =====================================================================
   DODAVATELÉ, AUTA, ZÁZEMÍ, ZMATENÍ POLICIE
   ===================================================================== */
function supplierMult(name, opt) {
  if (name === "Ledovec") return opt.grams >= 50 ? 0.88 : 1.05;
  return SUPPLIERS[name].mult;
}

function refreshSuppliers() {
  S.market = round2(0.9 + Math.random() * 0.2);
  S.supplierOffers = [];
  const names = Object.keys(SUPPLIERS).sort(() => Math.random() - 0.5).slice(0, 3);
  // z toho, co se vejde do kapacity, se losují 3 ze čtyř největších zásilek
  const fitting = SUPPLY_OPTIONS.filter(o => o.grams <= cap()).slice(-4);
  names.forEach(name => {
    const opts = fitting.slice().sort(() => Math.random() - 0.5).slice(0, 3).sort((a, b) => a.grams - b.grams);
    opts.forEach(o => {
      const price = Math.round(o.basePrice * supplierMult(name, o) * S.market * (0.92 + Math.random() * 0.16) / 100) * 100;
      S.supplierOffers.push({ id: ++S.seq, supplier: name, grams: o.grams, price, note: SUPPLIERS[name].note });
    });
  });

  // záchranná síť: nemáš skoro nic a nemáš ani na nejlevnější nabídku -> @cmoud ti půjčí na dluh
  const cheapest = Math.min(...S.supplierOffers.map(o => o.price));
  if (S.supply < 2 && S.money < cheapest && S.debt < rentFor(S.day)) {
    S.supplierOffers.push({
      id: ++S.seq, supplier: "@cmoud", grams: 3, price: 0, debt: 5000,
      note: "starý známý, půjčí ti na dluh (5 000 Kč se přičte k nájmu)"
    });
  }
}

const daysToMonday = () => (7 - ((S.day - 1) % 7)) % 7;

function buyStock(price, grams, supplierName, offerId) {
  if (S.over) return false;
  const offer = S.supplierOffers.find(o => o.id === offerId);
  if (S.money < price) { logMessage("❌ Nemáš dost peněz."); return false; }
  if (S.supply + grams > cap()) {
    logMessage(`❌ Nevejde se ti to – kapacita je ${cap()} g (máš ${S.supply} g). Vylepši si zázemí.`);
    return false;
  }
  S.money -= price;
  if (offer && offer.debt) {
    S.debt += offer.debt;
    logMessage(`🤝 ${supplierName} ti půjčil ${grams}g na dluh (+${fmt(offer.debt)} Kč k nájmu).`);
  }
  let got = grams;
  const sup = SUPPLIERS[supplierName];
  if (sup && Math.random() < sup.scam) {
    got = Math.max(1, Math.ceil(grams * 0.6));
    logMessage(`😡 ${supplierName} tě ošidil – za ${fmt(price)} Kč jsi dostal jen ${got}g!`);
  } else {
    logMessage(`✅ ${supplierName}: koupil jsi ${got}g za ${fmt(price)} Kč.`);
  }
  S.supply += got;
  S.boughtToday = true;
  if (offerId) S.supplierOffers = S.supplierOffers.filter(o => o.id !== offerId);
  updateStatus();
  return true;
}

function renderSuppliers() {
  const box = $("supplierPanel");
  box.innerHTML = "";
  // zelená tečka na záložce, když dodavatelé zrovna jsou
  document.querySelector('#shopTabs .tab[data-tab="supplierPanel"]').classList.toggle("has-offers", S.supplierOffers.length > 0);
  const title = document.createElement("strong");
  const pct = Math.round((S.market - 1) * 100);
  title.textContent = S.supplierOffers.length
    ? `📦 Dodavatelé jsou tady jen DNES · trh ${pct >= 0 ? "+" : ""}${pct} %`
    : "📦 Dodavatelé";
  box.appendChild(title);
  const capLine = document.createElement("div");
  capLine.className = "hint";
  capLine.textContent = `Kapacita: ${S.supply}/${cap()} g (${CAPACITY[S.capLevel].name})`;
  box.appendChild(capLine);

  if (!S.supplierOffers.length) {
    const toMonday = daysToMonday();
    const none = document.createElement("div");
    none.className = "row-label";
    none.textContent = dayName(S.day) === "Pondělí"
      ? "Všechno vykoupeno. Další dodavatelé přijdou příští pondělí."
      : `Dnes nikdo nevozí. Další dodavatelé v pondělí (za ${toMonday} ${toMonday === 1 ? "den" : toMonday < 5 ? "dny" : "dní"}). Plánuj zásoby!`;
    box.appendChild(none);
  }

  const bySupplier = {};
  S.supplierOffers.forEach(o => (bySupplier[o.supplier] = bySupplier[o.supplier] || []).push(o));
  Object.keys(bySupplier).forEach(name => {
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = `${name} – ${bySupplier[name][0].note}`;
    row.appendChild(label);
    bySupplier[name].forEach(o => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = o.debt ? `${o.grams} g na dluh` : `${o.grams} g – ${fmt(o.price)} Kč`;
      b.disabled = S.money < o.price;
      b.onclick = () => buyStock(o.price, o.grams, name, o.id);
      row.appendChild(b);
    });
    box.appendChild(row);
  });
}

function renderCars() {
  const box = $("carOptions");
  box.innerHTML = "";
  const cur = carByName(S.car);
  const title = document.createElement("strong");
  title.textContent = "🚗 Auta";
  box.appendChild(title);
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "Rychlejší doručení a popularita, ale víc nápadné pro policii a platíš provoz každý den.";
  box.appendChild(hint);
  const better = CARS.filter(c => c.price > cur.price);
  if (!better.length) {
    const d = document.createElement("div");
    d.textContent = "Máš nejlepší auto, které se dá koupit.";
    box.appendChild(d);
  }
  better.forEach(car => {
    const faster = Math.round((car.speed / cur.speed - 1) * 100);
    const row = document.createElement("div");
    row.className = "row";
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `${car.name} – ${fmt(car.price)} Kč`;
    btn.disabled = S.money < car.price;
    btn.onclick = () => {
      if (S.over || S.money < car.price) return;
      S.money -= car.price;
      S.car = car.name;
      S.carDown = false;
      addPopAll(car.pop);
      logMessage(`✅ Koupil jsi ${car.name}. Popularita +${car.pop}, provoz ${fmt(car.upkeep)} Kč/den od zítřka.`);
      if (car.name === "🏎️ BMW M4") unlock("m4");
      updateStatus();
    };
    row.appendChild(btn);
    const stats = document.createElement("span");
    stats.className = "row-label";
    stats.textContent = `⏱️ cesty o ${faster} % rychlejší · 🌟 +${car.pop} · 🚨 heat ×${car.heat} · 🔧 ${fmt(car.upkeep)} Kč/den – ${car.note}`;
    row.appendChild(stats);
    box.appendChild(row);
  });
}

function renderUpgrades() {
  const box = $("upgradeRow");
  box.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = "🏠 Zázemí";
  box.appendChild(title);
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "Kapacita stashe, právník, kurýr, policejní kontakty, prodejci a nové čtvrti.";
  box.appendChild(hint);

  const add = (text, price, tooltip, fn, parent = box) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = `${text} – ${fmt(price)} Kč`;
    b.title = tooltip;
    b.disabled = S.money < price;
    b.onclick = () => {
      if (S.over || S.money < price) return;
      S.money -= price;
      fn();
      updateStatus();
    };
    parent.appendChild(b);
  };
  const heading = (text, hintText) => {
    const h = document.createElement("div");
    h.className = "subhead";
    h.textContent = text;
    box.appendChild(h);
    if (hintText) {
      const x = document.createElement("div");
      x.className = "hint";
      x.textContent = hintText;
      box.appendChild(x);
    }
  };
  const comma = n => String(n).replace(".", ",");

  if (S.capLevel < CAPACITY.length - 1) {
    const next = CAPACITY[S.capLevel + 1];
    add(`📦 ${next.name} (${next.cap} g)`, next.price, `Zvýší kapacitu stashe z ${cap()} g na ${next.cap} g.`, () => {
      S.capLevel++;
      logMessage(`📦 Nové zázemí: ${next.name}, kapacita ${next.cap} g.`);
    });
  }
  if (!S.lawyer) {
    add("⚖️ Právník", LAWYER_PRICE, "Jednou tě zachrání při zátahu: zátah se nezapočítá do vězení.", () => {
      S.lawyer = true;
      logMessage("⚖️ Právník je na telefonu. Příští zátah ti nezapočítá.");
    });
  }
  if (S.runners < RUNNERS.length) {
    const r = RUNNERS[S.runners];
    add(`🏃 Kurýr #${S.runners + 1} (směna o hodinu delší)`, r.price, `Provoz ${fmt(r.upkeep)} Kč denně. Když na něj nebudou peníze, odejde.`, () => {
      S.runners++;
      logMessage(`🏃 Najal jsi kurýra. Od zítřka máš směnu o hodinu delší (provoz ${fmt(runnerUpkeep())} Kč/den).`);
    });
  }
  // --- policejní kontakty: pasivní snižování heatu ---
  const cur = S.contact ? CONTACTS[S.contact - 1] : null;
  heading("🤝 Policejní kontakty", cur
    ? `Máš: ${cur.name} – heat −${comma(cur.cool)} denně ve všech čtvrtích, provoz ${fmt(cur.upkeep)} Kč/den.`
    : "Pasivně snižují heat ve všech čtvrtích každý den za denní provoz. Nemusíš pořád kupovat SIM a holiče.");
  if (S.contact < CONTACTS.length) {
    const c = CONTACTS[S.contact];
    add(`🤝 ${c.name}`, c.price, `Heat −${comma(c.cool)} denně ve všech čtvrtích, provoz ${fmt(c.upkeep)} Kč/den. Nahradí předchozího.`, () => {
      S.contact++;
      logMessage(`🤝 Nový kontakt: ${c.name}. Heat bude klesat o ${comma(c.cool)} denně (provoz ${fmt(c.upkeep)} Kč/den).`);
    });
  }

  // --- prodejci ve čtvrtích ---
  heading("🧑‍💼 Prodejci", `Vyřizují za tebe poptávky, které přijdou z jejich čtvrti, z tvého stashe. Berou si ${Math.round((1 - DEALER.share) * 100)} % z ceny objednávky, žádná pevná výplata. Nic navíc neprodávají. Zvedají heat, ale na tebe zátah nikdy nepřivolají (heat zvednou nejvýš těsně pod zátah), prodejce ale může skončit v poutech.`);
  // bezpečný režim: prodejci se při vysoké policii stáhnou
  const safetyRow = document.createElement("div");
  safetyRow.className = "row dealer-row";
  const sb = document.createElement("button");
  sb.className = "btn";
  sb.textContent = `🛡️ Bezpečný režim: ${DEALER_SAFETY[S.dealerSafety].label}`;
  sb.title = "Když je ve čtvrti policie nad touto hranicí, prodejce se stáhne (neprodává, nezvedá heat). Klikni pro změnu.";
  sb.onclick = () => { S.dealerSafety = (S.dealerSafety + 1) % DEALER_SAFETY.length; updateStatus(); };
  safetyRow.appendChild(sb);
  box.appendChild(safetyRow);

  // tlačítko bez ceny (pozastavení, propuštění)
  const act = (text, tooltip, fn, parent) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = text;
    b.title = tooltip;
    b.onclick = () => { if (!S.over) fn(); };
    parent.appendChild(b);
  };

  districtNames.forEach(d => {
    const dd = S.dealers[d] ? dealerInfo(d) : null;
    const row = document.createElement("div");
    row.className = "row dealer-row";
    const label = document.createElement("span");
    label.className = "row-label";
    if (!dd) {
      label.textContent = `${d}: nikdo `;
      row.appendChild(label);
      add("Najmout", dealerHireCost(), `Vyřizuje poptávky z čtvrti sám (teď až ${dealerBase(d)} denně, ty to uvidíš v chatu), velkoodběry nechává tobě. Bere si ${Math.round((1 - DEALER.share) * 100)} % z ceny objednávky, žádná pevná výplata. Každý další prodejce je o ${fmt(DEALER.hireStep)} Kč dražší. Kapacitu jde zvýšit upgradem. Při nízké popularitě mu chodí málo objednávek.`, () => {
        S.dealers[d] = { cap: 0, price: 0, stealth: 0, paused: false };
        logMessage(`🧑‍💼 Najal jsi prodejce v ${d} (bere si ${Math.round((1 - DEALER.share) * 100)} % z objednávek).`);
      }, row);
      box.appendChild(row);
      return;
    }
    const safety = DEALER_SAFETY[S.dealerSafety];
    const hidden = !dd.paused && safety.heat !== null && S.police[d] >= safety.heat;
    const bonus = dd.price ? `+${Math.round(DEALER_PRICE_LVLS[dd.price - 1].bonus * 100)} % cena` : "základní cena";
    const heat = dd.stealth ? `−${Math.round((1 - DEALER_STEALTH_LVLS[dd.stealth - 1].heat) * 100)} % heat` : "běžný heat";
    label.textContent = `${d}: prodejce (vyřídí denně ${dealerOffers(d, dd)} ${poptavek(dealerOffers(d, dd))}) · ${bonus} · ${heat}${dd.paused ? " · ⏸️ pozastaven" : hidden ? " · 🕶️ stažený" : ""} `;
    row.appendChild(label);
    if (dd.cap < DEALER_CAP_LVLS.length) {
      const u = DEALER_CAP_LVLS[dd.cap];
      add(`📈 Kapacita +${u.add} ${poptavek(u.add)} denně`, u.cost, `Prodejce vyřídí denně o ${u.add} ${poptavek(u.add)} víc (celkem ${dealerBase(d) + u.add}).`, () => {
        dd.cap++;
        logMessage(`📈 Prodejce v ${d} zvládne víc: ${dealerBase(d) + u.add} ${poptavek(dealerBase(d) + u.add)} denně.`);
      }, row);
    }
    if (dd.price < DEALER_PRICE_LVLS.length) {
      const u = DEALER_PRICE_LVLS[dd.price];
      add(`💰 Cena +${Math.round(u.bonus * 100)} %`, u.cost, `Prodává za ${Math.round(u.bonus * 100)} % víc.`, () => {
        dd.price++;
        logMessage(`💰 Prodejce v ${d} vyjednal lepší ceny (+${Math.round(u.bonus * 100)} %).`);
      }, row);
    }
    if (dd.stealth < DEALER_STEALTH_LVLS.length) {
      const u = DEALER_STEALTH_LVLS[dd.stealth];
      add(`🕶️ Opatrnost −${Math.round((1 - u.heat) * 100)} % heat`, u.cost, `Zvedá heat o ${Math.round((1 - u.heat) * 100)} % méně a šance na zatčení klesne na ${Math.round(u.arrest * 100)} %.`, () => {
        dd.stealth++;
        logMessage(`🕶️ Prodejce v ${d} je opatrnější (−${Math.round((1 - u.heat) * 100)} % heat).`);
      }, row);
    }
    act(dd.paused ? "▶️ Obnovit" : "⏸️ Pozastavit", dd.paused ? "Prodejce zase začne prodávat." : "Prodejce nic neprodává a nezvedá heat.", () => {
      dd.paused = !dd.paused;
      updateStatus();
    }, row);
    act("✖ Propustit", "Prodejce odejde. Vylepšení se ztratí.", () => {
      askConfirm(`Opravdu propustit prodejce v ${d}? Přijdeš o jeho vylepšení.`, "Propustit", "Ne", () => { delete S.dealers[d]; logMessage(`🧑‍💼 Prodejce v ${d} jsi propustil.`); updateStatus(); }, () => {});
    }, row);
    box.appendChild(row);
  });
  // --- nové čtvrti ---
  const locked = Object.keys(EXTRA_DISTRICTS).filter(d => !S.unlocked.includes(d));
  if (locked.length) {
    heading("🗺️ Nové čtvrti", "Kontakty v další čtvrti: odtamtud ti začnou psát noví zákazníci.");
    locked.forEach(d => add(`🗺️ ${d}`, EXTRA_DISTRICTS[d], `Odemkne čtvrť ${d} na mapě.`, () => unlockDistrict(d)));
  }
}

function renderSecurity() {
  const box = $("securityRow");
  box.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = "📡 Zmatení policie";
  box.appendChild(title);
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = S.secUsed
    ? "SIM, mobil a úplatek: dnes už jsi jednu věc použil. Holič má vlastní týdenní pauzu."
    : "Snižuje heat. SIM, mobil a úplatek: jedna věc denně. Holič: jednou týdně, nezávisle na ostatních.";
  box.appendChild(hint);

  const barberWait = S.lastHaircutDay !== null ? S.lastHaircutDay + 7 - S.day : 0;

  // daily = sdílí denní limit (jedna věc denně); jinak platí jen vlastní podmínka (extraDisabled)
  const add = (text, cost, tooltip, daily, extraDisabled, fn) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = `${text} – ${fmt(cost)} Kč`;
    b.title = tooltip;
    b.disabled = (daily && S.secUsed) || S.money < cost || extraDisabled;
    b.onclick = () => {
      if (S.over || (daily && S.secUsed) || S.money < cost || extraDisabled) return;
      S.money -= cost;
      if (daily) S.secUsed = true;
      fn();
      updateStatus();
    };
    box.appendChild(b);
  };

  add(barberWait > 0 ? `💈 Holič (za ${barberWait} d)` : "💈 Holič", 2000,
    barberWait > 0 ? `Vlasy ti ještě musejí dorůst (${barberWait} dní).` : "Jednou týdně: popularita +0,05 a heat −0,3 všude.",
    false, barberWait > 0, () => {
      S.lastHaircutDay = S.day;
      addPopAll(0.05);
      districtNames.forEach(d => { S.police[d] = Math.max(0, S.police[d] - 0.3); });
      logMessage("💈 Nový sestřih – popularita mírně vzrostla a policie je trochu klidnější.");
    });
  add("📱 Změnit SIM", 5000, "Heat −0,6 ve všech čtvrtích.", true, false, () => {
    districtNames.forEach(d => { S.police[d] = Math.max(0, S.police[d] - 0.6); });
    logMessage("📱 SIM změněna – policie ztrácí stopu.");
  });
  add("📲 Nový mobil", 25000, "Heat −1 ve všech čtvrtích.", true, false, () => {
    districtNames.forEach(d => { S.police[d] = Math.max(0, S.police[d] - 1); });
    logMessage("📲 Nový telefon – policie nemá stopy.");
  });
  add("💵 Úplatek", 75000, "Heat na nulu ve všech čtvrtích.", true, false, () => {
    districtNames.forEach(d => { S.police[d] = 0; });
    logMessage("💵 Policie podplacena – hledanost vynulována.");
  });
}

/* =====================================================================
   STATUS A TABULKA ČTVRTÍ
   ===================================================================== */
/* ---------- mapa se stavem čtvrtí ---------- */
const MAP_W = 440, MAP_H = 430;
const MAP_BOUNDS = { x0: -4.5, x1: 4.4, y0: -7.6, y1: 5.5 };
function mapPoint(p) {
  return {
    x: 125 + (p.x - MAP_BOUNDS.x0) / (MAP_BOUNDS.x1 - MAP_BOUNDS.x0) * 190,
    y: 30 + (MAP_BOUNDS.y1 - p.y) / (MAP_BOUNDS.y1 - MAP_BOUNDS.y0) * (MAP_H - 70)
  };
}
const heatColor = h => (h >= 3 ? "#e5484d" : h >= 2 ? "#f5a524" : h >= 1 ? "#c9b83a" : "#3fae6a");
const POP_COLOR = "#4da3ff";

// úroveň známosti čtvrti: ikona a název
function popInfo(pop) {
  if (pop >= 4) return { icon: "👑", label: "Legenda" };
  if (pop >= 3) return { icon: "💫", label: "Celebrita" };
  if (pop >= 2) return { icon: "🔥", label: "Hvězda" };
  if (pop >= 1) return { icon: "🌟", label: "Známý" };
  if (pop >= 0.5) return { icon: "📦", label: "Místní" };
  return { icon: "🕳️", label: "Neznámý" };
}

// půlkruhový měřič kolem bodu: left = zleva zdola nahoru, right = zprava zdola nahoru; frac 0–1
function halfArc(cx, cy, r, side, frac) {
  const f = Math.max(0, Math.min(1, frac));
  if (f <= 0) return "";
  const a0 = Math.PI / 2;                                  // dole
  const a1 = side === "left" ? a0 + Math.PI * f : a0 - Math.PI * f;
  const pt = a => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  return `M${pt(a0)} A${r},${r} 0 0 ${side === "left" ? 1 : 0} ${pt(a1)}`;
}

// Mapa Prahy místo tabulky čtvrtí. Každý uzel je kruh rozdělený na dvě poloviny:
//  • LEVÝ půlkruh (modrý) = popularita, plní se zdola nahoru, 🌟 vedle jména
//  • PRAVÝ půlkruh (zelená → červená) = policie, při plném kruhu přijde zátah, 🚨 vedle jména
//  • číslo na uzlu = čekající poptávky, čárkovaná trasa = cesta k nim s časem
//  • bílá tečka s pulzem = kde právě jsi
function renderMap() {
  const box = $("mapBox");
  if (!box || !S) return;
  const open = {};
  document.querySelectorAll("#gameLog .offer").forEach(card => {
    if (card.dataset.done || !card._offer) return;
    open[card.dataset.district] = (open[card.dataset.district] || 0) + 1;
  });
  const me = S.loc === "home" ? HOME : districts[S.loc];
  const mp = mapPoint(me);
  $("mapWhere").textContent = S.loc === "home" ? "· jsi doma" : `· jsi v ${S.loc}`;

  // Vltava jako dekorace: od severu mezi Letnou a Holešovicemi dolů na jih
  const rv = [{ x: 1.3, y: 5.5 }, { x: 0.0, y: 3.0 }, { x: -0.6, y: 0.8 }, { x: -0.3, y: -1.6 }, { x: 0.1, y: -4.2 }, { x: 0.3, y: -6.2 }, { x: -0.2, y: -7.6 }].map(mapPoint);
  const river = `M${rv[0].x},${rv[0].y} C${rv[1].x},${rv[1].y} ${rv[2].x},${rv[2].y} ${rv[3].x},${rv[3].y} S${rv[5].x},${rv[5].y} ${rv[6].x},${rv[6].y}`;

  const R = 16;
  let lines = "", labels = "", nodes = "";
  districtNames.forEach(d => {
    const dd = districts[d];
    const p = mapPoint(dd);
    const h = S.police[d] || 0;
    const hp = Math.round(h / 3.5 * 100);
    const info = popInfo(S.pop[d]);
    const col = heatColor(h);
    const right = dd.side === "right";
    const lx = right ? p.x + R + 8 : p.x - R - 8;
    const anchor = right ? "start" : "end";

    // čas cesty a příjezd píšeme ke jménu čtvrti (nepřekrývá se s trasami a kruhy)
    const eta = open[d] ? travelTime(S.loc, d) : null;
    // trasa z místa, kde jsi, k čtvrti s poptávkou (končí u okraje kruhu)
    if (open[d] && S.loc !== d) {
      const dx = p.x - mp.x, dy = p.y - mp.y, L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      const a = (S.loc === "home" ? 12 : R + 4), b = R + 5;
      if (L > a + b + 6) {
        const x1 = mp.x + ux * a, y1 = mp.y + uy * a, x2 = p.x - ux * b, y2 = p.y - uy * b;
        lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="route"/>`;
      }
    }

    nodes += `<g class="node${S.loc === d ? " here" : ""}${h >= 3 ? " danger" : ""}">
      <title>${d}\n🌟 popularita: ${info.label} (${S.pop[d].toFixed(1)}/${POP_MAX})\n🚨 policie: ${hp} %</title>
      <circle cx="${p.x}" cy="${p.y}" r="${R - 3}" class="disc"/>
      <path d="${halfArc(p.x, p.y, R, "left", 1)}" class="arc-bg"/>
      <path d="${halfArc(p.x, p.y, R, "right", 1)}" class="arc-bg"/>
      <path d="${halfArc(p.x, p.y, R, "left", S.pop[d] / POP_MAX)}" class="arc pop"/>
      <path d="${halfArc(p.x, p.y, R, "right", h / 3.5)}" class="arc heat" stroke="${col}"/>
      <text x="${lx}" y="${p.y - 6}" class="node-label" text-anchor="${anchor}">${d}</text>
      <text x="${lx}" y="${p.y + 5}" class="node-sub" text-anchor="${anchor}" fill="${POP_COLOR}">${info.icon} ${info.label}</text>
      <text x="${lx}" y="${p.y + 15.5}" class="node-sub" text-anchor="${anchor}" fill="${col}">🚨 ${hp} %</text>
      ${eta !== null ? `<text x="${lx}" y="${p.y + 26}" class="node-eta" text-anchor="${anchor}">🕘 ${clockAt(eta)} · ${fmtDur(eta)}</text>` : ""}
      ${open[d] ? `<circle cx="${p.x}" cy="${p.y}" r="8.5" class="badge-c"/><text x="${p.x}" y="${p.y + 3.8}" class="badge-t">${open[d]}</text>` : ""}
    </g>`;
  });
  // zamčené čtvrti jako stín: ukazují, kam se dá rozšířit
  Object.keys(EXTRA_DISTRICTS).filter(d => !S.unlocked.includes(d)).forEach(d => {
    const dd = districts[d], p = mapPoint(dd), right = dd.side === "right";
    const lx = right ? p.x + 24 : p.x - 24, anchor = right ? "start" : "end";
    nodes += `<g class="node locked">
      <title>${d} – odemkni v záložce Zázemí (${fmt(EXTRA_DISTRICTS[d])} Kč)</title>
      <circle cx="${p.x}" cy="${p.y}" r="14" class="ghost"/>
      <text x="${p.x}" y="${p.y + 4}" class="core-i" text-anchor="middle">🔒</text>
      <text x="${lx}" y="${p.y - 2}" class="node-label dim" text-anchor="${anchor}">${d}</text>
      <text x="${lx}" y="${p.y + 10}" class="node-sub" text-anchor="${anchor}" fill="#7d8e9f">${fmt(EXTRA_DISTRICTS[d])} Kč</text>
    </g>`;
  });
  const hp = mapPoint(HOME);
  box.innerHTML = `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="map-svg" role="img" aria-label="Mapa čtvrtí">
    <path d="${river}" class="river"/>
    ${lines}
    ${nodes}
    <text x="${hp.x}" y="${hp.y + 5}" class="home-t">🏠</text>
    ${labels}
    <circle cx="${mp.x}" cy="${mp.y}" r="9" class="ping"/>
    <circle cx="${mp.x}" cy="${mp.y}" r="5" class="me-dot"/>
  </svg>
  <div class="map-legend muted"><span style="color:${POP_COLOR}">◖ levý půlkruh = popularita 🌟</span> · <span style="color:#e5a24d">pravý = policie 🚨 (plný kruh = zátah)</span> · číslo = čekající poptávky · ● ty</div>`;
}
function daysToRent() { return (30 - (S.day % 30)) % 30; }

function updateStatus() {
  if (!S) return;
  if (S.money > (S.stats.peak || 0)) S.stats.peak = S.money;
  // po snížení heatu se může varování zase "odemknout"
  districtNames.forEach(d => { S.warned[d] = Math.min(S.warned[d], heatLevel(S.police[d])); });

  const toRent = daysToRent();
  const rentAmount = rentFor(S.day + toRent) + S.debt;
  const stashWarn = S.supply === 0 ? " warn" : "";
  $("status").innerHTML = `
    <div class="pill"><span class="pi">📅</span><b>${dayName(S.day)}</b><small>den ${S.day}</small></div>
    <div class="pill money"><span class="pi">💰</span><b>${fmt(S.money)} Kč</b></div>
    <div class="pill${stashWarn}"><span class="pi">❄️</span><b>${S.supply}/${cap()} g</b></div>
    <div class="pill${S.timeLeft < 0.5 ? " warn" : ""}"><span class="pi">🕗</span><b>${clockAt()}</b><small>do ${shiftEndClock()}</small></div>`;

  const pct = Math.min(100, S.money / GOAL_MONEY * 100);
  const chips = [
    `<span class="chip${S.strikes ? " warn" : ""}">⚖️ zátahy ${S.strikes}/${MAX_RAIDS}${S.lawyer ? " · právník ✔" : ""}</span>`,
    `<span class="chip${toRent <= 5 ? " warn" : ""}">🏚️ ${toRent === 0 ? "nájem dnes" : `nájem za ${toRent} d`} · ${fmt(rentAmount)} Kč</span>`
  ];
  if (S.debt > 0) chips.push(`<span class="chip bad">💳 dluh ${fmt(S.debt)} Kč</span>`);
  $("goalBox").innerHTML = `
    <div class="goal-top"><span>🎯 Cíl: ${fmt(GOAL_MONEY)} Kč${S.endless ? " (splněno)" : ""}</span><b>${pct.toFixed(pct < 10 ? 1 : 0)} %</b></div>
    <div class="goal-bar"><span style="width:${pct}%"></span></div>
    <div class="chips">${chips.join("")}</div>`;

  const car = carByName(S.car);
  const runner = S.runners ? ` · 🏃 kurýři: ${S.runners}` : "";
  const upkeep = car.upkeep ? ` · 🔧 ${fmt(car.upkeep)} Kč/den` : "";
  const down = S.carDown ? " · ⚠️ auto stojí (nezaplacený provoz), jedeš tramvají" : "";
  $("carInfo").textContent = `🚗 ${S.car} · rychlost ${fmtH(car.speed)} km/h · policie ×${car.heat}${upkeep}${runner}${down}`;

  // odběratelé kanálu rostou s tvou slávou
  const subs = Math.round(1200 + S.stats.delivered * 41 + districtNames.reduce((a, d) => a + S.pop[d], 0) * 440);
  $("subsCount").textContent = `kanál · ${fmt(subs)} odběratelů`;

  renderSecurity();
  renderCars();
  renderUpgrades();
  renderSuppliers();
  refreshOfferTimes();
  renderMap();

  if (!S.over && !S.won && !S.endless && S.money >= GOAL_MONEY) victory();
}

/* =====================================================================
   KONEC HRY
   ===================================================================== */
function showEnd(title, text, canContinue) {
  clearOfferTimers();
  $("endTitle").textContent = title;
  $("endText").textContent = text;
  $("endStats").innerHTML = `
    📅 Dní přežito: ${S.day}<br>
    📦 Doručených objednávek: ${S.stats.delivered} (${S.stats.grams} g)<br>
    💰 Celkem vyděláno: ${fmt(S.stats.earned)} Kč<br>
    🚨 Zátahů: ${S.stats.raids}<br>
    🏆 Achievementy: ${unlocked.size}/${Object.keys(ACHIEVEMENTS).length}`;
  $("endContinue").style.display = canContinue ? "" : "none";
  $("endScreen").style.display = "flex";
}

function endGame(title, text) {
  S.over = true;
  clearSave();
  showEnd(title, text, false);
  cloudPush();           // v cloudu se hra označí jako skončená
  finishRun(false);
}

function victory() {
  S.won = true;
  unlock("rich");
  clearOfferTimers();
  showEnd("🏆 VYHRÁL JSI!", `Našetřil jsi ${fmt(GOAL_MONEY)} Kč za ${S.day} dní. Čas zmizet z Prahy… nebo to ještě chvíli protáhnout.`, true);
  finishRun(true);
}

function continueAfterWin() {
  S.endless = true;
  $("endScreen").style.display = "none";
  updateStatus();
  saveGame();
}

/* =====================================================================
   DENNÍ PŘECHOD
   ===================================================================== */
function payRent() {
  const rent = rentFor(S.day) + S.debt;
  if (S.money >= rent) {
    S.money -= rent;
    S.debt = 0;
    logImportantMessage(`🏚️ Platíš nájem: −${fmt(rent)} Kč. Praha není levná...`);
    unlock("month");
    return true;
  }
  // nezaplacený nájem: majitel vezme až 7 g a zbytek se mění v dluh (+10 %)
  const taken = Math.min(S.supply, 7);
  S.supply -= taken;
  S.debt = Math.round(rent * 1.1);
  if (S.debt > rentFor(S.day) * 2.5) {
    updateStatus();
    endGame("💀 VYHOZEN", "Dluhy za nájem ti přerostly přes hlavu – majitel bytu tě vyhodil a odstěhoval ses do Brna.");
    return false;
  }
  logImportantMessage(`😡 Nemáš na nájem (${fmt(rent)} Kč)! Majitel si vzal ${taken}g ze stashe a dluh se zvedl na ${fmt(S.debt)} Kč. Příště tě vyhodí, pokud ho nesplatíš.`);
  return true;
}

function nextDay() {
  if (S.over) return;
  // událost se nedá přeskočit: nejdřív ji musíš vyřešit (nebo dojde čas u quicktime eventu)
  if (document.querySelector("#gameLog .one-take-event")) {
    logMessage("❗ Nejdřív vyřeš událost, pak půjdeš spát.");
    return;
  }
  if (eventsPending > 0) {
    logMessage("⏳ Dnes se ještě něco stane – chvilku počkej.");
    return;
  }
  // dodavatelé jsou jen dnes: nenech hráče omylem přijít o nákup na celý týden
  if (supplierWarningNeeded()) {
    askConfirm(
      `📦 Dnes jsou dodavatelé a ještě jsi nic nenakoupil. Máš ${S.supply}/${cap()} g a další dodavatelé přijedou až za týden. Opravdu chceš jít spát bez nákupu?`,
      "📦 Jít nakupovat", "🌙 Spát bez nákupu",
      () => showTab("supplierPanel"),
      advanceDay
    );
    return;
  }
  advanceDay();
}

// dodavatelé jsou dnes, něco z nabídky by šlo koupit (peníze + místo), ale zatím jsi nekoupil nic
function supplierWarningNeeded() {
  return S.supplierOffers.length > 0 && !S.boughtToday
    && S.supplierOffers.some(o => (o.debt || o.price <= S.money) && S.supply + o.grams <= cap());
}

// jednoduché potvrzovací okno (stejný styl jako zbytek hry)
function askConfirm(text, yesLabel, noLabel, onYes, onNo) {
  const modal = $("confirmModal");
  $("confirmText").textContent = text;
  const yes = $("confirmYes"), no = $("confirmNo");
  yes.textContent = yesLabel;
  no.textContent = noLabel;
  const close = () => { modal.style.display = "none"; };
  yes.onclick = () => { close(); onYes(); };
  no.onclick = () => { close(); onNo(); };
  modal.style.display = "flex";
}

function advanceDay() {
  if (S.over) return;
  $("nextDayBtn").classList.remove("pulse");
  clearOfferTimers();

  // neodpovězené nabídky = zklamaní zákazníci
  const penalised = new Set();
  document.querySelectorAll("#gameLog .offer").forEach(card => {
    if (card.dataset.done) return;
    missedOrder(card.dataset.district);   // popularita: za každou neodpovězenou objednávku
    if (penalised.has(card.dataset.district)) return;
    penalised.add(card.dataset.district);
    disappointCustomer(card.dataset.nickname, card.dataset.district);
  });

  // souhrn dne
  const net = S.money - S.today.startMoney;
  const summary = S.today.delivered
    ? `📊 Den ${S.day}: ${S.today.delivered}× doručeno (${S.today.grams} g), peníze ${net >= 0 ? "+" : ""}${fmt(net)} Kč`
    : `📊 Den ${S.day}: nic jsi nedoručil, peníze ${net >= 0 ? "+" : ""}${fmt(net)} Kč`;

  // policie: heat pomalu klesá jen tam, kam nedoručuješ: −0,05 denně, po 3 klidných dnech −0,15 denně
  // Popularita se tu nesnižuje. Klesá jen kvůli negativním recenzím v kanálu (telegramFeed) a událostem.
  districtNames.forEach(d => {
    if (S.accepted[d]) return;
    S.idle[d]++;
    S.police[d] = Math.max(0, S.police[d] - (S.idle[d] >= 3 ? 0.15 : 0.05));
  });

  // policejní akce: čím známější čtvrť, tím větší šance, že policie posílí hlídky
  let policeNote = null, policeTarget = null;
  if (Math.random() < 0.06) {
    const weights = districtNames.map(d => 0.3 + 2 * S.pop[d]);
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    let target = districtNames[0];
    for (let i = 0; i < districtNames.length; i++) { r -= weights[i]; if (r < 0) { target = districtNames[i]; break; } }
    S.police[target] = Math.min(3.4, S.police[target] + 0.6);
    policeTarget = target;
    policeNote = `🚓 Policie posílila hlídky v ${target}.`;
  }

  // nový den
  S.day++;
  S.accepted = {};
  S.usedToday = [];
  S.salesToday = false;
  S.secUsed = false;
  S.boughtToday = false;
  S.loc = "home";   // ráno vyrážíš z bytu
  S.offered = {};
  S.vipToday = 0;
  districtNames.forEach(d => { S.freq[d] = 0; });
  S.timeLeft = shiftLen();

  $("gameLog").innerHTML = "";
  unreadCount = 0;
  updateScrollBtn();
  logMessage(`📆 ${dayName(S.day)} – Začíná den ${S.day}`);
  logMessage(`🕗 Směna ${SHIFT_START_H}:00 – ${shiftEndClock()}`);
  logMessage(summary);
  if (policeNote) { logMessage(policeNote); checkHeat(policeTarget); }

  S.today = { delivered: 0, grams: 0, startMoney: S.money };

  // starý záznam o zátahu se promlčí
  if (S.strikes > 0 && S.day - S.lastStrikeDay >= 20) {
    S.strikes--;
    S.lastStrikeDay = S.day;
    logMessage("⚖️ Starý záznam o zátahu se promlčel.");
  }

  processPending();
  processStaff();
  S.dealerSold = {};   // nový den, kapacita prodejců se obnoví
  S.dealerCount = {};

  // provoz kurýrů
  if (S.runners > 0) {
    const upkeep = runnerUpkeep();
    if (S.money >= upkeep) S.money -= upkeep;
    else {
      S.runners--;
      S.timeLeft = shiftLen();
      logMessage("🏃 Nemáš na výplatu – jeden kurýr odešel.");
    }
  }

  // provoz auta: bez peněz auto stojí a jedeš tramvají
  S.carDown = false;
  const car = carByName(S.car);
  if (car.upkeep > 0) {
    if (S.money >= car.upkeep) S.money -= car.upkeep;
    else {
      S.carDown = true;
      logMessage(`🔧 Nemáš na provoz auta (${fmt(car.upkeep)} Kč) – dnes jedeš tramvají.`);
    }
  }

  // dodavatelé jsou jen v pondělí a jen ten den: zásoby se musí plánovat na týden
  if (dayName(S.day) === "Pondělí") {
    refreshSuppliers();
    showTab("supplierPanel");
    logImportantMessage("📦 Pondělí – dodavatelé jsou tady, ale jen DNES. Nakup na celý týden!");
  } else {
    S.supplierOffers = [];
    if (dayName(S.day) === "Neděle") {
      logMessage(`📦 Zítra přijedou dodavatelé. Máš ${S.supply}/${cap()} g a ${fmt(S.money)} Kč – nezapomeň na peníze.`);
    }
  }

  if (S.day % 30 === 25) {
    logImportantMessage("📱 Majitel bytu: „Doufám, že tenhle měsíc zaplatíš včas, za 5 dní si přijdu“");
    logImportantMessage(`🏚️ Za 5 dní je nájem – ${fmt(rentFor(S.day + 5) + S.debt)} Kč. Pokud nebudeš mít na zaplacení, majitel ti vezme stash!`);
  }
  if (S.day % 30 === 29) logImportantMessage(`🏚️ Nezapomeň, zítra se platí nájem! ${fmt(rentFor(S.day + 1) + S.debt)} Kč!`);
  if (S.day % 30 === 0 && !payRent()) return;

  updateStatus();
  if (S.over) return;
  saveGame();
  pushScore();
  startDayOffers();
}

/* =====================================================================
   ONLINE: NICK, ŽEBŘÍČEK A CLOUDOVÉ UKLÁDÁNÍ (Firebase Firestore)
   Bez window.FIREBASE_CONFIG (index.html) je vše vypnuté a hra funguje jako dřív.
   ===================================================================== */
const NICK_KEY = "snowDealer.nick.v1";
const CLOUD_KEY = "snowDealer.cloud.v1";   // { code, rev } – kód uložení a poslední známá revize v cloudu
const NICK_MIN = 2, NICK_MAX = 16;
const LB_SIZE = 20;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // 32 znaků, bez O/0/I/1
const CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{24}$/;
// jednoduchý filtr: porovnává se bez diakritiky, velikosti písmen, mezer a záměn číslic za písmena
const BAD_WORDS = ["kurv", "kurev", "pico", "picus", "curak", "cernoch", "negr", "nigg", "fuck", "shit", "bitch", "cunt",
  "penis", "vagin", "hovn", "sracka", "sraci", "debil", "kreten", "idiot", "hajzl", "buzer", "buzna", "hitler", "nazi"];

const LB_TABLES = {
  days: { coll: "scoresDays", label: "⏱️ Nejrychlejší výhra", field: "days", dir: "asc", val: r => `${r.days} dní` },
  cash: { coll: "scoresCash", label: "💰 Nejvíc hotovosti", field: "cash", dir: "desc", val: r => `${fmt(r.cash)} Kč` }
};
const lbTab = {};     // zvolená záložka pro každý box
const lbToken = {};   // zahodí odpověď, když mezitím přišel novější požadavek

let fbDb = null, fbTried = false;
function getDb() {
  if (fbDb) return fbDb;
  if (fbTried) return null;
  fbTried = true;
  try {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.projectId || typeof firebase === "undefined") return null;
    firebase.initializeApp(cfg);
    fbDb = firebase.firestore();
  } catch (e) { console.error("Firebase se nepodařilo spustit:", e); }
  return fbDb;
}
const onlineOn = () => !!getDb();

// odpověď serveru se čeká nanejvýš `ms`, pak se pokračuje bez ní (nepřeruší čekající zápis)
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

function genCode() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, b => CODE_ALPHABET[b % 32]).join("");   // 256 % 32 == 0, tedy rovnoměrně
}
const fmtCode = c => c.match(/.{1,4}/g).join("-");
const normCode = s => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/* ---------- nick ---------- */
function getNick() {
  try { return localStorage.getItem(NICK_KEY) || ""; } catch (e) { return ""; }
}
function setNick(n) {
  try { localStorage.setItem(NICK_KEY, n); } catch (e) { /* nic */ }
  renderNickShown();
}
function renderNickShown() {
  const el = $("nickShown");
  if (el) el.textContent = getNick() || "—";
}
function checkNick(raw) {
  const nick = String(raw || "").trim().replace(/\s+/g, " ");
  if (nick.length < NICK_MIN || nick.length > NICK_MAX) return { ok: false, err: `Nick musí mít ${NICK_MIN} až ${NICK_MAX} znaků.` };
  if (!/^[\p{L}\p{N} _.\-]+$/u.test(nick)) return { ok: false, err: "Povolená jsou písmena, čísla, mezera a _ . -" };
  const flat = nick.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o").replace(/[1!]/g, "i").replace(/3/g, "e").replace(/[4@]/g, "a").replace(/[5$]/g, "s").replace(/7/g, "t")
    .replace(/[^a-z]/g, "");
  if (BAD_WORDS.some(w => flat.includes(w))) return { ok: false, err: "Tenhle nick nejde použít, zkus jiný." };
  return { ok: true, nick };
}
// forced = hra bez nicku nepokračuje: okno nejde zavřít (jen zadáním platného nicku)
function askNick(onDone, forced) {
  const modal = $("nickModal"), inp = $("nickInput"), err = $("nickErr");
  inp.value = getNick();
  err.textContent = "";
  $("nickCancel").style.display = forced ? "none" : "";
  $("nickText").textContent = forced
    ? "Než začneš hrát, zadej svůj nick do žebříčku (2–16 znaků)."
    : "Zadej svůj nick do žebříčku (2–16 znaků).";
  const close = () => { modal.style.display = "none"; };
  const submit = () => {
    const r = checkNick(inp.value);
    if (!r.ok) { err.textContent = r.err; return; }
    setNick(r.nick);
    close();
    onDone(r.nick);
  };
  $("nickOk").onclick = submit;
  $("nickCancel").onclick = close;
  inp.onkeydown = e => { if (e.key === "Enter") submit(); else if (e.key === "Escape" && !forced) close(); };
  modal.style.display = "flex";
  inp.focus();
  inp.select();
}
function changeNick() { askNick(() => { /* nick se uloží a zobrazí v setNick */ }); }

/* ---------- žebříček ---------- */
async function renderLeaderboard(boxId) {
  const box = $(boxId);
  if (!box || !onlineOn()) return;
  const tab = lbTab[boxId] || "days";
  const t = LB_TABLES[tab];
  box.textContent = "";
  const h = document.createElement("h3");
  h.textContent = `🏆 Žebříček – top ${LB_SIZE}`;
  const tabs = document.createElement("div");
  tabs.className = "lb-tabs";
  Object.keys(LB_TABLES).forEach(key => {
    const b = document.createElement("button");
    b.className = "btn" + (key === tab ? " active" : "");
    b.textContent = LB_TABLES[key].label;
    b.onclick = () => { lbTab[boxId] = key; renderLeaderboard(boxId); };
    tabs.appendChild(b);
  });
  const list = document.createElement("div");
  list.className = "lb-list";
  const setMsg = text => { list.textContent = ""; const m = document.createElement("div"); m.className = "lb-msg"; m.textContent = text; list.appendChild(m); };
  setMsg("Načítám…");
  box.append(h, tabs, list);

  const token = lbToken[boxId] = (lbToken[boxId] || 0) + 1;
  try {
    const snap = await withTimeout(getDb().collection(t.coll).orderBy(t.field, t.dir).limit(LB_SIZE).get(), 12000);
    if (token !== lbToken[boxId]) return;
    const rows = snap.docs.map(d => d.data());
    if (tab === "days") rows.sort((a, b) => a.days - b.days || b.cash - a.cash);   // shoda dnů: víc hotovosti je výš
    if (!rows.length) { setMsg("Zatím tu nikdo není."); return; }
    list.textContent = "";
    rows.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";
      const rank = document.createElement("span"); rank.className = "rank"; rank.textContent = `${i + 1}.`;
      const nick = document.createElement("span"); nick.className = "nick"; nick.textContent = String(r.nick);
      const val = document.createElement("span"); val.className = "val"; val.textContent = t.val(r);
      row.append(rank, nick, val);
      list.appendChild(row);
    });
  } catch (e) {
    console.warn("Žebříček se nepodařilo načíst:", e);
    if (token === lbToken[boxId]) setMsg("Žebříček se nepodařilo načíst.");
  }
}

// Nick, pod kterým tahle hra jde do žebříčku. Zapíše se do uložení, takže se po načtení z cloudu
// na jiném zařízení (nebo po změně nicku) nemění a pravidla dovolí aktualizovat stejný záznam.
function scoreNick() {
  if (!S.nick) S.nick = getNick();
  return S.nick;
}
// nejvyšší hotovost, kterou hráč v téhle hře kdy měl u sebe
const peakCash = () => Math.round(Math.max(S.stats.peak || 0, S.money));
// do žebříčku se hra dostane, až když hráč přeskočí startovní hotovost (žádné záznamy „bez pokroku“)
const hasProgress = () => peakCash() > newState().money;
const scoreDoc = () => ({ nick: scoreNick(), days: S.day, cash: peakCash(), ts: firebase.firestore.FieldValue.serverTimestamp() });

// Každý den: živý záznam v tabulce „Nejvíc hotovosti“ (id = runId, přepisuje se jen směrem nahoru).
function pushScore() {
  const db = getDb();
  if (!db || S.over || !hasProgress() || !scoreNick()) return;
  db.collection("scoresCash").doc(S.runId).set(scoreDoc())
    .catch(e => console.warn("Aktualizace žebříčku se nepovedla:", e));
}

// Odeslání výsledku na konci hry. Tabulka „Nejvíc hotovosti“ se vždy aktualizuje na poslední hodnotu,
// tabulka dnů dostane záznam jen při výhře a jen jednou (id dokumentu = runId, takže žádné duplicity).
async function submitScores(win) {
  const box = $("endSubmit");
  box.textContent = "";
  const db = getDb();
  if (!db || !scoreNick()) return;
  S.sent = S.sent || {};
  const jobs = [];
  if (hasProgress()) jobs.push(["cash", "scoresCash"]);
  if (win && !S.sent.days) jobs.push(["days", "scoresDays"]);
  if (!jobs.length) return;
  box.textContent = "⏳ Odesílám výsledek…";
  const doc = scoreDoc();
  let failed = false, pending = false;
  for (const [key, coll] of jobs) {
    const write = db.collection(coll).doc(S.runId).set(doc);
    const r = await Promise.race([
      write.then(() => "ok", e => ({ err: e })),
      new Promise(res => setTimeout(() => res("slow"), 12000))
    ]);
    if (r === "ok") S.sent[key] = true;
    else if (r === "slow") pending = true;    // bez připojení: zápis zůstane ve frontě a odejde sám
    else { failed = true; console.warn("Odeslání výsledku selhalo:", r.err); }
  }
  if (failed) {
    box.textContent = "⚠️ Výsledek se nepodařilo odeslat. ";
    const b = document.createElement("button");
    b.className = "link-btn";
    b.textContent = "Zkusit znovu";
    b.onclick = () => finishRun(win);
    box.appendChild(b);
  } else if (pending) {
    box.textContent = "📡 Čekám na připojení, výsledek se odešle, jakmile bude síť.";
  } else {
    box.textContent = `✅ Výsledek odeslán jako ${scoreNick()}.`;
  }
}
async function finishRun(win) {
  if (!onlineOn()) return;
  await submitScores(win);
  renderLeaderboard("lbEnd");
}

// žebříček během hry (tlačítko v horní liště)
function showLeaderboard() {
  $("lbModal").style.display = "flex";
  renderLeaderboard("lbGame");
}
function closeLeaderboard() {
  $("lbModal").style.display = "none";
}

/* ---------- cloudové ukládání ---------- */
function cloudMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(CLOUD_KEY));
    if (m && CODE_RE.test(m.code)) return { code: m.code, rev: Number(m.rev) || 0 };
  } catch (e) { /* nic */ }
  return null;
}
function setCloudMeta(m) {
  try {
    if (m) localStorage.setItem(CLOUD_KEY, JSON.stringify(m));
    else localStorage.removeItem(CLOUD_KEY);
  } catch (e) { /* nic */ }
}
// uložený stav z cloudu (JSON v textu) → použitelná hra, nebo null (rozbité / skončená hra)
function toState(s) {
  if (!s || typeof s.day !== "number" || s.over) return null;
  return fromSave(s);
}
async function cloudFetch(code) {
  const snap = await getDb().collection("saves").doc(code).get();
  if (!snap.exists) return null;
  const d = snap.data();
  let state = null;
  try { state = JSON.parse(d.data); } catch (e) { /* rozbité uložení */ }
  return { rev: d.rev, day: d.day, money: d.money, data: d.data, state };
}
// převezme stav z cloudu jako aktuální hru
function useRemote(code, remote, rs) {
  closeCloudModal();
  setCloudMeta({ code, rev: remote.rev });
  S = rs;
  saveLocal();
  resumeFrom(rs);
}

let cloudBusy = false, cloudNext = null, cloudConflictOpen = false, cloudFailLogged = false;
// Nahraje stav do cloudu. Revize (rev) hlídá, že se nepřepíše novější uložení z jiného zařízení.
async function cloudPush(st) {
  const meta = cloudMeta();
  const state = st || S;
  if (!meta || !onlineOn() || !state || cloudConflictOpen) return;
  cloudNext = state;
  if (cloudBusy) return;
  cloudBusy = true;
  try {
    while (cloudNext) {
      const cur = cloudNext;
      cloudNext = null;
      const m = cloudMeta();
      const db = getDb();
      const ref = db.collection("saves").doc(m.code);
      const payload = { data: JSON.stringify(cur), day: cur.day, money: Math.round(cur.money) };
      try {
        const res = await db.runTransaction(async tx => {
          const snap = await tx.get(ref);
          if (snap.exists && snap.data().rev !== m.rev) return { conflict: true, remote: snap.data() };
          const rev = snap.exists ? snap.data().rev + 1 : 1;
          tx.set(ref, Object.assign({ rev }, payload));
          return { rev };
        });
        if (res.conflict) { cloudNext = null; cloudConflict(m.code, res.remote); break; }
        setCloudMeta({ code: m.code, rev: res.rev });
        cloudFailLogged = false;
      } catch (e) {
        console.warn("Cloudové uložení se nepovedlo:", e);
        if (!cloudFailLogged && S && !S.over) { cloudFailLogged = true; logMessage("☁️ Cloudové uložení se nepovedlo, hra je uložená jen v tomto zařízení."); }
      }
    }
  } finally { cloudBusy = false; }
}
// během hry zjistíme, že cloud má novější uložení (jiné zařízení): hráč rozhodne
function cloudConflict(code, remote) {
  let rs = null;
  try { rs = toState(JSON.parse(remote.data)); } catch (e) { /* rozbité */ }
  if (!rs) {   // v cloudu je skončená / rozbitá hra, nemá cenu ji nabízet
    setCloudMeta({ code, rev: remote.rev });
    cloudPush();
    return;
  }
  cloudConflictOpen = true;
  askConfirm(
    `☁️ V cloudu je novější uložení z jiného zařízení (den ${rs.day}, ${fmt(rs.money)} Kč). Tady máš den ${S.day}, ${fmt(S.money)} Kč. Které použít?`,
    "☁️ Použít cloud", "💾 Použít toto zařízení",
    () => { cloudConflictOpen = false; useRemote(code, remote, rs); },
    () => { cloudConflictOpen = false; setCloudMeta({ code, rev: remote.rev }); cloudPush(); });
}

/* ---------- panel „Cloud“ na úvodní obrazovce ---------- */
function toggleCloudPanel() {
  const p = $("cloudPanel");
  p.classList.toggle("open");
  if (p.classList.contains("open")) renderCloudPanel(p);
}
// panel „Cloud“ během hry (tlačítko v horní liště)
function showCloudModal() {
  $("cloudModal").style.display = "flex";
  renderCloudPanel($("cloudModalBody"));
}
function closeCloudModal() {
  $("cloudModal").style.display = "none";
}
let cloudPanelEl = null, cloudStatusEl = null;   // právě zobrazený panel (úvodní obrazovka nebo okno ve hře)
function cloudNote(text) {
  if (cloudStatusEl) cloudStatusEl.textContent = text;
}
function renderCloudPanel(p) {
  cloudPanelEl = p;
  const meta = cloudMeta();
  p.innerHTML = "";
  const intro = document.createElement("div");
  p.appendChild(intro);
  if (meta) {
    intro.innerHTML = "☁️ Postup se ukládá i do cloudu. <b>Tvůj kód uložení</b> (zapiš si ho, kdo ho zná, může hru načíst i přepsat):";
    const code = document.createElement("div");
    code.className = "code";
    code.textContent = fmtCode(meta.code);
    p.appendChild(code);
    const copy = document.createElement("button");
    copy.className = "btn";
    copy.textContent = "📋 Zkopírovat";
    copy.onclick = () => {
      const done = () => cloudNote("Kód zkopírován.");
      if (navigator.clipboard) navigator.clipboard.writeText(fmtCode(meta.code)).then(done, () => cloudNote("Kopírování nejde, opiš kód ručně."));
      else cloudNote("Kopírování nejde, opiš kód ručně.");
    };
    p.appendChild(copy);
  } else {
    intro.textContent = "Cloudové ukládání zálohuje hru pod dlouhým náhodným kódem. Na jiném zařízení ho zadáš a pokračuješ. Žádné osobní údaje se neukládají.";
    const create = document.createElement("button");
    create.className = "btn primary";
    create.textContent = "☁️ Vytvořit kód uložení";
    create.onclick = () => {
      setCloudMeta({ code: genCode(), rev: 0 });
      const local = loadGame();
      if (local) cloudPush(local);   // už rozehraná hra se hned zazálohuje
      renderCloudPanel(p);
      cloudNote("Kód vytvořen. Zapiš si ho.");
    };
    p.appendChild(create);
  }
  const lab = document.createElement("div");
  lab.style.marginTop = "10px";
  lab.textContent = meta ? "Načíst hru z jiného kódu:" : "Už mám kód:";
  const inp = document.createElement("input");
  inp.className = "text-input";
  inp.placeholder = "XXXX-XXXX-XXXX-XXXX-XXXX-XXXX";
  inp.autocomplete = "off";
  const load = document.createElement("button");
  load.className = "btn";
  load.textContent = "⬇️ Načíst z cloudu";
  load.onclick = () => cloudLoadCode(inp.value);
  const st = document.createElement("div");
  st.className = "cloud-status";
  cloudStatusEl = st;
  p.append(lab, inp, load, st);
}
async function cloudLoadCode(raw) {
  const code = normCode(raw);
  if (!CODE_RE.test(code)) { cloudNote("Kód nemá správný tvar (24 znaků)."); return; }
  cloudNote("⏳ Načítám…");
  let remote;
  try { remote = await withTimeout(cloudFetch(code), 12000); }
  catch (e) { console.warn(e); cloudNote("Nepodařilo se spojit s cloudem."); return; }
  if (!remote) { cloudNote("Pod tímto kódem nic není."); return; }
  const rs = toState(remote.state);
  if (!rs) { cloudNote("Hra pod tímto kódem už skončila nebo je poškozená."); return; }
  const local = loadGame();
  if (!local) { cloudNote(""); useRemote(code, remote, rs); return; }
  cloudNote("");
  askConfirm(
    `Na tomto zařízení je rozehraná hra (den ${local.day}, ${fmt(local.money)} Kč). V cloudu pod kódem je den ${rs.day}, ${fmt(rs.money)} Kč. Které použít?`,
    "☁️ Použít cloud", "💾 Nechat toto zařízení",
    () => useRemote(code, remote, rs),
    () => {
      setCloudMeta({ code, rev: remote.rev });   // tato hra přepíše cloud při dalším uložení
      cloudPush(local);
      renderCloudPanel(cloudPanelEl);
      cloudNote("Kód nastaven, tvoje hra se nahrála do cloudu.");
    });
}

/* =====================================================================
   START, NAČTENÍ, HUDBA
   ===================================================================== */
function resetUi() {
  clearOfferTimers();
  unreadCount = 0;
  $("confirmModal").style.display = "none";
  stopSound("siren");
  document.body.classList.remove("police-flash");
  $("endScreen").style.display = "none";
  $("gameLog").innerHTML = "";
  $("telegramMessages").innerHTML = "";
}

function startNewGame() {
  // při zapnutém online režimu se na začátku hry ptáme na nick (pokud ho hráč ještě nemá)
  if (onlineOn() && !getNick()) { askNick(beginNewGame, true); return; }
  beginNewGame();
}

function beginNewGame() {
  clearSave();
  S = newState();
  syncDistricts();
  refreshSuppliers();
  resetUi();
  $("introScreen").style.display = "none";
  playBackgroundMusic();
  playSound("notif");
  updateStatus();
  customerBubble("@cmoud", "", "Ahoj, já končím takže předávám svoje řemeslo, dal jsem kontakt na tebe pár lidem co vím, že jsou v pohodě. Taky jsem ti nechal 2 bůrky na začátek, hodně štěstí!");
  setTimeout(() => {
    if (S && !S.over && S.day === 1) {
      logMessage("👉 Až si to přečteš, klikni na ➡️ Další den – tím začnou chodit objednávky.");
    }
  }, 2800);
  $("nextDayBtn").classList.add("pulse");
  saveGame();
}

function resumeFrom(loaded) {
  S = loaded;
  // bez nicku se do hry nevstoupí (starší uložení, načtení z cloudu na novém zařízení)
  if (onlineOn() && !getNick()) { askNick(() => resumeFrom(loaded), true); return; }
  syncDistricts();
  Object.keys(S.dealers || {}).forEach(dealerInfo);   // staré uložení: prodejce byl jen číslo
  resetUi();
  $("introScreen").style.display = "none";
  playBackgroundMusic();
  logMessage(`💾 Hra načtena – ${dayName(S.day)}, den ${S.day}.`);
  updateStatus();
  startDayOffers();
}

async function continueGame() {
  const local = loadGame();
  const meta = cloudMeta();
  if (meta && onlineOn()) {
    const btn = $("continueBtn");
    btn.disabled = true;
    let remote = null;
    try { remote = await withTimeout(cloudFetch(meta.code), 12000); }
    catch (e) { console.warn("Cloud nedostupný:", e); }   // bez cloudu se hraje z lokálního uložení
    btn.disabled = false;
    if (remote && remote.rev > meta.rev) {
      const rs = toState(remote.state);
      if (!rs) {
        setCloudMeta({ code: meta.code, rev: remote.rev });      // hra v cloudu už skončila
      } else if (!local) {
        useRemote(meta.code, remote, rs);
        return;
      } else {
        askConfirm(
          `☁️ V cloudu je novější uložení z jiného zařízení (den ${rs.day}, ${fmt(rs.money)} Kč). Na tomto zařízení je den ${local.day}, ${fmt(local.money)} Kč. Které použít?`,
          "☁️ Použít cloud", "💾 Použít toto zařízení",
          () => useRemote(meta.code, remote, rs),
          () => {
            setCloudMeta({ code: meta.code, rev: remote.rev });   // lokální uložení přepíše cloud
            resumeFrom(local);
            cloudPush();
          });
        return;
      }
    }
  }
  if (!local) { startNewGame(); return; }
  resumeFrom(local);
}

// záložky obchodu: Dodavatelé / Auta / Zázemí / Policie
function showTab(id) {
  document.querySelectorAll(".shop .tab-panel").forEach(p => p.classList.toggle("active", p.id === id));
  document.querySelectorAll("#shopTabs .tab").forEach(t => t.classList.toggle("active", t.dataset.tab === id));
}

function toggleHowToPlay() {
  $("howToPlay").classList.toggle("open");
}

function playBackgroundMusic() {
  const bg = $("bgMusic");
  if (musicEnabled || !bg) return;
  bg.volume = 0.5;
  const p = bg.play();
  if (p && p.then) {
    p.then(() => {
      musicEnabled = true;
      $("toggleMusic").textContent = "🔊 Hudba: zap";
    }).catch(e => console.error("🎵 Nelze přehrát hudbu:", e));
  }
}

function init() {
  // starý index.html s novým skriptem: chybí prvky, které hra potřebuje
  const need = ["mapBox", "scrollDown", "confirmModal", "supplierPanel", "gameLog", "status", "errorBanner"];
  const missing = need.filter(id => !$(id));
  const meta = document.querySelector('meta[name="build"]');
  if (missing.length || !meta || meta.content !== BUILD) {
    const b = $("errorBanner");
    if (b) {
      b.style.display = "block";
      b.innerHTML = "⚠️ <b>Soubory hry nejsou ze stejné verze.</b> Nahraj na GitHub oba soubory (<b>index.html</b> i <b>GameLogic.js</b>) a obnov stránku (Ctrl+F5)." + (missing.length ? "<br>Chybí: " + missing.join(", ") : "");
    }
    if (missing.length) return;
  }
  $("versionTag").textContent = "v" + VERSION;
  $("versionTag").title = "sestavení " + BUILD;
  S = newState();           // jen aby se dalo vykreslit UI za úvodní obrazovkou
  syncDistricts();
  refreshSuppliers();
  updateStatus();
  logMessage(`💬 Vítej v Sněhovém Dealerovi – verze ${VERSION}`);

  $("gameLog").addEventListener("scroll", updateScrollBtn);
  if (loadGame()) $("continueBtn").style.display = "";

  // online funkce (žebříček, nick, cloud) jen s Firebase configem, jinak se schovají
  if (onlineOn()) {
    renderNickShown();
    renderLeaderboard("lbIntro");
  } else {
    ["lbIntro", "lbEnd", "cloudPanel", "cloudBtn", "leaderboardBtn", "cloudGameBtn"].forEach(id => { $(id).style.display = "none"; });
    document.querySelector(".nick-line").style.display = "none";
  }

  $("toggleMusic").addEventListener("click", () => {
    const bg = $("bgMusic");
    if (!musicEnabled) {
      bg.volume = 0.5;
      bg.play().then(() => {
        musicEnabled = true;
        $("toggleMusic").textContent = "🔊 Hudba: zap";
      }).catch(e => {
        console.error("🎵 Nelze přehrát hudbu:", e);
        alert("Hudbu nelze přehrát. Zkontrolujte nastavení prohlížeče.");
      });
    } else {
      bg.pause();
      musicEnabled = false;
      $("toggleMusic").textContent = "🔇 Hudba: vyp";
    }
  });
}

// funkce volané z HTML (onclick)
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.continueAfterWin = continueAfterWin;
window.toggleHowToPlay = toggleHowToPlay;
window.toggleCloudPanel = toggleCloudPanel;
window.showCloudModal = showCloudModal;
window.closeCloudModal = closeCloudModal;
window.showLeaderboard = showLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.changeNick = changeNick;
window.showTab = showTab;
window.scrollChat = scrollChat;
window.nextDay = nextDay;

init();
