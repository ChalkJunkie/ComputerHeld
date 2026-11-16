/* Sammelt die Level-Daten aller Welten an einer Stelle.
   Kommt eine neue Welt dazu: Datei importieren und unten eintragen. */
import { LEVEL_WELT1 } from "./welt1.js";
import { LEVEL_WELT2 } from "./welt2.js";
import { LEVEL_WELT3 } from "./welt3.js";
import { LEVEL_WELT4 } from "./welt4.js";

export const LEVEL = {
  ...LEVEL_WELT1,
  ...LEVEL_WELT2,
  ...LEVEL_WELT3,
  ...LEVEL_WELT4,
};
