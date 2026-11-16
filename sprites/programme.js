/* =====================================================================
   PIXEL-SYMBOLE FÜR DEN MINI-DESKTOP (ab Welt 3)
   Aufbau wie bei sprites/bit.js: ein Zeichen = ein Pixel,
   "." = durchsichtig, die Palette ordnet Buchstaben Farben zu.
   Jede Zeile eines Sprites muss gleich lang bleiben.
   ===================================================================== */

const K = { name: "Umriss", farbe: "#2e1c12" };
const W = { name: "Weiß",   farbe: "#ffffff" };

// --- Programm-Symbole (je 16 x 16) -------------------------------------

export const SYMBOL_NOTIZEN = {
  breite: 16, hoehe: 16,
  palette: { K, W, Y: { name: "Bindung", farbe: "#f5c12e" }, L: { name: "Linien", farbe: "#7f9fd6" } },
  basis: [
    "..KKKKKKKKKKKK..",
    "..KYYYYYYYYYYK..",
    "..KKKKKKKKKKKK..",
    "..KWWWWWWWWWWK..",
    "..KWLLLLLLLWWK..",
    "..KWWWWWWWWWWK..",
    "..KWLLLLLLLLWK..",
    "..KWWWWWWWWWWK..",
    "..KWLLLLLWWWWK..",
    "..KWWWWWWWWWWK..",
    "..KWLLLLLLLWWK..",
    "..KWWWWWWWWWWK..",
    "..KWLLLLWWWWWK..",
    "..KWWWWWWWWWWK..",
    "..KKKKKKKKKKKK..",
    "................",
  ],
};

export const SYMBOL_MALEN = {
  breite: 16, hoehe: 16,
  palette: {
    K, B: { name: "Holz", farbe: "#e6c08a" }, R: { name: "Rot", farbe: "#e2452f" },
    Y: { name: "Gelb", farbe: "#f5c12e" }, G: { name: "Grün", farbe: "#3fae3a" }, L: { name: "Blau", farbe: "#3f8ae0" },
  },
  basis: [
    "................",
    "....KKKKKKK.....",
    "...KBBBBBBBKK...",
    "..KBRRBBBYYBBK..",
    ".KBBRRBBBYYBBBK.",
    ".KBBBBBBBBBBBBK.",
    ".KBGGBBBBBBBBK..",
    ".KBGGBBBKKKKK...",
    ".KBBBBBK........",
    ".KBBBBBK........",
    ".KBLLBBBKKKK....",
    "..KLLBBBBBBBK...",
    "..KBBBBBBBBBBK..",
    "...KKBBBBBBKK...",
    ".....KKKKKK.....",
    "................",
  ],
};

export const SYMBOL_RECHNER = {
  breite: 16, hoehe: 16,
  palette: {
    K, W, G: { name: "Gehäuse", farbe: "#9a9a9a" }, D: { name: "Anzeige", farbe: "#c4f5b0" },
    O: { name: "Orange", farbe: "#f08a2a" },
  },
  basis: [
    "...KKKKKKKKKK...",
    "...KGGGGGGGGK...",
    "...KGDDDDDDGK...",
    "...KGDDDDDDGK...",
    "...KGGGGGGGGK...",
    "...KWWGWWGOOK...",
    "...KWWGWWGOOK...",
    "...KGGGGGGGGK...",
    "...KWWGWWGOOK...",
    "...KWWGWWGOOK...",
    "...KGGGGGGGGK...",
    "...KWWGWWGOOK...",
    "...KWWGWWGOOK...",
    "...KGGGGGGGGK...",
    "...KKKKKKKKKK...",
    "................",
  ],
};

export const SYMBOL_MUSIK = {
  breite: 16, hoehe: 16,
  palette: { K, N: { name: "Note", farbe: "#d6402b" } },
  basis: [
    "................",
    "......KKKKKKKKK.",
    "......KNNNNNNNK.",
    "......KNKKKKKNK.",
    "......KNK...KNK.",
    "......KNK...KNK.",
    "......KNK...KNK.",
    "......KNK...KNK.",
    "......KNK...KNK.",
    "...KKKKNK..KKKNK",
    "..KNNNNNK.KNNNNK",
    "..KNNNNNK.KNNNNK",
    "..KNNNNK..KNNNK.",
    "...KKKK....KKK..",
    "................",
    "................",
  ],
};

export const SYMBOL_FOTOS = {
  breite: 16, hoehe: 16,
  palette: {
    K, S: { name: "Himmel", farbe: "#9cd3ff" }, Y: { name: "Sonne", farbe: "#f5c12e" },
    M: { name: "Berg", farbe: "#8c8273" }, G: { name: "Wiese", farbe: "#3fae3a" },
  },
  basis: [
    "................",
    ".KKKKKKKKKKKKKK.",
    ".KSSSSSSSSSYYSK.",
    ".KSSSSSSSSSYYSK.",
    ".KSSSSSSSSSSSSK.",
    ".KSSSSKSSSSSSSK.",
    ".KSSSKMKSSSSSSK.",
    ".KSSKMMMKSSKSSK.",
    ".KSKMMMMMKKMKSK.",
    ".KKMMMMMMMMMMKK.",
    ".KGGGGGGGGGGGGK.",
    ".KGGGGGGGGGGGGK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
    "................",
  ],
};

// --- Start-Knopf (12 x 12): ein Edelstein, NICHT das Windows-Logo -------
export const SYMBOL_START = {
  breite: 12, hoehe: 12,
  palette: { K, H: { name: "Hell", farbe: "#e6c4ff" }, B: { name: "Fläche", farbe: "#9b4fd6" }, D: { name: "Dunkel", farbe: "#5c2390" } },
  basis: [
    "....KKKK....",
    "...KHHBBK...",
    "..KHHBBBDK..",
    ".KHHBBBBBDK.",
    "KHHBBBBBBDDK",
    "KHBBBBBBBDDK",
    "KBBBBBBBDDDK",
    ".KBBBBBDDDK.",
    "..KBBBDDDK..",
    "...KBDDDK...",
    "....KDDK....",
    ".....KK.....",
  ],
};

// --- Knöpfe oben rechts im Fenster (je 7 x 7) -------------------------
const KNOPF = { K };
export const KNOPF_MINIMIEREN = { breite: 7, hoehe: 7, palette: KNOPF, basis: [
  ".......", ".......", ".......", ".......", ".......", "KKKKKKK", ".......",
] };
export const KNOPF_MAXIMIEREN = { breite: 7, hoehe: 7, palette: KNOPF, basis: [
  "KKKKKKK", "KKKKKKK", "K.....K", "K.....K", "K.....K", "K.....K", "KKKKKKK",
] };
export const KNOPF_WIEDERHERSTELLEN = { breite: 7, hoehe: 7, palette: KNOPF, basis: [
  "..KKKKK", "..K...K", "KKKKK.K", "KKKKK.K", "K...KKK", "K...K..", "KKKKK..",
] };
export const KNOPF_SCHLIESSEN = { breite: 7, hoehe: 7, palette: KNOPF, basis: [
  "K.....K", "KK...KK", ".KK.KK.", "..KKK..", ".KK.KK.", "KK...KK", "K.....K",
] };

// --- Bild im Malprogramm: ein Haus (12 x 10) ----------------------------
export const BILD_HAUS = {
  breite: 12, hoehe: 10,
  palette: {
    K, W, R: { name: "Dach", farbe: "#d6402b" }, B: { name: "Fenster", farbe: "#9cd3ff" },
    D: { name: "Tür", farbe: "#9a6338" },
  },
  basis: [
    ".....KK.....",
    "....KRRK....",
    "...KRRRRK...",
    "..KRRRRRRK..",
    ".KKKKKKKKKK.",
    ".KWWWWWWWWK.",
    ".KWBBWWDDWK.",
    ".KWBBWWDDWK.",
    ".KWWWWWDDWK.",
    ".KKKKKKKKKK.",
  ],
};

// --- Speichern-Symbol: Diskette (12 x 12) -------------------------------
export const SYMBOL_DISKETTE = {
  breite: 12, hoehe: 12,
  palette: {
    K, W,
    B: { name: "Blau", farbe: "#3f7fd0" },
    G: { name: "Etikett", farbe: "#e6e6e6" },
    L: { name: "Linie", farbe: "#9a9a9a" },
  },
  basis: [
    "KKKKKKKKKKK.",
    "KBBWWWWWBBKK",
    "KBBWWWWWBBBK",
    "KBBWWWWWBBBK",
    "KBBBBBBBBBBK",
    "KBBBBBBBBBBK",
    "KBGGGGGGGGBK",
    "KBGGGGGGGGBK",
    "KBGLLLLLLGBK",
    "KBGGGGGGGGBK",
    "KBGGGGGGGGBK",
    "KKKKKKKKKKKK",
  ],
};
