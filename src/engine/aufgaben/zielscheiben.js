/* =====================================================================
   AUFGABENTYP „ZIELSCHEIBEN“
   Eine Zielscheibe erscheint an einer zufälligen Stelle. Das Kind zeigt
   mit dem Mauszeiger darauf (oder klickt sie an), dann kommt die nächste.

   Einstellungen (aus den Level-Daten):
     runden     – wie viele Zielscheiben
     groesse    – Vergrößerung der Zielscheibe (16 Pixel x groesse)
     ausloeser  – "zeigen" (draufzeigen und warten) oder "klick"
     haltezeit  – nur bei "zeigen": Millisekunden, die der Zeiger bleiben muss

   Jeder Aufgabentyp hat dieselben zwei Funktionen:
     starte(...)    – baut die Aufgabe in die Spielfläche
     zeigeDemo(...) – kleine Vorführung für Bits Erklärung
   Beide geben ein Objekt mit beenden() zurück, das alles wieder aufräumt.
   ===================================================================== */

import { ZIELSCHEIBE, ZEIGER } from "../../../sprites/symbole.js";
import { erzeugeSprite } from "../sprite-render.js";

/* Wer kürzer als so viele Millisekunden über das Ziel huscht, hat nur
   „gestreift“ – das zählt nicht als Fehler. */
const STREIFEN_MS = 200;
/* Mindestabstand (in Bildschirmpunkten) zwischen zwei Zielen hintereinander */
const MINDESTABSTAND = 250;

function baueZiel(groesse) {
  const ziel = document.createElement("div");
  ziel.className = "ziel";
  ziel.append(erzeugeSprite(ZIELSCHEIBE, { faktor: groesse }));
  const balken = document.createElement("div");
  balken.className = "haltebalken";
  balken.innerHTML = "<div></div>";
  ziel.append(balken);
  return ziel;
}

export const zielscheiben = {

  starte({ flaeche, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig }) {
    const { runden, groesse, ausloeser, haltezeit = 700 } = einstellungen;
    const kante = 16 * groesse; // Seitenlänge der Zielscheibe
    let runde = 0;
    let ziel = null;
    let letztePosition = null;
    let halteTimer = null;
    let betretenUm = 0;
    let beendet = false;

    function zufallsPosition() {
      const rand = 24;
      const platzOben = mitHilfe ? 60 : rand; // Platz für das Schild „Hierhin!“
      const breite = flaeche.clientWidth - kante - 2 * rand;
      const hoehe = flaeche.clientHeight - kante - platzOben - rand - 20;
      let position;
      for (let versuch = 0; versuch < 30; versuch++) {
        position = {
          x: rand + Math.random() * Math.max(0, breite),
          y: platzOben + Math.random() * Math.max(0, hoehe),
        };
        if (!letztePosition) break;
        const abstand = Math.hypot(position.x - letztePosition.x, position.y - letztePosition.y);
        if (abstand >= MINDESTABSTAND) break;
      }
      letztePosition = position;
      return position;
    }

    function naechstesZiel() {
      if (beendet) return;
      ziel = baueZiel(groesse);
      const position = zufallsPosition();
      ziel.style.left = position.x + "px";
      ziel.style.top = position.y + "px";
      if (mitHilfe) {
        ziel.classList.add("mit-hilfe");
        const schild = document.createElement("div");
        schild.className = "ziel-schild";
        schild.textContent = "Hierhin!";
        ziel.append(schild);
      }
      const balken = ziel.querySelector(".haltebalken div");

      if (ausloeser === "zeigen") {
        ziel.addEventListener("mouseenter", () => {
          betretenUm = performance.now();
          // Balken füllt sich, solange der Zeiger auf dem Ziel bleibt
          balken.style.transition = `width ${haltezeit}ms linear`;
          balken.style.width = "100%";
          halteTimer = setTimeout(getroffen, haltezeit);
        });
        ziel.addEventListener("mouseleave", () => {
          if (!halteTimer) return;
          clearTimeout(halteTimer);
          halteTimer = null;
          balken.style.transition = "none";
          balken.style.width = "0";
          if (performance.now() - betretenUm >= STREIFEN_MS) beiFehler();
        });
      } else {
        ziel.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return; // nur die linke Taste zählt
          e.stopPropagation();
          getroffen();
        });
      }
      flaeche.append(ziel);
    }

    function getroffen() {
      halteTimer = null;
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
        clearTimeout(halteTimer);
        flaeche.removeEventListener("mousedown", danebenGeklickt);
        if (ziel) ziel.remove();
      },
    };
  },

  /* Vorführung: Ein gezeichneter Mauszeiger wandert langsam zur Zielscheibe,
     der Balken füllt sich, dann beginnt es von vorn. */
  zeigeDemo(flaeche) {
    const ziel = baueZiel(6);
    ziel.style.left = "calc(60% - 48px)";
    ziel.style.top = "calc(45% - 48px)";
    const balken = ziel.querySelector(".haltebalken div");
    const zeiger = erzeugeSprite(ZEIGER, { faktor: 4 });
    zeiger.classList.add("demo-zeiger");
    flaeche.append(ziel, zeiger);

    const timer = [];
    function durchlauf() {
      // Startpunkt links unten, ohne Bewegung
      zeiger.style.transition = "none";
      zeiger.style.left = "20%";
      zeiger.style.top = "75%";
      balken.style.transition = "none";
      balken.style.width = "0";
      // kurz darauf langsam zur Mitte der Zielscheibe wandern
      timer[0] = setTimeout(() => {
        zeiger.style.transition = "left 1800ms ease-in-out, top 1800ms ease-in-out";
        zeiger.style.left = "60%";
        zeiger.style.top = "45%";
      }, 400);
      // angekommen: Balken füllt sich
      timer[1] = setTimeout(() => {
        balken.style.transition = "width 900ms linear";
        balken.style.width = "100%";
      }, 2300);
    }
    durchlauf();
    const wiederholung = setInterval(durchlauf, 5000);

    return {
      beenden() {
        clearInterval(wiederholung);
        timer.forEach(clearTimeout);
        ziel.remove();
        zeiger.remove();
      },
    };
  },
};
