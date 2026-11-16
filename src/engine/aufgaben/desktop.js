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
                       schliessen, taskleiste
     "ziel" darf auch eine Liste sein – dann ist jedes davon richtig.
     Programme: notizen, malen, rechner, musik, fotos (src/desktop/programme.js)

   Falsche Klicks wirken nicht: Bit erklärt, was der Knopf tut.
   Startmenü öffnen/schließen und ein Fenster anklicken sind nie falsch.
   ===================================================================== */

import { baueDesktop } from "../../desktop/desktop.js";
import { PROGRAMME } from "../../desktop/programme.js";
import { mischen, zeigeMaus, demoBuehne } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 800;
const NEUTRAL = ["start-auf", "start-zu", "aktivieren"];

/* Was der Knopf tut – für Bits Hinweise */
const WIRKUNG = {
  minimieren: "Der Strich legt das Fenster unten in die Taskleiste.",
  maximieren: "Das Kästchen macht das Fenster bildschirmgroß.",
  wiederherstellen: "Die zwei Kästchen machen das Fenster wieder kleiner.",
  schliessen: "Das X schließt das Fenster ganz.",
  taskleiste: "Unten in der Taskleiste holst du ein Fenster nach vorn.",
  oeffnen: "Im Startmenü öffnest du ein Programm.",
};
/* Wo man klicken muss – nur beim Üben angehängt */
const WO = {
  minimieren: "Knopf mit dem Strich",
  maximieren: "Knopf mit dem Kästchen",
  wiederherstellen: "Knopf mit den zwei Kästchen",
  schliessen: "Knopf mit dem X",
  taskleiste: "unten in der Taskleiste",
  oeffnen: "Start, dann das Programm",
};

const name = (p) => PROGRAMME[p].name;
const ziele = (schritt) => [].concat(schritt.ziel);

function reihenfolge(aufgaben, runden, gemischt) {
  const liste = [];
  while (liste.length < runden) liste.push(...(gemischt === false ? aufgaben : mischen(aufgaben)));
  return liste.slice(0, runden);
}

function hinweis(aktion, ziel) {
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
      if (ziele(schritte[nr]).some((z) => z.art === art && z.programm === aktion.programm)) {
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
      const ziel = ziele(s)[0];
      if (ziel.art === "oeffnen") klicks.push({ art: "start-auf" });
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
