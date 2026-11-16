/* =====================================================================
   AUFGABENTYP „EINSORTIEREN“ (für den Boss von Welt 1)
   Links liegen Edelsteine, rechts steht eine offene Schatzkiste mit
   farbigen Fächern. Das Kind zieht jeden Edelstein auf ein Fach in
   seiner Farbe.

   Im Boss sind es genau die Edelsteine, die vorher eingesammelt wurden
   (die Abfolge reicht sie über "gemeinsam.gesammelt" weiter). Allein
   benutzt, werden zufällige Edelsteine genommen.

   Einstellungen (aus den Level-Daten):
     runden  – wie viele Edelsteine
     farben  – nur ohne vorheriges Einsammeln: mögliche Farben
   Fehler: Ein Edelstein auf einem Fach in der falschen Farbe.
   Wird er neben die Fächer gelegt, rutscht er einfach zurück.
   ===================================================================== */

import { EDELSTEIN } from "../../../sprites/symbole.js";
import { bild, mischen, zufall } from "./hilfsmittel.js";

const STEIN_FAKTOR = 5;
const FERTIG_PAUSE_MS = 700;

export const einsortieren = {

  starte({ flaeche, einstellungen, gemeinsam, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const farben = einstellungen.farben || ["rot", "blau", "gruen", "gelb"];

    // Welche Edelsteine? Die eingesammelten – oder zufällige.
    const gesammelt = (gemeinsam && gemeinsam.gesammelt) || [];
    const namen = [];
    for (let i = 0; i < runden; i++) namen.push(gesammelt[i] || "edelstein-" + zufall(farben));

    beiAnsage("Leg jeden Edelstein in die Schatzkiste – auf ein Feld in seiner Farbe.");

    /* ---- Schatzkiste mit Fächern (rechts) ---- */
    const kiste = document.createElement("div");
    kiste.className = "schatzkiste";
    const faecher = document.createElement("div");
    faecher.className = "faecher";
    kiste.append(faecher);
    for (const name of mischen(namen)) {
      // Das Fach bekommt die helle und die dunkle Farbe seines Edelsteins
      const palette = EDELSTEIN.paletten[name.replace("edelstein-", "")];
      const fach = document.createElement("div");
      fach.className = "fach";
      fach.dataset.bild = name;
      fach.style.background = palette.H.farbe;
      fach.style.borderColor = palette.D.farbe;
      faecher.append(fach);
    }
    flaeche.append(kiste);

    /* ---- Edelsteine (links) in einem Raster ---- */
    let uebrig = namen.length;
    let gezogen = null;   // { element, start }
    let griff = null;
    let beendet = false;
    let fertigTimer = null;
    const steine = [];
    const spalten = 3;
    namen.forEach((name, i) => {
      const element = document.createElement("div");
      element.className = "ziel greifbar";
      element.dataset.bild = name;
      element.append(bild(name, STEIN_FAKTOR));
      flaeche.append(element);
      const x = flaeche.clientWidth * 0.08 + (i % spalten) * 110;
      const y = flaeche.clientHeight * 0.22 + Math.floor(i / spalten) * 110;
      element.style.left = x + "px";
      element.style.top = y + "px";
      const stein = { element, start: { x, y } };
      steine.push(stein);
      element.addEventListener("mousedown", (e) => greifen(e, stein));
    });

    function greifen(e, stein) {
      if (e.button !== 0 || beendet) return;
      e.preventDefault();
      const r = stein.element.getBoundingClientRect();
      griff = { x: e.clientX - r.left, y: e.clientY - r.top };
      gezogen = stein;
      stein.element.classList.add("gegriffen");
    }

    function bewegen(e) {
      if (!gezogen) return;
      const r = flaeche.getBoundingClientRect();
      gezogen.element.style.left = e.clientX - r.left - griff.x + "px";
      gezogen.element.style.top = e.clientY - r.top - griff.y + "px";
    }

    function zurueck(stein) {
      stein.element.style.left = stein.start.x + "px";
      stein.element.style.top = stein.start.y + "px";
    }

    function loslassen() {
      if (!gezogen) return;
      const stein = gezogen;
      gezogen = null;
      stein.element.classList.remove("gegriffen");

      // Auf welchem Fach liegt die Mitte des Edelsteins?
      const d = stein.element.querySelector("canvas").getBoundingClientRect();
      const mx = d.left + d.width / 2, my = d.top + d.height / 2;
      const fach = [...faecher.children].find((f) => {
        const b = f.getBoundingClientRect();
        return mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom;
      });

      if (!fach) return zurueck(stein);               // daneben: kein Fehler
      if (fach.dataset.voll || fach.dataset.bild !== stein.element.dataset.bild) {
        zurueck(stein);                                // falsche Farbe
        beiFehler();
        return;
      }
      // Richtig: Der Edelstein liegt jetzt im Fach
      fach.dataset.voll = "ja";
      fach.append(stein.element.querySelector("canvas"));
      stein.element.remove();
      uebrig--;
      beiRichtig(namen.length - uebrig, namen.length);
      if (uebrig === 0) {
        beendet = true;
        fertigTimer = setTimeout(beiFertig, FERTIG_PAUSE_MS);
      }
    }

    window.addEventListener("mousemove", bewegen);
    window.addEventListener("mouseup", loslassen);

    return {
      beenden() {
        beendet = true;
        clearTimeout(fertigTimer);
        window.removeEventListener("mousemove", bewegen);
        window.removeEventListener("mouseup", loslassen);
        steine.forEach((s) => s.element.remove());
        kiste.remove();
      },
    };
  },

  /* Wird nur im Boss benutzt; dort zeigt die Abfolge ihre eigene Vorführung. */
  zeigeDemo() {
    return { beenden() {} };
  },
};
