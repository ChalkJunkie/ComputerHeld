/* =====================================================================
   MINI-DESKTOP (gemeinsame Basis für Welt 3 bis 5)
   Fenster, Taskleiste und Startmenü – Windows-ähnlich, aber einfach.
   Bisher enthalten: Fenster öffnen, minimieren, vergrößern/verkleinern,
   schließen, nach vorn holen; Taskleiste; Startmenü.
   Nur wenn ein Level es einschaltet (start.extras):
     schnell: true  – Schnelleinstellungen rechts in der Taskleiste
                      (Lautstärke, Stumm, Helligkeit)
     energie: true  – Ein/Aus-Knopf im Startmenü
                      (Herunterfahren, Neu starten, Abmelden)
   (Verschieben, Größe ziehen und Dateien kommen erst, wenn ein Level
   sie braucht.)

   Alles, was das Kind tut, wird zu einer „Aktion“, z. B.
     { art: "schliessen", programm: "malen" }
   Arten: start-auf, start-zu, oeffnen, minimieren, maximieren,
          wiederherstellen, schliessen, taskleiste, aktivieren,
          panel-auf, panel-zu, lautstaerke, stumm, helligkeit,
          energie-auf, energie-zu, energie (wahl: herunterfahren/neustart/abmelden)
   Bevor eine Aktion wirkt, fragt der Desktop den „Prüfer“ (die Aufgabe).
   Sagt der Prüfer false, passiert nichts.

   Programme mit eigenen Aktionen (z. B. der Explorer) bekommen beim
   Öffnen einen „Kontext“: darin ausloesen() zum Melden von Aktionen und
   registriere(fn), damit sie erlaubte Aktionen selbst ausführen.
   ===================================================================== */

import { PROGRAMME } from "./programme.js";
import { erzeugeSprite } from "../engine/sprite-render.js";
import {
  SYMBOL_START, KNOPF_MINIMIEREN, KNOPF_MAXIMIEREN, KNOPF_WIEDERHERSTELLEN, KNOPF_SCHLIESSEN,
  SYMBOL_LAUTSPRECHER, SYMBOL_SONNE, SYMBOL_EIN_AUS,
} from "../../sprites/programme.js";

/* Texte für den Ein/Aus-Knopf und was danach auf dem Bildschirm steht */
export const ENERGIE = {
  herunterfahren: { name: "Herunterfahren", bildschirm: "Der Computer ist aus." },
  neustart: { name: "Neu starten", bildschirm: "Der Computer startet neu …" },
  abmelden: { name: "Abmelden", bildschirm: "Abgemeldet. Wer möchte sich anmelden?" },
};

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
  let programmHandler = [];    // Programme, die eigene Aktionen ausführen
  let markiert = null;         // von der Hilfe hervorgehobenes Element
  let extras = {};             // { schnell, energie } – siehe oben
  let panelOffen = false;      // Schnelleinstellungen offen?
  let energieOffen = false;    // Ein/Aus-Menü offen?
  let lautstaerke = 50;        // 0 bis 100
  let stumm = false;
  let helligkeit = 100;        // 20 bis 100
  let bildschirm = null;       // nach Ein/Aus: "herunterfahren", "neustart" oder "abmelden"

  /* ---------- Aktionen ---------- */
  /* gibt true zurück, wenn die Aktion gewirkt hat */
  function ausloesen(aktion) {
    if (pruefer(aktion) === false) return false;
    fuehreAus(aktion);
    beiAktion(aktion);
    return true;
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
      case "start-auf": startOffen = true; panelOffen = false; break;
      case "start-zu": startOffen = false; energieOffen = false; break;
      case "panel-auf": panelOffen = true; startOffen = false; break;
      case "panel-zu": panelOffen = false; break;
      case "lautstaerke": lautstaerke = aktion.wert; if (lautstaerke > 0) stumm = false; break;
      case "stumm": stumm = aktion.wert; break;
      case "helligkeit": helligkeit = aktion.wert; break;
      case "energie-auf": energieOffen = true; break;
      case "energie-zu": energieOffen = false; break;
      case "energie": startOffen = false; energieOffen = false; bildschirm = aktion.wahl; break;
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
      default:
        // Aktionen eines Programms (z. B. Explorer: umbenennen, löschen …)
        programmHandler.forEach((fn) => fn(aktion));
    }
    zeichne();
  }

  /* ---------- Fenster ---------- */
  function erstelleFenster(p, zustand, kontext = {}) {
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
    inhalt.append(prog.inhalt({ ...kontext, ausloesen, registriere: (fn) => programmHandler.push(fn) }));
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
    if (prog.imStartmenue === false) continue;
    const k = knopf("start-kachel", prog.name, erzeugeSprite(prog.symbol, { faktor: 3 }), el("span", "", prog.name));
    k.addEventListener("click", () => ausloesen({ art: "oeffnen", programm: p }));
    kacheln[p] = k;
    kachelFeld.append(k);
  }
  startmenue.append(kachelFeld);

  // Ein/Aus (nur mit extras.energie)
  const energieBereich = el("div", "energie-bereich");
  const energieKnopf = knopf("energie-knopf", "Ein/Aus", erzeugeSprite(SYMBOL_EIN_AUS, { faktor: 2 }), el("span", "", "Ein/Aus"));
  energieKnopf.addEventListener("click", () => ausloesen({ art: energieOffen ? "energie-zu" : "energie-auf" }));
  const energieMenue = el("div", "energie-menue");
  const energieEintraege = {};
  for (const [wahl, e] of Object.entries(ENERGIE)) {
    const k = knopf("energie-eintrag", e.name, el("span", "", e.name));
    k.addEventListener("click", () => ausloesen({ art: "energie", wahl }));
    energieEintraege[wahl] = k;
    energieMenue.append(k);
  }
  energieBereich.append(energieMenue, energieKnopf);
  startmenue.append(energieBereich);

  // Schnelleinstellungen (nur mit extras.schnell)
  const panel = el("div", "schnell-panel");
  const reglerLaut = el("input", "regler");
  reglerLaut.type = "range"; reglerLaut.min = 0; reglerLaut.max = 100; reglerLaut.step = 5;
  reglerLaut.setAttribute("aria-label", "Lautstärke");
  reglerLaut.addEventListener("input", () => ausloesen({ art: "lautstaerke", wert: Number(reglerLaut.value) }));
  const stummKnopf = knopf("knopf klein stumm-knopf", "Stumm");
  stummKnopf.addEventListener("click", () => ausloesen({ art: "stumm", wert: !stumm }));
  const reglerHell = el("input", "regler");
  reglerHell.type = "range"; reglerHell.min = 20; reglerHell.max = 100; reglerHell.step = 5;
  reglerHell.setAttribute("aria-label", "Helligkeit");
  reglerHell.addEventListener("input", () => ausloesen({ art: "helligkeit", wert: Number(reglerHell.value) }));
  const zeileLaut = el("div", "schnell-zeile");
  zeileLaut.append(el("span", "schnell-name", "Lautstärke"), reglerLaut, el("span", "schnell-wert"), stummKnopf);
  const zeileHell = el("div", "schnell-zeile");
  zeileHell.append(el("span", "schnell-name", "Helligkeit"), reglerHell, el("span", "schnell-wert"));
  panel.append(zeileLaut, zeileHell);
  wurzel.append(panel);
  const schnellKnopf = knopf("task-knopf schnell-knopf", "Schnelleinstellungen");
  schnellKnopf.addEventListener("click", () => ausloesen({ art: panelOffen ? "panel-zu" : "panel-auf" }));

  // Dunkler Schleier für die Helligkeit und Bildschirm nach Ein/Aus
  const schleier = el("div", "helligkeit-schleier");
  const schirm = el("div", "energie-schirm");
  wurzel.append(schleier, schirm);

  // Klick daneben schließt Startmenü und Schnelleinstellungen
  flaeche.addEventListener("mousedown", () => {
    if (startOffen) ausloesen({ art: "start-zu" });
    if (panelOffen) ausloesen({ art: "panel-zu" });
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
    energieBereich.hidden = !extras.energie;
    energieMenue.hidden = !energieOffen;

    // Schnelleinstellungen
    panel.hidden = !extras.schnell || !panelOffen;
    reglerLaut.value = stumm ? 0 : lautstaerke;
    reglerHell.value = helligkeit;
    zeileLaut.querySelector(".schnell-wert").textContent = stumm ? "stumm" : lautstaerke;
    zeileHell.querySelector(".schnell-wert").textContent = helligkeit;
    stummKnopf.textContent = stumm ? "Ton an" : "Stumm";
    schnellKnopf.classList.toggle("aktiv", panelOffen);
    const lautsprecher = erzeugeSprite(SYMBOL_LAUTSPRECHER, { faktor: 2 });
    if (stumm || lautstaerke === 0) lautsprecher.classList.add("durchgestrichen");
    schnellKnopf.replaceChildren(lautsprecher, erzeugeSprite(SYMBOL_SONNE, { faktor: 2 }));
    schleier.style.opacity = ((100 - helligkeit) / 100) * 0.85;
    schirm.hidden = !bildschirm;
    if (bildschirm) {
      schirm.className = "energie-schirm " + bildschirm;
      schirm.replaceChildren(el("p", "", ENERGIE[bildschirm].bildschirm));
      if (bildschirm === "abmelden") {
        const anmelden = el("div", "anmelde-karte");
        anmelden.append(erzeugeSprite(SYMBOL_START, { faktor: 4 }), el("strong", "", "Klasse 5"), el("span", "anmelde-knopf", "Anmelden"));
        schirm.append(anmelden);
      }
    }

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
    if (extras.schnell) taskleiste.append(schnellKnopf);

    // Hilfe: Stelle zum Klicken hervorheben (nur die eigene Markierung
    // entfernen – Programme wie der Explorer markieren selbst)
    if (markiert) {
      markiert.classList.remove("mit-hilfe");
      markiert.querySelector(":scope > .desktop-schild")?.remove();
    }
    const ziel = hilfeZiel && elementFuer(hilfeZiel);
    markiert = ziel || null;
    if (ziel) {
      ziel.classList.add("mit-hilfe");
      const schild = el("span", "desktop-schild", hilfeText);
      // bei Fensterknöpfen unter dem Knopf, bei Reglern links daneben, sonst darüber
      if (ziel.classList.contains("fenster-knopf")) schild.classList.add("unten");
      if (ziel.classList.contains("schnell-zeile")) schild.classList.add("links");
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
      case "panel-auf": case "panel-zu": return schnellKnopf;
      case "lautstaerke": case "stumm": case "helligkeit":
        if (!panelOffen) return schnellKnopf;
        if (art === "stumm") return stummKnopf;
        return art === "lautstaerke" ? zeileLaut : zeileHell;
      case "energie-auf": case "energie-zu": return energieKnopf;
      case "energie":
        if (!startOffen) return startKnopf;
        return energieOffen ? energieEintraege[aktion.wahl] : energieKnopf;
      default: return null;
    }
  }

  return {
    element: wurzel,

    /* Anfangszustand setzen, z. B.
       { offen: [{ programm: "malen", zustand: "maximiert" }], aktiv: "malen" }
       start.kontext wird an die Programme weitergegeben (z. B. Dateisystem) */
    setze(start = {}) {
      for (const f of fenster.values()) f.element.remove();
      fenster.clear();
      stapel = [];
      geoeffnet = [];
      programmHandler = [];
      startOffen = false;
      extras = start.extras || {};
      panelOffen = false;
      energieOffen = false;
      bildschirm = null;
      lautstaerke = start.lautstaerke ?? 50;
      stumm = start.stumm ?? false;
      helligkeit = start.helligkeit ?? 100;
      for (const { programm, zustand = "normal" } of start.offen || []) erstelleFenster(programm, zustand, start.kontext);
      aktiv = start.aktiv || vorderstesSichtbares(null);
      if (aktiv) aktiviere(aktiv);
      zeichne();
    },

    fuehreAus,   // Aktion ohne Prüfer ausführen (für Bits Vorführung)
    elementFuer,

    /* Ist dieses Fenster gerade vorn und sichtbar? */
    get einstellungen() { return { lautstaerke, stumm, helligkeit, panelOffen, startOffen, energieOffen }; },

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
