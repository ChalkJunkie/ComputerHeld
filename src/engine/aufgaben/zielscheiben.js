/* =====================================================================
   AUFGABENTYP „ZIELSCHEIBEN“
   Ein Ding erscheint an einer zufälligen Stelle. Das Kind zeigt darauf,
   klickt es an oder doppelklickt es – dann kommt das nächste.

   Einstellungen (aus den Level-Daten):
     runden      – wie viele Dinge
     groesse     – Vergrößerung des Bildes (immer gleich groß) ODER
     groessen    – Liste von Größen, z. B. [5, 4, 3, 2]: Die Runden werden
                   gleichmäßig aufgeteilt, die Dinge werden nach und nach kleiner
     bild        – welches Bild (Standard "zielscheibe", siehe hilfsmittel.js) ODER
     bilder      – Liste von Bildern, pro Runde wird zufällig eins gewählt
     bildDanach  – Bild, das nach dem Treffer kurz zu sehen ist
                   (z. B. "kiste-offen" – die Kiste geht auf)
     ausloeser   – "zeigen" (draufzeigen und warten), "klick" oder "doppelklick"
     haltezeit   – nur bei "zeigen": Millisekunden, die der Zeiger bleiben muss

   Jeder Aufgabentyp hat dieselben zwei Funktionen:
     starte(...)    – baut die Aufgabe in die Spielfläche
     zeigeDemo(...) – kleine Vorführung für Bits Erklärung
   Beide geben ein Objekt mit beenden() zurück, das alles wieder aufräumt.
   ===================================================================== */

import { bild, zufall, zufallsPlatz, zeigeMaus, schild, demoBuehne, tauscheBild } from "./hilfsmittel.js";

/* Wer kürzer als so viele Millisekunden über das Ziel huscht, hat nur
   „gestreift“ – das zählt nicht als Fehler. */
const STREIFEN_MS = 200;
/* So lange wird nach einem einzelnen Klick auf den zweiten Klick gewartet. */
const DOPPELKLICK_WARTEN_MS = 600;
/* So lange bleibt "bildDanach" (z. B. die offene Kiste) zu sehen. */
const BILD_DANACH_MS = 650;

/* Texte der Hilfe je Auslöser: [Schild am Ziel, Teil der Maus, Text zur Maus] */
const HILFE = {
  zeigen:      ["Hierhin!", "normal", "Nur zeigen, nicht klicken."],
  klick:       ["Klick mich!", "links", "Linke Taste: einmal kurz drücken."],
  doppelklick: ["Zweimal schnell!", "links", "Linke Taste: zweimal schnell drücken."],
};

function baueZiel(name, groesse, ausloeser) {
  const ziel = document.createElement("div");
  ziel.className = "ziel";
  ziel.append(bild(name, groesse));
  if (ausloeser === "zeigen") {
    const balken = document.createElement("div");
    balken.className = "haltebalken";
    balken.innerHTML = "<div></div>";
    ziel.append(balken);
  }
  return ziel;
}

export const zielscheiben = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, gemeinsam }) {
    const { runden, ausloeser, haltezeit = 700, bildDanach } = einstellungen;
    let runde = 0;
    let ziel = null;
    let zielBild = "";
    let zielGroesse = 0;
    let letzteStelle = null;
    let timer = null;
    let betretenUm = 0;
    let beendet = false;

    if (mitHilfe) zeigeMaus(tafel, HILFE[ausloeser][1], HILFE[ausloeser][2]);

    // Größe für die aktuelle Runde: Bei einer Liste wird es nach und nach kleiner
    function groesseJetzt() {
      const liste = einstellungen.groessen;
      if (!liste) return einstellungen.groesse;
      return liste[Math.min(liste.length - 1, Math.floor((runde * liste.length) / runden))];
    }
    function bildJetzt() {
      if (einstellungen.bilder) return zufall(einstellungen.bilder);
      return einstellungen.bild || "zielscheibe";
    }

    function naechstesZiel() {
      if (beendet) return;
      zielBild = bildJetzt();
      zielGroesse = groesseJetzt();
      ziel = baueZiel(zielBild, zielGroesse, ausloeser);
      const canvas = ziel.querySelector("canvas");
      const stelle = zufallsPlatz(flaeche, canvas.width, canvas.height + 20, {
        oben: mitHilfe ? 64 : 24, // Platz für das Schild
        fern: letzteStelle,
      });
      letzteStelle = stelle;
      ziel.style.left = stelle.x + "px";
      ziel.style.top = stelle.y + "px";
      if (mitHilfe) {
        ziel.classList.add("mit-hilfe");
        ziel.append(schild(HILFE[ausloeser][0]));
      }

      if (ausloeser === "zeigen") {
        const balken = ziel.querySelector(".haltebalken div");
        ziel.addEventListener("mouseenter", () => {
          betretenUm = performance.now();
          // Balken füllt sich, solange der Zeiger auf dem Ziel bleibt
          balken.style.transition = `width ${haltezeit}ms linear`;
          balken.style.width = "100%";
          timer = setTimeout(getroffen, haltezeit);
        });
        ziel.addEventListener("mouseleave", () => {
          if (!timer) return;
          clearTimeout(timer);
          timer = null;
          balken.style.transition = "none";
          balken.style.width = "0";
          if (performance.now() - betretenUm >= STREIFEN_MS) beiFehler();
        });
      } else if (ausloeser === "klick") {
        ziel.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return; // nur die linke Taste zählt
          e.stopPropagation();
          getroffen();
        });
      } else {
        // Doppelklick: Bleibt es bei einem einzelnen Klick, war es zu langsam.
        ziel.addEventListener("click", (e) => {
          if (e.detail !== 1) return;
          clearTimeout(timer);
          timer = setTimeout(beiFehler, DOPPELKLICK_WARTEN_MS);
        });
        ziel.addEventListener("dblclick", () => {
          clearTimeout(timer);
          getroffen();
        });
      }
      flaeche.append(ziel);
    }

    function getroffen() {
      timer = null;
      // Im Boss merkt sich die Abfolge, welche Dinge eingesammelt wurden
      if (gemeinsam) (gemeinsam.gesammelt ||= []).push(zielBild);
      runde++;
      beiRichtig(runde, runden);

      const weiter = () => {
        ziel.remove();
        if (runde >= runden) {
          beendet = true;
          beiFertig();
        } else {
          naechstesZiel();
        }
      };
      if (bildDanach) {
        // z. B. die Kiste geht kurz auf, dann kommt die nächste
        ziel.classList.add("erledigt");
        ziel.querySelector(".ziel-schild")?.remove();
        tauscheBild(ziel, bild(bildDanach, zielGroesse));
        timer = setTimeout(weiter, BILD_DANACH_MS);
      } else {
        weiter();
      }
    }

    // Bei "klick" zählt ein Klick neben das Ziel als Fehler
    function danebenGeklickt(e) {
      if (ausloeser === "klick" && e.button === 0 && !beendet) beiFehler();
    }
    flaeche.addEventListener("mousedown", danebenGeklickt);

    naechstesZiel();

    return {
      beenden() {
        beendet = true;
        clearTimeout(timer);
        flaeche.removeEventListener("mousedown", danebenGeklickt);
        if (ziel) ziel.remove();
      },
    };
  },

  /* Vorführung: Der gezeichnete Mauszeiger wandert zum Ziel und zeigt,
     was dort zu tun ist. */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const ausloeser = einstellungen.ausloeser;
    const name = einstellungen.bild || (einstellungen.bilder && einstellungen.bilder[0]) || "zielscheibe";
    const ziel = baueZiel(name, 6, ausloeser);
    ziel.classList.add("mittig");
    ziel.style.left = "60%";
    ziel.style.top = "45%";
    flaeche.append(ziel);
    const balken = ziel.querySelector(".haltebalken div");
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, HILFE[ausloeser][1], HILFE[ausloeser][2]);

    buehne.schleife(5500, [
      [0, () => {
        buehne.setze(20, 75);
        buehne.sage("");
        ziel.style.visibility = "visible";
        tauscheBild(ziel, bild(name, 6)); // wieder das Ausgangsbild
        if (balken) { balken.style.transition = "none"; balken.style.width = "0"; }
      }],
      [400, () => buehne.bewege(60, 45, 1800)],
      [2400, () => {
        if (ausloeser === "zeigen") {
          balken.style.transition = "width 900ms linear";
          balken.style.width = "100%";
        } else {
          buehne.sage("Klick!");
        }
      }],
      [2800, () => {
        if (ausloeser === "doppelklick") buehne.sage("Klick! Klick!");
        if (einstellungen.bildDanach) tauscheBild(ziel, bild(einstellungen.bildDanach, 6));
      }],
      [3800, () => { ziel.style.visibility = "hidden"; }],
    ]);

    return {
      beenden() {
        buehne.beenden();
        ziel.remove();
      },
    };
  },
};
