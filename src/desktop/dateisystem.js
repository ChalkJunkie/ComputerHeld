/* =====================================================================
   DATEISYSTEM IM SPEICHER (ab Welt 4)
   Ordner und Dateien wie auf einem echten Computer – aber nur im
   Arbeitsspeicher. Jede Aufgabe baut ihr Dateisystem neu auf.

   Pfade sehen so aus: "/Dokumente/Schule/Mathe.docx"
   "/" ist „Dieser PC“. Groß-/Kleinschreibung zählt beim Suchen nicht
   (wie bei Windows).

   Aufbau aus einer Liste, z. B.
     ["Dokumente/Schule/Mathe.docx", "Bilder/Urlaub/", "Musik/Lied.mp3"]
   Ein Eintrag mit "/" am Ende ist ein (leerer) Ordner.
   Die Ordner Dokumente, Bilder, Musik und Downloads gibt es immer.
   ===================================================================== */

export const STANDARD_ORDNER = ["Dokumente", "Bilder", "Musik", "Downloads"];

/* ---------- Dateitypen nach Endung ---------- */
export const DATEITYPEN = {
  txt:  { symbol: "text",     beschreibung: "eine Text-Datei" },
  docx: { symbol: "dokument", beschreibung: "ein Dokument (zum Schreiben mit Schrift und Bildern)" },
  pdf:  { symbol: "pdf",      beschreibung: "ein PDF (ein Dokument zum Lesen und Drucken)" },
  jpg:  { symbol: "bild",     beschreibung: "ein Bild" },
  png:  { symbol: "bild",     beschreibung: "ein Bild" },
  mp3:  { symbol: "musik",    beschreibung: "Musik" },
  mp4:  { symbol: "video",    beschreibung: "ein Video" },
  exe:  { symbol: "programm", beschreibung: "ein Programm" },
};

export function endung(name) {
  const punkt = name.lastIndexOf(".");
  return punkt > 0 ? name.slice(punkt + 1).toLowerCase() : "";
}
export function typVon(name) {
  return DATEITYPEN[endung(name)] || { symbol: "allgemein", beschreibung: "eine Datei" };
}

/* ---------- Pfade ---------- */
export function teile(pfad) {
  return pfad.split("/").filter(Boolean);
}
export function elternVon(pfad) {
  const t = teile(pfad);
  return "/" + t.slice(0, -1).join("/");
}
export function nameVon(pfad) {
  const t = teile(pfad);
  return t[t.length - 1] || "";
}
export function verbinde(ordner, name) {
  return (ordner === "/" ? "" : ordner) + "/" + name;
}
const gleich = (a, b) => a.toLowerCase() === b.toLowerCase();

/* =====================================================================
   Das Dateisystem
   ===================================================================== */
export function baueDateisystem(liste = [], papierkorbListe = []) {
  const wurzel = { name: "", typ: "ordner", kinder: [] };
  const papierkorb = []; // Einträge: { knoten, herkunft }

  function kind(ordner, name) {
    return ordner.kinder.find((k) => gleich(k.name, name));
  }
  function finde(pfad) {
    let knoten = wurzel;
    for (const teil of teile(pfad)) {
      if (!knoten || knoten.typ !== "ordner") return null;
      knoten = kind(knoten, teil);
    }
    return knoten || null;
  }
  /* legt einen Pfad an (Ordner unterwegs werden mit angelegt) */
  function lege(eintrag, ziel = wurzel) {
    const istOrdner = eintrag.endsWith("/");
    const stuecke = teile(eintrag);
    let ordner = ziel;
    stuecke.forEach((name, i) => {
      const letztes = i === stuecke.length - 1;
      let k = kind(ordner, name);
      if (!k) {
        k = letztes && !istOrdner ? { name, typ: "datei" } : { name, typ: "ordner", kinder: [] };
        ordner.kinder.push(k);
      }
      ordner = k;
    });
    return ordner;
  }

  for (const o of STANDARD_ORDNER) lege(o + "/");
  for (const e of liste) lege(e);
  for (const e of papierkorbListe) {
    const istOrdner = e.endsWith("/");
    const pfad = "/" + teile(e).join("/");
    papierkorb.push({
      knoten: istOrdner ? { name: nameVon(pfad), typ: "ordner", kinder: [] } : { name: nameVon(pfad), typ: "datei" },
      herkunft: elternVon(pfad),
    });
  }

  const fs = {
    finde,
    existiert: (pfad) => Boolean(finde(pfad)),
    istOrdner: (pfad) => finde(pfad)?.typ === "ordner",

    /* Inhalt eines Ordners: erst Ordner, dann Dateien, jeweils nach ABC */
    inhalt(pfad) {
      const ordner = finde(pfad);
      if (!ordner || ordner.typ !== "ordner") return [];
      const sortiert = [...ordner.kinder].sort((a, b) =>
        (a.typ === b.typ ? 0 : a.typ === "ordner" ? -1 : 1) || a.name.localeCompare(b.name, "de"));
      return sortiert.map((k) => ({ ...k, pfad: verbinde(pfad, k.name) }));
    },

    /* Weitere Einträge hinzufügen (z. B. im nächsten Boss-Abschnitt) */
    lege(eintrag) { lege(eintrag); },

    /* Neuer Ordner mit freiem Namen: „Neuer Ordner“, „Neuer Ordner (2)“ … */
    erstelleOrdner(ort) {
      const ordner = finde(ort);
      let name = "Neuer Ordner";
      for (let n = 2; kind(ordner, name); n++) name = `Neuer Ordner (${n})`;
      ordner.kinder.push({ name, typ: "ordner", kinder: [] });
      return verbinde(ort, name);
    },

    /* gibt es im Ordner schon etwas mit diesem Namen (außer "ausser")? */
    nameVergeben(ort, name, ausser) {
      const k = kind(finde(ort), name);
      return Boolean(k) && k !== finde(ausser || "");
    },

    umbenennen(pfad, neuerName) {
      finde(pfad).name = neuerName;
      return verbinde(elternVon(pfad), neuerName);
    },

    verschieben(pfad, zielOrdner) {
      const knoten = finde(pfad);
      const alt = finde(elternVon(pfad));
      alt.kinder = alt.kinder.filter((k) => k !== knoten);
      finde(zielOrdner).kinder.push(knoten);
      return verbinde(zielOrdner, knoten.name);
    },

    loeschen(pfad) {
      const knoten = finde(pfad);
      const ordner = finde(elternVon(pfad));
      ordner.kinder = ordner.kinder.filter((k) => k !== knoten);
      papierkorb.push({ knoten, herkunft: elternVon(pfad) });
    },

    /* Papierkorb: Liste mit Name, Herkunft und einem „Pfad“ zum Anklicken */
    papierkorb() {
      return papierkorb.map((e, i) => ({
        ...e.knoten, herkunft: e.herkunft, pfad: "papierkorb:" + i, original: verbinde(e.herkunft, e.knoten.name),
      }));
    },
    papierkorbEintrag(pfad) {
      const i = Number(pfad.replace("papierkorb:", ""));
      const e = papierkorb[i];
      return e ? { ...e.knoten, herkunft: e.herkunft, original: verbinde(e.herkunft, e.knoten.name) } : null;
    },
    imPapierkorb(originalPfad) {
      return papierkorb.some((e) => gleich(verbinde(e.herkunft, e.knoten.name), originalPfad));
    },

    wiederherstellen(pfad) {
      const i = Number(pfad.replace("papierkorb:", ""));
      const [e] = papierkorb.splice(i, 1);
      const ordner = finde(e.herkunft) || lege(e.herkunft + "/");
      ordner.kinder.push(e.knoten);
      return verbinde(e.herkunft, e.knoten.name);
    },
  };
  return fs;
}
