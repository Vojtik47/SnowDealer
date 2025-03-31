// Sněhový Dealer – verze 4.3

// GLOBALNÍ PROMĚNNÉ
let day = 1;
let supply = 5;
let money = 5000;
let timeLeft = 5;
let currentCar = "🚋 Tramvaj";
let caught = false;
let salesToday = false;
let offersRemaining = 0;
let lastHaircutDay = null;


// Proměnné pro statistiky a sledování denních úspěchů
let districtFrequency = {};
let districtAcceptedToday = {}; // Sledování, zda v dané čtvrti již byla objednávka přijata
let simChangedToday = false;
let phoneChangedToday = false;
let districtSuccesses = {};

// Nový set pro sledování zákazníků, kteří dnes již obdrželi nabídku
let offersTodayUsers = new Set();

// Konstanty a parametry
const NEGATIVE_PROB = 0.5;
const weekDays = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
const districts = { 
  "Žižkov": 1, "Vinohrady": 1, "Karlín": 1.5, "Holešovice": 1.5, 
  "Smíchov": 2, "Dejvice": 2, "Letná": 2.5, "Modřany": 3 
};
const districtCustomers = {
  "Žižkov": ["@zizman", "@needhelpdycky", "@VojtikPupik", "@parkovej", "@cmoud"],
  "Vinohrady": ["@vinoqueen", "@prosecco_bae", "@panvino", "@mimiblog", "@Tom Zfoutera"],
  "Karlín": ["@startuplord", "@devonacid", "@panblazer", "@karlincooler", "@scrummasterka"],
  "Holešovice": ["@skaterh", "@MartinKocian14", "@techbro", "@holeboy", "@mina1337"],
  "Smíchov": ["@$PRYNC", "@lidltrader", "@tramvajguy", "@deckadaddy", "@babickaG."],
  "Dejvice": ["@diplomatson", "@sugar-denny", "@MatroDaVinci", "@ambasadorcz", "@highclassh"],
  "Letná": ["@letnapivo", "@Metr Párna", "@Hajzlberg", "@letna_influ", "@dogsitterka"],
  "Modřany": ["@modranboy", "@vlakfetak", "@kralpanelaku", "@cyklosnek", "@kajakboss"]
};
const districtNames = Object.keys(districts);

// Inicializace popularity a policie
let districtPopularity = {};
let districtPolice = {};
districtNames.forEach(d => {
  districtPopularity[d] = 0.5;
  districtPolice[d] = 0;
});

// Základní ceny pro zákaznické objednávky (1–5g)
const customerBasePrices = {
  1: 3000,
  2: 5000,
  3: 6500,
  4: 8000,
  5: 9500
};

// Informace o vozidlech
const carDelivery = {
  "🛵 Yamaha Aerox": 0.5,
  "🚋 Tramvaj": 1,
  "🚗 Golf 2001 1.9TDI": -1,
  "🚙 BMW 330D": -1.5,
  "🏎️ BMW M4": -3
};

const policeLevels = ["Neznámý", "Známý", "Sledovaný", "Hledaný"];

// --- Pomocná funkce pro vážený výběr ---
function weightedRandomChoice(choices) {
  let r = Math.random();
  let sum = 0;
  for (let i = 0; i < choices.length; i++) {
    sum += choices[i].weight;
    if (r < sum) {
      return choices[i].value;
    }
  }
  return choices[choices.length - 1].value;
}

// --- UI a pomocné funkce ---

function typeMessage(text) {
  const log = document.getElementById("gameLog");
  const p = document.createElement("p");
  log.appendChild(p);
  let i = 0;
  function type() {
    if (i < text.length) {
      p.textContent += text.charAt(i);
      i++;
      setTimeout(type, 25);
    }
  }
  type();
  log.scrollTop = log.scrollHeight;
}

function logMessage(msg) {
  const log = document.getElementById("gameLog");
  const p = document.createElement("p");
  p.innerText = msg;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function updateStatus() {
  const today = weekDays[(day - 1) % 7];
  const supplyColor = supply === 0 ? "red" : "white";
  document.getElementById("status").innerHTML = `
    📅 ${today} – Den ${day} | 
    <span style="color: ${supplyColor};">❄️ ${supply}g</span> | 
    💰 ${money} Kč | ⏱️ ${timeLeft}h
  `;
  document.getElementById("carInfo").innerText = `🚗 Auto: ${currentCar}`;
  renderDistrictTable();
}

function renderDistrictTable() {
  const container = document.getElementById("districtTableContainer");
  container.innerHTML = `
    <table style="width: auto; float: middle; border-collapse: collapse; font-size: 0.9rem; background: #111; border: 1px solid #444;">
      <thead>
        <tr style="background: #222;">
          <th style="padding: 6px 12px; border: 1px solid #444;">📍 Čtvrť</th>
          <th style="padding: 6px 12px; border: 1px solid #444;">🌟 Popularita</th>
          <th style="padding: 6px 12px; border: 1px solid #444;">🚨 Policie</th>
        </tr>
      </thead>
      <tbody>
        ${districtNames.map(d => {
          const pop = districtPopularity[d];
          const rawPolice = districtPolice[d] || 0;
          const policeIndex = Math.floor(rawPolice);
          const level = policeLevels[policeIndex] || "Neznámý";
          let popIcon = "🕳️", popLabel = "Neznámý";
          if (pop >= 4) { popIcon = "🔥"; popLabel = "Hvězda"; }
          else if (pop >= 2) { popIcon = "🌟"; popLabel = "Známý"; }
          else if (pop >= 1) { popIcon = "📦"; popLabel = "Místní"; }
          let policeIcon = "🕵️", policeColor = "#fff";
          if (level === "Sledovaný") { policeColor = "orange"; }
          else if (level === "Hledaný") { policeColor = "red"; policeIcon = "🚨"; }
          return `
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #444;">${d}</td>
              <td style="padding: 6px 12px; border: 1px solid #444;">${popIcon} ${popLabel}</td>
              <td style="padding: 6px 12px; border: 1px solid #444; color: ${policeColor};">${policeIcon} ${level}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// --- Telegram zprávy ---
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

function generateTelegramMessage(negative = false, customMessage = null, nickname = null) {
  const container = document.getElementById("telegramMessages");
  function prependMessage(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    container.prepend(p);
    container.scrollTop = 0;
  }
  function pickMessage() {
    const filtered = negative
      ? telegramMessages.filter(m => m.startsWith("🔴"))
      : telegramMessages.filter(m => !m.startsWith("🔴"));
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  if (customMessage) { prependMessage(customMessage); return; }
  if (Math.random() < 0.3) { // 30% šance
    const msg = pickMessage();
    const finalMsg = nickname ? `${msg} – ${nickname}` : msg;
    prependMessage(finalMsg);
    if (negative && lastDistrictForTelegram) {
      districtPopularity[lastDistrictForTelegram] = Math.max(0, districtPopularity[lastDistrictForTelegram] - 0.3);
    } else if (!negative && lastDistrictForTelegram) {
      districtPopularity[lastDistrictForTelegram] += 0.3;
    }
  }
}

let lastDistrictForTelegram = null;

// --- Nabídky ---
function getRandomCustomerFromDistrict(district) {
  const customers = districtCustomers[district];
  return customers && customers.length ? customers[Math.floor(Math.random() * customers.length)] : "@unknown";
}

function generateOffer() {
  if (offersRemaining <= 0 || timeLeft <= 0 || caught) return;
  
  // Generování objednaného množství pomocí váženého výběru dle specifikovaných pravděpodobností
  const grams = weightedRandomChoice([
    { value: 1, weight: 0.40 },
    { value: 2, weight: 0.30 },
    { value: 3, weight: 0.20 },
    { value: 4, weight: 0.05 },
    { value: 5, weight: 0.05 }
  ]);
  
  // Výběr čtvrti váženým způsobem dle popularity
  const weightedDistricts = districtNames.flatMap(d => {
    const weight = districtPopularity[d] >= 1 ? Math.ceil(districtPopularity[d] * 15) : Math.ceil(districtPopularity[d] * 10);
    return Array(weight).fill(d);
  });
  if (weightedDistricts.length === 0) return;
  const district = weightedDistricts[Math.floor(Math.random() * weightedDistricts.length)];
  lastDistrictForTelegram = district;
  
  // Výběr zákazníka, který dnes ještě nebyl použit
  let nickname = getRandomCustomerFromDistrict(district);
  let attempts = 0;
  while (offersTodayUsers.has(nickname) && attempts < 10) {
    nickname = getRandomCustomerFromDistrict(district);
    attempts++;
  }
  offersTodayUsers.add(nickname);
  
  // Výpočet ceny dle základních cen
  const basePrice = customerBasePrices[grams] || (3000 + (grams - 1) * 1500);
  let finalPrice = basePrice;
  const rand = Math.random();
  if (rand < 0.8) {
    finalPrice = basePrice;
  } else if (rand < 0.95) {
    const discount = 0.05 + Math.random() * 0.1;
    finalPrice = basePrice * (1 - discount);
  } else {
    const markup = 0.05 + Math.random() * 0.15;
    finalPrice = basePrice * (1 + markup);
  }
  const roundedPrice = Math.round(finalPrice / 100) * 100;
  
  // Výpočet času doručení
  const baseTime = districts[district];
  const bonus = carDelivery[currentCar] || 0;
  const deliveryTime = Math.max(0.33, baseTime + bonus);
  
  // Automatické odmítnutí, pokud nemáš dost času nebo zásob
  if (timeLeft < deliveryTime || supply < grams) {
    logMessage(`⚠️ ${nickname} z ${district} – chtěl ${grams}g, ale nemáš čas nebo stash.`);
    if (Math.random() < NEGATIVE_PROB) {
      generateTelegramMessage(true, null, nickname);
    }
    offersRemaining--;
    return;
  }
  
  playSound("notif");
  const messages = [
    `hej bro, mas ${grams}? mam ${roundedPrice} kc, ale specham do ${district}`,
    `Čau, mohl bys mi prosím doručit ${grams}g do ${district}? Mám připraveno ${roundedPrice} Kč.`,
    `ty vole kamo, potrebuju snih ${grams}g, cash ready ${roundedPrice}, kde se potkáme?`,
    `zdar, hodis mi ${grams} do ${district}? mam ${roundedPrice}kc, ale fakt specham`,
    `hele, mam jen ${roundedPrice}kc, jsem na mrdku na teambuildingu :DD co za to dostanu treba ${grams}?`,
    `Bráško, dneska fakt nutně potrebuju ${grams}g třeba za ${roundedPrice}, jsem v ${district}, ozvi se pls.`,
    `yo, mas neco fresh? treba ${grams} za ${roundedPrice}, ale rychle pls`,
    `Dobrý den, rád bych si objednal ${grams}g za ${roundedPrice} Kč. Je to možné?`,
    `hej kamo, kamosz rikal ze mas kvalitu, vzal bych ${grams}g, cash ${roundedPrice}kc`,
    `cau, jsem v ${district}, hodis mi ${grams}? mam ${roundedPrice}kc, ale specham`,
    `ty kravo, potrebuju ${grams}g, jinak jsem v haji, mam ${roundedPrice}kc`,
    `Zdarec, ${grams} pls, cash ready ${roundedPrice}kc, Praha jede`,
    `cs pls ${grams} pls,za  ${roundedPrice}kc, u me ${district}`,
    `Kolik ${grams} v kolik co nejdřív a za zakolik ${roundedPrice}kc ?`,
    `Yo, kamo, ${grams}g za ${roundedPrice}kc, ale fakt rychle, jsem v ${district}`,
    `Hele, potřebuji nutně ${grams}g, mám ${roundedPrice}, kde se potkáme?`,
    `Čau, máš čas? Vzal bych ${grams}g za ${roundedPrice}, jsem v ${district}.`,
    `brasko, dneska fakt nutne potrebuju,je zima a snezi ${grams}g, cash ${roundedPrice}`,
    `hej kamo, ${grams}g pls, ale specham, jsem v ${district}, mam ${roundedPrice}`,
    `yo, mas neco na zkousku? treba ${grams}, cash ready ${roundedPrice}kc`,
    `Dobrý den, mohl byste mi doručit ${grams} do ${district}? Mám připraveno ${roundedPrice} Kč.`
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  typeMessage(`💬 ${nickname} (${district} - ⏱️${deliveryTime}h): ${msg}`);
  
  // Vytvoření nabídky do logu
  const offerDiv = document.createElement("div");
  offerDiv.classList.add("offer");
  offerDiv.dataset.nickname = nickname;
  offerDiv.dataset.district = district;
  
  const yesBtn = document.createElement("button");
  yesBtn.innerText = "Přijmout";
  yesBtn.classList.add("btn");
  yesBtn.onclick = () => {
    if (timeLeft < deliveryTime) {
      logMessage(`❌ Nemáš dost času na doručení do ${district}. Nabídka odmítnuta.`);
      if (Math.random() < NEGATIVE_PROB) {
        generateTelegramMessage(true, null, nickname);
      }
      offerDiv.remove();
      offersRemaining--;
      updateStatus();
      return;
    }
    if (supply < grams) {
      logMessage(`❌ Nemáš dost stash na doručení ${grams}g do ${district}. Nabídka odmítnuta.`);
      if (Math.random() < NEGATIVE_PROB) {
        generateTelegramMessage(true, null, nickname);
      }
      offerDiv.remove();
      offersRemaining--;
      updateStatus();
      return;
    }
    districtSuccesses[district] = (districtSuccesses[district] || 0) + 1;
    districtAcceptedToday[district] = true; // Označíme, že v této čtvrti proběhla úspěšná objednávka
    offerDiv.dataset.accepted = "true";
    supply -= grams;
    money += roundedPrice;
    districtFrequency[district] = (districtFrequency[district] || 0) + 1;
    districtPopularity[district] = Math.min(5, districtPopularity[district] + 0.2);
    timeLeft -= deliveryTime;
    salesToday = true;
    logMessage(`✅ Doručeno. -${grams}g, +${roundedPrice} Kč`);
    generateTelegramMessage(false, null, nickname);
    checkPolice(district);
    checkHotDistricts();
    updateStatus();
    offerDiv.remove();
    offersRemaining--;
    if (districtPolice[district] >= 3.5) {
      logMessage(`🚔 Policie tě zatkla v ${district}! GAME OVER.`);
      caught = true;
      return;
    }
  };
  
  const noBtn = document.createElement("button");
  noBtn.innerText = "Odmítnout";
  noBtn.classList.add("btn");
  noBtn.onclick = () => {
    logMessage("❌ Nabídka odmítnuta.");
    if (Math.random() < NEGATIVE_PROB) {
      generateTelegramMessage(true, null, nickname);
    }
    offerDiv.remove();
    offersRemaining--;
    updateStatus();
  };
  
  offerDiv.appendChild(yesBtn);
  offerDiv.appendChild(noBtn);
  document.getElementById("gameLog").appendChild(offerDiv);
}

// --- Generování náhodných zpráv zákazníků ---
function generateRandomCustomerMessage() {
  const randomMessages = [
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
  const district = districtNames[Math.floor(Math.random() * districtNames.length)];
  const nickname = getRandomCustomerFromDistrict(district);
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  typeMessage(`💬 ${nickname} (${district}): ${msg}`);
}

// --- One-take eventy ---
function runOneTakeEvent(callbackAfterEvent = () => {}) {
  const events = [
    {
      text: "🧼 V klubu ti z kapsy vypadlo 2g – zkusíš to najít?",
      yes: () => {
        if (Math.random() < 0.5) {
          supply += 2;
          logMessage("🕵️‍♂️ Našel jsi to pod gaučem! Jackpot.");
        } else {
          const d = districtNames[Math.floor(Math.random() * districtNames.length)];
          districtPolice[d] = (districtPolice[d] || 0) + 1;
          logMessage(`👮 Někdo tě viděl hledat – zájem policie v ${d} ++!`);
        }
      },
      no: () => logMessage("👋 Kašli na to, bude nový.")
    },
    {
      text: "💸 Našel jsi na zemi 2000 Kč – vezmeš si je?",
      yes: () => {
        if (Math.random() < 0.8) {
          money += 2000;
          logMessage("💰 Vzal jsi je – easy money.");
        } else {
          money = Math.max(0, money - 1000);
          logMessage("🚓 Kamera tě nahrála, dostal jsi pokutu 1000 Kč.");
        }
      },
      no: () => logMessage("😇 Nechal jsi je být. Karma čistá.")
    },
    {
      text: "🧂 Napadlo tě seknout zásoby – chceš je naředit moukou?",
      yes: () => {
        if (Math.random() < 0.5) {
          supply += 2;
          logMessage("😏 Naředil jsi a nikdo nic nepoznal.");
        } else {
          districtNames.forEach(d => {
            districtPopularity[d] = Math.max(0, districtPopularity[d] - 2);
          });
          logMessage("🤮 Zákazník to poznal – popularita -2!");
        }
      },
      no: () => logMessage("👌 Zůstal jsi věrný kvalitě.")
    },
    {
      text: "🎂 Tvůj kámoš má narozky – dáš mu 1g jako dárek?",
      yes: () => {
        if (supply >= 1) {
          supply -= 1;
          districtNames.forEach(d => districtPopularity[d] += 0.4);
          logMessage("🎁 Kámoš happy – rozkecá to dál! 🌟Popularita +");
        } else {
          logMessage("🤷‍♂️ Nemáš ani gram – trapas.");
        }
      },
      no: () => logMessage("😒 Nedal jsi nic – zůstáváš tajemný.")
    },
    {
      text: "📱 Našel jsi levnej burner telefon za 1000 Kč – koupíš ho?",
      yes: () => {
        if (money >= 1000) {
          money -= 1000;
          const d = districtNames[Math.floor(Math.random() * districtNames.length)];
          districtPolice[d] = Math.max(0, (districtPolice[d] || 0) - 1);
          logMessage(`📴 Vzal jsi ho – policie zmatena v ${d}.`);
        } else {
          logMessage("💸 Nemáš ani na levnej mobil.");
        }
      },
      no: () => logMessage("📵 Zůstáváš u starý Nokie.")
    },
    {
      text: "🕵️ V klubu jsi slyšel drby o konkurenci – půjdeš to ověřit?",
      yes: () => {
        if (Math.random() < 0.4) {
          const stolen = Math.floor(Math.random() * 3) + 1;
          supply = Math.max(0, supply - stolen);
          logMessage(`😱 Byl to setup – ztratil jsi ${stolen}g.`);
        } else {
          logMessage("🔍 Zjistil jsi info o konkurenčním dealerovi. Brzy ho uvidíš.");
        }
      },
      no: () => logMessage("🦺 Zůstal jsi v bezpečí.")
    },
    {
      text: "🧢 Kámoš ti nabídl pásek Moncler vestu za 6500 Kč. Bereš?",
      yes: () => {
        if (money >= 6500) {
          money -= 6500;
          if (Math.random() < 0.7) {
            districtNames.forEach(d => districtPopularity[d] += 0.3);
            logMessage("😎 Stylovej! Popularita +.");
          } else {
            districtNames.forEach(d => districtPopularity[d] = Math.max(0, districtPopularity[d] - 1));
            logMessage("🤡 🤡 🤡 Tak ty si dobrej šašek že nosíš fejky");
          }
        } else {
          logMessage("💸 Nemáš ani na větrovku.. Trapas.");
        }
      },
      no: () => logMessage("👖 Zůstáváš lowkey.")
    },
    {
      text: "🧢 Kámoš ti nabídl pásek BURBERRY za 5000 Kč. Je drip!",
      yes: () => {
        if (money >= 5000) {
          money -= 5000;
          if (Math.random() < 0.7) {
            districtNames.forEach(d => districtPopularity[d] += 0.3);
            logMessage("😎 Stylovej! Popularita +.");
          } else {
            districtNames.forEach(d => districtPopularity[d] = Math.max(0, districtPopularity[d] - 1));
            logMessage("🤡 🤡 🤡 Tak ty si dobrej šašek že nosíš fejky");
          }
        } else {
          logMessage("💸 Nemáš ani na pásek. Trapas.");
        }
      },
      no: () => logMessage("👖 Zůstáváš lowkey.")
    },
    // Nová událost: Vydírání
    (function(){
      const blackmailQty = Math.floor(Math.random() * 5) + 1;
      return {
        text: `✉️ Vyděrač: "Dovez mi ${blackmailQty}g, nebo tě udám!"`,
        yes: () => {
          if (supply >= blackmailQty) {
            supply -= blackmailQty;
            timeLeft = Math.max(0, timeLeft - 1);
            logMessage(`✅ Vydírání splněno: odebral jsi ${blackmailQty}g a ztratil 1 hodinu.`);
          } else {
            logMessage("❌ Nemáš dost stash na splnění vydírání!");
          }
        },
        no: () => {
          if (Math.random() < 0.5) {
            logMessage("😏 Vydírání byl blaf, nic se nestalo.");
          } else {
            const d = districtNames[Math.floor(Math.random() * districtNames.length)];
            districtPolice[d] = Math.max(districtPolice[d], 3);
            logMessage(`🚨 Vydírání neblafoval – policie v ${d} tě HLEDÁ!`);
          }
        }
      };
    })(),
    // Nová událost: Sněhová párty
    {
      text: "❄️ Chceš uspořádat sněhovou párty? (Stálo by to 10g)",
      yes: () => {
        if (supply >= 10) {
          supply -= 10;
          districtNames.forEach(d => {
            districtPopularity[d] = Math.min(5, districtPopularity[d] + 1);
          });
          logMessage("🎉 Sněhová párty proběhla, popularita v čtvrtích výrazně vzrostla!");
        } else {
          logMessage("❌ Nemáš dost stash na sněhovou párty!");
        }
      },
      no: () => logMessage("😐 Sněhová párty odložena.")
    }
  ];
  
  const available = events.filter(e => !e.condition || e.condition());
  if (available.length === 0 || Math.random() > 0.25) {
    callbackAfterEvent();
    return;
  }
  const e = available[Math.floor(Math.random() * available.length)];
  
  // Vytvoříme obalový prvek pro celý event
  const eventContainer = document.createElement("div");
  eventContainer.classList.add("one-take-event"); // Můžeš si přidat vlastní CSS pro lepší vzhled
  
  // Přidáme text eventu
  const eventText = document.createElement("p");
  eventText.innerText = `❗ ${e.text}`;
  eventContainer.appendChild(eventText);
  
  // Vytvoříme tlačítka pro event
  const yesBtn = document.createElement("button");
  yesBtn.innerText = "Ano";
  yesBtn.classList.add("btn");
  yesBtn.onclick = () => {
    e.yes?.();
    eventContainer.remove();
    updateStatus();
    callbackAfterEvent();
  };
  
  const noBtn = document.createElement("button");
  noBtn.innerText = "Ne";
  noBtn.classList.add("btn");
  noBtn.onclick = () => {
    e.no?.();
    eventContainer.remove();
    updateStatus();
    callbackAfterEvent();
  };
  
  eventContainer.appendChild(yesBtn);
  eventContainer.appendChild(noBtn);
  
  // Vložíme celý event (s obalem) na začátek logu
  document.getElementById("gameLog").prepend(eventContainer);
}

// --- Policie a horké čtvrti ---
function checkPolice(district) {
  if (districtPopularity[district] > 2 && Math.random() < 0.3) {
    districtPolice[district] = (districtPolice[district] || 0) + 1;
    logMessage(`🚨 Policie v ${district} tě víc sleduje!`);
  }
  if (districtPolice[district] >= 3.5) {
    playSound("siren");
    document.body.classList.add("police-flash");
    logMessage(`🚔 Policie tě zatkla v ${district}! GAME OVER.`);
    caught = true;
  }
}

function checkHotDistricts() {
  for (let district in districtFrequency) {
    if (districtFrequency[district] >= 3 && Math.random() < 0.4) {
      const msg = `🚨 Policie si všimla častých pohybů v ${district}.`;
      generateTelegramMessage(true, msg);
      districtPolice[district] = Math.min(3, (districtPolice[district] || 0) + 0.5);
      districtFrequency[district] = 0;
      return;
    }
  }
}

// --- Dodavatelé a vozidla ---
function showSupplier() {
  const baseOptions = [
    { grams: 5, basePrice: 8000 },
    { grams: 10, basePrice: 15000 },
    { grams: 20, basePrice: 28000 },
    { grams: 50, basePrice: 65000 },
    { grams: 100, basePrice: 130000 }
  ];
  const supplierNicknames = ["Sněžák", "Mráz", "Frozone", "Ledovec", "Chladič"];
  logMessage("📦 Nové nabídky od dodavatelů:");
  
  for (let i = 0; i < 3; i++) {
    const supplier = supplierNicknames[Math.floor(Math.random() * supplierNicknames.length)];
    baseOptions.forEach(opt => {
      const variance = Math.floor(opt.basePrice * (Math.random() * 0.5 - 0.25));
      const finalPrice = opt.basePrice + variance;
      const btn = document.createElement("button");
      btn.innerText = `${supplier} nabízí: ${opt.grams}g za ${finalPrice} Kč`;
      btn.classList.add("btn");
      btn.onclick = () => {
        if (money >= finalPrice) {
          money -= finalPrice;
          supply += opt.grams;
          logMessage(`✅ U ${supplier} jsi koupil ${opt.grams}g za ${finalPrice} Kč.`);
        } else {
          logMessage(`❌ U ${supplier}: Nemáš dost peněz.`);
        }
        updateStatus();
        btn.remove();
      };
      document.getElementById("gameLog").appendChild(btn);
    });
  }
}

function showAutoOptions() {
  const container = document.getElementById("carOptions");
  container.innerHTML = "";
  const title = document.createElement("div");
  title.innerText = "🚗 Auta:";
  title.style.marginBottom = "5px";
  container.appendChild(title);
  const infoText = document.createElement("div");
  infoText.innerText = "Zkracuje rychlost doručení a přidává popularitu.";
  infoText.style.fontSize = "0.8rem";
  infoText.style.color = "#aaa";
  infoText.style.marginBottom = "5px";
  container.appendChild(infoText);
  const cars = ["🛵 Yamaha Aerox", "🚋 Tramvaj", "🚗 Golf 2001 1.9TDI", "🚙 BMW 330D", "🏎️ BMW M4"];
  const prices = {
    "🛵 Yamaha Aerox": 15000,
    "🚋 Tramvaj": 0,
    "🚗 Golf 2001 1.9TDI": 30000,
    "🚙 BMW 330D": 55000,
    "🏎️ BMW M4": 500000
  };
  const popularityBonus = {
    "🛵 Yamaha Aerox": 0.2,
    "🚋 Tramvaj": 0,
    "🚗 Golf 2001 1.9TDI": 0.5,
    "🚙 BMW 330D": 1,
    "🏎️ BMW M4": 3
  };
  const deliverySpeed = {
    "🛵 Yamaha Aerox": "Rychlé doručení",
    "🚋 Tramvaj": "Pomalé doručení",
    "🚗 Golf 2001 1.9TDI": "Střední rychlost",
    "🚙 BMW 330D": "Rychlé doručení",
    "🏎️ BMW M4": "Velmi rychlé doručení"
  };
  const currentPrice = prices[currentCar] || 0;
  cars.forEach(car => {
    if (car === currentCar || prices[car] <= currentPrice) return;
    const btn = document.createElement("button");
    btn.innerText = `${car} – ${prices[car]} Kč`;
    btn.classList.add("btn");
    btn.title = `${deliverySpeed[car]} | Popularita: +${popularityBonus[car]}`;
    btn.onclick = () => {
      if (money >= prices[car]) {
        money -= prices[car];
        currentCar = car;
        districtNames.forEach(d => {
          districtPopularity[d] += popularityBonus[car];
        });
        logMessage(`✅ Koupil jsi ${car}. Popularita +${popularityBonus[car]}`);
      } else {
        logMessage("❌ Nemáš dost peněz.");
      }
      updateStatus();
      showAutoOptions();
    };
    container.appendChild(btn);
  });
}

// --- Denní přechod (nextDay) ---
function nextDay() {
  if (caught) {
    logMessage("🚨 Hra skončila, byl jsi zatčen nebo jsi neměl na nájem!");
    return;
  }
  
  // Zpracování zbývajících nabídek
  const offers = document.querySelectorAll("#gameLog .offer");
  offers.forEach(offerDiv => {
    if (!offerDiv.dataset.accepted) {
      const nickname = offerDiv.dataset.nickname;
      if (Math.random() < NEGATIVE_PROB) {
        generateTelegramMessage(true, null, nickname);
      }
      offerDiv.remove();
    }
  });
  
  // Snížení popularity a policejní aktivity pro čtvrti bez úspěšné objednávky
  if (!salesToday) {
    districtNames.forEach(d => {
      if (!districtAcceptedToday[d]) {
        if (districtPopularity[d] > 1 && Math.random() < 0.5) {
          districtPopularity[d] -= 0.2;
          logMessage(`🥶 Popularita v ${d} klesla – dlouho jsi tam nedoručoval.`);
        }
        if (districtPolice[d] > 0) {
          districtPolice[d] = Math.max(0, districtPolice[d] - 0.1);
          logMessage(`🕵️ Policie v ${d} se trochu uklidnila.`);
        }
      }
    });
  }
  //if (salesToday) { checkHotDistricts(); }
  
  // Reset denních proměnných
  salesToday = false;
  districtAcceptedToday = {};
  districtNames.forEach(d => { districtFrequency[d] = 0; });
  document.getElementById("gameLog").innerHTML = "";
  timeLeft = 4;
  simChangedToday = false;
  phoneChangedToday = false;
  
  day++;
  const today = weekDays[(day - 1) % 7];
  logMessage(`📆 ${today} – Začíná den ${day}`);
  updateStatus();
  
  if (day > 1 && today === "Pondělí") { showSupplier(); }
  showAutoOptions();
  showSecurityOptions();
  
  if ((day + 5) % 30 === 0) {
    logImportantMessage("📱 Majitel bytu: „Doufám, že tenhle měsíc zaplatíš včas, za 5 dní si přijdu“");
    logImportantMessage("🏚️ Za 5 dní je nájem – 20 000 Kč, pokud nebudeš mít na zaplacení, přijde majitel a ukradne ti stash!");
  }

  if ((day + 1) % 30 === 0) {
    logImportantMessage("🏚️ Nezapomeň, zítra se platí nájem! 20 000 Kč!");
  }
  
  if (day % 30 === 0) {
    const rent = 20000;
    if (money >= rent) {
      money -= rent;
      updateStatus();
      logImportantMessage(`🏚️ Platíš nájem: -${rent} Kč. Praha není levná...`);
    } else if (supply >= 7) {
      supply -= 7;
      updateStatus();
      logImportantMessage("😡 Nemáš peníze na nájem! Majitel si vzal 7g z tvého stashe.");
    } else {
      logMessage("💀 Nemáš peníze ani stash – majitel bytu tě vyhodil a odstěhoval ses do Brna. GAME OVER.");
      caught = true;
      return;
    }
  }
  
  // Úprava kadence objednávek podle popularity – celkový počet objednávek se vynásobí koeficientem 0.5.
  const maxPop = Math.max(...districtNames.map(d => districtPopularity[d]));
  let baseOffers = Math.min(1 + Math.floor(maxPop / 2), 5);
  let bonusOffers = Math.floor(maxPop);
  const currentDay = weekDays[(day - 1) % 7];
  if (currentDay === "Pátek") {
    baseOffers += 3;
    bonusOffers += 1;
  } else if (currentDay === "Sobota") {
    baseOffers += 2;
    bonusOffers += 1;
  } else if (["Pondělí", "Úterý", "Středa"].includes(currentDay)) {
    baseOffers = Math.max(1, baseOffers - 1);
    bonusOffers = Math.max(0, bonusOffers - 1);
  }
  offersRemaining = Math.floor((baseOffers + bonusOffers) * 0.5);
  if (offersRemaining <= 0) {
    logMessage("⚠️ Žádná objednávka nepřišla – popularita je příliš nízká.");
  } else {
    for (let i = 0; i < offersRemaining; i++) {
      setTimeout(() => generateOffer(), i * 1500);
    }
    if (Math.random() < 0.15) {
      setTimeout(() => generateRandomCustomerMessage(), offersRemaining * 1500 + 1000);
    }
    setTimeout(() => runOneTakeEvent(), offersRemaining * 1500 + 2000);
  }
}

// --- Start hry a bezpečnostní možnosti ---
function startGame() {
  document.getElementById("introScreen").style.display = "none";
  playBackgroundMusic();
  typeMessage("💬 @cmoud: Ahoj, já končím takže předávám svoje řemeslo, dal jsem kontakt na tebe pár lidem co vím, že jsou v pohodě. Taky jsem ti nechal 2 bůrky na začátek, hodně štěstí!");
}
window.startGame = startGame;

function toggleHowToPlay() {
  const section = document.getElementById("howToPlay");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

function createSecurityButton(text, cost, tooltip, callback) {
  const btn = document.createElement("button");
  btn.innerText = `${text} – ${cost} Kč`;
  btn.classList.add("btn");
  btn.disabled = money < cost;
  btn.title = tooltip;
  btn.onclick = () => {
    if (!btn.disabled) {
      callback();
      updateStatus();
      showSecurityOptions();
    }
  };
  return btn;
}

function showSecurityOptions() {
  const headerContainer = document.getElementById("securityRow");
  headerContainer.innerHTML = "";
  const title = document.createElement("div");
  title.innerText = "📡 Zmatení policie";
  title.style.marginBottom = "5px";
  title.style.fontWeight = "bold";
  headerContainer.appendChild(title);
  const description = document.createElement("div");
  description.innerText = "Snižuje hledanost policie.";
  description.style.cssText = "font-size: 0.8rem; color: #aaa; margin-bottom: 5px;";
  headerContainer.appendChild(description);
  const barber = createSecurityButton(
    "💈 Holič",
    2000,
    "Jednou týdně ti umožní nový sestřih a přidá 0,1 k popularitě.",
    () => {
      // Zkontroluj, zda byl Holič použit v posledních 7 dnech
      if (lastHaircutDay !== null && day - lastHaircutDay < 7) {
        logMessage("Vlasy ti ještě musejí trochu dorůst :) Zkus to za pár dní.");
        return;
      }
      if (money < 2000) {
        logMessage("Nemáš dost peněz na nový sestřih.");
        return;
      }
      money -= 2000;
      // Aktualizuj den posledního sestřihu
      lastHaircutDay = day;
      // Přidání malého bonusu k popularitě – např. ke všem čtvrtím
      districtNames.forEach(d => {
        districtPopularity[d] = Math.min(5, districtPopularity[d] + 0.1);

        districtNames.forEach(d => {
          districtPolice[d] = Math.max(0, districtPolice[d] - 0.1);
        });
      });
      logMessage("💈 Nový sestřih – popularita mírně vzrostla a policejní hledanost mírně klesla.");
      updateStatus();
    }
  );
  const sim = createSecurityButton(
    "📱 Změnit SIM",
    5000,
    "Sníží heat policie globálně o trochu více bodů než holič.",
    () => {
      money -= 5000;
      districtNames.forEach(d => {
        if (districtPolice[d] > 0 && Math.random() < 0.4) {
          districtPolice[d]--;
        }
      });
      logMessage("📱 SIM změněna – policie ztrácí stopu.");
    }
  );
  const phone = createSecurityButton(
    "📲 Nový mobil",
    25000,
    "Sníží heat policie globálně středně.",
    () => {
      money -= 25000;
      districtNames.forEach(d => {
        districtPolice[d] = Math.max(0, (districtPolice[d] || 0) - 1);
      });
      logMessage("📲 Nový telefon – policie nemá stopy.");
    }
  );
  const bribe = createSecurityButton(
    "💵 Úplatek",
    75000,
    "Sníží heat policie globálně a úplně.",
    () => {
      money -= 75000;
      districtNames.forEach(d => {
        districtPolice[d] = 0;
      });
      logMessage("💵 Policie podplacena – hledanost vynulována.");
    }
  );
  headerContainer.appendChild(barber);
  headerContainer.appendChild(sim);
  headerContainer.appendChild(phone);
  headerContainer.appendChild(bribe);
}

// --- window.onload a background music ---
window.onload = () => {
  logMessage("💬 Vítej v Sněhovém Dealerovi – verze 4.3");
  updateStatus();
  showAutoOptions();
  showSecurityOptions();
  const audio = document.createElement("audio");
  audio.id = "grundzaSong";
  audio.src = "sounds/CHURAQ_SPUTNIK_HOFTYK_NAUME_NA_PLECH.mp3"; // Uprav cestu k souboru
  audio.preload = "auto";
  document.body.appendChild(audio);
  
  // Registrace tlačítka Next Day – ujisti se, že v HTML existuje element s id="nextDay"
  const nextDayBtn = document.getElementById("nextDay");
  if (nextDayBtn) {
    nextDayBtn.addEventListener("click", nextDay);
  }
};

const bgMusic = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusic");
let musicEnabled = false;

function playBackgroundMusic() {
  if (!musicEnabled) {
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
      musicEnabled = true;
      toggleBtn.innerText = "⏸️ Vypnout hudbu";
    }).catch((e) => {
      console.error("🎵 Nelze přehrát hudbu:", e);
    });
  }
}

function logImportantMessage(msg) {
  const log = document.getElementById("gameLog");
  const p = document.createElement("p");
  p.innerText = msg;
  log.prepend(p);
  log.scrollTop = 0;
}


toggleBtn.addEventListener("click", () => {
  if (!musicEnabled) {
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
      musicEnabled = true;
      toggleBtn.innerText = "⏸️ Vypnout hudbu";
    }).catch((e) => {
      console.error("🎵 Nelze přehrát hudbu:", e);
      alert("Hudbu nelze přehrát. Zkontrolujte nastavení prohlížeče.");
    });
  } else {
    bgMusic.pause();
    musicEnabled = false;
    toggleBtn.innerText = "▶️ Zapnout hudbu";
  }
});
