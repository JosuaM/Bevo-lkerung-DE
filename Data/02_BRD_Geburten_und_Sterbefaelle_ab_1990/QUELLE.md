# BRD / Deutschland – Neugeborene & Sterberate ab 1990

> **Stand 2026-10-13:** Die Hauptdatei (Lebendgeborene, Gestorbene) wurde durch die Datei von Josua ersetzt (`Geburten_Sterbefaelle_BRD_DDR_Deutschland_1950-2025.csv`, Spalten: Jahr; Gebiet; Lebendgeborene; Gestorbene; Datenherkunft; Hinweis; Quellenlink; Trennzeichen `;`). Abgleich mit der vorherigen Destatis-Zeitreihe (5126107): alle 116 Zeilen identisch. Die DDR-Werte dort sind Destatis „Deutschland minus früheres Bundesgebiet“. Die Originaldatei 5126107 liegt weiter in `Originaldateien/`; weitere Spalten (Raten, Säuglingssterblichkeit) daraus nutzen.

> Die frühere Reihe „Deutschland 1950–1989 = BRD + DDR“ wurde entfernt; sie ergibt sich aus der Summe der Ordner 01 und 05.


**Datei:** `deutschland_geburten_sterbefaelle_1990-2025.csv` (76 Jahre, lückenlos)

**Quelle:** Destatis, Statistischer Bericht 5126107 (Zeitreihen), Tabelle 126xx-b02 „Geborene und Gestorbene, Deutschland 1946–2025“.
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
- **1950–1989 = Summe aus Bundesrepublik und DDR** (Gebiet „Deutschland“ im heutigen Gebietsstand); ab 1990 das vereinte Deutschland. Geprüft: für 1950–1989 gilt Deutschland = Westdeutschland + DDR (Differenz 0).
- Nur BRD allein vor 1990: siehe Ordner `05_Westdeutschland_Geburten_und_Sterbefaelle_1950-1989`.
- Zusammengefasste Geburtenziffer gesamt wird von Destatis erst ab 1990 ausgewiesen; davor siehe Ordner 07 (West/Ost getrennt).
- Gegenprobe Eurostat (demo_gind, DE_TOT): Lebendgeborene 1960–2025 identisch; Gestorbene identisch außer 1987 (Eurostat +567).
