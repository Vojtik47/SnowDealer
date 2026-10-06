# Sněhový Dealer v5.4 – návrh oprav a upgradu

Nahrazuje `index.html` a `GameLogic.js` z verze 4.3 (originály jsou ve složce `original/`).
Složka `sounds/` je stažená z tvého repozitáře beze změn. Soubor `discord_alert.mp3` má v repozitáři jen 21 bajtů, takže je asi prázdný nebo poškozený.

## 1. Opravené chyby (z verze 4.3)

| # | Chyba | Oprava |
|---|-------|--------|
| 1 | Holič měl vnořený `forEach`, heat klesl o 0,8 místo 0,1 | Opraveno, nově −0,3 heat a +0,1 popularita, 1× týdně |
| 2 | `playClickSound` bez závorek a chybějící `<audio id="click">` | Odstraněno, `playSound` je bezpečné i pro chybějící prvek |
| 3 | První kliknutí na „Jak hrát" nic neudělalo (špatná kontrola `display`) | Přepínání přes CSS třídu `open` |
| 4 | Úvodní zpráva neřekla, že se má kliknout na „Další den" | Zpráva doplněna a tlačítko pulzuje |
| 5 | Po zatčení šlo dál klikat, žádný restart | Obrazovka konce hry, statistiky, tlačítko Hrát znovu |
| 6 | „Jednou denně" u SIM, mobilu a úplatku byl jen text | Platí jedna věc na zmatení policie za den |
| 7 | Dodavatel jen v pondělí = uváznutí bez zásob | **Zachováno jako herní mechanika** (plánování zásob na týden). Přidán odpočet do pondělí, nedělní připomínka a záchrana: když nemáš skoro nic a ani na nejlevnější nabídku, @cmoud ti půjčí 3 g na dluh |
| 8 | Heat klesal jen ve dnech bez jediného prodeje | Čtvrť bez doručení vychládá každý den |
| 9 | Telegram recenze měnila popularitu v jiné čtvrti, než byl zákazník | Recenze se vážou na správnou čtvrť |
| 10 | Popularitu bylo možné dostat nad 5 | Všude jeden `addPop` s limitem 0–5 |
| 11 | Nezaplacený nájem po odebrání 7 g zmizel | Mění se v dluh +10 % |
| 12 | Rychlé klikání na „Další den" nechalo staré časovače, objednávky se mísily | Časovače se ruší |
| 13 | První 3 dny (út–čt) nechodila žádná objednávka | Prvních 14 dní min. 2 objednávky denně |
| 14 | Čtvrť s popularitou 0 už nikdy nedostala objednávku | Minimální váha čtvrti je 1 |
| 15 | Nepoužívaná písnička se předčítala (4,5 MB) | Už se nenačítá (soubor v repozitáři zůstává) |

## 2. Nové funkce

- **Cíl a konec hry:** vyhraješ s 1 000 000 Kč v hotovosti (`GOAL_MONEY`). Pak můžeš pokračovat bez cíle. Konec hry má statistiky.
- **Zátahy místo okamžitého zatčení:** při heatu 3,5 přijdeš o polovinu zásob a 10 000 Kč, druhý zátah znamená vězení. Zátahy se po 20 dnech promlčí. Právník (40 000 Kč) jeden zátah zruší. Před zátahem tě hra varuje.
- **Stálí zákazníci:** věrnost 0–5. Stálý zákazník platí až +20 %, píše častěji. Odmítání ho odrazuje.
- **Prémiové nabídky:** +25 až +40 % nad cenu, ale 1 ze 4 je policejní past.
- **Víc textu a nicknamů:** přes 50 různých textů poptávek (ve stejném slangu), 6 speciálních pro stálé zákazníky a 11 nicknamů na čtvrť místo 5.
- **Dodavatelé s povahou:** levný a riskantní (ošidí), spolehlivý, drahý... Týdenní tržní koeficient. Jsou jen v pondělí a nabídky platí jen ten den, takže zásoby plánuješ na celý týden.
- **Kapacita stashe:** 20 g na začátku, vylepšení (skrýš, garáž, sklad).
- **Kurýři:** +1 h denně, ale mají denní provoz.
- **Konkurence:** čtvrť, kam dlouho nedoručuješ, ztrácí popularitu.
- **Nájem roste:** 12 000 Kč a každý měsíc +3 000 Kč (strop 60 000 Kč). Nezaplacený nájem se mění v dluh +10 %, majitel vezme až 7 g a vyhodí tě až při dluhu nad 2,5× nájem.
- **Nové eventy s důsledky:** lichvář (splátka za 7 dní), zboží na dluh (výsledek za 3 dny), policejní kontrola se třemi možnostmi, Sergei z Wishe. Původní eventy mají víc voleb.
- **Souhrn dne, uložení hry a achievementy:** hra se ukládá na začátku každého dne (`localStorage`), tlačítko Pokračovat.
- **UI:** log s akcemi je nahoře, obchody dole. Pruhy popularity a heatu, odpočet nájmu, ukazatel cíle, funguje na mobilu.

## 2b. Úpravy podle zpětné vazby

- **Policie roste rychleji a klesá pomaleji.** Heat za doručení závisí na gramech, popularitě čtvrti, opakování v jedné čtvrti ten den a nápadnosti auta. Navíc je 25% šance, že tě někdo viděl (+0,5). Heat klesá jen ve čtvrtích bez doručení (−0,05 denně, po 3 dnech klidu −0,15). Každý den je 15% šance na policejní akci (+0,6 heat v nějaké čtvrti, víc v popularních). V logu u každého doručení vidíš, o kolik heat stoupl. Tip: rozprostři doručení po městě.
- **Žádné hodnocení ceny u nabídek.** Zmizelo „pod cenou" i „prémiová nabídka". Zůstalo jen ⭐ stálý zákazník.
- **Holič** má vlastní týdenní pauzu a nesdílí denní limit s SIM, mobilem a úplatkem.
- **Doprava přepočítaná.** Auta mají čas, popularitu, nápadnost pro policii a denní provoz. Bez peněz na provoz auto stojí a jedeš tramvají.

  | Auto | Cena | Čas | Popularita | Heat | Provoz/den |
  |------|------|-----|------------|------|------------|
  | Tramvaj | 0 | +1 h | 0 | ×0,8 | 0 |
  | Yamaha Aerox | 40 000 | +0,25 h | +0,2 | ×0,9 | 100 |
  | Golf 2001 | 60 000 | −0,5 h | +0,4 | ×1 | 250 |
  | BMW 330D | 220 000 | −1 h | +0,8 | ×1,15 | 500 |
  | BMW M4 | 2 200 000 | −1,5 h | +1,5 | ×1,4 | 1 200 |
- **Víc eventů.** 27 místo 15. Nové: honička s policií, domovník, anonym (tyto tři jsou na čas a při vypršení se rozhodne za tebe), poker, Wolt, Frozone mimo pondělí, influencerka, uklízečka, pivo, taxi, velká objednávka, novinář, reklamace. Event přijde nejdřív 4 dny po předchozím a pak s 30% šancí denně, tedy průměrně jednou za ~6 dní. Quicktime event nejvýš jednou za 10 dní. Stejný event se neopakuje, dokud neproběhlo 10 jiných. Eventy se losují na začátku dne a „Další den" nejde, dokud je neodpovíš, takže se nedají přeskočit.
- **Ceny dodavatelů:** průměrně ~1 450 Kč za gram (5 g ≈ 1 500, větší balení o něco levněji). Týdenní trh jen ±10 %, dodavatelé -15 % až +10 %.
- **Log:** u doručení se už nepíše změna heatu. Heat vidíš jen v tabulce čtvrtí, plus varování při vyšších úrovních.
- **Nesplněná objednávka** (došel stash nebo čas) už nesnižuje popularitu, jen přijdeš o zisk. Půjčky od @cmouda se nenavyšují nad výši nájmu.

## 2c. Nové UI (ve stylu Telegramu)

- **Chat:** objednávky jsou bubliny zákazníků s avatarem, nickem, čtvrtí a časem. Pod bublinou je shrnutí objednávky a tlačítka Přijmout / Odmítnout jako inline klávesnice v Telegramu. Tvoje odpověď se objeví jako modrá bublina vpravo („jasně, jedu" / „dneska ne, sorry"), výsledek jako šedá systémová hláška.
- **Události** přijdou jako zpráva od „🎲 Událost" (quicktime od „⚡ Quicktime" s odpočtem) a tvoje volba se vypíše jako odpověď.
- **Kanál Snow Reviews:** recenze jsou příspěvky s avatarem, reakcemi 👍🔥/👎 a časem. Počet odběratelů roste s tvou slávou.
- **Horní lišta** s ukazateli (den, peníze, stash, hodiny), **cíl** s progress barem a čipy (zátahy, nájem, dluh), **mapa** čtvrtí, kde je u každé čtvrti vidět popularita i policie (viz níže).
- **Obchod** je v záložkách: Dodavatelé, Auta, Zázemí, Policie. V pondělí se automaticky otevřou dodavatelé a na záložce svítí zelená tečka.
- Tmavý vzhled, animace, funguje i na mobilu.


## 2d. Úpravy po testování ve dvou

- **Nájem** roste jen jednou za 2 měsíce o 2 000 Kč: 12 000 Kč první dva měsíce, pak 14 000, 16 000 … (strop 40 000 Kč). Po roce hry je to 22 000 Kč.
- **Nabídky ze všech čtvrtí.** Známost čtvrti zvyšuje šanci, ale ne o řád: hodně známá čtvrť má asi 2,5× větší šanci než neznámá (dřív 9×). Nenavštívené čtvrti dostávají bonus a čtvrť, která už dnes psala, je méně pravděpodobná.
- **Chat se sám neposouvá.** Když přijde nová zpráva, chat zůstane, kde je, takže neklikneš na jinou nabídku. Dole se objeví šipka „↓" s počtem nových zpráv. Text se píše po písmenkách, ale tlačítka pod bublinou zůstávají na místě.
- **Mapa.** Čtvrti mají polohu a doba cesty se počítá z toho, kde jsi. Ráno vyrážíš z bytu. Po doručení v Dejvicích mají další poptávky z Dejvic jen 10 minut a jiné čtvrti jsou daleko. Časy se přepočítají u všech otevřených nabídek. Mapa ukazuje tebe, čekající poptávky s časem cesty a u každé čtvrti stav: vnější kruh je policie (zelená → červená, při 100 % přijde zátah, červený kruh bliká), modrý střed je popularita (čím známější, tím větší) s ikonou úrovně. Samostatný blok se čtvrtěmi proto zmizel. Rychlost aut: tramvaj 3,4, Yamaha 4,6, Golf 6, BMW 330D 7,6, M4 9,5 km/h v herním čase.
- **Dodavatelé nejde přeskočit omylem.** Když jsou dnes dodavatelé, něco z nabídky by šlo koupit a ještě jsi nic nekoupil, hra se před koncem dne zeptá, jestli opravdu chceš spát bez nákupu.
- **Heat:** při zatčení se heat nesnižuje (dřív tabulka ukazovala 43 % místo 100 %) a u měřiče je procento.

## 2e. Mapa podruhé a směna

- **Půlkruhy:** každá čtvrť na mapě je kruh rozdělený na dvě poloviny. Levý (modrý) je popularita, pravý (zelená → červená) je policie. Vedle jména je 🌟 úroveň známosti, 🚨 procento policie a, pokud čeká poptávka, 🕘 čas příjezdu a doba cesty. Trasy jsou čárkované čáry bez popisků, takže nic nepřekrývají.
- **Realističtější Praha:** Letná je hned vedle Holešovic (přes Vltavu), Dejvice na severozápadě, Karlín–Žižkov–Vinohrady v řadě na východě, Smíchov na jihozápadě a Modřany daleko na jihu. Řeka teče mezi Letnou a Holešovicemi.
- **Směna 20:00–01:00** místo „4 hodin". Hodiny běží podle toho, co děláš (cesty, události). U každé nabídky je doba cesty i čas příjezdu, červeně když by ses nestihl před koncem směny. Kurýr prodlouží směnu o hodinu.

## 2f. Kolik lidí denně píše

Počet nabídek se už nepůlí. Základ je `1,5 + 1,1 × nejvyšší popularita` a násobí se dnem v týdnu: pondělí 0,45, úterý 0,5, středa 0,55, čtvrtek 1,0, pátek a sobota 1,8, neděle 0,7. Zaokrouhluje se náhodně, aby průměr seděl. Strop je 14 denně. Při popularitě 5 vychází pondělí ~3, čtvrtek ~7, pátek a sobota ~12, neděle ~5. Při popularitě 3 pondělí ~2, pátek ~9.

## 2g. Pozdní hra: co dělat s penězi

- **Policejní kontakty** (Zázemí): pasivně snižují heat ve všech čtvrtích každý den za denní provoz. Informátor 60 000 Kč (−0,15 heat/den, 1 500 Kč/den), Důstojník 150 000 Kč (−0,30, 3 500 Kč/den), Náměstek 400 000 Kč (−0,50, 8 000 Kč/den). Když není na provoz, kontakt odejde. Netřeba pořád kupovat SIM a holiče.
- **Velkoodběratelé:** ve čtvrti s popularitou 3,5+ napíše klub, hotel nebo firma (nejvýš 1 denně, jen když máš aspoň 10 g). Chce 10, 15, 20, 30 nebo 50 g za 2 700 až 3 200 Kč/g, běžně je to kolem 2 400. Heat za velkou zásilku neroste lineárně.
- **Prodejci:** v každé čtvrti jeden (najmutí 25 000 Kč, provoz 800 Kč/den), pak tým (60 000 Kč, provoz 2 000 Kč/den, dvojnásobný prodej). Přes noc prodají z tvého stashe asi `1 + 0,7 × popularita` g (tým dvojnásobek) za cca 2 000 Kč/g, přidají heat (0,06 za gram) a drží čtvrť „živou". Při heatu 3+ je 10% denní šance, že prodejce zatknou. Bez peněz na výplatu odejdou.
- **Cena podle slávy:** běžné objednávky platí o 6 % víc za každý bod popularity nad 1 (popularita 5 = +24 %).
- **Auta za realistické ceny** (český trh, ojetá): Yamaha Aerox 40 000 Kč, Golf IV 1.9 TDI 60 000 Kč, BMW 330d 220 000 Kč, Škoda Octavia RS 600 000 Kč, Audi RS6 Avant 1 600 000 Kč, BMW M4 (nové) 2 200 000 Kč. Provoz na den: 100 / 250 / 500 / 700 / 1 600 / 1 800 Kč.
- **Nové čtvrti:** Libeň 60 000, Vršovice 90 000, Břevnov 120 000, Nusle 150 000 Kč. Na mapě jsou vidět jako zamčené stíny s cenou. Každá má 11 vlastních nicků.
## 3. Ladění obtížnosti

- Policejní heat za doručení: +0,75 (dřív +1), šance 25 % rostoucí s dny na 40 %.
- Heat vychládá o 0,1 denně ve čtvrti s prodejem a o 0,3 bez prodeje.
- SIM: −0,6 heat všude. Mobil: −1. Úplatek: vynuluje.
- Siréna hraje jen při zátahu a po 5 vteřinách se vypne, při startu nové hry se zastaví.
- Testování botem (hrajícím podle jednoduchých pravidel, bez plánování): s nákupem jen v pondělí přežije 250 dní asi 4 z 10 her, zbytek skončí na dluzích. Člověk by měl hrát lépe. 1 000 000 Kč bot za 250 dní nedosáhl. Pokud je cíl moc daleko, sniž `GOAL_MONEY`.

## 4. Co zbývá na další verzi

- Časový limit na odpověď u objednávek.
- Zvukové efekty pro klik, úspěch a neúspěch (soubory `mixkit-*.wav` v repozitáři už jsou).
- Zapojení zvuků `mixkit-correct-answer`, `mixkit-wrong-answer`, `mixkit-typewriter` do akcí.
- Žebříček nebo sdílení výsledku.

## 5. Instalace

Přepiš `index.html` a `GameLogic.js` v repozitáři. Složku `sounds/` nech.
Počasí jsem na tvé přání odebral. Hra se spouští otevřením `index.html`.
