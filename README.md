# Spurenleser

**Interaktive Leseabenteuer · Lies genau. Sammle Hinweise. Löse den Fall.**

Statische Web-App für Klasse 5/6 mit einem vollständigen ersten Fall: **Der Fall der verschwundenen Taschenuhr**. Eine maritime Museumsgeschichte mit vier Akten, verzweigten Gesprächen, Quellenvergleich, Notizbuch, Inventar, automatischen Erkenntnissen und finaler Beweisführung. Eigenständige SVG-Illustrationen, ohne Bilddienste, externe Schriften, Accounts, KI, API, Musik oder Laufzeitabhängigkeiten.

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
data/adventures.js         Abenteuerkatalog
data/taschenuhr.js         Vollständiger Fall einschließlich Lösung und Regeln
assets/                    Eigene, austauschbare SVG-Illustrationen
scripts/serve.mjs          Lokaler Entwicklungsserver
tests/engine.test.mjs      Spielwege und Zustandslogik
.github/workflows/pages.yml Tests und GitHub-Pages-Deployment
```

Die Storydaten enthalten Texte, Figuren, Orte, Inventar, Erkenntnisse, Voraussetzungen, Beweisgewichte, Motive, Abschlussregeln und Lehrkräfteinformationen. Die Engine enthält keine Namen oder festen Wahrheiten des ersten Falls. Darstellung erfolgt als Text mit HTML-Escaping. Sämtliche Ressourcenpfade sind relativ und funktionieren unter `/Spurenleser/`.

## Bedienung und Spielstand

- Auf der Startseite einen Fall öffnen. Ein vorhandener Spielstand kann fortgesetzt werden; ein Neustart benötigt eine Sicherheitsabfrage.
- Notizbuch: Hinweise, Personen, Erkenntnisse und Orte. Inventar als eigener Drawer. Neue Erkenntnisse werden zusätzlich kurz angekündigt, bleiben aber dauerhaft im Notizbuch.
- Nach jeder Entscheidung wird automatisch auf diesem Gerät gespeichert. Auch abgeschlossene Fälle bleiben lesbar. Leseeinstellungen werden getrennt gespeichert.
- Kein Zurückspulen von Entscheidungen. Die URL enthält nur die Ansicht, keine Szenen-ID. Erneute Ortsbesuche sind bewusste Handlungen in der Geschichte. Der Browser-Zurück-Knopf stellt keinen früheren Spielzustand her.
- Große Schrift über `AA` oder das Menü. Optionales Leselineal folgt Maus/Finger; Textabsätze sind bei aktiviertem Lineal per Tab fokussierbar. Dialoge unterstützen Escape, Fokusbegrenzung und einen Schließen-Button. Bewegungen folgen `prefers-reduced-motion`.
- Kann der Browser nicht speichern, erscheint eine Meldung; die App bleibt innerhalb der geöffneten Sitzung spielbar. Beschädigte oder inkompatible Speicherstände werden verworfen.
- Ein Spielstand ist kein manipulationssicheres Prüfungsformat. Browserdaten löschen oder ein anderer Browser setzen den Fortschritt zurück. Keine Synchronisation zwischen Geräten und kein garantierter Offline-Neustart; es gibt bewusst keinen Service Worker.
- Auf gemeinsam genutzten Geräten im Menü **Spielstand von diesem Gerät löschen** verwenden. Keine Namen, E-Mails, Schülerkennungen oder Lesehistorien werden erfasst. Hostinganbieter können technische Zugriffsprotokolle führen.

## Einen neuen Fall ergänzen

1. Neue ES-Modul-Datei unter `data/` anlegen, etwa `data/neuer-fall.js`. `taschenuhr.js` dient als vollständiges Schema. IDs sind innerhalb eines Falls eindeutig; IDs von Hinweisen, Erkenntnissen, Orten, Personen, Inventar und Flags dürfen nicht miteinander kollidieren.
2. Den Fall in `data/adventures.js` importieren und zum Array hinzufügen. Die Übersicht rendert daraus automatisch Karten; Spielstände verwenden die unveränderliche Abenteuer-ID als Namensraum. `title`, `level`, `duration`, `genre` und `teaser` beschreiben die Karte. Die vorhandenen Illustrationen sind vorläufige Standardmotive; für eine neue Bildwelt das Asset-Mapping in der Oberfläche ergänzen.
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
