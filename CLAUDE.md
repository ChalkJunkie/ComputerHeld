# CLAUDE.md – Desktop-Lernspiel für Maus und Tastatur

## Projektziel

Webbasiertes, gamifiziertes Lernspiel (GitHub Pages), in dem Kinder (ca. 10 Jahre, Klasse 5), die nur Smartphones und Tablets kennen, den Umgang mit einem Desktop-Computer mit Maus und Tastatur lernen. Das Spiel wird im Informatikunterricht am Schulrechner eingesetzt. Zielgeräte: nur Desktop mit Maus und Tastatur, deutsches Tastaturlayout (QWERTZ). Kein Tablet- oder Touchpad-Support.

Das Zehnfingersystem ist **nicht** Teil dieses Projekts (dafür gibt es einen separaten Tipptrainer).

## Grundregeln für die Arbeit

- Sprache der Oberfläche, der Texte und der Code-Kommentare: **Deutsch**. Anrede der Kinder: „du“, kurze Sätze, freundlich, nie beschämend bei Fehlern.
- Ich (die Lehrkraft) bin kein Webentwickler. Halte den Code einfach, gut kommentiert und leicht änderbar. Inhalte (Texte, Aufgaben, Farben, Sprites) gehören in Datendateien, nicht tief in die Logik.
- Arbeite **Welt für Welt**. Baue nichts auf Vorrat. Vor größeren Entscheidungen kurz nachfragen.
- Teste nach jeder Änderung selbst (wenn möglich im Browser, mit Screenshot) und melde knapp, was funktioniert und was nicht.
- Barrierearm und klassenzimmertauglich: große Schrift, hoher Kontrast, Ton immer abschaltbar (Standard: aus), keine blinkenden Effekte.

## Technische Eckpunkte

*(Vorschlag, bitte bei Abweichungswunsch nachfragen)*

- Reines HTML, CSS und JavaScript (ES-Module), **kein Build-Schritt, kein Framework**, lauffähig direkt auf GitHub Pages. Keine externen Abhängigkeiten zur Laufzeit (Schriften und Grafiken liegen im Repository, damit es auch hinter Schulfiltern funktioniert).
- Fortschritt (Sterne, freigeschaltete Level, Einstellungen) in `localStorage`, dazu ein **Export/Import-Code** als Backup, falls Schulrechner zurückgesetzt werden. Keine Konten, keine personenbezogenen Daten, keine Server, kein Tracking.
- Kein Mobil-/Touch-Support nötig. Bei Touch-Geräten höchstens ein freundlicher Hinweis „Dieses Spiel braucht Maus und Tastatur“.
- Dateistruktur (Vorschlag):
  - `index.html` – Start und Weltkarte
  - `src/engine/` – Level-Schablone, Eingabeerkennung, Fortschritt, Sterne
  - `src/desktop/` – simulierter Mini-Desktop (Fenstersystem, Dateisystem im Speicher, Mini-Textprogramm), ab Welt 3
  - `src/levels/` – ein Datensatz pro Level (Aufgabe, Prüfbedingung, Hilfetexte)
  - `sprites/` – Pixelgrafiken als Textraster plus Paletten
  - `assets/` – Schriften und sonstige Dateien

### Browser-Eigenheiten (früh testen!)

- Strg+S, Strg+F, Strg+P u. ä. lassen sich meist per `preventDefault` abfangen. **Alt+F4, Strg+W, Strg+N, Alt+Tab und die Windows-Taste lassen sich nicht abfangen.** Diese erscheinen nur als Merkwissen mit Erklärkarte, nicht als echte Eingabeaufgabe.
- **AltGr** meldet Windows im Browser als Strg+Alt (`event.getModifierState('AltGraph')` bzw. `event.key` prüfen). Eingaben von @ und € früh auf den echten Schulrechnern testen.
- Für Tastenaufgaben `event.key` und `event.code` bewusst unterscheiden; Tastaturlayout ist Deutsch.
- Rechtsklick: das Browser-Kontextmenü im Spielbereich unterdrücken und durch das simulierte Kontextmenü ersetzen.
- Textfelder und Ankreuzfelder nur dort einsetzen, wo es didaktisch passt; viele Aufgaben sollen auf einer eigenen Spielfläche (Canvas oder DOM-Elemente) stattfinden.

## Optik und Figur

- **Stil:** flache 2D-Pixelgrafik mit Blockwelten. Orientierung am *Stil* von Blockspielen, aber **nichts aus Minecraft selbst** verwenden oder nachbauen: keine Original-Texturen, Figuren (z. B. Creeper, Steve), Logos, Sounds und nicht den Namen „Minecraft“ im Spiel, im Code oder in Texten.
- **Grafiken werden per Code erzeugt:** Sprites als Textraster (ein Zeichen pro Pixel) mit fester Farbpalette (pro Sprite maximal 12 Farben), keine Verläufe, keine weichen Kanten. Darstellung mit ganzzahligem Skalierungsfaktor und `image-rendering: pixelated`. Keine KI-generierten Bilddateien.
- **Schrift:** Pixelschrift mit offener Lizenz (z. B. „Press Start 2P“ oder „Silkscreen“) nur für Überschriften und Buttons. Erklärtexte in gut lesbarer Schrift, mindestens 20 px.
- **Begleiterfigur: Bit, die Informatik-Maus.** Blockige, freundliche Maus mit **braunem Fell** (drei Brauntöne), cremefarbenem Bauch und Innenohren, großen eckigen Augen mit Glanzpunkt, kleiner rosa Nase, dünnem Pixelschwanz. Raster 32x32. Posen: stehend, winkend, jubelnd, außerdem nachdenklich, zeigend und aufmunternd bei Fehlern. Alle Posen aus gemeinsamen Körperteilen aufbauen, damit Bit immer gleich aussieht. Bit gibt Hinweise, lobt und erklärt Neues kurz.
- **Rahmengeschichte:** Die Kinder sind in die Computer-Welt gelandet und lernen mit Bit, sich dort zurechtzufinden. Jede Welt hat ein eigenes Material- und Farbthema.
- **Fortschrittsanzeige:** Sterne (bis zu 3 pro Level), Inventar-Leiste oder gesammelte Edelsteine, Weltkarte mit Wegen.

## Lernziele und Priorisierung

### Stufe 1: Muss

- **Maus:** Handhaltung; Linksklick, Rechtsklick, Doppelklick; Scrollen mit dem Mausrad; Markieren (Rahmen aufziehen); Drag & Drop; Kontextmenü gezielt nutzen (Kopieren, Umbenennen, Eigenschaften)
- **Tastatur:** Sondertasten (Umschalt, Feststelltaste, Enter, Rücktaste vs. Entf, Tab, Esc, Leertaste); Strg+Z, Strg+A, Strg+C, Strg+V, Strg+X, Strg+S; @ und € (AltGr); Umlaute und ß
- **Fenster und Oberfläche:** minimieren, vergrößern, schließen; Taskleiste und Startmenü; Programme öffnen und wechseln
- **Dateien und Ordner:** zu Ordnern navigieren; Ordner erstellen; Dateien und Ordner umbenennen; Dateiendungen und Dateitypen erkennen; Löschen, Papierkorb, Wiederherstellen; „Speichern unter“ (Ort wählen, Namen vergeben)
- **Programme:** Symbole Speichern, Schriftart, Schriftgröße, Schriftfarbe, fett, kursiv, unterstreichen, Bild einfügen

### Stufe 2: Sollte (als Bonus-Level in den Welten)

- **Maus:** Markierungstechniken (Doppelklick auf Wort, Dreifachklick für Absatz, Umschalt+Klick, Strg+Klick); Präzision (kleine Ziele, Pfade nachfahren); Mauszeiger-Formen
- **Tastatur:** Pfeiltasten, Pos1/Ende; weitere Sonderzeichen (Anführungszeichen, Klammern, Schrägstriche, Unterstrich, Bindestrich, #, ~); Strg+F
- **Fenster:** verschieben, Größe ziehen, Snap; Minimieren vs. Schließen; Desktop und Verknüpfungen
- **Dateien:** Kopieren vs. Verschieben (Drag & Drop vs. Strg+C/V); Dateien suchen; sinnvolle Namen und Ordnerstrukturen; Downloads-Ordner
- **Programme:** Speichern vs. Speichern unter; Ausrichtung und Aufzählung; Bilder verschieben und skalieren (Ecke ziehen); Rückgängig/Wiederholen per Symbol; Menüleiste, Symbolleiste, Ribbon, Tooltips

### Stufe 3: Kann (Welt 6)

Alt+Tab, Windows-Taste, Alt+F4 (nur als Merkwissen), Wörter markieren mit Strg+Umschalt+Pfeil; Lautstärke und Helligkeit; Herunterfahren, Neustart, Abmelden; Drucken und PDF-Export; Sicherheit (Dialogfenster lesen statt wegklicken, Vorsicht bei Pop-ups, keine persönlichen Daten in beliebige Felder tippen).

### Bewusst nicht enthalten

Zehnfingersystem, Touchpad, USB-Stick, Browser und Internet, Anmelden mit Passwort, Programmhänger, Ergonomie.

## Welten und Level

**Freischaltung:** Welt 1 zuerst. Danach dürfen die Kinder Welt 2 bis 5 **frei wählen**. Welt 6 wird nach Abschluss der Welten 1 bis 5 freigeschaltet. Bonus-Level einer Welt werden ab einer bestimmten Sternezahl der Welt freigeschaltet.

| Welt | Name | Level |
|---|---|---|
| 1 | **Mausland** | 1.1 Handhaltung und Zeigen (Zielscheiben) · 1.2 Linksklick · 1.3 Rechtsklick (Kontextmenü) · 1.4 Doppelklick · 1.5 Scrollen mit dem Mausrad · 1.6 Markieren (Rahmen aufziehen) · 1.7 Drag & Drop · **Boss:** Gegenstände einsammeln, sortieren und per Rechtsklick „aktivieren“ · *Bonus: Präzision, Mauszeiger-Formen, Markierungstechniken* |
| 2 | **Tastaturtal** | 2.1 Enter, Leertaste, Tab, Esc · 2.2 Rücktaste vs. Entf · 2.3 Umschalt und Feststelltaste · 2.4 Umlaute und ß · 2.5 AltGr: @ und € · 2.6 Strg+Z und Strg+A · 2.7 Strg+C, Strg+X, Strg+V · 2.8 Strg+S · **Boss:** Texträtsel mit schnell wechselnden Kombinationen · *Bonus: Pfeiltasten, Pos1/Ende, weitere Sonderzeichen, Strg+F* |
| 3 | **Fensterburg** | 3.1 Minimieren, vergrößern, schließen · 3.2 Taskleiste · 3.3 Startmenü · **Boss:** mehrere Programme öffnen, wechseln, gezielt schließen · *Bonus: verschieben, Größe ziehen, Snap, Minimieren vs. Schließen, Desktop und Verknüpfungen* |
| 4 | **Ordnerwald** | 4.1 Navigieren · 4.2 Ordner erstellen · 4.3 Umbenennen (auch per Kontextmenü) · 4.4 Dateiendungen und Dateitypen · 4.5 Löschen, Papierkorb, Wiederherstellen · **Boss:** Chaos-Verzeichnis aufräumen · *Bonus: Kopieren vs. Verschieben, Suchen, sinnvolle Namen, Downloads-Ordner* |
| 5 | **Programmpalast** | 5.1 Speichern-Symbol · 5.2 Schriftart und -größe · 5.3 Schriftfarbe · 5.4 Fett, kursiv, unterstreichen · 5.5 Bild einfügen · 5.6 „Speichern unter“ · **Boss:** Einladung oder Plakat gestalten und am richtigen Ort speichern · *Bonus: Ausrichtung, Aufzählung, Bilder skalieren, Rückgängig-Symbole, Ribbon/Tooltips, Speichern vs. Speichern unter* |
| 6 | **Profi-Gipfel** | Stufe-3-Inhalte, am Ende eine **Abschlussmission**, die alles kombiniert |

Welt 1 und 2 sind unabhängig voneinander. Welt 3 bis 5 bauen auf dem gemeinsamen Mini-Desktop auf.

## Level-Schablone

Fast jedes Level folgt demselben Ablauf. Implementiere ihn **einmal** als wiederverwendbares Gerüst; jedes Level ist dann nur eine Datenbeschreibung.

1. **Zeigen:** Bit erklärt kurz und zeigt die Technik (Mini-Animation, ein bis zwei Sätze).
2. **Geführt üben:** Aufgabe mit sichtbarer Hilfe (Markierung, Pfeil, Hinweistext).
3. **Selbst anwenden:** gleiche Art Aufgabe ohne Hilfe, mit mehreren Durchgängen und Variation.
4. **Auswertung:** Sterne (bis zu 3) nach Fehlerfreiheit und Tempo; Tempo darf nie allein über den Erfolg entscheiden.

Ein Level-Datensatz enthält mindestens: ID, Titel, Lernziel in einem Satz, Erklärtext von Bit, Aufgabenbeschreibung, Prüfbedingung (welche Eingabe zählt als richtig), Hilfetexte in Stufen, Sternekriterien, Freischaltbedingung. Beim ersten Durchgang gibt es Hilfe, bei Wiederholung nicht mehr.

Fehlerverhalten: freundlich, ohne Punktabzug-Drama. Nach wiederholten Fehlern bietet Bit automatisch die nächste Hilfestufe an. Jedes Level ist beliebig oft wiederholbar.

## Simulierter Mini-Desktop (ab Welt 3)

Windows-11-ähnlich, aber stark vereinfacht und kindgerecht. Als **gemeinsame Basis** bauen, auf der die Level aufsetzen:

- Fenstersystem (Titelleiste, Minimieren/Vergrößern/Schließen, Verschieben, Größe ziehen, Snap)
- Taskleiste und Startmenü
- Dateisystem im Speicher (Ordner, Dateien, Endungen, Papierkorb) mit Datei-Explorer
- Mini-Textprogramm mit Symbolleiste (Speichern, Schrift, Farbe, fett/kursiv/unterstrichen, Bild einfügen, „Speichern unter“-Dialog)
- Simuliertes Kontextmenü

Das Dateisystem eines Levels wird zu Beginn aus den Leveldaten aufgebaut und beim Neustart des Levels zurückgesetzt.

## Reihenfolge der Umsetzung

1. **Grafik-Test:** Bit als Pixelgrafik (drei Posen) mit Vorschauseite. *(Läuft separat; Ergebnis bestimmt den Grafikstil.)*
2. **Technischer Prototyp:** AltGr-Eingabe (@, €) und Abfangen von Strg+S auf den echten Schulrechnern testen.
3. **Gerüst:** Startseite, Weltkarte, Level-Schablone, Fortschritt mit localStorage und Export/Import, Einstellungen (Ton, Schriftgröße).
4. **Welt 1 (Mausland)** komplett – erprobt die Level-Schablone.
5. **Welt 2 (Tastaturtal).**
6. **Mini-Desktop-Basis**, dann Welt 3, 4, 5.
7. **Welt 6** und Abschlussmission.
8. Bonus-Level, Feinschliff, Test mit Kindern, Fehlerbehebung.

## Offene Punkte

- Technische Eckpunkte (Speicherung, Export-Code, Ordnerstruktur) sind Vorschläge und noch nicht endgültig bestätigt.
- Genaue Sternekriterien (Fehlerzahl, Zeitgrenzen) und Schwelle für Bonus-Level festlegen.
- Name des Spiels und Titelbild.
- Ton: Soll es optionale, selbst erzeugte Soundeffekte geben?
- Test auf den echten Schulrechnern (Browser, Tastaturlayout, AltGr, Bildschirmauflösung).
