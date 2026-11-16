/* =====================================================================
   AUFGABENTYP „SCHREIBEN“ (Welt 5: Programmpalast)
   Das Textprogramm (src/desktop/schreiben.js) ist bildschirmgroß offen.
   Das Kind soll speichern, Schrift und Farbe ändern, fett/kursiv/
   unterstrichen setzen, Bilder einfügen und „Speichern unter“ nutzen.

   Einstellungen (aus den Level-Daten):
     runden    – wie viele Aufgaben
     gemischt  – false: Aufgaben in der angegebenen Reihenfolge (Standard: gemischt)
     aufgaben  – Liste von Aufgaben, jede so:
       {
         start: {
           dokument: { name: "Brief.docx", ort: "/Dokumente", gespeichert: false,
                       zeilen: ["Liebe Oma,", …] }
                     (name: null = neues Dokument, noch nie gespeichert)
           dateien:  ["Dokumente/Schule/"]  – zusätzliche Ordner für „Speichern unter“
           weiter:   true = Dokument und Dateien der vorigen Aufgabe weiterbenutzen
         },
         schritte: [{ ziel: { … }, ansage: "…" }]
       }
     Ziele:
       { gespeichert: true }                     Speichern (egal wie)
       { gespeichert: true, weg: "symbol" }      mit dem Speichern-Symbol
       { gespeichert: true, weg: "tasten" }      mit Strg+S
       { format: { zeile: "Einladung", fett: true, groesse: 36 } }
           Eigenschaften: schrift, groesse, farbe, fett, kursiv, unterstrichen
       { bild: { bild: "haus", nach: "Einladung" } }   (nach darf fehlen)
       { gespeichertUnter: { ort: "/Dokumente/Schule", name: "Referat.docx" } }
           ersteSpeicherung: true = neues Dokument, „Speichern“ öffnet den Dialog
           (sonst zeigt die Hilfe auf Datei → Speichern unter)
       { gedruckt: { kopien: 2 } }               am Klassen-Drucker gedruckt
       { pdf: { ort: "/Dokumente", name: "Einladung.pdf" } }   als PDF gespeichert
     Formatieren geht nur, wenn die GANZE Zeile markiert ist (Ziehen mit der
     Maus). Für ein Bild reicht ein Klick in die Zeile (Schreibstrich).
     Mögliche Werte stehen oben in src/desktop/schreiben.js.

   Falsche Änderungen wirken nicht – Bit erklärt, was gesucht ist.
   ===================================================================== */

import { baueDesktop } from "../../desktop/desktop.js";
import { baueDateisystem, teile, elternVon, verbinde } from "../../desktop/dateisystem.js";
import { neuesDokument, FARBEN, BILDER, ortName } from "../../desktop/schreiben.js";
import { mischen, zeigeMaus, demoBuehne } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 900;
const KNOEPFE_AN_AUS = ["fett", "kursiv", "unterstrichen"];
const NAMEN = {
  fett: "fett (dicke Buchstaben)",
  kursiv: "kursiv (schräge Buchstaben)",
  unterstrichen: "unterstrichen",
  schrift: "die Schriftart",
  groesse: "die Schriftgröße",
  farbe: "die Schriftfarbe",
};

const klein = (x) => String(x).toLowerCase();
const ohneEndung = (name) => name.replace(/\.(docx|pdf)$/i, "");
const zeilenNr = (dok, text) => dok.zeilen.findIndex((z) => !z.bild && z.text === text);

function reihenfolge(aufgaben, runden, gemischt) {
  const liste = [];
  while (liste.length < runden) liste.push(...(gemischt === false ? aufgaben : mischen(aufgaben)));
  return liste.slice(0, runden);
}

/* Eigenschaften eines Format-Ziels ohne "zeile" */
const eigenschaften = (f) => Object.keys(f).filter((x) => x !== "zeile");

/* ---------- Ist ein Ziel erreicht? ---------- */
function erfuellt(ziel, dok, fs) {
  if (ziel.gespeichert) return dok.gespeichert;
  if (ziel.format) {
    const z = dok.zeilen[zeilenNr(dok, ziel.format.zeile)];
    return Boolean(z) && eigenschaften(ziel.format).every((e) => z[e] === ziel.format[e]);
  }
  if (ziel.bild) {
    const i = dok.zeilen.findIndex((z) => z.bild === ziel.bild.bild);
    if (i < 0) return false;
    return !ziel.bild.nach || i === zeilenNr(dok, ziel.bild.nach) + 1;
  }
  if (ziel.gespeichertUnter) {
    const { ort, name } = ziel.gespeichertUnter;
    return fs.existiert(verbinde(ort, name)) && klein(dok.name) === klein(name) && dok.gespeichert;
  }
  if (ziel.gedruckt) return Boolean(dok.gedruckt) && dok.gedruckt.kopien === ziel.gedruckt.kopien;
  if (ziel.pdf) return fs.existiert(verbinde(ziel.pdf.ort, ziel.pdf.name));
  return false;
}

/* ---------- Darf die Aktion wirken? ----------
   Rückgabe: { ok } oder { ok: false, hinweis } oder
             { ok: false, hinweis, keinFehler: true } (nur ein freundlicher Tipp) */
function falscherWert(e, soll) {
  if (KNOEPFE_AN_AUS.includes(e)) return soll ? `Die Zeile soll ${NAMEN[e].split(" ")[0]} bleiben.` : `Die Zeile soll nicht ${NAMEN[e].split(" ")[0]} sein.`;
  if (e === "schrift") return `Die Schriftart soll „${soll}“ sein.`;
  if (e === "groesse") return `Die Schriftgröße soll ${soll} sein.`;
  if (e === "farbe") return `Die Farbe soll ${FARBEN[soll].name} sein.`;
  return "Das passt noch nicht.";
}

function bewerte(aktion, ziel, dok) {
  const { art } = aktion;
  if (["minimieren", "maximieren", "wiederherstellen", "schliessen", "taskleiste"].includes(art)) {
    return { ok: false, hinweis: "Lass das Programm offen – hier arbeiten wir gerade." };
  }
  if (art === "oeffnen") return { ok: false, hinweis: "Jetzt brauchst du kein anderes Programm." };
  if (["zeile-waehlen", "start-auf", "start-zu", "aktivieren"].includes(art)) return { ok: true };
  if (art === "teil-markiert") {
    return ziel.format
      ? { ok: true, keinFehler: true, hinweis: "Fast! Markier die ganze Zeile – vom ersten bis zum letzten Buchstaben." }
      : { ok: true };
  }

  if (art === "format") {
    if (aktion.nr === null || aktion.nr === undefined) {
      return { ok: false, keinFehler: true, hinweis: "Klick zuerst auf die Zeile, die du ändern willst." };
    }
    const z = dok.zeilen[aktion.nr];
    if (z.bild) return { ok: false, keinFehler: true, hinweis: "Das ist ein Bild. Markier eine Zeile mit Text." };
    if (!aktion.ganz) {
      return { ok: false, keinFehler: true, hinweis: "Markier zuerst die ganze Zeile: Maustaste drücken, festhalten und über die Zeile ziehen." };
    }
    const f = ziel.format;
    if (!f) return { ok: false, hinweis: "Jetzt bitte nichts an der Schrift ändern." };
    if (z.text !== f.zeile) return { ok: false, hinweis: `Das ist die falsche Zeile. Markier zuerst „${f.zeile}“.` };
    const e = aktion.eigenschaft;
    if (!(e in f)) {
      const gesucht = eigenschaften(f).find((x) => z[x] !== f[x]) || eigenschaften(f)[0];
      return { ok: false, hinweis: `Das war ${NAMEN[e]}. Gesucht ist ${NAMEN[gesucht]}.` };
    }
    if (f[e] !== aktion.wert) return { ok: false, hinweis: falscherWert(e, f[e]) };
    return { ok: true };
  }

  if (art === "bild-einfuegen") {
    const b = ziel.bild;
    if (!b) return { ok: false, hinweis: "Jetzt brauchst du kein Bild." };
    if (aktion.bild !== b.bild) return { ok: false, hinweis: `Gesucht ist das Bild „${BILDER[b.bild].name}“.` };
    if (b.nach) {
      const nach = aktion.nach === null || aktion.nach === undefined ? null : dok.zeilen[aktion.nach];
      if (!nach || nach.text !== b.nach) {
        return { ok: false, hinweis: `Das Bild soll unter die Zeile „${b.nach}“. Klick zuerst in diese Zeile.` };
      }
    }
    return { ok: true };
  }

  if (art === "speichern") {
    if (!dok.name) return { ok: true }; // öffnet „Speichern unter“
    if (ziel.gespeichertUnter) {
      return { ok: false, hinweis: "„Speichern“ speichert nur am alten Platz mit dem alten Namen. Hier brauchst du „Speichern unter“ im Menü „Datei“." };
    }
    if (ziel.gespeichert && ziel.weg && aktion.weg !== ziel.weg) {
      const anders = aktion.weg === "tasten" ? "Strg+S klappt auch!" : "Das klappt auch!";
      return {
        ok: false, keinFehler: true,
        hinweis: ziel.weg === "symbol"
          ? anders + " Aber nimm diesmal das Speichern-Symbol – die Diskette."
          : anders + " Aber probier diesmal die Tastenkombination: Strg+S.",
      };
    }
    return { ok: true };
  }

  if (art === "drucken") {
    if (ziel.pdf) return { ok: false, hinweis: "Hier soll nichts auf Papier gedruckt werden. Wähl „Als PDF speichern“." };
    if (!ziel.gedruckt) return { ok: false, hinweis: "Jetzt bitte nichts drucken – das kostet Papier." };
    const k = ziel.gedruckt.kopien;
    if (aktion.kopien !== k) return { ok: false, hinweis: `Es sollen ${k} ${k === 1 ? "Exemplar" : "Exemplare"} sein. Stell die Anzahl mit + und − ein.` };
    return { ok: true };
  }

  if (art === "speichern-unter" && aktion.als === "pdf") {
    const g = ziel.pdf;
    if (!g) {
      if (ziel.gedruckt) return { ok: false, hinweis: "Hier soll auf Papier gedruckt werden. Wähl den „Drucker im Klassenzimmer“." };
      return { ok: false, hinweis: ziel.gespeichertUnter ? "Das wäre ein PDF. Gesucht ist das Dokument selbst: Datei → Speichern unter." : "Jetzt brauchst du kein PDF." };
    }
    if (klein(aktion.ort) !== klein(g.ort)) {
      return { ok: false, hinweis: `Du bist im Ordner „${ortName(aktion.ort)}“. Das PDF soll in den Ordner „${ortName(g.ort)}“.` };
    }
    if (klein(aktion.name) !== klein(g.name)) return { ok: false, hinweis: `Der Name soll „${ohneEndung(g.name)}“ sein.` };
    return { ok: true };
  }

  if (art === "speichern-unter") {
    if (ziel.pdf) return { ok: false, hinweis: "Das wäre ein normales Dokument. Für ein PDF: Datei → Drucken → „Als PDF speichern“." };
    const g = ziel.gespeichertUnter;
    if (!g) return { ok: true };
    if (klein(aktion.ort) !== klein(g.ort)) {
      return { ok: false, hinweis: `Du bist im Ordner „${ortName(aktion.ort)}“. Das Dokument soll in den Ordner „${ortName(g.ort)}“.` };
    }
    if (klein(aktion.name) !== klein(g.name)) return { ok: false, hinweis: `Der Name soll „${ohneEndung(g.name)}“ sein.` };
    return { ok: true };
  }
  return { ok: true };
}

/* ---------- Hilfe beim Üben: Wo muss ich als Nächstes hin? ---------- */
function hilfeFuer(ziel, dok, prog) {
  if (ziel.format) {
    const f = ziel.format;
    const nr = zeilenNr(dok, f.zeile);
    if (prog.auswahl !== nr || !prog.ganz) return [{ wo: "zeile", nr, text: "Über die ganze Zeile ziehen", ziehen: true }];
    const e = eigenschaften(f).find((x) => dok.zeilen[nr][x] !== f[x]);
    if (!e) return [];
    if (KNOEPFE_AN_AUS.includes(e)) return [{ wo: "knopf", id: e, text: "Hier klicken" }];
    if (prog.offen === e) return [{ wo: "option", liste: e, wert: f[e] }];
    return [{ wo: "knopf", id: e, text: "Hier klicken" }];
  }
  if (ziel.bild) {
    const b = ziel.bild;
    if (b.nach && prog.auswahl !== zeilenNr(dok, b.nach)) return [{ wo: "zeile", nr: zeilenNr(dok, b.nach), text: "In die Zeile klicken" }];
    if (prog.offen === "bild") return [{ wo: "option", liste: "bild", wert: b.bild }];
    return [{ wo: "knopf", id: "bild", text: "Hier klicken" }];
  }
  if (ziel.gespeichert) {
    if (ziel.weg === "tasten") return [{ wo: "status", text: "Strg + S drücken" }];
    return [{ wo: "knopf", id: "speichern", text: "Hier klicken" }];
  }
  if (ziel.gespeichertUnter) {
    const g = ziel.gespeichertUnter;
    const u = prog.unter;
    if (!u) {
      if (g.ersteSpeicherung && !dok.name) return [{ wo: "knopf", id: "speichern", text: "Hier klicken" }];
      if (prog.offen === "datei") return [{ wo: "option", liste: "datei", wert: "unter" }];
      return [{ wo: "knopf", id: "datei", text: "Hier klicken" }];
    }
    return unterHilfe(g, u);
  }
  if (ziel.gedruckt) {
    const d = prog.druck;
    if (!d) return prog.offen === "datei" ? [{ wo: "option", liste: "datei", wert: "drucken" }] : [{ wo: "knopf", id: "datei", text: "Hier klicken" }];
    if (d.drucker !== "klasse") return [{ wo: "druck-drucker", wert: "klasse", text: "Hier klicken" }];
    if (d.kopien < ziel.gedruckt.kopien) return [{ wo: "druck-plus", text: "Hier klicken" }];
    if (d.kopien > ziel.gedruckt.kopien) return [{ wo: "druck-minus", text: "Hier klicken" }];
    return [{ wo: "druck-ok", text: "Hier klicken" }];
  }
  if (ziel.pdf) {
    const u = prog.unter;
    if (u && u.als === "pdf") return unterHilfe(ziel.pdf, u);
    const d = prog.druck;
    if (!d) return prog.offen === "datei" ? [{ wo: "option", liste: "datei", wert: "drucken" }] : [{ wo: "knopf", id: "datei", text: "Hier klicken" }];
    if (d.drucker !== "pdf") return [{ wo: "druck-drucker", wert: "pdf", text: "Hier klicken" }];
    return [{ wo: "druck-ok", text: "Hier klicken" }];
  }
  return [];
}

/* Hilfe im Speichern-Fenster: Ordner finden, Namen tippen, speichern */
function unterHilfe(g, u) {
  if (klein(u.ort) !== klein(g.ort)) {
    const tiefer = u.ort === "/" || klein(g.ort).startsWith(klein(u.ort) + "/");
    if (!tiefer) return [{ wo: "unter-hoch", text: "Hier klicken" }];
    const naechstes = "/" + teile(g.ort).slice(0, teile(u.ort).length + 1).join("/");
    return [{ wo: "unter-ordner", pfad: naechstes, text: "Doppelklick" }];
  }
  if (klein(ohneEndung(u.name.trim())) !== klein(ohneEndung(g.name))) {
    return [{ wo: "unter-name", text: `„${ohneEndung(g.name)}“ tippen` }];
  }
  return [{ wo: "unter-speichern", text: "Hier klicken" }];
}

/* ---------- Dokument und Dateien für eine Aufgabe ---------- */
function bereite(start, alt) {
  if (start.weiter && alt) {
    for (const e of start.dateien || []) alt.fs.lege(e);
    return alt;
  }
  return { fs: baueDateisystem(start.dateien || []), dok: neuesDokument(start.dokument) };
}

function mitteInProzent(element, flaeche) {
  const r = flaeche.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  return [((e.left + Math.min(e.width / 2, 60) - r.left) / r.width) * 100, ((e.top + e.height / 2 - r.top) / r.height) * 100];
}

export const schreiben = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiHinweis, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const liste = reihenfolge(einstellungen.aufgaben, runden, einstellungen.gemischt);
    let runde = 0;
    let schritte = [];
    let nr = 0;
    let platz = null;        // { fs, dok }
    let prog = null;         // das Textprogramm der aktuellen Aufgabe
    let gesperrt = false;
    let timer = null;

    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste: klicken – oder drücken, halten und ziehen.");

    function aktualisiereHilfe() {
      if (!prog || !mitHilfe) return;
      prog.setzeHilfe(gesperrt || !schritte[nr] ? [] : hilfeFuer(schritte[nr].ziel, platz.dok, prog));
    }

    function pruefer(aktion) {
      if (gesperrt || !schritte[nr]) return false;
      const urteil = bewerte(aktion, schritte[nr].ziel, platz.dok);
      if (urteil.hinweis) (urteil.keinFehler ? beiHinweis : beiFehler)(urteil.hinweis);
      return urteil.ok;
    }

    function beiAktion() {
      if (gesperrt) return;
      if (!erfuellt(schritte[nr].ziel, platz.dok, platz.fs)) {
        aktualisiereHilfe();
        return;
      }
      nr++;
      if (nr < schritte.length) {
        zeigeSchritt();
        return;
      }
      runde++;
      gesperrt = true;
      aktualisiereHilfe();
      beiRichtig(runde, runden);
      timer = setTimeout(() => {
        if (runde >= runden) beiFertig();
        else starteRunde();
      }, RUNDE_PAUSE_MS);
    }

    const desk = baueDesktop(flaeche, { pruefer, beiAktion });

    function zeigeSchritt() {
      beiAnsage(schritte[nr].ansage);
      aktualisiereHilfe();
    }

    function starteRunde() {
      const aufgabe = liste[runde];
      if (prog) prog.beenden();
      platz = bereite(aufgabe.start, platz);
      desk.setze({
        offen: [{ programm: "schreiben", zustand: "maximiert" }],
        kontext: {
          fs: platz.fs,
          dokument: platz.dok,
          beiStart: (neu) => { prog = neu; },
          beiAenderung: () => aktualisiereHilfe(),
        },
      });
      schritte = aufgabe.schritte;
      nr = 0;
      gesperrt = false;
      zeigeSchritt();
    }
    starteRunde();

    return {
      beenden() {
        clearTimeout(timer);
        if (prog) prog.beenden();
        desk.beenden();
      },
    };
  },

  /* Vorführung: Bit erledigt die erste Aufgabe – der Zeiger folgt der Hilfe. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const aufgabe = einstellungen.aufgaben[0];
    const desk = baueDesktop(flaeche);
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, "links", "Linke Taste: klicken – oder drücken, halten und ziehen.");
    let prog = null;
    let platz = null;
    let timer = [];

    function schritt(nr, zaehler) {
      const ziel = aufgabe.schritte[nr] && aufgabe.schritte[nr].ziel;
      if (!ziel || zaehler > 14) {
        timer.push(setTimeout(durchlauf, 2500));
        return;
      }
      if (erfuellt(ziel, platz.dok, platz.fs)) return schritt(nr + 1, zaehler);
      const hilfe = hilfeFuer(ziel, platz.dok, prog);
      const h = hilfe[0];
      const element = h && prog.elementFuer(h);
      if (!element) {
        timer.push(setTimeout(durchlauf, 2500));
        return;
      }
      prog.setzeHilfe(hilfe);
      buehne.sage("");
      if (h.ziehen) {
        // zum Anfang der Zeile, dort beginnt das Markieren
        const r = element.getBoundingClientRect();
        const f = flaeche.getBoundingClientRect();
        buehne.bewege(((r.left + 6 - f.left) / f.width) * 100, ((r.top + r.height / 2 - f.top) / f.height) * 100, 1000);
      } else {
        buehne.bewege(...mitteInProzent(element, flaeche), 1000);
      }
      timer.push(setTimeout(() => {
        buehne.sage(h.text === "Doppelklick" ? "Doppelklick!" : h.wo === "unter-name" ? "Tippen" : "Klick!");
        if (h.wo === "unter-name") {
          const name = ohneEndung((ziel.gespeichertUnter || ziel.pdf).name);
          [...name].forEach((_, i) => timer.push(setTimeout(() => { prog.setzeName(name.slice(0, i + 1)); prog.setzeHilfe(hilfeFuer(ziel, platz.dok, prog)); }, 150 * i)));
          timer.push(setTimeout(() => schritt(nr, zaehler + 1), 150 * name.length + 500));
          return;
        }
        if (h.ziehen) {
          // über die Zeile ziehen: Markierung wächst Buchstabe für Buchstabe
          const r = element.getBoundingClientRect();
          const f = flaeche.getBoundingClientRect();
          const laenge = platz.dok.zeilen[h.nr].text.length;
          buehne.sage("Drücken und ziehen");
          timer.push(setTimeout(() => buehne.bewege(((r.left + r.width * 0.8 - f.left) / f.width) * 100, ((r.top + r.height / 2 - f.top) / f.height) * 100, 1400), 300));
          for (let i = 1; i <= laenge; i++) timer.push(setTimeout(() => prog.zeigeTeil(h.nr, i), 300 + (1300 / laenge) * i));
          timer.push(setTimeout(() => { buehne.sage("Loslassen!"); prog.markiereZeile(h.nr); }, 1800));
          timer.push(setTimeout(() => schritt(nr, zaehler + 1), 2500));
          return;
        }
        if (h.wo === "zeile") prog.setzeStrich(h.nr);
        else if (h.wo === "status") { buehne.sage("Strg + S"); desk.fuehreAus({ programm: "schreiben", art: "speichern", weg: "tasten" }); }
        else if (h.text === "Doppelklick") element.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        else element.click();
        timer.push(setTimeout(() => schritt(nr, zaehler + 1), 700));
      }, 1200));
    }

    function durchlauf() {
      timer.forEach(clearTimeout);
      timer = [];
      if (prog) prog.beenden();
      platz = bereite(aufgabe.start, null);
      desk.setze({
        offen: [{ programm: "schreiben", zustand: "maximiert" }],
        kontext: { fs: platz.fs, dokument: platz.dok, beiStart: (neu) => { prog = neu; } },
      });
      buehne.setze(50, 70);
      buehne.sage("");
      timer.push(setTimeout(() => schritt(0, 0), 800));
    }
    durchlauf();

    return {
      beenden() {
        timer.forEach(clearTimeout);
        if (prog) prog.beenden();
        buehne.beenden();
        desk.beenden();
      },
    };
  },
};

export { elternVon };
