/* =====================================================================
   SPIEL-DATEN: Titel, Welten und die Liste aller Level
   =====================================================================
   Hier stehen nur Namen und Reihenfolge. Was in einem Level passiert,
   steht in src/levels/ (z. B. welt1.js). Ein Level ohne Eintrag dort
   erscheint im Spiel als „kommt bald“.

   Der Spielstand merkt sich die Sterne nach Level-ID (z. B. "1.2").
   Darum die IDs nicht mehr ändern, sobald Kinder spielen.

   edelstein: Farbe des Edelsteins, den man nach dem Boss der Welt bekommt
              (rot, blau, gruen, gelb, lila, diamant)
   karte:     Lage auf der Weltkarte in Prozent (x von links, y von oben)

   art: "normal" = Pflicht-Level, "boss" = Abschluss der Welt,
        "bonus"  = Zusatz-Level (zählt nicht für den Abschluss der Welt)
   ===================================================================== */

export const SPIEL = {
  titel: "ComputerHeld",            // Arbeitstitel – hier änderbar
  untertitel: "Mit Bit durch die Computer-Welt",
};

export const WELTEN = [
  {
    id: 1,
    edelstein: "gruen",
    karte: { x: 13, y: 64 },
    name: "Mausland",
    thema: "Hier lernst du die Maus kennen.",
    farben: { hell: "#d9efb8", mittel: "#8fcf5a", dunkel: "#3f7d2a" },
    bonusAbSternen: 14, // vorläufig: so viele Sterne der Welt schalten die Bonus-Level frei
    level: [
      { id: "1.1", titel: "Zeigen",         art: "normal" },
      { id: "1.2", titel: "Linksklick",     art: "normal" },
      { id: "1.3", titel: "Rechtsklick",    art: "normal" },
      { id: "1.4", titel: "Doppelklick",    art: "normal" },
      { id: "1.5", titel: "Mausrad",        art: "normal" },
      { id: "1.6", titel: "Markieren",      art: "normal" },
      { id: "1.7", titel: "Ziehen und Ablegen", art: "normal" },
      { id: "1.B", titel: "Boss: Schatz verstecken", art: "boss" },
    ],
  },
  {
    id: 2,
    edelstein: "blau",
    karte: { x: 36, y: 40 },
    name: "Tastaturtal",
    thema: "Hier lernst du die besonderen Tasten.",
    farben: { hell: "#d3e6f7", mittel: "#7fb6e6", dunkel: "#2c5f94" },
    bonusAbSternen: 16,
    level: [
      { id: "2.1", titel: "Enter, Leertaste, Tab, Esc", art: "normal" },
      { id: "2.2", titel: "Rücktaste und Entf",         art: "normal" },
      { id: "2.3", titel: "Umschalt und Feststelltaste", art: "normal" },
      { id: "2.4", titel: "Umlaute und ß",              art: "normal" },
      { id: "2.5", titel: "AltGr: @ und €",             art: "normal" },
      { id: "2.6", titel: "Strg+Z und Strg+A",          art: "normal" },
      { id: "2.7", titel: "Kopieren und Einfügen",      art: "normal" },
      { id: "2.8", titel: "Strg+S",                     art: "normal" },
      { id: "2.B", titel: "Boss: Texträtsel",           art: "boss" },
    ],
  },
  {
    id: 3,
    edelstein: "lila",
    karte: { x: 58, y: 32 },
    name: "Fensterburg",
    thema: "Hier lernst du Fenster und die Taskleiste.",
    farben: { hell: "#e3ddf0", mittel: "#b3a3d9", dunkel: "#5a4690" },
    bonusAbSternen: 8,
    level: [
      { id: "3.1", titel: "Minimieren, vergrößern, schließen", art: "normal" },
      { id: "3.2", titel: "Taskleiste",  art: "normal" },
      { id: "3.3", titel: "Startmenü",   art: "normal" },
      { id: "3.B", titel: "Boss: Programme im Griff", art: "boss" },
    ],
  },
  {
    id: 4,
    edelstein: "gelb",
    karte: { x: 36, y: 79 },
    name: "Ordnerwald",
    thema: "Hier lernst du Dateien und Ordner.",
    farben: { hell: "#e6dcc3", mittel: "#c9a35e", dunkel: "#6e4a1c" },
    bonusAbSternen: 12,
    level: [
      { id: "4.1", titel: "Navigieren",       art: "normal" },
      { id: "4.2", titel: "Ordner erstellen", art: "normal" },
      { id: "4.3", titel: "Umbenennen",       art: "normal" },
      { id: "4.4", titel: "Dateiendungen",    art: "normal" },
      { id: "4.5", titel: "Löschen und Papierkorb", art: "normal" },
      { id: "4.B", titel: "Boss: Chaos aufräumen",  art: "boss" },
    ],
  },
  {
    id: 5,
    edelstein: "rot",
    karte: { x: 58, y: 77 },
    name: "Programmpalast",
    thema: "Hier lernst du Programme zu bedienen.",
    farben: { hell: "#fbe9b0", mittel: "#f0c040", dunkel: "#8a5a00" },
    bonusAbSternen: 14,
    level: [
      { id: "5.1", titel: "Speichern",               art: "normal" },
      { id: "5.2", titel: "Schriftart und -größe",   art: "normal" },
      { id: "5.3", titel: "Schriftfarbe",            art: "normal" },
      { id: "5.4", titel: "Fett, kursiv, unterstrichen", art: "normal" },
      { id: "5.5", titel: "Bild einfügen",           art: "normal" },
      { id: "5.6", titel: "Speichern unter",         art: "normal" },
      { id: "5.B", titel: "Boss: Einladung gestalten", art: "boss" },
    ],
  },
  {
    id: 6,
    edelstein: "diamant",
    karte: { x: 84, y: 52 },
    name: "Profi-Gipfel",
    thema: "Für alle, die schon viel können.",
    farben: { hell: "#e4f3f5", mittel: "#a5dbe3", dunkel: "#2b6f7a" },
    bonusAbSternen: 99,
    level: [
      { id: "6.1", titel: "Geheime Tastenkürzel",      art: "normal" },
      { id: "6.2", titel: "Markieren mit der Tastatur", art: "normal" },
      { id: "6.3", titel: "Lautstärke und Helligkeit",  art: "normal" },
      { id: "6.4", titel: "Ausschalten und Abmelden",   art: "normal" },
      { id: "6.5", titel: "Drucken und PDF",            art: "normal" },
      { id: "6.6", titel: "Sicher am Computer",         art: "normal" },
      { id: "6.B", titel: "Abschlussmission",           art: "boss" },
    ],
  },
];
