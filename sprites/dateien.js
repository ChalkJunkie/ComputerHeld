/* =====================================================================
   PIXEL-SYMBOLE FÜR DATEIEN UND ORDNER (ab Welt 4)
   Aufbau wie bei sprites/bit.js. Die Datei-Symbole sind wie Bit
   aufgebaut: ein gemeinsames Blatt ("basis") und je Dateityp ein
   kleiner Flicken ("teile"), der darauf gelegt wird.
   ===================================================================== */

const K = { name: "Umriss", farbe: "#2e1c12" };

// --- Ordner (16 x 16) ---------------------------------------------------
export const ORDNER = {
  breite: 16, hoehe: 16,
  palette: {
    K, H: { name: "Hell", farbe: "#ffe08a" }, Y: { name: "Gelb", farbe: "#f5c12e" },
    D: { name: "Dunkel", farbe: "#c9971a" },
  },
  basis: [
    "................",
    "..KKKKK.........",
    ".KHHHHHK........",
    ".KYYYYYYKKKKKKKK",
    ".KYYYYYYYYYYYYYK",
    ".KDDDDDDDDDDDDDK",
    ".KHHHHHHHHHHHHHK",
    ".KYYYYYYYYYYYYYK",
    ".KYYYYYYYYYYYYYK",
    ".KYYYYYYYYYYYYYK",
    ".KYYYYYYYYYYYYYK",
    ".KYYYYYYYYYYYYYK",
    ".KDDDDDDDDDDDDDK",
    ".KKKKKKKKKKKKKKK",
    "................",
    "................",
  ],
};

// --- Papierkorb (16 x 16) ----------------------------------------------
export const PAPIERKORB = {
  breite: 16, hoehe: 16,
  palette: { K, L: { name: "Hell", farbe: "#d2d2d2" }, G: { name: "Grau", farbe: "#8c8c8c" } },
  basis: [
    "......KKKK......",
    "..KKKKKLLKKKKK..",
    "..KLLLLLLLLLLK..",
    "..KKKKKKKKKKKK..",
    "...KGGGGGGGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGLGLGLGGK...",
    "...KGGGGGGGGK...",
    "....KKKKKKKK....",
    "................",
    "................",
  ],
};

// --- Datei (16 x 16): Blatt mit Eselsohr plus Flicken je Typ ------------
export const DATEI = {
  breite: 16, hoehe: 16,
  palette: {
    K,
    W: { name: "Papier", farbe: "#ffffff" },
    G: { name: "Eselsohr", farbe: "#c9c9c9" },
    L: { name: "Zeilen", farbe: "#9a9a9a" },
    B: { name: "Blau", farbe: "#3f7fd0" },
    R: { name: "Rot", farbe: "#d6402b" },
    S: { name: "Himmel", farbe: "#9cd3ff" },
    Y: { name: "Sonne", farbe: "#f5c12e" },
    N: { name: "Grün", farbe: "#3fae3a" },
    V: { name: "Lila", farbe: "#9b4fd6" },
  },
  basis: [
    "..KKKKKKKKK.....",
    "..KWWWWWWWKK....",
    "..KWWWWWWWKGK...",
    "..KWWWWWWWKGGK..",
    "..KWWWWWWWKKKKK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KWWWWWWWWWWWK.",
    "..KKKKKKKKKKKKK.",
  ],
  teile: {
    text: { x: 4, y: 6, pixel: [
      "LLLLLLL..", ".........", "LLLLLLLLL", ".........", "LLLLLLLL.", ".........", "LLLLL....",
    ] },
    dokument: { x: 3, y: 5, pixel: [
      "BBBBBBBBBBB", "BBBBBBBBBBB", "...........", ".LLLLLLLLL.", "...........", ".LLLLLLLL..", "...........", ".LLLLLL....",
    ] },
    pdf: { x: 3, y: 5, pixel: [
      "RRRRRRRRRRR", "RRRRRRRRRRR", "...........", ".LLLLLLLLL.", "...........", ".LLLLLLLL..", "...........", ".LLLLLL....",
    ] },
    bild: { x: 4, y: 6, pixel: [
      "SSSSSSSYY", "SSSSSSSYY", "SSSKSSSSS", "SSKNKSSKS", "SKNNNKKNK", "KNNNNNNNN", "NNNNNNNNN",
    ] },
    musik: { x: 5, y: 6, pixel: [
      "..KKKKK", "..KRRRK", "..KRKKK", "..KRK..", "KKKRK..", "KRRRK..", "KKKKK..",
    ] },
    video: { x: 3, y: 6, pixel: [
      "KKKKKKKKKKK", "KWKWKWKWKWK", "KKKKKKKKKKK", "KVVVVVVVVVK", "KVVVVVVVVVK", "KKKKKKKKKKK", "KWKWKWKWKWK", "KKKKKKKKKKK",
    ] },
    programm: { x: 4, y: 6, pixel: [
      "KKKKKKKKK", "KBBBBBBBK", "KKKKKKKKK", "KWWWWWWWK", "KWNNNWWWK", "KWWWWWWWK", "KKKKKKKKK",
    ] },
  },
  // Eine "Pose" je Dateityp: allgemein = leeres Blatt
  posen: {
    allgemein: { teile: [] },
    text: { teile: ["text"] },
    dokument: { teile: ["dokument"] },
    pdf: { teile: ["pdf"] },
    bild: { teile: ["bild"] },
    musik: { teile: ["musik"] },
    video: { teile: ["video"] },
    programm: { teile: ["programm"] },
  },
};
