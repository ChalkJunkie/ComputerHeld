/* =====================================================================
   FORTSCHRITT: Sterne, Freischaltungen, Einstellungen, Spielstand-Code
   =====================================================================
   Alles wird nur im Browser dieses Rechners gespeichert (localStorage).
   Es gibt keine Konten und es werden keine Daten verschickt.
   Der Spielstand-Code ist das Backup, falls der Rechner zurückgesetzt wird.
   ===================================================================== */

import { WELTEN } from "../daten/welten.js";

const SPEICHER_NAME = "computerheld-spielstand";

/* Der Spielstand im Arbeitsspeicher. "sterne" merkt sich pro Level-ID
   die beste Sternezahl (1 bis 3). */
let stand = neuerStand();

function neuerStand() {
  return {
    sterne: {},
    einstellungen: { ton: false, schrift: "normal" },
  };
}

/* ---------------- Laden und Speichern ---------------- */

export function lade() {
  try {
    const text = localStorage.getItem(SPEICHER_NAME);
    if (text) {
      const gelesen = JSON.parse(text);
      stand = neuerStand();
      Object.assign(stand.sterne, gelesen.sterne);
      Object.assign(stand.einstellungen, gelesen.einstellungen);
    }
  } catch (fehler) {
    // Speicher gesperrt oder kaputt: Wir spielen einfach ohne Speichern weiter.
    console.warn("Spielstand konnte nicht geladen werden.", fehler);
  }
}

function speichere() {
  try {
    localStorage.setItem(SPEICHER_NAME, JSON.stringify(stand));
  } catch (fehler) {
    console.warn("Spielstand konnte nicht gespeichert werden.", fehler);
  }
}

export function loescheAlles() {
  const einstellungen = stand.einstellungen; // Einstellungen bleiben erhalten
  stand = neuerStand();
  stand.einstellungen = einstellungen;
  speichere();
}

/* ---------------- Sterne ---------------- */

export function sterneVon(levelId) {
  return stand.sterne[levelId] || 0;
}

/* Merkt sich ein Ergebnis. Es zählt immer das beste Ergebnis. */
export function merkeErgebnis(levelId, sterne) {
  if (sterne > sterneVon(levelId)) {
    stand.sterne[levelId] = sterne;
    speichere();
  }
}

export function sterneDerWelt(welt) {
  return welt.level.reduce((summe, l) => summe + sterneVon(l.id), 0);
}

export function sterneGesamt() {
  return WELTEN.reduce((summe, w) => summe + sterneDerWelt(w), 0);
}

/* ---------------- Freischaltungen ---------------- */

/* Eine Welt ist abgeschlossen, wenn alle Level außer den Bonus-Leveln
   mindestens einen Stern haben. */
export function weltAbgeschlossen(welt) {
  return welt.level.every((l) => l.art === "bonus" || sterneVon(l.id) > 0);
}

/* Welt 1 ist immer offen. Welt 2 bis 5 öffnen sich nach Welt 1.
   Welt 6 öffnet sich, wenn Welt 1 bis 5 abgeschlossen sind. */
export function weltFrei(welt) {
  if (welt.id === 1) return true;
  const welt1 = WELTEN.find((w) => w.id === 1);
  if (welt.id <= 5) return weltAbgeschlossen(welt1);
  return WELTEN.filter((w) => w.id <= 5).every(weltAbgeschlossen);
}

/* Ein Level ist offen, wenn das Level davor geschafft ist.
   Bonus-Level öffnen sich ab einer bestimmten Sternezahl der Welt. */
export function levelFrei(welt, index) {
  if (!weltFrei(welt)) return false;
  const eintrag = welt.level[index];
  if (eintrag.art === "bonus") return sterneDerWelt(welt) >= welt.bonusAbSternen;
  if (index === 0) return true;
  return sterneVon(welt.level[index - 1].id) > 0;
}

/* ---------------- Einstellungen ---------------- */

export function einstellung(name) {
  return stand.einstellungen[name];
}

export function setzeEinstellung(name, wert) {
  stand.einstellungen[name] = wert;
  speichere();
}

/* =====================================================================
   SPIELSTAND-CODE
   Der Code enthält nur die Sterne aller Level, sonst nichts.
   Aufbau: Version – Sterne (2 Bit pro Level, 16 Plätze pro Welt) – Prüfzahl.
   Zeichen, die man leicht verwechselt (I, O, 0, 1), kommen nicht vor.
   ===================================================================== */

const ZEICHEN = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 Zeichen = 5 Bit pro Zeichen
const CODE_VERSION = 1;
const PLAETZE_PRO_WELT = 16;

function pruefzahl(bytes) {
  let summe = 7;
  bytes.forEach((b, i) => { summe = (summe + (b + 1) * (i + 3)) % 256; });
  return summe;
}

export function erzeugeCode() {
  // 1. Sterne aller Level in fester Reihenfolge aufreihen
  const sterne = [];
  WELTEN.forEach((welt, w) => {
    for (let i = 0; i < PLAETZE_PRO_WELT; i++) {
      const eintrag = welt.level[i];
      sterne[w * PLAETZE_PRO_WELT + i] = eintrag ? sterneVon(eintrag.id) : 0;
    }
  });
  // 2. Je vier Level in ein Byte packen
  const daten = [];
  for (let i = 0; i < sterne.length; i += 4) {
    daten.push(sterne[i] | (sterne[i + 1] << 2) | (sterne[i + 2] << 4) | (sterne[i + 3] << 6));
  }
  // 3. Leere Bytes am Ende weglassen – so bleibt der Code am Anfang schön kurz
  while (daten.length > 0 && daten[daten.length - 1] === 0) daten.pop();
  const bytes = [CODE_VERSION, ...daten];
  bytes.push(pruefzahl(bytes));
  // 4. Bytes in Buchstaben und Ziffern umwandeln (immer 5 Bit pro Zeichen)
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  while (bits.length % 5 !== 0) bits += "0";
  let code = "";
  for (let i = 0; i < bits.length; i += 5) code += ZEICHEN[parseInt(bits.slice(i, i + 5), 2)];
  // 5. In Vierergruppen aufteilen, damit man ihn gut abschreiben kann
  return code.match(/.{1,4}/g).join("-");
}

/* Liest einen Code ein. Vorhandene Sterne gehen dabei nie verloren:
   Es zählt pro Level das bessere Ergebnis.
   Rückgabe: { ok: true } oder { ok: false, meldung: "..." } */
export function leseCode(eingabe) {
  const text = eingabe.toUpperCase().replace(/[\s-]/g, "");
  if (text.length === 0) return { ok: false, meldung: "Bitte gib zuerst deinen Code ein." };

  let bits = "";
  for (const zeichen of text) {
    const wert = ZEICHEN.indexOf(zeichen);
    if (wert < 0) {
      return { ok: false, meldung: `Das Zeichen „${zeichen}“ kommt im Code nicht vor. Schau noch einmal genau hin.` };
    }
    bits += wert.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));

  const tippfehler = { ok: false, meldung: "Der Code stimmt noch nicht ganz. Vergleiche ihn Zeichen für Zeichen." };
  if (bytes.length < 2) return tippfehler;
  const pruef = bytes.pop();
  if (pruef !== pruefzahl(bytes)) return tippfehler;
  if (bytes[0] !== CODE_VERSION) return { ok: false, meldung: "Dieser Code passt nicht zu dieser Version des Spiels." };

  const daten = bytes.slice(1);
  WELTEN.forEach((welt, w) => {
    welt.level.forEach((eintrag, i) => {
      if (i >= PLAETZE_PRO_WELT) return;
      const platz = w * PLAETZE_PRO_WELT + i;
      const byte = daten[Math.floor(platz / 4)] || 0;
      const sterne = (byte >> ((platz % 4) * 2)) & 3;
      if (sterne > sterneVon(eintrag.id)) stand.sterne[eintrag.id] = sterne;
    });
  });
  speichere();
  return { ok: true };
}
