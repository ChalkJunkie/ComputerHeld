/* =====================================================================
   AUFGABENTYP „KONTEXTMENÜ“
   Ein Ding erscheint. Das Kind klickt es mit der RECHTEN Taste an, ein
   Menü geht auf, und dort wählt es mit der linken Taste den genannten
   Eintrag.

   Einstellungen (aus den Level-Daten):
     runden       – wie viele Durchgänge
     bild         – welches Bild (z. B. "kiste")
     groesse      – Vergrößerung des Bildes
     dingName     – wie das Ding im Satz heißt (z. B. "die Kiste")
     eintraege    – alle Einträge des Menüs
     gesucht      – welche Einträge gewählt werden sollen
                    (pro Durchgang wird zufällig einer davon genommen)
     festeStelle  – true: Das Ding steht in der Mitte und bleibt die ganze
                    Zeit stehen (sonst: jede Runde ein neues an anderer Stelle)
     ketten       – true: Nach jedem richtigen Eintrag kommt eine Kette um
                    das Ding, nach der letzten Runde ein Schloss (Boss)
   ===================================================================== */

import { bild, zufall, zufallsPlatz, zeigeMaus, schild, demoBuehne } from "./hilfsmittel.js";
import { kette, SCHLOSS } from "../../../sprites/symbole.js";
import { erzeugeSprite } from "../sprite-render.js";

const KETTEN_FAKTOR = 3;
const SCHLUSS_PAUSE_MS = 1300; // Zeit zum Anschauen der fertig gesicherten Kiste

function baueMenue(eintraege) {
  const menue = document.createElement("div");
  menue.className = "kontextmenue";
  menue.setAttribute("role", "menu");
  for (const text of eintraege) {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.setAttribute("role", "menuitem");
    knopf.textContent = text;
    menue.append(knopf);
  }
  return menue;
}

/* Legt die Kette Nummer "nummer" (0, 1, 2 …) um das Ding.
   Reihenfolge: waagrecht oben, waagrecht unten, senkrecht in der Mitte. */
function legeKette(ding, nummer) {
  const kiste = ding.querySelector("canvas");
  const breite = kiste.width, hoehe = kiste.height;
  const glied = 8 * KETTEN_FAKTOR; // Länge eines Kettenglieds in Bildschirmpunkten
  const art = nummer % 3;
  let canvas;
  if (art < 2) {
    canvas = erzeugeSprite(kette(Math.ceil((breite + 40) / glied), false), { faktor: KETTEN_FAKTOR });
    canvas.style.left = (breite - canvas.width) / 2 + "px";
    canvas.style.top = hoehe * (art === 0 ? 0.42 : 0.72) - canvas.height / 2 + "px";
  } else {
    canvas = erzeugeSprite(kette(Math.ceil((hoehe + 30) / glied), true), { faktor: KETTEN_FAKTOR });
    canvas.style.left = (breite - canvas.width) / 2 + "px";
    canvas.style.top = (hoehe - canvas.height) / 2 + "px";
  }
  canvas.classList.add("kette");
  ding.append(canvas);
}

function legeSchloss(ding) {
  const kiste = ding.querySelector("canvas");
  const schloss = erzeugeSprite(SCHLOSS, { faktor: 4 });
  schloss.classList.add("kette");
  schloss.style.left = (kiste.width - schloss.width) / 2 + "px";
  schloss.style.top = kiste.height * 0.58 - schloss.height / 2 + "px";
  ding.append(schloss);
}

export const kontextmenue = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const {
      runden, eintraege, gesucht, groesse = 6, dingName = "die Kiste",
      festeStelle = false, ketten = false,
    } = einstellungen;
    let runde = 0;
    let ding = null;
    let menue = null;
    let ziel = "";
    let letzteStelle = null;
    let beendet = false;
    let schlussTimer = null;

    function schliesseMenue() {
      if (menue) menue.remove();
      menue = null;
      if (mitHilfe && !beendet) zeigeMaus(tafel, "rechts", "Rechte Taste: einmal kurz drücken.");
    }

    function oeffneMenue(e) {
      e.preventDefault(); // kein Menü des Browsers
      if (beendet) return;
      schliesseMenue();
      menue = baueMenue(eintraege);
      flaeche.append(menue);
      // Menü an der Mausstelle öffnen, aber nicht über den Rand hinaus
      const rahmen = flaeche.getBoundingClientRect();
      const x = Math.min(e.clientX - rahmen.left, flaeche.clientWidth - menue.offsetWidth - 8);
      const y = Math.min(e.clientY - rahmen.top, flaeche.clientHeight - menue.offsetHeight - 8);
      menue.style.left = Math.max(8, x) + "px";
      menue.style.top = Math.max(8, y) + "px";

      for (const knopf of menue.querySelectorAll("button")) {
        if (mitHilfe && knopf.textContent === ziel) knopf.classList.add("mit-hilfe");
        knopf.addEventListener("click", () => {
          const richtig = knopf.textContent === ziel;
          schliesseMenue();
          if (richtig) geschafft();
          else beiFehler();
        });
      }
      if (mitHilfe) zeigeMaus(tafel, "links", "Jetzt linke Taste: Eintrag anklicken.");
    }

    function erzeugeDing() {
      ding = document.createElement("div");
      ding.className = "ziel";
      ding.append(bild(einstellungen.bild || "kiste", groesse));
      flaeche.append(ding);
      if (festeStelle) {
        // in die Mitte der Spielfläche
        ding.style.left = (flaeche.clientWidth - ding.offsetWidth) / 2 + "px";
        ding.style.top = (flaeche.clientHeight - 20 - ding.offsetHeight) / 2 + "px";
      } else {
        const canvas = ding.querySelector("canvas");
        const stelle = zufallsPlatz(flaeche, canvas.width, canvas.height, {
          oben: mitHilfe ? 64 : 24, fern: letzteStelle,
        });
        letzteStelle = stelle;
        ding.style.left = stelle.x + "px";
        ding.style.top = stelle.y + "px";
      }
      if (mitHilfe) {
        ding.classList.add("mit-hilfe");
        ding.append(schild("Rechte Taste!"));
      }
      ding.addEventListener("contextmenu", oeffneMenue);
      // Linke Taste auf dem Ding: das war die falsche Taste
      ding.addEventListener("click", () => { if (!menue && !beendet) beiFehler(); });
    }

    function naechsteRunde() {
      ziel = zufall(gesucht);
      beiAnsage(`Klick mit der rechten Taste auf ${dingName}. Wähle dann „${ziel}“.`);
      if (!festeStelle || !ding) erzeugeDing();
      schliesseMenue();
    }

    function geschafft() {
      if (!festeStelle) ding.remove();
      if (ketten) legeKette(ding, runde);
      runde++;
      beiRichtig(runde, runden);
      if (runde >= runden) {
        beendet = true;
        if (ketten) {
          // Zum Schluss das Schloss – und kurz Zeit zum Anschauen
          legeSchloss(ding);
          schlussTimer = setTimeout(beiFertig, SCHLUSS_PAUSE_MS);
        } else {
          beiFertig();
        }
      } else {
        naechsteRunde();
      }
    }

    // Klick neben das Menü oder Esc schließt das Menü wieder
    function klickDaneben(e) {
      if (menue && !menue.contains(e.target) && e.button === 0) schliesseMenue();
    }
    function taste(e) {
      if (e.key === "Escape") schliesseMenue();
    }
    flaeche.addEventListener("mousedown", klickDaneben);
    window.addEventListener("keydown", taste);

    naechsteRunde();

    return {
      beenden() {
        beendet = true;
        clearTimeout(schlussTimer);
        flaeche.removeEventListener("mousedown", klickDaneben);
        window.removeEventListener("keydown", taste);
        if (menue) menue.remove();
        if (ding) ding.remove();
      },
    };
  },

  zeigeDemo(flaeche, tafel, einstellungen) {
    const ding = document.createElement("div");
    ding.className = "ziel mittig";
    ding.style.left = "45%";
    ding.style.top = "35%";
    ding.append(bild(einstellungen.bild || "kiste", 6));
    const menue = baueMenue(einstellungen.eintraege);
    menue.style.left = "45%";
    menue.style.top = "35%";
    flaeche.append(ding, menue);
    const buehne = demoBuehne(flaeche);

    buehne.schleife(7000, [
      [0, () => {
        buehne.setze(20, 75);
        buehne.sage("");
        menue.hidden = true;
        zeigeMaus(tafel, "rechts", "Rechte Taste öffnet das Menü.");
      }],
      [400, () => buehne.bewege(45, 35, 1600)],
      [2200, () => buehne.sage("Rechte Taste!")],
      [2800, () => { menue.hidden = false; buehne.sage(""); }],
      [3300, () => {
        // zum ersten Eintrag wandern
        const rahmen = flaeche.getBoundingClientRect();
        const eintrag = menue.querySelector("button").getBoundingClientRect();
        buehne.bewege(
          ((eintrag.left + eintrag.width / 2 - rahmen.left) / rahmen.width) * 100,
          ((eintrag.top + eintrag.height / 2 - rahmen.top) / rahmen.height) * 100,
          1200,
        );
      }],
      [4700, () => {
        buehne.sage("Linke Taste!");
        zeigeMaus(tafel, "links", "Linke Taste wählt den Eintrag.");
      }],
      [6000, () => { menue.hidden = true; }],
    ]);

    return {
      beenden() {
        buehne.beenden();
        ding.remove();
        menue.remove();
      },
    };
  },
};
