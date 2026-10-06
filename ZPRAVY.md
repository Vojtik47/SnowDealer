# Zprávy zákazníků ve hře

Platí pro verzi 5.5. Zástupné značky: **{g}** = počet gramů, **{cena}** = cena v Kč, **{čtvrť}** = název čtvrti.
Upravuješ je v souboru `GameLogic.js`; u každého seznamu je napsáno, kde ho najdeš.

## 1. Běžné poptávky (90)
Pole `messages` ve funkci `generateOffer`. Zákazník napíše náhodnou z nich.

1. hej bro, mas {g}? mam {cena} kc, ale specham do {čtvrť}
2. Čau, mohl bys mi prosím doručit {g}g do {čtvrť}? Mám připraveno {cena} Kč.
3. ty vole kamo, potrebuju snih {g}g, cash ready {cena}, kde se potkáme?
4. zdar, hodis mi {g} do {čtvrť}? mam {cena}kc, ale fakt specham
5. hele, mam jen {cena}kc, jsem na mrdku na teambuildingu :DD co za to dostanu treba {g}?
6. Bráško, dneska fakt nutně potrebuju {g}g třeba za {cena}, jsem v {čtvrť}, ozvi se pls.
7. yo, mas neco fresh? treba {g} za {cena}, ale rychle pls
8. Dobrý den, rád bych si objednal {g}g za {cena} Kč. Je to možné?
9. hej kamo, kamosz rikal ze mas kvalitu, vzal bych {g}g, cash {cena}kc
10. cau, jsem v {čtvrť}, hodis mi {g}? mam {cena}kc, ale specham
11. ty kravo, potrebuju {g}g, jinak jsem v haji, mam {cena}kc
12. Zdarec, {g} pls, cash ready {cena}kc, Praha jede
13. cs pls {g} pls,za  {cena}kc, u me {čtvrť}
14. Kolik {g} v kolik co nejdřív a za zakolik {cena}kc ?
15. Yo, kamo, {g}g za {cena}kc, ale fakt rychle, jsem v {čtvrť}
16. Hele, potřebuji nutně {g}g, mám {cena}, kde se potkáme?
17. Čau, máš čas? Vzal bych {g}g za {cena}, jsem v {čtvrť}.
18. brasko, dneska fakt nutne potrebuju,je zima a snezi {g}g, cash {cena}
19. hej kamo, {g}g pls, ale specham, jsem v {čtvrť}, mam {cena}
20. yo, mas neco na zkousku? treba {g}, cash ready {cena}kc
21. Dobrý den, mohl byste mi doručit {g} do {čtvrť}? Mám připraveno {cena} Kč.
22. bro vim ze je utery ale {g}g by mi zachranilo den, {cena}kc na ruku
23. kamo mam doma navstevu a nic k pivu... {g}g za {cena}kc pls {čtvrť}
24. psal bych diskretne ale jsem v {čtvrť} a stejne to vsichni vi, {g}g za {cena}
25. ahoj, od kolegy z prace, prej {g}g za {cena}kc je u tebe normal?
26. hele {g} do {čtvrť} a jsem tvuj clovek na veky, cash {cena}kc
27. ty vole sef me zatezuje, potrebuju {g}g na zklidneni, {cena}kc ready
28. Dobry vecer, nevite nahodou o nekom kdo by mel {g}g? Nabizim {cena} Kc. Dekuji.
29. mam {cena}kc a zadny svedomi, kolik za {g}g?
30. bro jedu z afterky a potrebuju {g}, cash {cena}kc, jsem v {čtvrť}
31. vole ja jsem uplne vyzmykanej, {g}g do {čtvrť}, {cena}kc nepocitam
32. hele jestli mas {g}g tak ti polibim ruku, mam {cena}kc
33. nejde mi net, ale tobe pisu... {g}g za {cena}kc {čtvrť}
34. zdar ty zmrde, {g}g za {cena}kc, fakt nutne, mam rande :D
35. pls {g}g, {cena}kc, jsem v {čtvrť} za Billou, mam zelenou bundu
36. mrazi me, takze potrebuju {g}g snehu aby mi bylo tepleji :D {cena}kc
37. Dobry den, pisu ohledne inzeratu. {g}g za {cena} Kc, prevzeti {čtvrť}.
38. bracho {g}g, {cena}kc, a kdyby ses zdrzel tak se nic nedeje... skoro
39. kamo promin ze pisu v takovou dobu, {g}g za {cena}kc?
40. ta posledni davka byla fakt dobra, dalsi {g}g za {cena}kc do {čtvrť} pls
41. budu stat u trafiky v {čtvrť}, {g}g, {cena}kc, poznas me podle krosny
42. cau mam {cena}kc z brigady, {g}g pls, ale nepovidej to nikomu
43. mel bys {g}g? ptam se pro kamose. kamos mi dava {cena}kc
44. ahoj nechtel bys {cena}kc? ja chci {g}g ty chces {cena}kc, win-win
45. Dobry den, zastupuji skupinu pratel, ktera by zadala {g}g za {cena} Kc. S pozdravem.
46. jsem na homeoffice a to se neda zvladnout bez {g}g, {cena}kc, {čtvrť}
47. hej {g}g a nenech me cekat jak posledne, {cena}kc
48. {čtvrť} vola. {g}g, {cena}kc, bez keců
49. sorry za spam, ale {g}g za {cena}kc bych bral hned
50. jsem tu novej, rikali ze ty jsi ten pravej... {g}g za {cena}kc {čtvrť}
51. kolega rikal ze mas {g}g na sklade, ja mam {cena}kc a na sklade nic, vymenime?
52. tvoje auto je na {čtvrť} vsude videt, takze {g}g za {cena}kc bude easy ne
53. vole zrovna mi zdrazili najem, {g}g za {cena}kc at to prezijem
54. ahojky, {g}g do {čtvrť} a {cena}kc, jinak budu muset jit spat v 10 jak sasek
55. ahoj, tohle neni podvod ani past, jen {g}g za {cena}kc, dik
56. kamo mam {cena}kc a plan co nema smysl, {g}g by ho zachranilo
57. dobry den, objednavam {g}g na firemni teambuilding, rozpocet {cena} Kc, tema: snih
58. tati rikal ze mam hledat praci, tak hledam: {g}g, {cena}kc, {čtvrť}
59. yo, potrebuju {g}g na vcerejsi chyby, mam {cena}kc
60. zdar, ucim se na zkousku a potrebuju k tomu {g}g, {cena}kc, bez diskuze
61. hele {g}g do {čtvrť}, {cena}kc, a kdyz to bude rychle tak mas u me pivo
62. pomoc, babicka prijizdi za hodinu a nic nemam doma: {g}g, {cena}kc, {čtvrť}
63. dobry vecer, prosim {g}g, {cena} Kc, uhrazeno v hotovosti a s usmevem
64. bro nejsem hrdy ale {g}g za {cena}kc je dneska moje jedina jistota
65. mel jsem tezky tyden. {g}g, {cena}kc, {čtvrť}. nechces si povidat? ne? ok
66. vol mi, pis mi, jen mi dones {g}g do {čtvrť}, {cena}kc cash
67. brasko ty jsi hrdina nasi doby. {g}g, {cena}kc, a hrdinum se neodmita
68. tahle zprava se po precteni nezničí, ale {g}g za {cena}kc je realna
69. ahoj, jsem z {čtvrť}, mam rozpocet {cena}kc a velke ambice na {g}g
70. dneska mi koncilo kolo na lavicce, ty mi ho vynahradis: {g}g, {cena}kc
71. pls pls pls {g}g, {cena}kc, mam rande a chci byt v dobre forme
72. zdarec, delam inventuru v hlave: {g}g, {cena}kc, {čtvrť}. mas na sklade?
73. kamo, kdyz mi doneses {g}g do {čtvrť} do pulhodiny, napisu ti basen. {cena}kc
74. dobry den, hledam {g}g za {cena} Kc, nabizim tez nepovinny usmev
75. ty vole, moje kocka tvrdi ze potrebuju {g}g. {cena}kc. neposlouchat kocku je nezdrave
76. heyyy, {g}g za {cena}kc pls, jsem uz u {čtvrť} a mam kabat naruby
77. {cena}kc za {g}g je moje maximum, neprecenuj me
78. dneska jsem velmi smutny a velmi bohaty. {g}g, {cena}kc, {čtvrť}
79. zdar, mam kupon ktery plati jen dnes: {cena}kc za {g}g, doufam ze sedi
80. kamo vim ze to neni legalni, ale {g}g za {cena}kc by mi dneska zachranilo den
81. mel jsem sen ze nosis {g}g a mel jsem pravdu. {cena}kc, {čtvrť}
82. prosim te, uz jsem mluvil i s hlasem v hlave: {g}g, {cena}kc, a on souhlasi
83. bez {g}g jsem uplne bezradnej jako kocka v dest. {cena}kc, {čtvrť}
84. zdarec, ja jsem ten co ti vcera psal ze nema {cena}kc. dneska je mam, {g}g!
85. Dobry den, zadavam objednavku c. 47: {g}g za {cena} Kc. Dekujeme za duveru a diskretnost.
86. ty jsi ta jedina ruzova pastelka v krabici. {g}g, {cena}kc, {čtvrť}
87. mam hlad ale radsi {g}g nez rizek, {cena}kc, a kdyz stihnes tak ten rizek taky
88. kamo, volal jsem mamce a ona rekla at si objednam {g}g. {cena}kc, {čtvrť}
89. ten ficak z konkurence mi rikal ze maji akci, ale ja verim tobe. {g}g, {cena}kc
90. hele nic neodpovidej, jen prijed s {g}g do {čtvrť}. {cena}kc, bez keců i bez bankovnich prevodu

## 2. Stálí zákazníci (21)
Pole `loyalMessages` ve funkci `generateOffer`. Použije se u zákazníka s věrností 2+ (asi v polovině případů).

1. to jsem zase ja, {g}g jako vzdycky? {cena}kc ready
2. kamo, tvuj stalej zakaznik hlasi, {g}g do {čtvrť}, {cena}kc
3. bez tebe bych tu Prahu nezvladl, {g}g za {cena}kc pls
4. jako minule pls, {g}g a {cena}kc, ty vis kam v {čtvrť}
5. šéfe, poprosil bych klasiku. {g}g, {cena}kc, {čtvrť}
6. ty jsi muj nejlepsi dealer a to rikam i mamce. {g}g za {cena}kc
7. tvuj stalej tady, {g}g jako vzdy, {cena}kc, a pozdravuj mamku
8. mas me v kontaktech pod "ten dobrej"? tak {g}g, {cena}kc
9. klasika, {g}g do {čtvrť}, {cena}kc. a pripadne kafe, kdyby se nahodou
10. uz je to tradice: {g}g, {cena}kc, a ja ti nikdy nerikam cim jsem
11. bez {g}g neprezijem ani pondeli. {cena}kc ready, ty to znas
12. boss, {g}g, {cena}kc, tvuj nejvernejsi zakaznik v {čtvrť}. diplom?
13. kdyz uz mam tvoje cislo tak {g}g, ne? {cena}kc, a tentokrat bez drbu
14. stejne jako minule pls, {g}g, {cena}kc. nebo jako predminule, nepamatuju si
15. hele pro tebe rad, tvuj verny zakaznik tady, {g}g za {cena}kc
16. ty vis jak to mam rad. {g}g do {čtvrť}, {cena}kc
17. recenzi ti dam nejak potom, ted {g}g za {cena}kc, jo?
18. jsem stalejsi nez tvuj sasek z konkurence. {g}g, {cena}kc
19. prosim te, {g}g, {cena}kc, a kdyz to bude sedet tak ti napisu zase zitra
20. snih je moje hobby, ty jsi muj dodavatel pomoci. {g}g, {cena}kc, {čtvrť}
21. to jsem zase ja, nejsem zadna policie, jen {g}g za {cena}kc chci

## 3. Velkoodběratelé (6)
Pole `vipMessages` ve funkci `generateOffer`. Kluby, hotely, firmy (10 až 50 g).

1. Dobrý den, zajišťujeme zásobování akce v {čtvrť}. Potřebujeme {g}g, nabízíme {cena} Kč, termín dnes večer.
2. Zdravím, tady provozovna z {čtvrť}. Brali bychom {g}g najednou za {cena} Kč, faktura ne, hotově.
3. Dobrý večer, firemní večírek v {čtvrť} a došly nám zásoby. {g}g za {cena} Kč, platíme ihned.
4. Čau, jsme tu na akci a hosté jsou nenasytní. Zvládneš {g}g do {čtvrť}? {cena} Kč cash.
5. Dobrý den, doporučil nás ${rand(["kolega", "kamarád", "bratranec"])}. Máte {g}g? Za {cena} Kč jsme v {čtvrť} do hodiny.
6. Hej, sháníme {g}g na dnešní sezení v {čtvrť}, rozpočet {cena} Kč. Diskrétnost samozřejmost.

## 4. Zprávy bez objednávky (34)
Pole `randomCustomerMessages`. S 15% šancí denně napíše někdo z náhodné čtvrti.

1. čau, jak se máš, nepůjdeme někam?
2. Už jsem ti někdy řekl, že jsi fakt dobrej kámoš?
3. bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
4. Vozíš i půlky?
5. Sry, špatný číslo
6. Nabalil jsem včera ve studiu hodně nabitou roštěnku, za 2 ti jí přenechám
7. VČERA TO BYLO MEGA
8. Kolega z práce, prej od tebe taky bere :D
9. Jdu do Atíku, budeš mít čas kolem 7? Ráno?
10. Hm, tak jsem bez papíru, bro, včera jsem lízl opiáty
11. Nevíš o někom, kdo by uměl zařídit kouli?
12. Si zvanej na moje narozky, bro
13. ahoj, tady Honza z minule. ne, nejsem Honza, spatny cislo, ale ty ses mi libil
14. mas tip na dobrou pizzu v okoli? nejde o pizzu, jen se ptam
15. bro videl jsem dneska holuba co mel lepsi bundu nez ja
16. potkal jsem tvoji tramvaj. pozdravila me
17. co delas? ja nic a jde mi to skvele
18. nechces jit zitra na raftovani? ptam se vsech v kontaktech
19. prosim te nauc me jak se rika ne sefovi na porade
20. poslal jsem ti omylem fotku mojeho psa. je to dobrej pes.
21. ty ses ten co ma ten telefon s prasklym displejem? to ne ja jsem to byl. nebo ty?
22. dneska jsem poprve v zivote zaplatil kartou za kebab a cejtim se jako CEO
23. hele mas nabijecku na iphone? nepotrebuju ji, jen kamosi
24. zitra rano mam pohovor, drz mi palce. nebo aspon palec
25. klidne mi nepis, ja si jen povidam sam se sebou, ale diky ze ctes
26. co se stalo s nasim kamosem Pavlem? je nekde na Slovensku a prodava hrnky
27. v kolik zavira Billa? nebo uz jsem tam byl?
28. bro, rekli mi ze jsem moc mluvil na schuzce. koho mam obvinit, kafe?
29. prisel jsem na to ze v pondeli se nerika dobry den, ale nejak to dopadne
30. mam novou frizuru, nikdo si ji nevsiml. pises mi ze je dobra? diky.
31. naucil jsem se rozlisit tramvaj 22 od tramvaje 9, jsem vlastne spojar
32. mel bych dotaz, ale uz si nepamatuju jaky. mozna otazka byla jak se mas
33. dneska jsem se 3x ztratil v metru a dvakrat v obchaku, pomaha ti nekdy gps?
34. vsiml sis ze ahoj je vlastne zkraceny ahojte? dovolil jsem si to zkontrolovat

## 5. Úvodní zpráva od @cmoud
Funkce `startNewGame`.

> Ahoj, já končím takže předávám svoje řemeslo, dal jsem kontakt na tebe pár lidem co vím, že jsou v pohodě. Taky jsem ti nechal 2 bůrky na začátek, hodně štěstí!

## 6. Recenze v kanálu Snow Reviews (23)
Pole `telegramMessages`. 🟢 pochvalné, 🔴 negativní.

1. 🟢 Tenhle týpek dává bomby!
2. 🟢 Doručení 10/10, doporučím chábrům.
3. 🟢 Tenhle týpek má top kvalitu od Escobara.
4. 🟢 Včera bomba, dneska znova!
5. 🟢 To je MRDA!
6. 🟢 PIČO TO MĚ VYSTŘELILO JAK PRAK
7. 🟢 TY DEBILE :D JEBA
8. 🟢 Dealer roku, 5/5!
9. 🟢 Legendární úroveň služby.
10. 🟢 kéž by všechny služby fungovali takhle..
11. 🟢 I moje máma by od něj brala.
12. 🟢 Dorazil i když pršelo, to cením.
13. 🟢 Díky za rychlost, kámo.
14. 🟢 Objednávám denně!
15. 🔴 Poslal mě do hajzlu, zklamání...
16. 🔴 Čekal jsem, ale neodepsal.
17. 🔴 Vysral se na mě a musel jsem jít spát v 10 jak šašek
18. 🔴 Nedodal, seru na to.
19. 🔴 Šašek
20. 🔴 Sergei z Wishe
21. 🔴 Hraje si na ballera, ale nedodá.
22. 🔴 Neodepsal stejně má jenom Pikain
23. 🔴 Je to jen hype, ve skutečnosti nic.

## 7. Tvoje odpovědi
Pole `ACCEPT_REPLIES` (8) a `DECLINE_REPLIES` (8).

**Přijmout:**
1. jasně, jedu
2. bude, za chvilku tam jsem
3. domluveno, čekej u vchodu
4. už letím 🚀
5. ok, dovezu
6. mám tě, 10 minut
7. řeš nic, jsem na cestě
8. tak jo, drž se

**Odmítnout:**
1. dneska ne, sorry
2. teď nemůžu
3. není skladem
4. zkus zítra
5. tohle ne, kámo
6. jsem mimo, ozvi se jindy
7. nejde to
8. hele, dneska fakt ne
