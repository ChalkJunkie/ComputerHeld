/* =====================================================================
   MINI-DESKTOP (gemeinsame Basis für Welt 3 bis 5)
   Fenster, Taskleiste und Startmenü – Windows-ähnlich, aber einfach.
   Bisher enthalten: Fenster öffnen, minimieren, vergrößern/verkleinern,
   schließen, nach vorn holen; Taskleiste; Startmenü.
   (Verschieben, Größe ziehen und Dateien kommen erst, wenn ein Level
   sie braucht.)

   Alles, was das Kind tut, wird zu einer „Aktion“, z. B.
     { art: "schliessen", programm: "malen" }
   Arten: start-auf, start-zu, oeffnen, minimieren, maximieren,
          wiederherstellen, schliessen, taskleiste, aktivieren
   Bevor eine Aktion wirkt, fragt der Desktop den „Prüfer“ (die Aufgabe).
   Sagt der Prüfer false, passiert nichts.
   ===================================================================== */

import { PROGRAMME } from "./programme.js";
import { erzeugeSprite } from "../engine/sprite-render.js";
import {
  SYMBOL_START, KNOPF_MINIMIEREN, KNOPF_MAXIMIEREN, KNOPF_WIEDERHERSTELLEN, KNOPF_SCHLIESSEN,
} from "../../sprites/programme.js";

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  return e;
}

function knopf(klasse, beschriftung, ...inhalt) {
  const k = el("button", klasse);
  k.type = "button";
  k.setAttribute("aria-label", beschriftung);
  k.append(...inhalt);
  return k;
}

/**
 * Baut einen Desktop in "container".
 *   optionen.pruefer(aktion)  – darf die Aktion wirken? (true/false)
 *   optionen.beiAktion(aktion) – wird nach jeder ausgeführten Aktion aufgerufen
 */
export function baueDesktop(container, optionen = {}) {
  const pruefer = optionen.pruefer || (() => true);
  const beiAktion = optionen.beiAktion || (() => {});

  /* ---------- Grundgerüst ---------- */
  const wurzel = el("div", "desktop");
  const flaeche = el("div", "desktop-flaeche");
  const startmenue = el("div", "startmenue");
  const taskleiste = el("div", "taskleiste");
  wurzel.append(flaeche, startmenue, taskleiste);
  container.append(wurzel);

  /* ---------- Zustand ---------- */
  const fenster = new Map();   // Programm -> { element, zustand, vorher, knoepfe }
  let stapel = [];             // Reihenfolge von hinten nach vorn
  let geoeffnet = [];          // Reihenfolge in der Taskleiste
  let aktiv = null;            // vorderstes Fenster
  let startOffen = false;
  let hilfeZiel = null;        // diese Stelle wird beim Üben hervorgehoben
  let hilfeText = "Hier klicken";

  /* ---------- Aktionen ---------- */
  function ausloesen(aktion) {
    if (pruefer(aktion) === false) return;
    fuehreAus(aktion);
    beiAktion(aktion);
  }

  function aktiviere(p) {
    aktiv = p;
    stapel = stapel.filter((x) => x !== p).concat(p);
  }
  function vorderstesSichtbares(ohne) {
    const sichtbar = stapel.filter((x) => x !== ohne && fenster.get(x).zustand !== "minimiert");
    return sichtbar.length ? sichtbar[sichtbar.length - 1] : null;
  }
  function minimiere(p) {
    const f = fenster.get(p);
    f.vorher = f.zustand;
    f.zustand = "minimiert";
    if (aktiv === p) aktiv = vorderstesSichtbares(p);
  }

  function fuehreAus(aktion) {
    const { art, programm: p } = aktion;
    const f = fenster.get(p);
    switch (art) {
      case "start-auf": startOffen = true; break;
      case "start-zu": startOffen = false; break;
      case "oeffnen":
        startOffen = false;
        if (!fenster.has(p)) erstelleFenster(p, "normal");
        else if (fenster.get(p).zustand === "minimiert") fenster.get(p).zustand = fenster.get(p).vorher || "normal";
        aktiviere(p);
        break;
      case "minimieren": minimiere(p); break;
      case "maximieren": f.zustand = "maximiert"; aktiviere(p); break;
      case "wiederherstellen": f.zustand = "normal"; aktiviere(p); break;
      case "schliessen":
        f.element.remove();
        fenster.delete(p);
        stapel = stapel.filter((x) => x !== p);
        geoeffnet = geoeffnet.filter((x) => x !== p);
        if (aktiv === p) aktiv = vorderstesSichtbares(p);
        break;
      case "taskleiste":
        // wie bei Windows: minimiert -> wieder da; hinten -> nach vorn; vorn -> minimieren
        if (f.zustand === "minimiert") {
          f.zustand = f.vorher || "normal";
          aktiviere(p);
        } else if (aktiv === p) minimiere(p);
        else aktiviere(p);
        break;
      case "aktivieren": aktiviere(p); break;
    }
    zeichne();
  }

  /* ---------- Fenster ---------- */
  function erstelleFenster(p, zustand) {
    const prog = PROGRAMME[p];
    const nummer = Object.keys(PROGRAMME).indexOf(p);
    const element = el("div", "fenster");
    element.dataset.programm = p;
    // jedes Programm hat seinen eigenen Platz, leicht versetzt
    element.style.left = 4 + nummer * 9 + "%";
    element.style.top = 4 + nummer * 6 + "%";

    const titel = el("div", "fenster-titel");
    titel.append(erzeugeSprite(prog.symbol, { faktor: 2 }), el("span", "fenster-name", prog.name));
    const knoepfe = {
      minimieren: knopf("fenster-knopf", "Minimieren", erzeugeSprite(KNOPF_MINIMIEREN, { faktor: 2 })),
      groesse: knopf("fenster-knopf", "Maximieren"),
      schliessen: knopf("fenster-knopf schliessen", "Schließen", erzeugeSprite(KNOPF_SCHLIESSEN, { faktor: 2 })),
    };
    const leiste = el("div", "fenster-knoepfe");
    leiste.append(knoepfe.minimieren, knoepfe.groesse, knoepfe.schliessen);
    titel.append(leiste);
    const inhalt = el("div", "fenster-inhalt");
    inhalt.append(prog.inhalt());
    element.append(titel, inhalt);

    // Klick auf einen Fensterknopf soll nicht zusätzlich „Fenster anklicken“ sein
    for (const k of Object.values(knoepfe)) k.addEventListener("mousedown", (e) => e.stopPropagation());
    knoepfe.minimieren.addEventListener("click", () => ausloesen({ art: "minimieren", programm: p }));
    knoepfe.groesse.addEventListener("click", () => {
      const art = fenster.get(p).zustand === "maximiert" ? "wiederherstellen" : "maximieren";
      ausloesen({ art, programm: p });
    });
    knoepfe.schliessen.addEventListener("click", () => ausloesen({ art: "schliessen", programm: p }));
    element.addEventListener("mousedown", () => {
      if (aktiv !== p) ausloesen({ art: "aktivieren", programm: p });
    });

    flaeche.append(element);
    fenster.set(p, { element, zustand, vorher: "normal", knoepfe });
    stapel.push(p);
    geoeffnet.push(p);
  }

  /* ---------- Startmenü ---------- */
  const kacheln = {};
  startmenue.append(el("div", "startmenue-titel", "Programme"));
  const kachelFeld = el("div", "startmenue-kacheln");
  for (const [p, prog] of Object.entries(PROGRAMME)) {
    const k = knopf("start-kachel", prog.name, erzeugeSprite(prog.symbol, { faktor: 3 }), el("span", "", prog.name));
    k.addEventListener("click", () => ausloesen({ art: "oeffnen", programm: p }));
    kacheln[p] = k;
    kachelFeld.append(k);
  }
  startmenue.append(kachelFeld);

  // Klick daneben schließt das Startmenü
  flaeche.addEventListener("mousedown", () => {
    if (startOffen) ausloesen({ art: "start-zu" });
  });

  /* ---------- Taskleiste ---------- */
  const startKnopf = knopf("task-knopf start-knopf", "Start", erzeugeSprite(SYMBOL_START, { faktor: 2 }), el("span", "", "Start"));
  startKnopf.addEventListener("click", () => ausloesen({ art: startOffen ? "start-zu" : "start-auf" }));
  const taskKnoepfe = {};

  /* ---------- Zeichnen ---------- */
  function zeichne() {
    stapel.forEach((p, i) => {
      const f = fenster.get(p);
      f.element.style.zIndex = i + 1;
      f.element.classList.toggle("aktiv", p === aktiv);
      f.element.classList.toggle("maximiert", f.zustand === "maximiert");
      f.element.classList.toggle("minimiert", f.zustand === "minimiert");
      const maxi = f.zustand === "maximiert";
      f.knoepfe.groesse.replaceChildren(erzeugeSprite(maxi ? KNOPF_WIEDERHERSTELLEN : KNOPF_MAXIMIEREN, { faktor: 2 }));
      f.knoepfe.groesse.setAttribute("aria-label", maxi ? "Verkleinern" : "Maximieren");
    });

    startmenue.hidden = !startOffen;
    startKnopf.classList.toggle("aktiv", startOffen);

    taskleiste.replaceChildren(startKnopf);
    for (const p of geoeffnet) {
      if (!taskKnoepfe[p]) {
        const prog = PROGRAMME[p];
        taskKnoepfe[p] = knopf("task-knopf", prog.name, erzeugeSprite(prog.symbol, { faktor: 2 }), el("span", "", prog.name));
        taskKnoepfe[p].addEventListener("click", () => ausloesen({ art: "taskleiste", programm: p }));
      }
      taskKnoepfe[p].classList.toggle("aktiv", p === aktiv);
      taskleiste.append(taskKnoepfe[p]);
    }

    // Hilfe: Stelle zum Klicken hervorheben
    wurzel.querySelectorAll(".mit-hilfe").forEach((e) => e.classList.remove("mit-hilfe"));
    wurzel.querySelectorAll(".desktop-schild").forEach((e) => e.remove());
    const ziel = hilfeZiel && elementFuer(hilfeZiel);
    if (ziel) {
      ziel.classList.add("mit-hilfe");
      const schild = el("span", "desktop-schild", hilfeText);
      // bei Fensterknöpfen unter dem Knopf, sonst darüber
      if (ziel.classList.contains("fenster-knopf")) schild.classList.add("unten");
      ziel.append(schild);
    }
  }

  /* Welches Element gehört zu einer Aktion? (für Hilfe und Vorführung) */
  function elementFuer(aktion) {
    const { art, programm: p } = aktion;
    const f = fenster.get(p);
    switch (art) {
      case "start-auf": case "start-zu": return startKnopf;
      case "oeffnen": return startOffen ? kacheln[p] : startKnopf;
      case "taskleiste": return taskKnoepfe[p] && geoeffnet.includes(p) ? taskKnoepfe[p] : null;
      case "minimieren": return f && f.knoepfe.minimieren;
      case "maximieren": case "wiederherstellen": return f && f.knoepfe.groesse;
      case "schliessen": return f && f.knoepfe.schliessen;
      case "aktivieren": return f && f.element;
      default: return null;
    }
  }

  return {
    element: wurzel,

    /* Anfangszustand setzen, z. B.
       { offen: [{ programm: "malen", zustand: "maximiert" }], aktiv: "malen" } */
    setze(start = {}) {
      for (const f of fenster.values()) f.element.remove();
      fenster.clear();
      stapel = [];
      geoeffnet = [];
      startOffen = false;
      for (const { programm, zustand = "normal" } of start.offen || []) erstelleFenster(programm, zustand);
      aktiv = start.aktiv || vorderstesSichtbares(null);
      if (aktiv) aktiviere(aktiv);
      zeichne();
    },

    fuehreAus,   // Aktion ohne Prüfer ausführen (für Bits Vorführung)
    elementFuer,

    /* Ist dieses Fenster gerade vorn und sichtbar? */
    istVorn(p) {
      return aktiv === p && fenster.has(p) && fenster.get(p).zustand !== "minimiert";
    },

    /* Stelle hervorheben (oder null = keine Hilfe) */
    setzeHilfe(aktion, text = "Hier klicken") {
      hilfeZiel = aktion;
      hilfeText = text;
      zeichne();
    },

    beenden() {
      wurzel.remove();
    },
  };
}
