/* =====================================================================
   AUFGABENTYP „ZIELSCHEIBEN“
   Ein Ding erscheint an einer zufälligen Stelle. Das Kind zeigt darauf,
   klickt es an oder doppelklickt es – dann kommt das nächste.

   Einstellungen (aus den Level-Daten):
     runden     – wie viele Dinge
     groesse    – Vergrößerung des Bildes
     bild       – welches Bild (Standard "zielscheibe", siehe hilfsmittel.js)
     ausloeser  – "zeigen" (draufzeigen und warten), "klick" oder "doppelklick"
     haltezeit  – nur bei "zeigen": Millisekunden, die der Zeiger bleiben muss

   Jeder Aufgabentyp hat dieselben zwei Funktionen:
     starte(...)    – baut die Aufgabe in die Spielfläche
     zeigeDemo(...) – kleine Vorführung für Bits Erklärung
   Beide geben ein Objekt mit beenden() zurück, das alles wieder aufräumt.
   ===================================================================== */

import { bild, zufallsPlatz, zeigeMaus, schild, demoBuehne } from "./hilfsmittel.js";

/* Wer kürzer als so viele Millisekunden über das Ziel huscht, hat nur
   „gestreift“ – das zählt nicht als Fehler. */
const STREIFEN_MS = 200;
/* So lange wird nach einem einzelnen Klick auf den zweiten Klick gewartet. */
const DOPPELKLICK_WARTEN_MS = 600;

/* Texte der Hilfe je Auslöser: [Schild am Ziel, Teil der Maus, Text zur Maus] */
const HILFE = {
  zeigen:      ["Hierhin!", "normal", "Nur zeigen, nicht klicken."],
  klick:       ["Klick mich!", "links", "Linke Taste: einmal kurz drücken."],
  doppelklick: ["Zweimal schnell!", "links", "Linke Taste: zweimal schnell drücken."],
};

function baueZiel(einstellungen) {
  const ziel = document.createElement("div");
  ziel.className = "ziel";
  ziel.append(bild(einstellungen.bild || "zielscheibe", einstellungen.groesse));
  if (einstellungen.ausloeser === "zeigen") {
    const balken = document.createElement("div");
    balken.className = "haltebalken";
    balken.innerHTML = "<div></div>";
    ziel.append(balken);
  }
  return ziel;
}

export const zielscheiben = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig }) {
    const { runden, ausloeser, haltezeit = 700 } = einstellungen;
    let runde = 0;
    let ziel = null;
    let letzteStelle = null;
    let timer = null;
    let betretenUm = 0;
    let beendet = false;

    if (mitHilfe) zeigeMaus(tafel, HILFE[ausloeser][1], HILFE[ausloeser][2]);

    function naechstesZiel() {
      if (beendet) return;
      ziel = baueZiel(einstellungen);
      const canvas = ziel.querySelector("canvas");
      const stelle = zufallsPlatz(flaeche, canvas.width, canvas.height + 20, {
        oben: mitHilfe ? 64 : 24, // Platz für das Schild
        fern: letzteStelle,
      });
      letzteStelle = stelle;
      ziel.style.left = stelle.x + "px";
      ziel.style.top = stelle.y + "px";
      if (mitHilfe) {
        ziel.classList.add("mit-hilfe");
        ziel.append(schild(HILFE[ausloeser][0]));
      }

      if (ausloeser === "zeigen") {
        const balken = ziel.querySelector(".haltebalken div");
        ziel.addEventListener("mouseenter", () => {
          betretenUm = performance.now();
          // Balken füllt sich, solange der Zeiger auf dem Ziel bleibt
          balken.style.transition = `width ${haltezeit}ms linear`;
          balken.style.width = "100%";
          timer = setTimeout(getroffen, haltezeit);
        });
        ziel.addEventListener("mouseleave", () => {
          if (!timer) return;
          clearTimeout(timer);
          timer = null;
          balken.style.transition = "none";
          balken.style.width = "0";
          if (performance.now() - betretenUm >= STREIFEN_MS) beiFehler();
        });
      } else if (ausloeser === "klick") {
        ziel.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return; // nur die linke Taste zählt
          e.stopPropagation();
          getroffen();
        });
      } else {
        // Doppelklick: Bleibt es bei einem einzelnen Klick, war es zu langsam.
        ziel.addEventListener("click", (e) => {
          if (e.detail !== 1) return;
          clearTimeout(timer);
          timer = setTimeout(beiFehler, DOPPELKLICK_WARTEN_MS);
        });
        ziel.addEventListener("dblclick", () => {
          clearTimeout(timer);
          getroffen();
        });
      }
      flaeche.append(ziel);
    }

    function getroffen() {
      timer = null;
      ziel.remove();
      runde++;
      beiRichtig(runde, runden);
      if (runde >= runden) {
        beendet = true;
        beiFertig();
      } else {
        naechstesZiel();
      }
    }

    // Bei "klick" zählt ein Klick neben das Ziel als Fehler
    function danebenGeklickt(e) {
      if (ausloeser === "klick" && e.button === 0 && !beendet) beiFehler();
    }
    flaeche.addEventListener("mousedown", danebenGeklickt);

    naechstesZiel();

    return {
      beenden() {
        beendet = true;
        clearTimeout(timer);
        flaeche.removeEventListener("mousedown", danebenGeklickt);
        if (ziel) ziel.remove();
      },
    };
  },

  /* Vorführung: Der gezeichnete Mauszeiger wandert zum Ziel und zeigt,
     was dort zu tun ist. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const ausloeser = einstellungen.ausloeser;
    const ziel = baueZiel({ ...einstellungen, groesse: 6 });
    ziel.classList.add("mittig");
    ziel.style.left = "60%";
    ziel.style.top = "45%";
    flaeche.append(ziel);
    const balken = ziel.querySelector(".haltebalken div");
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, HILFE[ausloeser][1], HILFE[ausloeser][2]);

    buehne.schleife(5500, [
      [0, () => {
        buehne.setze(20, 75);
        buehne.sage("");
        ziel.style.visibility = "visible";
        if (balken) { balken.style.transition = "none"; balken.style.width = "0"; }
      }],
      [400, () => buehne.bewege(60, 45, 1800)],
      [2400, () => {
        if (ausloeser === "zeigen") {
          balken.style.transition = "width 900ms linear";
          balken.style.width = "100%";
        } else {
          buehne.sage("Klick!");
        }
      }],
      [2800, () => { if (ausloeser === "doppelklick") buehne.sage("Klick! Klick!"); }],
      [3500, () => { ziel.style.visibility = "hidden"; }],
    ]);

    return {
      beenden() {
        buehne.beenden();
        ziel.remove();
      },
    };
  },
};
