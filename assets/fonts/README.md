# Lokal ausgelieferte Buchschriften

Die App lädt keine Schriften von externen Diensten zur Laufzeit. Alle vier WOFF2-Dateien werden zusammen mit der App ausgeliefert. `font-display: swap` und lokale Ersatzschriften halten die Oberfläche auch bei fehlenden Fontdateien lesbar.

| Verwendung | Schrift | Gewichte | Quelle und Lizenz |
| --- | --- | --- | --- |
| Logo, Archivangaben, Register | Cinzel | 500–700, variabel | [Cinzel Project](https://github.com/NDISCOVER/Cinzel), [mitgelieferte OFL](Cinzel-OFL.txt) |
| Kapitel, Lesetext, Notizen, Beschriftungen | Literata | 400–600, variabel; optische Größe automatisch | [Literata Project](https://github.com/googlefonts/literata), [mitgelieferte OFL](Literata-OFL.txt) |

Beide Schriften stehen unter der SIL Open Font License 1.1. Die vollständigen Copyright- und Lizenztexte liegen unverändert bei. Die Schriftdateien wurden nicht bearbeitet; nur die lokalen Dateinamen sind lesbarer benannt.

Bezugsquelle am 30.10.2026: offizielle Google-Fonts-CSS-Ausgabe für `Cinzel:wght@500..700` und `Literata:opsz,wght@7..72,400..600`, jeweils lateinischer und erweitert lateinischer Zeichensatz. Die vier Dateien umfassen zusammen 196.920 Bytes. Deutsche Umlaute, ß und die verwendeten typografischen Satzzeichen sind im lateinischen Paket enthalten; weitere lateinische Zeichen nutzen das ergänzende Paket.

Originaldateien:

- `cinzel-latin.woff2`: `https://fonts.gstatic.com/s/cinzel/v26/8vIJ7ww63mVu7gt79mT7.woff2`
- `cinzel-latin-ext.woff2`: `https://fonts.gstatic.com/s/cinzel/v26/8vIJ7ww63mVu7gt7-GT7LEc.woff2`
- `literata-latin.woff2`: `https://fonts.gstatic.com/s/literata/v40/or3PQ6P12-iJxAIgLa78DkTtAoDhk0oVpaK3YLanFLHpPf2TbLi4J_HWTA.woff2`
- `literata-latin-ext.woff2`: `https://fonts.gstatic.com/s/literata/v40/or3PQ6P12-iJxAIgLa78DkTtAoDhk0oVpaK3YLanFLHpPf2TbLi4J__WTFCW.woff2`

Fallbacks: für Titel `Palatino Linotype`, `Palatino`, `serif`; für Lesetext `Book Antiqua`, `Palatino Linotype`, `serif`. Es gibt keine Systeminstallation und keine neue Paketabhängigkeit.
