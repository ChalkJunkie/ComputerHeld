/* =====================================================================
   LEVEL-DATEN WELT 1: MAUSLAND
   =====================================================================
   Jedes Level ist nur eine Beschreibung. Der Ablauf (Zeigen – Üben –
   Anwenden – Sterne) kommt aus src/engine/level-ablauf.js.

   Felder eines Levels:
     titel       – Überschrift
     lernziel    – ein Satz, was das Kind danach kann
     erklaerung  – das sagt Bit am Anfang (ein Eintrag = ein Absatz)
     aufgabe     – das sagt Bit während der Aufgabe
     typ         – Art der Aufgabe (siehe src/engine/aufgaben/, dort stehen
                   auch die möglichen Einstellungen jedes Typs)
     gefuehrt    – Einstellungen für das Üben MIT Hilfe (fehlt beim Boss)
     selbst      – Einstellungen für das Anwenden OHNE Hilfe
     hilfen      – Hilfetexte in Stufen (erst der erste, dann der zweite …)
     sterne      – Kriterien, VORLÄUFIG:
                     1 Stern:  Level geschafft
                     2 Sterne: höchstens "fehlerFuerZwei" Fehler
                     3 Sterne: höchstens "fehlerFuerDrei" Fehler UND
                               höchstens "sekundenFuerDrei" Sekunden
   ===================================================================== */

// Diese Listen werden in mehreren Leveln gebraucht:
const EINE_KISTE = [{ bild: "kiste", name: "die Kiste" }];
const ZWEI_KISTEN = [
  { bild: "kiste-rot",  name: "die rote Kiste",  nimmt: "edelstein-rot" },
  { bild: "kiste-blau", name: "die blaue Kiste", nimmt: "edelstein-blau" },
];
const ROT_UND_BLAU = [
  { bild: "edelstein-rot",  name: "den roten Edelstein" },
  { bild: "edelstein-blau", name: "den blauen Edelstein" },
];

export const LEVEL_WELT1 = {

  "1.1": {
    titel: "Zeigen",
    lernziel: "Du bewegst den Mauszeiger genau auf ein Ziel.",
    erklaerung: [
      "Leg deine Hand locker auf die Maus. Dein Zeigefinger liegt auf der linken Taste.",
      "Schieb die Maus über den Tisch. Der Pfeil auf dem Bildschirm bewegt sich mit!",
    ],
    aufgabe: "Bewege den Pfeil auf die Zielscheibe. Halte ihn dort kurz still.",
    typ: "zielscheiben",
    gefuehrt: { runden: 3, groesse: 8, ausloeser: "zeigen", haltezeit: 700 },
    selbst:   { runden: 8, groesse: 5, ausloeser: "zeigen", haltezeit: 700 },
    hilfen: [
      "Du musst nicht klicken. Nur zeigen und kurz warten.",
      "Ist der Tisch zu Ende? Heb die Maus hoch und setz sie weiter vorne wieder ab.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "1.2": {
    titel: "Linksklick",
    lernziel: "Du klickst mit der linken Maustaste genau auf ein Ziel.",
    erklaerung: [
      "Die Maus hat zwei Tasten. Die linke brauchst du am meisten.",
      "Zeig auf das Ziel. Drück die linke Taste einmal kurz mit dem Zeigefinger. Klick!",
    ],
    aufgabe: "Klick mit der linken Taste auf die Zielscheibe.",
    typ: "zielscheiben",
    gefuehrt: { runden: 3, groesse: 7, ausloeser: "klick" },
    selbst:   { runden: 10, groesse: 4, ausloeser: "klick" },
    hilfen: [
      "Halte die Maus beim Klicken ganz ruhig. Nur der Finger bewegt sich.",
      "Drück kurz und lass gleich wieder los.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 30 },
  },

  "1.3": {
    titel: "Rechtsklick",
    lernziel: "Du öffnest mit der rechten Maustaste ein Menü und wählst einen Eintrag.",
    erklaerung: [
      "Die rechte Taste öffnet ein kleines Menü. Es zeigt, was du mit einem Ding machen kannst.",
      "Im Menü wählst du dann wieder mit der linken Taste aus.",
    ],
    aufgabe: "Klick mit der rechten Taste auf die Kiste.",
    typ: "kontextmenue",
    gefuehrt: {
      runden: 3, bild: "kiste", groesse: 7, dingName: "die Kiste",
      eintraege: ["Öffnen", "Kopieren", "Umbenennen", "Eigenschaften"],
      gesucht: ["Öffnen", "Kopieren", "Umbenennen"],
    },
    selbst: {
      runden: 6, bild: "kiste", groesse: 5, dingName: "die Kiste",
      eintraege: ["Öffnen", "Kopieren", "Umbenennen", "Eigenschaften"],
      gesucht: ["Öffnen", "Kopieren", "Umbenennen", "Eigenschaften"],
    },
    hilfen: [
      "Die rechte Taste drückst du mit dem Mittelfinger.",
      "Erst rechte Taste auf die Kiste. Dann linke Taste auf das Wort im Menü.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 45 },
  },

  "1.4": {
    titel: "Doppelklick",
    lernziel: "Du öffnest etwas mit einem Doppelklick.",
    erklaerung: [
      "Mit einem Doppelklick öffnest du Dinge, zum Beispiel Ordner und Programme.",
      "Drück die linke Taste zweimal ganz schnell hintereinander. Klick-klick!",
    ],
    aufgabe: "Öffne die Kiste mit einem Doppelklick.",
    typ: "zielscheiben",
    gefuehrt: { runden: 3, groesse: 7, bild: "kiste", ausloeser: "doppelklick" },
    selbst:   { runden: 8, groesse: 5, bild: "kiste", ausloeser: "doppelklick" },
    hilfen: [
      "Die beiden Klicks müssen schnell kommen. Klick-klick, wie zweimal Anklopfen.",
      "Halte die Maus dabei still. Sie darf zwischen den Klicks nicht wegrutschen.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 35 },
  },

  "1.5": {
    titel: "Mausrad",
    lernziel: "Du rollst mit dem Mausrad nach unten und nach oben.",
    erklaerung: [
      "Manches passt nicht auf den Bildschirm. Dann rollst du das Bild weiter.",
      "Dreh das Rad in der Mitte der Maus mit dem Zeigefinger. Zu dir hin geht es nach unten.",
    ],
    aufgabe: "Dreh am Mausrad, bis du den Edelstein siehst. Klick ihn dann an.",
    typ: "scrollen",
    gefuehrt: { runden: 3, laenge: 2400, groesse: 6 },
    selbst:   { runden: 6, laenge: 4000, groesse: 5 },
    hilfen: [
      "Der Edelstein ist mal weiter unten und mal weiter oben. Probier beide Richtungen.",
      "Dreh langsam, wenn du nah dran bist. Sonst rollst du vorbei.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "1.6": {
    titel: "Markieren",
    lernziel: "Du ziehst einen Rahmen auf und markierst damit mehrere Dinge.",
    erklaerung: [
      "Mit einem Rahmen wählst du viele Dinge auf einmal aus.",
      "Drück die linke Taste und halte sie fest. Zieh die Maus schräg über die Dinge. Dann lass los.",
    ],
    aufgabe: "Zieh einen Rahmen um alle Edelsteine. Die grauen Steine bleiben draußen.",
    typ: "markieren",
    gefuehrt: { runden: 2, edelsteine: 3, steine: 3 },
    selbst:   { runden: 5, edelsteine: 5, steine: 6 },
    hilfen: [
      "Fang neben den Edelsteinen an, nicht auf einem Edelstein.",
      "Starte links oben und zieh nach rechts unten. Lass die Taste erst am Ende los.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 45 },
  },

  "1.7": {
    titel: "Ziehen und Ablegen",
    lernziel: "Du ziehst ein Ding mit gedrückter Maustaste an einen anderen Ort.",
    erklaerung: [
      "Du kannst Dinge mit der Maus festhalten und woanders hinlegen.",
      "Zeig auf das Ding. Drück die linke Taste und halte sie fest. Zieh es zur Kiste. Dann lass los.",
    ],
    aufgabe: "Zieh den Edelstein in die Kiste.",
    typ: "ziehen",
    gefuehrt: { runden: 3, dinge: [{ bild: "edelstein-gruen", name: "den Edelstein" }], behaelter: EINE_KISTE },
    selbst:   { runden: 6, dinge: ROT_UND_BLAU, behaelter: ZWEI_KISTEN },
    hilfen: [
      "Lass die Taste erst los, wenn der Edelstein über der Kiste ist.",
      "Rot gehört in die rote Kiste, Blau in die blaue.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "1.B": {
    titel: "Boss: Schatzsuche",
    lernziel: "Du nutzt Klick, Ziehen und Rechtsklick nacheinander.",
    erklaerung: [
      "Jetzt zeigst du alles, was du im Mausland gelernt hast!",
      "Sammle die Edelsteine ein, sortiere sie in die Kisten und aktiviere am Ende die Schatzkiste.",
    ],
    aufgabe: "Auf zur Schatzsuche!",
    typ: "abfolge",
    // Kein "gefuehrt": Beim Boss gibt es kein Üben mit Hilfe.
    selbst: {
      abschnitte: [
        {
          typ: "zielscheiben",
          ansage: "Sammle die Edelsteine ein. Klick sie an!",
          einstellungen: { runden: 6, groesse: 5, bild: "edelstein-gruen", ausloeser: "klick" },
        },
        {
          typ: "ziehen", // sagt selbst an, was wohin gehört
          einstellungen: { runden: 6, dinge: ROT_UND_BLAU, behaelter: ZWEI_KISTEN },
        },
        {
          typ: "kontextmenue", // sagt selbst an
          einstellungen: {
            runden: 3, bild: "kiste", groesse: 6, dingName: "die Schatzkiste",
            eintraege: ["Öffnen", "Aktivieren", "Umbenennen", "Eigenschaften"],
            gesucht: ["Aktivieren"],
          },
        },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Menü öffnen: rechte Taste. Alles andere: linke Taste.",
    ],
    sterne: { fehlerFuerZwei: 5, fehlerFuerDrei: 2, sekundenFuerDrei: 90 },
  },

};
