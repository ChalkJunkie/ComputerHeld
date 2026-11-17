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
import { baueLandschaft } from "./engine/landschaft.js";
import { BIT } from "../sprites/bit.js";
import { STERN, EDELSTEIN, SCHLOSS, ZIPFEL } from "../sprites/symbole.js";
import { WELT_SYMBOLE } from "../sprites/welten.js";
import { BAUM as BAUM_KARTE } from "../sprites/landschaft.js";

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

/* ---------------- Spielstand als Datei ---------------- */

/* Lädt die Spielstand-Datei herunter (landet meist im Ordner „Downloads“) */
function speichereSpielstand() {
  const { dateiname, text } = fortschritt.alsDatei();
  const adresse = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = el("a", { href: adresse, download: dateiname });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(adresse), 1000);
  return dateiname;
}

/* Öffnet die Dateiauswahl; beiFertig(ergebnis) bekommt { ok, meldung } */
function ladeSpielstand(beiFertig) {
  const auswahl = el("input", { type: "file", accept: ".json,application/json", hidden: true });
  auswahl.addEventListener("change", () => {
    const datei = auswahl.files && auswahl.files[0];
    auswahl.remove();
    if (!datei) return;
    datei.text().then((text) => {
      const ergebnis = fortschritt.ausDatei(text);
      if (ergebnis.ok) wendeEinstellungenAn();
      beiFertig(ergebnis);
    });
  });
  document.body.append(auswahl);
  auswahl.click();
}

/* Sprechblase mit Zipfel, der nach links (zu Bit) zeigt */
function blase(...inhalt) {
  const zipfel = erzeugeSprite(ZIPFEL, { faktor: 4 });
  zipfel.classList.add("zipfel");
  return el("div", { class: "sprechblase mit-zipfel" }, zipfel, ...inhalt);
}

/* ---------------- Bildschirm: Start ---------------- */

function zeigeStart(hinweis) {
  // Hinweis für Geräte ohne Maus (z. B. Tablets)
  const nurTouch = matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches;
  const weiter = fortschritt.hatFortschritt();
  const text = el("div", { class: "blasentext" });
  const knoepfe = el("div", { class: "knopfreihe start-knoepfe" });

  function normal(meldung) {
    text.replaceChildren(
      el("p", {}, "Hallo! Ich bin Bit, die Informatik-Maus."),
      el("p", {}, weiter
        ? "Schön, dass du wieder da bist! Spielst du weiter – oder ist das hier nicht dein Spielstand?"
        : "Komm mit in die Computer-Welt. Ich zeige dir Maus und Tastatur!"),
      meldung ? el("p", { class: "hinweis" }, meldung) : "",
      nurTouch ? el("p", { class: "hinweis" }, "Dieses Spiel braucht eine Maus und eine Tastatur.") : "",
    );
    knoepfe.replaceChildren(
      weiter ? knopf("Weiterspielen", "#/karte", { class: "knopf gross" }) : "",
      fortschritt.lehrer
        ? knopf("Spielen", "#/karte", { class: "knopf gross" })
        : el("button", { type: "button", class: weiter ? "knopf" : "knopf gross", klick: neuesAbenteuer }, "Neues Abenteuer"),
      fortschritt.lehrer ? "" : el("button", { type: "button", class: "knopf", klick: laden }, "Spielstand laden"),
      knopf("Einstellungen", "#/einstellungen"),
    );
  }
  function neuesAbenteuer() {
    if (!weiter) {
      geheZu("#/karte");
      return;
    }
    // Es gibt schon Sterne: lieber nachfragen
    text.replaceChildren(
      el("p", {}, "Ein neues Abenteuer? Dann sind alle Sterne auf diesem Computer weg."),
      el("p", {}, "Tipp: Speichere den alten Spielstand vorher als Datei."),
    );
    knoepfe.replaceChildren(
      el("button", { type: "button", class: "knopf warn", klick: () => { fortschritt.loescheAlles(); geheZu("#/karte"); } }, "Ja, neu anfangen"),
      el("button", { type: "button", class: "knopf", klick: () => { speichereSpielstand(); normal("Gespeichert! Die Datei ist jetzt im Ordner „Downloads“."); } }, "Erst speichern"),
      el("button", { type: "button", class: "knopf", klick: () => normal() }, "Zurück"),
    );
  }
  function laden() {
    ladeSpielstand((ergebnis) => {
      if (ergebnis.ok) geheZu("#/karte");
      else normal(ergebnis.meldung);
    });
  }
  normal(hinweis);

  const seite = bildschirm("start",
    baueLandschaft({
      boden: 6,
      wolken: [{ x: 7, y: 9, faktor: 7 }, { x: 72, y: 6, faktor: 8 }, { x: 45, y: 20, faktor: 5 }],
      huegel: [{ x: -6, faktor: 7 }, { x: 52, faktor: 8 }, { x: 80, faktor: 7, klein: true }],
      baeume: [{ x: 4, faktor: 6 }, { x: 77, faktor: 7 }, { x: 88, faktor: 6 }],
    }),
    el("div", { class: "start-inhalt" },
      el("h1", { class: "pixel titel" }, SPIEL.titel),
      el("p", { class: "untertitel" }, SPIEL.untertitel),
      el("div", { class: "start-mitte" },
        erzeugeSprite(BIT, { pose: "winkend", faktor: 10 }),
        el("div", { class: "start-rechts" }, blase(text), knoepfe),
      ),
    ),
  );
  return seite;
}

/* ---------------- Bildschirm: Weltkarte ---------------- */

/* Ein Edelstein, leer (blass) oder in Farbe */
function edelstein(farbe, faktor = 3) {
  return erzeugeSprite(EDELSTEIN, { faktor, palette: EDELSTEIN.paletten[farbe || "leer"] });
}

function weltOrt(welt) {
  const frei = fortschritt.weltFrei(welt);
  const fertig = fortschritt.weltAbgeschlossen(welt);
  const ort = el("button", {
    type: "button",
    class: "welt-ort" + (frei ? "" : " gesperrt"),
    disabled: !frei,
    style: `left:${welt.karte.x}%;top:${welt.karte.y}%`,
    "aria-label": `Welt ${welt.id}: ${welt.name}`,
    klick: () => geheZu(`#/welt/${welt.id}`),
  });
  const symbol = erzeugeSprite(WELT_SYMBOLE[welt.id], { faktor: 5 });
  symbol.classList.add("welt-symbol");
  const block = el("span", { class: "welt-block" });
  if (!frei) block.append(erzeugeSprite(SCHLOSS, { faktor: 3 }));
  if (fertig) block.append(edelstein(welt.edelstein, 3));
  const unten = frei
    ? el("span", { class: "sternzaehler" }, erzeugeSprite(STERN, { faktor: 2 }), ` ${fortschritt.sterneDerWelt(welt)} / ${welt.level.length * 3}`)
    : el("span", { class: "sperrtext" }, welt.id === 6 ? "Erst Welt 1 bis 5" : "Erst das Mausland");
  ort.append(symbol, block, el("span", { class: "pixel welt-schild" }, `${welt.id} ${welt.name}`), unten);
  setzeWeltFarben(ort, welt);
  return ort;
}

function zeigeKarte() {
  // Trittsteine zwischen den Welten (in Prozent, damit es bei jeder Fenstergröße passt)
  const WEGE = [[1, 2], [1, 4], [2, 3], [4, 5], [3, 6], [5, 6]];
  const feld = el("div", { class: "kartenfeld" });
  feld.append(baueLandschaft({
    boden: 0,
    wolken: [{ x: 6, y: 2, faktor: 4 }, { x: 40, y: 1, faktor: 5 }, { x: 75, y: 3, faktor: 4 }],
    huegel: [{ x: 72, faktor: 7, klein: false }],
    baeume: [],
  }));
  for (const [x, y] of [[3, 86], [21, 52], [24, 92], [47, 50], [71, 90], [74, 30], [94, 82]]) {
    const b = el("span", { class: "karten-baum", style: `left:${x}%;top:${y}%` });
    b.append(erzeugeSprite(BAUM_KARTE, { faktor: 4 }));
    feld.append(b);
  }
  const ort = (id) => WELTEN.find((w) => w.id === id).karte;
  for (const [a, b] of WEGE) {
    const von = ort(a), nach = ort(b);
    const schritte = Math.round(Math.hypot(nach.x - von.x, (nach.y - von.y) * 0.5) / 2.2);
    for (let i = 1; i < schritte; i++) {
      feld.append(el("span", { class: "trittstein", style: `left:${von.x + (nach.x - von.x) * i / schritte}%;top:${von.y + (nach.y - von.y) * i / schritte}%` }));
    }
  }
  WELTEN.forEach((w) => feld.append(weltOrt(w)));
  // Bit steht bei der Welt, in der es als Nächstes weitergeht
  const hier = WELTEN.find((w) => fortschritt.weltFrei(w) && !fortschritt.weltAbgeschlossen(w)) || WELTEN[WELTEN.length - 1];
  const bit = erzeugeSprite(BIT, { pose: "winkend", faktor: 3 });
  bit.classList.add("karten-bit");
  bit.style.left = `max(8px, calc(${hier.karte.x}% - 205px))`; // nie über den linken Rand hinaus
  bit.style.top = `calc(${hier.karte.y}% - 40px)`;
  feld.append(bit);

  // Edelsteine: einer für jede geschaffte Welt
  const steine = el("div", { class: "inventar", "aria-label": "Gesammelte Edelsteine" }, el("span", {}, "Edelsteine:"));
  for (const w of WELTEN) steine.append(el("span", { class: "inventar-fach" }, edelstein(fortschritt.weltAbgeschlossen(w) ? w.edelstein : null, 3)));

  const meldung = el("span", { class: "karten-meldung", role: "status" });
  const seite = bildschirm("karte",
    el("header", { class: "kopf" },
      knopf("Zurück", "#/", { class: "knopf klein" }),
      el("h1", { class: "pixel" }, "Weltkarte"),
      steine,
      sternZaehler(fortschritt.sterneGesamt(), WELTEN.reduce((n, w) => n + w.level.length * 3, 0)),
      fortschritt.lehrer ? "" : el("button", { type: "button", class: "knopf klein speichern-knopf", klick: () => {
        const name = speichereSpielstand();
        meldung.textContent = `Gespeichert: ${name} (im Ordner „Downloads“)`;
      } }, "Spielstand speichern"),
    ),
    feld,
    meldung,
  );
  return seite;
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
      erzeugeSprite(WELT_SYMBOLE[welt.id], { faktor: 3 }),
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
    welt,
    // Nach dem Boss gibt es den Edelstein der Welt
    edelstein: fund.eintrag.art === "boss" ? welt.edelstein : null,
    // In der Lehrerversion immer die volle Abfolge (Zeigen, Üben, Anwenden)
    schonGeschafft: !fortschritt.lehrer && fortschritt.sterneVon(levelId) > 0,
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
  const meldung = el("p", { class: "meldung", role: "status" });
  bildschirm("einstellungen",
    el("header", { class: "kopf" },
      knopf("Zurück", "#/", { class: "knopf klein" }),
      el("h1", { class: "pixel" }, "Einstellungen"),
    ),
    el("div", { class: "einstellungs-spalten" },
      el("section", {},
        auswahl("Schriftgröße", "schrift", [["normal", "Normal"], ["gross", "Groß"], ["sehrgross", "Sehr groß"]]),
      ),
      fortschritt.lehrer ? el("section", {},
        el("h2", {}, "Lehrerversion"),
        el("p", {}, "Alle Welten und Level sind freigeschaltet. Es wird nichts gespeichert: Wer die Seite neu lädt, beginnt von vorn."),
        el("p", {}, "Die Version für die Kinder erreichst du über ihren eigenen Link."),
      ) : el("section", {},
        el("h2", {}, "Dein Spielstand"),
        el("p", {}, "Speichere deinen Spielstand als Datei. Damit holst du deine Sterne zurück – auch an einem anderen Computer."),
        el("div", { class: "knopfreihe" },
          el("button", { type: "button", class: "knopf", klick: () => {
            const name = speichereSpielstand();
            meldung.textContent = `Gespeichert: ${name} (im Ordner „Downloads“)`;
            meldung.className = "meldung gut";
          } }, "Spielstand speichern"),
          el("button", { type: "button", class: "knopf", klick: () => ladeSpielstand((ergebnis) => {
            meldung.textContent = ergebnis.ok ? "Geklappt! Deine Sterne sind wieder da." : ergebnis.meldung;
            meldung.className = "meldung " + (ergebnis.ok ? "gut" : "achtung");
          }) }, "Spielstand laden"),
        ),
        meldung,
      ),
    ),
  );
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

/* Lehrerversion: dauerhafter Hinweisstreifen unten */
if (fortschritt.lehrer) {
  document.documentElement.classList.add("lehrer");
  document.title = "ComputerHeld – Lehrerversion";
  document.body.append(el("div", { class: "lehrer-band", role: "note" },
    "Lehrerversion: alles freigeschaltet, es wird nichts gespeichert. Seite neu laden = von vorn."));
}

fortschritt.lade();
wendeEinstellungenAn();
window.addEventListener("hashchange", zeigeAktuellenBildschirm);
zeigeAktuellenBildschirm();
