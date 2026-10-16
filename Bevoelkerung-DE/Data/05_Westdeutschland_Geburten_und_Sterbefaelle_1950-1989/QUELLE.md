# Westdeutschland vor 1989 – Neugeborene & Sterberate

> **Stand 2026-10-13:** Die Hauptdatei (Lebendgeborene, Gestorbene) wurde durch die Datei von Josua ersetzt (`Geburten_Sterbefaelle_BRD_DDR_Deutschland_1950-2025.csv`, Spalten: Jahr; Gebiet; Lebendgeborene; Gestorbene; Datenherkunft; Hinweis; Quellenlink; Trennzeichen `;`). Abgleich mit der vorherigen Destatis-Zeitreihe (5126107): alle 116 Zeilen identisch. Die DDR-Werte dort sind Destatis „Deutschland minus früheres Bundesgebiet“. Die Originaldatei 5126107 liegt weiter in `Originaldateien/`; weitere Spalten (Raten, Säuglingssterblichkeit) daraus nutzen.


**Dateien**
- `westdeutschland_geburten_sterbefaelle_1950-1989.csv` – frühere Bundesrepublik (einschl. Berlin-West), 1950–1989
- `westdeutschland_geburten_sterbefaelle_1990-2025.csv` – Fortsetzung für Westdeutschland ab 1990

**Quelle:** Destatis, Statistischer Bericht 5126107 (Zeitreihen), Tabelle 126xx-02 „Westdeutschland 1946–2025“.
https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Eheschliessungen-Ehescheidungen-Lebenspartnerschaften/Publikationen/Downloads-Eheschliessungen/statistischer-bericht-ehescheidungen-eheschliessungen-geborene-gestorbene-zeitreihen-5126107.xlsx
Abgerufen am 2026-10-13. Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0; Quellenvermerk: © Statistisches Bundesamt (Destatis), 2026.

| Spalte | Bedeutung |
|---|---|
| Jahr | Berichtsjahr (Kalenderjahr) |
| Gebiet | Gebietsstand, siehe Hinweise |
| Lebendgeborene (+ _maennlich/_weiblich) | Anzahl Lebendgeborene |
| Totgeborene | Anzahl Totgeborene |
| Gestorbene (+ _maennlich/_weiblich) | Anzahl Gestorbene (ohne Totgeborene) |
| Geburtenueberschuss | Lebendgeborene minus Gestorbene (negativ = Sterbeüberschuss) |
| Geburtenrate_je_1000_Einwohner | Rohe Geburtenrate |
| Sterberate_je_1000_Einwohner | Rohe Sterberate |
| Gestorbene_im_1_Lebensjahr | gestorbene Säuglinge |
| Saeuglingssterblichkeit_je_1000_Lebendgeborene | Säuglinge je 1 000 Lebendgeborene |
| Zusammengefasste_Geburtenziffer | Summe der altersspezifischen Geburtenziffern je 1 000 Frauen (15–49 J.), d. h. Kinder je Frau × 1 000; nur wo die Quelle sie ausweist |

**Hinweise**
- Gebietsstand: bis 1989 früheres Bundesgebiet einschl. Berlin-West. Für die Jahre ab 1990 (und für Ehelösungen ab 1995 einschl. Berlin-Ost) siehe die Fußnoten im Original-Excel; die Reihe 1990–2025 ist deshalb nur bedingt mit 1950–1989 vergleichbar.
- Zusammengefasste Geburtenziffer West: durchgehend ab 1950 vorhanden.
