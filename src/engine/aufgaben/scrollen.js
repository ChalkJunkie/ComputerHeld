/* =====================================================================
   AUFGABENTYP „SCROLLEN“
   Ein langer Schacht, von dem man nur einen Ausschnitt sieht. Irgendwo
   liegt ein Edelstein. Das Kind dreht am Mausrad, bis es ihn sieht, und
   klickt ihn an. Eine Bildlaufleiste gibt es absichtlich nicht – so
   geht es nur mit dem Mausrad.

   Einstellungen (aus den Level-Daten):
     runden   – wie viele Edelsteine
     laenge   – Länge des Schachts in Bildschirmpunkten (z. B. 3000)
     bild     – welches Bild (Standard "edelstein-blau")
     groesse  – Vergrößerung des Bildes
   ===================================================================== */

import { bild, zeigeMaus } from "./hilfsmittel.js";

const STUFEN_ABSTAND = 300; // alle 300 Punkte steht ein Stufen-Schild

function baueSchacht(laenge) {
  const rollfeld = document.createElement("div");
  rollfeld.className = "rollfeld";
  rollfeld.tabIndex = 0; // damit auch die Pfeiltasten funktionieren
  const inhalt = document.createElement("div");
  inhalt.className = "schacht";
  inhalt.style.height = laenge + "px";
  for (let tiefe = STUFEN_ABSTAND, nummer = 1; tiefe < laenge - 100; tiefe += STUFEN_ABSTAND, nummer++) {
    const marke = document.createElement("div");
    marke.className = "stufe";
    marke.style.top = tiefe + "px";
    marke.textContent = "Stufe " + nummer;
    inhalt.append(marke);
  }
  rollfeld.append(inhalt);
  return { rollfeld, inhalt };
}

export const scrollen = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig }) {
    const { runden, laenge, groesse = 5 } = einstellungen;
    const { rollfeld, inhalt } = baueSchacht(laenge);
    flaeche.append(rollfeld);
    let runde = 0;
    let stein = null;
    let steinOben = 0;      // Lage des Edelsteins im Schacht
    let steinHoehe = 0;
    let warSichtbar = false;
    let beendet = false;

    // Wegweiser (nur mit Hilfe): sagt, in welche Richtung es geht
    let wegweiser = null;
    if (mitHilfe) {
      wegweiser = document.createElement("div");
      wegweiser.className = "wegweiser";
      flaeche.append(wegweiser);
      zeigeMaus(tafel, "rad", "Dreh am Mausrad in der Mitte.");
    }

    function lage() { // "oben", "unten" oder "sichtbar"
      const sichtOben = rollfeld.scrollTop;
      const sichtUnten = sichtOben + rollfeld.clientHeight;
      if (steinOben + steinHoehe > sichtUnten) return "unten";
      if (steinOben < sichtOben) return "oben";
      return "sichtbar";
    }

    function beimRollen() {
      if (beendet || !stein) return;
      const jetzt = lage();
      if (jetzt === "sichtbar") warSichtbar = true;
      else if (warSichtbar) {
        // Der Edelstein war schon zu sehen und ist wieder weg: vorbeigerollt
        warSichtbar = false;
        beiFehler();
      }
      if (wegweiser) {
        wegweiser.textContent = {
          unten: "▼ Weiter nach unten",
          oben: "▲ Weiter nach oben",
          sichtbar: "Da ist er! Klick ihn an.",
        }[jetzt];
      }
    }

    function neuerStein() {
      stein = document.createElement("div");
      stein.className = "ziel";
      stein.append(bild(einstellungen.bild || "edelstein-blau", groesse));
      inhalt.append(stein);
      steinHoehe = stein.offsetHeight;
      // Der neue Edelstein soll außerhalb des sichtbaren Ausschnitts liegen
      const sicht = rollfeld.clientHeight;
      const hoechstens = laenge - steinHoehe - 60;
      for (let versuch = 0; versuch < 40; versuch++) {
        steinOben = 60 + Math.random() * (hoechstens - 60);
        const weitGenug = steinOben + steinHoehe < rollfeld.scrollTop - sicht * 0.3
          || steinOben > rollfeld.scrollTop + sicht * 1.3;
        if (weitGenug) break;
      }
      stein.style.top = steinOben + "px";
      stein.style.left = 15 + Math.random() * 60 + "%";
      warSichtbar = false;
      stein.addEventListener("click", () => {
        stein.remove();
        stein = null;
        runde++;
        beiRichtig(runde, runden);
        if (runde >= runden) {
          beendet = true;
          beiFertig();
        } else {
          neuerStein();
        }
      });
      beimRollen();
    }

    rollfeld.addEventListener("scroll", beimRollen);
    neuerStein();

    return {
      beenden() {
        beendet = true;
        rollfeld.remove();
        if (wegweiser) wegweiser.remove();
      },
    };
  },

  /* Vorführung: Der Schacht rollt von selbst langsam nach unten und zurück. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const { rollfeld, inhalt } = baueSchacht(1500);
    flaeche.append(rollfeld);
    const stein = document.createElement("div");
    stein.className = "ziel";
    stein.style.top = "900px";
    stein.style.left = "50%";
    stein.append(bild(einstellungen.bild || "edelstein-blau", 6));
    inhalt.append(stein);
    zeigeMaus(tafel, "rad", "Das Rad in der Mitte rollt das Bild.");

    const timer = [];
    function durchlauf() {
      timer[0] = setTimeout(() => rollfeld.scrollTo({ top: 700, behavior: "smooth" }), 800);
      timer[1] = setTimeout(() => rollfeld.scrollTo({ top: 0, behavior: "smooth" }), 4000);
    }
    durchlauf();
    const wiederholung = setInterval(durchlauf, 7000);

    return {
      beenden() {
        clearInterval(wiederholung);
        timer.forEach(clearTimeout);
        rollfeld.remove();
      },
    };
  },
};
