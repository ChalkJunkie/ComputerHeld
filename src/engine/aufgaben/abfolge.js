/* =====================================================================
   AUFGABENTYP „ABFOLGE“ (für Boss-Level)
   Spielt mehrere Aufgaben hintereinander ab. Jeder Abschnitt nutzt einen
   der anderen Aufgabentypen mit eigenen Einstellungen.

   Einstellungen (aus den Level-Daten):
     abschnitte – Liste: { typ, ansage, einstellungen }
                  "ansage" sagt Bit zu Beginn des Abschnitts (darf fehlen,
                  wenn der Aufgabentyp selbst ansagt).

   Die Abschnitte teilen sich ein Notizfeld "gemeinsam". So weiß z. B. das
   Einsortieren, welche Edelsteine vorher eingesammelt wurden.
   ===================================================================== */

import { AUFGABENTYPEN } from "./index.js";
import { bild } from "./hilfsmittel.js";

export const abfolge = {

  // Alle Runden aller Abschnitte zusammen (für den Zähler „3 / 15“)
  anzahlRunden(einstellungen) {
    return einstellungen.abschnitte.reduce((summe, a) => summe + a.einstellungen.runden, 0);
  },

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const gesamt = abfolge.anzahlRunden(einstellungen);
    const gemeinsam = {};
    let erledigt = 0;   // Runden aus schon fertigen Abschnitten
    let nummer = 0;
    let laufend = null;

    function starteAbschnitt() {
      const abschnitt = einstellungen.abschnitte[nummer];
      if (abschnitt.ansage) beiAnsage(abschnitt.ansage);
      laufend = AUFGABENTYPEN[abschnitt.typ].starte({
        flaeche,
        tafel,
        mitHilfe,
        einstellungen: abschnitt.einstellungen,
        gemeinsam,
        beiFehler,
        beiAnsage,
        beiRichtig: (geschafft) => beiRichtig(erledigt + geschafft, gesamt),
        beiFertig: () => {
          laufend.beenden();
          erledigt += abschnitt.einstellungen.runden;
          nummer++;
          if (nummer < einstellungen.abschnitte.length) starteAbschnitt();
          else beiFertig();
        },
      });
    }
    starteAbschnitt();

    return {
      beenden() {
        if (laufend) laufend.beenden();
      },
    };
  },

  /* Vorführung: nur ein ruhiges Bild – die Techniken sind schon bekannt. */
  zeigeDemo(flaeche) {
    const namen = ["edelstein-rot", "edelstein-gelb", "kiste-offen", "edelstein-blau", "edelstein-gruen"];
    const teile = namen.map((name, i) => {
      const e = document.createElement("div");
      e.className = "ziel mittig";
      e.style.left = 26 + i * 12 + "%";
      e.style.top = "45%";
      e.append(bild(name, name.startsWith("kiste") ? 8 : 6));
      flaeche.append(e);
      return e;
    });
    return {
      beenden() {
        teile.forEach((e) => e.remove());
      },
    };
  },
};
