# Bevölkerung Deutschlands 1991–2025

Uni-Projekt: Konnte die Ein- und Auswanderung Deutschlands Geburtendefizit ausgleichen? Eine animierte Webseite mit Punkten, einer Differenz-Folie, einem Ergebnis und einem interaktiven Dashboard.

## Ordnerstruktur

| Ordner | Inhalt |
|---|---|
| [`Bevoelkerung-DE`](Bevoelkerung-DE) | **Die aktuelle, finale Webseite** mit Rohdaten (`Data/`), Starter und Anleitung |
| [`Alte-Versionen`](Alte-Versionen) | Frühere Stände für die Präsentation „Wie sind wir hierher gekommen?“ |
| &nbsp;&nbsp;↳ [`Bevoelkerung`](Alte-Versionen/Bevoelkerung) | Vier Entwicklungsstufen dieser Webseite, mit Bildern jeder Folie |
| &nbsp;&nbsp;↳ [`Todesursachen-Krankheiten`](Alte-Versionen/Todesursachen-Krankheiten) | Anderes Projekt: Todesursachen weltweit und in Deutschland, 1980–2023 |
| &nbsp;&nbsp;↳ [`Food-Waste_Welthunger-Genug`](Alte-Versionen/Food-Waste_Welthunger-Genug) | Anderes Projekt „Genug?“: Food Waste und Welthunger |

## Starten

Im Ordner `Bevoelkerung-DE` auf dem Mac `Starten.command` doppelklicken oder im Terminal `python3 serve.py` ausführen. Details und Bedienung stehen in [`Bevoelkerung-DE/README.md`](Bevoelkerung-DE/README.md).

## Veröffentlichen mit GitHub Pages

Bei jedem Push auf `main` veröffentlicht der Workflow `.github/workflows/pages.yml` nur die Webseite (`index.html`, `css`, `js`, `dashboards` aus `Bevoelkerung-DE`). Alte Versionen, Rohdaten und Hilfsdateien bleiben unveröffentlicht. Einmalig in den Repository-Einstellungen unter **Settings → Pages → Source** den Eintrag **GitHub Actions** wählen. Die Seite liegt danach unter `https://josuam.github.io/Bevo-lkerung-DE/`.
