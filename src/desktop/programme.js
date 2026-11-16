/* =====================================================================
   PROGRAMME DES MINI-DESKTOPS
   Jedes Programm hat:
     name    – so heißt es im Startmenü, in der Taskleiste und im Fenster
     symbol  – Pixel-Symbol aus sprites/programme.js
     inhalt  – Funktion, die den Inhalt des Fensters baut (nur zum Anschauen)
     imStartmenue – false: erscheint nicht im Startmenü
   Die Reihenfolge hier ist auch die Reihenfolge im Startmenü.
   ===================================================================== */

import {
  SYMBOL_NOTIZEN, SYMBOL_MALEN, SYMBOL_RECHNER, SYMBOL_MUSIK, SYMBOL_FOTOS, BILD_HAUS,
} from "../../sprites/programme.js";
import { ORDNER } from "../../sprites/dateien.js";
import { erzeugeSprite } from "../engine/sprite-render.js";
import { baueExplorer } from "./explorer.js";

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  return e;
}

export const PROGRAMME = {

  notizen: {
    name: "Notizen",
    symbol: SYMBOL_NOTIZEN,
    inhalt() {
      return el("div", "prog-notizen", "Einkaufsliste:\n– Käse\n– Brot\n– Äpfel\n– Milch");
    },
  },

  malen: {
    name: "Malen",
    symbol: SYMBOL_MALEN,
    inhalt() {
      const leiste = el("div", "prog-farben");
      for (const farbe of ["#2e1c12", "#d6402b", "#f5c12e", "#3fae3a", "#3f8ae0", "#ffffff"]) {
        const f = el("span", "prog-farbe");
        f.style.background = farbe;
        leiste.append(f);
      }
      const bild = el("div", "prog-leinwand");
      bild.append(erzeugeSprite(BILD_HAUS, { faktor: 6 }));
      const ganz = el("div", "prog-malen");
      ganz.append(leiste, bild);
      return ganz;
    },
  },

  rechner: {
    name: "Rechner",
    symbol: SYMBOL_RECHNER,
    inhalt() {
      const ganz = el("div", "prog-rechner");
      ganz.append(el("div", "prog-anzeige", "12 + 30 = 42"));
      const tasten = el("div", "prog-tasten");
      for (const t of ["7", "8", "9", "+", "4", "5", "6", "−", "1", "2", "3", "×", "0", ",", "=", "÷"]) {
        tasten.append(el("span", "prog-taste", t));
      }
      ganz.append(tasten);
      return ganz;
    },
  },

  musik: {
    name: "Musik",
    symbol: SYMBOL_MUSIK,
    inhalt() {
      const ganz = el("div", "prog-musik");
      ganz.append(erzeugeSprite(SYMBOL_MUSIK, { faktor: 5 }));
      const text = el("div", "prog-lied");
      text.append(el("strong", "", "Mausland-Polka"), el("span", "", "Bit und die Klick-Band"));
      const balken = el("div", "prog-balken");
      balken.append(el("div", ""));
      text.append(balken);
      ganz.append(text);
      return ganz;
    },
  },

  fotos: {
    name: "Fotos",
    symbol: SYMBOL_FOTOS,
    inhalt() {
      const ganz = el("div", "prog-fotos");
      ganz.append(erzeugeSprite(SYMBOL_FOTOS, { faktor: 9 }), el("span", "", "Ausflug in die Berge"));
      return ganz;
    },
  },


  // Der Explorer braucht ein Dateisystem (kommt aus den Level-Daten) und
  // erscheint deshalb nicht im Startmenü.
  explorer: {
    name: "Explorer",
    symbol: ORDNER,
    imStartmenue: false,
    inhalt: (kontext) => baueExplorer(kontext),
  },

};
