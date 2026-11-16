/* =====================================================================
   TEXTE, die Bit in allen Leveln sagt (Lob, Trost, Übergänge)
   Aus jeder Liste wird zufällig ein Satz gewählt. Einfach Sätze
   ergänzen, ändern oder löschen.
   ===================================================================== */
export const TEXTE = {
  lob: ["Super!", "Genau so!", "Treffer!", "Klasse!", "Das klappt ja prima!"],
  trost: [
    "Fast! Versuch es noch einmal.",
    "Nicht schlimm. Gleich klappt es.",
    "Das üben wir zusammen. Noch einmal!",
  ],
  nachDemUeben: "Gut gemacht! Jetzt schaffst du es auch ohne Hilfe.",
  keineHilfeMehr: "Mehr Tipps habe ich nicht. Du schaffst das!",
  geschafft: "Geschafft! Du hast das Level gemeistert.",
  mehrSterne: "Mit weniger Fehlern und etwas mehr Tempo gibt es noch mehr Sterne.",
  alleSterne: "Drei Sterne! Besser geht es nicht.",
};

/* Nach so vielen Fehlern hintereinander zeigt Bit von selbst den nächsten Tipp. */
export const FEHLER_BIS_HILFE = 3;
