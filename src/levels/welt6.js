/* =====================================================================
   LEVEL-DATEN WELT 6: PROFI-GIPFEL
   =====================================================================
   Welt 6 nutzt die Aufgabentypen der anderen Welten und dazu „quiz“
   (src/engine/aufgaben/quiz.js) für Wissen, das man im Browser nicht
   ausprobieren kann, und für Sicherheit.

   Wichtig: Alt+Tab, Windows-Taste und Alt+F4 kann eine Webseite nicht
   abfangen – sie würden das Spiel verlassen oder schließen. Darum gibt es
   sie hier NUR als Merkwissen (Karten und Fragen), nicht zum Ausprobieren.

   Sternekriterien sind VORLÄUFIG (siehe welt1.js).
   ===================================================================== */

/* ---------- 6.1: Merkkarten ---------- */
const KARTEN = [
  { tasten: "Alt+Tab", text: "Zwischen offenen Programmen wechseln. Alt festhalten, Tab mehrmals drücken." },
  { tasten: "Windows-Taste", text: "Öffnet das Startmenü. Die Taste mit dem Fenster-Bild, unten links." },
  { tasten: "Alt+F4", text: "Schließt das Programm, das vorne ist. Vorher speichern!" },
];

/* ---------- 6.2: Markieren mit der Tastatur ---------- */
const WORT_LOESCHEN = { start: { text: "Bit mag |Käse sehr." },
  schritte: [
    { taste: "Strg+Umschalt+→", ansage: "Markier das Wort „Käse“ mit der Tastatur." },
    { taste: "Entf", ansage: "Lösch das markierte Wort." },
  ] };
const WORT_ERSETZEN = { start: { text: "Ich bin müde|" },
  schritte: [
    { taste: "Strg+Umschalt+←", ansage: "Markier das letzte Wort „müde“ mit der Tastatur." },
    { tippe: "wach", ansage: "Schreib „wach“ – das markierte Wort wird dabei ersetzt." },
  ] },
  ZWEI_WOERTER = { start: { text: "|Guten Morgen, Bit!" },
  schritte: [
    { taste: "Strg+Umschalt+→", ansage: "Markier das erste Wort." },
    { taste: "Strg+Umschalt+→", ansage: "Markier noch ein Wort dazu." },
    { taste: "Strg+C", ansage: "Kopier die beiden Wörter." },
  ] },
  ROT_WEG = { start: { text: "Der |rote Ball rollt." },
  schritte: [
    { taste: "Strg+Umschalt+→", ansage: "Markier das Wort „rote“." },
    { taste: ["Entf", "Rücktaste"], ansage: "Lösch es." },
  ] },
  ZEICHEN = { start: { text: "Hallo|!!" },
  schritte: [
    { taste: "Umschalt+→", ansage: "Markier nur EIN Ausrufezeichen: Umschalt und Pfeil nach rechts." },
    { taste: "Entf", ansage: "Lösch es." },
  ] };

/* ---------- 6.3 und 6.4: Desktop mit Extras ---------- */
const MIT_EXTRAS = { schnell: true, energie: true };
const regle = (ziel, ansage, start = {}) => ({
  start: { extras: MIT_EXTRAS, offen: [{ programm: "musik" }], ...start },
  schritte: [{ ziel, ansage }],
});
const energie = (wahl, ansage) => ({
  start: { extras: MIT_EXTRAS },
  schritte: [{ ziel: { art: "energie", wahl }, ansage }],
});

/* ---------- 6.5: Drucken und PDF ---------- */
const EINLADUNG = ["Einladung", "Ich werde 11 Jahre alt!", "Wann: Samstag, 15 Uhr", "Wo: Bei mir im Garten"];
const PLAKAT = ["Bücher-Flohmarkt", "In der Pausenhalle", "Freitag, 10 Uhr"];
const BRIEF = ["Liebe Oma,", "danke für das tolle Geschenk.", "Viele Grüße"];
const dok = (name, zeilen) => ({ name, ort: "/Dokumente", gespeichert: true, zeilen });
const drucke = (name, zeilen, kopien, ansage) => ({
  start: { dokument: dok(name, zeilen) },
  schritte: [{ ziel: { gedruckt: { kopien } }, ansage }],
});
const alsPdf = (name, zeilen, ort, pdfName, ansage) => ({
  start: { dokument: dok(name, zeilen), dateien: ["Dokumente/Schule/"] },
  schritte: [{ ziel: { pdf: { ort, name: pdfName } }, ansage }],
});

/* ---------- 6.6: Fenster, die aufgehen können ---------- */
const GEWINNSPIEL = {
  frage: "Plötzlich geht dieses Fenster auf. Was machst du?",
  fenster: {
    titel: "Herzlichen Glückwunsch!!!",
    text: "Du hast ein Handy gewonnen! Gib schnell deinen Namen und deine Adresse ein, damit wir es dir schicken können.",
    felder: ["Name", "Adresse"],
    knoepfe: ["Jetzt Gewinn holen!"],
  },
  richtig: "X",
  hinweise: {
    "Jetzt Gewinn holen!": "Vorsicht! So etwas ist ein Trick, um an deine Daten zu kommen. Schließ das Fenster mit dem X.",
    felder: "Halt! Deinen Namen und deine Adresse tippst du nicht in fremde Fenster ein.",
  },
};
const AUFSATZ = {
  frage: "Du schließt das Textprogramm. Dein Aufsatz soll erhalten bleiben. Diese Frage erscheint:",
  fenster: {
    titel: "Schreiben",
    text: "Möchtest du die Änderungen an „Aufsatz.docx“ speichern?",
    knoepfe: ["Speichern", "Nicht speichern", "Abbrechen"],
  },
  richtig: "Speichern",
  hinweise: {
    "Nicht speichern": "Dann wären deine Änderungen weg! Lies genau, was im Fenster steht.",
    "Abbrechen": "Abbrechen hält nur an. Dein Aufsatz soll aber gespeichert werden.",
    "X": "Das Kreuz bricht hier nur ab. Lies die Knöpfe genau.",
  },
};
const ALLES_LOESCHEN = {
  frage: "Du wolltest nur EINE Datei löschen. Da erscheint diese Frage:",
  fenster: {
    titel: "Löschen",
    text: "Möchtest du wirklich alle 34 Dateien im Ordner „Schule“ endgültig löschen?",
    knoepfe: ["Ja", "Nein"],
  },
  richtig: ["Nein", "X"],
  hinweise: { "Ja": "Halt! Dann wären ALLE 34 Dateien weg. Lies Fenster immer genau, bevor du klickst." },
};
const VIRUS = {
  frage: "Dieses Fenster blinkt dir entgegen. Was machst du?",
  fenster: {
    titel: "WARNUNG!!!",
    text: "Dein Computer hat 5 Viren! Lade sofort unser Schutzprogramm herunter!",
    knoepfe: ["Jetzt herunterladen"],
  },
  richtig: "X",
  hinweise: { "Jetzt herunterladen": "Solche Warnungen sind oft selbst der Trick. Schließ das Fenster und sag einem Erwachsenen Bescheid." },
};
const PASSWORT = {
  frage: "Ein Spiel will, dass du etwas eingibst:",
  fenster: {
    titel: "Super-Spiel",
    text: "Zum Weiterspielen gib das Passwort deiner Eltern ein.",
    felder: ["Passwort"],
    knoepfe: ["Weiter", "Abbrechen"],
  },
  richtig: ["Abbrechen", "X"],
  hinweise: {
    "Weiter": "Passwörter sind geheim – auch die von deinen Eltern. Brich ab.",
    felder: "Halt! Ein Passwort gibst du nicht in ein Spiel ein.",
  },
};
const UPDATE = {
  frage: "Du schreibst gerade einen Test am Computer. Da erscheint:",
  fenster: {
    titel: "Updates",
    text: "Updates sind bereit. Jetzt neu starten?",
    knoepfe: ["Jetzt neu starten", "Später"],
  },
  richtig: "Später",
  hinweise: { "Jetzt neu starten": "Dann wäre dein Test unterbrochen und nicht gespeicherte Arbeit weg. Wähl „Später“." },
};

export const LEVEL_WELT6 = {

  "6.1": {
    titel: "Geheime Tastenkürzel",
    lernziel: "Du weißt, was Alt+Tab, die Windows-Taste und Alt+F4 machen.",
    erklaerung: [
      "Diese drei Tastenkürzel nutzen Profis jeden Tag. Lies dir die Karten genau durch.",
      "Achtung: Hier im Spiel bitte NICHT ausprobieren – sonst ist das Spiel weg oder zu! Probier sie später an einem normalen Computer aus.",
    ],
    aufgabe: "Welche Antwort stimmt?",
    typ: "quiz",
    gefuehrt: {
      runden: 3, gemischt: false, karten: KARTEN,
      fragen: [
        { frage: "Du hast zwei Programme offen und willst schnell zum anderen wechseln.", antworten: ["Alt+Tab", "Alt+F4", "Windows-Taste"], richtig: "Alt+Tab",
          hinweise: { "Alt+F4": "Alt+F4 schließt das Programm – dann wäre es weg!", "Windows-Taste": "Die Windows-Taste öffnet nur das Startmenü." } },
        { frage: "Du willst das Startmenü öffnen, ohne die Maus zu benutzen.", antworten: ["Alt+Tab", "Windows-Taste", "Strg+S"], richtig: "Windows-Taste",
          hinweise: { "Alt+Tab": "Alt+Tab wechselt zwischen Programmen.", "Strg+S": "Strg+S speichert." } },
        { frage: "Ein Programm soll ganz zugehen – ohne Maus.", antworten: ["Strg+Z", "Alt+F4", "Alt+Tab"], richtig: "Alt+F4",
          hinweise: { "Strg+Z": "Strg+Z macht etwas rückgängig.", "Alt+Tab": "Alt+Tab wechselt nur zu einem anderen Programm." } },
      ],
    },
    selbst: {
      runden: 6,
      fragen: [
        { frage: "Du willst schnell vom Malprogramm zu deinen Notizen wechseln.", antworten: ["Alt+Tab", "Alt+F4", "Strg+A"], richtig: "Alt+Tab",
          hinweise: { "Alt+F4": "Alt+F4 schließt das Malprogramm!", "Strg+A": "Strg+A markiert alles." } },
        { frage: "Wie öffnest du das Startmenü mit der Tastatur?", antworten: ["Windows-Taste", "Esc", "Alt+Tab"], richtig: "Windows-Taste",
          hinweise: { "Esc": "Esc bricht ab oder schließt ein Menü.", "Alt+Tab": "Alt+Tab wechselt zwischen Programmen." } },
        { frage: "Du bist fertig mit dem Rechner-Programm und willst es mit der Tastatur schließen.", antworten: ["Alt+F4", "Strg+S", "Windows-Taste"], richtig: "Alt+F4",
          hinweise: { "Strg+S": "Strg+S speichert nur.", "Windows-Taste": "Die Windows-Taste öffnet das Startmenü." } },
        { frage: "Bevor du ein Programm mit Alt+F4 schließt – was solltest du vorher tun?", antworten: ["Strg+S", "Strg+A", "Alt+Tab"], richtig: "Strg+S",
          hinweise: { "Strg+A": "Strg+A markiert nur alles. Speichern ist wichtig!", "Alt+Tab": "Alt+Tab wechselt nur. Speichern ist wichtig!" } },
        { frage: "Du hältst Alt fest und drückst mehrmals Tab. Was passiert?",
          antworten: ["Ich wähle ein anderes Programm aus", "Das Programm schließt sich", "Der Computer geht aus"], richtig: "Ich wähle ein anderes Programm aus",
          hinweise: { "Das Programm schließt sich": "Das wäre Alt+F4.", "Der Computer geht aus": "Nein, Alt+Tab wechselt nur zwischen Programmen." } },
        { frage: "Wo findest du die Windows-Taste?",
          antworten: ["Unten links, mit einem Fenster-Bild", "Oben rechts neben Entf", "In der Mitte über dem Enter"], richtig: "Unten links, mit einem Fenster-Bild",
          hinweise: { "Oben rechts neben Entf": "Schau unten links, zwischen Strg und Alt.", "In der Mitte über dem Enter": "Schau unten links, zwischen Strg und Alt." } },
      ],
    },
    hilfen: [
      "Alt+Tab: wechseln. Windows-Taste: Startmenü. Alt+F4: schließen.",
      "Denk an die Karten: Bei Alt+F4 ist das Programm zu – also vorher speichern.",
    ],
    sterne: { fehlerFuerZwei: 2, fehlerFuerDrei: 0, sekundenFuerDrei: 60 },
  },

  "6.2": {
    titel: "Markieren mit der Tastatur",
    lernziel: "Du markierst Wörter mit Strg+Umschalt+Pfeil.",
    erklaerung: [
      "Profis markieren oft ohne Maus. Umschalt+Pfeil markiert einen Buchstaben.",
      "Strg+Umschalt+Pfeil markiert ein ganzes Wort. Strg und Umschalt festhalten, dann den Pfeil drücken.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "editor",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [WORT_LOESCHEN, ZEICHEN, WORT_ERSETZEN] },
    selbst: { runden: 5, aufgaben: [WORT_LOESCHEN, WORT_ERSETZEN, ZWEI_WOERTER, ROT_WEG, ZEICHEN] },
    hilfen: [
      "Pfeil nach rechts markiert nach rechts, Pfeil nach links nach links.",
      "Erst Strg und Umschalt festhalten, dann den Pfeil drücken – für jedes Wort einmal.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "6.3": {
    titel: "Lautstärke und Helligkeit",
    lernziel: "Du stellst Lautstärke und Helligkeit ein und schaltest den Ton stumm.",
    erklaerung: [
      "Unten rechts in der Taskleiste sind Lautsprecher und Sonne. Ein Klick öffnet die Schnelleinstellungen.",
      "Mit den Reglern stellst du Lautstärke und Helligkeit ein: Maustaste drücken, festhalten und ziehen. „Stumm“ schaltet den Ton ganz aus.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "desktop",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      regle({ art: "lautstaerke", min: 80 }, "Die Musik ist zu leise. Mach sie lauter: mindestens 80."),
      regle({ art: "stumm", wert: true }, "Es ist Unterricht. Schalte den Ton stumm."),
      regle({ art: "helligkeit", max: 50 }, "Der Bildschirm blendet. Mach ihn dunkler: höchstens 50."),
    ] },
    selbst: { runden: 5, aufgaben: [
      regle({ art: "lautstaerke", max: 20 }, "Die Musik ist viel zu laut. Mach sie leise: höchstens 20.", { lautstaerke: 90 }),
      regle({ art: "stumm", wert: true }, "Gleich beginnt die Stunde. Schalte den Ton stumm."),
      regle({ art: "stumm", wert: false }, "Der Ton ist aus. Schalte ihn wieder an.", { stumm: true }),
      regle({ art: "helligkeit", min: 90 }, "Der Bildschirm ist zu dunkel. Mach ihn ganz hell: mindestens 90.", { helligkeit: 40 }),
      regle({ art: "lautstaerke", min: 100 }, "Lieblingslied! Dreh die Musik ganz auf: 100."),
    ] },
    hilfen: [
      "Klick unten rechts auf Lautsprecher und Sonne. Dann ziehst du den Regler.",
      "Nach rechts ziehen: lauter oder heller. Nach links: leiser oder dunkler. Die Zahl daneben zeigt, wo du bist.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "6.4": {
    titel: "Ausschalten und Abmelden",
    lernziel: "Du fährst den Computer herunter, startest ihn neu oder meldest dich ab.",
    erklaerung: [
      "Einen Computer schaltet man nicht einfach am Knopf aus. Man fährt ihn herunter – über Start und „Ein/Aus“.",
      "Herunterfahren: ganz aus. Neu starten: aus und gleich wieder an. Abmelden: Du gehst raus, der Computer bleibt an.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "desktop",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      energie("herunterfahren", "Die Stunde ist vorbei. Fahr den Computer herunter."),
      energie("abmelden", "Deine Freundin will jetzt an den Computer. Melde dich ab."),
      energie("neustart", "Der Computer ist komisch langsam. Starte ihn neu."),
    ] },
    selbst: { runden: 4, aufgaben: [
      energie("abmelden", "Du bist fertig, gleich kommt die nächste Gruppe an diesen Platz. Melde dich ab."),
      energie("herunterfahren", "Schulschluss! Schalte den Computer richtig aus."),
      energie("neustart", "Nach einem Update soll der Computer einmal aus- und wieder angehen."),
      energie("herunterfahren", "Feierabend für den Computer. Fahr ihn herunter."),
    ] },
    hilfen: [
      "Klick auf Start. Unten im Startmenü ist der Knopf „Ein/Aus“.",
      "Abmelden heißt: nur du gehst raus. Herunterfahren heißt: alles aus.",
    ],
    sterne: { fehlerFuerZwei: 2, fehlerFuerDrei: 0, sekundenFuerDrei: 30 },
  },

  "6.5": {
    titel: "Drucken und PDF",
    lernziel: "Du druckst ein Dokument und speicherst es als PDF.",
    erklaerung: [
      "Drucken findest du im Menü „Datei“ – oder schnell mit Strg+P. Dort stellst du ein, wie viele Exemplare du brauchst.",
      "Statt auf Papier kannst du auch „Als PDF speichern“ wählen. Ein PDF sieht überall gleich aus – gut zum Verschicken.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "schreiben",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      drucke("Einladung.docx", EINLADUNG, 2, "Du brauchst 2 Einladungen auf Papier. Drucke sie aus."),
      alsPdf("Plakat.docx", PLAKAT, "/Dokumente", "Plakat.pdf", "Speichere das Plakat als PDF im Ordner „Dokumente“. Name: „Plakat“."),
    ] },
    selbst: { runden: 4, aufgaben: [
      drucke("Brief.docx", BRIEF, 1, "Drucke den Brief an Oma einmal aus."),
      drucke("Plakat.docx", PLAKAT, 4, "Für alle Klassen brauchst du 4 Plakate. Drucke sie aus."),
      alsPdf("Einladung.docx", EINLADUNG, "/Downloads", "Einladung.pdf", "Speichere die Einladung als PDF im Ordner „Downloads“. Name: „Einladung“."),
      alsPdf("Brief.docx", BRIEF, "/Dokumente/Schule", "Oma.pdf", "Mach aus dem Brief ein PDF im Ordner „Schule“ mit dem Namen „Oma“."),
    ] },
    hilfen: [
      "Datei → Drucken … oder Strg+P. Mit + und − stellst du die Anzahl ein.",
      "Für ein PDF wählst du im Drucken-Fenster „Als PDF speichern“. Dann Ordner und Namen wie bei „Speichern unter“.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 60 },
  },

  "6.6": {
    titel: "Sicher am Computer",
    lernziel: "Du liest Fenster genau, bevor du klickst, und gibst keine persönlichen Daten preis.",
    erklaerung: [
      "Manchmal gehen Fenster auf. Viele sind nützlich – manche sind Tricks. Lies immer erst, dann klick.",
      "Deinen Namen, deine Adresse und Passwörter tippst du nie in fremde Fenster. Im Zweifel: Fenster schließen und einen Erwachsenen fragen.",
    ],
    aufgabe: "Was machst du?",
    typ: "quiz",
    gefuehrt: { runden: 3, gemischt: false, fragen: [GEWINNSPIEL, AUFSATZ, ALLES_LOESCHEN] },
    selbst: { runden: 6, fragen: [GEWINNSPIEL, AUFSATZ, ALLES_LOESCHEN, VIRUS, PASSWORT, UPDATE] },
    hilfen: [
      "Lies den ganzen Text im Fenster, bevor du klickst.",
      "Gewinne, Warnungen mit vielen Ausrufezeichen und Fragen nach Passwörtern sind fast immer Tricks: Fenster mit dem X schließen.",
    ],
    sterne: { fehlerFuerZwei: 2, fehlerFuerDrei: 0, sekundenFuerDrei: 90 },
  },

  "6.B": {
    titel: "Abschlussmission",
    lernziel: "Du nutzt alles, was du gelernt hast, in einer großen Mission.",
    erklaerung: [
      "Die große Abschlussmission! Bit bereitet das Schulfest vor und braucht deine Hilfe am Computer.",
      "Alles, was du gelernt hast, kommt vor: Maus, Tastatur, Fenster, Ordner, Programme und Sicherheit. Ich sage dir, was dran ist.",
    ],
    aufgabe: "Auf zum Gipfel!",
    typ: "abfolge",
    // Kein "gefuehrt": Bei der Abschlussmission gibt es kein Üben mit Hilfe.
    selbst: {
      abschnitte: [
        { typ: "desktop", einstellungen: { runden: 1, aufgaben: [
          { start: { extras: { schnell: true }, offen: [{ programm: "musik" }], lautstaerke: 70 },
            schritte: [
              { ziel: { art: "stumm", wert: true }, ansage: "Es ist Unterricht – schalte den Ton stumm." },
              { ziel: { art: "schliessen", programm: "musik" }, ansage: "Schließ das Musik-Programm." },
            ] },
        ] } },
        { typ: "quiz", einstellungen: { runden: 1, fragen: [{ ...GEWINNSPIEL, frage: "Oh! Ein Fenster geht auf. Was machst du?" }] } },
        { typ: "explorer", einstellungen: { runden: 1, aufgaben: [
          { start: { ort: "/", dateien: ["Dokumente/Schule/"] },
            schritte: [{ ziel: { ordner: "/Dokumente/Schulfest" }, ansage: "Erstelle in „Dokumente“ einen Ordner „Schulfest“." }] },
        ] } },
        { typ: "schreiben", einstellungen: { runden: 1, aufgaben: [
          { start: { dokument: { zeilen: ["Schulfest", "Am Freitag ab 14 Uhr", "Mit Spielen und Kuchen"] }, dateien: ["Dokumente/Schulfest/"] },
            schritte: [
              { ziel: { format: { zeile: "Schulfest", groesse: 48 } }, ansage: "Mach die Überschrift „Schulfest“ groß: Größe 48." },
              { ziel: { format: { zeile: "Schulfest", groesse: 48, farbe: "blau" } }, ansage: "Färbe sie blau." },
              { ziel: { gespeichertUnter: { ort: "/Dokumente/Schulfest", name: "Plakat.docx" } },
                ansage: "Speichere das Plakat im Ordner „Schulfest“ (in Dokumente) unter dem Namen „Plakat“." },
            ] },
        ] } },
        { typ: "editor", einstellungen: { runden: 1, zeige: { speichern: true, feststell: true }, aufgaben: [
          { start: { text: "Fragen an: |" },
            schritte: [
              { tippe: "fest@schule.de", ansage: "Schreib die E-Mail-Adresse für Fragen: fest@schule.de" },
              { taste: "Strg+S", ansage: "Speichere mit der Tastatur." },
            ] },
        ] } },
        { typ: "desktop", einstellungen: { runden: 1, aufgaben: [
          { start: { extras: { energie: true } },
            schritte: [{ ziel: { art: "energie", wahl: "herunterfahren" }, ansage: "Alles fertig! Fahr den Computer herunter." }] },
        ] } },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Denk an alles, was du gelernt hast: markieren, speichern, Fenster lesen.",
    ],
    sterne: { fehlerFuerZwei: 6, fehlerFuerDrei: 2, sekundenFuerDrei: 240 },
    // Text nach der Mission
    abschluss: [
      "Geschafft! Du hast den Profi-Gipfel erreicht und alle Welten gemeistert.",
      "Du bist jetzt ein echter ComputerHeld! Danke, dass du mit mir unterwegs warst.",
    ],
  },

};
