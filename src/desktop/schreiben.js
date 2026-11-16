/* =====================================================================
   TEXTPROGRAMM „SCHREIBEN“ (ab Welt 5)
   Ein einfaches Textprogramm mit Symbolleiste:
     Datei-Menü (Speichern, Speichern unter …), Speichern-Symbol,
     Schriftart, Schriftgröße, fett, kursiv, unterstrichen, Schriftfarbe,
     Bild einfügen.

   Vereinfachung für Kinder: Man klickt eine ZEILE an (sie wird markiert),
   und alles in der Symbolleiste gilt dann für diese ganze Zeile.

   Alles, was etwas verändert, geht als „Aktion“ an den Desktop, und der
   fragt vorher die Aufgabe, ob es erlaubt ist:
     zeile-waehlen, format, bild-einfuegen, speichern, speichern-unter
   ===================================================================== */

import { erzeugeSprite } from "../engine/sprite-render.js";
import { SYMBOL_DISKETTE, SYMBOL_FOTOS, BILD_HAUS } from "../../sprites/programme.js";
import { ORDNER } from "../../sprites/dateien.js";
import { BIT } from "../../sprites/bit.js";
import { STERN, KISTE } from "../../sprites/symbole.js";
import { teile, elternVon, verbinde, endung } from "./dateisystem.js";
import { ortName } from "./explorer.js";

/* ---------- Was es zur Auswahl gibt (hier änderbar) ---------- */
export const SCHRIFTEN = ["Verdana", "Georgia", "Courier New", "Comic Sans MS"];
export const GROESSEN = [12, 16, 20, 28, 36, 48];
export const FARBEN = {
  schwarz: { name: "Schwarz", wert: "#1b1b1b" },
  rot:     { name: "Rot",     wert: "#d6402b" },
  blau:    { name: "Blau",    wert: "#2c5fd0" },
  gruen:   { name: "Grün",    wert: "#2f8f2a" },
  orange:  { name: "Orange",  wert: "#e07a10" },
  lila:    { name: "Lila",    wert: "#8a3fc8" },
};
export const BILDER = {
  haus:  { name: "Haus",  sprite: BILD_HAUS, faktor: 8 },
  bit:   { name: "Bit",   sprite: BIT, pose: "winkend", faktor: 4 },
  stern: { name: "Stern", sprite: STERN, faktor: 6 },
  kiste: { name: "Kiste", sprite: KISTE, faktor: 6 },
};
/* Ersatzschrift, falls eine Schriftart auf dem Rechner fehlt */
const ERSATZ = { "Verdana": "sans-serif", "Georgia": "serif", "Courier New": "monospace", "Comic Sans MS": "cursive" };
const schriftMitErsatz = (s) => `"${s}", ${ERSATZ[s] || "sans-serif"}`;
/* Auf dem Bildschirm wird alles etwas größer gezeigt, damit es gut lesbar ist */
const ANZEIGE_FAKTOR = 1.25;
const STANDARD = { schrift: "Verdana", groesse: 16, farbe: "schwarz", fett: false, kursiv: false, unterstrichen: false };

/* Macht aus den Level-Daten ein Dokument.
   zeilen: Texte (oder Objekte mit Text und Format, z. B. { text: "Hallo", fett: true }) */
export function neuesDokument({ name = null, ort = null, gespeichert = false, zeilen = [] } = {}) {
  return {
    name, ort, gespeichert,
    zeilen: zeilen.map((z) => (typeof z === "string" ? { ...STANDARD, text: z } : { ...STANDARD, ...z })),
  };
}

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
 * kontext.dokument  – das Dokument (siehe neuesDokument)
 * kontext.fs        – Dateisystem für „Speichern unter“
 * kontext.ausloesen / registriere – vom Desktop
 * kontext.beiStart(programm), kontext.beiAenderung() – für die Aufgabe
 */
export function baueSchreiben(kontext) {
  const dok = kontext.dokument;
  const { fs } = kontext;
  const ausloesen = (aktion) => kontext.ausloesen({ programm: "schreiben", ...aktion });
  const geaendert = () => { if (kontext.beiAenderung) kontext.beiAenderung(); };

  let auswahl = null;      // Nummer der markierten Zeile
  let offen = null;        // offene Liste: "datei", "schrift", "groesse", "farbe", "bild"
  let unter = null;        // „Speichern unter“-Fenster: { ort, name }
  let hilfe = [];

  /* ---------- Grundgerüst ---------- */
  const wurzel = el("div", "schreiben");
  const leiste = el("div", "sch-leiste");
  const status = el("div", "sch-status");
  const blatt = el("div", "sch-blatt");
  const seite = el("div", "sch-seite");
  blatt.append(seite);
  const dialog = el("div", "sch-dialog");
  dialog.hidden = true;
  wurzel.append(leiste, status, blatt, dialog);

  /* ---------- Symbolleiste ---------- */
  const k = {
    datei: knopf("sch-knopf sch-datei", "Datei", el("span", "", "Datei ▾")),
    speichern: knopf("sch-knopf", "Speichern", erzeugeSprite(SYMBOL_DISKETTE, { faktor: 2 })),
    schrift: knopf("sch-knopf sch-liste", "Schriftart"),
    groesse: knopf("sch-knopf sch-liste klein", "Schriftgröße"),
    fett: knopf("sch-knopf sch-format", "Fett", el("b", "", "B")),
    kursiv: knopf("sch-knopf sch-format", "Kursiv", el("i", "", "I")),
    unterstrichen: knopf("sch-knopf sch-format", "Unterstrichen", el("u", "", "U")),
    farbe: knopf("sch-knopf sch-farbe", "Schriftfarbe"),
    bild: knopf("sch-knopf", "Bild einfügen", erzeugeSprite(SYMBOL_FOTOS, { faktor: 1 }), el("span", "", "Bild")),
  };
  const trenner = () => el("span", "sch-trenner");
  leiste.append(k.datei, k.speichern, trenner(), k.schrift, k.groesse, trenner(),
    k.fett, k.kursiv, k.unterstrichen, k.farbe, trenner(), k.bild);
  const listenFeld = el("div", "sch-auswahlliste");
  listenFeld.hidden = true;
  wurzel.append(listenFeld);

  const zeile = () => (auswahl === null ? null : dok.zeilen[auswahl]);
  const format = (eigenschaft, wert) => ausloesen({ art: "format", eigenschaft, wert, nr: auswahl });

  k.fett.addEventListener("click", () => format("fett", !(zeile() && zeile().fett)));
  k.kursiv.addEventListener("click", () => format("kursiv", !(zeile() && zeile().kursiv)));
  k.unterstrichen.addEventListener("click", () => format("unterstrichen", !(zeile() && zeile().unterstrichen)));
  k.speichern.addEventListener("click", () => ausloesen({ art: "speichern", weg: "symbol" }));
  for (const name of ["datei", "schrift", "groesse", "farbe", "bild"]) {
    k[name].addEventListener("click", () => oeffneListe(offen === name ? null : name));
  }

  /* ---------- Aufklapp-Listen ---------- */
  function eintraegeFuer(liste) {
    switch (liste) {
      case "datei": return [
        ["speichern", "Speichern", () => ausloesen({ art: "speichern", weg: "menue" })],
        ["unter", "Speichern unter …", () => oeffneUnter()],
      ];
      case "schrift": return SCHRIFTEN.map((s) => [s, s, () => format("schrift", s)]);
      case "groesse": return GROESSEN.map((g) => [g, String(g), () => format("groesse", g)]);
      case "farbe": return Object.entries(FARBEN).map(([id, f]) => [id, f.name, () => format("farbe", id)]);
      case "bild": return Object.entries(BILDER).map(([id, b]) => [id, b.name,
        () => ausloesen({ art: "bild-einfuegen", bild: id, nach: auswahl })]);
      default: return [];
    }
  }
  function oeffneListe(liste) {
    offen = liste;
    listenFeld.hidden = !liste;
    if (liste) {
      listenFeld.className = "sch-auswahlliste liste-" + liste;
      listenFeld.replaceChildren(...eintraegeFuer(liste).map(([wert, text, tu]) => {
        const e = el("button", "sch-option");
        e.type = "button";
        e.dataset.wert = wert;
        if (liste === "schrift") e.style.fontFamily = schriftMitErsatz(wert);
        if (liste === "farbe") {
          const muster = el("span", "sch-farbmuster");
          muster.style.background = FARBEN[wert].wert;
          e.append(muster);
        }
        if (liste === "bild") e.append(bildVon(wert, 4));
        e.append(el("span", "", text));
        e.addEventListener("click", () => { oeffneListe(null); tu(); });
        return e;
      }));
      // unter dem passenden Knopf aufklappen
      const r = wurzel.getBoundingClientRect();
      const kr = k[liste].getBoundingClientRect();
      listenFeld.style.left = kr.left - r.left + "px";
      listenFeld.style.top = kr.bottom - r.top + 4 + "px";
    }
    markiere();
    geaendert();
  }
  wurzel.addEventListener("mousedown", (e) => {
    if (offen && !listenFeld.contains(e.target) && !e.target.closest(".sch-knopf")) oeffneListe(null);
  });

  function bildVon(id, faktor) {
    const b = BILDER[id];
    return erzeugeSprite(b.sprite, { faktor: faktor || b.faktor, pose: b.pose });
  }

  /* ---------- „Speichern unter“-Fenster ---------- */
  function oeffneUnter() {
    unter = { ort: dok.ort || "/Dokumente", name: dok.name ? dok.name.replace(/\.docx$/i, "") : "Dokument1" };
    zeichneUnter();
    geaendert();
  }
  function schliesseUnter() {
    unter = null;
    dialog.hidden = true;
    geaendert();
  }
  let namensFeld = null;
  function zeichneUnter() {
    dialog.hidden = !unter;
    if (!unter) return;
    const box = el("div", "sch-dialog-box");
    box.append(el("strong", "sch-dialog-titel", "Speichern unter"));

    const zeileOrt = el("div", "sch-unter-ort");
    const hoch = el("button", "ex-knopf sch-unter-hoch", "⬆ Nach oben");
    hoch.type = "button";
    hoch.disabled = unter.ort === "/";
    hoch.addEventListener("click", () => { unter.ort = elternVon(unter.ort); zeichneUnter(); geaendert(); });
    const pfadText = ["Dieser PC", ...teile(unter.ort)].join(" › ");
    zeileOrt.append(hoch, el("span", "sch-unter-pfad", pfadText));

    const ordnerListe = el("div", "sch-unter-liste");
    const inhalt = fs.inhalt(unter.ort).filter((e) => e.typ === "ordner" || endung(e.name) === "docx");
    if (inhalt.length === 0) ordnerListe.append(el("span", "ex-leer", "(keine Ordner)"));
    for (const e of inhalt) {
      const eintrag = el("div", "sch-unter-eintrag" + (e.typ === "ordner" ? "" : " datei"));
      eintrag.dataset.pfad = e.pfad;
      eintrag.append(erzeugeSprite(ORDNER, { faktor: 2 }), el("span", "", e.name));
      if (e.typ !== "ordner") eintrag.firstChild.style.visibility = "hidden";
      else eintrag.addEventListener("dblclick", () => { unter.ort = e.pfad; zeichneUnter(); geaendert(); });
      ordnerListe.append(eintrag);
    }

    const zeileName = el("label", "sch-unter-name");
    namensFeld = el("input", "sch-eingabe");
    namensFeld.type = "text";
    namensFeld.value = unter.name;
    namensFeld.spellcheck = false;
    namensFeld.addEventListener("input", () => { unter.name = namensFeld.value; geaendert(); });
    namensFeld.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") speichereUnter();
      if (e.key === "Escape") schliesseUnter();
    });
    zeileName.append(el("span", "", "Dateiname:"), namensFeld, el("span", "sch-unter-typ", ".docx (Dokument)"));

    const knoepfe = el("div", "sch-dialog-knoepfe");
    const ok = el("button", "knopf klein sch-unter-speichern", "Speichern");
    const abbruch = el("button", "knopf klein", "Abbrechen");
    ok.type = abbruch.type = "button";
    ok.addEventListener("click", speichereUnter);
    abbruch.addEventListener("click", schliesseUnter);
    knoepfe.append(ok, abbruch);

    box.append(zeileOrt, ordnerListe, zeileName, knoepfe);
    dialog.replaceChildren(box);
    markiere();
  }
  function speichereUnter() {
    let name = (namensFeld ? namensFeld.value : unter.name).trim();
    if (!name) return;
    if (!/\.docx$/i.test(name)) name += ".docx";
    ausloesen({ art: "speichern-unter", ort: unter.ort, name });
  }

  /* ---------- Strg+S ---------- */
  function beiTaste(e) {
    if (!wurzel.isConnected || unter) return;
    if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      ausloesen({ art: "speichern", weg: "tasten" });
    }
  }
  window.addEventListener("keydown", beiTaste);

  /* ---------- Zeichnen ---------- */
  function zeichne() {
    // Name und Speicher-Zustand
    status.replaceChildren(
      el("span", "sch-dokname", dok.name || "Dokument1 (noch nie gespeichert)"),
      el("span", "speicher-status" + (dok.gespeichert ? " gut" : ""), dok.gespeichert ? "gespeichert ✓" : "nicht gespeichert"),
    );
    // Symbolleiste zeigt das Format der markierten Zeile
    const z = zeile() && !zeile().bild ? zeile() : STANDARD;
    k.schrift.replaceChildren(el("span", "", z.schrift + " ▾"));
    k.schrift.style.fontFamily = schriftMitErsatz(z.schrift);
    k.groesse.replaceChildren(el("span", "", z.groesse + " ▾"));
    k.fett.classList.toggle("an", Boolean(zeile() && z.fett));
    k.kursiv.classList.toggle("an", Boolean(zeile() && z.kursiv));
    k.unterstrichen.classList.toggle("an", Boolean(zeile() && z.unterstrichen));
    const a = el("span", "sch-farb-a", "A");
    a.style.borderBottomColor = FARBEN[z.farbe].wert;
    k.farbe.replaceChildren(a, el("span", "", " ▾"));

    // Das Blatt
    seite.replaceChildren(...dok.zeilen.map((zl, nr) => {
      const e = el("div", "sch-zeile" + (nr === auswahl ? " markiert" : ""));
      e.dataset.nr = nr;
      if (zl.bild) {
        e.classList.add("sch-bild");
        e.append(bildVon(zl.bild));
      } else {
        e.textContent = zl.text;
        e.style.fontFamily = schriftMitErsatz(zl.schrift);
        e.style.fontSize = zl.groesse * ANZEIGE_FAKTOR + "px";
        e.style.color = FARBEN[zl.farbe].wert;
        e.style.fontWeight = zl.fett ? "bold" : "normal";
        e.style.fontStyle = zl.kursiv ? "italic" : "normal";
        e.style.textDecoration = zl.unterstrichen ? "underline" : "none";
      }
      e.addEventListener("click", () => { if (nr !== auswahl) ausloesen({ art: "zeile-waehlen", nr }); });
      return e;
    }));
    markiere();
    geaendert();
  }

  /* ---------- Hilfe (beim Üben) ---------- */
  function elementFuer(h) {
    switch (h.wo) {
      case "zeile": return seite.querySelector(`.sch-zeile[data-nr="${h.nr}"]`);
      case "knopf": return k[h.id];
      case "option": return offen === h.liste ? listenFeld.querySelector(`.sch-option[data-wert="${CSS.escape(String(h.wert))}"]`) : null;
      case "unter-ordner": return dialog.querySelector(`.sch-unter-eintrag[data-pfad="${CSS.escape(h.pfad)}"]`);
      case "unter-hoch": return dialog.querySelector(".sch-unter-hoch");
      case "unter-name": return dialog.querySelector(".sch-unter-name");
      case "unter-speichern": return dialog.querySelector(".sch-unter-speichern");
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
      if (h.text) {
        const schild = el("span", "desktop-schild", h.text);
        if (h.wo === "knopf" || h.wo.startsWith("unter")) schild.classList.add("unten");
        if (h.wo === "zeile") schild.classList.add("in-zeile");
        ziel.append(schild);
      }
    }
  }

  /* ---------- Erlaubte Aktionen ausführen (vom Desktop aufgerufen) ---------- */
  function anwenden(aktion) {
    if (aktion.programm !== "schreiben") return;
    switch (aktion.art) {
      case "zeile-waehlen":
        auswahl = aktion.nr;
        break;
      case "format":
        dok.zeilen[aktion.nr][aktion.eigenschaft] = aktion.wert;
        dok.gespeichert = false;
        break;
      case "bild-einfuegen": {
        const stelle = aktion.nach === null || aktion.nach === undefined ? dok.zeilen.length : aktion.nach + 1;
        dok.zeilen.splice(stelle, 0, { bild: aktion.bild });
        auswahl = stelle;
        dok.gespeichert = false;
        break;
      }
      case "speichern":
        // Noch nie gespeichert? Dann fragt das Programm erst nach Ort und Namen.
        if (!dok.name) { oeffneUnter(); return; }
        dok.gespeichert = true;
        break;
      case "speichern-unter":
        fs.lege(verbinde(aktion.ort, aktion.name));
        dok.name = aktion.name;
        dok.ort = aktion.ort;
        dok.gespeichert = true;
        unter = null;
        dialog.hidden = true;
        break;
      default:
        return;
    }
    zeichne();
  }
  kontext.registriere(anwenden);

  const programm = {
    element: wurzel,
    get auswahl() { return auswahl; },
    get offen() { return offen; },
    get unter() { return unter; },
    setzeHilfe(liste) { hilfe = liste || []; markiere(); },
    elementFuer,
    // für Bits Vorführung
    setzeName(text) { if (namensFeld) { namensFeld.value = text; unter.name = text; } },
    beenden() { window.removeEventListener("keydown", beiTaste); },
  };
  zeichne();
  if (kontext.beiStart) kontext.beiStart(programm);
  return wurzel;
}

export { ortName };
