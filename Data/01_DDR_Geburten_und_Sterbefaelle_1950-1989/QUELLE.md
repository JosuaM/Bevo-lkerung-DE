# DDR – Neugeborene & Sterberate 1950–1989

> **Stand 2026-10-13:** Die Hauptdatei (Lebendgeborene, Gestorbene) wurde durch die Datei von Josua ersetzt (`Geburten_Sterbefaelle_BRD_DDR_Deutschland_1950-2025.csv`, Spalten: Jahr; Gebiet; Lebendgeborene; Gestorbene; Datenherkunft; Hinweis; Quellenlink; Trennzeichen `;`). Abgleich mit der vorherigen Destatis-Zeitreihe (5126107): alle 116 Zeilen identisch. Die DDR-Werte dort sind Destatis „Deutschland minus früheres Bundesgebiet“. Die Originaldatei 5126107 liegt weiter in `Originaldateien/`; weitere Spalten (Raten, Säuglingssterblichkeit) daraus nutzen.


**Dateien**
- `ddr_geburten_sterbefaelle_1950-1989.csv` – DDR, jährlich 1950–1989 (40 Jahre, lückenlos)
- `ostdeutschland_geburten_sterbefaelle_1990-2025.csv` – Fortsetzung für Ostdeutschland/neue Länder 1990–2025 (nur falls du über 1989 hinaus vergleichen willst; die DDR gab es nicht mehr)

**Quelle:** Statistisches Bundesamt (Destatis), Statistischer Bericht „Ehescheidungen, Eheschließungen, Geborene und Gestorbene – Zeitreihen“ (5126107), Tabelle 126xx-03 „Ostdeutschland 1946–2025“, Stand 2026.
https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Eheschliessungen-Ehescheidungen-Lebenspartnerschaften/Publikationen/Downloads-Eheschliessungen/statistischer-bericht-ehescheidungen-eheschliessungen-geborene-gestorbene-zeitreihen-5126107.xlsx
Abgerufen am 2026-10-13. Lizenz: Datenlizenz Deutschland – Namensnennung – Version 2.0; Quellenvermerk: © Statistisches Bundesamt (Destatis), 2026.

**Gegenprobe:** Destatis übernimmt für die DDR-Jahre die amtlichen Zahlen des Statistischen Jahrbuchs der DDR. Lebendgeborene und Gestorbene 1950–1989 wurden gegen Jahrbuch 1990, S. 64 geprüft (`Originaldateien/ddr_statistisches_jahrbuch_1990_seite_064_kontrolle.pdf`): 39 von 40 Jahren identisch; 1951 Lebendgeborene 310 772 (Destatis, revidiert) statt 310 777 (Jahrbuch).

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
- „Ostdeutschland“ = bis 1989 DDR einschl. Berlin (Ost). Ab 1990 Gebietsstand der Quelle (neue Länder; Zuordnung Berlin siehe Fußnoten im Original-Excel).
- Zusammengefasste Geburtenziffer DDR: erst ab 1952 ausgewiesen (1950/51 leer); Altersbereich 15–44/45 Jahre bis 1989, ab 1990 15–49.
- Rohdatei mit allen Fußnoten: `Originaldateien/`.
