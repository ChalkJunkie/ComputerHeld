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
