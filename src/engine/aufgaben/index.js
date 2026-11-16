/* Liste aller Aufgabentypen. Der Name links ist der, der in den
   Level-Daten bei "typ" steht. Neue Typen hier eintragen. */
import { zielscheiben } from "./zielscheiben.js";
import { kontextmenue } from "./kontextmenue.js";
import { scrollen } from "./scrollen.js";
import { markieren } from "./markieren.js";
import { ziehen } from "./ziehen.js";
import { abfolge } from "./abfolge.js";

export const AUFGABENTYPEN = {
  zielscheiben,   // zeigen, klicken, doppelklicken
  kontextmenue,   // Rechtsklick und Eintrag wählen
  scrollen,       // Mausrad
  markieren,      // Rahmen aufziehen
  ziehen,         // Ziehen und Ablegen
  abfolge,        // mehrere Aufgaben hintereinander (Boss)
};
