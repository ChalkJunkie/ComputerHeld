/* =====================================================================
   AUFGABENTYP „DESKTOP“ (Welt 3: Fensterburg)
   Auf dem Mini-Desktop (src/desktop/desktop.js) soll das Kind Fenster
   bedienen: öffnen, minimieren, vergrößern, verkleinern, schließen,
   über die Taskleiste wechseln.

   Einstellungen (aus den Level-Daten):
     runden    – wie viele Aufgaben
     gemischt  – false: Aufgaben in der angegebenen Reihenfolge (Standard: gemischt)
     aufgaben  – Liste von Aufgaben, jede so:
       {
         start: { offen: [{ programm: "malen", zustand: "normal" }], aktiv: "malen" },
                  zustand: "normal", "maximiert" oder "minimiert"
         schritte: [
           { ziel: { art: "schliessen", programm: "malen" }, ansage: "…" },
           …
         ]
       }
     Arten für "ziel": oeffnen, minimieren, maximieren, wiederherstellen,
                       schliessen, taskleiste,
                       lautstaerke / helligkeit  (mit min und/oder max, z. B. { art: "lautstaerke", min: 90 }),
                       stumm (mit wert: true oder false),
                       energie (mit wahl: "herunterfahren", "neustart" oder "abmelden")
     "ziel" darf auch eine Liste sein – dann ist jedes davon richtig.
     start.extras: { schnell: true, energie: true } schaltet Schnelleinstellungen
     und den Ein/Aus-Knopf ein (siehe src/desktop/desktop.js).
     Programme: notizen, malen, rechner, musik, fotos (src/desktop/programme.js)

   Falsche Klicks wirken nicht: Bit erklärt, was der Knopf tut.
   Startmenü öffnen/schließen und ein Fenster anklicken sind nie falsch.
   ===================================================================== */

import { baueDesktop, ENERGIE } from "../../desktop/desktop.js";
import { PROGRAMME } from "../../desktop/programme.js";
import { mischen, zeigeMaus, demoBuehne } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 800;
/* Diese Klicks sind nie falsch: Menüs öffnen, Regler bewegen … */
const NEUTRAL = ["start-auf", "start-zu", "aktivieren", "panel-auf", "panel-zu", "energie-auf", "energie-zu", "lautstaerke", "helligkeit"];

/* Was der Knopf tut – für Bits Hinweise */
const WIRKUNG = {
  minimieren: "Der Strich legt das Fenster unten in die Taskleiste.",
  maximieren: "Das Kästchen macht das Fenster bildschirmgroß.",
  wiederherstellen: "Die zwei Kästchen machen das Fenster wieder kleiner.",
  schliessen: "Das X schließt das Fenster ganz.",
  taskleiste: "Unten in der Taskleiste holst du ein Fenster nach vorn.",
  oeffnen: "Im Startmenü öffnest du ein Programm.",
  stumm: "„Stumm“ schaltet den Ton ganz aus – und „Ton an“ wieder ein.",
  energie: {
    herunterfahren: "„Herunterfahren“ schaltet den Computer ganz aus.",
    neustart: "„Neu starten“ schaltet den Computer aus und gleich wieder an.",
    abmelden: "„Abmelden“: Du gehst raus, der Computer bleibt an – für die oder den Nächsten.",
  },
};
/* Wo man klicken muss – nur beim Üben angehängt */
const WO = {
  minimieren: "Knopf mit dem Strich",
  maximieren: "Knopf mit dem Kästchen",
  wiederherstellen: "Knopf mit den zwei Kästchen",
  schliessen: "Knopf mit dem X",
  taskleiste: "unten in der Taskleiste",
  oeffnen: "Start, dann das Programm",
  lautstaerke: "Lautsprecher unten rechts, dann den Regler ziehen",
  helligkeit: "Sonne unten rechts, dann den Regler ziehen",
  stumm: "Lautsprecher unten rechts, dann „Stumm“",
  energie: "Start, dann „Ein/Aus“",
};

/* Passt eine Aktion zu einem Ziel? Alle Angaben im Ziel müssen stimmen;
   min und max gelten für den Wert eines Reglers. */
function passt(z, a) {
  return z.art === a.art
    && (z.programm === undefined || z.programm === a.programm)
    && (z.wahl === undefined || z.wahl === a.wahl)
    && (z.wert === undefined || z.wert === a.wert)
    && (z.min === undefined || a.wert >= z.min)
    && (z.max === undefined || a.wert <= z.max);
}

const name = (p) => PROGRAMME[p].name;
const ziele = (schritt) => [].concat(schritt.ziel);

function reihenfolge(aufgaben, runden, gemischt) {
  const liste = [];
  while (liste.length < runden) liste.push(...(gemischt === false ? aufgaben : mischen(aufgaben)));
  return liste.slice(0, runden);
}

function hinweis(aktion, ziel) {
  if (aktion.art === "energie") return "Das war nicht die richtige Wahl. " + WIRKUNG.energie[aktion.wahl];
  if (aktion.art === "stumm") return WIRKUNG.stumm;
  if (ziel.programm && aktion.programm && aktion.programm !== ziel.programm) {
    return aktion.art === "oeffnen"
      ? `Das war „${name(aktion.programm)}“. Gesucht ist „${name(ziel.programm)}“.`
      : `Das war das Fenster „${name(aktion.programm)}“. Gesucht ist „${name(ziel.programm)}“.`;
  }
  return "Das war nicht der richtige Knopf. " + WIRKUNG[aktion.art];
}

/* Mitte eines Elements in Prozent der Spielfläche (für den Vorführ-Zeiger) */
function mitteInProzent(element, flaeche) {
  const r = flaeche.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  return [((e.left + e.width / 2 - r.left) / r.width) * 100, ((e.top + e.height / 2 - r.top) / r.height) * 100];
}

export const desktop = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const liste = reihenfolge(einstellungen.aufgaben, runden, einstellungen.gemischt);
    let runde = 0;
    let schritte = [];
    let nr = 0;
    let erledigt = false;   // hat die letzte Aktion den Schritt geschafft?
    let gesperrt = false;   // kurz nach einer geschafften Aufgabe
    let timer = null;

    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste: einmal klicken.");

    function pruefer(aktion) {
      if (gesperrt) return false;
      if (!schritte[nr]) return false;
      // Klick in der Taskleiste auf das vordere Fenster legt es ab – wie minimieren
      const art = aktion.art === "taskleiste" && desk.istVorn(aktion.programm) ? "minimieren" : aktion.art;
      if (ziele(schritte[nr]).some((z) => passt(z, { ...aktion, art }))) {
        erledigt = true;
        return true;
      }
      if (NEUTRAL.includes(aktion.art)) return true;
      beiFehler(hinweis({ ...aktion, art }, ziele(schritte[nr])[0]));
      return false;
    }

    function beiAktion() {
      if (!erledigt) return;
      erledigt = false;
      nr++;
      if (nr < schritte.length) {
        zeigeSchritt();
        return;
      }
      runde++;
      gesperrt = true;
      desk.setzeHilfe(null);
      beiRichtig(runde, runden);
      timer = setTimeout(() => {
        if (runde >= runden) beiFertig();
        else starteRunde();
      }, RUNDE_PAUSE_MS);
    }

    const desk = baueDesktop(flaeche, { pruefer, beiAktion });

    function zeigeSchritt() {
      const s = schritte[nr];
      const ziel = ziele(s)[0];
      beiAnsage(mitHilfe ? `${s.ansage} → ${WO[ziel.art]}` : s.ansage);
      desk.setzeHilfe(mitHilfe ? ziel : null);
    }

    function starteRunde() {
      const aufgabe = liste[runde];
      desk.setze(aufgabe.start);
      schritte = aufgabe.schritte;
      nr = 0;
      gesperrt = false;
      zeigeSchritt();
    }
    starteRunde();

    return {
      beenden() {
        clearTimeout(timer);
        desk.beenden();
      },
    };
  },

  /* Vorführung: Ein gezeichneter Mauszeiger erledigt die erste Aufgabe. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const aufgabe = einstellungen.aufgaben[0];
    const desk = baueDesktop(flaeche);
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, "links", "Linke Taste: einmal klicken.");

    // Klicks der Reihe nach: Beim Öffnen erst „Start“, dann das Programm
    const klicks = [];
    for (const s of aufgabe.schritte) {
      const ziel = { ...ziele(s)[0] };
      if (ziel.art === "oeffnen") klicks.push({ art: "start-auf" });
      if (ziel.art === "energie") klicks.push({ art: "start-auf" }, { art: "energie-auf" });
      if (["lautstaerke", "helligkeit", "stumm"].includes(ziel.art)) klicks.push({ art: "panel-auf" });
      // Regler: auf den gewünschten Wert stellen
      if (ziel.min !== undefined) ziel.wert = ziel.min;
      if (ziel.max !== undefined) ziel.wert = ziel.max;
      klicks.push(ziel);
    }

    let timer = [];
    function durchlauf() {
      timer.forEach(clearTimeout);
      timer = [];
      const spaeter = (ms, tu) => timer.push(setTimeout(tu, ms));
      desk.setze(aufgabe.start);
      desk.setzeHilfe(null);
      buehne.setze(50, 50);
      if (aufgabe.start.extras) zeigeMaus(tafel, "links", "Linke Taste: klicken – beim Regler drücken und ziehen.");
      buehne.sage("");
      let zeit = 700;
      for (const klick of klicks) {
        spaeter(zeit, () => {
          const ziel = desk.elementFuer(klick);
          if (!ziel) return;
          desk.setzeHilfe(klick, "");
          buehne.sage("");
          buehne.bewege(...mitteInProzent(ziel, flaeche), 1300);
        });
        spaeter(zeit + 1500, () => buehne.sage("Klick!"));
        spaeter(zeit + 2000, () => {
          desk.setzeHilfe(null);
          desk.fuehreAus(klick);
          buehne.sage("");
        });
        zeit += 2600;
      }
      spaeter(zeit + 1500, durchlauf); // von vorn
    }
    durchlauf();

    return {
      beenden() {
        timer.forEach(clearTimeout);
        buehne.beenden();
        desk.beenden();
      },
    };
  },
};
