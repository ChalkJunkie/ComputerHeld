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
import { STERN, EDELSTEIN, ZIPFEL } from "../../sprites/symbole.js";
import { baueLandschaft } from "./landschaft.js";
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
      <ol class="phasen">${PHASEN.map((p) => `<li>${p}</li>`).join("")}</ol>
    </header>
    <div class="spielbereich">
      <div class="flaeche-rahmen">
        <div class="spielflaeche"></div>
      </div>
      <aside class="hilfe-tafel" hidden></aside>
    </div>
    <footer class="bit-leiste">
      <div class="bit"></div>
      <div class="sprechblase mit-zipfel">
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

  // Landschaft hinter der Spielfläche (Hügel in den Farben der Welt)
  wurzel.querySelector(".flaeche-rahmen").prepend(baueLandschaft({
    welt: optionen.welt,
    boden: 3,
    wolken: [{ x: 8, y: 6, faktor: 5 }, { x: 60, y: 12, faktor: 6 }, { x: 86, y: 4, faktor: 4 }],
    huegel: [{ x: -4, faktor: 5, klein: true }, { x: 58, faktor: 6 }],
    baeume: [{ x: 3, faktor: 4 }, { x: 90, faktor: 5 }],
  }));
  const zipfel = erzeugeSprite(ZIPFEL, { faktor: 4 });
  zipfel.classList.add("zipfel");
  wurzel.querySelector(".bit-leiste .sprechblase").prepend(zipfel);

  /* Zähler: für jede geschaffte Runde leuchtet ein Edelstein auf */
  const steinFarbe = (optionen.welt && optionen.welt.edelstein) || "gruen";
  function zeigeZaehler(geschafft, gesamt) {
    zaehler.dataset.geschafft = geschafft;
    zaehler.dataset.gesamt = gesamt;
    const steine = document.createElement("div");
    steine.className = "zaehler-steine";
    for (let i = 0; i < gesamt; i++) {
      steine.append(erzeugeSprite(EDELSTEIN, { faktor: 2, palette: EDELSTEIN.paletten[i < geschafft ? steinFarbe : "leer"] }));
    }
    const text = document.createElement("div");
    text.className = "zaehler-text";
    text.textContent = `${geschafft} von ${gesamt} geschafft`;
    zaehler.replaceChildren(steine, text);
  }

  // Im Spielbereich soll nie das Menü des Browsers aufgehen
  flaeche.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- kleine Helfer ---------- */
  let laufend = null;      // die gerade laufende Aufgabe oder Vorführung
  let poseTimer = null;

  function setzeBit(pose) {
    clearTimeout(poseTimer);
    bitFeld.replaceChildren(erzeugeSprite(BIT, { pose, faktor: 4 }));
  }
  function bitKurz(pose) { // Pose kurz zeigen, dann wieder auf die Sprechblase zeigen
    setzeBit(pose);
    poseTimer = setTimeout(() => setzeBit("zeigend"), 1200);
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
    zaehler.replaceChildren();
    delete zaehler.dataset.geschafft;
    delete zaehler.dataset.gesamt;
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
    setzeBit("nachdenklich");
  }

  /* ---------- Phase 1: Zeigen ---------- */
  function phaseZeigen() {
    raeumeAuf(true);
    setzePhase(0);
    setzeBit("zeigend");
    sage(level.erklaerung);
    laufend = typ.zeigeDemo(flaeche, tafel, level.gefuehrt || level.selbst);
    knoepfe(["Los geht's!", level.gefuehrt ? phaseUeben : phaseAnwenden]);
  }

  /* ---------- Phase 2 und 3: Aufgabe mit oder ohne Hilfe ---------- */
  function starteAufgabe({ mitHilfe, einstellungen, beiFertig }) {
    raeumeAuf(mitHilfe);
    setzeBit("zeigend");
    sage(level.aufgabe);
    knoepfe(["Tipp von Bit", zeigeHilfe]);

    let fehler = 0;
    let fehlerInFolge = 0;
    const startzeit = performance.now();
    const runden = typ.anzahlRunden ? typ.anzahlRunden(einstellungen) : einstellungen.runden;
    zeigeZaehler(0, runden);

    laufend = typ.starte({
      flaeche,
      tafel: mitHilfe ? tafel : null,
      einstellungen,
      mitHilfe,
      beiAnsage: sage, // der Aufgabentyp darf den Auftrag pro Runde neu ansagen
      // ein freundlicher Hinweis, der NICHT als Fehler zählt
      beiHinweis: (text) => { melde(text); setzeBit("nachdenklich"); },
      beiRichtig(geschafft, gesamt) {
        fehlerInFolge = 0;
        zeigeZaehler(geschafft, gesamt);
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
          setzeBit("aufmunternd"); // „Nicht schlimm!“
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

    // Siegertreppchen: in der Mitte der höchste Stern, links und rechts die anderen
    const buehne = document.createElement("div");
    buehne.className = "auswertung";
    const grosserBit = erzeugeSprite(BIT, { pose: "jubelnd", faktor: 7 });
    grosserBit.classList.add("auswertung-bit");
    const treppchen = document.createElement("div");
    treppchen.className = "treppchen";
    treppchen.setAttribute("role", "img");
    treppchen.setAttribute("aria-label", `${sterne} von 3 Sternen`);
    // Reihenfolge der Sterne auf dem Treppchen: 2. links, 1. Mitte, 3. rechts
    for (const nummer of [2, 1, 3]) {
      const stufe = document.createElement("div");
      stufe.className = "podest podest-" + nummer;
      stufe.append(erzeugeSprite(STERN, { faktor: 7, palette: nummer <= sterne ? STERN.palette : STERN.paletteLeer }));
      const sockel = document.createElement("div");
      sockel.className = "sockel";
      stufe.append(sockel);
      treppchen.append(stufe);
    }
    const info = document.createElement("div");
    info.className = "auswertung-karte";
    info.innerHTML = `<strong class="pixel">Geschafft!</strong>`;
    for (const zeile of [`Fehler: ${fehler}`, `Zeit: ${sekunden} Sekunden`]) {
      const p = document.createElement("p");
      p.textContent = zeile;
      info.append(p);
    }
    if (optionen.edelstein) {
      // Nach dem Boss: der Edelstein der Welt kommt auf die Weltkarte
      const p = document.createElement("p");
      p.className = "auswertung-stein";
      p.append(erzeugeSprite(EDELSTEIN, { faktor: 3, palette: EDELSTEIN.paletten[optionen.edelstein] }), "Edelstein für die Weltkarte!");
      info.append(p);
    }
    buehne.append(grosserBit, treppchen, info);
    flaeche.append(buehne);

    setzeBit(sterne === 3 ? "jubelnd" : "aufmunternd");
    // Ein Level kann einen eigenen Abschlusstext haben (z. B. die letzte Mission)
    sage(level.abschluss || [sterne === 3 ? TEXTE.alleSterne : TEXTE.mehrSterne]);
    const liste = [["Nochmal", phaseAnwenden], ["Zur Welt", optionen.beiZurueck]];
    if (optionen.beiNaechstes) liste.push(["Weiter", optionen.beiNaechstes]);
    knoepfe(...liste);
    // „Weiter“ ist der wichtigste Knopf und wird grün
    const letzter = blasenknoepfe.lastElementChild;
    if (optionen.beiNaechstes && letzter) letzter.classList.add("gross-gruen");
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
