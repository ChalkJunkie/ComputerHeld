/* =====================================================================
   AUFGABENTYP „EXPLORER“ (Welt 4: Ordnerwald)
   Der Datei-Explorer ist bildschirmgroß geöffnet. Das Kind soll Ordner
   öffnen, Ordner anlegen, umbenennen, löschen, wiederherstellen,
   Dateien verschieben oder eine Datei nach ihrer Endung finden.

   Einstellungen (aus den Level-Daten):
     runden    – wie viele Aufgaben
     gemischt  – false: Aufgaben in der angegebenen Reihenfolge (Standard: gemischt)
     symbole   – false: alle Dateien haben dasselbe Symbol (Endung lesen!)
     aufgaben  – Liste von Aufgaben, jede so:
       {
         start: {
           ort:        Ordner, in dem der Explorer startet (Standard "/")
           dateien:    ["Dokumente/Schule/Mathe.docx", "Bilder/Urlaub/", …]
           papierkorb: ["Dokumente/Aufsatz.docx"]  (liegt schon im Papierkorb)
           weiter:     true = Dateisystem der vorigen Aufgabe weiterbenutzen
                       (dann werden "dateien"/"papierkorb" nur ergänzt)
         },
         schritte: [{ ziel: { … }, ansage: "…" }]
       }
     Ziele (Pfade mit "/" vorn, "/" allein ist „Dieser PC“):
       { ort: "/Dokumente/Schule" }                 Ordner geöffnet
       { ausgewaehlt: ["/Downloads/Ausflug.jpg"] }  eine davon angeklickt
       { ordner: "/Dokumente/Ferien" }              Ordner angelegt und benannt
       { umbenannt: { von: "/Bilder/IMG.jpg", nach: "/Bilder/Hund.jpg" } }
       { geloescht: "/Downloads/Werbung.exe" }      liegt im Papierkorb
       { wiederhergestellt: "/Dokumente/Aufsatz.docx" }
       { verschoben: [{ von: "/Downloads/Strand.jpg", nach: "/Bilder" }, …] }

   Herumklicken und Ordner öffnen ist nie falsch. Falsche Änderungen
   (falsche Datei löschen, falscher Name …) wirken nicht – Bit erklärt.
   ===================================================================== */

import { baueDesktop } from "../../desktop/desktop.js";
import {
  baueDateisystem, teile, elternVon, nameVon, verbinde, endung, typVon,
} from "../../desktop/dateisystem.js";
import { ortName, PAPIERKORB_PFAD } from "../../desktop/explorer.js";
import { mischen, zeigeMaus, demoBuehne } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 900;

/* ---------- kleine Helfer für Pfade ---------- */
const norm = (p) => (p === PAPIERKORB_PFAD ? p : "/" + teile(p).join("/"));
const gleich = (a, b) => Boolean(a) && Boolean(b) && norm(a).toLowerCase() === norm(b).toLowerCase();
const liegtIn = (oben, pfad) => oben === "/" || pfad.toLowerCase().startsWith(oben.toLowerCase() + "/");

function reihenfolge(aufgaben, runden, gemischt) {
  const liste = [];
  while (liste.length < runden) liste.push(...(gemischt === false ? aufgaben : mischen(aufgaben)));
  return liste.slice(0, runden);
}

/* Ist ein Ziel erreicht? */
function erfuellt(ziel, fs, ex) {
  if (ziel.ort) return gleich(ex.pfad, ziel.ort);
  if (ziel.ausgewaehlt) return [].concat(ziel.ausgewaehlt).some((p) => gleich(ex.auswahl, p));
  if (ziel.ordner) return fs.istOrdner(ziel.ordner) && !ex.bearbeitet;
  if (ziel.umbenannt) return fs.existiert(ziel.umbenannt.nach) && !fs.existiert(ziel.umbenannt.von);
  if (ziel.geloescht) return !fs.existiert(ziel.geloescht) && fs.imPapierkorb(norm(ziel.geloescht));
  if (ziel.wiederhergestellt) return fs.existiert(ziel.wiederhergestellt);
  if (ziel.verschoben) return ziel.verschoben.every((v) => fs.existiert(verbinde(norm(v.nach), nameVon(v.von))));
  return false;
}

/* ---------- Prüfen: darf die Aktion wirken? Und wenn nicht: warum? ----------
   Rückgabe: { ok: true } oder { ok: false, hinweis } oder
             { ok: true, hinweis } (wirkt, zählt aber als Fehler – z. B. falsche Datei angeklickt) */
function bewerte(aktion, ziel, fs) {
  const { art } = aktion;
  const name = aktion.pfad ? nameVon(aktion.pfad) : "";

  // Fensterknöpfe und Taskleiste: hier nicht nötig
  if (["minimieren", "maximieren", "wiederherstellen", "schliessen", "taskleiste"].includes(art)) {
    return { ok: false, hinweis: "Lass den Explorer offen – hier arbeiten wir gerade." };
  }
  if (art === "oeffnen") return { ok: false, hinweis: "Jetzt brauchst du kein anderes Programm." };
  if (["navigieren", "oeffnen-datei", "start-auf", "start-zu", "aktivieren"].includes(art)) return { ok: true };

  if (art === "auswaehlen") {
    if (!ziel.ausgewaehlt) return { ok: true };
    if ([].concat(ziel.ausgewaehlt).some((p) => gleich(p, aktion.pfad))) return { ok: true };
    const knoten = fs.finde(aktion.pfad);
    if (knoten && knoten.typ === "ordner") return { ok: true, hinweis: "Das ist ein Ordner. Gesucht ist eine Datei." };
    return { ok: true, hinweis: `„${name}“ endet auf „.${endung(name)}“ – das ist ${typVon(name).beschreibung}.` };
  }

  if (art === "neuer-ordner") {
    if (!ziel.ordner) return { ok: false, hinweis: "Jetzt brauchst du keinen neuen Ordner." };
    const soll = elternVon(norm(ziel.ordner));
    if (gleich(aktion.ort, soll)) return { ok: true };
    return { ok: false, hinweis: `Du bist im Ordner „${ortName(aktion.ort)}“. Der neue Ordner soll in „${ortName(soll)}“.` };
  }

  if (art === "umbenennen") {
    if (aktion.vergeben) return { ok: false, hinweis: "Diesen Namen gibt es in dem Ordner schon." };
    if (ziel.ordner) {
      if (!gleich(elternVon(aktion.pfad), elternVon(norm(ziel.ordner)))) return { ok: false, hinweis: "Das ist der falsche Ordner." };
      if (aktion.neuerName.toLowerCase() === nameVon(ziel.ordner).toLowerCase()) return { ok: true };
      return { ok: false, hinweis: `Der Ordner soll „${nameVon(ziel.ordner)}“ heißen.` };
    }
    if (ziel.umbenannt) {
      const { von, nach } = ziel.umbenannt;
      if (!gleich(aktion.pfad, von)) return { ok: false, hinweis: `Das ist die falsche Datei. Gesucht ist „${nameVon(von)}“.` };
      if (aktion.neuerName.toLowerCase() === nameVon(nach).toLowerCase()) return { ok: true };
      if (endung(nach) && endung(aktion.neuerName) !== endung(nach)) {
        return { ok: false, hinweis: `Die Endung „.${endung(nach)}“ muss bleiben. Sonst weiß der Computer nicht, was für eine Datei das ist.` };
      }
      return { ok: false, hinweis: `Der neue Name soll „${nameVon(nach)}“ sein.` };
    }
    return { ok: false, hinweis: "Jetzt bitte nichts umbenennen." };
  }

  if (art === "loeschen") {
    if (ziel.geloescht && gleich(aktion.pfad, ziel.geloescht)) return { ok: true };
    return { ok: false, hinweis: `Halt! „${name}“ brauchst du noch.` };
  }

  if (art === "zurueckholen") {
    const eintrag = fs.papierkorbEintrag(aktion.pfad);
    if (!ziel.wiederhergestellt) return { ok: false, hinweis: "Jetzt bitte nichts wiederherstellen." };
    if (eintrag && gleich(eintrag.original, ziel.wiederhergestellt)) return { ok: true };
    return { ok: false, hinweis: `Das ist die falsche Datei. Gesucht ist „${nameVon(ziel.wiederhergestellt)}“.` };
  }

  if (art === "verschieben") {
    if (!ziel.verschoben) return { ok: false, hinweis: "Jetzt bitte nichts verschieben." };
    const plan = ziel.verschoben.find((v) => gleich(v.von, aktion.pfad));
    if (!plan) return { ok: false, hinweis: `„${name}“ soll bleiben, wo es ist.` };
    if (gleich(plan.nach, aktion.nach)) return { ok: true };
    return { ok: false, hinweis: `„${name}“ gehört in den Ordner „${ortName(norm(plan.nach))}“.` };
  }
  return { ok: true };
}

/* ---------- Hilfe beim Üben: Wo muss ich als Nächstes hin? ---------- */
function wegNach(ort, ex) {
  const hier = ex.pfad;
  if (gleich(hier, ort)) return null;
  if (ort === PAPIERKORB_PFAD) return [{ wo: "seite", pfad: PAPIERKORB_PFAD, text: "Hier klicken" }];
  if (hier !== PAPIERKORB_PFAD && liegtIn(hier, ort)) {
    // eine Ebene tiefer: das nächste Stück des Pfads doppelklicken
    const naechstes = "/" + teile(ort).slice(0, teile(hier).length + 1).join("/");
    return [{ wo: "eintrag", pfad: echterPfad(ex, naechstes), text: "Doppelklick" }];
  }
  if (ort === "/") return [{ wo: "seite", pfad: "/", text: "Hier klicken" }];
  return [{ wo: "seite", pfad: "/" + teile(ort)[0], text: "Hier klicken" }];
}

function papierkorbPfad(fs, original) {
  return fs.papierkorb().find((e) => gleich(e.original, original))?.pfad;
}

function hilfeFuer(ziel, fs, ex) {
  if (ziel.ort) return wegNach(norm(ziel.ort), ex) || [];
  if (ziel.ausgewaehlt) {
    const p = [].concat(ziel.ausgewaehlt)[0];
    return wegNach(elternVon(norm(p)), ex) || [{ wo: "eintrag", pfad: echterPfad(ex, p), text: "Hier klicken" }];
  }
  if (ziel.ordner) {
    const weg = wegNach(elternVon(norm(ziel.ordner)), ex);
    if (weg && !ex.bearbeitet) return weg;
    if (ex.bearbeitet) return [{ wo: "eingabe", text: `„${nameVon(ziel.ordner)}“ tippen, dann Enter` }];
    return [{ wo: "knopf-neu", text: "Hier klicken" }];
  }
  if (ziel.umbenannt) {
    const { von, nach } = ziel.umbenannt;
    const weg = wegNach(elternVon(norm(von)), ex);
    if (weg && !ex.bearbeitet) return weg;
    if (ex.bearbeitet) return [{ wo: "eingabe", text: `„${nameVon(nach).replace(/\.[^.]+$/, "")}“ tippen, dann Enter` }];
    if (ex.menueOffen) return [{ wo: "menue", text: "Umbenennen" }];
    return [{ wo: "eintrag", pfad: echterPfad(ex, von), text: "Rechtsklick" }];
  }
  if (ziel.geloescht) {
    const weg = wegNach(elternVon(norm(ziel.geloescht)), ex);
    if (weg) return weg;
    if (ex.menueOffen) return [{ wo: "menue", text: "Löschen" }];
    return [{ wo: "eintrag", pfad: echterPfad(ex, ziel.geloescht), text: "Rechtsklick" }];
  }
  if (ziel.wiederhergestellt) {
    const weg = wegNach(PAPIERKORB_PFAD, ex);
    if (weg) return weg;
    if (ex.menueOffen) return [{ wo: "menue", text: "Wiederherstellen" }];
    return [{ wo: "eintrag", pfad: papierkorbPfad(fs, norm(ziel.wiederhergestellt)), text: "Rechtsklick" }];
  }
  if (ziel.verschoben) {
    const offen = ziel.verschoben.find((v) => fs.existiert(v.von));
    if (!offen) return [];
    const weg = wegNach(elternVon(norm(offen.von)), ex);
    if (weg) return weg;
    const nach = norm(offen.nach);
    const imOrdner = [...ex.element.querySelectorAll(".ex-eintrag[data-ordner]")].map((e) => e.dataset.pfad).find((x) => gleich(x, nach));
    return [
      { wo: "eintrag", pfad: echterPfad(ex, offen.von), text: "Zieh mich" },
      imOrdner ? { wo: "eintrag", pfad: imOrdner, text: "Hier ablegen" } : { wo: "seite", pfad: "/" + teile(nach)[0], text: "Hier ablegen" },
    ];
  }
  return [];
}
/* Pfad genau so, wie er im Explorer steht (Groß-/Kleinschreibung) */
function echterPfad(ex, p) {
  return [...ex.element.querySelectorAll(".ex-eintrag")].map((e) => e.dataset.pfad).find((x) => gleich(x, p)) || norm(p);
}

/* ---------- Dateisystem für eine Aufgabe ---------- */
function bauePlatz(start, altesFs) {
  if (start.weiter && altesFs) {
    for (const e of start.dateien || []) altesFs.lege(e);
    for (const e of start.papierkorb || []) {
      altesFs.lege(e);
      altesFs.loeschen(norm(e));
    }
    return altesFs;
  }
  return baueDateisystem(start.dateien || [], start.papierkorb || []);
}

function mitteInProzent(element, flaeche) {
  const r = flaeche.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  return [((e.left + Math.min(e.width / 2, 40) - r.left) / r.width) * 100, ((e.top + e.height / 2 - r.top) / r.height) * 100];
}

export const explorer = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const liste = reihenfolge(einstellungen.aufgaben, runden, einstellungen.gemischt);
    let runde = 0;
    let schritte = [];
    let nr = 0;
    let fs = null;
    let ex = null;           // der Explorer der aktuellen Aufgabe
    let gesperrt = false;
    let timer = null;

    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste: klicken. Rechte Taste: Menü.");

    function aktualisiereHilfe() {
      if (!ex || !mitHilfe) return;
      ex.setzeHilfe(gesperrt || !schritte[nr] ? [] : hilfeFuer(schritte[nr].ziel, fs, ex));
    }

    function pruefer(aktion) {
      if (gesperrt || !schritte[nr]) return false;
      const urteil = bewerte(aktion, schritte[nr].ziel, fs);
      if (urteil.hinweis) beiFehler(urteil.hinweis);
      return urteil.ok;
    }

    function beiAktion() {
      if (gesperrt) return;
      if (!erfuellt(schritte[nr].ziel, fs, ex)) {
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
      const alterOrt = ex ? ex.pfad : "/";
      if (ex) ex.beenden();
      fs = bauePlatz(aufgabe.start, fs);
      desk.setze({
        offen: [{ programm: "explorer", zustand: "maximiert" }],
        kontext: {
          fs,
          ort: aufgabe.start.ort || (aufgabe.start.weiter ? alterOrt : "/"),
          symbole: einstellungen.symbole,
          beiStart: (neu) => { ex = neu; },
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
        if (ex) ex.beenden();
        desk.beenden();
      },
    };
  },

  /* Vorführung: Bit erledigt die erste Aufgabe. Der Zeiger folgt genau
     der Hilfe, die das Kind beim Üben sieht. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const aufgabe = einstellungen.aufgaben[0];
    const desk = baueDesktop(flaeche);
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, "links", "Linke Taste: klicken. Rechte Taste: Menü.");
    let ex = null;
    let fs = null;
    let timer = [];

    function schritt(nr, zaehler) {
      const ziel = aufgabe.schritte[nr] && aufgabe.schritte[nr].ziel;
      if (!ziel || zaehler > 14) {
        timer.push(setTimeout(durchlauf, 2500)); // von vorn
        return;
      }
      if (erfuellt(ziel, fs, ex)) return schritt(nr + 1, zaehler);
      const hilfe = hilfeFuer(ziel, fs, ex);
      const h = hilfe[0];
      const element = h && ex.elementFuer(h);
      if (!element) {
        timer.push(setTimeout(durchlauf, 2500));
        return;
      }
      ex.setzeHilfe(hilfe);
      buehne.sage("");
      buehne.bewege(...mitteInProzent(element, flaeche), 1100);
      timer.push(setTimeout(() => {
        buehne.sage(h.text === "Zieh mich" ? "Drücken und ziehen" : h.text || "Klick!");
        if (h.wo === "eingabe") {
          // Namen Buchstabe für Buchstabe eintippen
          const name = (ziel.ordner ? nameVon(ziel.ordner) : nameVon(ziel.umbenannt.nach));
          [...name].forEach((_, i) => timer.push(setTimeout(() => ex.setzeEingabe(name.slice(0, i + 1)), 150 * i)));
          timer.push(setTimeout(() => {
            ex.element.querySelector(".ex-eingabe")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
            schritt(nr, zaehler + 1);
          }, 150 * name.length + 600));
          return;
        }
        if (h.text === "Zieh mich") {
          const ablage = ex.elementFuer(hilfe[1]);
          buehne.bewege(...mitteInProzent(ablage, flaeche), 1400);
          timer.push(setTimeout(() => {
            const plan = ziel.verschoben.find((v) => fs.existiert(v.von));
            desk.fuehreAus({ programm: "explorer", art: "verschieben", pfad: echterPfad(ex, plan.von), nach: norm(plan.nach) });
            schritt(nr, zaehler + 1);
          }, 1600));
          return;
        }
        if (h.text === "Rechtsklick") ex.zeigeMenue(h.pfad);
        else if (h.text === "Doppelklick") desk.fuehreAus({ programm: "explorer", art: "navigieren", pfad: h.pfad });
        else if (h.wo === "eintrag") desk.fuehreAus({ programm: "explorer", art: "auswaehlen", pfad: h.pfad });
        else element.click();
        timer.push(setTimeout(() => schritt(nr, zaehler + 1), 700));
      }, 1300));
    }

    function durchlauf() {
      timer.forEach(clearTimeout);
      timer = [];
      if (ex) ex.beenden();
      fs = bauePlatz(aufgabe.start, null);
      desk.setze({
        offen: [{ programm: "explorer", zustand: "maximiert" }],
        kontext: { fs, ort: aufgabe.start.ort || "/", symbole: einstellungen.symbole, beiStart: (neu) => { ex = neu; } },
      });
      buehne.setze(50, 60);
      buehne.sage("");
      timer.push(setTimeout(() => schritt(0, 0), 800));
    }
    durchlauf();

    return {
      beenden() {
        timer.forEach(clearTimeout);
        if (ex) ex.beenden();
        buehne.beenden();
        desk.beenden();
      },
    };
  },
};
