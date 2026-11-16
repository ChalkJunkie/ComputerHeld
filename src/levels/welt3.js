/* =====================================================================
   LEVEL-DATEN WELT 3: FENSTERBURG
   =====================================================================
   Alle Level nutzen den Aufgabentyp "desktop"
   (src/engine/aufgaben/desktop.js). Dort steht, wie eine Aufgabe
   aufgebaut ist.

   Programme: notizen, malen, rechner, musik, fotos
   Zustand eines Fensters: "normal", "maximiert" oder "minimiert"

   Beim ÜBEN sagt Bit zusätzlich, wo man klicken muss, und die Stelle
   ist markiert. Beim ANWENDEN sagt Bit nur, WAS zu tun ist.
   Sternekriterien sind VORLÄUFIG (siehe welt1.js).
   ===================================================================== */

/* ---------- Abkürzungen für einfache Aufgaben ---------- */

// Ein Fenster ist offen, eine Sache soll damit passieren
const mitFenster = (programm, zustand, art, ansage) => ({
  start: { offen: [{ programm, zustand }] },
  schritte: [{ ziel: { art, programm }, ansage }],
});

// Mehrere Fenster, eins davon soll über die Taskleiste nach vorn
const holeVor = (offen, aktiv, programm, ansage) => ({
  start: { offen, aktiv },
  schritte: [{ ziel: { art: "taskleiste", programm }, ansage }],
});

// Ein Programm über das Startmenü öffnen
const oeffne = (programm, ansage, offen = []) => ({
  start: { offen },
  schritte: [{ ziel: { art: "oeffnen", programm }, ansage }],
});

export const LEVEL_WELT3 = {

  "3.1": {
    titel: "Minimieren, vergrößern, schließen",
    lernziel: "Du nutzt die drei Knöpfe oben rechts in jedem Fenster.",
    erklaerung: [
      "Jedes Programm läuft in einem Fenster. Oben rechts hat es drei Knöpfe.",
      "Strich: Fenster in die Taskleiste legen. Kästchen: Fenster groß machen. X: Fenster schließen.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "desktop",
    gefuehrt: { runden: 4, gemischt: false, aufgaben: [
      mitFenster("malen", "normal", "maximieren", "Mach das Malprogramm bildschirmgroß."),
      mitFenster("malen", "maximiert", "wiederherstellen", "Das Fenster ist zu groß. Mach es wieder kleiner."),
      mitFenster("notizen", "normal", "minimieren", "Leg die Notizen unten in die Taskleiste. Sie sollen offen bleiben."),
      mitFenster("rechner", "normal", "schliessen", "Schließ den Rechner. Du brauchst ihn nicht mehr."),
    ] },
    selbst: { runden: 8, aufgaben: [
      mitFenster("fotos", "normal", "maximieren", "Mach die Fotos bildschirmgroß."),
      mitFenster("musik", "normal", "maximieren", "Mach das Musik-Fenster ganz groß."),
      mitFenster("rechner", "maximiert", "wiederherstellen", "Der Rechner ist zu groß. Mach ihn wieder kleiner."),
      mitFenster("notizen", "maximiert", "wiederherstellen", "Mach die Notizen wieder kleiner."),
      mitFenster("malen", "normal", "minimieren", "Leg das Malprogramm in die Taskleiste. Es soll offen bleiben."),
      mitFenster("fotos", "maximiert", "minimieren", "Leg die Fotos in die Taskleiste. Sie sollen offen bleiben."),
      mitFenster("musik", "normal", "schliessen", "Schließ das Musik-Programm."),
      mitFenster("notizen", "maximiert", "schliessen", "Schließ die Notizen ganz."),
    ] },
    hilfen: [
      "Die drei Knöpfe sind oben rechts im Fenster: Strich, Kästchen, X.",
      "Minimieren (Strich) heißt: Das Fenster bleibt offen, du siehst es nur unten in der Taskleiste. Schließen (X) heißt: ganz zu.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "3.2": {
    titel: "Taskleiste",
    lernziel: "Du holst Fenster über die Taskleiste zurück und wechselst zwischen Programmen.",
    erklaerung: [
      "Unten ist die Taskleiste. Dort siehst du alle Programme, die gerade offen sind.",
      "Klick auf ein Programm in der Taskleiste – schon ist sein Fenster vorne.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "desktop",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      holeVor([{ programm: "musik", zustand: "minimiert" }], null, "musik", "Hol die Musik aus der Taskleiste zurück."),
      holeVor([{ programm: "malen" }, { programm: "notizen", zustand: "maximiert" }], "notizen", "malen", "Wechsle zum Malprogramm."),
      holeVor([{ programm: "fotos", zustand: "minimiert" }, { programm: "rechner", zustand: "minimiert" }], null, "rechner", "Hol den Rechner zurück."),
    ] },
    selbst: { runden: 6, aufgaben: [
      holeVor([{ programm: "notizen", zustand: "minimiert" }], null, "notizen", "Hol die Notizen zurück."),
      holeVor([{ programm: "fotos" }, { programm: "musik", zustand: "maximiert" }], "musik", "fotos", "Wechsle zu den Fotos."),
      holeVor([{ programm: "malen", zustand: "minimiert" }, { programm: "musik", zustand: "minimiert" }, { programm: "rechner", zustand: "minimiert" }], null, "malen", "Hol das Malprogramm zurück."),
      holeVor([{ programm: "rechner" }, { programm: "notizen" }, { programm: "fotos", zustand: "maximiert" }], "fotos", "rechner", "Wechsle zum Rechner."),
      holeVor([{ programm: "musik", zustand: "minimiert" }, { programm: "malen", zustand: "maximiert" }], "malen", "musik", "Hol die Musik nach vorn."),
      holeVor([{ programm: "notizen" }, { programm: "malen", zustand: "maximiert" }], "malen", "notizen", "Wechsle zu den Notizen."),
    ] },
    hilfen: [
      "Schau unten in die Taskleiste. Dort steht der Name des Programms.",
      "Klick nur einmal. Klickst du auf ein Programm, das schon vorne ist, verschwindet es in die Taskleiste.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 30 },
  },

  "3.3": {
    titel: "Startmenü",
    lernziel: "Du öffnest Programme über das Startmenü.",
    erklaerung: [
      "Im Startmenü findest du alle Programme. Du öffnest es mit dem Start-Knopf unten in der Taskleiste.",
      "Dann klickst du auf das Programm, das du willst.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "desktop",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      oeffne("musik", "Öffne das Programm „Musik“."),
      oeffne("malen", "Öffne das Malprogramm."),
      oeffne("rechner", "Öffne den Rechner.", [{ programm: "notizen" }]),
    ] },
    selbst: { runden: 6, aufgaben: [
      oeffne("fotos", "Öffne die Fotos."),
      oeffne("notizen", "Öffne die Notizen."),
      oeffne("rechner", "Öffne den Rechner."),
      oeffne("musik", "Öffne zusätzlich die Musik.", [{ programm: "malen" }]),
      oeffne("malen", "Öffne zusätzlich das Malprogramm.", [{ programm: "fotos", zustand: "maximiert" }]),
      oeffne("notizen", "Öffne zusätzlich die Notizen.", [{ programm: "rechner", zustand: "minimiert" }]),
    ] },
    hilfen: [
      "Der Start-Knopf ist unten in der Taskleiste, ganz links von den Programmen.",
      "Im Startmenü steht unter jedem Bild der Name des Programms.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 35 },
  },

  "3.B": {
    titel: "Boss: Programme im Griff",
    lernziel: "Du öffnest, wechselst, minimierst und schließt Programme nacheinander.",
    erklaerung: [
      "Jetzt räumst du den Computer richtig auf!",
      "Ich sage dir immer, was zu tun ist. Wie das geht, weißt du jetzt selbst.",
    ],
    aufgabe: "Auf geht's!",
    typ: "desktop",
    // Kein "gefuehrt": Beim Boss gibt es kein Üben mit Hilfe.
    selbst: {
      runden: 4,
      gemischt: false,
      aufgaben: [
        { start: {},
          schritte: [
            { ziel: { art: "oeffnen", programm: "notizen" }, ansage: "Öffne die Notizen." },
            { ziel: { art: "oeffnen", programm: "malen" }, ansage: "Öffne auch das Malprogramm." },
            { ziel: { art: "taskleiste", programm: "notizen" }, ansage: "Wechsle zurück zu den Notizen." },
            { ziel: { art: "schliessen", programm: "malen" }, ansage: "Schließ das Malprogramm." },
          ] },
        { start: { offen: [{ programm: "rechner" }, { programm: "musik", zustand: "minimiert" }], aktiv: "rechner" },
          schritte: [
            { ziel: { art: "maximieren", programm: "rechner" }, ansage: "Mach den Rechner bildschirmgroß." },
            { ziel: { art: "taskleiste", programm: "musik" }, ansage: "Hol die Musik nach vorn." },
            { ziel: { art: "minimieren", programm: "musik" }, ansage: "Leg die Musik wieder in die Taskleiste." },
            { ziel: { art: "schliessen", programm: "rechner" }, ansage: "Schließ den Rechner." },
          ] },
        { start: { offen: [{ programm: "fotos" }, { programm: "notizen" }, { programm: "malen" }], aktiv: "malen" },
          schritte: [
            { ziel: { art: "schliessen", programm: "malen" }, ansage: "Schließ das Malprogramm." },
            { ziel: { art: "schliessen", programm: "notizen" }, ansage: "Schließ die Notizen." },
            { ziel: { art: "maximieren", programm: "fotos" }, ansage: "Mach die Fotos bildschirmgroß." },
          ] },
        { start: { offen: [{ programm: "fotos", zustand: "maximiert" }] },
          schritte: [
            { ziel: { art: "oeffnen", programm: "musik" }, ansage: "Öffne die Musik." },
            { ziel: { art: "taskleiste", programm: "fotos" }, ansage: "Wechsle zu den Fotos." },
            { ziel: { art: "wiederherstellen", programm: "fotos" }, ansage: "Mach die Fotos wieder kleiner." },
            { ziel: { art: "schliessen", programm: "fotos" }, ansage: "Schließ die Fotos." },
            { ziel: { art: "schliessen", programm: "musik" }, ansage: "Schließ zum Schluss auch die Musik." },
          ] },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Öffnen: Startmenü. Wechseln: Taskleiste. Oben rechts im Fenster: Strich, Kästchen, X.",
    ],
    sterne: { fehlerFuerZwei: 5, fehlerFuerDrei: 2, sekundenFuerDrei: 90 },
  },

};
