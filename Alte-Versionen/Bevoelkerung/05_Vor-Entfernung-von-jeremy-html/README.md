# Bevölkerung Deutschlands · 1991–2025

Interaktive Animationen und Dashboard mit Daten zu Bevölkerung, Geburten, Sterbefällen und Wanderung.

## Starten und Einstellungen automatisch speichern

Python 3 wird benötigt; zusätzliche Python-Pakete sind nicht erforderlich.

- **macOS:** `Starten.command` doppelklicken.
- **Andere Systeme / Terminal:** `python3 serve.py` ausführen (unter Windows gegebenenfalls `python serve.py`).

Die lokale Vorschau öffnet sich im Browser. Das Terminal während der Nutzung geöffnet lassen; mit Strg+C beenden.

Alle Änderungen im **E-Menü** werden automatisch in die `index.html` geschrieben: Farben, Hintergrund je Folie, Punktgrößen, Personen pro Punkt, Zeitstrahltempo und der Klang der Balken. Es gibt keine gerätespezifischen Einstellungs-Overrides mehr. Der Speicherstatus steht im E-Menü.

Damit andere Geräte die neuen Werte erhalten: die geänderte `index.html` **committen und pushen**, auf dem anderen Gerät **pullen** und die Vorschau neu laden. Das Programm führt selbst keine Git-Aktionen aus.

Beim direkten Öffnen der HTML-Datei ist automatisches Speichern alternativ in Chrome/Edge nach einmaliger Dateifreigabe möglich. Bei einer gehosteten statischen Vorschau lässt sich das GitHub-Repository nicht direkt aus dem Browser überschreiben; dafür den lokalen Projektstarter verwenden.

## Bedienung

Obere Navigation: Folie neu starten. **E:** Einstellungen (inkl. „Folie neu starten“; auf der Differenzfolie zusätzlich die Auswahl des Balken-Klangs). **Leertaste:** Play/Pause. **A / D:** zurück / weiter. **← / →:** Jahr auswählen und pausieren. Die Differenzfolie wartet auf „Weiter“.

Rohdaten und Quellen: `Data/`. Dashboard: `dashboards/`.

## Aufbau

- `index.html` – Markup und `DEFAULTS` (Projektwerte)
- `css/main.css`, `dashboards/explorer.css` – Gestaltung
- `js/` – Daten, Zustand, Animation, Folien, Einstellungen, Start
- `dashboards/explorer.js`, `dashboards/particle-cloud.js` – Dashboard

## Website-Version

Die einzige Version heißt **Original** (`index.html`, `dashboards/explorer.js`) und basiert auf der bisherigen Jeremy-Version. Die frühere Adresse `jeremy.html` leitet zur Hauptversion weiter.
