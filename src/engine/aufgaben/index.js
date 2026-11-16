/* Liste aller Aufgabentypen. Der Name links ist der, der in den
   Level-Daten bei "typ" steht. Neue Typen hier eintragen. */
import { zielscheiben } from "./zielscheiben.js";
import { kontextmenue } from "./kontextmenue.js";
import { scrollen } from "./scrollen.js";
import { markieren } from "./markieren.js";
import { ziehen } from "./ziehen.js";
import { einsortieren } from "./einsortieren.js";
import { editor } from "./editor.js";
import { desktop } from "./desktop.js";
import { explorer } from "./explorer.js";
import { schreiben } from "./schreiben.js";
import { quiz } from "./quiz.js";
import { abfolge } from "./abfolge.js";

export const AUFGABENTYPEN = {
  zielscheiben,   // zeigen, klicken, doppelklicken
  kontextmenue,   // Rechtsklick und Eintrag wählen
  scrollen,       // Mausrad
  markieren,      // Rahmen aufziehen
  ziehen,         // Ziehen und Ablegen
  einsortieren,   // Edelsteine auf farbige Fächer ziehen (Boss)
  editor,         // Textfenster für Tasten und Tastenkürzel (Welt 2)
  desktop,        // Fenster, Taskleiste und Startmenü (Welt 3)
  explorer,       // Dateien und Ordner im Explorer (Welt 4)
  schreiben,      // Textprogramm: Schrift, Farbe, Bild, Speichern (Welt 5)
  quiz,           // Merkwissen und Sicherheit: Antwort anklicken (Welt 6)
  abfolge,        // mehrere Aufgaben hintereinander (Boss)
};
