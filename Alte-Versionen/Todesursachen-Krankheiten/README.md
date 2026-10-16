# Todesursachen und Krankheiten (anderes Projekt)

Ein eigenständiges Projekt aus dem Kurs „3D-Grundlagen“ (Team Jere, Josi, Bambi & Claudio), nicht Teil der Bevölkerungs-Webseite: Wie viele Menschen sterben woran, weltweit und in Deutschland, 1980–2023? Datenquelle: Global Burden of Disease Study 2023 (IHME, Seattle 2024); Bevölkerungszahlen von der Weltbank. Herkunft: die früheren Repositories `3D-grundlagen-Projekt` und `TodesUrsachen-2`.

| Nr. | Ordner | Inhalt |
|---|---|---|
| 1 | [`01_Woche-1_Netzwerk-und-Radial`](01_Woche-1_Netzwerk-und-Radial) | Erste Woche: Liniendiagramm aller Todesursachen, Netzwerk-Ansicht und radiale Ansicht |
| 2 | [`02_Woche-2_Alle-Todesursachen`](02_Woche-2_Alle-Todesursachen) | Zweite Woche: radiale Ansicht mit allen Todesursachen und Zeitstrahl, Netzwerk-Daten |
| 3 | [`03_Woche-2_Rohdaten-Krankheiten`](03_Woche-2_Rohdaten-Krankheiten) | Rohdaten der zweiten Woche (IHME-Downloads, „Level 1 Krankheiten“, Weltbevölkerung) |
| 4 | [`04_Atemwegsinfektionen-und-Tuberkulose`](04_Atemwegsinfektionen-und-Tuberkulose) | Vertiefung Atemwegsinfektionen und Tuberkulose in Deutschland: Altersgruppen-Heatmap und Radialdiagramm |
| 5 | [`05_Todesursachen-1980-2023_Vergleich`](05_Todesursachen-1980-2023_Vergleich) | Helle Variante „Todesursachen“: Auswahl einer Todesursache, Vergleich mit einer zweiten, Altersgruppen im Zeitverlauf, Schalter Global/Deutschland |

Jeder Ordner enthält `Bilder/` mit Screenshots. Aufbau der Daten: `Data/` (CSV aus IHME) und `tools/` bzw. `build_data.py` (Skripte, die die Daten für die Seiten aufbereiten).

Am besten über einen lokalen Server öffnen: im jeweiligen Ordner `python3 -m http.server` ausführen.
