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
     typ         – Art der Aufgabe (siehe src/engine/aufgaben/)
     gefuehrt    – Einstellungen für das Üben MIT Hilfe
     selbst      – Einstellungen für das Anwenden OHNE Hilfe
     hilfen      – Hilfetexte in Stufen (erst der erste, dann der zweite …)
     sterne      – Kriterien, VORLÄUFIG:
                     1 Stern:  Level geschafft
                     2 Sterne: höchstens "fehlerFuerZwei" Fehler
                     3 Sterne: höchstens "fehlerFuerDrei" Fehler UND
                               höchstens "sekundenFuerDrei" Sekunden
   ===================================================================== */

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
    // groesse = Vergrößerung der Zielscheibe (16 Pixel x groesse)
    // ausloeser: "zeigen" = draufzeigen und warten, "klick" = anklicken
    // haltezeit = so viele Millisekunden muss der Pfeil auf dem Ziel bleiben
    gefuehrt: { runden: 3, groesse: 8, ausloeser: "zeigen", haltezeit: 700 },
    selbst:   { runden: 8, groesse: 5, ausloeser: "zeigen", haltezeit: 700 },
    hilfen: [
      "Du musst nicht klicken. Nur zeigen und kurz warten.",
      "Ist der Tisch zu Ende? Heb die Maus hoch und setz sie weiter vorne wieder ab.",
    ],
    sterne: { fehlerFuerZwei: 4, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

};
