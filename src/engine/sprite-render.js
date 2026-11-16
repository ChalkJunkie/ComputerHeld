/* =====================================================================
   Render-Funktionen für Pixel-Sprites
   Funktioniert mit jedem Sprite, das wie sprites/bit.js aufgebaut ist.
   ===================================================================== */

/**
 * Setzt eine Pose zusammen: nimmt das Grundraster ("basis") und legt
 * die Teile der Pose darüber. Ergebnis: Liste von Textzeilen (ein
 * Zeichen pro Pixel).
 */
export function setzePoseZusammen(sprite, posenName) {
  // Einfache Sprites ohne Posen bestehen nur aus der Basis
  if (!sprite.posen) return sprite.basis.slice();
  const pose = sprite.posen[posenName];
  if (!pose) throw new Error("Unbekannte Pose: " + posenName);

  // Basis in ein veränderbares Raster aus einzelnen Zeichen umwandeln
  const raster = sprite.basis.map((zeile) => zeile.split(""));

  for (const teilName of pose.teile) {
    const teil = sprite.teile[teilName];
    if (!teil) throw new Error("Unbekanntes Teil: " + teilName);
    teil.pixel.forEach((zeile, dy) => {
      zeile.split("").forEach((zeichen, dx) => {
        if (zeichen === ".") return; // Punkt = Basis bleibt sichtbar
        const x = teil.x + dx, y = teil.y + dy;
        if (raster[y] && x >= 0 && x < raster[y].length) raster[y][x] = zeichen;
      });
    });
  }
  return raster.map((zeile) => zeile.join(""));
}

/**
 * Prüft ein Sprite auf Tippfehler (falsche Zeilenlänge, unbekannte
 * Buchstaben). Gibt eine Liste von Fehlermeldungen zurück (leer = alles gut).
 */
export function pruefeSprite(sprite) {
  const fehler = [];
  const erlaubt = (z) => z === "." || z in sprite.palette;
  if (sprite.basis.length !== sprite.hoehe)
    fehler.push(`Basis hat ${sprite.basis.length} Zeilen statt ${sprite.hoehe}.`);
  sprite.basis.forEach((zeile, y) => {
    if (zeile.length !== sprite.breite)
      fehler.push(`Basis, Zeile ${y}: ${zeile.length} Zeichen statt ${sprite.breite}.`);
    for (const z of zeile)
      if (!erlaubt(z)) fehler.push(`Basis, Zeile ${y}: unbekanntes Zeichen "${z}".`);
  });
  for (const [name, teil] of Object.entries(sprite.teile || {})) {
    teil.pixel.forEach((zeile, dy) => {
      if (zeile.length !== teil.pixel[0].length)
        fehler.push(`Teil ${name}, Zeile ${dy}: ungleiche Zeilenlänge.`);
      for (const z of zeile)
        if (!erlaubt(z)) fehler.push(`Teil ${name}, Zeile ${dy}: unbekanntes Zeichen "${z}".`);
    });
  }
  return fehler;
}

/**
 * Zeichnet ein Textraster auf ein Canvas.
 *   canvas  – das <canvas>-Element
 *   raster  – Liste von Textzeilen (z. B. von setzePoseZusammen)
 *   palette – Zuordnung Zeichen -> { farbe }
 *   faktor  – ganzzahlige Vergrößerung (1 Pixel wird faktor x faktor groß)
 * Der Hintergrund bleibt durchsichtig. Es werden nur volle Quadrate
 * gezeichnet, dadurch gibt es keine weichen Kanten (kein Anti-Aliasing).
 */
export function zeichneSprite(canvas, raster, palette, faktor) {
  faktor = Math.max(1, Math.round(faktor));
  canvas.width = raster[0].length * faktor;
  canvas.height = raster.length * faktor;
  canvas.style.imageRendering = "pixelated";

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  raster.forEach((zeile, y) => {
    for (let x = 0; x < zeile.length; x++) {
      const eintrag = palette[zeile[x]];
      if (!eintrag) continue; // "." oder unbekannt = durchsichtig
      ctx.fillStyle = eintrag.farbe;
      ctx.fillRect(x * faktor, y * faktor, faktor, faktor);
    }
  });
}

/**
 * Bequeme Abkürzung: erzeugt ein fertiges <canvas> mit einem Sprite.
 *   sprite  – z. B. BIT oder STERN
 *   optionen.pose    – Name der Pose (nur bei Sprites mit Posen)
 *   optionen.faktor  – Vergrößerung (Standard 4)
 *   optionen.palette – andere Palette als die des Sprites (z. B. grauer Stern)
 */
export function erzeugeSprite(sprite, optionen = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "sprite";
  const raster = setzePoseZusammen(sprite, optionen.pose);
  zeichneSprite(canvas, raster, optionen.palette || sprite.palette, optionen.faktor || 4);
  return canvas;
}
