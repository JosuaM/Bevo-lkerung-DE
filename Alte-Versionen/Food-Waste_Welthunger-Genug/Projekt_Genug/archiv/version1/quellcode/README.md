# Zusätzliche Quellen

Der vollständige Website-Code steht in `../website/`. `../auswertung.py` benötigt Python 3 und keine Zusatzpakete.

`animatic.html` und `animatic.js` enthalten die originale Videoanimation. Ein aktueller Chromium-Browser mit MP4-MediaRecorder-Unterstützung kann die Quelle öffnen und die 96-sekündige Aufnahme erzeugen. Für gute MP4-Kompatibilität die Aufnahme anschließend mit FFmpeg ohne Neukodierung remuxen: `ffmpeg -i aufnahme.mp4 -c copy -movflags +faststart final.mp4`. Der fertige Film liegt bereits im Abgabeordner.

`praesentation.mjs` verwendet den gebündelten Codex-Runtimepfad und @oai/artifact-tool. Zur Neugenerierung die am Dateianfang gesetzten Pfade und einen neuen finalen Dateinamen/Prüfnachweis wählen. Die fertige PPTX benötigt diese Entwicklungsumgebung nicht. Native Diagramme enthalten eingebettete Tabellen-Snapshots ihrer dargestellten Daten.

`rechnung_test.cjs` kann mit Node ausgeführt werden. Die Datei liegt hier zur Dokumentation, der ausgeführte Test liegt im ursprünglichen build-Ordner mit passenden relativen Pfaden. `kurs_inventar.json` katalogisiert alle Kursmaterialien, `kurs_materialien_komplett.txt` dokumentiert die Textsichtung.

`serve.py` ist ausschließlich ein lokaler Entwicklungshelfer für die Videoaufnahme. Für die Website ist er unnötig. `paket_erstellen.py` dokumentiert die Paketierung und unabhängige Zahlenprüfung und nutzt die ursprüngliche Arbeitsordnerstruktur.

FFmpeg kam aus dem offiziellen PyPI-Paket imageio-ffmpeg 0.6.0 (FFmpeg 7.1 für Windows). Die Laufzeitpakete werden nicht mit der Abgabe verteilt. Website und Film benutzen keine Fremdmusik oder fremde Illustrationen.
