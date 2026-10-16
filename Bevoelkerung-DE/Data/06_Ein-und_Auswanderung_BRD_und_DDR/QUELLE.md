# Ein- und Auswanderung (BRD und DDR zusammen)

**Dateien**
- `wanderungen_ueber_die_grenzen_1950-2025.csv` – Zu- und Fortzüge über die Grenzen (Ausland), jährlich 1950–2025, nach Deutschen/Nichtdeutschen
- `eurostat_nettowanderung_deutschland_gesamt_1960-2025.csv` – Nettowanderung für **Deutschland gesamt (vor 1991 BRD + DDR zusammen)**, 1960–2025

**Quellen**
1. Destatis, Statistischer Bericht „Wanderungen“ 2025 (2010120257005), Tabelle 12711-02 „Wanderungen über die Grenzen Deutschlands nach Nationalität 1950 bis 2025“:
   https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Wanderungen/Publikationen/Downloads-Wanderungen/statistischer-bericht-wanderungen-2010120257005.xlsx
2. Eurostat, Tabelle demo_gind (Demographic balance and crude rates), Geo DE_TOT: https://ec.europa.eu/eurostat/databrowser/view/demo_gind
Abgerufen am 2026-10-13.

**Wichtige Einschränkung:** Die amtliche Wanderungsstatistik des Statistischen Bundesamtes weist für 1950–1990 nur die **Bundesrepublik (West)** aus; die DDR-Außenwanderung ist nicht als Jahresreihe veröffentlicht, und Übersiedlungen DDR↔BRD sind darin nicht enthalten. Ab 1991 = Deutschland insgesamt. Die Eurostat-Datei deckt BRD + DDR zusammen ab, ist aber ein Saldo (Bevölkerungsveränderung minus natürlicher Saldo, inkl. statistischer Korrektur), keine getrennte Zu-/Fortzugszählung.

**Spalten Datei 1:** Zuzuege_aus_dem_Ausland / Fortzuege_in_das_Ausland / Wanderungssaldo_Ausland, je _insgesamt, _Deutsche, _Nichtdeutsche. Leere Zellen = nicht ausgewiesen (Aufteilung nach Nationalität erst ab 1954).
**Spalten Datei 2:** Bevoelkerung_1_Januar, Lebendgeborene, Gestorbene, Natuerlicher_Saldo, Nettowanderung_inkl_statist_Korrektur, Nettowanderung_je_1000_Einwohner, Bevoelkerungsveraenderung_gesamt (Jahr = Berichtsjahr, Bevölkerung zum 1.1.).

**Hinweise (Original-Fußnoten):** 1950–56 ohne Saarland; bis 1974 ohne ehemalige Ostgebiete; 2008–2010 Melderegisterbereinigungen; 2016 methodische Umstellung; 2019/2024 Abmeldungen von Amts wegen (Europawahl) → Fortzüge erhöht; 2022 Fluchtmigration aus der Ukraine. Eurostat: Die Spalte Bevoelkerung_1_Januar springt zwischen 2010 und 2011 um rund −1,5 Mio. (Zensus 2011, Methodeneffekt); Natuerlicher_Saldo, Nettowanderung und Bevoelkerungsveraenderung sind davon nicht betroffen.
