// Sněhový Dealer – verze 4.0

let day = 1;
let supply = 5;
let money = 5000;
let timeLeft = 5;
let currentCar = "🚋 Tramvaj";
let carDelivery = {
  "🛵 Yamaha Aerox": 0,
  "🚋 Tramvaj": 0.5, // Slower travel time for tram
  "🚗 Golf 2001 1.9TDI": -0.5,
  "🚙 BMW 330D": -1,
  "🏎️ BMW M4": -1.5
};
let caught = false;
let districtFrequency = {};
let lastDistrictForTelegram = null;
let simChangedToday = false;
let phoneChangedToday = false;
let salesToday = false;
let districtPopularity = {};
let districtPolice = {};
let policeLevel = 0;
let districtSuccesses = {};
let districtFails = {};
let districtPoliceWarnings = {};
let offersRemaining = 0;
let districtAcceptedToday = {};
let districtRejectedToday = {};

const weekDays = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
const districts = { "Žižkov": 1, "Vinohrady": 1, "Karlín": 1.5, "Holešovice": 1.5, "Smíchov": 2, "Dejvice": 2, "Letná": 2.5, "Modřany": 3 };
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

districtNames.forEach(d => {
  districtPopularity[d] = 0.5; // Start with a low value for "Neznámý"
  districtPolice[d] = 0;
  districtPoliceWarnings[d] = 0;
});



const policeLevels = ["Neznámý", "Známý", "Sledovaný", "Hledaný"];

function updateStatus() {
  const today = weekDays[(day - 1) % 7];
  const supplyColor = supply === 0 ? "red" : "white"; // Red if supply is 0
  document.getElementById("status").innerHTML = `
    📅 ${today} – Den ${day} | 
    <span style="color: ${supplyColor};">❄️ ${supply}g</span> | 
    💰 ${money} Kč | ⏱️ ${timeLeft}h
  `;
  document.getElementById("carInfo").innerText = `🚗 Auto: ${currentCar}`;
  renderDistrictTable();

  // Vypočtená proměnná pro nejvyšší popularitu – momentálně se s ní nepracuje,
  // ale může být využita pro budoucí rozšíření statusu.
  const popLevel = Math.max(...districtNames.map(d => districtPopularity[d]));
}

function renderDistrictTable() {
  const container = document.getElementById("districtTableContainer");
  container.innerHTML = `
    <table style="width: auto; float: right; border-collapse: collapse; font-size: 0.9rem; background: #111; border: 1px solid #444;">
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
const policeLevel = policeLevels[policeIndex] || "Neznámý";

// Determine popularity icon and label
let popIcon = "🕳️";
let popLabel = "Neznámý";
if (pop >= 5) {
  popIcon = "🔥";
  popLabel = "Hvězda";
} else if (pop >= 2) {
  popIcon = "📦";
  popLabel = "Místní";
} else if (pop >= 1) {
  popIcon = "🌟";
  popLabel = "Známý";
}

// Determine police level and color
let policeIcon = "🕵️";
let policeColor = "#fff";
if (policeLevel === "Sledovaný") {
  policeColor = "orange";
} else if (policeLevel === "Hledaný") {
  policeColor = "red";
  policeIcon = "🚨";
}
        

          return `
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #444;">${d}</td>
              <td style="padding: 6px 12px; border: 1px solid #444;">${popIcon} ${popLabel}</td>
              <td style="padding: 6px 12px; border: 1px solid #444; color: ${policeColor};">${policeIcon} ${policeLevel}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

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

const telegramMessages = [
  "🟢 Tenhle týpek dává bomby!", "🟡 Trochu pomalý, ale jde to.",
  "🟢 Doručení 10/10, doporučím chábrům.",
  "🟢 Tenhle týpek má top kvalitu od Escobara.",
  "🟢 Včera bomba, dneska znova!",
  "🟢 To je MRDA!",
  "🟢 PIČO TO MĚ VYSTŘELILO JAK PRAK",
  "🟢 Thy DEBILE :DD JEBA",
  "🟢 Dealer roku, 5/5!",
  "🟢 Legendární úroveň služby.",
  "🟢 I moje máma by od něj brala.",
  "🟢 Dorazil i když pršelo, to cením.",
  "🟢 Díky za rychlost, kámo.",
  "🟢 Přesný čas a kvalita, vždycky.",
  "🔴 Dneska mě odmítl, zklamání...",
  "🔴 Čekal jsem, ale neodepsal.",
  "🔴 Vysral se na mě a musel jsem jít spát v 10 jak šašek",
  "🔴 Nedodal, seru na to.",
  "🔴 Hraje si na ballera, ale nedodá.",
  "🔴 Neodepsal stejně má jenom Pikain",
  "🔴 Je to jen hype, ve skutečnosti nic."
];

// Optimalizovaná funkce pro generování telegramových zpráv
function generateTelegramMessage(negative = false, customMessage = null, nickname = null) {
  const container = document.getElementById("telegramMessages");

  function prependMessage(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    container.prepend(p); // Add the message at the top
    container.scrollTop = 0; // Ensure the latest message is visible
  }

  function pickMessage() {
    const filteredMessages = negative
      ? telegramMessages.filter(m => m.startsWith("🔴"))
      : telegramMessages.filter(m => !m.startsWith("🔴"));
    return filteredMessages[Math.floor(Math.random() * filteredMessages.length)];
  }

  if (customMessage) {
    prependMessage(customMessage);
    return;
  }

  if (Math.random() < 0.3) { // 30% chance for a positive message
    const msg = pickMessage();
    const finalMessage = nickname ? `${msg} – ${nickname}` : msg; // Include nickname
    prependMessage(finalMessage);

    // Adjust popularity based on the message type
    if (negative && lastDistrictForTelegram) {
      districtPopularity[lastDistrictForTelegram] = Math.max(0, districtPopularity[lastDistrictForTelegram] - 0.3);
    } else if (!negative && lastDistrictForTelegram) {
      districtPopularity[lastDistrictForTelegram] += 0.3;
    }
  }
}

// Cap maximum popularity at 5
districtNames.forEach(d => {
  districtPopularity[d] = Math.min(districtPopularity[d], 5);
});

// Adjust generateOffer to increase frequency with popularity
function generateOffer() {
  if (offersRemaining <= 0 || timeLeft <= 0 || caught) return;

  const grams = Math.floor(Math.random() * 3) + 1;
  const pricePerGram = 1800 + Math.floor(Math.random() * 1200);

  // Increase weight for districts where the player is "Známý" or higher
  const weightedDistricts = districtNames.flatMap(d => {
    const weight = districtPopularity[d] >= 1 ? Math.ceil(districtPopularity[d] * 15) : Math.ceil(districtPopularity[d] * 10);
    return Array(weight).fill(d);
  });
  if (weightedDistricts.length === 0) return; // Prevent errors if no districts are available
  const district = weightedDistricts[Math.floor(Math.random() * weightedDistricts.length)];
  lastDistrictForTelegram = district;

  const nickname = getRandomCustomerFromDistrict(district);
  const totalBase = grams * pricePerGram;
  const baseTime = districts[district];
  const bonus = carDelivery[currentCar] || 0;
  const deliveryTime = Math.max(1, baseTime + bonus);
  const roundedPrice = Math.round(totalBase / 100) * 100;

  if (timeLeft < deliveryTime || supply < grams) {
    logMessage(`⚠️ ${nickname} z ${district} – chtěl ${grams}g – ale nemáš čas nebo stash.`);
    districtFails[district] = (districtFails[district] || 0) + 1;

    // Add negative comment to Telegram feed
    if (Math.random() < 0.35) { // Adjusted to 35% chance
      generateTelegramMessage(true, null, nickname);
      if (districtFails[district] >= 5) {
        districtFails[district] = 0;
        districtPopularity[district] = Math.max(0, districtPopularity[district] - 1);
      }
    }

    offersRemaining--;
    return;
  }

  playSound("notif");

  const messages = [
    `hej bro, mas ${grams}? mam ${roundedPrice} kc, ale specham do ${district}`,
    `Čau, mohl bys mi prosím doručit ${grams}g do ${district}? Mám připraveno ${roundedPrice} Kč.`,
    `ty vole kamo, potrebuju snih ${grams}g, cash ready ${roundedPrice}, kde se potkame?`,
    `zdar, hodis mi ${grams} do ${district}? mam ${roundedPrice}kc, ale fakt specham`,
    `hele, mam jen ${roundedPrice}kc, jsem na mrdku na teambuildingu :DD co za to dostanu treba ${grams}?`,
    `Bráško, dneska fakt nutně potřebuju ${grams}g, jsem v ${district}, ozvi se pls.`,
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

  const yes = document.createElement("button");
  yes.innerText = "Přijmout";
  yes.classList.add("btn");
  yes.onclick = () => {
    if (timeLeft < deliveryTime) {
      logMessage(`❌ Nemáš dost času na doručení do ${district}. Nabídka odmítnuta.`);
      districtFails[district] = (districtFails[district] || 0) + 1;

      // Add negative comment to Telegram feed
      if (Math.random() < 0.55) {
        generateTelegramMessage(true, null, nickname);
        if (districtFails[district] >= 5) {
          districtFails[district] = 0;
          districtPopularity[district] = Math.max(0, districtPopularity[district] - 1);
        }
      }

      yes.remove();
      no.remove();
      offersRemaining--;
      updateStatus();
      return;
    }

    if (supply < grams) {
      logMessage(`❌ Nemáš dost stash na doručení ${grams}g do ${district}. Nabídka odmítnuta.`);
      districtFails[district] = (districtFails[district] || 0) + 1;

      // Add negative comment to Telegram feed
      if (Math.random() < 0.55) {
        generateTelegramMessage(true, null, nickname);
        if (districtFails[district] >= 5) {
          districtFails[district] = 0;
          districtPopularity[district] = Math.max(0, districtPopularity[district] - 1);
        }
      }

      yes.remove();
      no.remove();
      offersRemaining--;
      updateStatus();
      return;
    }

    districtSuccesses[district] = (districtSuccesses[district] || 0) + 1;
    districtAcceptedToday[district] = true;

    // Adjust popularity growth
    if (districtSuccesses[district] >= 3) {
      districtSuccesses[district] = 0;
      districtPopularity[district] = Math.min(5, districtPopularity[district] + 0.3); // Cap at 5
    }

    
      

    supply -= grams;
    money += roundedPrice;
    districtFrequency[district] = (districtFrequency[district] || 0) + 1;
    districtPopularity[district] = Math.min(5, districtPopularity[district] + 0.15); // Cap at 5
    timeLeft -= deliveryTime;
    salesToday = true;
    logMessage(`✅ Doručeno. -${grams}g, +${roundedPrice} Kč`);
    generateTelegramMessage(false, null, nickname);
    checkPolice(district);
    updateStatus();
    yes.remove();
    no.remove();
    offersRemaining--;
    if (districtPolice[district] >= 3) {
      logMessage(`🚔 Policie tě zatkla v ${district}! GAME OVER.`);
      caught = true;
      return;
    }
  };

  const no = document.createElement("button");
  no.innerText = "Odmítnout";
  no.classList.add("btn");
  no.onclick = () => {
    logMessage("❌ Nabídka odmítnuta.");
    districtFails[district] = (districtFails[district] || 0) + 1;

    // Add negative comment to Telegram feed with nickname
    if (Math.random() < 0.55) { // 55% chance
      generateTelegramMessage(true, null, nickname); // Pass nickname explicitly
      if (districtFails[district] >= 5) {
        districtFails[district] = 0;
        districtPopularity[district] = Math.max(0, districtPopularity[district] - 1);
      }
    }

    yes.remove();
    no.remove();
    offersRemaining--;
    updateStatus();
  };

  document.getElementById("gameLog").appendChild(yes);
  document.getElementById("gameLog").appendChild(no);
}

// Adjust random customer messages to look like offers but without buttons
function generateRandomCustomerMessage() {
  const randomMessages = [
    "čau, jak se máš nepůjdeme někam",
    "Už jsem ti někdy řekl že si fakt dobrej kámoš?",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "Vozíš i půlky?",
    "Sry špatný číslo",
    "Nabalil jsem včera ve studiu hodně nabitou roštěnku, za 2 ti jí přenechám",
    "VČERA TO BYLO MEGA",
    "Kolega z práce prej od tebe taky bere :D",
    "Jdu do Atíku, budeš mít čas kolem 7? Ráno?",
    "Hm, tak jsem bez papíru bro včera jsem lízl opiáty",
    "Nevíš o někom kdo by uměl zařídit kouli?",
    "Si zvanej na moje narozky bro",

  ];
  const district = districtNames[Math.floor(Math.random() * districtNames.length)];
  const nickname = getRandomCustomerFromDistrict(district);
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  typeMessage(`💬 ${nickname} (${district}): ${msg}`);
}

// Adjust nextDay to treat unanswered offers as rejected and reduce initial offers
function nextDay() {
  if (caught) {
    logMessage("🚨 Hra skončila, byl jsi zatčen nebo jsi neměl na nájem!.");
    return;
  }

  
  
  

  // Stop the Grundza song if it is playing
  const grundzaSong = document.getElementById("grundzaSong");
  if (grundzaSong && !grundzaSong.paused) {
    grundzaSong.pause();
    grundzaSong.currentTime = 0; // Reset playback position
  }

  // Treat unanswered offers as rejected
  const activeOffers = [...document.querySelectorAll("button")].filter(btn =>
    btn.innerText === "Přijmout" || btn.innerText === "Odmítnout"
  );
  if (activeOffers.length > 0) {
    logMessage("❌ Neodpověděl jsi na nabídky, jsou považovány za odmítnuté.");
    activeOffers.forEach(btn => btn.remove());
    districtNames.forEach(d => {
      if (districtAcceptedToday[d] !== true) {
        const nickname = getRandomCustomerFromDistrict(d); // Get a random nickname
        districtFails[d] = (districtFails[d] || 0) + 1;
        if (Math.random() < 0.50) {
          generateTelegramMessage(true, null, nickname); // Pass nickname explicitly
          if (districtFails[d] >= 5) {
            districtFails[d] = 0;
            districtPopularity[d] = Math.max(0, districtPopularity[d] - 1);
          }
        }
      }
    });
  }

  if (!salesToday) {
    districtNames.forEach(d => {
      if (!districtAcceptedToday[d]) {
        if (districtPopularity[d] > 1 && Math.random() < 0.5) {
          districtPopularity[d] -= 0.3; // Decay for neglected districts
          logMessage(`🥶 Popularita v ${d} klesla – dlouho jsi tam nedoručoval.`);
        }
        if (districtPolice[d] > 0) {
          districtPolice[d] = Math.max(0, (districtPolice[d] || 0) - 0.2); // Ensure initialization
          logMessage(`🕵️ Policie v ${d} se trochu uklidnila (-0.2).`);
        }
      }
    });
  }

  if (salesToday) {
    checkHotDistricts();
  }

  salesToday = false;
  districtFails = {};
  districtAcceptedToday = {};

  document.getElementById("gameLog").innerHTML = "";
  timeLeft = 4; // Adjust time allocation per day to 4 hours
  simChangedToday = false;
  phoneChangedToday = false;

  const today = weekDays[(day - 1) % 7];
  logMessage(`📆 ${today} – Začíná den ${day}`);
  updateStatus();

  if (day > 1 && today === "Pondělí") showSupplier();
  showAutoOptions();
  showSecurityOptions();

  if ((day + 5) % 30 === 0)
    {
    logMessage("📱 Majitel bytu: „Doufám, že tenhle měsíc zaplatíš včas, za 5 dní si přijdu“");
    logMessage("🏚️ Za 5 dní je nájem – 25 000 Kč, pokud nebudeš mít na zaplacení přijde majitel do bytu a ukradne ti stash!");
  }
  

  if (day % 30 === 0) {
    const rent = 20000;
    if (money >= rent) {
      money -= rent;
      logMessage(`🏚️ Platíš nájem: -${rent} Kč. Praha není levná...`);
    } else if (supply >= 7) {
      supply -= 7;
      logMessage("😡 Nemáš peníze na nájem! Majitel si vzal 7g z tvého stashe.");
    } else {
      logMessage("💀 Nemáš peníze ani stash – majitel bytu tě vyhodil a odstěhoval ses do Brna. GAME OVER.");
      caught = true;
      return;
    }
  }

  if (day === 1) {
    typeMessage(
      "💬 @cmoud: Ahoj, já končím takže předávám svoje řemeslo, dal jsem kontakt na tebe pár lidem co vím že jsou v pohodě. Taky jsem ti nechal 2 bůrky na začátek, hodně štěstí!"
    );
  } else {
    const maxPop = Math.max(...districtNames.map(d => districtPopularity[d]));
    const baseOffers = Math.min(1 + Math.floor(maxPop / 2), 5); // Base offers based on popularity
    const bonusOffers = Math.floor(maxPop); // Additional offers based on high popularity
    offersRemaining = baseOffers + bonusOffers; // Combine base and bonus offers

    for (let i = 0; i < offersRemaining; i++) {
      setTimeout(() => generateOffer(), i * 1500); // Adjusted to 1.5-second interval
    }

    // Occasionally generate a random customer message
    if (Math.random() < 0.15) {
      setTimeout(() => generateRandomCustomerMessage(), offersRemaining * 1500 + 1000);
    }
  }

  // Trigger a one-take event with a 25% chance
  runOneTakeEvent(() => {
    day++; // Increment day after processing
  });
}

let grundzaEventTriggered = false; // Track if the Grundza event has occurred

function runOneTakeEvent(callbackAfterEvent = () => {}) {
  const events = [
    {
      text: "🧼 V klubu ti z kapsy vypadlo 2g – zkusíš to najít?",
      yes: () => {
        if (Math.random() < 0.5) {
          supply += 2;
          logMessage("🕵️‍♂️ Našel jsi to pod gaučem! Jackpot.");
        } else {
          const randomDistrict = districtNames[Math.floor(Math.random() * districtNames.length)];
          districtPolice[randomDistrict] = (districtPolice[randomDistrict] || 0) + 1; // Ensure initialization
          logMessage("👮 Někdo tě viděl hledat – zájem policie v " + randomDistrict + " +1!");
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
          const loss = 1000;
          money = Math.max(0, money - loss);
          logMessage("🚓 Kamera tě nahrála, dostal jsi pokutu " + loss + " Kč.");
        }
      },
      no: () => logMessage("😇 Nechal jsi je být. Karma čistá.")
    },
    {
      text: "🧂 Napadlo tě seknout zásoby – chceš je naředit moukou?",
      yes: () => {
        const risk = Math.random();
        if (risk < 0.5) {
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
          districtNames.forEach(d => districtPopularity[d] += 0.6);
          logMessage("🎁 Kámoš happy – rozkecá to dál! 🌟+0.6");
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
          const reducedDistrict = districtNames[Math.floor(Math.random() * districtNames.length)];
          districtPolice[reducedDistrict] = Math.max(0, (districtPolice[reducedDistrict] || 0) - 1); // Ensure initialization
          logMessage("📴 Vzal jsi ho – policie zmatena v " + reducedDistrict + ".");
        } else {
          logMessage("💸 Nemáš ani na levnej mobil.");
        }
      },
      no: () => logMessage("📵 Zůstáváš u starý Nokie.")
    },
    {
      text: "🕵️ V klubu jsi slyšel drby o konkurenci – půjdeš to ověřit?",
      yes: () => {
        const risk = Math.random();
        if (risk < 0.4) {
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
            logMessage("😎 Stylovej! Popularita +0.3.");
          } else {
            districtNames.forEach(d => districtPopularity[d] = Math.max(0, districtPopularity[d] - 1));
            logMessage("🤡 🤡 🤡  Tak ty si dobrej šašek že nosíš fejky");
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
          if (Math.random() < 0.70) {
            districtNames.forEach(d => districtPopularity[d] += 0.3);
            logMessage("😎 Stylovej! Popularita +0.3.");
          } else {
            districtNames.forEach(d => districtPopularity[d] = Math.max(0, districtPopularity[d] - 1));
            logMessage("🤡 🤡 🤡  Tak ty si dobrej šašek že nosíš fejky");
          }
        } else {
          logMessage("💸 Nemáš ani na pásek. Trapas.");
        }
      },
      no: () => logMessage("👖 Zůstáváš lowkey.")
    },
    {
      text: "🍪 Grundza ti nabídl říznout stash perníkem – bereš?",
      condition: () => day === 16 && !grundzaEventTriggered, // Trigger only on the 16th day
      yes: () => {
        grundzaEventTriggered = true; // Mark the event as triggered
        const stashIncrease = Math.floor(supply * 0.5); // Increase stash by 50%
        supply += stashIncrease;
        logMessage("🥄VEČEŽE!🥄VEČEŽE!🥄VEČEŽE! STASH SMRDÍ JAK BENZÍN DO HuskVarny ale máš ho o půlku víc.");
        playSound("grundzaSong"); // Play the specified song
        updateStatus();
        callbackAfterEvent();
      },
      no: () => {
        grundzaEventTriggered = true; // Mark the event as triggered
        logMessage("😒 Grundza se urazil, nic nebude.");
        updateStatus();
        callbackAfterEvent();
      }
    },
    {
      text: "💬 @panblazer: Ahoj, mám dnes narozky ale nemám žádnej cash.. to víš koupili jsme barák. Neměl bys jedničku for free?",
      condition: () => day === 12, // Trigger only on the 12th day
      yes: () => {
        if (supply < 1) {
          supply += 1; // Ensure the player has at least 1g
        }
        supply -= 1; // Deduct 1g for the gift
        logMessage("🎉🎉🎉A dárek pořešenej 🎁❄️!");
        updateStatus();
        callbackAfterEvent();
      }
    }
  ];

  const availableEvents = events.filter(e => !e.condition || e.condition()); // Filter events by condition

  // Handle Grundza event on the 16th day
  if (day === 16 && !grundzaEventTriggered) {
    const grundzaEvent = availableEvents.find(e => e.text.includes("Grundza"));
    if (grundzaEvent) {
      logMessage(`❗ ${grundzaEvent.text}`);

      const yes = document.createElement("button");
      yes.innerText = "Ano";
      yes.classList.add("btn"); // Ensure consistent button styling
      yes.onclick = () => {
        grundzaEvent.yes();
        yes.remove();
        no.remove();
      };

      const no = document.createElement("button");
      no.innerText = "Ne";
      no.classList.add("btn"); // Ensure consistent button styling
      no.onclick = () => {
        grundzaEvent.no();
        yes.remove();
        no.remove();
      };

      document.getElementById("gameLog").appendChild(yes);
      document.getElementById("gameLog").appendChild(no);
      return;
    }
  }

  // Handle PanBlazer event on the 12th day
  if (day === 12) {
    const panBlazerEvent = availableEvents.find(e => e.text.includes("@panblazer"));
    if (panBlazerEvent) {
      logMessage(panBlazerEvent.text);

      const yes = document.createElement("button");
      yes.innerText = "Přijmout";
      yes.classList.add("btn"); // Ensure consistent button styling
      yes.onclick = () => {
        panBlazerEvent.yes();
        yes.remove();
      };

      document.getElementById("gameLog").appendChild(yes);
      return;
    }
  }

  // Reduce the probability of other one-take events to 10%
  if (availableEvents.length > 0 && Math.random() < 0.1) {
    const e = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    logMessage(`❗ ${e.text}`);

    const yes = document.createElement("button");
    yes.innerText = "Ano";
    yes.classList.add("btn"); // Ensure consistent button styling
    yes.onclick = () => {
      e.yes();
      yes.remove();
      no.remove();
      updateStatus();
      callbackAfterEvent();
    };

    const no = document.createElement("button");
    no.innerText = "Ne";
    no.classList.add("btn"); // Ensure consistent button styling
    no.onclick = () => {
      e.no();
      yes.remove();
      no.remove();
      updateStatus();
      callbackAfterEvent();
    };

    document.getElementById("gameLog").appendChild(yes);
    document.getElementById("gameLog").appendChild(no);
  } else {
    callbackAfterEvent();
  }
}

function checkPolice(district) {
  if (districtPopularity[district] > 2 && Math.random() < 0.3) {
    districtPolice[district] = (districtPolice[district] || 0) + 1; // Ensure initialization
    logMessage(`🚨 Policie v ${district} tě víc sleduje!`);
  }
  if (districtPolice[district] >= 3.3) {
    playSound("siren");
    document.body.classList.add("police-flash");
    logMessage(`🚔 Policie tě zatkla v ${district}! GAME OVER.`);
    caught = true;
  }
}



// Nepoužívaná funkce – slouží pro rychlé zobrazení statistik čtvrtí
function showDistrictStats() {
  const container = document.getElementById("districtTableContainer");
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Čtvrť</th>
          <th>🌟</th>
          <th>🚨</th>
        </tr>
      </thead>
      <tbody>
        ${districtNames.map(d => `
          <tr>
            <td>${d}</td>
            <td style="text-align:center;">${districtPopularity[d]}</td>
            <td style="text-align:center;">${policeLevel[districtPolice[d]]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function checkHotDistricts() {
  for (let district in districtFrequency) {
    if (districtFrequency[district] >= 3 && Math.random() < 0.4) {
      const msg = `🚨 Policie si všimla častých pohybů v ${district}.`;
      generateTelegramMessage(true, msg);
      districtPolice[district] = Math.min(3, (districtPolice[district] || 0) + 1); // Ensure initialization
      districtFrequency[district] = 0;
      return;
    }
  }
}

function showSupplier() {
  const baseOptions = [
    { grams: 5, basePrice: 8000 },
    { grams: 10, basePrice: 16000 },
    { grams: 20, basePrice: 26000 },
    { grams: 50, basePrice: 60000 }, // New option
    { grams: 100, basePrice: 110000 } // New option
  ];

  logMessage("📦 Dodavatel má nové zásoby:");

  baseOptions.forEach(opt => {
    const variance = Math.floor(opt.basePrice * (Math.random() * 0.5 - 0.25));
    const finalPrice = opt.basePrice + variance;
    const btn = document.createElement("button");
    btn.innerText = `${opt.grams}g za ${finalPrice} Kč`;
    btn.classList.add("btn"); // Ensure consistent button styling
    btn.onclick = () => {
      if (money >= finalPrice) {
        money -= finalPrice;
        supply += opt.grams;
        logMessage(`✅ Koupil jsi ${opt.grams}g za ${finalPrice} Kč.`);
      } else {
        logMessage("❌ Nemáš dost peněz.");
      }
      updateStatus();
      btn.remove();
    };
    document.getElementById("gameLog").appendChild(btn);
  });
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
    "🚋 Tramvaj": 0, // Default vehicle, no cost
    "🚗 Golf 2001 1.9TDI": 30000,
    "🚙 BMW 330D": 100000,
    "🏎️ BMW M4": 700000
  };
  const popularityBonus = {
    "🛵 Yamaha Aerox": 0.2,
    "🚋 Tramvaj": 0,
    "🚗 Golf 2001 1.9TDI":0.5,
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

function startGame() {
  document.getElementById("introScreen").style.display = "none";
  playBackgroundMusic();
  nextDay();
}

// Attach startGame to the global window object
window.startGame = startGame;

function toggleHowToPlay() {
  const section = document.getElementById("howToPlay");
  section.style.display = section.style.display === "none" ? "block" : "none";
}

// Pomocná funkce pro vytvoření tlačítek u bezpečnostních možností
function createSecurityButton(text, callback) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.classList.add("btn");
  btn.onclick = () => {
    callback();
    updateStatus();
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
  description.setAttribute("style", "font-size: 0.8rem; color: #aaa; margin-bottom: 5px;");
  headerContainer.appendChild(description);
  

  // Helper function to create a button with tooltip
  function createSecurityButton(text, cost, tooltip, callback) {
    const btn = document.createElement("button");
    btn.innerText = `${text} – ${cost} Kč`;
    btn.classList.add("btn");
    btn.disabled = money < cost; // Disable if not enough money
    btn.title = tooltip; // Add tooltip
    btn.onclick = () => {
      if (!btn.disabled) {
        callback();
        updateStatus();
        showSecurityOptions(); // Obnoví tlačítka podle nového zůstatku
      }
    };
    return btn;
  }

  // Tlačítka
  const barber = createSecurityButton(
    "💈 Holič",
    2000,
    "Sníží heat policie globálně o velmi málo bodů.",
    () => {
      money -= 2000;
      districtNames.forEach(d => {
        if (districtPolice[d] > 0 && Math.random() < 0.2) {
          districtPolice[d]--;
        }
      });
      logMessage("💈 Nový sestřih – policie tě méně poznává.");
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

  // Přidání tlačítek
  headerContainer.appendChild(barber);
  headerContainer.appendChild(sim);
  headerContainer.appendChild(phone);
  headerContainer.appendChild(bribe);
}
function getRandomCustomerFromDistrict(district) {
  const customers = districtCustomers[district];
  if (!customers || customers.length === 0) return "@unknown"; // Fallback if no customers are defined
  return customers[Math.floor(Math.random() * customers.length)];
}

window.onload = () => {
  logMessage("💬 Vítej v Sněhovém Dealerovi – verze 4.0");
  updateStatus();
  showAutoOptions(); // Ensure auto options are displayed on load
  showSecurityOptions(); // Ensure security options are displayed on load

  const audio = document.createElement("audio");
  audio.id = "grundzaSong";
  audio.src = "sounds/CHURAQ_SPUTNIK_HOFTYK_NAUME_NA_PLECH.mp3"; // Replace with the actual path
  audio.preload = "auto";
  document.body.appendChild(audio);
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
