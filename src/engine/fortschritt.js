/* =====================================================================
   FORTSCHRITT: Sterne, Freischaltungen, Einstellungen, Spielstand-Datei
   =====================================================================
   Alles wird nur im Browser dieses Rechners gespeichert (localStorage).
   Es gibt keine Konten und es werden keine Daten verschickt.
   Als Sicherung kann man den Spielstand als Datei herunterladen
   („Spielstand-ComputerHeld-2026-11-16.json“) und später wieder laden –
   auch an einem anderen Computer.
   ===================================================================== */

import { WELTEN } from "../daten/welten.js";

const SPEICHER_NAME = "computerheld-spielstand";

/* LEHRERVERSION (Seite lehrer/index.html): Alles ist freigeschaltet, es wird
   nichts gespeichert und nichts geladen. Die Sterne gibt es nur, solange die
   Seite offen ist. Der Spielstand der Kinder auf diesem Rechner bleibt unberührt. */
export const lehrer = typeof window !== "undefined" && window.COMPUTERHELD_LEHRER === true;

/* Der Spielstand im Arbeitsspeicher. "sterne" merkt sich pro Level-ID
   die beste Sternezahl (1 bis 3). */
let stand = neuerStand();

function neuerStand() {
  return {
    sterne: {},
    einstellungen: { schrift: "normal" },
  };
}

/* ---------------- Laden und Speichern ---------------- */

export function lade() {
  if (lehrer) return; // Lehrerversion: immer ein leerer Anfang
  try {
    const text = localStorage.getItem(SPEICHER_NAME);
    if (text) {
      const gelesen = JSON.parse(text);
      stand = neuerStand();
      Object.assign(stand.sterne, gelesen.sterne);
      if (gelesen.einstellungen && gelesen.einstellungen.schrift) stand.einstellungen.schrift = gelesen.einstellungen.schrift;
    }
  } catch (fehler) {
    // Speicher gesperrt oder kaputt: Wir spielen einfach ohne Speichern weiter.
    console.warn("Spielstand konnte nicht geladen werden.", fehler);
  }
}

function speichere() {
  if (lehrer) return; // Lehrerversion: nichts speichern
  try {
    localStorage.setItem(SPEICHER_NAME, JSON.stringify(stand));
  } catch (fehler) {
    console.warn("Spielstand konnte nicht gespeichert werden.", fehler);
  }
}

/* Gibt es schon Sterne? (Dann bietet die Startseite „Weiterspielen“ an.) */
export function hatFortschritt() {
  if (lehrer) return false;
  return Object.keys(stand.sterne).length > 0;
}

/* Neues Abenteuer: alle Sterne weg, die Einstellungen bleiben */
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
  if (lehrer || welt.id === 1) return true;
  const welt1 = WELTEN.find((w) => w.id === 1);
  if (welt.id <= 5) return weltAbgeschlossen(welt1);
  return WELTEN.filter((w) => w.id <= 5).every(weltAbgeschlossen);
}

/* Ein Level ist offen, wenn das Level davor geschafft ist.
   Bonus-Level öffnen sich ab einer bestimmten Sternezahl der Welt. */
export function levelFrei(welt, index) {
  if (lehrer) return true;
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
   SPIELSTAND-DATEI
   Die Datei enthält nur die Sterne und die Schriftgröße – keine Namen,
   keine persönlichen Daten. Beispiel:
   { "spiel": "ComputerHeld", "version": 1, "gespeichert": "2026-11-16",
     "sterne": { "1.1": 3, "1.2": 2 }, "einstellungen": { "schrift": "normal" } }
   ===================================================================== */

const ALLE_LEVEL = new Set(WELTEN.flatMap((w) => w.level.map((l) => l.id)));

/* Liefert Dateiname und Inhalt zum Herunterladen */
export function alsDatei() {
  const heute = new Date();
  const datum = [heute.getFullYear(), String(heute.getMonth() + 1).padStart(2, "0"), String(heute.getDate()).padStart(2, "0")].join("-");
  const inhalt = {
    spiel: "ComputerHeld",
    version: 1,
    gespeichert: datum,
    sterne: stand.sterne,
    einstellungen: stand.einstellungen,
  };
  return { dateiname: `Spielstand-ComputerHeld-${datum}.json`, text: JSON.stringify(inhalt, null, 2) };
}

/* Liest eine Spielstand-Datei. Der Spielstand auf diesem Rechner wird dabei
   ERSETZT (wichtig an Schulrechnern, an denen mehrere Kinder spielen).
   Rückgabe: { ok: true } oder { ok: false, meldung: "..." } */
export function ausDatei(text) {
  const keineDatei = { ok: false, meldung: "Das ist keine Spielstand-Datei von ComputerHeld. Such die Datei, die mit „Spielstand-ComputerHeld“ anfängt." };
  let gelesen;
  try {
    gelesen = JSON.parse(text);
  } catch (fehler) {
    return keineDatei;
  }
  if (!gelesen || gelesen.spiel !== "ComputerHeld" || typeof gelesen.sterne !== "object" || !gelesen.sterne) return keineDatei;
  const sterne = {};
  for (const [id, anzahl] of Object.entries(gelesen.sterne)) {
    // nur bekannte Level und 1 bis 3 Sterne übernehmen
    if (ALLE_LEVEL.has(id) && [1, 2, 3].includes(anzahl)) sterne[id] = anzahl;
  }
  stand.sterne = sterne;
  const schrift = gelesen.einstellungen && gelesen.einstellungen.schrift;
  if (["normal", "gross", "sehrgross"].includes(schrift)) stand.einstellungen.schrift = schrift;
  speichere();
  return { ok: true };
}
