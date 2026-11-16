/* =====================================================================
   AUFGABENTYP „MARKIEREN“
   Auf der Fläche liegen Edelsteine dicht beieinander und drumherum
   Steine. Das Kind zieht mit gedrückter linker Taste einen Rahmen auf.
   Richtig ist es, wenn alle Edelsteine im Rahmen liegen und kein Stein.

   Einstellungen (aus den Level-Daten):
     runden      – wie viele Durchgänge
     edelsteine  – wie viele Edelsteine (höchstens 6)
     steine      – wie viele Steine drumherum
   ===================================================================== */

import { bild, zeigeMaus, demoBuehne } from "./hilfsmittel.js";

const FELD = 96;      // Die Fläche wird in Felder dieser Größe eingeteilt
const BILD_FAKTOR = 5;

function mischen(liste) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

export const markieren = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig }) {
    const { runden, edelsteine, steine } = einstellungen;
    let runde = 0;
    let dinge = [];        // alle Edelsteine und Steine dieser Runde
    let hilfsrahmen = null;
    let rahmen = null;     // der Rahmen, den das Kind gerade aufzieht
    let start = null;
    let beendet = false;

    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste drücken, halten, ziehen, loslassen.");

    function raeumeRunde() {
      dinge.forEach((d) => d.element.remove());
      dinge = [];
      if (hilfsrahmen) hilfsrahmen.remove();
      hilfsrahmen = null;
    }

    function neueRunde() {
      raeumeRunde();
      // Fläche in Felder einteilen
      const spalten = Math.max(5, Math.floor((flaeche.clientWidth - 40) / FELD));
      const zeilen = Math.max(3, Math.floor((flaeche.clientHeight - 50) / FELD));
      const links = (flaeche.clientWidth - spalten * FELD) / 2;
      const oben = (flaeche.clientHeight - 20 - zeilen * FELD) / 2;

      // Ein Block aus 3 x 2 Feldern für die Edelsteine (nicht ganz am Rand)
      const blockB = 3, blockH = 2;
      const blockX = 1 + Math.floor(Math.random() * (spalten - blockB - 1));
      const blockY = Math.floor(Math.random() * (zeilen - blockH + 1));

      const blockFelder = [];
      const aussenFelder = [];
      for (let x = 0; x < spalten; x++) {
        for (let y = 0; y < zeilen; y++) {
          const imBlock = x >= blockX && x < blockX + blockB && y >= blockY && y < blockY + blockH;
          // Steine halten ein Feld Abstand zum Block
          const nahe = x >= blockX - 1 && x <= blockX + blockB && y >= blockY - 1 && y <= blockY + blockH;
          if (imBlock) blockFelder.push([x, y]);
          else if (!nahe) aussenFelder.push([x, y]);
        }
      }

      function lege(name, [x, y], istEdelstein) {
        const element = document.createElement("div");
        element.className = "ziel";
        element.append(bild(name, BILD_FAKTOR));
        flaeche.append(element);
        element.style.left = links + x * FELD + (FELD - element.offsetWidth) / 2 + "px";
        element.style.top = oben + y * FELD + (FELD - element.offsetHeight) / 2 + "px";
        dinge.push({ element, istEdelstein });
      }
      mischen(blockFelder).slice(0, edelsteine).forEach((feld) => lege("edelstein-gruen", feld, true));
      mischen(aussenFelder).slice(0, steine).forEach((feld) => lege("stein", feld, false));

      if (mitHilfe) {
        hilfsrahmen = document.createElement("div");
        hilfsrahmen.className = "hilfsrahmen";
        hilfsrahmen.style.left = links + blockX * FELD + "px";
        hilfsrahmen.style.top = oben + blockY * FELD + "px";
        hilfsrahmen.style.width = blockB * FELD + "px";
        hilfsrahmen.style.height = blockH * FELD + "px";
        hilfsrahmen.innerHTML = '<span class="ecke-start">1. Hier drücken</span><span class="ecke-ende">2. Hier loslassen</span>';
        flaeche.append(hilfsrahmen);
      }
    }

    function stelleInFlaeche(e) {
      const r = flaeche.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function druecken(e) {
      if (e.button !== 0 || beendet) return;
      e.preventDefault(); // kein Markieren von Text, kein Ziehen von Bildern
      start = stelleInFlaeche(e);
      rahmen = document.createElement("div");
      rahmen.className = "auswahlrahmen";
      flaeche.append(rahmen);
      ziehen(e);
    }

    function ziehen(e) {
      if (!rahmen) return;
      const jetzt = stelleInFlaeche(e);
      rahmen.style.left = Math.min(start.x, jetzt.x) + "px";
      rahmen.style.top = Math.min(start.y, jetzt.y) + "px";
      rahmen.style.width = Math.abs(jetzt.x - start.x) + "px";
      rahmen.style.height = Math.abs(jetzt.y - start.y) + "px";
    }

    function loslassen() {
      if (!rahmen) return;
      const r = rahmen.getBoundingClientRect();
      rahmen.remove();
      rahmen = null;
      if (r.width < 12 && r.height < 12) return; // nur ein Klick, kein Rahmen

      // Ein Ding zählt als „im Rahmen“, wenn seine Mitte darin liegt
      const drin = (d) => {
        const b = d.element.getBoundingClientRect();
        const mx = b.left + b.width / 2, my = b.top + b.height / 2;
        return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
      };
      const alleEdelsteine = dinge.filter((d) => d.istEdelstein).every(drin);
      const keinStein = !dinge.filter((d) => !d.istEdelstein).some(drin);

      if (alleEdelsteine && keinStein) {
        runde++;
        beiRichtig(runde, runden);
        if (runde >= runden) {
          beendet = true;
          raeumeRunde();
          beiFertig();
        } else {
          neueRunde();
        }
      } else {
        beiFehler();
      }
    }

    flaeche.addEventListener("mousedown", druecken);
    window.addEventListener("mousemove", ziehen);
    window.addEventListener("mouseup", loslassen);
    neueRunde();

    return {
      beenden() {
        beendet = true;
        flaeche.removeEventListener("mousedown", druecken);
        window.removeEventListener("mousemove", ziehen);
        window.removeEventListener("mouseup", loslassen);
        if (rahmen) rahmen.remove();
        raeumeRunde();
      },
    };
  },

  zeigeDemo(flaeche, tafel) {
    // Drei Edelsteine und ein Rahmen, der sich langsam aufzieht
    const teile = [[42, 35], [52, 48], [46, 55]].map(([x, y]) => {
      const e = document.createElement("div");
      e.className = "ziel mittig";
      e.style.left = x + "%";
      e.style.top = y + "%";
      e.append(bild("edelstein-gruen", BILD_FAKTOR));
      return e;
    });
    const rahmen = document.createElement("div");
    rahmen.className = "auswahlrahmen";
    rahmen.style.left = "35%";
    rahmen.style.top = "20%";
    flaeche.append(...teile, rahmen);
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, "links", "Linke Taste drücken, halten, ziehen, loslassen.");

    buehne.schleife(6500, [
      [0, () => {
        buehne.setze(35, 20);
        buehne.sage("");
        rahmen.style.transition = "none";
        rahmen.style.width = rahmen.style.height = "0";
      }],
      [700, () => buehne.sage("Drücken und halten")],
      [1700, () => {
        buehne.bewege(60, 70, 2200);
        rahmen.style.transition = "width 2200ms ease-in-out, height 2200ms ease-in-out";
        rahmen.style.width = "25%";
        rahmen.style.height = "50%";
      }],
      [4200, () => buehne.sage("Loslassen!")],
    ]);

    return {
      beenden() {
        buehne.beenden();
        teile.forEach((e) => e.remove());
        rahmen.remove();
      },
    };
  },
};
