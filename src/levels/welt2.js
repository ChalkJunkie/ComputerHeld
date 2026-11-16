/* =====================================================================
   LEVEL-DATEN WELT 2: TASTATURTAL
   =====================================================================
   Alle Level nutzen den Aufgabentyp "editor" (src/engine/aufgaben/editor.js).
   Dort ist genau beschrieben, wie eine Aufgabe aufgebaut ist.

   Kurz zur Schreibweise im Anfangstext ("start.text"):
     |      Schreibstrich (Cursor)
     [x]    der Buchstabe x ist rot markiert
     {Wort} Wort ist markiert (ausgewählt)
     ^      hierhin springt der Strich nach dem Kopieren/Ausschneiden

   Beim ÜBEN nennt Bit zusätzlich die Taste und zeigt sie auf der Tastatur.
   Beim ANWENDEN sagt Bit nur, WAS zu tun ist – welche Taste das ist,
   muss das Kind selbst wissen. Darum steht in "ansage" immer der Zweck.

   Sternekriterien sind VORLÄUFIG (siehe welt1.js).
   ===================================================================== */

// Abkürzung für Aufgaben, bei denen nur etwas geschrieben wird
const schreibe = (text, ansage) => ({ start: { text: "" }, schritte: [{ tippe: text, ansage }] });

/* ---------------- 2.1: Enter, Leertaste, Tab, Esc ---------------- */
const LEER_1 = { start: { text: "Bit|mag Käse." },
  schritte: [{ taste: "Leertaste", ansage: "Mach einen Abstand zwischen „Bit“ und „mag“." }] };
const LEER_2 = { start: { text: "Ich bin|klug." },
  schritte: [{ taste: "Leertaste", ansage: "Zwischen „bin“ und „klug“ fehlt ein Abstand." }] };
const ENTER_1 = { start: { text: "Hallo Bit!|Wie geht es dir?" },
  schritte: [{ taste: "Enter", ansage: "Fang mit „Wie geht es dir?“ eine neue Zeile an." }] };
const ENTER_2 = { start: { text: "Notiz", dialog: { text: "Das Spiel ist fertig geladen." } },
  schritte: [{ taste: "Enter", ansage: "Bestätige die Meldung mit OK." }] };
const TAB_1 = { start: { felder: ["Tier", "Farbe", "Essen"] },
  schritte: [{ taste: "Tab", ansage: "Spring ins nächste Feld: „Farbe“." }] };
const TAB_2 = { start: { felder: ["Tier", "Farbe", "Essen"] },
  schritte: [
    { taste: "Tab", ansage: "Spring zum Feld „Essen“." },
    { taste: "Tab", ansage: "Noch ein Feld weiter bis „Essen“." },
  ] };
const ESC_1 = { start: { text: "Notiz", dialog: { text: "Willst du alles löschen?" } },
  schritte: [{ taste: "Esc", ansage: "Lieber nicht! Brich ab." }] };
const ESC_2 = { start: { text: "Notiz", dialog: { text: "Neue Farbe ausprobieren?" } },
  schritte: [{ taste: "Esc", ansage: "Mach das Fenster zu, ohne etwas zu ändern." }] };

/* ---------------- 2.2: Rücktaste und Entf ---------------- */
// Steht der rote Buchstabe LINKS vom Strich: Rücktaste. RECHTS: Entf.
const loesche = (text) => {
  const taste = text.includes("]|") ? "Rücktaste" : "Entf";
  return { start: { text }, schritte: [{ taste, ansage: "Lösch den roten Buchstaben." }] };
};

/* ---------------- 2.6: Strg+A und Strg+Z ---------------- */
const ALLES_WEG = { start: { text: "Bit mag Käse.|" },
  schritte: [
    { taste: "Strg+A", ansage: "Markier den ganzen Text." },
    { taste: ["Rücktaste", "Entf"], ansage: "Lösch alles auf einmal." },
    { taste: "Strg+Z", ansage: "Oh nein! Hol den Text zurück." },
  ] };
const MARKIEREN = { start: { text: "Mein Hund heißt Bello.|" },
  schritte: [{ taste: "Strg+A", ansage: "Markier den ganzen Text." }] };
const ZURUECK_1 = { start: { text: "Ich mag |.", vorher: "Ich mag Pizza." },
  schritte: [{ taste: "Strg+Z", ansage: "Bit hat aus Versehen ein Wort gelöscht. Mach das rückgängig." }] };
const ZURUECK_2 = { start: { text: "" },
  schritte: [
    { tippe: "Quatsch" },
    { taste: "Strg+Z", ansage: "Das war Quatsch. Mach das Schreiben rückgängig." },
  ] };
const ZURUECK_3 = { start: { text: "Der Ball ist |.", vorher: "Der Ball ist rund." },
  schritte: [{ taste: "Strg+Z", ansage: "Das letzte Wort ist weg. Hol es zurück." }] };

/* ---------------- 2.7: Strg+C, Strg+X, Strg+V ---------------- */
const kopiere = (text) => ({ start: { text },
  schritte: [
    { taste: "Strg+C", ansage: "Kopier das markierte Wort.", zumZiel: true },
    { taste: "Strg+V", ansage: "Bit hat den Strich an die richtige Stelle gesetzt. Füg das Wort dort ein." },
  ] });
const verschiebe = (text) => ({ start: { text },
  schritte: [
    { taste: "Strg+X", ansage: "Schneide das markierte Wort aus.", zumZiel: true },
    { taste: "Strg+V", ansage: "Bit hat den Strich an die richtige Stelle gesetzt. Füg das Wort dort ein." },
  ] });

/* ---------------- 2.8: Strg+S ---------------- */
const speichere = (text, tippe) => ({ start: { text },
  schritte: [
    ...(tippe ? [{ tippe }] : []),
    { taste: "Strg+S", ansage: "Speichere deinen Text." },
  ] });

export const LEVEL_WELT2 = {

  "2.1": {
    titel: "Enter, Leertaste, Tab, Esc",
    lernziel: "Du kennst vier wichtige Tasten und weißt, wofür sie da sind.",
    erklaerung: [
      "Leertaste: macht einen Abstand. Enter: neue Zeile – oder „OK“ in einer Meldung.",
      "Tab: springt ins nächste Feld. Esc: bricht ab und schließt eine Meldung.",
    ],
    aufgabe: "Drück die passende Taste.",
    typ: "editor",
    gefuehrt: { runden: 4, gemischt: false, aufgaben: [LEER_1, ENTER_1, TAB_1, ESC_1] },
    selbst: { runden: 8, aufgaben: [LEER_1, LEER_2, ENTER_1, ENTER_2, TAB_1, TAB_2, ESC_1, ESC_2] },
    hilfen: [
      "Die Leertaste ist die lange Taste ganz unten. Enter ist groß und rechts.",
      "Tab ist links, über der Feststelltaste. Esc ist ganz oben links.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "2.2": {
    titel: "Rücktaste und Entf",
    lernziel: "Du löschst mit der Rücktaste links vom Strich und mit Entf rechts davon.",
    erklaerung: [
      "Der Strich zeigt, wo du gerade schreibst.",
      "Die Rücktaste löscht den Buchstaben LINKS vom Strich. Entf löscht den Buchstaben RECHTS davon.",
    ],
    aufgabe: "Lösch den roten Buchstaben.",
    typ: "editor",
    gefuehrt: { runden: 4, gemischt: false, aufgaben: [
      loesche("Mau[s]|s"), loesche("Ha|[n]us"), loesche("Kä[a]|se"), loesche("Ta|[x]ste"),
    ] },
    selbst: { runden: 8, aufgaben: [
      loesche("Bit[t]|te"), loesche("Bil|[l]d"), loesche("Schu[l]|le"), loesche("Ma|[m]us"),
      loesche("Comp[p]|uter"), loesche("Fens|[s]ter"), loesche("Kä[a]|se"), loesche("Ha|[n]us"),
    ] },
    hilfen: [
      "Schau, wo der rote Buchstabe steht: links oder rechts vom Strich?",
      "Links: Rücktaste (der lange Pfeil über Enter). Rechts: Entf (oben rechts).",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "2.3": {
    titel: "Umschalt und Feststelltaste",
    lernziel: "Du schreibst große Buchstaben mit Umschalt und ganze Wörter groß mit der Feststelltaste.",
    erklaerung: [
      "Für EINEN großen Buchstaben hältst du Umschalt gedrückt und drückst dann den Buchstaben.",
      "Für VIELE große Buchstaben drückst du einmal die Feststelltaste. Danach wieder einmal – dann ist sie aus.",
    ],
    aufgabe: "Schreib das Wort genau so ab.",
    typ: "editor",
    gefuehrt: { runden: 3, gemischt: false, zeige: { feststell: true }, aufgaben: [
      schreibe("Bit"),
      schreibe("Maus"),
      schreibe("HALLO", "Schreib „HALLO“ in lauter großen Buchstaben. Tipp: Feststelltaste!"),
    ] },
    selbst: { runden: 6, zeige: { feststell: true }, aufgaben: [
      schreibe("Ich mag Kekse."), schreibe("Der Ball"), schreibe("Bit ist klug."),
      schreibe("STOPP"), schreibe("SUPER"), schreibe("Gute Nacht"),
    ] },
    hilfen: [
      "Umschalt ist die Taste mit dem dicken Pfeil nach oben. Es gibt sie links und rechts.",
      "Ist die Feststelltaste an, wird alles groß. Unten im Fenster siehst du, ob sie an ist.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 70 },
  },

  "2.4": {
    titel: "Umlaute und ß",
    lernziel: "Du findest ä, ö, ü und ß auf der Tastatur.",
    erklaerung: [
      "Auf der deutschen Tastatur haben ä, ö und ü eigene Tasten. Sie liegen rechts bei den Buchstaben.",
      "Das ß findest du oben, rechts neben der 0.",
    ],
    aufgabe: "Schreib das Wort genau so ab.",
    typ: "editor",
    gefuehrt: { runden: 4, gemischt: false, aufgaben: [
      schreibe("Bär"), schreibe("Tür"), schreibe("Öl"), schreibe("Fuß"),
    ] },
    selbst: { runden: 8, aufgaben: [
      schreibe("Käse"), schreibe("süß"), schreibe("Größe"), schreibe("Bücher"),
      schreibe("Äpfel"), schreibe("Übung"), schreibe("Straße"), schreibe("Grüße"),
    ] },
    hilfen: [
      "Ä, Ö und Ü liegen ganz rechts bei den Buchstaben, neben L und P.",
      "Für ein großes Ä, Ö oder Ü hältst du Umschalt gedrückt.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 60 },
  },

  "2.5": {
    titel: "AltGr: @ und €",
    lernziel: "Du schreibst @ und € mit der AltGr-Taste.",
    erklaerung: [
      "Manche Tasten haben drei Zeichen. Das dritte bekommst du mit AltGr – rechts neben der Leertaste.",
      "AltGr festhalten und Q drücken: @. AltGr festhalten und E drücken: €.",
    ],
    aufgabe: "Schreib den Text genau so ab.",
    typ: "editor",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      schreibe("@"), schreibe("€"), schreibe("bit@maus.de"),
    ] },
    selbst: { runden: 6, aufgaben: [
      schreibe("5 €"), schreibe("tom@schule.de"), schreibe("Eis: 1 €"),
      schreibe("mia@post.de"), schreibe("10 €"), schreibe("info@zoo.de"),
    ] },
    hilfen: [
      "AltGr ist rechts neben der Leertaste. Halte sie fest, während du Q oder E drückst.",
      "Nicht die Alt-Taste links nehmen – es muss AltGr rechts sein.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 70 },
  },

  "2.6": {
    titel: "Strg+Z und Strg+A",
    lernziel: "Du markierst alles mit Strg+A und machst Fehler mit Strg+Z rückgängig.",
    erklaerung: [
      "Strg+A markiert den ganzen Text auf einmal. A wie „alles“.",
      "Strg+Z macht den letzten Schritt rückgängig. Das rettet dich, wenn etwas schiefgeht!",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "editor",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [MARKIEREN, ZURUECK_1, ALLES_WEG] },
    selbst: { runden: 5, aufgaben: [ALLES_WEG, MARKIEREN, ZURUECK_1, ZURUECK_2, ZURUECK_3] },
    hilfen: [
      "Halte Strg gedrückt (unten links) und drück dann den Buchstaben.",
      "Markieren: Strg+A. Rückgängig: Strg+Z.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "2.7": {
    titel: "Kopieren und Einfügen",
    lernziel: "Du kopierst mit Strg+C, schneidest mit Strg+X aus und fügst mit Strg+V ein.",
    erklaerung: [
      "Strg+C kopiert ein markiertes Wort. Strg+X schneidet es aus – dann ist es an der alten Stelle weg.",
      "Das Wort liegt dann in der Zwischenablage. Mit Strg+V fügst du es beim Strich ein.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "editor",
    gefuehrt: { runden: 2, gemischt: false, zeige: { ablage: true }, aufgaben: [
      kopiere("{Bit} ist klug. ^ ist lustig."),
      verschiebe("Ich habe {zwei }Hunde und ^Katzen."),
    ] },
    selbst: { runden: 5, zeige: { ablage: true }, aufgaben: [
      kopiere("{Bit} ist klug. ^ ist lustig."),
      kopiere("{Hallo}! Ich sage ^!"),
      kopiere("{Käse} ist lecker. Ich mag ^."),
      verschiebe("Ich habe {zwei }Hunde und ^Katzen."),
      verschiebe("Ich {gerne }esse ^Eis."),
    ] },
    hilfen: [
      "Kopieren lässt das Wort stehen. Ausschneiden nimmt es weg.",
      "C wie „Copy“ (Englisch für kopieren). V liegt direkt daneben. X sieht aus wie eine Schere.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "2.8": {
    titel: "Strg+S",
    lernziel: "Du speicherst deine Arbeit mit Strg+S.",
    erklaerung: [
      "Was du nicht speicherst, kann verloren gehen, wenn der Computer ausgeht.",
      "Mit Strg+S speicherst du ganz schnell. S wie „speichern“. Oben im Fenster siehst du, ob alles gespeichert ist.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "editor",
    gefuehrt: { runden: 2, gemischt: false, zeige: { speichern: true }, aufgaben: [
      speichere("Mein Lieblingstier ist die Maus.|"),
      speichere("", "Hallo Bit!"),
    ] },
    selbst: { runden: 4, zeige: { speichern: true }, aufgaben: [
      speichere("", "Ich mag Käse."),
      speichere("Einkaufsliste: Brot, Milch|", ", Eier"),
      speichere("Bit ist |", "super."),
      speichere("Mein Lieblingstier ist die Maus.|"),
    ] },
    hilfen: [
      "Halte Strg gedrückt und drück S.",
      "Oben im Fenster steht „nicht gespeichert“, bis du gespeichert hast.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "2.B": {
    titel: "Boss: Texträtsel",
    lernziel: "Du nutzt viele Tasten und Kombinationen schnell hintereinander.",
    erklaerung: [
      "Bit schreibt eine Geheimbotschaft für die Schatzsuche. Hilf schnell mit!",
      "Ich sage dir immer, was zu tun ist. Welche Taste das ist, weißt du jetzt selbst.",
    ],
    aufgabe: "Auf geht's!",
    typ: "editor",
    // Kein "gefuehrt": Beim Boss gibt es kein Üben mit Hilfe.
    selbst: {
      runden: 5,
      gemischt: false,
      zeige: { speichern: true, ablage: true, feststell: true },
      aufgaben: [
        { start: { text: "Geheimbotschaft[t]|" },
          schritte: [
            { taste: "Rücktaste", ansage: "Ein Buchstabe ist zu viel. Lösch ihn." },
            { taste: "Enter", ansage: "Mach eine neue Zeile." },
            { tippe: "Treffpunkt: Höhle" },
            { taste: "Strg+S", ansage: "Speichere die Botschaft." },
          ] },
        { start: { text: "Passwort: {Käsekuchen}\nNochmal: ^" },
          schritte: [
            { taste: "Strg+C", ansage: "Kopier das Passwort.", zumZiel: true },
            { taste: "Strg+V", ansage: "Füg es in der zweiten Zeile ein." },
            { taste: "Strg+S", ansage: "Speichere." },
          ] },
        { start: { text: "Bit war hier.", dialog: { text: "Botschaft löschen?" } },
          schritte: [
            { taste: "Esc", ansage: "Nein! Brich ab." },
            { taste: "Strg+A", ansage: "Markier alles." },
            { taste: ["Rücktaste", "Entf"], ansage: "Lösch alles." },
            { taste: "Strg+Z", ansage: "Halt, das war ein Fehler! Hol alles zurück." },
          ] },
        { start: { text: "" },
          schritte: [
            { tippe: "GEHEIM", ansage: "Schreib „GEHEIM“ – in lauter großen Buchstaben." },
            { taste: "Enter", ansage: "Mach eine neue Zeile." },
            { tippe: "bit@maus.de", ansage: "Schreib „bit@maus.de“ – in kleinen Buchstaben." },
            { taste: "Strg+S", ansage: "Speichere." },
          ] },
        { start: { felder: ["Name", "Ort", "Code"] },
          schritte: [
            { taste: "Tab", ansage: "Spring zum Feld „Code“." },
            { taste: "Tab", ansage: "Noch ein Feld weiter bis „Code“." },
          ] },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Kopieren: Strg+C. Einfügen: Strg+V. Rückgängig: Strg+Z. Speichern: Strg+S.",
    ],
    sterne: { fehlerFuerZwei: 6, fehlerFuerDrei: 2, sekundenFuerDrei: 150 },
  },

};
