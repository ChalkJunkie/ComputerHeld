/* =====================================================================
   LANDSCHAFT: Wolke, Baum, Grasboden und Hügel
   Hintergrund für Startseite, Weltkarte und Level.
   Aufbau wie bei sprites/bit.js. Die Hügel werden im Spiel in den
   Farben der jeweiligen Welt eingefärbt (Buchstaben M, H, D).
   ===================================================================== */

const K = { name: "Umriss", farbe: "#2e1c12" };

export const WOLKE = {
  breite: 20, hoehe: 7,
  palette: { W: { name: "Wolke", farbe: "#ffffff" }, S: { name: "Schatten", farbe: "#dceefa" } },
  basis: [
    "......WWWWWW........",
    "....WWWWWWWWWW......",
    "..WWWWWWWWWWWWWW....",
    ".WWWWWWWWWWWWWWWWW..",
    "WWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWW",
    ".SSSSSSSSSSSSSSSSSS.",
  ],
};

export const BAUM = {
  breite: 12, hoehe: 12,
  palette: {
    K, G: { name: "Blätter", farbe: "#3fae3a" }, H: { name: "Licht", farbe: "#7fd45a" },
    D: { name: "Schatten", farbe: "#2a7d28" }, B: { name: "Stamm", farbe: "#9a6338" },
  },
  basis: [
    "....KKKK....",
    "..KKGGGGKK..",
    ".KGGHGGGGGK.",
    "KGGHHGGGGGGK",
    "KGGGGGGGDGGK",
    "KGGGGGGDDGGK",
    ".KGGGGGGGGK.",
    "..KKGGGGKK..",
    "....KBBK....",
    "....KBBK....",
    "....KBBK....",
    "...KKBBKK...",
  ],
};

/* Grasblock: wird am unteren Rand nebeneinander wiederholt */
export const GRAS = {
  breite: 16, hoehe: 16,
  palette: {
    H: { name: "Gras hell", farbe: "#8fd45a" }, G: { name: "Gras", farbe: "#5fb53a" },
    B: { name: "Erde", farbe: "#9a6338" }, D: { name: "Erde dunkel", farbe: "#7d4f2b" },
  },
  basis: [
    "HHHHHHHHHHHHHHHH",
    "HGHHHGHHHHGHHHGH",
    "GGGGGGGGGGGGGGGG",
    "GBGGBBGGGBGGBBGG",
    "BBBBBBBBBBBBBBBB",
    "BBBDBBBBBBBDBBBB",
    "BBBBBBBBBBBBBBBB",
    "BBBBBBBDBBBBBBBB",
    "BDBBBBBBBBBBBBDB",
    "BBBBBBBBBBBBBBBB",
    "BBBBDBBBBBDBBBBB",
    "BBBBBBBBBBBBBBBB",
    "BBBBBBBBDBBBBBBB",
    "BBDBBBBBBBBBBDBB",
    "BBBBBBBBBBBBBBBB",
    "BBBBBDBBBBBBBBBB",
  ],
};

/* Flache, runde Hügel ohne Umriss (sie stehen im Hintergrund).
   M = Hügel, H = helle Kante oben, D = Grasbüschel. */
export const HUEGEL_GROSS = {
  breite: 64, hoehe: 14,
  palette: {
    M: { name: "Hügel", farbe: "#8fcf5a" },
    H: { name: "Hügel hell (Kante)", farbe: "#b5e38a" },
    D: { name: "Gras dunkel", farbe: "#74b847" },
  },
  basis: [
    "................................................................",
    "................................................................",
    "......................HHHHHHHHHHHHHHHHHHHH......................",
    "................HHHHHHMMMMMMMMMMMMMMMMMMMMHHHHHH................",
    ".............HHHMMMMMMMMMMMMMMMDDMMMMMMMMMMMMMMMHHH.............",
    "..........HHHMMMMMMMMMMMDDMMMMMMMMMMMMMMDDMMMMMMMMMHHH..........",
    "........HHMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHH........",
    "......HHMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHH......",
    "....HHMMMMMMMMMMMDDMMMMMMMMMMMMMMMMMMMMMMMMMMMDDMMMMMDDMMMHH....",
    "...HMMMMMDDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH...",
    "..HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH..",
    ".HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH.",
    "HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH",
    "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
  ],
};

export const HUEGEL_KLEIN = {
  breite: 32, hoehe: 9,
  palette: {
    M: { name: "Hügel", farbe: "#8fcf5a" },
    H: { name: "Hügel hell (Kante)", farbe: "#b5e38a" },
    D: { name: "Gras dunkel", farbe: "#74b847" },
  },
  basis: [
    "................................",
    "................................",
    "..........HHHHHHHHHHHH..........",
    "......HHHHMMMMMMMMMMMMHHHH......",
    "....HHMMMMMMMMDDMMMMMMMMMMHH....",
    "...HMMMMMMMMMMMMMMMMMDDMMMMMH...",
    ".HHMMMMDDMMMMMMMMMMMMMMMMMMMMHH.",
    ".HMMMMMMMMMMMMMMMMMMMMMMMDDMMMH.",
    "HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH",
  ],
};
