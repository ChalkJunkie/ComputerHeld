/* =====================================================================
   BIT, die Informatik-Maus – Pixelgrafik als Textraster
   =====================================================================

   SO FUNKTIONIERT DIESE DATEI (auch für Nicht-Programmierer):

   1. PALETTE: Jeder Buchstabe steht für eine Farbe.
      Farbe ändern = den Farbwert (z. B. "#9a6338") hinter dem Buchstaben
      ändern. Der Punkt "." bedeutet immer: durchsichtig.

   2. BASIS: Das Grundraster von Bit, 32 Zeilen mit je 32 Zeichen.
      Ein Zeichen = ein Pixel. Pixel ändern = Buchstaben austauschen.
      Wichtig: Jede Zeile muss genau 32 Zeichen lang bleiben!
      Die Basis enthält Kopf, Ohren, Körper, Beine und Schwanz –
      aber KEINE Arme, Augen und keinen Mund.

   3. TEILE: Kleine Flicken (Arme, Augen, Mund), die auf die Basis
      gelegt werden. "x" und "y" geben an, wo die linke obere Ecke des
      Flickens liegt (x = Spalte von links, y = Zeile von oben,
      Zählung beginnt bei 0). Ein "." im Flicken lässt die Basis
      darunter sichtbar.

   4. POSEN: Jede Pose ist nur eine Liste von Teilen. So bleibt Bit in
      allen Posen garantiert dieselbe Figur.

   "Links" und "rechts" meinen immer die Seite, wie man sie auf dem
   Bildschirm sieht.
   ===================================================================== */

export const BIT = {

  // Größe des Rasters in Pixeln
  breite: 32,
  hoehe: 32,

  /* -------------------------------------------------------------------
     PALETTE – 9 Farben (erlaubt wären bis zu 12)
     Buchstabe -> Name (für die Vorschauseite) und Farbwert
     ------------------------------------------------------------------- */
  palette: {
    K: { name: "Umriss",             farbe: "#2e1c12" },
    D: { name: "Fell dunkel",        farbe: "#6e4424" },
    M: { name: "Fell mittel",        farbe: "#9a6338" },
    L: { name: "Fell hell",          farbe: "#c48c56" },
    C: { name: "Creme (Bauch, Ohr)", farbe: "#f7e4bc" },
    P: { name: "Rosa (Nase, Wange)", farbe: "#f29bb0" },
    T: { name: "Schwanz",            farbe: "#d9778f" },
    E: { name: "Auge",               farbe: "#1b1420" },
    W: { name: "Glanzpunkt",         farbe: "#ffffff" },
  },

  /* -------------------------------------------------------------------
     BASIS – gemeinsames Grundraster aller Posen
     Spalten-Lineal (Zehner / Einer), damit man Positionen findet:
              0         1         2         3
              01234567890123456789012345678901
     ------------------------------------------------------------------- */
  basis: [
    "....KKKKK..............KKKKK....", // Zeile  0  Ohren oben
    "...KLLLLLK............KLLLLLK...", // Zeile  1
    "..KLMCCCMDK..........KLMCCCMDK..", // Zeile  2
    "..KLCCCCCDK..........KLCCCCCDK..", // Zeile  3  C = Innenohr
    "..KLCCCCCDK..........KLCCCCCDK..", // Zeile  4
    "..KLCCCCCDKKKKKKKKKKKKLCCCCCDK..", // Zeile  5  Oberkante Kopf
    "..KLCCCCCMLLLLLLLLLLLLMCCCCCDK..", // Zeile  6
    "..KLMCCCMMMMMMMMMMMMMMMMCCCMDK..", // Zeile  7
    "...KKKLMMMMMMMMMMMMMMMMMMDKKK...", // Zeile  8
    ".....KLMMMMMMMMMMMMMMMMMMDK.....", // Zeile  9
    ".....KLMMMMMMMMMMMMMMMMMMDK.....", // Zeile 10  (Augen kommen als Teil)
    ".....KLMMMMMMMMMMMMMMMMMMDK.....", // Zeile 11
    ".....KLMMMMMMMMMMMMMMMMMMDK.....", // Zeile 12
    ".....KLMMMMMMMMMMMMMMMMMMDK.....", // Zeile 13
    ".....KLMMMMMMCCPPCCMMMMMMDK.....", // Zeile 14  PP = Nase
    ".....KLPPMMMCCCCCCCCMMMPPDK.....", // Zeile 15  PP außen = Wangen
    ".....KLMMMMMCCCCCCCCMMMMMDK.....", // Zeile 16  (Mund kommt als Teil)
    "......KLDMMMMCCCCCCMMMMDDK......", // Zeile 17
    ".......KKLMMMMMMMMMMMMDKK.......", // Zeile 18  Kinn
    ".........KDDDDDDDDDDDDK.........", // Zeile 19  Schatten unter dem Kopf
    ".........KLMCCCCCCCCMDK.........", // Zeile 20  Körper, C = Bauch
    ".........KLCCCCCCCCCCDK.........", // Zeile 21
    ".........KLCCCCCCCCCCDK.........", // Zeile 22
    ".........KLCCCCCCCCCCDK.......T.", // Zeile 23  T = Schwanzspitze
    ".........KLCCCCCCCCCCDK.......T.", // Zeile 24
    ".........KLMCCCCCCCCMDK......T..", // Zeile 25
    ".........KLMMMDDDDMMMDKTT....T..", // Zeile 26
    ".........KLMMDKKKKLMMDK..TT..T..", // Zeile 27  Beine
    ".........KLMMDK..KLMMDK....TT...", // Zeile 28
    "........KCCCCCK..KCCCCCK........", // Zeile 29  Füße
    "........KKKKKKK..KKKKKKK........", // Zeile 30
    "................................", // Zeile 31
  ],

  /* -------------------------------------------------------------------
     TEILE – Flicken, die je nach Pose auf die Basis gelegt werden
     ------------------------------------------------------------------- */
  teile: {

    // --- Arme, hängend ---
    armLinksUnten: { x: 6, y: 20, pixel: [
      "KKK",
      "KLM",
      "KLM",
      "KLM",
      "KCC", // Pfote
      "KKK",
    ] },
    armRechtsUnten: { x: 23, y: 20, pixel: [
      "KKK",
      "MDK",
      "MDK",
      "MDK",
      "CCK", // Pfote
      "KKK",
    ] },

    // --- Arme, hochgestreckt (neben dem Kopf) ---
    armLinksOben: { x: 2, y: 10, pixel: [
      "KKK....",
      "KCC....", // Pfote
      "KCC....",
      "KLM....",
      "KLM....",
      "KLM....",
      "KLM....",
      "KLMK...",
      "KLMMK..",
      "KLMMMKK",
      "KMMMMMM", // Schulter
      ".KKKKKK",
    ] },
    armRechtsOben: { x: 23, y: 10, pixel: [
      "....KKK",
      "....CCK", // Pfote
      "....CCK",
      "....MDK",
      "....MDK",
      "....MDK",
      "....MDK",
      "...KMDK",
      "..KMMDK",
      "KKMMMDK",
      "MMMMMDK", // Schulter
      "KKKKKK.",
    ] },

    // --- Augen, offen (W = weißer Glanzpunkt) ---
    augeLinksOffen: { x: 8, y: 10, pixel: [
      "EEEE",
      "EWWE",
      "EWEE",
      "EEEE",
      "EEEE",
    ] },
    augeRechtsOffen: { x: 20, y: 10, pixel: [
      "EEEE",
      "EWWE",
      "EWEE",
      "EEEE",
      "EEEE",
    ] },

    // --- Augen, fröhliche Bögen (für die Jubel-Pose) ---
    augeLinksFroh: { x: 8, y: 11, pixel: [
      ".EE.",
      "EEEE",
      "E..E",
    ] },
    augeRechtsFroh: { x: 20, y: 11, pixel: [
      ".EE.",
      "EEEE",
      "E..E",
    ] },

    // --- Mund ---
    mundLaecheln: { x: 14, y: 16, pixel: [
      "KCCK",
      "CKKC",
    ] },
    // --- Arm zeigt nach rechts (zur Sprechblase) ---
    armRechtsZeigt: { x: 23, y: 19, pixel: [
      "KKKKKKKK",
      "MMMMDCCK",
      "MMMMDCCK", // Pfote
      "KKKKKKKK",
    ] },

    // --- Pfote am Kinn (nachdenklich) ---
    armLinksKinn: { x: 5, y: 16, pixel: [
      "....KKKK",
      "....KCCK", // Pfote
      "...KLCCK",
      "...KLMK.",
      "...KLMK.",
      "...KKKK.",
    ] },

    // --- Arme seitlich ausgebreitet (aufmunternd) ---
    armLinksOffen: { x: 2, y: 21, pixel: [
      "KKKKKKK",
      "KCCLMMM", // Pfote links
      "KCCLMMM",
      "KKKKKKK",
    ] },
    armRechtsOffen: { x: 23, y: 21, pixel: [
      "KKKKKK",
      "MMDCCK", // Pfote rechts
      "MMDCCK",
      "KKKKKK",
    ] },

    // --- Augen schauen nach oben (nachdenklich) ---
    augeLinksOben: { x: 8, y: 10, pixel: [
      "EEWW",
      "EEWE",
      "EEEE",
      "EEEE",
      "EEEE",
    ] },
    augeRechtsOben: { x: 20, y: 10, pixel: [
      "EEWW",
      "EEWE",
      "EEEE",
      "EEEE",
      "EEEE",
    ] },
    // Augenbrauen: die rechte ist etwas hochgezogen („Hmm …“)
    braueLinks: { x: 8, y: 8, pixel: ["DDDD"] },
    braueRechts: { x: 20, y: 7, pixel: ["DDDD"] },

    // --- Mund: kleiner, gerader Mund (nachdenklich) ---
    mundFlach: { x: 14, y: 16, pixel: [
      "CCCC",
      "CKKC",
    ] },

    mundOffen: { x: 14, y: 16, pixel: [
      "KKKK",
      "CPPC", // Zunge
    ] },
  },

  /* -------------------------------------------------------------------
     POSEN – welche Teile auf die Basis gelegt werden
     (Reihenfolge = Zeichenreihenfolge, spätere Teile liegen oben)
     ------------------------------------------------------------------- */
  posen: {
    stehend: {
      titel: "Stehend",
      teile: ["armLinksUnten", "armRechtsUnten",
              "augeLinksOffen", "augeRechtsOffen", "mundLaecheln"],
    },
    winkend: {
      titel: "Winkend",
      teile: ["armLinksOben", "armRechtsUnten",
              "augeLinksOffen", "augeRechtsOffen", "mundLaecheln"],
    },
    nachdenklich: {
      titel: "Nachdenklich",   // bei Tipps
      teile: ["armRechtsUnten", "armLinksKinn",
              "augeLinksOben", "augeRechtsOben", "braueLinks", "braueRechts", "mundFlach"],
    },
    zeigend: {
      titel: "Zeigend",        // beim Erklären, zeigt auf die Sprechblase
      teile: ["armLinksUnten", "armRechtsZeigt",
              "augeLinksOffen", "augeRechtsOffen", "mundLaecheln"],
    },
    aufmunternd: {
      titel: "Aufmunternd",    // nach einem Fehler: „Nicht schlimm!“
      teile: ["armLinksOffen", "armRechtsOffen",
              "augeLinksOffen", "augeRechtsOffen", "mundOffen"],
    },
    jubelnd: {
      titel: "Jubelnd",
      teile: ["armLinksOben", "armRechtsOben",
              "augeLinksFroh", "augeRechtsFroh", "mundOffen"],
    },
  },
};
