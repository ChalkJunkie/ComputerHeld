/* =====================================================================
   LEVEL-DATEN WELT 5: PROGRAMMPALAST
   =====================================================================
   Alle Level nutzen den Aufgabentyp "schreiben"
   (src/engine/aufgaben/schreiben.js). Dort steht genau, wie eine
   Aufgabe aufgebaut ist und welche Ziele es gibt.

   Schriftarten, Größen, Farben und Bilder stehen oben in
   src/desktop/schreiben.js (dort auch änderbar).

   Beim ÜBEN zeigt Bit Schritt für Schritt, wo man klicken muss.
   Beim ANWENDEN sagt Bit nur, WAS zu tun ist.
   Sternekriterien sind VORLÄUFIG (siehe welt1.js).
   ===================================================================== */

/* ---------- Texte, die in den Aufgaben vorkommen ---------- */
const EINLADUNG = ["Einladung", "Ich werde 11 Jahre alt!", "Wann: Samstag, 15 Uhr", "Wo: Bei mir im Garten", "Bitte bring gute Laune mit."];
const PLAKAT = ["Bücher-Flohmarkt", "In der Pausenhalle", "Freitag, 10 Uhr", "Alle sind eingeladen!"];
const BRIEF = ["Liebe Oma,", "danke für das tolle Geschenk.", "Ich habe mich sehr gefreut.", "Viele Grüße"];
const STECKBRIEF = ["Mein Haustier", "Name: Flocke", "Tierart: Kaninchen", "Lieblingsessen: Möhren"];

/* ---------- Abkürzungen ---------- */
// Ein Dokument mit Namen, das noch nicht gespeichert ist
const dok = (name, zeilen) => ({ name, ort: "/Dokumente", gespeichert: false, zeilen });

const speichere = (name, zeilen, ansage) => ({
  start: { dokument: dok(name, zeilen) },
  schritte: [{ ziel: { gespeichert: true, nurSymbol: true }, ansage }],
});
// format: { zeile: "…", fett: true, … }
const gestalte = (name, zeilen, format, ansage) => ({
  start: { dokument: { ...dok(name, zeilen), gespeichert: true } },
  schritte: [{ ziel: { format }, ansage }],
});
const bild = (name, zeilen, bildId, nach, ansage) => ({
  start: { dokument: { ...dok(name, zeilen), gespeichert: true } },
  schritte: [{ ziel: { bild: { bild: bildId, nach } }, ansage }],
});
// Neues Dokument (noch ohne Namen) oder ein vorhandenes unter neuem Namen speichern
const speichereUnter = (dokument, ort, name, ansage) => ({
  start: { dokument, dateien: ["Dokumente/Schule/", "Dokumente/Geburtstag/", "Dokumente/Briefe/"] },
  schritte: [{ ziel: { gespeichertUnter: { ort, name } }, ansage }],
});

export const LEVEL_WELT5 = {

  "5.1": {
    titel: "Speichern-Symbol",
    lernziel: "Du speicherst mit dem Speichern-Symbol.",
    erklaerung: [
      "In fast jedem Programm gibt es oben ein Speichern-Symbol. Es sieht aus wie eine Diskette – so hat man früher gespeichert.",
      "Ein Klick darauf, und deine Arbeit ist sicher. Oben siehst du dann „gespeichert ✓“.",
    ],
    aufgabe: "Speichere das Dokument.",
    typ: "schreiben",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      speichere("Einladung.docx", EINLADUNG, "Die Einladung ist fertig. Speichere sie mit dem Speichern-Symbol."),
      speichere("Brief.docx", BRIEF, "Speichere den Brief."),
    ] },
    selbst: { runden: 4, aufgaben: [
      speichere("Plakat.docx", PLAKAT, "Das Plakat ist noch nicht gespeichert. Speichere es."),
      speichere("Steckbrief.docx", STECKBRIEF, "Speichere den Steckbrief."),
      speichere("Einladung.docx", EINLADUNG, "Speichere die Einladung."),
      speichere("Brief.docx", BRIEF, "Speichere den Brief, bevor du aufhörst."),
    ] },
    hilfen: [
      "Das Speichern-Symbol ist oben links, gleich neben „Datei“.",
      "Es sieht aus wie ein kleines blaues Viereck mit weißem Fenster: eine Diskette.",
    ],
    sterne: { fehlerFuerZwei: 2, fehlerFuerDrei: 0, sekundenFuerDrei: 30 },
  },

  "5.2": {
    titel: "Schriftart und -größe",
    lernziel: "Du änderst die Schriftart und die Schriftgröße.",
    erklaerung: [
      "Klick zuerst auf die Zeile, die du ändern willst. Sie wird blau markiert.",
      "Dann wählst du oben die Schriftart (zum Beispiel „Georgia“) und die Schriftgröße (je größer die Zahl, desto größer die Schrift).",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Einladung", groesse: 36 }, "Mach die Überschrift „Einladung“ groß: Schriftgröße 36."),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Bücher-Flohmarkt", schrift: "Georgia" }, "Gib der Überschrift „Bücher-Flohmarkt“ die Schriftart „Georgia“."),
      gestalte("Brief.docx", BRIEF, { zeile: "Viele Grüße", schrift: "Comic Sans MS", groesse: 20 }, "Gib „Viele Grüße“ die Schriftart „Comic Sans MS“ und die Größe 20."),
    ] },
    selbst: { runden: 6, aufgaben: [
      gestalte("Plakat.docx", PLAKAT, { zeile: "Bücher-Flohmarkt", groesse: 48 }, "Das Plakat braucht eine riesige Überschrift: Größe 48 für „Bücher-Flohmarkt“."),
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Mein Haustier", schrift: "Georgia" }, "Gib „Mein Haustier“ die Schriftart „Georgia“."),
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Wann: Samstag, 15 Uhr", groesse: 20 }, "Mach „Wann: Samstag, 15 Uhr“ etwas größer: Größe 20."),
      gestalte("Brief.docx", BRIEF, { zeile: "Liebe Oma,", schrift: "Comic Sans MS" }, "Schreib „Liebe Oma,“ in der Schriftart „Comic Sans MS“."),
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Name: Flocke", schrift: "Courier New", groesse: 20 }, "„Name: Flocke“ soll wie mit der Schreibmaschine aussehen: „Courier New“, Größe 20."),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Alle sind eingeladen!", groesse: 12 }, "Mach „Alle sind eingeladen!“ klein: Größe 12."),
    ] },
    hilfen: [
      "Erst die Zeile anklicken, dann oben in der Leiste die Liste öffnen.",
      "Die erste Liste ist die Schriftart, die zweite (mit der Zahl) ist die Schriftgröße.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "5.3": {
    titel: "Schriftfarbe",
    lernziel: "Du färbst Text in einer anderen Farbe.",
    erklaerung: [
      "Farbe macht Plakate und Einladungen schöner.",
      "Klick auf die Zeile. Dann oben auf das „A“ mit dem Farbstrich – und wähl eine Farbe.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Einladung", farbe: "rot" }, "Färbe die Überschrift „Einladung“ rot."),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Freitag, 10 Uhr", farbe: "blau" }, "Färbe „Freitag, 10 Uhr“ blau."),
    ] },
    selbst: { runden: 5, aufgaben: [
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Mein Haustier", farbe: "gruen" }, "Färbe „Mein Haustier“ grün."),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Bücher-Flohmarkt", farbe: "orange" }, "Färbe „Bücher-Flohmarkt“ orange."),
      gestalte("Brief.docx", BRIEF, { zeile: "Viele Grüße", farbe: "lila" }, "Färbe „Viele Grüße“ lila."),
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Ich werde 11 Jahre alt!", farbe: "rot" }, "Färbe „Ich werde 11 Jahre alt!“ rot."),
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Tierart: Kaninchen", farbe: "blau" }, "Färbe „Tierart: Kaninchen“ blau."),
    ] },
    hilfen: [
      "Der Farbknopf ist das „A“ mit dem farbigen Strich darunter.",
      "Unter jeder Farbe steht ihr Name.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "5.4": {
    titel: "Fett, kursiv, unterstrichen",
    lernziel: "Du machst Text fett, kursiv oder unterstrichen.",
    erklaerung: [
      "B macht die Schrift fett (dick). I macht sie kursiv (schräg). U unterstreicht sie.",
      "Klick erst auf die Zeile, dann auf den Knopf. Noch ein Klick macht es wieder rückgängig.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Einladung", fett: true }, "Mach die Überschrift „Einladung“ fett."),
      gestalte("Brief.docx", BRIEF, { zeile: "Viele Grüße", kursiv: true }, "Mach „Viele Grüße“ kursiv."),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Freitag, 10 Uhr", unterstrichen: true }, "Unterstreiche „Freitag, 10 Uhr“."),
    ] },
    selbst: { runden: 6, aufgaben: [
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Mein Haustier", fett: true }, "Mach „Mein Haustier“ fett."),
      gestalte("Einladung.docx", EINLADUNG, { zeile: "Bitte bring gute Laune mit.", kursiv: true }, "Mach „Bitte bring gute Laune mit.“ kursiv."),
      gestalte("Brief.docx", BRIEF, { zeile: "Ich habe mich sehr gefreut.", unterstrichen: true }, "Unterstreiche „Ich habe mich sehr gefreut.“"),
      gestalte("Plakat.docx", PLAKAT, { zeile: "Bücher-Flohmarkt", fett: true, unterstrichen: true }, "Mach „Bücher-Flohmarkt“ fett UND unterstrichen."),
      gestalte("Einladung.docx", [{ text: "Einladung", fett: true }, ...EINLADUNG.slice(1)], { zeile: "Einladung", fett: false }, "Die Überschrift ist fett – das soll sie nicht sein. Mach das Fett wieder weg."),
      gestalte("Steckbrief.docx", STECKBRIEF, { zeile: "Lieblingsessen: Möhren", kursiv: true, fett: true }, "Mach „Lieblingsessen: Möhren“ fett und kursiv."),
    ] },
    hilfen: [
      "B wie „bold“ (englisch für fett), I wie „italic“ (kursiv), U wie „underline“ (unterstrichen).",
      "Ist ein Knopf blau, ist er gerade an. Noch ein Klick schaltet ihn aus.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "5.5": {
    titel: "Bild einfügen",
    lernziel: "Du fügst ein Bild an der richtigen Stelle ein.",
    erklaerung: [
      "Ein Bild kommt immer UNTER die Zeile, die markiert ist. Klick also zuerst auf die richtige Zeile.",
      "Dann oben auf „Bild“ und das passende Bild aussuchen.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      bild("Einladung.docx", EINLADUNG, "bit", "Einladung", "Füge unter die Überschrift „Einladung“ das Bild „Bit“ ein."),
      bild("Steckbrief.docx", STECKBRIEF, "haus", "Mein Haustier", "Füge unter „Mein Haustier“ das Bild „Haus“ ein. (Flocke wohnt in einem Häuschen!)"),
    ] },
    selbst: { runden: 4, aufgaben: [
      bild("Plakat.docx", PLAKAT, "stern", "Bücher-Flohmarkt", "Füge unter „Bücher-Flohmarkt“ einen Stern ein."),
      bild("Brief.docx", BRIEF, "kiste", "danke für das tolle Geschenk.", "Füge unter „danke für das tolle Geschenk.“ das Bild „Kiste“ ein."),
      bild("Einladung.docx", EINLADUNG, "haus", "Wo: Bei mir im Garten", "Füge unter „Wo: Bei mir im Garten“ das Bild „Haus“ ein."),
      bild("Steckbrief.docx", STECKBRIEF, "bit", "Lieblingsessen: Möhren", "Füge ganz unten, unter „Lieblingsessen: Möhren“, das Bild „Bit“ ein."),
    ] },
    hilfen: [
      "Zuerst die Zeile anklicken, UNTER die das Bild soll.",
      "Der Knopf „Bild“ ist oben rechts in der Leiste.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "5.6": {
    titel: "Speichern unter",
    lernziel: "Du speicherst ein Dokument im richtigen Ordner mit einem guten Namen.",
    erklaerung: [
      "Mit „Speichern unter“ bestimmst du selbst, WO dein Dokument liegt und WIE es heißt.",
      "Datei → Speichern unter. Dann den Ordner öffnen, den Namen eintippen und auf „Speichern“ klicken.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      speichereUnter({ zeilen: STECKBRIEF }, "/Dokumente/Schule", "Steckbrief.docx",
        "Speichere das neue Dokument im Ordner „Schule“ unter dem Namen „Steckbrief“."),
      speichereUnter({ zeilen: EINLADUNG }, "/Dokumente/Geburtstag", "Einladung.docx",
        "Speichere die Einladung im Ordner „Geburtstag“ unter dem Namen „Einladung“."),
    ] },
    selbst: { runden: 4, aufgaben: [
      speichereUnter({ zeilen: BRIEF }, "/Dokumente/Briefe", "Oma.docx",
        "Speichere den Brief im Ordner „Briefe“ (in Dokumente) unter dem Namen „Oma“."),
      speichereUnter({ zeilen: PLAKAT }, "/Dokumente/Schule", "Flohmarkt.docx",
        "Speichere das Plakat im Ordner „Schule“ unter dem Namen „Flohmarkt“."),
      speichereUnter({ name: "Einladung.docx", ort: "/Dokumente/Geburtstag", gespeichert: true, zeilen: EINLADUNG }, "/Downloads", "Einladung2.docx",
        "Speichere eine Kopie der Einladung im Ordner „Downloads“ unter dem Namen „Einladung2“."),
      speichereUnter({ zeilen: STECKBRIEF }, "/Bilder", "Flocke.docx",
        "Speichere den Steckbrief im Ordner „Bilder“ unter dem Namen „Flocke“."),
    ] },
    hilfen: [
      "„Speichern unter“ findest du im Menü „Datei“ oben links.",
      "Ordner öffnest du mit Doppelklick. „Nach oben“ bringt dich zurück. Dann den Namen tippen und „Speichern“ klicken.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 60 },
  },

  "5.B": {
    titel: "Boss: Einladung gestalten",
    lernziel: "Du gestaltest eine Einladung und speicherst sie am richtigen Ort.",
    erklaerung: [
      "Du hast bald Geburtstag! Mach aus dem Text eine richtig schöne Einladung.",
      "Ich sage dir, was dran ist. Wie es geht, weißt du jetzt selbst.",
    ],
    aufgabe: "Auf geht's!",
    typ: "schreiben",
    // Kein "gefuehrt": Beim Boss gibt es kein Üben mit Hilfe.
    selbst: {
      runden: 4,
      gemischt: false,
      aufgaben: [
        { start: { dokument: { zeilen: EINLADUNG }, dateien: ["Dokumente/Schule/", "Dokumente/Geburtstag/"] },
          schritte: [
            { ziel: { format: { zeile: "Einladung", groesse: 48 } }, ansage: "Mach die Überschrift „Einladung“ riesig: Größe 48." },
            { ziel: { format: { zeile: "Einladung", groesse: 48, fett: true } }, ansage: "Mach sie außerdem fett." },
            { ziel: { format: { zeile: "Einladung", groesse: 48, fett: true, farbe: "rot" } }, ansage: "Und rot!" },
          ] },
        { start: { weiter: true },
          schritte: [
            { ziel: { format: { zeile: "Ich werde 11 Jahre alt!", schrift: "Comic Sans MS" } }, ansage: "Gib „Ich werde 11 Jahre alt!“ die Schriftart „Comic Sans MS“." },
            { ziel: { format: { zeile: "Wann: Samstag, 15 Uhr", unterstrichen: true } }, ansage: "Unterstreiche „Wann: Samstag, 15 Uhr“." },
            { ziel: { format: { zeile: "Bitte bring gute Laune mit.", kursiv: true } }, ansage: "Mach „Bitte bring gute Laune mit.“ kursiv." },
          ] },
        { start: { weiter: true },
          schritte: [
            { ziel: { bild: { bild: "bit", nach: "Einladung" } }, ansage: "Füge unter die Überschrift das Bild „Bit“ ein." },
          ] },
        { start: { weiter: true },
          schritte: [
            { ziel: { gespeichertUnter: { ort: "/Dokumente/Geburtstag", name: "Einladung.docx" } },
              ansage: "Fertig! Speichere die Einladung im Ordner „Geburtstag“ (in Dokumente) unter dem Namen „Einladung“." },
          ] },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Erst die Zeile anklicken, dann oben den Knopf. Speichern unter: im Menü „Datei“.",
    ],
    sterne: { fehlerFuerZwei: 5, fehlerFuerDrei: 2, sekundenFuerDrei: 150 },
  },

};
