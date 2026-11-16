/* =====================================================================
   Kleine Pixel-Symbole: Stern, Zielscheibe, Mauszeiger
   Aufbau wie bei sprites/bit.js: ein Zeichen = ein Pixel,
   "." = durchsichtig, die Palette ordnet Buchstaben Farben zu.
   Jede Zeile eines Sprites muss gleich lang bleiben.
   ===================================================================== */

// --- Stern (16 x 16) für die Auswertung -------------------------------
export const STERN = {
  breite: 16,
  hoehe: 16,
  // Goldener Stern = verdient
  palette: {
    K: { name: "Umriss", farbe: "#2e1c12" },
    Y: { name: "Gold",   farbe: "#f5c12e" },
  },
  // Blasser Stern = noch nicht verdient
  paletteLeer: {
    K: { name: "Umriss", farbe: "#8c8273" },
    Y: { name: "Leer",   farbe: "#e2dbc8" },
  },
  basis: [
    ".......KK.......",
    "......KYYK......",
    "......KYYK......",
    ".....KYYYYK.....",
    "KKKKKKYYYYKKKKKK",
    "KYYYYYYYYYYYYYYK",
    ".KYYYYYYYYYYYYK.",
    "..KYYYYYYYYYYK..",
    "...KYYYYYYYYK...",
    "...KYYYYYYYYK...",
    "..KYYYYYYYYYYK..",
    "..KYYYYKKYYYYK..",
    ".KYYYKK..KKYYYK.",
    ".KYKK......KKYK.",
    ".KK..........KK.",
    "................",
  ],
};

// --- Zielscheibe (16 x 16) --------------------------------------------
export const ZIELSCHEIBE = {
  breite: 16,
  hoehe: 16,
  palette: {
    K: { name: "Umriss", farbe: "#2e1c12" },
    R: { name: "Rot",    farbe: "#d6402b" },
    W: { name: "Weiß",   farbe: "#ffffff" },
    Y: { name: "Mitte",  farbe: "#f5c12e" },
  },
  basis: [
    "....KKKKKKKK....",
    "..KKRRRRRRRRKK..",
    ".KRRRRRRRRRRRRK.",
    ".KRRRWWWWWWRRRK.",
    "KRRRWWWWWWWWRRRK",
    "KRRWWWRRRRWWWRRK",
    "KRRWWRRRRRRWWRRK",
    "KRRWWRRYYRRWWRRK",
    "KRRWWRRYYRRWWRRK",
    "KRRWWRRRRRRWWRRK",
    "KRRWWWRRRRWWWRRK",
    "KRRRWWWWWWWWRRRK",
    ".KRRRWWWWWWRRRK.",
    ".KRRRRRRRRRRRRK.",
    "..KKRRRRRRRRKK..",
    "....KKKKKKKK....",
  ],
};

// --- Mauszeiger (11 x 16) für Bits Vorführungen ------------------------
export const ZEIGER = {
  breite: 11,
  hoehe: 16,
  palette: {
    K: { name: "Umriss", farbe: "#2e1c12" },
    W: { name: "Weiß",   farbe: "#ffffff" },
  },
  basis: [
    "K..........",
    "KK.........",
    "KWK........",
    "KWWK.......",
    "KWWWK......",
    "KWWWWK.....",
    "KWWWWWK....",
    "KWWWWWWK...",
    "KWWWWWWWK..",
    "KWWWWWWWWK.",
    "KWWWWWKKKKK",
    "KWWKWWK....",
    "KWK.KWWK...",
    "KK..KWWK...",
    "K....KWWK..",
    ".....KKKK..",
  ],
};

// --- Kiste (16 x 12) in drei Farben ------------------------------------
// H = helle Kante, B = Fläche, D = dunkle Kante, Y = Schloss und Gold,
// I = Innenseite (nur bei der offenen Kiste zu sehen)
const KISTE_BRAUN = {
  K: { name: "Umriss",  farbe: "#2e1c12" },
  H: { name: "Hell",    farbe: "#c48c56" },
  B: { name: "Fläche",  farbe: "#9a6338" },
  D: { name: "Dunkel",  farbe: "#6e4424" },
  Y: { name: "Schloss", farbe: "#f5c12e" },
  I: { name: "Innen",   farbe: "#4a2c16" },
  G: { name: "Glitzer", farbe: "#fff6c2" },
};
export const KISTE = {
  breite: 16,
  hoehe: 12,
  palette: KISTE_BRAUN,
  paletten: {
    braun: KISTE_BRAUN,
    rot:  { ...KISTE_BRAUN, H: { name: "Hell", farbe: "#f08a7a" }, B: { name: "Fläche", farbe: "#d6402b" }, D: { name: "Dunkel", farbe: "#8f2415" }, I: { name: "Innen", farbe: "#5c1a10" } },
    blau: { ...KISTE_BRAUN, H: { name: "Hell", farbe: "#8fc0f0" }, B: { name: "Fläche", farbe: "#3f7fd0" }, D: { name: "Dunkel", farbe: "#234a8a" }, I: { name: "Innen", farbe: "#16305c" } },
  },
  basis: [
    "..KKKKKKKKKKKK..",
    ".KHHHHHHHHHHHHK.",
    "KHBBBBBBBBBBBBHK",
    "KHBBBBBBBBBBBBHK",
    "KKKKKKKKKKKKKKKK",
    "KBBBBBBYYBBBBBBK",
    "KBBBBBBYYBBBBBBK",
    "KDBBBBBBBBBBBBDK",
    "KDBBBBBBBBBBBBDK",
    "KDBBBBBBBBBBBBDK",
    "KDDDDDDDDDDDDDDK",
    "KKKKKKKKKKKKKKKK",
  ],
};

// --- Offene Kiste (16 x 15) – gleiche Farben wie die geschlossene -----
// Oben der nach hinten geklappte Deckel (schmaler, man sieht seine dunkle
// Innenseite), darunter ein Goldhaufen. Die unteren 8 Zeilen sind genau
// dieselben wie bei der geschlossenen Kiste. G = Glitzer im Gold.
export const KISTE_OFFEN = {
  breite: 16,
  hoehe: 15,
  palette: KISTE_BRAUN,
  paletten: KISTE.paletten,
  basis: [
    "...KKKKKKKKKK...",
    "..KHDDDDDDDDHK..",
    "..KIIIIIIIIIIK..",
    ".KKKKKKKKKKKKKK.",
    ".KIIIKYYYYKIIIK.",
    "KIIKYYYGYYYYKIIK",
    "KIKYYGYYYYYGYKIK",
    "KKKKKKKKKKKKKKKK",
    "KBBBBBBYYBBBBBBK",
    "KBBBBBBYYBBBBBBK",
    "KDBBBBBBBBBBBBDK",
    "KDBBBBBBBBBBBBDK",
    "KDBBBBBBBBBBBBDK",
    "KDDDDDDDDDDDDDDK",
    "KKKKKKKKKKKKKKKK",
  ],
};

// --- Edelstein (12 x 10) in drei Farben --------------------------------
const EDELSTEIN_ROT = {
  K: { name: "Umriss", farbe: "#2e1c12" },
  H: { name: "Hell",   farbe: "#ffb3a6" },
  B: { name: "Fläche", farbe: "#e2452f" },
  D: { name: "Dunkel", farbe: "#9c2414" },
};
export const EDELSTEIN = {
  breite: 12,
  hoehe: 10,
  palette: EDELSTEIN_ROT,
  paletten: {
    rot:   EDELSTEIN_ROT,
    blau:  { ...EDELSTEIN_ROT, H: { name: "Hell", farbe: "#b9dcff" }, B: { name: "Fläche", farbe: "#3f8ae0" }, D: { name: "Dunkel", farbe: "#1f4f96" } },
    gruen: { ...EDELSTEIN_ROT, H: { name: "Hell", farbe: "#c4f5b0" }, B: { name: "Fläche", farbe: "#3fae3a" }, D: { name: "Dunkel", farbe: "#1f6b22" } },
    gelb:  { ...EDELSTEIN_ROT, H: { name: "Hell", farbe: "#fff2a8" }, B: { name: "Fläche", farbe: "#f0c419" }, D: { name: "Dunkel", farbe: "#a07a00" } },
    lila:  { ...EDELSTEIN_ROT, H: { name: "Hell", farbe: "#e6c4ff" }, B: { name: "Fläche", farbe: "#9b4fd6" }, D: { name: "Dunkel", farbe: "#5c2390" } },
    diamant: { ...EDELSTEIN_ROT, H: { name: "Hell", farbe: "#ffffff" }, B: { name: "Fläche", farbe: "#bfe9ff" }, D: { name: "Dunkel", farbe: "#6fb8d9" } },
    leer:  { K: { name: "Umriss", farbe: "#8c8273" }, H: { name: "Leer", farbe: "#e9e4d8" }, B: { name: "Leer", farbe: "#e9e4d8" }, D: { name: "Leer", farbe: "#d6cfbf" } },
  },
  basis: [
    "...KKKKKK...",
    "..KHHBBBBK..",
    ".KHHBBBBBDK.",
    "KHHBBBBBBDDK",
    "KHBBBBBBBDDK",
    ".KBBBBBBDDK.",
    "..KBBBBDDK..",
    "...KBBDDK...",
    "....KBDK....",
    ".....KK.....",
  ],
};

// --- Stein (12 x 8) ----------------------------------------------------
export const STEIN = {
  breite: 12,
  hoehe: 8,
  palette: {
    K: { name: "Umriss", farbe: "#2e1c12" },
    H: { name: "Hell",   farbe: "#c9c9c9" },
    G: { name: "Grau",   farbe: "#9a9a9a" },
    D: { name: "Dunkel", farbe: "#6a6a6a" },
  },
  basis: [
    "...KKKKK....",
    "..KHHHGGK...",
    ".KHHGGGGGKK.",
    "KHGGGGGGGGDK",
    "KGGGGGGGGDDK",
    "KGGGGGGGDDDK",
    ".KGGGGDDDDK.",
    "..KKKKKKKK..",
  ],
};

// --- Computer-Maus von oben (12 x 15) ----------------------------------
// L = linke Taste, R = rechte Taste, W = Mausrad, B = Gehäuse
// Über die Paletten wird jeweils ein Teil gelb hervorgehoben.
const MAUS_NORMAL = {
  K: { name: "Umriss",       farbe: "#2e1c12" },
  L: { name: "Linke Taste",  farbe: "#ececec" },
  R: { name: "Rechte Taste", farbe: "#ececec" },
  W: { name: "Mausrad",      farbe: "#8c8c8c" },
  B: { name: "Gehäuse",      farbe: "#d2d2d2" },
};
const GELB = "#f5c12e";
export const MAUSGERAET = {
  breite: 12,
  hoehe: 15,
  palette: MAUS_NORMAL,
  paletten: {
    normal: MAUS_NORMAL,
    links:  { ...MAUS_NORMAL, L: { name: "Linke Taste",  farbe: GELB } },
    rechts: { ...MAUS_NORMAL, R: { name: "Rechte Taste", farbe: GELB } },
    rad:    { ...MAUS_NORMAL, W: { name: "Mausrad",      farbe: GELB } },
  },
  basis: [
    "....KKKKK...",
    "..KLLKKKRRK.",
    ".KLLLKWKRRRK",
    ".KLLLKWKRRRK",
    ".KLLLKWKRRRK",
    ".KLLLKKKRRRK",
    ".KLLLLKRRRRK",
    ".KKKKKKKKKKK",
    ".KBBBBBBBBBK",
    ".KBBBBBBBBBK",
    ".KBBBBBBBBBK",
    ".KBBBBBBBBBK",
    ".KBBBBBBBBBK",
    "..KBBBBBBBK.",
    "...KKKKKKK..",
  ],
};

// --- Kette (für den Boss: Schatzkiste sichern) -------------------------
// Ein Kettenglied ist 8 x 6 Pixel groß. Die Funktion kette() reiht so
// viele Glieder aneinander wie nötig. Das letzte Glied ist geschlossen
// (KETTEN_ENDE), damit die Kette nicht „abgeschnitten“ aussieht.
const KETTEN_PALETTE = {
  K: { name: "Umriss", farbe: "#2e1c12" },
  H: { name: "Hell",   farbe: "#d8d8d8" },
  D: { name: "Dunkel", farbe: "#7a7a7a" },
};
const KETTEN_GLIED = [
  ".KKKK...",
  "KHHHHKKK",
  "KH..HHHH",
  "KD..DDDD",
  "KDDDDKKK",
  ".KKKK...",
];
const KETTEN_ENDE = [
  ".KKKK.",
  "KHHHHK",
  "KH..HK",
  "KD..DK",
  "KDDDDK",
  ".KKKK.",
];
/* glieder = Anzahl der Glieder, senkrecht = true dreht die Kette hochkant */
export function kette(glieder, senkrecht = false) {
  let zeilen = KETTEN_GLIED.map((z, i) => z.repeat(glieder - 1) + KETTEN_ENDE[i]);
  if (senkrecht) {
    // Zeilen und Spalten tauschen
    zeilen = [...zeilen[0]].map((_, x) => zeilen.map((z) => z[x]).join(""));
  }
  return { breite: zeilen[0].length, hoehe: zeilen.length, palette: KETTEN_PALETTE, basis: zeilen };
}

// --- Vorhängeschloss (12 x 13) ----------------------------------------
export const SCHLOSS = {
  breite: 12,
  hoehe: 13,
  palette: {
    K: { name: "Umriss", farbe: "#2e1c12" },
    G: { name: "Bügel",  farbe: "#9a9a9a" },
    Y: { name: "Gold",   farbe: "#f5c12e" },
    D: { name: "Dunkel", farbe: "#a07a00" },
  },
  basis: [
    "...KKKKKK...",
    "..KGGGGGGK..",
    "..KGK..KGK..",
    "..KGK..KGK..",
    "..KGK..KGK..",
    "KKKKKKKKKKKK",
    "KYYYYYYYYYYK",
    "KYYYYKKYYYYK",
    "KYYYYKKYYYYK",
    "KYYYYYKYYYYK",
    "KYYYYYKYYYYK",
    "KDDDDDDDDDDK",
    "KKKKKKKKKKKK",
  ],
};

// --- Zipfel der Sprechblase (6 x 7), zeigt nach links zu Bit -----------
export const ZIPFEL = {
  breite: 6, hoehe: 7,
  palette: { K: { name: "Umriss", farbe: "#2e1c12" }, W: { name: "Weiß", farbe: "#ffffff" } },
  basis: [
    ".....K",
    "...KKW",
    ".KKWWW",
    "KWWWWW",
    ".KKWWW",
    "...KKW",
    ".....K",
  ],
};
