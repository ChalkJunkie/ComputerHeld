/* =====================================================================
   SYMBOLE DER SECHS WELTEN (je 16 x 16) – für Weltkarte und Überschriften
   Aufbau wie bei sprites/bit.js: ein Zeichen = ein Pixel,
   "." = durchsichtig, die Palette ordnet Buchstaben Farben zu.
   Jede Zeile muss genau 16 Zeichen lang bleiben.
   ===================================================================== */

// --- Welt 1 Mausland: Käsestück auf Grasstreifen -----------------------
export const WELT_1 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",      farbe: "#2e1c12" },
    Y: { name: "Käse",        farbe: "#f5c12e" },
    L: { name: "Käse hell",   farbe: "#fde37a" },
    H: { name: "Loch",        farbe: "#c8860f" },
    G: { name: "Gras",        farbe: "#3fae3a" },
    D: { name: "Gras dunkel", farbe: "#2a7d2a" },
  },
  basis: [
    "................",
    "............KKK.",
    "........KKKKLLK.",
    "....KKKKLLLLLYK.",
    "KKKKLLLLLLLYYYK.",
    "KLLLLLLLLLYYYYK.",
    "KYYYYYYYYYYYHHK.",
    "KYYHHYYYYYYYHHK.",
    "KYYHHYYYYHYYYYK.",
    "KYYYYYYYYYYYYYK.",
    "KKKKKKKKKKKKKKK.",
    "GGKGGGGGKGGGGGGG",
    "GGDGGDGGGDGGGDGG",
    ".DDGDDGGDDGGDDG.",
    "................",
    "................",
  ],
};

// --- Welt 2 Tastaturtal: Taste mit "A" ---------------------------------
export const WELT_2 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",       farbe: "#2e1c12" },
    T: { name: "Tastenfläche", farbe: "#f0ece0" },
    S: { name: "Tastenrand",   farbe: "#8f8a99" },
    B: { name: "Buchstabe",    farbe: "#2e2a45" },
  },
  basis: [
    "................",
    "..KKKKKKKKKKKK..",
    ".KTTTTTTTTTTTTK.",
    ".KTTTTTBBTTTTTK.",
    ".KTTTTBBBBTTTTK.",
    ".KTTTTBBBBTTTTK.",
    ".KTTTBBTTBBTTTK.",
    ".KTTTBBTTBBTTTK.",
    ".KTTBBBBBBBBTTK.",
    ".KTTBBBBBBBBTTK.",
    ".KTBBTTTTTTBBTK.",
    ".KTBBTTTTTTBBTK.",
    ".KSSSSSSSSSSSSK.",
    ".KSSSSSSSSSSSSK.",
    "..KKKKKKKKKKKK..",
    "................",
  ],
};

// --- Welt 3 Fensterburg: Turm mit Zinnen und blauem Fenster -------------
export const WELT_3 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",      farbe: "#2e1c12" },
    P: { name: "Stein",       farbe: "#8e84a8" },
    Q: { name: "Stein dunkel",farbe: "#6a6086" },
    B: { name: "Fensterglas", farbe: "#4aa8e8" },
    W: { name: "Glanz",       farbe: "#c4e6fa" },
    T: { name: "Tor",         farbe: "#5a3a22" },
  },
  basis: [
    "................",
    "..KKK..KK..KKK..",
    "..KPPK.KPK.KPPK.",
    "..KPPKKKPKKKPPK.",
    "..KPPPPPPPPPPPK.",
    "..KKKKKKKKKKKKK.",
    "...KPPPPPPPPPK..",
    "...KPPKKKKPPQK..",
    "...KPPKBWBKPQK..",
    "...KPPKBBBKPQK..",
    "...KPPKBBBKPQK..",
    "...KPPKKKKKPQK..",
    "...KPPPPPPPPQK..",
    "...KPPPKKKPPQK..",
    "...KPPPKTTKPQK..",
    "..KKKKKKKKKKKKK.",
  ],
};

// --- Welt 4 Ordnerwald: Baum --------------------------------------------
export const WELT_4 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",        farbe: "#2e1c12" },
    G: { name: "Laub",          farbe: "#3fae3a" },
    L: { name: "Laub hell",     farbe: "#6fd05a" },
    D: { name: "Laub dunkel",   farbe: "#2a7d2a" },
    B: { name: "Stamm",         farbe: "#8a5a32" },
    C: { name: "Stamm dunkel",  farbe: "#63401f" },
  },
  basis: [
    "................",
    "....KKKKKKKK....",
    "..KKLLLGGGGGKK..",
    ".KLLLGGGGGGGGGK.",
    ".KLLGGGGGGGGGDK.",
    "KKGGGGGGGLGGGDKK",
    "KLGGGGGGGGGGGDDK",
    "KGGGLGGGGGGDDDDK",
    "KGGGGGGGGGDDDDDK",
    ".KKDDDDDDDDDDKK.",
    "...KKKKBCKKKK...",
    "......KBBCK.....",
    "......KBBCK.....",
    "......KBBCK.....",
    "....KKKKKKKKK...",
    "................",
  ],
};

// --- Welt 5 Programmpalast: goldene Krone mit Edelsteinen ---------------
export const WELT_5 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",     farbe: "#2e1c12" },
    Y: { name: "Gold",       farbe: "#f5c12e" },
    L: { name: "Gold hell",  farbe: "#fde37a" },
    O: { name: "Gold dunkel",farbe: "#c8860f" },
    R: { name: "Rubin",      farbe: "#d6402b" },
    B: { name: "Saphir",     farbe: "#3a78d8" },
  },
  basis: [
    "................",
    "................",
    "..KK...KK...KK..",
    ".KLYK.KLYK.KLYK.",
    ".KLYK.KLYK.KLYK.",
    ".KYYYKKYYKKYYYK.",
    ".KYYYYYYYYYYYYK.",
    ".KYYYYYYYYYYYYK.",
    ".KYYYYYYYYYYYYK.",
    ".KYYYYYYYYYYYYK.",
    ".KOOOOOOOOOOOOK.",
    ".KYRRYYBBYYRRYK.",
    ".KOOOOOOOOOOOOK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
  ],

};

// --- Welt 6 Profi-Gipfel: Berg mit Schneekappe und Fahne -----------------
export const WELT_6 = {
  breite: 16, hoehe: 16,
  palette: {
    K: { name: "Umriss",    farbe: "#2e1c12" },
    R: { name: "Fahne",     farbe: "#d6402b" },
    W: { name: "Schnee",    farbe: "#ffffff" },
    L: { name: "Fels hell", farbe: "#b8bcc4" },
    G: { name: "Fels",      farbe: "#8a8f99" },
  },
  basis: [
    "................",
    "................",
    ".......KKKKK....",
    ".......KRRRK....",
    ".......KRRRK....",
    ".......KKKKK....",
    ".......K........",
    "......KWK.......",
    ".....KWWWK......",
    "....KWWWWWK.....",
    "...KLWLWLWGK....",
    "..KLLLLLGGGGK...",
    ".KLLLLLLGGGGGK..",
    "KLLLLLLLGGGGGGK.",
    "KLLLLLLGGGGGGGGK",
    "KKKKKKKKKKKKKKKK",
  ],
};

/* Symbol nach Weltnummer (1 bis 6) */
export const WELT_SYMBOLE = { 1: WELT_1, 2: WELT_2, 3: WELT_3, 4: WELT_4, 5: WELT_5, 6: WELT_6 };
