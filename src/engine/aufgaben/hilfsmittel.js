/* =====================================================================
   HILFSMITTEL für alle Aufgabentypen
   - bild():         fertiges Pixelbild nach Namen (z. B. "kiste-rot")
   - zufallsPlatz(): freie Stelle in der Spielfläche
   - zeigeMaus():    Bild der Computer-Maus mit hervorgehobener Taste
   - demoBuehne():   wandernder Mauszeiger für Bits Vorführungen
   ===================================================================== */

import {
  ZIELSCHEIBE, KISTE, EDELSTEIN, STEIN, ZEIGER, MAUSGERAET,
} from "../../../sprites/symbole.js";
import { erzeugeSprite } from "../sprite-render.js";

/* Diese Namen dürfen in den Level-Daten bei "bild" stehen.
   Rechts: Sprite und (falls es mehrere Farben gibt) der Name der Palette. */
const BILDER = {
  "zielscheibe":     [ZIELSCHEIBE],
  "kiste":           [KISTE, "braun"],
  "kiste-rot":       [KISTE, "rot"],
  "kiste-blau":      [KISTE, "blau"],
  "edelstein-rot":   [EDELSTEIN, "rot"],
  "edelstein-blau":  [EDELSTEIN, "blau"],
  "edelstein-gruen": [EDELSTEIN, "gruen"],
  "stein":           [STEIN],
};

export function bild(name, faktor) {
  const eintrag = BILDER[name];
  if (!eintrag) throw new Error("Unbekanntes Bild: " + name);
  const [sprite, palette] = eintrag;
  return erzeugeSprite(sprite, { faktor, palette: palette ? sprite.paletten[palette] : sprite.palette });
}

export function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

/* Sucht eine zufällige Stelle für ein Ding der Größe breite x hoehe.
   optionen.oben / unten – freizuhaltender Rand
   optionen.fern         – Stelle, von der Abstand gehalten werden soll
   optionen.abstand      – wie viel Abstand (Standard 250)
   optionen.bisAnteil    – nur den linken Teil der Fläche nutzen (0 bis 1) */
export function zufallsPlatz(flaeche, breite, hoehe, optionen = {}) {
  const { oben = 24, unten = 44, fern = null, abstand = 250, bisAnteil = 1 } = optionen;
  const rand = 24;
  const platzX = Math.max(0, flaeche.clientWidth * bisAnteil - breite - 2 * rand);
  const platzY = Math.max(0, flaeche.clientHeight - hoehe - oben - unten);
  let stelle;
  for (let versuch = 0; versuch < 30; versuch++) {
    stelle = { x: rand + Math.random() * platzX, y: oben + Math.random() * platzY };
    if (!fern || Math.hypot(stelle.x - fern.x, stelle.y - fern.y) >= abstand) break;
  }
  return stelle;
}

/* Zeigt auf der Hilfe-Tafel neben der Spielfläche die Computer-Maus.
   teil: "links", "rechts", "rad" oder "normal" – dieser Teil wird gelb.
   Gibt es keine Tafel (Phase „Anwenden“), passiert nichts. */
export function zeigeMaus(tafel, teil, text) {
  if (!tafel) return;
  const beschriftung = document.createElement("p");
  beschriftung.textContent = text;
  tafel.replaceChildren(
    erzeugeSprite(MAUSGERAET, { faktor: 6, palette: MAUSGERAET.paletten[teil] }),
    beschriftung,
  );
}

/* Kleines Schild an einem Ding (z. B. „Klick mich!“) */
export function schild(text) {
  const element = document.createElement("div");
  element.className = "ziel-schild";
  element.textContent = text;
  return element;
}

/* Bühne für Vorführungen: ein gezeichneter Mauszeiger, der sich langsam
   bewegt, und ein Schild daneben. Positionen in Prozent der Spielfläche.
   schleife(dauer, schritte): schritte = [[Millisekunden, Funktion], …],
   nach "dauer" Millisekunden beginnt alles von vorn. */
export function demoBuehne(flaeche) {
  const zeiger = erzeugeSprite(ZEIGER, { faktor: 4 });
  zeiger.classList.add("demo-zeiger");
  const text = document.createElement("div");
  text.className = "demo-schild";
  text.hidden = true;
  flaeche.append(zeiger, text);
  let timer = [];
  let wiederholung = null;

  function stelle(x, y) {
    zeiger.style.left = x + "%";
    zeiger.style.top = y + "%";
    text.style.left = `calc(${x}% + 56px)`;
    text.style.top = `calc(${y}% + 8px)`;
  }
  return {
    setze(x, y) { // sofort an eine Stelle springen
      zeiger.style.transition = text.style.transition = "none";
      stelle(x, y);
    },
    bewege(x, y, ms) { // langsam an eine Stelle wandern
      zeiger.style.transition = text.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`;
      stelle(x, y);
    },
    sage(inhalt) { // Schild neben dem Zeiger; leerer Text = Schild weg
      text.textContent = inhalt;
      text.hidden = !inhalt;
    },
    schleife(dauer, schritte) {
      const durchlauf = () => {
        timer.forEach(clearTimeout);
        timer = schritte.map(([ms, tu]) => setTimeout(tu, ms));
      };
      durchlauf();
      wiederholung = setInterval(durchlauf, dauer);
    },
    beenden() {
      clearInterval(wiederholung);
      timer.forEach(clearTimeout);
      zeiger.remove();
      text.remove();
    },
  };
}
