/* =====================================================================
   AUFGABENTYP „EDITOR“ (Welt 2: Tastaturtal)
   Ein kleines Textfenster („Notizen“), in dem die Tasten wirklich wirken:
   Rücktaste löscht links vom Strich, Strg+Z holt Gelöschtes zurück,
   Strg+C und Strg+V kopieren und fügen ein, Strg+S speichert usw.
   Dazu kann ein Meldungsfenster erscheinen (Enter = OK, Esc = Abbrechen)
   oder ein kleines Formular (Tab springt ins nächste Feld).

   Einstellungen (aus den Level-Daten):
     runden    – wie viele Aufgaben
     gemischt  – false: Aufgaben in der angegebenen Reihenfolge (Standard: gemischt)
     zeige     – was das Fenster zusätzlich anzeigt:
                 { speichern: true, ablage: true, feststell: true }
     aufgaben  – Liste von Aufgaben, jede so:
       {
         start: {
           text:     Anfangstext. Darin bedeuten:
                       |      Schreibstrich (Cursor)
                       [x]    der Buchstabe x ist rot markiert („falsch“)
                       {Wort} Wort ist markiert (ausgewählt)
                       ^      Stelle, an die der Strich nach dem Kopieren springt
           vorher:   Text, den Strg+Z zurückholt (etwas wurde „gerade gelöscht“)
           dialog:   { text: "…" } – ein Meldungsfenster ist offen
           felder:   ["Tier", "Farbe", "Essen"] – Formular statt Text
         },
         schritte: [
           { taste: "Enter", ansage: "…" }        eine Taste oder Kombination
           { taste: ["Rücktaste", "Entf"], … }    eine von mehreren ist richtig
           { taste: "Strg+C", zumZiel: true, … }  danach springt der Strich zu ^
           { tippe: "Käse", ansage: "…" }         Text schreiben
         ]
       }
     Tastennamen: Enter, Leertaste, Tab, Esc, Rücktaste, Entf,
                  Strg+A, Strg+C, Strg+X, Strg+V, Strg+Z, Strg+S,
                  Pfeiltasten: →, ←, Umschalt+→, Strg+→, Strg+Umschalt+→ (ebenso mit ←)
   ===================================================================== */

import { baueTastatur, tastenFuerZeichen, tastenFuerName } from "./tastatur-bild.js";
import { mischen } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 900; // so lange bleibt das Ergebnis einer Aufgabe stehen

/* ---------------- Tastennamen ---------------- */

const NAMEN = {
  "Enter": "Enter", "Leertaste": " ", "Tab": "Tab", "Esc": "Escape",
  "Rücktaste": "Backspace", "Entf": "Delete",
};
const TASTEN_MIT_WIRKUNG = ["Enter", "Tab", "Escape", "Backspace", "Delete", "ArrowLeft", "ArrowRight"];
const PFEILE = { "→": "ArrowRight", "←": "ArrowLeft" };

/* "Strg+Z" -> "strg+z", "Rücktaste" -> "Backspace",
   "Strg+Umschalt+→" -> "strg+umschalt+ArrowRight" */
function wertVon(name) {
  const pfeil = Object.keys(PFEILE).find((p) => name.endsWith(p));
  if (pfeil) {
    return (name.includes("Strg+") ? "strg+" : "") + (name.includes("Umschalt+") ? "umschalt+" : "") + PFEILE[pfeil];
  }
  if (name.startsWith("Strg+")) return "strg+" + name.slice(5).toLowerCase();
  return NAMEN[name];
}
function nameVon(wert) {
  if (wert.includes("Arrow")) {
    const pfeil = wert.endsWith("Right") ? "→" : "←";
    return (wert.includes("strg+") ? "Strg+" : "") + (wert.includes("umschalt+") ? "Umschalt+" : "") + pfeil;
  }
  if (wert.startsWith("strg+")) return "Strg+" + wert.slice(5).toUpperCase();
  const name = Object.keys(NAMEN).find((n) => NAMEN[n] === wert);
  return name || `„${wert}“`;
}

/* Macht aus einem Tastendruck eine „Aktion“ – oder null, wenn die Taste
   allein nichts bewirkt (Umschalt, Strg, Alt, AltGr, Feststelltaste …) */
function aktionAus(e) {
  if (e.key.length !== 1 && !TASTEN_MIT_WIRKUNG.includes(e.key)) return null;
  // AltGr meldet Windows als Strg+Alt – das ist KEINE Strg-Kombination
  const altGr = e.altKey || (e.getModifierState && e.getModifierState("AltGraph"));
  if (e.ctrlKey && !altGr && !e.metaKey && e.key.length === 1) {
    return { art: "kuerzel", wert: "strg+" + e.key.toLowerCase() };
  }
  // Pfeiltasten mit Strg und/oder Umschalt
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    return { art: e.ctrlKey || e.shiftKey ? "kuerzel" : "taste", wert: (e.ctrlKey ? "strg+" : "") + (e.shiftKey ? "umschalt+" : "") + e.key };
  }
  if (e.key.length === 1) return { art: "zeichen", wert: e.key };
  return { art: "taste", wert: e.key };
}

/* ---------------- Der Text und was man damit machen kann ---------------- */

/* Liest die Kurzschreibweise des Anfangstexts (siehe oben) */
function leseText(vorlage) {
  let text = "", cursor = null, falsch = null, ziel = null, aStart = null, aEnde = null;
  let imFalsch = false;
  for (const z of vorlage) {
    if (z === "|") cursor = text.length;
    else if (z === "^") ziel = text.length;
    else if (z === "[") imFalsch = true;
    else if (z === "]") imFalsch = false;
    else if (z === "{") aStart = text.length;
    else if (z === "}") aEnde = text.length;
    else {
      if (imFalsch) falsch = text.length;
      text += z;
    }
  }
  const auswahl = aStart !== null && aEnde !== null ? [aStart, aEnde] : null;
  if (cursor === null) cursor = auswahl ? auswahl[1] : text.length;
  return { text, cursor, falsch, ziel, auswahl };
}

function neuerZustand(start = {}) {
  const z = leseText(start.text || "");
  z.ablage = null;            // Zwischenablage
  z.anker = null;             // Beginn einer Markierung mit Umschalt+Pfeil
  z.gespeichert = false;
  z.dialog = start.dialog ? { ...start.dialog } : null;
  z.felder = start.felder ? { namen: start.felder, fokus: 0 } : null;
  // Verlauf für Strg+Z: Liste früherer Zustände
  z.verlauf = start.vorher ? [{ text: start.vorher, cursor: start.vorher.length }] : [];
  return z;
}

function merke(z) {
  z.verlauf.push({ text: z.text, cursor: z.cursor });
}
function geaendert(z) {
  z.gespeichert = false;
  z.falsch = null;
}
function auswahlText(z) {
  return z.auswahl ? z.text.slice(z.auswahl[0], z.auswahl[1]) : "";
}
function loescheAuswahl(z) {
  const [a, b] = z.auswahl;
  z.text = z.text.slice(0, a) + z.text.slice(b);
  z.cursor = a;
  if (z.ziel !== null && z.ziel >= b) z.ziel -= b - a; // Zielstelle rutscht mit
  z.auswahl = null;
}
function einfuegen(z, neu, merken = true) {
  if (merken) merke(z);
  if (z.auswahl) loescheAuswahl(z);
  z.text = z.text.slice(0, z.cursor) + neu + z.text.slice(z.cursor);
  z.cursor += neu.length;
  geaendert(z);
}

/* Wortgrenzen wie bei Windows: Strg+→ springt hinter das Wort und die
   Leerzeichen danach, Strg+← an den Anfang des Worts davor. */
function wortRechts(text, i) {
  while (i < text.length && text[i] !== " " && text[i] !== "\n") i++;
  while (i < text.length && text[i] === " ") i++;
  return i;
}
function wortLinks(text, i) {
  while (i > 0 && text[i - 1] === " ") i--;
  while (i > 0 && text[i - 1] !== " " && text[i - 1] !== "\n") i--;
  return i;
}

/* Pfeiltasten: Strich bewegen, mit Umschalt dabei markieren */
function bewegePfeil(z, wert) {
  const markieren = wert.includes("umschalt+");
  const wortweise = wert.includes("strg+");
  const rechts = wert.endsWith("Right");
  // Anker = Stelle, an der das Markieren begonnen hat
  if (markieren && z.anker === null) z.anker = z.cursor;
  if (!markieren && z.auswahl) {
    // ohne Umschalt: Markierung aufheben, Strich an ihren Rand
    z.cursor = rechts ? z.auswahl[1] : z.auswahl[0];
    z.anker = null;
    z.auswahl = null;
    if (!wortweise) return;
  }
  if (wortweise) z.cursor = rechts ? wortRechts(z.text, z.cursor) : wortLinks(z.text, z.cursor);
  else z.cursor = Math.max(0, Math.min(z.text.length, z.cursor + (rechts ? 1 : -1)));
  if (markieren && z.anker !== z.cursor) z.auswahl = [Math.min(z.anker, z.cursor), Math.max(z.anker, z.cursor)];
  else if (markieren) z.auswahl = null;
  else z.anker = null;
}

/* Führt eine Taste oder Kombination wirklich aus */
function wende(z, wert, schritt = {}) {
  if (wert.includes("Arrow")) {
    bewegePfeil(z, wert);
    return;
  }
  z.anker = null;
  switch (wert) {
    case "Enter":
      if (z.dialog) z.dialog = null; // OK
      else einfuegen(z, "\n");
      break;
    case "Escape":
      z.dialog = null; // Abbrechen
      break;
    case "Tab":
      if (z.felder) z.felder.fokus = Math.min(z.felder.fokus + 1, z.felder.namen.length - 1);
      break;
    case "Backspace":
      merke(z);
      if (z.auswahl) loescheAuswahl(z);
      else if (z.cursor > 0) {
        z.text = z.text.slice(0, z.cursor - 1) + z.text.slice(z.cursor);
        z.cursor--;
      }
      geaendert(z);
      break;
    case "Delete":
      merke(z);
      if (z.auswahl) loescheAuswahl(z);
      else z.text = z.text.slice(0, z.cursor) + z.text.slice(z.cursor + 1);
      geaendert(z);
      break;
    case "strg+a":
      z.auswahl = [0, z.text.length];
      z.cursor = z.text.length;
      break;
    case "strg+c":
      z.ablage = auswahlText(z);
      break;
    case "strg+x":
      z.ablage = auswahlText(z);
      merke(z);
      loescheAuswahl(z);
      geaendert(z);
      break;
    case "strg+v":
      if (z.ablage) einfuegen(z, z.ablage);
      break;
    case "strg+z": {
      const frueher = z.verlauf.pop();
      if (frueher) {
        z.text = frueher.text;
        z.cursor = frueher.cursor;
        z.auswahl = null;
        geaendert(z);
      }
      break;
    }
    case "strg+s":
      z.gespeichert = true;
      break;
    default:
      einfuegen(z, wert); // z. B. Leertaste
  }
  // Nach dem Kopieren/Ausschneiden setzt Bit den Strich an die Zielstelle
  if (schritt.zumZiel && z.ziel !== null) {
    z.auswahl = null;
    z.cursor = z.ziel;
  }
}

/* ---------------- Hinweise bei Fehlern ---------------- */

const UMLAUT_HILFE = {
  "ä": "Das ä hat eine eigene Taste: rechts neben dem Ö.",
  "ö": "Das ö hat eine eigene Taste: rechts neben dem L.",
  "ü": "Das ü hat eine eigene Taste: rechts neben dem P.",
  "ß": "Das ß findest du oben, rechts neben der 0.",
};

function hinweisZeichen(soll, ist, feststellAn, wort) {
  const lauterGrosse = wort.length > 1 && wort === wort.toUpperCase() && /[A-ZÄÖÜ]{2}/.test(wort);
  if (soll !== ist && soll === ist.toUpperCase()) {
    return lauterGrosse
      ? "Für lauter große Buchstaben: Drück einmal die Feststelltaste."
      : "Großer Buchstabe: Halte Umschalt gedrückt und drück dann den Buchstaben.";
  }
  if (soll !== ist && soll === ist.toLowerCase()) {
    return feststellAn
      ? "Hier kommt ein kleiner Buchstabe. Die Feststelltaste ist noch an – drück sie einmal."
      : "Hier kommt ein kleiner Buchstabe. Lass Umschalt los.";
  }
  if (soll === "@") return "Das @ bekommst du so: AltGr festhalten und Q drücken.";
  if (soll === "€") return "Das € bekommst du so: AltGr festhalten und E drücken.";
  if (UMLAUT_HILFE[soll]) return UMLAUT_HILFE[soll];
  if (UMLAUT_HILFE[soll.toLowerCase()]) return `Für ${soll}: Halte Umschalt gedrückt und drück die ${soll}-Taste.`;
  if (soll === " ") return "Jetzt kommt ein Abstand: Drück die Leertaste.";
  return `Schau genau hin: Als Nächstes kommt „${soll}“.`;
}

function hinweisTaste(erlaubt, aktion, mitHilfe) {
  const soll = erlaubt[0];
  if (soll.startsWith("strg+") && aktion.art === "zeichen" && aktion.wert.toLowerCase() === soll.slice(5)) {
    return "Halte dabei die Strg-Taste gedrückt.";
  }
  if (soll === "Backspace" && aktion.wert === "Delete") {
    return "Das war Entf. Entf löscht rechts vom Strich. Der rote Buchstabe steht links.";
  }
  if (soll === "Delete" && aktion.wert === "Backspace") {
    return "Das war die Rücktaste. Sie löscht links vom Strich. Der rote Buchstabe steht rechts.";
  }
  if (soll.includes("Arrow") && aktion.wert.includes("Arrow")) {
    return soll.includes("strg+") && soll.includes("umschalt+")
      ? `Das war ${nameVon(aktion.wert)}. Für ein ganzes Wort: Strg und Umschalt festhalten, dann den Pfeil drücken.`
      : `Das war ${nameVon(aktion.wert)}. Gesucht ist ${nameVon(soll)}.`;
  }
  if (["Enter", "Escape"].includes(soll) && ["Enter", "Escape"].includes(aktion.wert)) {
    return "Enter sagt „OK“. Esc bricht ab.";
  }
  if (aktion.art === "kuerzel") {
    return mitHilfe
      ? `Das war ${nameVon(aktion.wert)}. Gesucht ist ${nameVon(soll)}.`
      : `Das war ${nameVon(aktion.wert)}. Das passt hier nicht.`;
  }
  if (aktion.art === "zeichen" && aktion.wert !== " ") {
    return "Hier brauchst du keinen Buchstaben, sondern eine besondere Taste.";
  }
  return undefined; // allgemeiner Trost von Bit
}

/* ---------------- Ansicht: das Fenster auf dem Bildschirm ---------------- */

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  return e;
}

function baueAnsicht(zeige) {
  const vorlage = el("div", "vorlage");
  const fenster = el("div", "editor-fenster");
  const titel = el("div", "editor-titel");
  const speicher = el("span", "speicher-status");
  titel.append(el("span", "", "Notizen.txt"));
  if (zeige.speichern) titel.append(speicher);
  const koerper = el("div", "editor-koerper");
  const textFeld = el("div", "editor-text");
  const felderFeld = el("div", "editor-felder");
  const dialogFeld = el("div", "editor-dialog");
  koerper.append(textFeld, felderFeld, dialogFeld);
  const status = el("div", "editor-status");
  const ablage = el("span", "ablage");
  const feststell = el("span", "feststell");
  if (zeige.ablage) status.append(ablage);
  if (zeige.feststell) status.append(feststell);
  fenster.append(titel, koerper);
  if (zeige.ablage || zeige.feststell) fenster.append(status);

  function render(z, info = {}) {
    // Vorlage: Was soll geschrieben werden? Schon Geschriebenes ist grün.
    vorlage.hidden = !info.vorlageText;
    if (info.vorlageText) {
      const t = info.vorlageText, pos = info.vorlagePos;
      const naechstes = el("span", "naechstes", t[pos] === " " ? "␣" : t[pos] || "");
      vorlage.replaceChildren(
        el("span", "", "Schreib: "),
        el("span", "getippt", t.slice(0, pos)),
        naechstes,
        el("span", "", t.slice(pos + 1)),
      );
    }

    // Text mit Strich, Markierung und rotem Buchstaben
    textFeld.hidden = Boolean(z.felder);
    textFeld.replaceChildren();
    const [a, b] = z.auswahl || [-1, -1];
    for (let i = 0; i <= z.text.length; i++) {
      if (i === z.cursor) textFeld.append(el("span", "schreibstrich"));
      if (i === z.text.length) break;
      const zeichen = z.text[i];
      if (zeichen === "\n") {
        textFeld.append(document.createElement("br"));
        continue;
      }
      const span = el("span", "", zeichen);
      if (i >= a && i < b) span.className = "markiert";
      if (i === z.falsch) span.className = "falsch";
      textFeld.append(span);
    }

    // Formular
    felderFeld.hidden = !z.felder;
    if (z.felder) {
      felderFeld.replaceChildren(...z.felder.namen.map((name, i) => {
        const zeile = el("div", "feld-zeile");
        const kasten = el("div", "feld" + (i === z.felder.fokus ? " fokus" : "") + (i === info.zielFeld ? " ziel-feld" : ""));
        if (i === z.felder.fokus) kasten.append(el("span", "schreibstrich"));
        zeile.append(el("span", "feld-name", name + ":"), kasten);
        if (i === info.zielFeld) zeile.append(el("span", "ziel-schild-klein", "Hierhin"));
        return zeile;
      }));
    }

    // Meldungsfenster
    dialogFeld.hidden = !z.dialog;
    if (z.dialog) {
      const ok = el("span", "dialog-knopf", "OK");
      const abbrechen = el("span", "dialog-knopf", "Abbrechen");
      if (info.hilfeDialog === "ok") ok.classList.add("mit-hilfe");
      if (info.hilfeDialog === "abbrechen") abbrechen.classList.add("mit-hilfe");
      const knoepfe = el("div", "dialog-knoepfe");
      knoepfe.append(ok, abbrechen);
      const box = el("div", "dialog-box");
      box.append(el("p", "", z.dialog.text), knoepfe);
      dialogFeld.replaceChildren(box);
    }

    speicher.textContent = z.gespeichert ? "gespeichert ✓" : "nicht gespeichert";
    speicher.classList.toggle("gut", z.gespeichert);
    ablage.textContent = "Zwischenablage: " + (z.ablage ? `„${z.ablage}“` : "leer");
    feststell.textContent = "Feststelltaste: " + (info.feststellAn ? "AN" : "aus");
    feststell.classList.toggle("an", Boolean(info.feststellAn));
  }

  return { vorlage, fenster, render };
}

/* Reihenfolge der Aufgaben: gemischt (Standard) oder wie angegeben */
function reihenfolge(aufgaben, runden, gemischt) {
  const liste = [];
  while (liste.length < runden) liste.push(...(gemischt === false ? aufgaben : mischen(aufgaben)));
  return liste.slice(0, runden);
}

/* Hilfe zum aktuellen Schritt: welche Tasten zeigen, welcher Knopf, welches Feld */
function hilfeInfo(z, schritte, nr, getippt) {
  const s = schritte[nr];
  if (!s) return { tasten: [] };
  if (s.tippe) return { tasten: tastenFuerZeichen(s.tippe[getippt]) };
  const info = { tasten: tastenFuerName(s.taste) };
  const werte = [].concat(s.taste).map(wertVon);
  if (z.dialog) info.hilfeDialog = werte.includes("Enter") ? "ok" : "abbrechen";
  if (z.felder) {
    // Zielfeld = so viele Felder weiter, wie noch Tab-Schritte kommen
    const tabs = schritte.slice(nr).filter((x) => x.taste === "Tab").length;
    info.zielFeld = Math.min(z.felder.fokus + tabs, z.felder.namen.length - 1);
  }
  return info;
}

/* =====================================================================
   Der Aufgabentyp
   ===================================================================== */
export const editor = {

  starte({ flaeche, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const zeige = einstellungen.zeige || {};
    const liste = reihenfolge(einstellungen.aufgaben, runden, einstellungen.gemischt);

    const buehne = el("div", "editor-buehne");
    const ansicht = baueAnsicht(zeige);
    buehne.append(ansicht.vorlage, ansicht.fenster);
    const tastatur = mitHilfe ? baueTastatur() : null;
    if (tastatur) buehne.append(tastatur.element);
    flaeche.append(buehne);

    let runde = 0;
    let z = null;           // der aktuelle Text-Zustand
    let schritte = [];
    let nr = 0;             // Nummer des aktuellen Schritts
    let getippt = 0;        // bei "tippe": so viele Zeichen sind schon richtig
    let feststellAn = false;
    let gesperrt = false;   // kurz nach einer geschafften Aufgabe
    let timer = null;

    function zeichne() {
      const s = schritte[nr];
      const hilfe = mitHilfe && !gesperrt ? hilfeInfo(z, schritte, nr, getippt) : { tasten: [] };
      ansicht.render(z, {
        vorlageText: s && s.tippe,
        vorlagePos: getippt,
        feststellAn,
        hilfeDialog: hilfe.hilfeDialog,
        zielFeld: hilfe.zielFeld,
      });
      if (tastatur) tastatur.markiere(hilfe.tasten);
    }

    function starteRunde() {
      const aufgabe = liste[runde];
      z = neuerZustand(aufgabe.start);
      schritte = aufgabe.schritte;
      nr = 0;
      getippt = 0;
      gesperrt = false;
      zeigeSchritt();
    }

    function zeigeSchritt() {
      const s = schritte[nr];
      let text = s.ansage || `Schreib: „${s.tippe}“`;
      // Beim Üben verrät Bit auch die Taste
      if (mitHilfe && s.taste) text += ` – Taste: ${[].concat(s.taste).join(" oder ")}`;
      beiAnsage(text);
      zeichne();
    }

    function naechsterSchritt() {
      nr++;
      getippt = 0;
      if (nr < schritte.length) {
        zeigeSchritt();
        return;
      }
      // Aufgabe geschafft
      runde++;
      gesperrt = true;
      zeichne();
      beiRichtig(runde, runden);
      timer = setTimeout(() => {
        if (runde >= runden) beiFertig();
        else starteRunde();
      }, RUNDE_PAUSE_MS);
    }

    function pruefe(aktion) {
      const s = schritte[nr];

      // a) Text schreiben: nur das richtige nächste Zeichen zählt
      if (s.tippe) {
        if (aktion.art === "kuerzel") return beiFehler("Jetzt bitte nur schreiben – ohne Strg.");
        if (aktion.art !== "zeichen") return; // andere Tasten stören hier nicht
        const soll = s.tippe[getippt];
        if (aktion.wert !== soll) return beiFehler(hinweisZeichen(soll, aktion.wert, feststellAn, s.tippe));
        // Das ganze Wort ist EIN Rückgängig-Schritt
        einfuegen(z, aktion.wert, getippt === 0);
        getippt++;
        if (getippt >= s.tippe.length) naechsterSchritt();
        else zeichne();
        return;
      }

      // b) Taste oder Kombination
      const erlaubt = [].concat(s.taste).map(wertVon);
      if (erlaubt.includes(aktion.wert)) {
        wende(z, aktion.wert, s);
        naechsterSchritt();
      } else {
        beiFehler(hinweisTaste(erlaubt, aktion, mitHilfe));
      }
    }

    function tasteRunter(e) {
      if (tastatur) tastatur.druecke(e.code, true);
      if (e.getModifierState) feststellAn = e.getModifierState("CapsLock");
      const aktion = aktionAus(e);
      if (!aktion) {
        if (!gesperrt) zeichne(); // z. B. Anzeige der Feststelltaste aktualisieren
        return;
      }
      // Was der Browser sonst tun würde (Tab springt, Strg+S speichert die
      // Webseite …), verhindern wir im Spiel.
      e.preventDefault();
      // Steht der Fokus auf einem Knopf (z. B. „Tipp von Bit“), würden Enter
      // und Leertaste ihn auslösen – also Fokus wegnehmen.
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      if (gesperrt || e.repeat) return;
      pruefe(aktion);
    }
    function tasteHoch(e) {
      if (tastatur) tastatur.druecke(e.code, false);
      if (e.getModifierState) {
        const vorher = feststellAn;
        feststellAn = e.getModifierState("CapsLock");
        if (vorher !== feststellAn && !gesperrt) zeichne();
      }
    }
    window.addEventListener("keydown", tasteRunter, true);
    window.addEventListener("keyup", tasteHoch, true);

    starteRunde();

    return {
      beenden() {
        clearTimeout(timer);
        window.removeEventListener("keydown", tasteRunter, true);
        window.removeEventListener("keyup", tasteHoch, true);
        buehne.remove();
      },
    };
  },

  /* Vorführung: Bit spielt die erste Aufgabe selbst vor. Die Tasten
     leuchten auf der Tastatur auf, im Fenster passiert das Ergebnis. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const zeige = einstellungen.zeige || {};
    const aufgabe = einstellungen.aufgaben[0];
    const buehne = el("div", "editor-buehne");
    const ansicht = baueAnsicht(zeige);
    const tastatur = baueTastatur();
    buehne.append(ansicht.vorlage, ansicht.fenster, tastatur.element);
    flaeche.append(buehne);

    let timer = [];
    function durchlauf() {
      timer.forEach(clearTimeout);
      timer = [];
      const z = neuerZustand(aufgabe.start);
      let zeit = 800;
      const spaeter = (ms, tu) => timer.push(setTimeout(tu, ms));

      const zeigeHilfe = (nr, getippt) => {
        const h = hilfeInfo(z, aufgabe.schritte, nr, getippt);
        const s = aufgabe.schritte[nr];
        ansicht.render(z, { vorlageText: s && s.tippe, vorlagePos: getippt, hilfeDialog: h.hilfeDialog, zielFeld: h.zielFeld });
        tastatur.markiere(h.tasten);
        return h.tasten;
      };
      spaeter(0, () => zeigeHilfe(0, 0));

      aufgabe.schritte.forEach((s, nr) => {
        if (s.tippe) {
          [...s.tippe].forEach((zeichen, i) => {
            spaeter(zeit, () => {
              const tasten = zeigeHilfe(nr, i);
              tastatur.drueckeBeschriftungen(tasten, true);
            });
            spaeter(zeit + 250, () => {
              tastatur.drueckeBeschriftungen(tastenFuerZeichen(zeichen), false);
              einfuegen(z, zeichen, i === 0);
              zeigeHilfe(i + 1 < s.tippe.length ? nr : nr + 1, i + 1 < s.tippe.length ? i + 1 : 0);
            });
            zeit += 450;
          });
        } else {
          const tasten = tastenFuerName([].concat(s.taste)[0]);
          spaeter(zeit, () => { zeigeHilfe(nr, 0); });
          spaeter(zeit + 900, () => tastatur.drueckeBeschriftungen(tasten, true));
          spaeter(zeit + 1300, () => {
            tastatur.drueckeBeschriftungen(tasten, false);
            wende(z, wertVon([].concat(s.taste)[0]), s);
            zeigeHilfe(nr + 1, 0);
          });
          zeit += 2000;
        }
      });
      spaeter(zeit + 2000, durchlauf); // von vorn
    }
    durchlauf();

    return {
      beenden() {
        timer.forEach(clearTimeout);
        buehne.remove();
      },
    };
  },
};
