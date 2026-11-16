/* =====================================================================
   AUFGABENTYP „ZIEHEN UND ABLEGEN“
   Links erscheint ein Ding, rechts stehen eine oder mehrere Kisten.
   Das Kind zieht das Ding mit gedrückter linker Taste in die passende
   Kiste und lässt dort los.

   Einstellungen (aus den Level-Daten):
     runden     – wie viele Dinge
     dinge      – Liste: { bild, name }   z. B. "edelstein-rot", "den roten Edelstein"
     behaelter  – Liste: { bild, name, nimmt }
                  "nimmt" = Bild des Dings, das in diese Kiste gehört.
                  Fehlt "nimmt", passt alles hinein.
                  Zu jeder Kiste muss es ein Bild "…-offen" geben
                  (z. B. "kiste-rot-offen"): Sie geht auf, sobald ein Ding
                  über ihr schwebt, und schließt sich danach wieder.
   ===================================================================== */

import { bild, zufall, zufallsPlatz, zeigeMaus, schild, demoBuehne, tauscheBild } from "./hilfsmittel.js";

const DING_FAKTOR = 5;
const KISTEN_FAKTOR = 7;
const OFFEN_NACH_TREFFER_MS = 500; // so lange bleibt die Kiste nach dem Ablegen offen

/* Kiste auf- oder zumachen */
function setzeOffen(kiste, offen) {
  if (kiste.offen === offen) return;
  kiste.offen = offen;
  const name = offen ? kiste.daten.bild + "-offen" : kiste.daten.bild;
  tauscheBild(kiste.element, bild(name, KISTEN_FAKTOR));
}

export const ziehen = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden, dinge, behaelter } = einstellungen;
    let runde = 0;
    let ding = null;       // { element, daten }
    let griff = null;      // Abstand zwischen Mauszeiger und Ecke des Dings beim Ziehen
    let beendet = false;

    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste drücken, halten, ziehen, loslassen.");

    // Kisten rechts untereinander aufstellen
    const kisten = behaelter.map((daten, i) => {
      const element = document.createElement("div");
      element.className = "ziel behaelter";
      element.append(bild(daten.bild, KISTEN_FAKTOR));
      flaeche.append(element);
      const anteil = (i + 1) / (behaelter.length + 1);
      element.style.left = flaeche.clientWidth * 0.78 - element.offsetWidth / 2 + "px";
      element.style.top = (flaeche.clientHeight - 20) * anteil - element.offsetHeight / 2 + "px";
      return { element, daten, offen: false, schliessTimer: null };
    });

    const passt = (kiste) => !kiste.daten.nimmt || kiste.daten.nimmt === ding.daten.bild;

    function neuesDing() {
      const daten = zufall(dinge);
      const element = document.createElement("div");
      element.className = "ziel greifbar";
      element.append(bild(daten.bild, DING_FAKTOR));
      flaeche.append(element);
      const stelle = zufallsPlatz(flaeche, element.offsetWidth, element.offsetHeight, {
        oben: mitHilfe ? 64 : 24, bisAnteil: 0.5,
      });
      element.style.left = stelle.x + "px";
      element.style.top = stelle.y + "px";
      ding = { element, daten };

      const richtige = kisten.find(passt);
      beiAnsage(`Zieh ${daten.name} in ${richtige.daten.name}.`);
      kisten.forEach((k) => {
        k.element.classList.remove("mit-hilfe");
        k.element.querySelector(".ziel-schild")?.remove();
      });
      if (mitHilfe) {
        element.append(schild("Zieh mich!"));
        richtige.element.classList.add("mit-hilfe");
        richtige.element.append(schild("Hier ablegen"));
      }
      element.addEventListener("mousedown", greifen);
    }

    function greifen(e) {
      if (e.button !== 0 || beendet) return;
      e.preventDefault();
      const r = ding.element.getBoundingClientRect();
      griff = { x: e.clientX - r.left, y: e.clientY - r.top };
      ding.element.classList.add("gegriffen");
    }

    /* In welcher Kiste liegt gerade die Mitte des Dings? (oder undefined) */
    function kisteUnterDing() {
      const d = ding.element.querySelector("canvas").getBoundingClientRect();
      const mx = d.left + d.width / 2, my = d.top + d.height / 2;
      return kisten.find((k) => {
        const b = k.element.getBoundingClientRect();
        return mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom;
      });
    }

    function bewegen(e) {
      if (!griff) return;
      const r = flaeche.getBoundingClientRect();
      ding.element.style.left = e.clientX - r.left - griff.x + "px";
      ding.element.style.top = e.clientY - r.top - griff.y + "px";
      // Die Kiste unter dem Ding geht auf, alle anderen sind zu
      const drunter = kisteUnterDing();
      kisten.forEach((k) => {
        if (k.schliessTimer) return; // schließt gleich von selbst
        setzeOffen(k, k === drunter);
      });
    }

    function loslassen() {
      if (!griff) return;
      griff = null;
      ding.element.classList.remove("gegriffen");
      const getroffen = kisteUnterDing();

      if (getroffen && passt(getroffen)) {
        // Die Kiste bleibt kurz offen und schließt sich dann
        setzeOffen(getroffen, true);
        getroffen.schliessTimer = setTimeout(() => {
          getroffen.schliessTimer = null;
          setzeOffen(getroffen, false);
        }, OFFEN_NACH_TREFFER_MS);
        ding.element.remove();
        runde++;
        beiRichtig(runde, runden);
        if (runde >= runden) {
          beendet = true;
          beiFertig();
        } else {
          neuesDing();
        }
      } else {
        kisten.forEach((k) => setzeOffen(k, false));
        // Daneben oder falsche Kiste: Das Ding bleibt liegen, noch ein Versuch.
        if (getroffen) {
          // aus der falschen Kiste wieder ein Stück herausrücken
          ding.element.style.left = parseFloat(ding.element.style.left) - 160 + "px";
        }
        beiFehler();
      }
    }

    window.addEventListener("mousemove", bewegen);
    window.addEventListener("mouseup", loslassen);
    neuesDing();

    return {
      beenden() {
        beendet = true;
        window.removeEventListener("mousemove", bewegen);
        window.removeEventListener("mouseup", loslassen);
        kisten.forEach((k) => {
          clearTimeout(k.schliessTimer);
          k.element.remove();
        });
        if (ding) ding.element.remove();
      },
    };
  },

  zeigeDemo(flaeche, tafel, einstellungen) {
    const stein = document.createElement("div");
    stein.className = "ziel mittig";
    stein.style.top = "50%";
    stein.append(bild(einstellungen.dinge[0].bild, DING_FAKTOR));
    const kiste = document.createElement("div");
    kiste.className = "ziel mittig";
    kiste.style.left = "70%";
    kiste.style.top = "50%";
    const kistenName = einstellungen.behaelter[0].bild;
    kiste.append(bild(kistenName, KISTEN_FAKTOR));
    flaeche.append(kiste, stein);
    const buehne = demoBuehne(flaeche);
    zeigeMaus(tafel, "links", "Linke Taste drücken, halten, ziehen, loslassen.");

    buehne.schleife(7000, [
      [0, () => {
        buehne.setze(15, 80);
        buehne.sage("");
        stein.style.transition = "none";
        stein.style.left = "30%";
        stein.style.visibility = "visible";
        tauscheBild(kiste, bild(kistenName, KISTEN_FAKTOR));
      }],
      [400, () => buehne.bewege(30, 50, 1200)],
      [1800, () => buehne.sage("Drücken und halten")],
      [2600, () => {
        buehne.bewege(70, 50, 2200);
        stein.style.transition = "left 2200ms ease-in-out";
        stein.style.left = "70%";
      }],
      [4300, () => tauscheBild(kiste, bild(kistenName + "-offen", KISTEN_FAKTOR))],
      [5000, () => buehne.sage("Loslassen!")],
      [5600, () => { stein.style.visibility = "hidden"; }],
      [6200, () => tauscheBild(kiste, bild(kistenName, KISTEN_FAKTOR))],
    ]);

    return {
      beenden() {
        buehne.beenden();
        stein.remove();
        kiste.remove();
      },
    };
  },
};
