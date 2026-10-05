// Sněhový Dealer – verze 5.0
"use strict";

/* =====================================================================
   KONSTANTY A DATA
   ===================================================================== */
const VERSION = "5.0";
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
  "Dejvice": { x: -4.2, y: 3.6 },
  "Letná": { x: -0.6, y: 3.0 },
  "Holešovice": { x: 1.0, y: 4.0 },
  "Karlín": { x: 3.2, y: 2.6 },
  "Žižkov": { x: 3.4, y: 0.2 },
  "Vinohrady": { x: 4.2, y: -1.6 },
  "Smíchov": { x: -2.8, y: -1.2 },
  "Modřany": { x: 0.2, y: -6.4 }
};
const HOME = { x: 1.2, y: 0.8 };       // tvůj byt, odkud ráno vyrážíš
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
    "@panelak_pavel", "@rybar_rosta", "@bazen_bobo", "@tramvaj_17_tomas", "@vyhlidka_vilda", "@zahradkar_zdenek"]
};
const districtNames = Object.keys(districts);

// Základní ceny pro zákaznické objednávky (1–5 g)
const customerBasePrices = { 1: 3000, 2: 5000, 3: 6500, 4: 8000, 5: 9500 };

// speed  = rychlost přesunu po městě (km za herní hodinu)
// pop    = jednorázový bonus popularity při koupi
// heat   = násobek pozornosti policie při doručení (nápadné auto = víc heatu)
// upkeep = denní provoz (palivo, servis). Bez peněz auto stojí a jedeš MHD
const CARS = [
  { name: "🚋 Tramvaj", price: 0, speed: 3.4, pop: 0, heat: 0.8, upkeep: 0, note: "nenápadná, ale pomalá" },
  { name: "🛵 Yamaha Aerox", price: 12000, speed: 4.6, pop: 0.2, heat: 0.9, upkeep: 100, note: "levný skútr, skoro nenápadný" },
  { name: "🚗 Golf 2001 1.9TDI", price: 30000, speed: 6, pop: 0.4, heat: 1, upkeep: 250, note: "pracovní kůň" },
  { name: "🚙 BMW 330D", price: 65000, speed: 7.6, pop: 0.8, heat: 1.15, upkeep: 500, note: "rychlé, ale už se na něj kouká" },
  { name: "🏎️ BMW M4", price: 300000, speed: 9.5, pop: 1.5, heat: 1.4, upkeep: 1200, note: "nejrychlejší a nejviditelnější" }
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
// základ ~1 500 Kč za gram, větší zásilky o něco levněji; dodavatel a týdenní trh to posunou ±10 %
const SUPPLY_OPTIONS = [
  { grams: 5, basePrice: 7500 },
  { grams: 10, basePrice: 15000 },
  { grams: 20, basePrice: 29000 },
  { grams: 50, basePrice: 72500 },
  { grams: 100, basePrice: 140000 }
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

const ACHIEVEMENTS = {
  first: { name: "První kontakt", desc: "Doruč první objednávku" },
  regular: { name: "Stálice", desc: "Získej zákazníka s plnou věrností" },
  star: { name: "Hvězda čtvrti", desc: "Popularita 4+ v některé čtvrti" },
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
  "Si zvanej na moje narozky, bro"
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
    market: 1, supplierOffers: [], pending: [], seq: 0,
    pop: {}, police: {}, warned: {}, idle: {}, freq: {},
    accepted: {}, loyalty: {}, usedToday: [], salesToday: false,
    today: { delivered: 0, grams: 0, startMoney: 5000 },
    stats: { delivered: 0, grams: 0, earned: 0, raids: 0 }
  };
  districtNames.forEach(d => {
    s.pop[d] = 0.5; s.police[d] = 0; s.warned[d] = 0; s.idle[d] = 0; s.freq[d] = 0;
  });
  return s;
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

// jak dlouho trvá doba cesty v čitelné podobě: "10 min", "1 h 20 min"
function fmtDur(h) {
  const m = Math.max(1, Math.round(h * 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}`;
}
const dayName = day => weekDays[(day - 1) % 7];

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage nemusí být dostupné */ }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.day !== "number" || s.over) return null;
    return Object.assign(newState(), s);
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
function playerBubble(text, quote) {
  const row = document.createElement("div");
  row.className = "msg out";
  const col = document.createElement("div");
  col.className = "msg-col";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
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
function addPop(d, v) {
  S.pop[d] = clamp(S.pop[d] + v, 0, 5);
  if (S.pop[d] >= 4) unlock("star");
}
function addPopAll(v) { districtNames.forEach(d => addPop(d, v)); }

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
  if (district) addPop(district, negative ? -0.3 : 0.3);
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
    let w = 10 + S.pop[d] * 6;
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

function offersForToday() {
  const maxPop = Math.max(...districtNames.map(d => S.pop[d]));
  let base = Math.min(1 + Math.floor(maxPop / 2), 5);
  let bonus = Math.floor(maxPop);
  const today = dayName(S.day);
  if (today === "Pátek") { base += 3; bonus += 1; }
  else if (today === "Sobota") { base += 2; bonus += 1; }
  else if (["Pondělí", "Úterý", "Středa"].includes(today)) {
    base = Math.max(1, base - 1);
    bonus = Math.max(0, bonus - 1);
  }
  let n = Math.floor((base + bonus) * 0.5);
  // rozjezd: prvních 30 dní aspoň 2 objednávky denně, než popularita roste sama
  n = Math.max(n, S.day <= 30 ? 2 : 1);
  return Math.min(n, 8);
}

function startDayOffers() {
  clearOfferTimers();
  const n = offersForToday();
  const gap = 2200;
  for (let i = 0; i < n; i++) offerTimers.push(setTimeout(generateOffer, 300 + i * gap));
  if (Math.random() < 0.15) offerTimers.push(setTimeout(randomCustomerMessage, 300 + n * gap + 800));
  scheduleEvents(300 + n * gap + 1800);
}

function generateOffer() {
  if (S.over || S.timeLeft <= 0) return;

  const grams = weightedRandomChoice([
    { value: 1, weight: 0.40 }, { value: 2, weight: 0.30 }, { value: 3, weight: 0.20 },
    { value: 4, weight: 0.05 }, { value: 5, weight: 0.05 }
  ]);
  const district = pickDistrict();
  const nickname = pickCustomer(district);
  const loyal = loyaltyOf(nickname) >= 2;

  // cena: 78 % standard, 12 % sleva, 10 % prémiová (z toho čtvrtina je past)
  const basePrice = customerBasePrices[grams];
  let price = basePrice, trap = false;
  const roll = Math.random();
  if (roll >= 0.90) {
    price = basePrice * (1.25 + Math.random() * 0.15);
    trap = Math.random() < 0.25;
  } else if (roll >= 0.78) {
    price = basePrice * (1 - (0.05 + Math.random() * 0.10));
  }
  if (loyal) price *= 1 + 0.04 * loyaltyOf(nickname);
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
    `ty vole kamo, potrebuju snih ${grams}g, cash ready ${price}, kde se potkáme?`,
    `zdar, hodis mi ${grams} do ${district}? mam ${price}kc, ale fakt specham`,
    `hele, mam jen ${price}kc, jsem na mrdku na teambuildingu :DD co za to dostanu treba ${grams}?`,
    `Bráško, dneska fakt nutně potrebuju ${grams}g třeba za ${price}, jsem v ${district}, ozvi se pls.`,
    `yo, mas neco fresh? treba ${grams} za ${price}, ale rychle pls`,
    `Dobrý den, rád bych si objednal ${grams}g za ${price} Kč. Je to možné?`,
    `hej kamo, kamosz rikal ze mas kvalitu, vzal bych ${grams}g, cash ${price}kc`,
    `cau, jsem v ${district}, hodis mi ${grams}? mam ${price}kc, ale specham`,
    `ty kravo, potrebuju ${grams}g, jinak jsem v haji, mam ${price}kc`,
    `Zdarec, ${grams} pls, cash ready ${price}kc, Praha jede`,
    `cs pls ${grams} pls,za  ${price}kc, u me ${district}`,
    `Kolik ${grams} v kolik co nejdřív a za zakolik ${price}kc ?`,
    `Yo, kamo, ${grams}g za ${price}kc, ale fakt rychle, jsem v ${district}`,
    `Hele, potřebuji nutně ${grams}g, mám ${price}, kde se potkáme?`,
    `Čau, máš čas? Vzal bych ${grams}g za ${price}, jsem v ${district}.`,
    `brasko, dneska fakt nutne potrebuju,je zima a snezi ${grams}g, cash ${price}`,
    `hej kamo, ${grams}g pls, ale specham, jsem v ${district}, mam ${price}`,
    `yo, mas neco na zkousku? treba ${grams}, cash ready ${price}kc`,
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
    `mrazi me, takze potrebuju ${grams}g snehu aby mi bylo tepleji :D ${price}kc`,
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
    `ahojky, ${grams}g do ${district} a ${price}kc, jinak budu muset jit spat v 10 jak sasek`
  ];
  // stálí zákazníci píšou trochu jinak
  const loyalMessages = [
    `to jsem zase ja, ${grams}g jako vzdycky? ${price}kc ready`,
    `kamo, tvuj stalej zakaznik hlasi, ${grams}g do ${district}, ${price}kc`,
    `bez tebe bych tu Prahu nezvladl, ${grams}g za ${price}kc pls`,
    `jako minule pls, ${grams}g a ${price}kc, ty vis kam v ${district}`,
    `šéfe, poprosil bych klasiku. ${grams}g, ${price}kc, ${district}`,
    `ty jsi muj nejlepsi dealer a to rikam i mamce. ${grams}g za ${price}kc`
  ];

  const offer = { nickname, district, grams, price, time, trap };
  // cenu nikde nehodnotíme – jestli je nabídka hodně nad nebo pod cenou, musí hráč poznat sám
  const badges = [];
  if (loyal) badges.push(`⭐ stálý zákazník`);

  playSound("notif");
  // bublina zákazníka + shrnutí objednávky + tlačítka pod ní jako inline klávesnice v Telegramu
  const b = incomingBubble(nickname, district);
  const card = b.row;
  card.classList.add("offer");
  card.dataset.nickname = nickname;
  card.dataset.district = district;
  card._offer = offer;
  chatAppend(card);   // musí být v DOM dřív, než začne psaní
  typeInto(b.text, loyal && Math.random() < 0.5 ? rand(loyalMessages) : rand(messages));

  const order = document.createElement("div");
  order.className = "order";
  order.innerHTML = `📦 <b>${grams} g</b> · 💰 <b>${fmt(price)} Kč</b> · ⏱️ <b class="t">${fmtDur(time)}</b>`
    + badges.map(x => ` <span class="badge">${x}</span>`).join("");
  b.bubble.insertBefore(order, b.time);

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
    if (t) {
      t.textContent = fmtDur(card._offer.time);
      t.classList.toggle("far", card._offer.time > S.timeLeft);   // nestíhal bys to
    }
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
    logMessage(`⏱️ Do ${o.district} bys potřeboval ${fmtDur(o.time)}, ale zbývá ti ${fmtDur(S.timeLeft)}.`);
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
  addPop(o.district, 0.2);
  unlock("first");

  const before = loyaltyOf(o.nickname);
  const after = changeLoyalty(o.nickname, 1);
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
  let gain = (0.08 + 0.05 * grams) * (0.7 + S.pop[d] * 0.12)
    * (1 + 0.15 * Math.max(0, S.freq[d] - 1)) * effCar().heat;
  if (Math.random() < 0.25) gain += 0.5;   // někdo tě viděl
  return round2(gain);
}

function declineOfferInner(card, o) {
  if (S.over || card.dataset.done) return;
  card.dataset.done = "1";
  closeOffer(card, rand(DECLINE_REPLIES));
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
      if (Math.random() < 0.7) { addPopAll(0.3); logMessage("😎 Stylovej! Popularita +."); }
      else { addPopAll(-1); logMessage("🤡 Tak ty si dobrej šašek že nosíš fejky"); }
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
        else { addPopAll(-1.5); logMessage("🤮 Zákazník to poznal – popularita −1,5 všude!"); }
      } },
      { label: "Zůstat věrný kvalitě", run: () => logMessage("👌 Zůstal jsi věrný kvalitě.") }
    ]
  }),
  () => ({
    text: "🎂 Tvůj kámoš má narozky – dáš mu 1g jako dárek?",
    choices: [
      { label: "Dát 1 g", run: () => {
        if (S.supply >= 1) { S.supply -= 1; addPopAll(0.4); logMessage("🎁 Kámoš happy – rozkecá to dál! 🌟Popularita +"); }
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
          addPop(d, 0.3);
          logMessage(`🔍 Zjistil jsi, kde konkurence nestíhá. Popularita v ${d} +0,3.`);
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
        if (S.supply >= 10) { S.supply -= 10; addPopAll(1); logMessage("🎉 Sněhová párty proběhla, popularita ve čtvrtích výrazně vzrostla!"); }
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
          if (S.supply >= 3) { S.supply -= 3; addPop(d, 0.5); logMessage(`🥊 Rozdal jsi vzorky líp než Sergei. Popularita v ${d} +0,5.`); }
          else logMessage("🤷‍♂️ Nemáš čím přebít.");
        } },
        { label: "Ignorovat", run: () => { addPop(d, -0.5); logMessage(`😬 Sergei ti vzal část trhu v ${d} (−0,5).`); } }
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
        addPop(rand(districtNames), 0.2);
        logMessage("🏃 Doběhl jsi ho a zákazník si to rozmyslel. Popularita +0,2.");
      } },
      { label: "Nechat to být", run: () => { addPop(rand(districtNames), -0.2); logMessage("😒 Zákazník je pryč. Popularita −0,2."); } }
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
        for (let i = 0; i < 3; i++) { const d = rand(districtNames); addPop(d, 0.5); S.police[d] = Math.min(3.4, S.police[d] + 0.4); }
        logMessage("📸 Story zabrala! Popularita +0,5 ve třech čtvrtích, ale policie to taky viděla.");
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
        addPopAll(0.3);
        if (Math.random() < 0.2) { const d = rand(districtNames); logMessage(`🍻 Popularita +0,3 všude, ale po pár pivech ses prořekl. Policie v ${d} je ve střehu.`); addHeat(d, 0.5); }
        else logMessage("🍻 Dobrý večer. Popularita +0,3 všude.");
      } },
      { label: "Ne, mám práci", run: () => logMessage("💼 Makáš dál.") }
    ]
  }),
  () => ({
    text: "🚖 Taxikář: „Kam to bude, šéfe? Dovezu rychle.“",
    choices: [
      { label: "Taxi (−800 Kč, +1 h)", run: () => {
        if (S.money >= 800) { S.money -= 800; S.timeLeft = round2(S.timeLeft + 1); logMessage("🚖 Svezli tě bez zdržení. Dnes máš o hodinu víc."); }
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
        addPopAll(0.3);
        districtNames.forEach(d => { S.police[d] = Math.min(3.4, S.police[d] + 0.3); });
        logMessage("📰 Anonymní zdroj z podsvětí! Popularita +0,3, ale policie se o tebe zajímá víc.");
      } },
      { label: "Odmítnout", run: () => logMessage("🤫 Žádné komentáře.") }
    ]
  }),
  () => ({
    text: "😤 Zákazník píše, že poslední dávka byla slabá a chce kompenzaci.",
    choices: [
      { label: "Vrátit 2 500 Kč", run: () => {
        if (S.money >= 2500) { S.money -= 2500; addPop(rand(districtNames), 0.2); logMessage("🤝 Spokojený zákazník, popularita +0,2."); }
        else logMessage("💸 Nemáš ani 2 500 Kč.");
      } },
      { label: "Dát 1 g navíc", run: () => {
        if (S.supply >= 1) { S.supply -= 1; addPop(rand(districtNames), 0.1); logMessage("🎁 Zákazník utichl. Popularita +0,1."); }
        else logMessage("🤷‍♂️ Nemáš ani gram.");
      } },
      { label: "Ignorovat", run: () => {
        addPop(rand(districtNames), -0.3);
        telegramFeed({ custom: "🔴 Slabý, nedoporučuju. – anonym" });
        logMessage("😒 Zákazník to rozkecal. Popularita −0,3.");
      } }
    ]
  })
];

function clearEventTimer() {
  if (eventTimer) { clearInterval(eventTimer); eventTimer = null; }
}

// Eventy se losují na začátku dne (aby je nešlo přeskočit kliknutím na „Další den“).
// Den nejde ukončit, dokud nejsou všechny dnešní eventy zobrazené a vyřešené.
// Event přijde nejdřív 4 dny po předchozím a pak s 30% šancí denně (průměrně jednou za ~7 dní).
function scheduleEvents(afterMs) {
  eventsPending = (S.day - S.lastEventDay >= 4 && Math.random() < 0.3) ? 1 : 0;
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

function showEvent() {
  // nepoužij event, který byl nedávno (posledních 10), a quicktime event nejvýš jednou za 10 dní
  const quickOk = S.day - S.lastQuickDay >= 10;
  const pool = EVENT_FACTORIES
    .map((f, idx) => ({ e: f(), idx }))
    .filter(x => (!x.e.cond || x.e.cond()) && !S.recentEvents.includes(x.idx) && (!x.e.timeout || quickOk));
  if (!pool.length) { eventsPending = Math.max(0, eventsPending - 1); return; }
  const picked = rand(pool);
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
  names.forEach(name => {
    const opts = SUPPLY_OPTIONS.slice().sort(() => Math.random() - 0.5).slice(0, 3).sort((a, b) => a.grams - b.grams);
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
  hint.textContent = "Kapacita stashe, právník na zátahy a kurýr, který ti dá víc času.";
  box.appendChild(hint);

  const add = (text, price, tooltip, fn) => {
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
    box.appendChild(b);
  };

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
    add(`🏃 Kurýr #${S.runners + 1} (+1 h denně)`, r.price, `Provoz ${fmt(r.upkeep)} Kč denně. Když na něj nebudou peníze, odejde.`, () => {
      S.runners++;
      logMessage(`🏃 Najal jsi kurýra. Od zítřka +1 h denně (provoz ${fmt(runnerUpkeep())} Kč/den).`);
    });
  }
  if (S.lawyer && S.runners >= RUNNERS.length && S.capLevel >= CAPACITY.length - 1) {
    const d = document.createElement("div");
    d.textContent = "Všechno vylepšeno.";
    box.appendChild(d);
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
    barberWait > 0 ? `Vlasy ti ještě musejí dorůst (${barberWait} dní).` : "Jednou týdně: popularita +0,1 a heat −0,3 všude.",
    false, barberWait > 0, () => {
      S.lastHaircutDay = S.day;
      addPopAll(0.1);
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
function renderDistrictTable() {
  const rows = districtNames.map(d => {
    const pop = S.pop[d];
    const h = S.police[d] || 0;
    const level = policeLevels[Math.min(3, Math.floor(h))];
    let popIcon = "🕳️", popLabel = "Neznámý";
    if (pop >= 4) { popIcon = "🔥"; popLabel = "Hvězda"; }
    else if (pop >= 2) { popIcon = "🌟"; popLabel = "Známý"; }
    else if (pop >= 1) { popIcon = "📦"; popLabel = "Místní"; }
    let policeIcon = "🕵️", barColor = "#3fae6a";
    if (h >= 3) { policeIcon = "🚨"; barColor = "#e5484d"; }
    else if (h >= 2) { policeIcon = "👀"; barColor = "#f5a524"; }
    else if (h >= 1) { barColor = "#c9b83a"; }
    const popPct = Math.max(4, pop / 5 * 100);
    const heatPct = Math.max(4, h / 3.5 * 100);
    return `<div class="district">
      <div>${d}</div>
      <div class="meter" title="Popularita"><span style="width:${popPct}%;background:#2f7fc4"></span><em>${popIcon} ${popLabel}</em></div>
      <div class="meter" title="Policie"><span style="width:${heatPct}%;background:${barColor}"></span><em>${policeIcon} ${level} · ${Math.round(h / 3.5 * 100)} %</em></div>
    </div>`;
  }).join("");
  $("districtTableContainer").innerHTML = `
    <div class="district d-head"><div>Čtvrť</div><div>🌟 Popularita</div><div>🚨 Policie</div></div>
    ${rows}`;
}

/* ---------- mapa ---------- */
const MAP_BOUNDS = { x0: -5.4, x1: 5.2, y0: -7.4, y1: 5.0 };
function mapPoint(p) {
  return {
    x: 30 + (p.x - MAP_BOUNDS.x0) / (MAP_BOUNDS.x1 - MAP_BOUNDS.x0) * 260,
    y: 22 + (MAP_BOUNDS.y1 - p.y) / (MAP_BOUNDS.y1 - MAP_BOUNDS.y0) * 256
  };
}
const heatColor = h => (h >= 3 ? "#e5484d" : h >= 2 ? "#f5a524" : h >= 1 ? "#c9b83a" : "#3fae6a");

// Mapa Prahy: kde právě jsi, odkud píšou zákazníci a kolik by cesta trvala.
// Vzdálenost od tebe určuje čas doručení – ve stejné čtvrti je to jen 10 minut.
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

  // řeka jako dekorace
  const rv = [{ x: 0.9, y: 5 }, { x: 0.8, y: 2.8 }, { x: -0.2, y: 0.2 }, { x: -0.6, y: -2.5 }, { x: 0.3, y: -5.5 }, { x: 0.8, y: -7.4 }].map(mapPoint);
  const river = `M${rv[0].x},${rv[0].y} C${rv[1].x},${rv[1].y} ${rv[2].x},${rv[2].y} ${rv[3].x},${rv[3].y} S${rv[4].x},${rv[4].y} ${rv[5].x},${rv[5].y}`;

  let lines = "", nodes = "";
  districtNames.forEach(d => {
    const p = mapPoint(districts[d]);
    const h = S.police[d] || 0;
    const r = 7 + S.pop[d] * 2.2;
    if (open[d] && S.loc !== d) {
      const mx = (mp.x + p.x) / 2, my = (mp.y + p.y) / 2;
      lines += `<line x1="${mp.x}" y1="${mp.y}" x2="${p.x}" y2="${p.y}" class="route"/>`
        + `<text x="${mx}" y="${my - 3}" class="route-t">${fmtDur(travelTime(S.loc, d))}</text>`;
    }
    nodes += `<g class="node${S.loc === d ? " here" : ""}">
      <title>${d}: popularita ${S.pop[d].toFixed(1)}/5, policie ${Math.round(h / 3.5 * 100)} %</title>
      <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${heatColor(h)}" fill-opacity="0.85"/>
      <text x="${p.x}" y="${p.y + r + 11}" class="node-label">${d}</text>
      ${open[d] ? `<circle cx="${p.x + r}" cy="${p.y - r}" r="8" class="badge-c"/><text x="${p.x + r}" y="${p.y - r + 3.5}" class="badge-t">${open[d]}</text>` : ""}
    </g>`;
  });
  const hp = mapPoint(HOME);
  box.innerHTML = `<svg viewBox="0 0 320 300" class="map-svg" role="img" aria-label="Mapa čtvrtí">
    <path d="${river}" class="river"/>
    ${lines}
    ${nodes}
    <text x="${hp.x}" y="${hp.y + 4}" class="home-t">🏠</text>
    <circle cx="${mp.x}" cy="${mp.y}" r="9" class="ping"/>
    <circle cx="${mp.x}" cy="${mp.y}" r="5" class="me-dot"/>
  </svg>
  <div class="map-legend muted">Barva = policie · velikost = popularita · číslo = čekající poptávky · ● ty</div>`;
}

function daysToRent() { return (30 - (S.day % 30)) % 30; }

function updateStatus() {
  if (!S) return;
  // po snížení heatu se může varování zase "odemknout"
  districtNames.forEach(d => { S.warned[d] = Math.min(S.warned[d], heatLevel(S.police[d])); });

  const toRent = daysToRent();
  const rentAmount = rentFor(S.day + toRent) + S.debt;
  const stashWarn = S.supply === 0 ? " warn" : "";
  $("status").innerHTML = `
    <div class="pill"><span class="pi">📅</span><b>${dayName(S.day)}</b><small>den ${S.day}</small></div>
    <div class="pill money"><span class="pi">💰</span><b>${fmt(S.money)} Kč</b></div>
    <div class="pill${stashWarn}"><span class="pi">❄️</span><b>${S.supply}/${cap()} g</b></div>
    <div class="pill${S.timeLeft <= 0 ? " warn" : ""}"><span class="pi">⏱️</span><b>${fmtDur(S.timeLeft)}</b></div>`;

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
  const subs = Math.round(1200 + S.stats.delivered * 41 + districtNames.reduce((a, d) => a + S.pop[d], 0) * 220);
  $("subsCount").textContent = `kanál · ${fmt(subs)} odběratelů`;

  renderDistrictTable();
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
}

function victory() {
  S.won = true;
  unlock("rich");
  clearOfferTimers();
  showEnd("🏆 VYHRÁL JSI!", `Našetřil jsi ${fmt(GOAL_MONEY)} Kč za ${S.day} dní. Čas zmizet z Prahy… nebo to ještě chvíli protáhnout.`, true);
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
  document.querySelectorAll("#gameLog .offer").forEach(card => {
    if (!card.dataset.done) disappointCustomer(card.dataset.nickname, card.dataset.district);
  });

  // souhrn dne
  const net = S.money - S.today.startMoney;
  const summary = S.today.delivered
    ? `📊 Den ${S.day}: ${S.today.delivered}× doručeno (${S.today.grams} g), peníze ${net >= 0 ? "+" : ""}${fmt(net)} Kč`
    : `📊 Den ${S.day}: nic jsi nedoručil, peníze ${net >= 0 ? "+" : ""}${fmt(net)} Kč`;

  // trh a policie: čtvrť bez doručení vychládá a ztrácí popularitu (konkurence)
  // heat pomalu klesá jen tam, kam nedoručuješ: −0,05 denně, po 3 klidných dnech −0,15 denně
  const lost = [];
  districtNames.forEach(d => {
    if (S.accepted[d]) return;
    S.idle[d]++;
    S.police[d] = Math.max(0, S.police[d] - (S.idle[d] >= 3 ? 0.15 : 0.05));
    if (S.idle[d] >= 3 && S.pop[d] > 0.5) {
      S.pop[d] = Math.max(0.5, S.pop[d] - (S.idle[d] >= 6 ? 0.3 : 0.15));
      lost.push(d);
    }
  });

  // policejní akce: čím známější čtvrť, tím větší šance, že policie posílí hlídky
  let policeNote = null, policeTarget = null;
  if (Math.random() < 0.15) {
    const weights = districtNames.map(d => 0.3 + S.pop[d]);
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
  districtNames.forEach(d => { S.freq[d] = 0; });
  S.timeLeft = 4 + S.runners;

  $("gameLog").innerHTML = "";
  unreadCount = 0;
  updateScrollBtn();
  logMessage(`📆 ${dayName(S.day)} – Začíná den ${S.day}`);
  logMessage(summary);
  if (lost.length) logMessage(`🥶 Konkurence ti zabírá trh: ${lost.join(", ")}.`);
  if (policeNote) { logMessage(policeNote); checkHeat(policeTarget); }

  S.today = { delivered: 0, grams: 0, startMoney: S.money };

  // starý záznam o zátahu se promlčí
  if (S.strikes > 0 && S.day - S.lastStrikeDay >= 20) {
    S.strikes--;
    S.lastStrikeDay = S.day;
    logMessage("⚖️ Starý záznam o zátahu se promlčel.");
  }

  processPending();

  // provoz kurýrů
  if (S.runners > 0) {
    const upkeep = runnerUpkeep();
    if (S.money >= upkeep) S.money -= upkeep;
    else {
      S.runners--;
      S.timeLeft = 4 + S.runners;
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
  startDayOffers();
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
  clearSave();
  S = newState();
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

function continueGame() {
  const loaded = loadGame();
  if (!loaded) { startNewGame(); return; }
  S = loaded;
  resetUi();
  $("introScreen").style.display = "none";
  playBackgroundMusic();
  logMessage(`💾 Hra načtena – ${dayName(S.day)}, den ${S.day}.`);
  updateStatus();
  startDayOffers();
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
  $("versionTag").textContent = "v" + VERSION;
  S = newState();           // jen aby se dalo vykreslit UI za úvodní obrazovkou
  refreshSuppliers();
  updateStatus();
  logMessage(`💬 Vítej v Sněhovém Dealerovi – verze ${VERSION}`);

  $("gameLog").addEventListener("scroll", updateScrollBtn);
  if (loadGame()) $("continueBtn").style.display = "";

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
window.showTab = showTab;
window.scrollChat = scrollChat;
window.nextDay = nextDay;

init();
