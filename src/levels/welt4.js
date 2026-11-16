/* =====================================================================
   LEVEL-DATEN WELT 4: ORDNERWALD
   =====================================================================
   Alle Level nutzen den Aufgabentyp "explorer"
   (src/engine/aufgaben/explorer.js). Dort steht genau, wie eine Aufgabe
   aufgebaut ist und welche Ziele es gibt.

   Kurz:
     start.dateien – Dateien und Ordner (Ordner enden auf "/")
                     Dokumente, Bilder, Musik und Downloads gibt es immer.
     start.ort     – hier startet der Explorer ("/" = Dieser PC)
     ziel          – was am Ende geschafft sein muss

   Beim ÜBEN zeigt Bit Schritt für Schritt, wo man klicken muss.
   Beim ANWENDEN sagt Bit nur, WAS zu tun ist.
   Sternekriterien sind VORLÄUFIG (siehe welt1.js).
   ===================================================================== */

/* Ein ganz normaler Kinder-Computer – in vielen Aufgaben derselbe */
const PC = [
  "Dokumente/Schule/Mathe.docx",
  "Dokumente/Schule/Deutsch.docx",
  "Dokumente/Geburtstag/",
  "Dokumente/Einkaufsliste.txt",
  "Bilder/Urlaub/Strand.jpg",
  "Bilder/Urlaub/Berge.jpg",
  "Bilder/Hund.png",
  "Musik/Lieblingslied.mp3",
  "Downloads/Malbuch.pdf",
];

/* ---------- Abkürzungen ---------- */
const geheZu = (ort, ziel, ansage) => ({ start: { dateien: PC, ort }, schritte: [{ ziel: { ort: ziel }, ansage }] });
const neuerOrdner = (ort, ordner, ansage) => ({ start: { dateien: PC, ort }, schritte: [{ ziel: { ordner }, ansage }] });
const benenne = (dateien, ort, von, nach, ansage) => ({
  start: { dateien: [...PC, ...dateien], ort }, schritte: [{ ziel: { umbenannt: { von, nach } }, ansage }],
});
const loesche = (dateien, ort, pfad, ansage) => ({
  start: { dateien: [...PC, ...dateien], ort }, schritte: [{ ziel: { geloescht: pfad }, ansage }],
});
const holeZurueck = (papierkorb, ort, pfad, ansage) => ({
  start: { dateien: PC, papierkorb, ort }, schritte: [{ ziel: { wiederhergestellt: pfad }, ansage }],
});

/* 4.4: Alle Dateien heißen „Ausflug“ – nur die Endung verrät, was drin ist */
const AUSFLUG = [
  "Downloads/Ausflug.jpg", "Downloads/Ausflug.png", "Downloads/Ausflug.mp3", "Downloads/Ausflug.mp4",
  "Downloads/Ausflug.txt", "Downloads/Ausflug.docx", "Downloads/Ausflug.pdf",
];
const finde = (endungen, ansage) => ({
  start: { dateien: AUSFLUG, ort: "/Downloads" },
  schritte: [{ ziel: { ausgewaehlt: endungen.map((e) => "/Downloads/Ausflug." + e) }, ansage }],
});

export const LEVEL_WELT4 = {

  "4.1": {
    titel: "Navigieren",
    lernziel: "Du öffnest Ordner und findest den Weg zurück.",
    erklaerung: [
      "Auf dem Computer liegen Dateien in Ordnern – wie Blätter in Mappen. In einem Ordner können wieder Ordner sein.",
      "Doppelklick öffnet einen Ordner. „Nach oben“ bringt dich eine Ebene zurück. Links findest du die wichtigsten Ordner.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "explorer",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      geheZu("/", "/Dokumente", "Öffne den Ordner „Dokumente“."),
      geheZu("/Dokumente", "/Dokumente/Schule", "Öffne in „Dokumente“ den Ordner „Schule“."),
      geheZu("/Dokumente/Schule", "/Dokumente", "Geh eine Ebene nach oben zu „Dokumente“."),
    ] },
    selbst: { runden: 6, aufgaben: [
      geheZu("/", "/Bilder/Urlaub", "Finde den Ordner „Urlaub“. Er liegt in „Bilder“."),
      geheZu("/Bilder/Urlaub", "/Downloads", "Geh zum Ordner „Downloads“."),
      geheZu("/", "/Dokumente/Schule", "Öffne den Ordner „Schule“. Er liegt in „Dokumente“."),
      geheZu("/Dokumente/Schule", "/", "Geh zurück zu „Dieser PC“."),
      geheZu("/Bilder", "/Dokumente/Geburtstag", "Öffne den Ordner „Geburtstag“ in „Dokumente“."),
      geheZu("/Dokumente/Schule", "/Musik", "Öffne den Ordner „Musik“."),
    ] },
    hilfen: [
      "Doppelklick heißt: zweimal schnell klicken. Oder Rechtsklick und „Öffnen“.",
      "Oben siehst du, wo du gerade bist. Links kannst du direkt zu Dokumente, Bilder, Musik und Downloads springen.",
    ],
    sterne: { fehlerFuerZwei: 2, fehlerFuerDrei: 0, sekundenFuerDrei: 60 },
  },

  "4.2": {
    titel: "Ordner erstellen",
    lernziel: "Du legst einen neuen Ordner an und gibst ihm einen Namen.",
    erklaerung: [
      "Mit eigenen Ordnern hältst du Ordnung. Geh zuerst in den Ordner, in den der neue Ordner soll.",
      "Klick auf „Neuer Ordner“. Dann tippst du gleich den Namen und drückst Enter.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "explorer",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      neuerOrdner("/Dokumente", "/Dokumente/Ferien", "Erstelle hier einen neuen Ordner. Nenn ihn „Ferien“."),
      neuerOrdner("/Bilder", "/Bilder/Tiere", "Erstelle hier einen Ordner „Tiere“."),
    ] },
    selbst: { runden: 4, aufgaben: [
      neuerOrdner("/", "/Dokumente/Hausaufgaben", "Erstelle in „Dokumente“ einen Ordner „Hausaufgaben“."),
      neuerOrdner("/Musik", "/Musik/Lieblingslieder", "Erstelle hier einen Ordner „Lieblingslieder“."),
      neuerOrdner("/Dokumente", "/Dokumente/Schule/Englisch", "Erstelle in „Schule“ einen Ordner „Englisch“."),
      neuerOrdner("/Downloads", "/Bilder/Zeichnungen", "Erstelle in „Bilder“ einen Ordner „Zeichnungen“."),
    ] },
    hilfen: [
      "„Neuer Ordner“ ist oben in der Leiste. Oder: Rechtsklick auf eine freie Stelle.",
      "Nach dem Klick steht „Neuer Ordner“ markiert da. Tipp einfach los – dann Enter.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 60 },
  },

  "4.3": {
    titel: "Umbenennen",
    lernziel: "Du gibst Dateien und Ordnern einen neuen, passenden Namen.",
    erklaerung: [
      "Fotos heißen oft „IMG_0042“. Das versteht keiner! Gib ihnen lieber einen Namen, den du wiedererkennst.",
      "Rechtsklick auf die Datei, dann „Umbenennen“. Tipp den neuen Namen und drück Enter. Die Endung (z. B. „.jpg“) bleibt stehen.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "explorer",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      benenne(["Bilder/IMG_0042.jpg"], "/Bilder", "/Bilder/IMG_0042.jpg", "/Bilder/Katze.jpg",
        "Gib dem Bild „IMG_0042.jpg“ den Namen „Katze“."),
      benenne(["Dokumente/Neuer Ordner/"], "/Dokumente", "/Dokumente/Neuer Ordner", "/Dokumente/Fußball",
        "Nenn den Ordner „Neuer Ordner“ um in „Fußball“."),
    ] },
    selbst: { runden: 4, aufgaben: [
      benenne(["Dokumente/text1.txt"], "/Dokumente", "/Dokumente/text1.txt", "/Dokumente/Rezept.txt",
        "Nenn „text1.txt“ um in „Rezept“."),
      benenne(["Musik/track07.mp3"], "/Musik", "/Musik/track07.mp3", "/Musik/Sommerlied.mp3",
        "Gib „track07.mp3“ den Namen „Sommerlied“."),
      benenne(["Dokumente/ordner2/"], "/Dokumente", "/Dokumente/ordner2", "/Dokumente/Basteln",
        "Nenn den Ordner „ordner2“ um in „Basteln“."),
      benenne(["Bilder/DSC0815.png"], "/Bilder", "/Bilder/DSC0815.png", "/Bilder/Pferd.png",
        "Gib dem Bild „DSC0815.png“ den Namen „Pferd“."),
    ] },
    hilfen: [
      "Rechtsklick auf die Datei. Im Menü steht „Umbenennen“. Oder: anklicken und F2 drücken.",
      "Lass die Endung hinter dem Punkt stehen. Sie sagt dem Computer, was für eine Datei es ist.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 60 },
  },

  "4.4": {
    titel: "Dateiendungen",
    lernziel: "Du erkennst an der Endung, was für eine Datei es ist.",
    erklaerung: [
      "Hinter dem Punkt steht die Endung. Sie verrät, was in der Datei steckt.",
      ".jpg und .png: Bild · .mp3: Musik · .mp4: Video · .txt: Text · .docx: Dokument · .pdf: PDF zum Lesen",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "explorer",
    gefuehrt: { runden: 3, gemischt: false, aufgaben: [
      finde(["jpg", "png"], "Alle Dateien heißen „Ausflug“. Klick auf ein Bild."),
      finde(["mp3"], "Klick auf die Musik."),
      finde(["mp4"], "Klick auf das Video."),
    ] },
    // Beim Anwenden sehen alle Dateien gleich aus – jetzt hilft nur die Endung!
    selbst: { runden: 6, symbole: false, aufgaben: [
      finde(["jpg", "png"], "Klick auf ein Bild."),
      finde(["mp3"], "Klick auf die Musik."),
      finde(["mp4"], "Klick auf das Video."),
      finde(["txt"], "Klick auf die Text-Datei."),
      finde(["docx"], "Klick auf das Dokument zum Schreiben."),
      finde(["pdf"], "Klick auf das PDF."),
    ] },
    hilfen: [
      "Lies die Buchstaben nach dem Punkt.",
      "Unsicher? Rechtsklick und „Eigenschaften“ – dort steht, was für eine Datei es ist.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 40 },
  },

  "4.5": {
    titel: "Löschen und Papierkorb",
    lernziel: "Du löschst Dateien und holst sie aus dem Papierkorb zurück.",
    erklaerung: [
      "Was du löschst, kommt erst in den Papierkorb. Von dort kannst du es zurückholen.",
      "Löschen: Rechtsklick und „Löschen“ – oder die Taste Entf. Zurückholen: Papierkorb öffnen, Rechtsklick, „Wiederherstellen“.",
    ],
    aufgabe: "Mach, was ich sage.",
    typ: "explorer",
    gefuehrt: { runden: 2, gemischt: false, aufgaben: [
      loesche(["Downloads/Werbung.exe"], "/Downloads", "/Downloads/Werbung.exe", "Lösch die Datei „Werbung.exe“."),
      holeZurueck(["Dokumente/Aufsatz.docx"], "/Dokumente", "/Dokumente/Aufsatz.docx",
        "Oh nein, der Aufsatz ist im Papierkorb! Hol ihn zurück."),
    ] },
    selbst: { runden: 4, aufgaben: [
      loesche(["Bilder/verwackelt.jpg"], "/Bilder", "/Bilder/verwackelt.jpg", "Das Foto „verwackelt.jpg“ ist nichts geworden. Lösch es."),
      loesche(["Dokumente/Test/"], "/Dokumente", "/Dokumente/Test", "Lösch den leeren Ordner „Test“."),
      holeZurueck(["Musik/Tanzlied.mp3"], "/", "/Musik/Tanzlied.mp3", "Hol das „Tanzlied“ aus dem Papierkorb zurück."),
      holeZurueck(["Bilder/Oma.jpg", "Downloads/Werbung.exe"], "/Bilder", "/Bilder/Oma.jpg",
        "Das Foto „Oma.jpg“ wurde aus Versehen gelöscht. Hol es zurück."),
    ] },
    hilfen: [
      "Zum Löschen: Rechtsklick auf die Datei und „Löschen“. Oder anklicken und Entf drücken. Du kannst sie auch auf den Papierkorb ziehen.",
      "Der Papierkorb ist links ganz unten. Dort Rechtsklick auf die Datei und „Wiederherstellen“.",
    ],
    sterne: { fehlerFuerZwei: 3, fehlerFuerDrei: 1, sekundenFuerDrei: 50 },
  },

  "4.B": {
    titel: "Boss: Chaos aufräumen",
    lernziel: "Du räumst einen unordentlichen Ordner mit allem auf, was du gelernt hast.",
    erklaerung: [
      "Im Ordner „Downloads“ herrscht Chaos! Bilder, Musik und Werbung liegen wild durcheinander.",
      "Räum auf: Zieh Dateien in die richtigen Ordner, benenne um, lösch den Müll. Ich sage dir, was dran ist.",
    ],
    aufgabe: "Auf geht's!",
    typ: "explorer",
    // Kein "gefuehrt": Beim Boss gibt es kein Üben mit Hilfe.
    selbst: {
      runden: 5,
      gemischt: false,
      aufgaben: [
        { start: { ort: "/Downloads", dateien: [
            ...PC, "Downloads/Strand2.jpg", "Downloads/Pony.png", "Downloads/Sommerhit.mp3",
            "Downloads/Tanzen.mp3", "Downloads/dok1.docx", "Downloads/Werbung.exe", "Downloads/Gratis-Spiel.exe",
          ] },
          schritte: [{
            ziel: { verschoben: [{ von: "/Downloads/Strand2.jpg", nach: "/Bilder" }, { von: "/Downloads/Pony.png", nach: "/Bilder" }] },
            ansage: "Zieh alle Bilder in den Ordner „Bilder“ (links).",
          }] },
        { start: { weiter: true },
          schritte: [{
            ziel: { verschoben: [{ von: "/Downloads/Sommerhit.mp3", nach: "/Musik" }, { von: "/Downloads/Tanzen.mp3", nach: "/Musik" }] },
            ansage: "Zieh die Musik in den Ordner „Musik“.",
          }] },
        { start: { weiter: true },
          schritte: [
            { ziel: { geloescht: "/Downloads/Werbung.exe" }, ansage: "Lösch „Werbung.exe“. Die brauchst du nicht." },
            { ziel: { geloescht: "/Downloads/Gratis-Spiel.exe" }, ansage: "Lösch auch „Gratis-Spiel.exe“. Vorsicht bei Gratis-Programmen!" },
          ] },
        { start: { weiter: true },
          schritte: [
            { ziel: { umbenannt: { von: "/Downloads/dok1.docx", nach: "/Downloads/Referat.docx" } },
              ansage: "„dok1.docx“ ist dein Referat. Nenn es „Referat“." },
            { ziel: { verschoben: [{ von: "/Downloads/Referat.docx", nach: "/Dokumente" }] },
              ansage: "Zieh das Referat in den Ordner „Dokumente“." },
          ] },
        { start: { weiter: true, papierkorb: ["Dokumente/Schule/Hausaufgabe.docx"] },
          schritte: [{
            ziel: { wiederhergestellt: "/Dokumente/Schule/Hausaufgabe.docx" },
            ansage: "Oh nein! Beim Aufräumen ist die Hausaufgabe im Papierkorb gelandet. Hol sie zurück.",
          }] },
      ],
    },
    hilfen: [
      "Lies genau, was ich sage. Dort steht immer, was als Nächstes dran ist.",
      "Ziehen: Datei anklicken, Taste festhalten, auf den Ordner links ziehen, loslassen.",
    ],
    sterne: { fehlerFuerZwei: 5, fehlerFuerDrei: 2, sekundenFuerDrei: 150 },
  },

};
