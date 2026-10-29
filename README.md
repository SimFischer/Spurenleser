# Spurenleser

**Interaktive Leseabenteuer · Lies genau. Sammle Hinweise. Löse den Fall.**

Statische Web-App für Klasse 5/6 mit einem vollständigen ersten Fall: **Der Fall der verschwundenen Taschenuhr**. Eine maritime Museumsgeschichte mit vier Akten, verzweigten Gesprächen, Quellenvergleich, Notizbuch, Inventar, automatischen Erkenntnissen und finaler Beweisführung. Eine illustrierte Bibliothek bildet das Geschichtenarchiv; Fälle erscheinen als gebundene Bücher und Archivmappen. Alle Bilder liegen lokal. Ohne Bilddienste, externe Schriften, Accounts, KI/API zur Laufzeit, Musik oder Laufzeitabhängigkeiten.

## Lokal starten

Node.js ab Version 22 ist nur für Entwicklungsserver und Tests nötig. Kein `npm install`, kein Build erforderlich.

```sh
npm start
```

Im Browser **http://127.0.0.1:4186** öffnen. Alternativ jeden statischen HTTP-Server für diesen Ordner verwenden. `index.html` nicht per `file://` öffnen: ES-Module benötigen HTTP. In Produktion reichen `index.html`, `css/`, `js/`, `data/` und `assets/`.

```sh
npm test
```

## Aufbau

```text
index.html                 Semantische Hülle, Dialog, Navigation
css/app.css                Responsive Design, Druck, reduzierte Bewegung
js/app.js                  Ansichten, Routing, Fokus, Einstellungen
js/engine.js               Entscheidungen, Effekte, Erkenntnisse, Beweise
js/state.js                Anfangszustand und Bedingungsprüfung
js/save.js                 Versionierter localStorage-Spielstand je Fall
js/notebook.js             Bekannte Einträge aus den Storydaten
js/teacher.js              Darstellung der Lehrkräfteinformationen
js/teacher-access.js       Clientseitige Zugangshürde für die Sitzung
data/adventures.js         Abenteuerkatalog
data/presentation.js       Buchcover und wissensabhängige Personenakten
data/taschenuhr.js         Vollständiger Fall einschließlich Lösung und Regeln
assets/                    Lokale SVG-/WebP-Bilder mit Herkunftsnachweisen
scripts/serve.mjs          Lokaler Entwicklungsserver
tests/                     Storypfade, Journal und Lehrkräftezugang
.github/workflows/pages.yml Tests und GitHub-Pages-Deployment
```

Die Storydaten enthalten Texte, Figuren, Orte, Inventar, Erkenntnisse, Voraussetzungen, Beweisgewichte, Motive, Abschlussregeln und Lehrkräfteinformationen. Die Engine enthält keine Namen oder festen Wahrheiten des ersten Falls. Darstellung erfolgt als Text mit HTML-Escaping. Sämtliche Ressourcenpfade sind relativ und funktionieren unter `/Spurenleser/`.

## Bedienung und Spielstand

- Auf der Startseite einen Fall öffnen. Ein vorhandener Spielstand kann fortgesetzt werden; ein Neustart benötigt eine Sicherheitsabfrage.
- Ermittlungsjournal: Hinweise, Personen, Erkenntnisse, Orte und Inventar als fünf Register in einem Drawer. Der Inventar-Button öffnet direkt das entsprechende Register. Personenakten zeigen nur bereits ermittelte Fakten. Neue Erkenntnisse werden zusätzlich kurz angekündigt, bleiben aber dauerhaft im Notizbuch.
- Nach jeder Entscheidung wird automatisch auf diesem Gerät gespeichert. Auch abgeschlossene Fälle bleiben lesbar. Leseeinstellungen werden getrennt gespeichert.
- Kein Zurückspulen von Entscheidungen. Die URL enthält nur die Ansicht, keine Szenen-ID. Erneute Ortsbesuche sind bewusste Handlungen in der Geschichte. Der Browser-Zurück-Knopf stellt keinen früheren Spielzustand her.
- Große Schrift über `AA` oder das Menü. Optionales Leselineal folgt Maus/Finger; Textabsätze sind bei aktiviertem Lineal per Tab fokussierbar. Dialoge unterstützen Escape, Fokusbegrenzung und einen Schließen-Button. Bewegungen folgen `prefers-reduced-motion`.
- Kann der Browser nicht speichern, erscheint eine Meldung; die App bleibt innerhalb der geöffneten Sitzung spielbar. Beschädigte oder inkompatible Speicherstände werden verworfen.
- Ein Spielstand ist kein manipulationssicheres Prüfungsformat. Browserdaten löschen oder ein anderer Browser setzen den Fortschritt zurück. Keine Synchronisation zwischen Geräten und kein garantierter Offline-Neustart; es gibt bewusst keinen Service Worker.
- Auf gemeinsam genutzten Geräten im Menü **Spielstand von diesem Gerät löschen** verwenden. Keine Namen, E-Mails, Schülerkennungen oder Lesehistorien werden erfasst. Hostinganbieter können technische Zugriffsprotokolle führen.

## Lehrkräftezugang

Alle Zugänge, einschließlich direktem `#teacher`-Link und Spielmenü, zeigen zunächst nur das Zugangspanel. Der Code lautet exakt **`Lehrkraft`**. Groß-/Kleinschreibung und Leerzeichen werden exakt geprüft. Erst nach korrekter Eingabe werden die Lehrkräfteinformationen in den DOM gerendert; ein falscher Code erzeugt eine freundliche, per Screenreader angekündigte Meldung.

Die Freischaltung wird als unkritisches Flag in `sessionStorage` gehalten, damit sie Navigation und Neuladen in derselben Tab-Sitzung übersteht. Der eingegebene Code wird nicht gespeichert; `localStorage` und die Spielstände werden dafür nicht verwendet. Ohne verfügbaren Sitzungsspeicher gilt die Freischaltung nur bis zum Neuladen. Mit **Bereich wieder schließen** lässt sich der Zugang sofort zurücksetzen. Ein Link zur Startseite ist jederzeit vorhanden.

Das ist eine einfache clientseitige Spoilerhürde, keine Authentifizierung und kein Schutz vertraulicher Daten: Quelltext, Code und Storydateien sind bei einer statischen App einsehbar. Ein vom Browser wiederhergestellter Tab kann auch dessen Sitzungsspeicher wiederherstellen. Kein Backend erforderlich.

## Design und Assets

`css/app.css` wurde ersetzt und in elf klar benannte Abschnitte gegliedert: gemeinsame Design-Tokens, Adventure-Buttons, Navigation, Bibliothekseingang, Bücherregal, Leseseite, Beweiszettel, Journal, Lehrkräftebereich, Lesehilfen und konsolidierte Responsive-/Druckregeln. Die Startseite hat keinen klassischen Website-Header. Serifentitel, gedämpftes Petrol, Pergament, Leder und Messing bilden die gemeinsame Gestaltung; der Lesetext bleibt auf einer hellen Fläche ohne Bildtextur unter den Zeilen.

`assets/library/story-archive.webp` ist die neue, eigens erzeugte Rasterillustration für den Bibliothekseingang. `assets/library/investigation-journal.webp` übernimmt den leeren Buchrahmen aus dem eigenen Repository **SimFischer/Bestiarium**, Stand `f16acbedc2583f6db39aac78d044c43c1448e79e`, Quelle `assets/bestiary/master-bestiary.png`. Übernommen wurde nur dieser passende Buchrahmen, als lokale WebP-Kopie. Kreaturen, Weltkarte und Forschungsstation wurden geprüft und nicht übernommen. Es gibt keine Laufzeitverbindung zum Bestiarium.

Herkunft, Erzeugungsprompt und Austauschpfade sind in `assets/library/README.md` dokumentiert. Beide Rasterdateien sind zusammen etwa 417 KB groß. Bestehende SVGs für Kompass, Uhr und Museum bleiben erhalten. Neue Cover lassen sich über `data/presentation.js` zuordnen; Hintergrund und Journalvorschaubild über die dokumentierten lokalen Pfade austauschen.

## Einen neuen Fall ergänzen

1. Neue ES-Modul-Datei unter `data/` anlegen, etwa `data/neuer-fall.js`. `taschenuhr.js` dient als vollständiges Schema. IDs sind innerhalb eines Falls eindeutig; IDs von Hinweisen, Erkenntnissen, Orten, Personen, Inventar und Flags dürfen nicht miteinander kollidieren.
2. Den Fall in `data/adventures.js` importieren und zum Array hinzufügen. Die Übersicht rendert daraus automatisch Karten; Spielstände verwenden die unveränderliche Abenteuer-ID als Namensraum. `title`, `level`, `duration`, `genre` und `teaser` beschreiben die Karte. Cover und optionale Personenrollen werden in `data/presentation.js` unter der Abenteuer-ID ergänzt. Ohne Cover erscheint ein neutrales Buchsymbol. Die Bibliotheksillustration ist die gemeinsame Meta-Welt; Storydaten und Spielzustand bleiben davon getrennt.
3. `start`, `acts`, `scenes`, `clues`, `insights`, `people`, `locations`, `items`, `endings`, `suspects`, `evidence`, `accusation` und `teacher` definieren. Die Figurennamen und die Wahrheit stehen ausschließlich in der Datendatei.
4. Neue Testspielwege ergänzen. Jedes Ziel muss existieren, jede notwendige Information erreichbar sein und jede nicht finale Szene eine verfügbare Handlung behalten. Falls sich ein veröffentlichtes Speicherschema inkompatibel ändert, `STATE_VERSION` sowie den Speicherpräfix bewusst versionieren.

Eine Szene:

```js
nachfrage: {
  act: 1,
  place: 'Lesesaal',
  title: 'Eine andere Erinnerung',
  text: 'Erster Absatz.\n\nEin weiterer Absatz.',
  effects: { clues: ['aussage'], people: { zeugin: true } },
  choices: [
    { label: 'Die Aussagen vergleichen', to: 'vergleich',
      requiresAll: ['aussage', 'brief'], excludes: ['abgeschlossen'] },
    { label: 'Weitere Quellen lesen', to: 'lesetisch' }
  ],
  variants: [
    { requiresAll: ['brief'], text: 'Anderer Text bei einem späteren Besuch.' }
  ]
}
```

`requiresAll`: alle IDs bekannt; `requiresAny`: wenigstens eine ID bekannt; `excludes`: keine dieser IDs bekannt. Die Bedingungen werden gemeinsam angewendet. Die erste passende Textvariante gewinnt. `effects` ergänzt Mengen ohne Duplikate; `people` ist eine ID-zu-Wert-Zuordnung. `preserveAct` hält bei Zwischenansichten den bisherigen Akt. `ending` in Effekten beendet den Fall.

Erkenntnisse werden nach jeder Handlung bis zu einem stabilen Zustand geprüft und damit unabhängig von der Fundreihenfolge freigeschaltet:

```js
insights: {
  widerspruch: {
    name: 'Das passt nicht zusammen',
    text: 'Die beiden Quellen widersprechen sich.',
    requiresAll: ['aussage', 'brief']
  }
}
```

Eine Szene mit `accusation: true` zeigt die Beweisauswahl. `evidence` weist Hinweis-IDs interne Gewichte zu. `accusation` definiert Täter-ID, Motivauswahl, Mindestgewicht, Anzahl starker Hinweise, Rückmeldungen und Rückkehrszenen. `results` ist eine geordnete Regelliste aus optionalem `motive`, Wissensbedingungen und `to`; die letzte Regel muss ein bedingungsloser Rückfall sein. Nur bekannte Hinweise zählen; doppelt ausgewählte Hinweise werden nur einmal gewertet. Die Gewichte erscheinen nicht als Punkte.

Die Lehrkräfteinhalte unter `teacher` sind Arrays: `skills`, `teaching`, `solution`, `evidence`, `routes`, `feedback`. Der Bereich zeigt zusätzlich automatisch Figuren und Enden an. Beim Drucken werden Lösungsdetails vorübergehend geöffnet.

## Erster Fall: Lösung und Verzweigungen

**Spoiler:** Jonas nahm die Uhr, um seinen Vorfahren Johann Berger zu entlasten. Martens versteckte das Kästchen selbst, nachdem seine Unterlagen durchsucht worden waren. Johann war an der Kajüte, weil Martens ihn gerufen hatte. Das Geheimfach der Uhr führt zum Porträt, dessen Kompass zur Blickrichtung, diese zur Seekarte mit der 27 und schließlich zu Schrank 27 mit Ankermotiv und hohler Rückwand.

Beobachten wird erst möglich, nachdem Schrank, frische Spuren und Jonas’ unvollendete Zettel eine Rückkehr plausibel machen. Alle Schritte am Schrank und die Beobachtung erfolgen mit Erwachsenen. Ein Besuch bei der Großmutter ist optional und lässt sich nach dem Kästchenfund als Gespräch nachholen.

Enden:

- **Vollständig gelöst:** Kästchen/Logbuch und Familienmotiv selbst erschlossen, Jonas mit ausreichenden Beweisen und richtigem Motiv konfrontiert.
- **Auf frischer Tat:** Frau Winter organisiert die Beobachtung. Hintergründe und Kästchen werden gemeinsam aufgeklärt.
- **Täter richtig, Motiv falsch:** Ausreichende Beweise, aber Verkauf als Motiv vermutet. Das Spiel erklärt den Unterschied.
- **Der Diebstahl ist geklärt:** Ausreichende Beweise, aber historische Spur oder Motiv noch nicht selbst vollständig erschlossen; Jonas erklärt den Rest.
- **Fall vorerst ungelöst:** Erst nach mindestens drei unzureichenden Beschuldigungen und einer zusätzlichen ausdrücklichen Entscheidung, die offenen Spuren zu ignorieren.

Zu frühe falsche und schwache Beschuldigungen sind **keine Enden**. Sie erlauben weitere Ermittlungen. Eine reine Sammlung schwacher Hinweise genügt nie: mindestens zwei starke Hinweise und insgesamt sechs interne Gewichtseinheiten sind erforderlich.

## GitHub Pages

Der Workflow testet jeden Push auf `main`, stellt ausschließlich die statischen App-Dateien zusammen und veröffentlicht das Artifact mit den offiziellen Pages-Actions. Tests, Entwicklungsserver und Repositorymetadaten werden nicht ausgeliefert.

Im Repository unter **Settings → Pages → Build and deployment → Source: GitHub Actions** auswählen, sofern Pages noch nicht aktiviert ist. Danach den Workflow ausführen oder erneut auf `main` pushen. Die voraussichtliche Projektadresse lautet `https://simfischer.github.io/Spurenleser/`; erst ein erfolgreiches Deployment bestätigt die Veröffentlichung. Die App benötigt keine Umgebungsvariablen oder Secrets.

Bei der Einrichtung am 29.10.2026 bestanden die Tests auf GitHub. Das Deployment stoppte bei `configure-pages`, weil Pages für das Repository noch nicht aktiviert war (`Get Pages site failed`, HTTP 404). Nach Auswahl von **GitHub Actions** den Workflow über **Actions → Test and publish GitHub Pages → Run workflow** erneut starten. Die vorbereitete App ist davon unabhängig lokal vollständig spielbar.

## Validierung und technische Zusammenfassung

Die automatisierten Tests durchlaufen alle Storyszenen und alle fünf Endzustände über gültige Spielhandlungen. Sie prüfen Bedingungen, verzögerte Beobachtungsfreigabe, Beweisqualität, falsche/zu frühe Beschuldigungen, Weiterermitteln, Erkenntnisse, Zustandsduplikate, Speichern/Laden, ungültige Speicherstände und verweigerten Speicherzugriff. Beliebig viele zyklische Besuchsreihenfolgen sind nicht einzeln enumerierbar.

Manuell im Chromium-basierten Browser geprüft: Start, Fortsetzen, Notizbuch, persistenter Stand nach Neuladen, Neustart mit Abbruch/Bestätigung, Lehrkräfte-Lösung, schwache und starke finale Beweisauswahl sowie das Ende mit falschem Motiv. Responsive geprüft bei 1024 × 768 (iPad Querformat), 768 × 1024 (Hochformat) und 390 × 844; keine horizontalen Seitenüberläufe. Kein Test auf einem physischen iPad/Safari. Die Lesedauer ist noch nicht im Unterricht evaluiert.

MVP mit Vanilla-JavaScript-ES-Modulen, deklarativen Storydaten, versionierten lokalen Spielständen, nativen Dialogen, eigener Illustration und GitHub-Pages-Workflow. Kein Backend, keine Paketinstallation und kein Produktionsbuild notwendig. Ein Editor ist nicht Bestandteil von Version 1.


## Redesign-Prüfung (29.10.2026)

- Storydatei, Abenteuerkatalog, Engine, State- und Save-Modul bleiben unverändert; kein Speicherschlüssel und keine Speicherformatversion wurde geändert.
- Bestehende Tests für alle Szenen und Enden bestehen weiterhin. Ergänzende Tests prüfen exakte Codeeingabe, Session-Verhalten, gesperrten Sitzungsspeicher sowie bekannte Personeninformationen, Orte und Inventar ohne Zustandsänderung.
- Im Browser geprüft: zunächst keine Lösungsinhalte im DOM, falscher und richtiger Code, Freischaltung nach Neuladen, erneutes Sperren, bestehender Spielstand, Fortsetzen, Journalregister, vollständiger Ermittlungsweg bis zur erfolgreichen Beweisführung.
- Responsive visuell und mit DOM-Breiten geprüft: Desktop 1440 × 900, iPad quer 1024 × 768, iPad hoch 768 × 1024 und Smartphone 390 × 844. Kein physischer Safari-/iPad-Test.
