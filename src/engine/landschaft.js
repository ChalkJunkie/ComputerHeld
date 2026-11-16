/* =====================================================================
   LANDSCHAFT IM HINTERGRUND
   Himmel, Wolken, flache Hügel, Bäume und ein Boden aus Grasblöcken –
   für Startseite, Weltkarte und Level. Alles liegt hinter dem Spiel und
   fängt keine Mausklicks ab.

   baueLandschaft({ welt, boden, wolken, huegel, baeume })
     welt    – Welt aus src/daten/welten.js: die Hügel bekommen ihre Farben
               (ohne welt: grün)
     boden   – Vergrößerung der Grasblöcke (Standard 4), 0 = kein Boden
     wolken  – [{ x, y, faktor }]   x und y in Prozent
     huegel  – [{ x, faktor, klein }] x in Prozent, stehen auf dem Boden
     baeume  – [{ x, faktor }]       x in Prozent, stehen auf dem Boden
   ===================================================================== */

import { erzeugeSprite } from "./sprite-render.js";
import { WOLKE, BAUM, GRAS, HUEGEL_GROSS, HUEGEL_KLEIN } from "../../sprites/landschaft.js";

function huegelPalette(welt) {
  if (!welt) return HUEGEL_GROSS.palette;
  return {
    M: { name: "Hügel", farbe: welt.farben.mittel },
    H: { name: "Kante", farbe: welt.farben.hell },
    D: { name: "Büschel", farbe: welt.farben.dunkel },
  };
}

export function baueLandschaft({ welt = null, boden = 4, wolken = [], huegel = [], baeume = [] } = {}) {
  const wurzel = document.createElement("div");
  wurzel.className = "landschaft";
  wurzel.setAttribute("aria-hidden", "true");
  const bodenHoehe = boden ? 16 * boden : 0;

  for (const w of wolken) {
    const c = erzeugeSprite(WOLKE, { faktor: w.faktor || 5 });
    c.style.left = w.x + "%";
    c.style.top = w.y + "%";
    wurzel.append(c);
  }
  const palette = huegelPalette(welt);
  for (const h of huegel) {
    const c = erzeugeSprite(h.klein ? HUEGEL_KLEIN : HUEGEL_GROSS, { faktor: h.faktor || 6, palette });
    c.style.left = h.x + "%";
    c.style.bottom = bodenHoehe - 2 + "px";
    wurzel.append(c);
  }
  for (const b of baeume) {
    const c = erzeugeSprite(BAUM, { faktor: b.faktor || 4 });
    c.style.left = b.x + "%";
    c.style.bottom = bodenHoehe - 4 + "px";
    wurzel.append(c);
  }
  if (boden) {
    const streifen = document.createElement("div");
    streifen.className = "landschaft-boden";
    streifen.style.height = bodenHoehe + "px";
    streifen.style.backgroundImage = `url(${erzeugeSprite(GRAS, { faktor: boden }).toDataURL()})`;
    streifen.style.backgroundSize = `${bodenHoehe}px ${bodenHoehe}px`;
    wurzel.append(streifen);
  }
  return wurzel;
}
