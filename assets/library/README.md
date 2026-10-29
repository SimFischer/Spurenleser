# Bibliothek und Ermittlungsjournal

## `investigation-journal.webp`

Lokale WebP-Fassung des leeren Buchrahmens aus dem eigenen Projekt [SimFischer/Bestiarium](https://github.com/SimFischer/Bestiarium/blob/f16acbedc2583f6db39aac78d044c43c1448e79e/assets/bestiary/master-bestiary.png), Commit `f16acbedc2583f6db39aac78d044c43c1448e79e`.

- Quelle: `assets/bestiary/master-bestiary.png`
- Technische Änderung: WebP-Kompression (Qualität 90), keine inhaltliche Bildänderung.
- Verwendung: kleine Buchillustration im Kopf des Ermittlungsjournals. Text bleibt echter, vergrößerbarer HTML-Text auf ruhigem Pergament.
- Geprüft, aber nicht übernommen: `research-codex-page.png` (enthält naturkundliche Motive), `station/phase-0.png` und `station/phase-4.png` (Forschungsstation, Weltkarte, Kreaturen), Kreaturen- und Generatorgrafiken.
- Keine externen Verweise zur Laufzeit. Das Quellrepository wurde nicht verändert.

## `story-archive.webp`

Eigens für Spurenleser mit dem eingebauten Imagegen-Werkzeug erzeugt. Keine Bildsuche und kein übernommenes Franchise-Material. Die PNG-Ausgabe wurde ohne inhaltliche Änderung als WebP (Qualität 88) gespeichert. Die Bildwelt beschreibt das gemeinsame Archiv, nicht einen neuen Ort innerhalb der Museumsgeschichte.

Verwendeter vollständiger Prompt:

> Use case: illustration-story. Asset type: wide atmospheric background illustration for the Spurenleser interactive reading-adventure library entrance, landscape 1536x1024 or wider. Paint a richly crafted mysterious old library / archive of stories for readers age 10–12, like a premium illustrated adventure-game environment. Immersive interior, tall dark wooden bookshelves filled with weathered cloth and leather volumes, archive drawers with small brass pulls, an old tall window at right with muted blue-green evening light, warm amber lantern pools, a reading desk in right foreground with open blank parchment journal, antique brass compass and magnifying glass and folded maps. Architectural depth and beautiful hand-painted textures, soft painterly edges, expressive but refined, gently magical floating dust motes only. Palette: deep maritime petrol shadows, dark walnut, muted green, parchment cream, aged brass, warm candlelight. Composition: scene fills frame; reserve the left 55 percent as dark, quiet, relatively low-detail shadowed shelves / wall where real HTML title and buttons will be overlaid. Bright focal detail on right half; no large white book occupying text space. A real illustrated storybook setting, not a website screenshot. No people, no creatures, no skulls, no pirate tropes, no heraldry, no Hogwarts / Harry Potter motifs, no franchise references. No text, no lettering, no logos, no watermark. No generic vector art or SVG aesthetic. Landscape, full bleed.

## Austausch

- Bibliothekseingang: Bildpfad in `js/app.js` (`renderHome`) und Hintergrundpfad in `css/app.css` (`body::before`) gemeinsam anpassen.
- Journalbild: Pfad in `js/app.js` (`showNotebook`). Ein anderes Seitenverhältnis ist durch `height: auto` möglich.
- Abenteuercover: `data/presentation.js`, pro Abenteuer `cover` und `coverAlt`. Fehlt ein Eintrag, wird ein neutrales Buchsymbol verwendet.
- Texte und Bedienelemente sind nicht ins Bild eingebrannt. Die Bibliotheksillustration ist dekorativ; die Inhalte sind unabhängig davon lesbar. Keine zusätzlichen Fonts oder Backenddienste nötig.
