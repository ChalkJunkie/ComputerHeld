/* =====================================================================
   TEXTPROGRAMM „SCHREIBEN“ (ab Welt 5)
   Ein einfaches Textprogramm mit Symbolleiste:
     Datei-Menü (Speichern, Speichern unter …), Speichern-Symbol,
     Schriftart, Schriftgröße, fett, kursiv, unterstrichen, Schriftfarbe,
     Bild einfügen.

   Markieren wie im echten Programm: Maustaste auf der Zeile drücken,
   festhalten, über die Zeile ziehen, loslassen. Ist die GANZE Zeile
   markiert, gilt alles in der Symbolleiste für diese Zeile.
   Ein einfacher Klick setzt nur den Schreibstrich in die Zeile
   (dort kommt z. B. ein Bild hin).

   Alles, was etwas verändert, geht als „Aktion“ an den Desktop, und der
   fragt vorher die Aufgabe, ob es erlaubt ist:
     zeile-waehlen (ganz: true = ganze Zeile markiert, false = nur Schreibstrich),
     teil-markiert (nur ein Stück der Zeile markiert),
     format, bild-einfuegen, speichern, speichern-unter (als: "pdf" für PDF),
     drucken (drucker, kopien)
   ===================================================================== */

import { erzeugeSprite } from "../engine/sprite-render.js";
import { SYMBOL_DISKETTE, SYMBOL_FOTOS, BILD_HAUS, SYMBOL_DRUCKER } from "../../sprites/programme.js";
import { DATEI } from "../../sprites/dateien.js";
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

  let auswahl = null;      // Nummer der Zeile mit Schreibstrich oder Markierung
  let ganz = false;        // true: die ganze Zeile ist markiert
  let teil = null;         // beim Ziehen: { nr, von, bis } (markierte Buchstaben)
  let ziehen = null;       // { nr, start, x, y, bewegt }
  let offen = null;        // offene Liste: "datei", "schrift", "groesse", "farbe", "bild"
  let unter = null;        // „Speichern unter“-Fenster: { ort, name, als }
  let druck = null;        // Drucken-Fenster: { drucker: "klasse" oder "pdf", kopien }
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
  const format = (eigenschaft, wert) => ausloesen({ art: "format", eigenschaft, wert, nr: auswahl, ganz });

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
        ["drucken", "Drucken …", () => oeffneDruck()],
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
  function oeffneUnter(als = "docx") {
    druck = null;
    unter = { ort: dok.ort || "/Dokumente", name: dok.name ? dok.name.replace(/\.docx$/i, "") : "Dokument1", als };
    zeichneUnter();
    geaendert();
  }

  /* ---------- Drucken-Fenster ---------- */
  function oeffneDruck() {
    unter = null;
    druck = { drucker: "klasse", kopien: 1 };
    zeichneDruck();
    geaendert();
  }
  function schliesseDruck() {
    druck = null;
    dialog.hidden = true;
    geaendert();
  }
  function zeichneDruck() {
    dialog.hidden = !druck;
    if (!druck) return;
    const box = el("div", "sch-dialog-box");
    box.append(el("strong", "sch-dialog-titel", "Drucken"));
    const wahl = el("div", "druck-wahl");
    const drucker = [
      ["klasse", "Drucker im Klassenzimmer", erzeugeSprite(SYMBOL_DRUCKER, { faktor: 3 })],
      ["pdf", "Als PDF speichern", erzeugeSprite(DATEI, { faktor: 3, pose: "pdf" })],
    ];
    for (const [id, name, bildchen] of drucker) {
      const k = el("button", "druck-drucker" + (druck.drucker === id ? " gewaehlt" : ""));
      k.type = "button";
      k.dataset.drucker = id;
      k.append(bildchen, el("span", "", name));
      k.addEventListener("click", () => { druck.drucker = id; zeichneDruck(); geaendert(); });
      wahl.append(k);
    }
    box.append(el("span", "", "Drucker:"), wahl);
    if (druck.drucker === "klasse") {
      const zeile = el("div", "druck-kopien");
      const minus = el("button", "ex-knopf druck-minus", "−");
      const plus = el("button", "ex-knopf druck-plus", "+");
      minus.type = plus.type = "button";
      minus.disabled = druck.kopien <= 1;
      plus.disabled = druck.kopien >= 9;
      minus.addEventListener("click", () => { druck.kopien--; zeichneDruck(); geaendert(); });
      plus.addEventListener("click", () => { druck.kopien++; zeichneDruck(); geaendert(); });
      zeile.append(el("span", "", "Anzahl Exemplare:"), minus, el("strong", "druck-zahl", String(druck.kopien)), plus);
      box.append(zeile);
    }
    const knoepfe = el("div", "sch-dialog-knoepfe");
    const ok = el("button", "knopf klein druck-ok", druck.drucker === "pdf" ? "Speichern …" : "Drucken");
    const abbruch = el("button", "knopf klein", "Abbrechen");
    ok.type = abbruch.type = "button";
    ok.addEventListener("click", () => {
      if (druck.drucker === "pdf") oeffneUnter("pdf");
      else ausloesen({ art: "drucken", drucker: druck.drucker, kopien: druck.kopien });
    });
    abbruch.addEventListener("click", schliesseDruck);
    knoepfe.append(ok, abbruch);
    box.append(knoepfe);
    dialog.replaceChildren(box);
    markiere();
  }
  function zeigeMeldung(text) {
    const m = el("div", "sch-meldung", text);
    wurzel.append(m);
    setTimeout(() => m.remove(), 1600);
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
    box.append(el("strong", "sch-dialog-titel", unter.als === "pdf" ? "Als PDF speichern" : "Speichern unter"));

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
    zeileName.append(el("span", "", "Dateiname:"), namensFeld,
      el("span", "sch-unter-typ", unter.als === "pdf" ? ".pdf (PDF)" : ".docx (Dokument)"));

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
    const endung = unter.als === "pdf" ? ".pdf" : ".docx";
    name = name.replace(/\.(docx|pdf)$/i, "") + endung;
    ausloesen({ art: "speichern-unter", ort: unter.ort, name, als: unter.als });
  }

  /* ---------- Markieren durch Ziehen ---------- */
  /* Welcher Buchstabe (0 bis Länge) liegt unter dem Mauszeiger? */
  function indexBei(e, nr) {
    const zeileEl = seite.querySelector(`.sch-zeile[data-nr="${nr}"]`);
    const laenge = dok.zeilen[nr].text.length;
    if (!zeileEl) return 0;
    const r = zeileEl.getBoundingClientRect();
    // außerhalb der Zeile: Anfang oder Ende
    if (e.clientY > r.bottom || e.clientX >= r.right) return laenge;
    if (e.clientY < r.top || e.clientX <= r.left) return 0;
    let knoten = null, versatz = 0;
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) { knoten = pos.offsetNode; versatz = pos.offset; }
    } else if (document.caretRangeFromPoint) {
      const pos = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (pos) { knoten = pos.startContainer; versatz = pos.startOffset; }
    }
    let summe = 0;
    for (const stueck of zeileEl.querySelectorAll(".sch-text")) {
      if (knoten && stueck.contains(knoten)) return Math.min(laenge, summe + versatz);
      summe += stueck.textContent.length;
    }
    // hinter dem letzten Buchstaben (rechts in der Zeile)
    return e.clientX > r.left + r.width / 2 ? laenge : 0;
  }
  seite.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const zeileEl = e.target.closest(".sch-zeile");
    if (!zeileEl) return;
    e.preventDefault(); // kein Markieren durch den Browser – das machen wir selbst
    const nr = Number(zeileEl.dataset.nr);
    if (dok.zeilen[nr].bild) {
      ausloesen({ art: "zeile-waehlen", nr, ganz: false });
      return;
    }
    ziehen = { nr, start: indexBei(e, nr), x: e.clientX, y: e.clientY, bewegt: false };
  });
  function beiBewegung(e) {
    if (!ziehen) return;
    if (!ziehen.bewegt && Math.hypot(e.clientX - ziehen.x, e.clientY - ziehen.y) < 5) return;
    ziehen.bewegt = true;
    teil = { nr: ziehen.nr, von: ziehen.start, bis: indexBei(e, ziehen.nr) };
    zeichne();
  }
  function beimLoslassen() {
    if (!ziehen) return;
    const { nr, bewegt } = ziehen;
    ziehen = null;
    if (!bewegt) {
      teil = null;
      ausloesen({ art: "zeile-waehlen", nr, ganz: false }); // nur Schreibstrich
      return;
    }
    const von = Math.min(teil.von, teil.bis);
    const bis = Math.max(teil.von, teil.bis);
    if (von === 0 && bis >= dok.zeilen[nr].text.length) {
      teil = null;
      ausloesen({ art: "zeile-waehlen", nr, ganz: true });
    } else {
      ausloesen({ art: "teil-markiert", nr });
    }
  }
  window.addEventListener("mousemove", beiBewegung);
  window.addEventListener("mouseup", beimLoslassen);

  /* ---------- Strg+S ---------- */
  function beiTaste(e) {
    if (!wurzel.isConnected || unter || druck) return;
    if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      ausloesen({ art: "speichern", weg: "tasten" });
    }
    if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      oeffneDruck();
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
      const e = el("div", "sch-zeile");
      e.dataset.nr = nr;
      if (zl.bild) {
        e.classList.add("sch-bild");
        e.classList.toggle("cursor", nr === auswahl);
        e.append(bildVon(zl.bild));
        return e;
      }
      e.dataset.text = zl.text;
      e.style.fontFamily = schriftMitErsatz(zl.schrift);
      e.style.fontSize = zl.groesse * ANZEIGE_FAKTOR + "px";
      e.style.color = FARBEN[zl.farbe].wert;
      e.style.fontWeight = zl.fett ? "bold" : "normal";
      e.style.fontStyle = zl.kursiv ? "italic" : "normal";
      e.style.textDecoration = zl.unterstrichen ? "underline" : "none";
      // Text in drei Stücke: davor – markiert – danach
      let von = 0, bis = 0;
      if (teil && teil.nr === nr) { von = Math.min(teil.von, teil.bis); bis = Math.max(teil.von, teil.bis); }
      e.append(el("span", "sch-text", zl.text.slice(0, von)), el("span", "sch-text teil", zl.text.slice(von, bis)), el("span", "sch-text", zl.text.slice(bis)));
      if (nr === auswahl && ganz) e.classList.add("markiert");
      else if (nr === auswahl && !teil) e.append(el("span", "schreibstrich"));
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
      case "status": return status;
      case "druck-drucker": return dialog.querySelector(`.druck-drucker[data-drucker="${h.wert}"]`);
      case "druck-plus": return dialog.querySelector(".druck-plus");
      case "druck-minus": return dialog.querySelector(".druck-minus");
      case "druck-ok": return dialog.querySelector(".druck-ok");
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
        if (h.wo === "knopf" || h.wo.startsWith("druck") || (h.wo.startsWith("unter") && h.wo !== "unter-name")) schild.classList.add("unten");
        if (h.wo === "zeile" || h.wo === "status") schild.classList.add("in-zeile");
        ziel.append(schild);
      }
    }
  }

  /* ---------- Erlaubte Aktionen ausführen (vom Desktop aufgerufen) ---------- */
  function anwenden(aktion) {
    if (aktion.programm !== "schreiben") return;
    if (aktion.art !== "teil-markiert") teil = null;
    switch (aktion.art) {
      case "zeile-waehlen":
        auswahl = aktion.nr;
        ganz = Boolean(aktion.ganz);
        break;
      case "teil-markiert":
        auswahl = aktion.nr;
        ganz = false;
        break;
      case "format":
        dok.zeilen[aktion.nr][aktion.eigenschaft] = aktion.wert;
        dok.gespeichert = false;
        break;
      case "bild-einfuegen": {
        const stelle = aktion.nach === null || aktion.nach === undefined ? dok.zeilen.length : aktion.nach + 1;
        dok.zeilen.splice(stelle, 0, { bild: aktion.bild });
        auswahl = stelle;
        ganz = false;
        dok.gespeichert = false;
        break;
      }
      case "speichern":
        // Noch nie gespeichert? Dann fragt das Programm erst nach Ort und Namen.
        if (!dok.name) { oeffneUnter(); return; }
        dok.gespeichert = true;
        break;
      case "drucken":
        dok.gedruckt = { drucker: aktion.drucker, kopien: aktion.kopien };
        druck = null;
        dialog.hidden = true;
        zeigeMeldung(`Wird gedruckt: ${aktion.kopien} ${aktion.kopien === 1 ? "Exemplar" : "Exemplare"}`);
        break;
      case "speichern-unter":
        fs.lege(verbinde(aktion.ort, aktion.name));
        if (aktion.als === "pdf") {
          // Ein PDF ist eine Kopie zum Lesen – das Dokument selbst bleibt, wie es ist
          unter = null;
          dialog.hidden = true;
          zeigeMeldung("Als PDF gespeichert: " + aktion.name);
          break;
        }
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
    get ganz() { return ganz; },
    get offen() { return offen; },
    get unter() { return unter; },
    get druck() { return druck; },
    setzeHilfe(liste) { hilfe = liste || []; markiere(); },
    elementFuer,
    // für Bits Vorführung
    setzeName(text) { if (namensFeld) { namensFeld.value = text; unter.name = text; } },
    zeigeTeil(nr, bis) { teil = { nr, von: 0, bis }; zeichne(); },
    markiereZeile(nr) { teil = null; ausloesen({ art: "zeile-waehlen", nr, ganz: true }); },
    setzeStrich(nr) { teil = null; ausloesen({ art: "zeile-waehlen", nr, ganz: false }); },
    beenden() {
      window.removeEventListener("keydown", beiTaste);
      window.removeEventListener("mousemove", beiBewegung);
      window.removeEventListener("mouseup", beimLoslassen);
    },
  };
  zeichne();
  if (kontext.beiStart) kontext.beiStart(programm);
  return wurzel;
}

export { ortName };
