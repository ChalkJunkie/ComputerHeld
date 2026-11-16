/* =====================================================================
   TASTATUR-BILD (deutsches Layout, QWERTZ)
   Eine gezeichnete Tastatur für die Hilfe in Welt 2. Tasten können
   gelb hervorgehoben werden ("das musst du drücken"), und gedrückte
   Tasten leuchten grün auf.

   Jede Taste: [Beschriftung, Code, Breite]
     Beschriftung – steht auf der Taste und dient zum Hervorheben
     Code         – event.code des Browsers (sagt, WO die Taste liegt;
                    bei deutscher Tastatur hat z. B. die Z-Taste den Code "KeyY")
     Breite       – in Tastenbreiten (1 = normale Buchstabentaste)
   Eine Zeile mit Code null ist nur ein Abstand.
   ===================================================================== */

const REIHEN = [
  [["Esc", "Escape", 1], ["", null, 12.6], ["Entf", "Delete", 1.4]],
  [["^", "Backquote", 1], ["1", "Digit1", 1], ["2", "Digit2", 1], ["3", "Digit3", 1], ["4", "Digit4", 1],
   ["5", "Digit5", 1], ["6", "Digit6", 1], ["7", "Digit7", 1], ["8", "Digit8", 1], ["9", "Digit9", 1],
   ["0", "Digit0", 1], ["ß", "Minus", 1], ["´", "Equal", 1], ["Rücktaste", "Backspace", 2]],
  [["Tab", "Tab", 1.5], ["Q", "KeyQ", 1], ["W", "KeyW", 1], ["E", "KeyE", 1], ["R", "KeyR", 1],
   ["T", "KeyT", 1], ["Z", "KeyY", 1], ["U", "KeyU", 1], ["I", "KeyI", 1], ["O", "KeyO", 1],
   ["P", "KeyP", 1], ["Ü", "BracketLeft", 1], ["+", "BracketRight", 1], ["Enter", "Enter", 1.5]],
  [["Feststell", "CapsLock", 1.75], ["A", "KeyA", 1], ["S", "KeyS", 1], ["D", "KeyD", 1], ["F", "KeyF", 1],
   ["G", "KeyG", 1], ["H", "KeyH", 1], ["J", "KeyJ", 1], ["K", "KeyK", 1], ["L", "KeyL", 1],
   ["Ö", "Semicolon", 1], ["Ä", "Quote", 1], ["#", "Backslash", 1], ["", null, 1.25]],
  [["Umschalt", "ShiftLeft", 1.75], ["<", "IntlBackslash", 1], ["Y", "KeyZ", 1], ["X", "KeyX", 1],
   ["C", "KeyC", 1], ["V", "KeyV", 1], ["B", "KeyB", 1], ["N", "KeyN", 1], ["M", "KeyM", 1],
   [",", "Comma", 1], [".", "Period", 1], ["-", "Slash", 1], ["Umschalt", "ShiftRight", 2.25]],
  [["Strg", "ControlLeft", 1.5], ["Win", "MetaLeft", 1.25], ["Alt", "AltLeft", 1.25],
   ["Leertaste", "Space", 6.25], ["AltGr", "AltRight", 1.25], ["Strg", "ControlRight", 1.5], ["", null, 2]],
];

export function baueTastatur() {
  const element = document.createElement("div");
  element.className = "tastatur";
  element.setAttribute("aria-hidden", "true"); // nur Bild, die Aufgabe steht in Bits Text
  for (const reihe of REIHEN) {
    const zeile = document.createElement("div");
    zeile.className = "tasten-reihe";
    for (const [beschriftung, code, breite] of reihe) {
      const taste = document.createElement("div");
      taste.className = code ? "taste" : "taste luecke";
      taste.style.setProperty("--b", breite);
      if (code) {
        taste.textContent = beschriftung;
        taste.dataset.label = beschriftung;
        taste.dataset.code = code;
        if (beschriftung.length > 2) taste.classList.add("wort");
      }
      zeile.append(taste);
    }
    element.append(zeile);
  }

  return {
    element,
    /* Diese Tasten gelb hervorheben (Liste von Beschriftungen) */
    markiere(beschriftungen) {
      element.querySelectorAll(".taste.zeigen").forEach((t) => t.classList.remove("zeigen"));
      for (const b of beschriftungen) {
        element.querySelectorAll(`.taste[data-label="${CSS.escape(b)}"]`).forEach((t) => t.classList.add("zeigen"));
      }
    },
    /* Eine echte Taste (nach event.code) als gedrückt zeigen */
    druecke(code, an) {
      const taste = element.querySelector(`.taste[data-code="${CSS.escape(code)}"]`);
      if (taste) taste.classList.toggle("gedrueckt", an);
    },
    /* Tasten nach Beschriftung als gedrückt zeigen (für Bits Vorführung) */
    drueckeBeschriftungen(beschriftungen, an) {
      for (const b of beschriftungen) {
        element.querySelectorAll(`.taste[data-label="${CSS.escape(b)}"]`).forEach((t) => t.classList.toggle("gedrueckt", an));
      }
    },
  };
}

/* Welche Tasten braucht man für ein Zeichen? (für die Hervorhebung) */
const SONDERZEICHEN = {
  " ": ["Leertaste"],
  "\n": ["Enter"],
  "ß": ["ß"],
  "@": ["AltGr", "Q"],
  "€": ["AltGr", "E"],
  "!": ["Umschalt", "1"],
  "?": ["Umschalt", "ß"],
  ":": ["Umschalt", "."],
  ";": ["Umschalt", ","],
  "_": ["Umschalt", "-"],
  "#": ["#"],
  "+": ["+"],
  ".": ["."],
  ",": [","],
  "-": ["-"],
};

export function tastenFuerZeichen(zeichen) {
  if (zeichen === undefined) return [];
  if (SONDERZEICHEN[zeichen]) return SONDERZEICHEN[zeichen];
  if (/[0-9]/.test(zeichen)) return [zeichen];
  if (/[a-zäöü]/i.test(zeichen)) {
    const gross = zeichen !== zeichen.toLowerCase();
    return gross ? ["Umschalt", zeichen] : [zeichen.toUpperCase()];
  }
  return [];
}

/* Welche Tasten gehören zu einem Tastennamen aus den Level-Daten?
   name: z. B. "Enter", "Strg+Z" oder eine Liste wie ["Rücktaste", "Entf"] */
export function tastenFuerName(name) {
  return [].concat(name).flatMap((n) => n.split("+"));
}
