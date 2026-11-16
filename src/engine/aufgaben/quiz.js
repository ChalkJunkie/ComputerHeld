/* =====================================================================
   AUFGABENTYP „QUIZ“ (Welt 6)
   Für Wissen, das man im Browser nicht echt ausprobieren kann
   (Alt+Tab, Windows-Taste, Alt+F4) und für Sicherheit am Computer.

   Zwei Arten von Fragen:
   a) Antwort-Knöpfe:
      { frage: "Du willst …", antworten: ["Alt+Tab", "Alt+F4"], richtig: "Alt+Tab",
        hinweise: { "Alt+F4": "Alt+F4 schließt das Programm!" } }
      Antworten mit "+" (z. B. "Alt+Tab") werden als Tasten gezeichnet.
   b) Ein Fenster, wie es auf dem Computer aufgehen könnte:
      { frage: "Was machst du?",
        fenster: { titel: "Gewinnspiel!", text: "…", felder: ["Name", "Adresse"],
                   knoepfe: ["Jetzt mitmachen!", "Abbrechen"] },
        richtig: "X",            ← "X" ist das Kreuz oben rechts im Fenster
        hinweise: { "Jetzt mitmachen!": "…", felder: "…" } }
      Ein Klick in ein Eingabefeld zählt als Fehler, wenn es für "felder"
      einen Hinweis gibt (keine persönlichen Daten eintippen!).
   "richtig" darf auch eine Liste sein.

   Einstellungen (aus den Level-Daten):
     runden    – wie viele Fragen
     gemischt  – false: Fragen in der angegebenen Reihenfolge (Standard: gemischt)
     karten    – Merkkarten [{ tasten: "Alt+Tab", text: "…" }], beim Zeigen
                 und Üben sichtbar, beim Anwenden nicht
     fragen    – Liste der Fragen (siehe oben)
   Beim Üben ist die richtige Antwort markiert.
   ===================================================================== */

import { mischen, zeigeMaus } from "./hilfsmittel.js";

const RUNDE_PAUSE_MS = 1000;

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* "Alt+Tab" -> [Alt] + [Tab] als gezeichnete Tasten; sonst normaler Text */
function beschriftung(text) {
  const teile = text.split("+");
  if (teile.length < 2 || teile.some((t) => t.trim() === "" || t.length > 14)) return [document.createTextNode(text)];
  const stuecke = [];
  teile.forEach((t, i) => {
    if (i > 0) stuecke.push(document.createTextNode(" + "));
    stuecke.push(el("kbd", "taste-bild", t.trim()));
  });
  return stuecke;
}
function einzelTaste(text) {
  // „Windows-Taste“ und Ähnliches auch als Taste zeichnen
  return /-Taste$/.test(text) ? [el("kbd", "taste-bild", text.replace(/-Taste$/, "")), document.createTextNode(" Taste")] : beschriftung(text);
}

function baueKarten(karten) {
  const leiste = el("div", "merk-karten");
  for (const k of karten) {
    const karte = el("div", "merk-karte");
    const tasten = el("div", "merk-tasten");
    tasten.append(...einzelTaste(k.tasten));
    karte.append(tasten, el("p", "", k.text));
    leiste.append(karte);
  }
  return leiste;
}

function baueFenster(f) {
  const fenster = el("div", "quiz-fenster");
  const titel = el("div", "quiz-titel");
  const x = el("button", "quiz-x", "✕");
  x.type = "button";
  x.dataset.antwort = "X";
  x.setAttribute("aria-label", "Schließen");
  titel.append(el("span", "", f.titel), x);
  const inhalt = el("div", "quiz-inhalt");
  inhalt.append(el("p", "", f.text));
  for (const name of f.felder || []) {
    const zeile = el("label", "quiz-feld");
    const eingabe = el("input", "");
    eingabe.type = "text";
    eingabe.readOnly = true;
    eingabe.dataset.feld = name;
    zeile.append(el("span", "", name + ":"), eingabe);
    inhalt.append(zeile);
  }
  const knoepfe = el("div", "quiz-knoepfe");
  for (const k of f.knoepfe || []) {
    const b = el("button", "knopf klein", k);
    b.type = "button";
    b.dataset.antwort = k;
    knoepfe.append(b);
  }
  inhalt.append(knoepfe);
  fenster.append(titel, inhalt);
  return fenster;
}

function baueFrage(frage) {
  const buehne = el("div", "quiz-buehne");
  if (frage.fenster) {
    buehne.classList.add("mit-fenster");
    buehne.append(baueFenster(frage.fenster));
  } else {
    const liste = el("div", "quiz-antworten");
    for (const a of frage.antworten) {
      const b = el("button", "quiz-antwort");
      b.type = "button";
      b.dataset.antwort = a;
      b.append(...einzelTaste(a));
      liste.append(b);
    }
    buehne.append(liste);
  }
  return buehne;
}

const istRichtig = (frage, antwort) => [].concat(frage.richtig).includes(antwort);

export const quiz = {

  starte({ flaeche, tafel, einstellungen, mitHilfe, beiRichtig, beiFehler, beiFertig, beiAnsage }) {
    const { runden } = einstellungen;
    const liste = [];
    while (liste.length < runden) {
      liste.push(...(einstellungen.gemischt === false ? einstellungen.fragen : mischen(einstellungen.fragen)));
    }
    liste.length = runden;
    let runde = 0;
    let gesperrt = false;
    let timer = null;
    let buehne = null;
    const karten = mitHilfe && einstellungen.karten ? baueKarten(einstellungen.karten) : null;
    if (karten) flaeche.append(karten);
    if (mitHilfe) zeigeMaus(tafel, "links", "Linke Taste: einmal klicken.");

    function zeigeFrage() {
      const frage = liste[runde];
      if (buehne) buehne.remove();
      buehne = baueFrage(frage);
      flaeche.append(buehne);
      beiAnsage(frage.frage);
      gesperrt = false;
      if (mitHilfe) {
        // beim Üben: richtige Antwort markieren
        for (const r of [].concat(frage.richtig)) {
          const b = buehne.querySelector(`[data-antwort="${CSS.escape(r)}"]`);
          if (b) b.classList.add("mit-hilfe");
        }
      }
      buehne.addEventListener("click", (e) => {
        if (gesperrt) return;
        const feld = e.target.closest("[data-feld]");
        if (feld && frage.hinweise && frage.hinweise.felder) {
          beiFehler(frage.hinweise.felder);
          return;
        }
        const knopf = e.target.closest("[data-antwort]");
        if (!knopf) return;
        const antwort = knopf.dataset.antwort;
        if (!istRichtig(frage, antwort)) {
          knopf.classList.add("falsch");
          beiFehler(frage.hinweise && frage.hinweise[antwort]);
          return;
        }
        knopf.classList.add("richtig");
        gesperrt = true;
        runde++;
        beiRichtig(runde, runden);
        timer = setTimeout(() => {
          if (runde >= runden) beiFertig();
          else zeigeFrage();
        }, RUNDE_PAUSE_MS);
      });
    }
    zeigeFrage();

    return {
      beenden() {
        clearTimeout(timer);
        if (buehne) buehne.remove();
        if (karten) karten.remove();
      },
    };
  },

  /* Vorführung: die Merkkarten – oder das erste Fenster mit markierter Antwort */
  zeigeDemo(flaeche, tafel, einstellungen) {
    const teile = [];
    if (einstellungen.karten) {
      const karten = baueKarten(einstellungen.karten);
      karten.classList.add("gross");
      teile.push(karten);
    } else {
      const frage = einstellungen.fragen[0];
      const buehne = baueFrage(frage);
      for (const r of [].concat(frage.richtig)) buehne.querySelector(`[data-antwort="${CSS.escape(r)}"]`)?.classList.add("mit-hilfe");
      teile.push(buehne);
    }
    flaeche.append(...teile);
    zeigeMaus(tafel, "links", "Linke Taste: einmal klicken.");
    return {
      beenden() {
        teile.forEach((t) => t.remove());
      },
    };
  },
};
