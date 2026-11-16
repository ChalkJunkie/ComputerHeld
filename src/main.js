/* =====================================================================
   HAUPTPROGRAMM: baut die Bildschirme und wechselt zwischen ihnen
   =====================================================================
   Bildschirme:  Start – Weltkarte – Welt (Level-Übersicht) – Level –
                 Einstellungen
   Welcher Bildschirm zu sehen ist, steht hinter dem # in der Adresse
   (z. B. #/welt/1). So funktioniert auch der Zurück-Knopf des Browsers.
   ===================================================================== */

import { SPIEL, WELTEN } from "./daten/welten.js";
import { LEVEL } from "./levels/alle.js";
import * as fortschritt from "./engine/fortschritt.js";
import { erzeugeSprite } from "./engine/sprite-render.js";
import { starteLevel } from "./engine/level-ablauf.js";
import { BIT } from "../sprites/bit.js";
import { STERN } from "../sprites/symbole.js";

const app = document.getElementById("app");
let laufendesLevel = null;

/* ---------------- kleine Helfer ---------------- */

/* Erzeugt ein HTML-Element: el("p", { class: "x" }, "Text", weiteresElement) */
function el(tag, eigenschaften = {}, ...kinder) {
  const element = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften)) {
    if (name === "klick") element.addEventListener("click", wert);
    else if (wert !== false && wert != null) element.setAttribute(name, wert === true ? "" : wert);
  }
  element.append(...kinder);
  return element;
}

function geheZu(ziel) {
  location.hash = ziel;
}

function knopf(text, ziel, zusatz = {}) {
  return el("button", { type: "button", class: "knopf", klick: () => geheZu(ziel), ...zusatz }, text);
}

/* Kleine Sternanzeige: goldene und blasse Sterne nebeneinander */
function sternAnzeige(anzahl, faktor = 2) {
  const reihe = el("span", { class: "sterne", role: "img", "aria-label": `${anzahl} von 3 Sternen` });
  for (let i = 1; i <= 3; i++) {
    reihe.append(erzeugeSprite(STERN, { faktor, palette: i <= anzahl ? STERN.palette : STERN.paletteLeer }));
  }
  return reihe;
}

/* Sternzähler als Text mit einem goldenen Stern davor */
function sternZaehler(anzahl, maximal) {
  return el("span", { class: "sternzaehler" },
    erzeugeSprite(STERN, { faktor: 2 }), ` ${anzahl} / ${maximal}`);
}

function setzeWeltFarben(element, welt) {
  element.style.setProperty("--welt-hell", welt.farben.hell);
  element.style.setProperty("--welt-mittel", welt.farben.mittel);
  element.style.setProperty("--welt-dunkel", welt.farben.dunkel);
}

function wendeEinstellungenAn() {
  document.documentElement.dataset.schrift = fortschritt.einstellung("schrift");
}

/* Sucht ein Level in allen Welten */
function findeLevel(levelId) {
  for (const welt of WELTEN) {
    const index = welt.level.findIndex((l) => l.id === levelId);
    if (index >= 0) return { welt, index, eintrag: welt.level[index], daten: LEVEL[levelId] };
  }
  return null;
}

function bildschirm(name, ...kinder) {
  app.replaceChildren(el("main", { class: "bildschirm " + name }, ...kinder));
  return app.firstElementChild;
}

/* ---------------- Bildschirm: Start ---------------- */

function zeigeStart() {
  // Hinweis für Geräte ohne Maus (z. B. Tablets)
  const nurTouch = matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches;

  bildschirm("start",
    el("h1", { class: "pixel titel" }, SPIEL.titel),
    el("p", { class: "untertitel" }, SPIEL.untertitel),
    el("div", { class: "start-mitte" },
      erzeugeSprite(BIT, { pose: "winkend", faktor: 8 }),
      el("div", { class: "sprechblase" },
        el("p", {}, "Hallo! Ich bin Bit, die Informatik-Maus."),
        el("p", {}, "Komm mit in die Computer-Welt. Ich zeige dir Maus und Tastatur!"),
        nurTouch ? el("p", { class: "hinweis" }, "Dieses Spiel braucht eine Maus und eine Tastatur.") : "",
      ),
    ),
    el("div", { class: "knopfreihe" },
      knopf("Spielen", "#/karte", { class: "knopf gross" }),
      knopf("Einstellungen", "#/einstellungen"),
    ),
  );
}

/* ---------------- Bildschirm: Weltkarte ---------------- */

function weltKachel(welt) {
  const frei = fortschritt.weltFrei(welt);
  const kachel = el("button", {
    type: "button",
    class: "welt-kachel" + (frei ? "" : " gesperrt"),
    disabled: !frei,
    klick: () => geheZu(`#/welt/${welt.id}`),
  },
    el("span", { class: "pixel welt-nummer" }, `Welt ${welt.id}`),
    el("span", { class: "pixel welt-name" }, welt.name),
    frei
      ? sternZaehler(fortschritt.sterneDerWelt(welt), welt.level.length * 3)
      : el("span", { class: "sperrtext" },
          welt.id === 6 ? "Schaffe zuerst Welt 1 bis 5." : "Schaffe zuerst das Mausland."),
  );
  setzeWeltFarben(kachel, welt);
  return kachel;
}

function zeigeKarte() {
  const [w1, w2, w3, w4, w5, w6] = WELTEN;
  bildschirm("karte",
    el("header", { class: "kopf" },
      knopf("Zurück", "#/", { class: "knopf klein" }),
      el("h1", { class: "pixel" }, "Weltkarte"),
      sternZaehler(fortschritt.sterneGesamt(), WELTEN.reduce((n, w) => n + w.level.length * 3, 0)),
    ),
    el("div", { class: "kartenfeld" },
      weltKachel(w1),
      el("div", { class: "weg", "aria-hidden": "true" }),
      el("div", { class: "welt-gruppe" }, weltKachel(w2), weltKachel(w3), weltKachel(w4), weltKachel(w5)),
      el("div", { class: "weg", "aria-hidden": "true" }),
      weltKachel(w6),
    ),
    el("p", { class: "kartenhinweis" },
      "Starte im Mausland. Danach darfst du dir aussuchen, wohin du gehst."),
  );
}

/* ---------------- Bildschirm: Welt (Level-Übersicht) ---------------- */

function levelKachel(welt, index) {
  const eintrag = welt.level[index];
  const gebaut = Boolean(LEVEL[eintrag.id]);
  const frei = fortschritt.levelFrei(welt, index);
  const spielbar = gebaut && frei;

  let zustand;
  if (!gebaut) zustand = el("span", { class: "sperrtext" }, "kommt bald");
  else if (!frei) zustand = el("span", { class: "sperrtext" }, "noch gesperrt");
  else zustand = sternAnzeige(fortschritt.sterneVon(eintrag.id), 3);

  return el("button", {
    type: "button",
    class: "level-kachel " + eintrag.art + (spielbar ? "" : " gesperrt"),
    disabled: !spielbar,
    klick: () => geheZu(`#/level/${eintrag.id}`),
  },
    el("span", { class: "pixel level-nummer" }, eintrag.id),
    el("span", { class: "level-titel" }, eintrag.titel),
    zustand,
  );
}

function zeigeWelt(weltId) {
  const welt = WELTEN.find((w) => String(w.id) === weltId);
  if (!welt || !fortschritt.weltFrei(welt)) return geheZu("#/karte");

  const seite = bildschirm("welt",
    el("header", { class: "kopf" },
      knopf("Zurück", "#/karte", { class: "knopf klein" }),
      el("h1", { class: "pixel" }, `Welt ${welt.id}: ${welt.name}`),
      sternZaehler(fortschritt.sterneDerWelt(welt), welt.level.length * 3),
    ),
    el("p", { class: "welt-thema" }, welt.thema),
    el("div", { class: "level-liste" }, ...welt.level.map((_, i) => levelKachel(welt, i))),
  );
  setzeWeltFarben(seite, welt);
}

/* ---------------- Bildschirm: Level ---------------- */

function zeigeLevel(levelId) {
  const fund = findeLevel(levelId);
  if (!fund || !fund.daten || !fortschritt.levelFrei(fund.welt, fund.index)) return geheZu("#/karte");
  const { welt, index, daten } = fund;

  // Gibt es ein nächstes, schon gebautes Level in dieser Welt?
  const naechstes = welt.level[index + 1];
  const hatNaechstes = naechstes && LEVEL[naechstes.id];

  const seite = bildschirm("level");
  setzeWeltFarben(seite, welt);
  laufendesLevel = starteLevel(seite, { id: levelId, ...daten }, {
    schonGeschafft: fortschritt.sterneVon(levelId) > 0,
    beiErgebnis: (sterne) => fortschritt.merkeErgebnis(levelId, sterne),
    beiZurueck: () => geheZu(`#/welt/${welt.id}`),
    beiNaechstes: hatNaechstes ? () => geheZu(`#/level/${naechstes.id}`) : null,
  });
}

/* ---------------- Bildschirm: Einstellungen ---------------- */

function auswahl(titel, name, moeglichkeiten) {
  const aktuell = fortschritt.einstellung(name);
  return el("fieldset", { class: "auswahl" },
    el("legend", {}, titel),
    ...moeglichkeiten.map(([wert, text]) => el("button", {
      type: "button",
      class: "knopf" + (wert === aktuell ? " gewaehlt" : ""),
      "aria-pressed": String(wert === aktuell),
      klick: () => {
        fortschritt.setzeEinstellung(name, wert);
        wendeEinstellungenAn();
        zeigeEinstellungen();
      },
    }, text)),
  );
}

function zeigeEinstellungen() {
  const codeFeld = el("output", { class: "pixel code-anzeige" }, fortschritt.erzeugeCode());
  const eingabe = el("input", {
    type: "text", class: "code-eingabe", id: "code-eingabe",
    autocomplete: "off", spellcheck: "false", placeholder: "z. B. AFGH-K2MN",
  });
  const meldung = el("p", { class: "meldung", role: "status" });

  function ladeCode() {
    const ergebnis = fortschritt.leseCode(eingabe.value);
    meldung.textContent = ergebnis.ok ? "Geklappt! Deine Sterne sind wieder da." : ergebnis.meldung;
    meldung.className = "meldung " + (ergebnis.ok ? "gut" : "achtung");
    if (ergebnis.ok) codeFeld.textContent = fortschritt.erzeugeCode();
  }

  // Löschen in zwei Schritten, damit es nicht aus Versehen passiert
  const loeschFeld = el("div", { class: "knopfreihe" });
  function zeigeLoeschKnopf() {
    loeschFeld.replaceChildren(el("button", { type: "button", class: "knopf", klick: () => {
      loeschFeld.replaceChildren(
        el("span", {}, "Wirklich alle Sterne löschen?"),
        el("button", { type: "button", class: "knopf warn", klick: () => {
          fortschritt.loescheAlles();
          zeigeEinstellungen();
        } }, "Ja, löschen"),
        el("button", { type: "button", class: "knopf", klick: zeigeLoeschKnopf }, "Nein"),
      );
    } }, "Spielstand löschen"));
  }
  zeigeLoeschKnopf();

  bildschirm("einstellungen",
    el("header", { class: "kopf" },
      knopf("Zurück", "#/", { class: "knopf klein" }),
      el("h1", { class: "pixel" }, "Einstellungen"),
    ),
    el("div", { class: "einstellungs-spalten" },
      el("section", {},
        auswahl("Schriftgröße", "schrift", [["normal", "Normal"], ["gross", "Groß"], ["sehrgross", "Sehr groß"]]),
        auswahl("Ton", "ton", [[false, "Aus"], [true, "An"]]),
        el("p", { class: "klein-text" }, "Töne gibt es im Spiel noch nicht."),
      ),
      el("section", {},
        el("h2", {}, "Dein Spielstand-Code"),
        el("p", {}, "Schreib dir diesen Code auf. Damit holst du deine Sterne zurück, auch an einem anderen Computer."),
        codeFeld,
        el("label", { for: "code-eingabe" }, "Code eingeben:"),
        el("div", { class: "knopfreihe" }, eingabe,
          el("button", { type: "button", class: "knopf", klick: ladeCode }, "Code laden")),
        meldung,
        loeschFeld,
      ),
    ),
  );
  eingabe.addEventListener("keydown", (e) => { if (e.key === "Enter") ladeCode(); });
}

/* ---------------- Wechsel zwischen den Bildschirmen ---------------- */

function zeigeAktuellenBildschirm() {
  if (laufendesLevel) {
    laufendesLevel.beenden();
    laufendesLevel = null;
  }
  const [bereich, zusatz] = location.hash.replace(/^#\/?/, "").split("/");
  if (bereich === "karte") zeigeKarte();
  else if (bereich === "welt") zeigeWelt(zusatz);
  else if (bereich === "level") zeigeLevel(decodeURIComponent(zusatz || ""));
  else if (bereich === "einstellungen") zeigeEinstellungen();
  else zeigeStart();
}

fortschritt.lade();
wendeEinstellungenAn();
window.addEventListener("hashchange", zeigeAktuellenBildschirm);
zeigeAktuellenBildschirm();
