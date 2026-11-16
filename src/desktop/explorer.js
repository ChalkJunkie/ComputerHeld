/* =====================================================================
   DATEI-EXPLORER (ab Welt 4)
   Zeigt das Dateisystem (src/desktop/dateisystem.js) an:
     oben:   „Nach oben“, „Neuer Ordner“ und der Pfad zum Anklicken
     links:  feste Ordner und der Papierkorb
     Mitte:  Ordner und Dateien als Symbole

   Bedienung wie bei Windows:
     Klick = auswählen, Doppelklick = öffnen, Rechtsklick = Menü,
     Entf = löschen, F2 = umbenennen, Ziehen = verschieben
     (auf den Papierkorb ziehen = löschen)

   Alles, was etwas verändert, geht als „Aktion“ an den Desktop, und
   der fragt vorher die Aufgabe, ob es erlaubt ist:
     navigieren, auswaehlen, oeffnen-datei, neuer-ordner, umbenennen,
     loeschen, zurueckholen (aus dem Papierkorb), verschieben
   ===================================================================== */

import { ORDNER, PAPIERKORB, DATEI } from "../../sprites/dateien.js";
import { erzeugeSprite } from "../engine/sprite-render.js";
import {
  STANDARD_ORDNER, typVon, endung, teile, elternVon, nameVon, verbinde,
} from "./dateisystem.js";

const PAPIERKORB_PFAD = "papierkorb";
const ZIEH_SCHWELLE = 6; // so viele Bildschirmpunkte, bevor ein Klick zum Ziehen wird

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* Lesbarer Name eines Ordnerpfads */
export function ortName(pfad) {
  if (pfad === PAPIERKORB_PFAD) return "Papierkorb";
  return pfad === "/" ? "Dieser PC" : nameVon(pfad);
}

/**
 * kontext.fs        – das Dateisystem
 * kontext.ort       – Startordner (Standard "/")
 * kontext.symbole   – false: alle Dateien bekommen dasselbe Symbol
 * kontext.ausloesen – vom Desktop: Aktion prüfen und ausführen (gibt true/false)
 * kontext.registriere(fn) – vom Desktop: fn bekommt jede erlaubte Aktion
 * kontext.beiStart(explorer) – wer den Explorer steuern will, bekommt ihn hier
 */
export function baueExplorer(kontext) {
  const { fs } = kontext;
  const ausloesen = (aktion) => kontext.ausloesen({ programm: "explorer", ...aktion });
  const zeigeSymbole = kontext.symbole !== false;

  let pfad = kontext.ort || "/";
  let auswahl = null;      // Pfad des ausgewählten Eintrags
  let bearbeitet = null;   // { pfad } während des Umbenennens
  let menue = null;
  let hilfe = [];          // [{ wo, pfad, text }]
  let ziehen = null;       // { pfad, x, y, geist, ziel }

  /* ---------- Grundgerüst ---------- */
  const wurzel = el("div", "explorer");
  const leiste = el("div", "ex-leiste");
  const knopfHoch = el("button", "ex-knopf", "⬆ Nach oben");
  const knopfNeu = el("button", "ex-knopf", "+ Neuer Ordner");
  knopfHoch.type = knopfNeu.type = "button";
  const adresse = el("div", "ex-adresse");
  leiste.append(knopfHoch, knopfNeu, adresse);
  const haupt = el("div", "ex-haupt");
  const seite = el("div", "ex-seite");
  const inhaltFeld = el("div", "ex-inhalt");
  haupt.append(seite, inhaltFeld);
  const info = el("div", "ex-info");
  info.hidden = true;
  wurzel.append(leiste, haupt, info);

  knopfHoch.addEventListener("click", () => {
    if (pfad === "/") return;
    ausloesen({ art: "navigieren", pfad: pfad === PAPIERKORB_PFAD ? "/" : elternVon(pfad) });
  });
  knopfNeu.addEventListener("click", () => {
    if (pfad !== PAPIERKORB_PFAD) ausloesen({ art: "neuer-ordner", ort: pfad });
  });

  /* ---------- Linke Leiste ---------- */
  const SEITE = [["/", "Dieser PC"], ...STANDARD_ORDNER.map((o) => ["/" + o, o]), [PAPIERKORB_PFAD, "Papierkorb"]];

  function baueSeite() {
    seite.replaceChildren(...SEITE.map(([ziel, name]) => {
      const e = el("div", "ex-seite-eintrag" + (ziel === pfad ? " aktiv" : ""));
      e.dataset.ziel = ziel;
      e.append(erzeugeSprite(ziel === PAPIERKORB_PFAD ? PAPIERKORB : ORDNER, { faktor: 2 }), el("span", "", name));
      e.addEventListener("click", () => ausloesen({ art: "navigieren", pfad: ziel }));
      return e;
    }));
  }

  /* ---------- Pfad oben ---------- */
  function baueAdresse() {
    const stuecke = pfad === PAPIERKORB_PFAD
      ? [[PAPIERKORB_PFAD, "Papierkorb"]]
      : [["/", "Dieser PC"], ...teile(pfad).map((t, i, alle) => ["/" + alle.slice(0, i + 1).join("/"), t])];
    adresse.replaceChildren();
    stuecke.forEach(([ziel, name], i) => {
      if (i > 0) adresse.append(el("span", "ex-pfeil", "›"));
      const s = el("span", "ex-stueck", name);
      s.addEventListener("click", () => { if (ziel !== pfad) ausloesen({ art: "navigieren", pfad: ziel }); });
      adresse.append(s);
    });
  }

  /* ---------- Einträge in der Mitte ---------- */
  function symbol(eintrag) {
    if (eintrag.typ === "ordner") return erzeugeSprite(ORDNER, { faktor: 3 });
    return erzeugeSprite(DATEI, { faktor: 3, pose: zeigeSymbole ? typVon(eintrag.name).symbol : "allgemein" });
  }

  function baueEintraege() {
    const imKorb = pfad === PAPIERKORB_PFAD;
    const liste = imKorb ? fs.papierkorb() : fs.inhalt(pfad);
    inhaltFeld.replaceChildren();
    if (liste.length === 0) {
      inhaltFeld.append(el("p", "ex-leer", imKorb ? "Der Papierkorb ist leer." : "Dieser Ordner ist leer."));
      return;
    }
    for (const eintrag of liste) {
      const e = el("div", "ex-eintrag" + (eintrag.pfad === auswahl ? " ausgewaehlt" : ""));
      e.dataset.pfad = eintrag.pfad;
      if (eintrag.typ === "ordner" && !imKorb) e.dataset.ordner = "ja";
      e.append(symbol(eintrag));
      if (bearbeitet && bearbeitet.pfad === eintrag.pfad) {
        e.append(baueEingabe(eintrag.name));
      } else {
        e.append(el("span", "ex-name", eintrag.name));
      }
      if (imKorb) e.append(el("span", "ex-herkunft", "aus: " + ortName(eintrag.herkunft)));
      inhaltFeld.append(e);
    }
  }

  /* ---------- Umbenennen ---------- */
  function baueEingabe(alterName) {
    const eingabe = el("input", "ex-eingabe");
    eingabe.type = "text";
    eingabe.value = alterName;
    eingabe.spellcheck = false;
    eingabe.setAttribute("aria-label", "Neuer Name");
    eingabe.addEventListener("mousedown", (e) => e.stopPropagation());
    eingabe.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); bestaetige(true); }
      if (e.key === "Escape") { e.preventDefault(); abbrechen(); }
    });
    eingabe.addEventListener("blur", () => { if (bearbeitet) bestaetige(false); });
    return eingabe;
  }
  function fokussiereEingabe() {
    const eingabe = inhaltFeld.querySelector(".ex-eingabe");
    if (!eingabe) return;
    eingabe.focus();
    // wie bei Windows: nur der Name ist markiert, die Endung nicht
    const punkt = eingabe.value.lastIndexOf(".");
    const istDatei = fs.finde(bearbeitet.pfad)?.typ === "datei";
    eingabe.setSelectionRange(0, istDatei && punkt > 0 ? punkt : eingabe.value.length);
  }
  function starteUmbenennen(p) {
    bearbeitet = { pfad: p };
    auswahl = p;
    zeichne();
  }
  function abbrechen() {
    bearbeitet = null;
    zeichne();
  }
  function bestaetige(mitEnter) {
    const eingabe = inhaltFeld.querySelector(".ex-eingabe");
    if (!eingabe || !bearbeitet) return;
    const neuerName = eingabe.value.trim();
    const alt = bearbeitet.pfad;
    if (!neuerName || neuerName === nameVon(alt)) return abbrechen();
    const vergeben = fs.nameVergeben(elternVon(alt), neuerName, alt);
    const erlaubt = ausloesen({ art: "umbenennen", pfad: alt, neuerName, vergeben });
    if (erlaubt) return;
    // Nicht erlaubt: mit Enter weiter tippen lassen, beim Wegklicken abbrechen
    if (mitEnter && bearbeitet) fokussiereEingabe();
    else abbrechen();
  }

  /* ---------- Menü (Rechtsklick) ---------- */
  function schliesseMenue() {
    if (!menue) return;
    menue.remove();
    menue = null;
    geaendert();
  }
  /* Bescheid geben, dass sich die Anzeige geändert hat (für die Hilfe) */
  function geaendert() {
    if (kontext.beiAenderung) kontext.beiAenderung();
  }
  function zeigeMenue(x, y, eintraege) {
    schliesseMenue();
    menue = el("div", "kontextmenue");
    menue.setAttribute("role", "menu");
    for (const [text, aktion] of eintraege) {
      const k = el("button", "", text);
      k.type = "button";
      k.setAttribute("role", "menuitem");
      k.addEventListener("click", () => { schliesseMenue(); aktion(); });
      menue.append(k);
    }
    wurzel.append(menue);
    const r = wurzel.getBoundingClientRect();
    menue.style.left = Math.min(x - r.left, wurzel.clientWidth - menue.offsetWidth - 6) + "px";
    menue.style.top = Math.min(y - r.top, wurzel.clientHeight - menue.offsetHeight - 6) + "px";
    geaendert();
  }
  function menueFuer(p) {
    if (pfad === PAPIERKORB_PFAD) {
      return [
        ["Wiederherstellen", () => ausloesen({ art: "zurueckholen", pfad: p })],
        ["Eigenschaften", () => zeigeEigenschaften(p)],
      ];
    }
    return [
      ["Öffnen", () => oeffne(p)],
      ["Umbenennen", () => starteUmbenennen(p)],
      ["Löschen", () => ausloesen({ art: "loeschen", pfad: p })],
      ["Eigenschaften", () => zeigeEigenschaften(p)],
    ];
  }

  /* ---------- Eigenschaften ---------- */
  function zeigeEigenschaften(p) {
    const imKorb = pfad === PAPIERKORB_PFAD;
    const eintrag = imKorb ? fs.papierkorbEintrag(p) : fs.finde(p);
    const ort = imKorb ? eintrag.herkunft : elternVon(p);
    const typ = eintrag.typ === "ordner"
      ? "Ordner"
      : `${typVon(eintrag.name).beschreibung.replace(/^(ein|eine) /, "")} (.${endung(eintrag.name) || "?"})`;
    const zeilen = [["Name", eintrag.name], ["Typ", typ], [imKorb ? "Vorher in" : "Ort", ortName(ort)]];
    const tabelle = el("div", "ex-info-zeilen");
    for (const [a, b] of zeilen) tabelle.append(el("span", "ex-info-a", a + ":"), el("span", "", b));
    const ok = el("button", "knopf klein", "OK");
    ok.type = "button";
    ok.addEventListener("click", () => { info.hidden = true; });
    info.replaceChildren(el("strong", "", "Eigenschaften"), tabelle, ok);
    info.hidden = false;
  }

  function oeffne(p) {
    const k = fs.finde(p);
    if (!k) return;
    if (k.typ === "ordner") ausloesen({ art: "navigieren", pfad: p });
    else ausloesen({ art: "oeffnen-datei", pfad: p });
  }

  /* ---------- Maus in der Mitte ---------- */
  inhaltFeld.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const eintrag = e.target.closest(".ex-eintrag");
    if (!eintrag) {
      if (auswahl) { auswahl = null; zeichne(); }
      return;
    }
    e.preventDefault(); // kein Markieren von Text
    const p = eintrag.dataset.pfad;
    if (p !== auswahl) ausloesen({ art: "auswaehlen", pfad: p });
    if (pfad !== PAPIERKORB_PFAD) ziehen = { pfad: p, x: e.clientX, y: e.clientY, geist: null, ziel: null };
  });
  inhaltFeld.addEventListener("dblclick", (e) => {
    const eintrag = e.target.closest(".ex-eintrag");
    if (eintrag && pfad !== PAPIERKORB_PFAD && !bearbeitet) oeffne(eintrag.dataset.pfad);
  });
  inhaltFeld.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const eintrag = e.target.closest(".ex-eintrag");
    if (eintrag) {
      const p = eintrag.dataset.pfad;
      if (p !== auswahl) ausloesen({ art: "auswaehlen", pfad: p });
      zeigeMenue(e.clientX, e.clientY, menueFuer(p));
    } else if (pfad !== PAPIERKORB_PFAD) {
      zeigeMenue(e.clientX, e.clientY, [["Neuer Ordner", () => ausloesen({ art: "neuer-ordner", ort: pfad })]]);
    }
  });
  wurzel.addEventListener("mousedown", (e) => {
    if (menue && !menue.contains(e.target)) schliesseMenue();
  });

  /* ---------- Ziehen und Ablegen ---------- */
  function zielUnter(x, y) {
    const unter = document.elementFromPoint(x, y);
    if (!unter) return null;
    const ordner = unter.closest(".ex-eintrag[data-ordner]");
    if (ordner && ordner.dataset.pfad !== ziehen.pfad) return { element: ordner, pfad: ordner.dataset.pfad };
    const links = unter.closest(".ex-seite-eintrag");
    if (links && links.dataset.ziel !== "/") return { element: links, pfad: links.dataset.ziel };
    return null;
  }
  function beiBewegung(e) {
    if (!ziehen) return;
    if (!ziehen.geist) {
      if (Math.hypot(e.clientX - ziehen.x, e.clientY - ziehen.y) < ZIEH_SCHWELLE) return;
      const quelle = inhaltFeld.querySelector(`.ex-eintrag[data-pfad="${CSS.escape(ziehen.pfad)}"] canvas`);
      if (!quelle) { ziehen = null; return; }
      ziehen.geist = el("div", "ex-geist");
      ziehen.geist.append(symbol(fs.finde(ziehen.pfad)));
      wurzel.append(ziehen.geist);
    }
    const r = wurzel.getBoundingClientRect();
    ziehen.geist.style.left = e.clientX - r.left - 24 + "px";
    ziehen.geist.style.top = e.clientY - r.top - 24 + "px";
    const ziel = zielUnter(e.clientX, e.clientY);
    wurzel.querySelectorAll(".ablage-ziel").forEach((x) => x.classList.remove("ablage-ziel"));
    if (ziel) ziel.element.classList.add("ablage-ziel");
    ziehen.ziel = ziel;
  }
  function beimLoslassen() {
    if (!ziehen) return;
    const { geist, ziel, pfad: quelle } = ziehen;
    ziehen = null;
    if (!geist) return;
    geist.remove();
    wurzel.querySelectorAll(".ablage-ziel").forEach((x) => x.classList.remove("ablage-ziel"));
    if (!ziel) return;
    if (ziel.pfad === PAPIERKORB_PFAD) ausloesen({ art: "loeschen", pfad: quelle });
    else if (ziel.pfad !== elternVon(quelle)) ausloesen({ art: "verschieben", pfad: quelle, nach: ziel.pfad });
  }
  window.addEventListener("mousemove", beiBewegung);
  window.addEventListener("mouseup", beimLoslassen);

  /* ---------- Tastatur: Entf und F2 ---------- */
  function beiTaste(e) {
    if (!wurzel.isConnected || bearbeitet || !auswahl || pfad === PAPIERKORB_PFAD) return;
    if (e.key === "Delete") { e.preventDefault(); ausloesen({ art: "loeschen", pfad: auswahl }); }
    if (e.key === "F2") { e.preventDefault(); starteUmbenennen(auswahl); }
  }
  window.addEventListener("keydown", beiTaste);

  /* ---------- Hilfe (beim Üben) ---------- */
  function elementFuer(h) {
    switch (h.wo) {
      case "eintrag": return inhaltFeld.querySelector(`.ex-eintrag[data-pfad="${CSS.escape(h.pfad)}"]`);
      case "seite": return seite.querySelector(`.ex-seite-eintrag[data-ziel="${CSS.escape(h.pfad)}"]`);
      case "knopf-neu": return knopfNeu;
      case "knopf-hoch": return knopfHoch;
      case "eingabe": return inhaltFeld.querySelector(".ex-eingabe")?.parentElement;
      case "menue": return menue && [...menue.children].find((k) => k.textContent === h.text);
      default: return null;
    }
  }
  function markiere() {
    wurzel.querySelectorAll(".mit-hilfe").forEach((x) => x.classList.remove("mit-hilfe"));
    wurzel.querySelectorAll(".desktop-schild").forEach((x) => x.remove());
    for (const h of hilfe) {
      const ziel = elementFuer(h);
      if (!ziel) continue;
      ziel.classList.add("mit-hilfe");
      if (h.text && h.wo !== "menue") {
        const schild = el("span", "desktop-schild", h.text);
        if (h.wo.startsWith("knopf") || h.wo === "eintrag" || h.wo === "eingabe") schild.classList.add("unten");
        if (h.wo === "seite") schild.classList.add("rechts");
        ziel.append(schild);
      }
    }
  }

  /* ---------- Zeichnen ---------- */
  function zeichne() {
    knopfHoch.disabled = pfad === "/";
    knopfNeu.disabled = pfad === PAPIERKORB_PFAD;
    baueSeite();
    baueAdresse();
    baueEintraege();
    markiere();
    if (bearbeitet) fokussiereEingabe();
    geaendert();
  }

  /* ---------- Erlaubte Aktionen ausführen (vom Desktop aufgerufen) ---------- */
  function anwenden(aktion) {
    if (aktion.programm !== "explorer") return;
    info.hidden = true;
    schliesseMenue();
    switch (aktion.art) {
      case "navigieren":
        pfad = aktion.pfad; auswahl = null; bearbeitet = null; break;
      case "auswaehlen":
        auswahl = aktion.pfad; break;
      case "neuer-ordner": {
        // wie bei Windows: Der neue Ordner wartet gleich auf seinen Namen
        const neu = fs.erstelleOrdner(aktion.ort);
        auswahl = neu;
        bearbeitet = { pfad: neu };
        break;
      }
      case "umbenennen":
        auswahl = fs.umbenennen(aktion.pfad, aktion.neuerName);
        bearbeitet = null;
        break;
      case "loeschen":
        fs.loeschen(aktion.pfad); auswahl = null; break;
      case "zurueckholen":
        fs.wiederherstellen(aktion.pfad); auswahl = null; break;
      case "verschieben":
        fs.verschieben(aktion.pfad, aktion.nach); auswahl = null; break;
      default:
        return;
    }
    zeichne();
  }
  kontext.registriere(anwenden);

  const explorer = {
    element: wurzel,
    get pfad() { return pfad; },
    get auswahl() { return auswahl; },
    get bearbeitet() { return bearbeitet; },
    get menueOffen() { return Boolean(menue); },
    setzeHilfe(liste) { hilfe = liste || []; markiere(); },
    elementFuer,
    // für Bits Vorführung:
    zeigeMenue(p) {
      const e = elementFuer({ wo: "eintrag", pfad: p });
      const r = e.getBoundingClientRect();
      auswahl = p; zeichne();
      zeigeMenue(r.left + r.width / 2, r.top + r.height / 2, menueFuer(p));
    },
    schliesseMenue,
    starteUmbenennen,
    setzeEingabe(text) {
      const eingabe = inhaltFeld.querySelector(".ex-eingabe");
      if (eingabe) eingabe.value = text;
    },
    beenden() {
      window.removeEventListener("mousemove", beiBewegung);
      window.removeEventListener("mouseup", beimLoslassen);
      window.removeEventListener("keydown", beiTaste);
    },
  };
  zeichne();
  if (kontext.beiStart) kontext.beiStart(explorer);
  return wurzel;
}

export { PAPIERKORB_PFAD, verbinde };
