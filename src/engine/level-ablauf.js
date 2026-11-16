/* =====================================================================
   LEVEL-SCHABLONE
   Jedes Level läuft gleich ab:
     1. Zeigen     – Bit erklärt und führt vor
     2. Üben       – Aufgabe mit sichtbarer Hilfe
     3. Anwenden   – Aufgabe ohne Hilfe, Fehler und Zeit werden gezählt
     4. Sterne     – Auswertung
   Wer das Level schon geschafft hat, startet gleich bei „Anwenden“.
   Hat ein Level keinen Abschnitt "gefuehrt" (Boss), entfällt das Üben.

   Was im Level passiert, steht in den Level-Daten (src/levels/).
   Wie eine Aufgabe funktioniert, steht im Aufgabentyp (src/engine/aufgaben/).
   ===================================================================== */

import { BIT } from "../../sprites/bit.js";
import { STERN } from "../../sprites/symbole.js";
import { erzeugeSprite } from "./sprite-render.js";
import { AUFGABENTYPEN } from "./aufgaben/index.js";
import { TEXTE, FEHLER_BIS_HILFE } from "../daten/texte.js";

const PHASEN = ["Zeigen", "Üben", "Anwenden", "Sterne"];

function zufall(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

/* Berechnet die Sterne nach den Kriterien aus den Level-Daten.
   Tempo allein bringt nie einen Stern: Für den dritten Stern braucht es
   wenig Fehler UND eine gute Zeit. */
export function berechneSterne(kriterien, fehler, sekunden) {
  if (fehler <= kriterien.fehlerFuerDrei && sekunden <= kriterien.sekundenFuerDrei) return 3;
  if (fehler <= kriterien.fehlerFuerZwei) return 2;
  return 1;
}

/**
 * Startet ein Level.
 *   wurzel   – das Element, in das der Level-Bildschirm gebaut wird
 *   level    – Level-Daten (mit id)
 *   optionen – schonGeschafft:   true = Erklärung und Üben überspringen
 *              beiErgebnis(n):   wird mit der Sternezahl aufgerufen
 *              beiZurueck():     Knopf „Zurück“
 *              beiNaechstes():   Knopf „Nächstes Level“ (darf fehlen)
 * Rückgabe: Objekt mit beenden(), das alles aufräumt.
 */
export function starteLevel(wurzel, level, optionen) {
  const typ = AUFGABENTYPEN[level.typ];
  if (!typ) throw new Error("Unbekannter Aufgabentyp: " + level.typ);

  /* ---------- Bildschirm aufbauen ---------- */
  wurzel.innerHTML = `
    <header class="kopf">
      <button class="knopf klein" type="button" data-zurueck>Zurück</button>
      <h1 class="pixel"></h1>
      <ol class="phasen">${PHASEN.map((p, i) => `<li>${i + 1} ${p}</li>`).join("")}</ol>
    </header>
    <div class="spielbereich">
      <div class="spielflaeche"></div>
      <aside class="hilfe-tafel" hidden></aside>
    </div>
    <footer class="bit-leiste">
      <div class="bit"></div>
      <div class="sprechblase">
        <div class="blasentext" aria-live="polite">
          <div class="ansage"></div>
          <p class="rueckmeldung"></p>
        </div>
        <div class="blasenknoepfe"></div>
      </div>
      <div class="zaehler pixel"></div>
    </footer>`;
  wurzel.querySelector("h1").textContent = `${level.id} ${level.titel}`;
  const flaeche = wurzel.querySelector(".spielflaeche");
  const tafel = wurzel.querySelector(".hilfe-tafel");
  const bitFeld = wurzel.querySelector(".bit");
  const ansage = wurzel.querySelector(".ansage");
  const rueckmeldung = wurzel.querySelector(".rueckmeldung");
  const blasenknoepfe = wurzel.querySelector(".blasenknoepfe");
  const zaehler = wurzel.querySelector(".zaehler");
  wurzel.querySelector("[data-zurueck]").addEventListener("click", optionen.beiZurueck);

  // Im Spielbereich soll nie das Menü des Browsers aufgehen
  flaeche.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- kleine Helfer ---------- */
  let laufend = null;      // die gerade laufende Aufgabe oder Vorführung
  let poseTimer = null;

  function setzeBit(pose) {
    clearTimeout(poseTimer);
    bitFeld.replaceChildren(erzeugeSprite(BIT, { pose, faktor: 4 }));
  }
  function bitKurz(pose) { // Pose kurz zeigen, dann wieder normal stehen
    setzeBit(pose);
    poseTimer = setTimeout(() => setzeBit("stehend"), 1200);
  }
  /* sage(): der eigentliche Auftrag – bleibt stehen, bis ein neuer kommt.
     melde(): kurze Rückmeldung darunter (Lob, Trost, Tipp). */
  function sage(absaetze) {
    const liste = Array.isArray(absaetze) ? absaetze : [absaetze];
    ansage.replaceChildren(...liste.map((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    }));
    rueckmeldung.textContent = "";
  }
  function melde(text) {
    rueckmeldung.textContent = text;
  }
  function knoepfe(...liste) { // liste: [Beschriftung, Funktion], …
    blasenknoepfe.replaceChildren(...liste.map(([text, aktion]) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "knopf";
      knopf.textContent = text;
      knopf.addEventListener("click", aktion);
      return knopf;
    }));
  }
  function setzePhase(nummer) {
    wurzel.querySelectorAll(".phasen li").forEach((li, i) => {
      li.classList.toggle("aktiv", i === nummer);
      li.classList.toggle("erledigt", i < nummer);
      if (i === nummer) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
  }
  /* Räumt die Spielfläche. mitTafel = true blendet die Hilfe-Tafel
     (Bild der Maus neben der Spielfläche) ein. */
  function raeumeAuf(mitTafel = false) {
    if (laufend) laufend.beenden();
    laufend = null;
    flaeche.replaceChildren();
    tafel.replaceChildren();
    tafel.hidden = !mitTafel;
    zaehler.textContent = "";
  }

  /* ---------- Hilfe in Stufen ---------- */
  let hilfeStufe = 0;
  function zeigeHilfe() {
    if (hilfeStufe < level.hilfen.length) {
      melde("Tipp: " + level.hilfen[hilfeStufe]);
      hilfeStufe++;
    } else {
      melde(TEXTE.keineHilfeMehr);
    }
    setzeBit("winkend");
  }

  /* ---------- Phase 1: Zeigen ---------- */
  function phaseZeigen() {
    raeumeAuf(true);
    setzePhase(0);
    setzeBit("winkend");
    sage(level.erklaerung);
    laufend = typ.zeigeDemo(flaeche, tafel, level.gefuehrt || level.selbst);
    knoepfe(["Los geht's!", level.gefuehrt ? phaseUeben : phaseAnwenden]);
  }

  /* ---------- Phase 2 und 3: Aufgabe mit oder ohne Hilfe ---------- */
  function starteAufgabe({ mitHilfe, einstellungen, beiFertig }) {
    raeumeAuf(mitHilfe);
    setzeBit("stehend");
    sage(level.aufgabe);
    knoepfe(["Tipp von Bit", zeigeHilfe]);

    let fehler = 0;
    let fehlerInFolge = 0;
    const startzeit = performance.now();
    const runden = typ.anzahlRunden ? typ.anzahlRunden(einstellungen) : einstellungen.runden;
    zaehler.textContent = `0 / ${runden}`;

    laufend = typ.starte({
      flaeche,
      tafel: mitHilfe ? tafel : null,
      einstellungen,
      mitHilfe,
      beiAnsage: sage, // der Aufgabentyp darf den Auftrag pro Runde neu ansagen
      beiRichtig(geschafft, gesamt) {
        fehlerInFolge = 0;
        zaehler.textContent = `${geschafft} / ${gesamt}`;
        melde(zufall(TEXTE.lob));
        bitKurz("jubelnd");
      },
      /* hinweis (darf fehlen): ein genauer Tipp vom Aufgabentyp,
         z. B. „Halte dabei die Strg-Taste gedrückt.“ */
      beiFehler(hinweis) {
        fehler++;
        fehlerInFolge++;
        // Nach mehreren Fehlern hintereinander hilft Bit von selbst weiter
        if (fehlerInFolge >= FEHLER_BIS_HILFE && hilfeStufe < level.hilfen.length) {
          fehlerInFolge = 0;
          zeigeHilfe();
        } else {
          melde(hinweis || zufall(TEXTE.trost));
          setzeBit("stehend");
        }
      },
      beiFertig() {
        const sekunden = Math.round((performance.now() - startzeit) / 1000);
        beiFertig(fehler, sekunden);
      },
    });
  }

  function phaseUeben() {
    setzePhase(1);
    hilfeStufe = 0;
    starteAufgabe({
      mitHilfe: true,
      einstellungen: level.gefuehrt,
      beiFertig() {
        raeumeAuf();
        setzeBit("jubelnd");
        sage(TEXTE.nachDemUeben);
        knoepfe(["Weiter", phaseAnwenden]);
      },
    });
  }

  function phaseAnwenden() {
    setzePhase(2);
    hilfeStufe = 0;
    starteAufgabe({
      mitHilfe: false,
      einstellungen: level.selbst,
      beiFertig: phaseSterne,
    });
  }

  /* ---------- Phase 4: Auswertung ---------- */
  function phaseSterne(fehler, sekunden) {
    raeumeAuf();
    setzePhase(3);
    const sterne = berechneSterne(level.sterne, fehler, sekunden);
    optionen.beiErgebnis(sterne);

    const karte = document.createElement("div");
    karte.className = "auswertung";
    const reihe = document.createElement("div");
    reihe.className = "sternreihe";
    reihe.setAttribute("role", "img");
    reihe.setAttribute("aria-label", `${sterne} von 3 Sternen`);
    for (let i = 1; i <= 3; i++) {
      reihe.append(erzeugeSprite(STERN, {
        faktor: 6,
        palette: i <= sterne ? STERN.palette : STERN.paletteLeer,
      }));
    }
    const zahlen = document.createElement("p");
    zahlen.textContent = `Fehler: ${fehler} · Zeit: ${sekunden} Sekunden`;
    karte.append(reihe, zahlen);
    flaeche.append(karte);

    setzeBit("jubelnd");
    sage([TEXTE.geschafft, sterne === 3 ? TEXTE.alleSterne : TEXTE.mehrSterne]);
    const liste = [["Nochmal spielen", phaseAnwenden], ["Zurück zur Welt", optionen.beiZurueck]];
    if (optionen.beiNaechstes) liste.push(["Nächstes Level", optionen.beiNaechstes]);
    knoepfe(...liste);
  }

  /* ---------- Los ---------- */
  if (optionen.schonGeschafft) {
    phaseAnwenden();
    // Wer mag, kann sich die Erklärung noch einmal ansehen
    const nochmal = document.createElement("button");
    nochmal.type = "button";
    nochmal.className = "knopf";
    nochmal.textContent = "Erklärung ansehen";
    nochmal.addEventListener("click", phaseZeigen);
    blasenknoepfe.append(nochmal);
  } else {
    phaseZeigen();
  }

  return {
    beenden() {
      clearTimeout(poseTimer);
      raeumeAuf();
    },
  };
}
