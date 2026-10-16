# Genug? – Projektdokumentation

## Fragestellung und Ziel

Könnte verschwendetes Essen den Welthunger stillen? Die interaktive Datenreise beantwortet die Frage als transparentes theoretisches Energieexperiment für die Welt im Jahr 2022. Sie spricht interessierte Besucher ohne Vorwissen an. Sie führt von Verlustmengen über produktbezogene Kalorienfaktoren zur frei veränderbaren Rettungsannahme. Die Kernaussage bleibt bedingt: erhebliche Modellenergie, unbekannte globale Rettbarkeit und keine automatische Hungerbekämpfung.

## Vollständige Sichtung und Auswahl der Daten

Die beiden großen normalisierten Originaldateien wurden vollständig zeilenweise gelesen. Die Originale bleiben unverändert, zusätzliche Kopien liegen in `originaldaten/`. Zählung und strukturbezogene Prüfungen erfassen alle Zeilen. Die inhaltliche Berechnung und Eindeutigkeitsprüfung beziehen sich auf die ausgewählten World/2022-Zeilen. Eine inhaltliche Validierung sämtlicher Länderwerte wird nicht behauptet.

| Datensatz | Originalzeilen | Bereiche | Produkt-/Indikatortitel | Fehlende Value-Felder | World 2022-Zeilen |
|---|---:|---:|---:|---:|---:|
| Food Balances | 4.820.497 | 213 | 123 | 0 | 2195 |
| Food Security | 287.735 | 246 | 68 | 40603 | 75 |

Bereiche umfassen auch aggregierte Regionen. World wird direkt aus Code 5000 gelesen, nicht durch Addieren von Ländern und Regionen erzeugt. Jahr 2022 ist ein Kalenderjahr, kein dreijähriger Durchschnitt. Die Food-Balances-Datei deckt 2010–2023 ab. Die Food-Security-Datei enthält Jahreswerte und dreijährige Perioden, die getrennt behandelt werden. Alle Jahre, Einheiten, Elemente, Flags und Häufigkeiten stehen im maschinenlesbaren Prüfnachweis.

Die vorliegende FBS-ItemCodes-Datei enthält lediglich die Kopfzeile. Deshalb gewinnt die Auswertung die tatsächlich vorhandenen Titel direkt aus der normalisierten Hauptdatei und speichert eine vollständige Itemliste. Die verwendeten Produktcodes sind explizit und disjunkt zugeordnet. Gruppensummen (29xx) werden nicht zusätzlich zu ihren Einzeltiteln addiert. Die Gruppenprüfung toleriert nur Abweichungen aus der Rundung der Ausgangsmengen.

Für das Modell ergeben sich 98 Einzeltitel. 73 besitzen geeignete Faktoren. Für 16 Titel fehlen Losses-Zeilen. Fehlende Werte bleiben in der Faktorentabelle leer bzw. null und werden nicht als gemessene Null dargestellt. Die Summe 644,356 Mio. t ist die Summe erfasster Verlustwerte, keine Behauptung vollständiger Messung aller Lebensmittelverluste.

Die Flags der ausgewählten globalen FBS-Werte sind E (Estimated). Die Hungerzahl und der Bedarfswert sind ebenfalls Schätzwerte. Die Datenbasis ist keine direkte globale Messung jedes verlorenen Kilogramms. Ohne geeignete Unsicherheitsangaben wurde kein statistisches Konfidenzintervall konstruiert. Die Regler zeigen Szenario- und Nenner-Sensitivität.

## Explorative Datenanalyse

Absolute Masse und Energie führen zu anderen Rangfolgen. Getreide macht rund 21,1 % der erfassten Masse aus, aber 57,1 % der Modellenergie. Große Mengen wasserreichen Gemüses tragen weniger Energie pro kg. Zuckerpflanzen dominieren die Masse mit, bleiben wegen zusätzlicher Verarbeitung in dieser Rechnung ohne Energieansatz. So wird eine scheinbar naheliegende Umrechnung „alle Tonnen mal ein Durchschnittsfaktor“ als ungeeignet erkennbar.

| Gruppe | Erfasste Mio. t | Anteil Masse % | Modellenergie Bio. kcal | Anteil Energie % | Fehlende Losses-Titel |
|---|---:|---:|---:|---:|---:|
| Getreide | 136,1 | 21,1 | 383,1 | 57,1 | 0 |
| Ölpflanzen | 55,9 | 8,7 | 79,9 | 11,9 | 0 |
| Wurzeln & Knollen | 87,4 | 13,6 | 74,4 | 11,1 | 0 |
| Obst | 73,9 | 11,5 | 38,2 | 5,7 | 0 |
| Gemüse | 114,3 | 17,7 | 30,7 | 4,6 | 0 |
| Milch | 26,5 | 4,1 | 18,9 | 2,8 | 0 |
| Hülsenfrüchte | 5,2 | 0,8 | 16,9 | 2,5 | 0 |
| Tierische Fette | 1,3 | 0,2 | 8,9 | 1,3 | 2 |
| Eier | 4,8 | 0,7 | 6,1 | 0,9 | 0 |
| Pflanzenöle | 0,4 | 0,1 | 3,4 | 0,5 | 0 |
| Fleisch | 1,7 | 0,3 | 2,9 | 0,4 | 0 |
| Gewürze | 0,9 | 0,1 | 2,5 | 0,4 | 0 |
| Innereien | 1,8 | 0,3 | 2,4 | 0,4 | 0 |
| Nüsse | 1,0 | 0,2 | 1,6 | 0,2 | 0 |
| Kaffee, Kakao & Tee | 1,3 | 0,2 | 1,0 | 0,2 | 0 |
| Zucker & Honig | 0,2 | 0,0 | 0,4 | 0,1 | 0 |
| Zuckerpflanzen | 131,6 | 20,4 | 0,0 | 0,0 | 0 |
| Alkohol | 0,2 | 0,0 | 0,0 | 0,0 | 2 |
| Fisch & Meeresfrüchte | 0,0 | 0,0 | 0,0 | 0,0 | 8 |
| Wasserpflanzen & Meeressäuger | 0,0 | 0,0 | 0,0 | 0,0 | 2 |
| Sonstiges | 0,0 | 0,0 | 0,0 | 0,0 | 2 |

Bei vollständig fehlenden Losses-Titeln ist 0 in der Summenrechnung eine leere Teilsumme, kein gemessener Wert. Die Website zeigt diese Gruppen als „k. A.“ und erläutert den Grund. 0 Modellenergie bei ausgeschlossenen Titeln bedeutet ebenfalls keinen Nachweis von Kalorienfreiheit.

## Quellenabgrenzung

FBS-Losses umfasst die Phase nach der Ernte bis vor dem Einzelhandel, laut FAO Guidelines 2017, S.16. Vorernte- und Ernteverluste fehlen. Technische Verarbeitungsverluste stecken in Umrechnungs-/Ausbeuteraten. Feed, Seed, Other uses und Food sind eigene Kategorien. FBS-Mengen können Primäräquivalente und nicht essbare Teile enthalten.

UNEP 2024 schätzt global 2022 1.052 Mio. t Food Waste, einschließlich nicht essbarer Teile: 631 in Haushalten, 290 in Gastronomie und 131 im Handel. Diese Zahlen bleiben als eigener Mengenblock sichtbar. Sie fließen nicht in die Kalorienrechnung ein, weil eine passende globale Produktzusammensetzung fehlt. Unterschiedliche Mengenbasen verhindern eine unkritische gemeinsame Prozentrechnung. Die lokale OWID-Datei mit Welt 2022 16,45 /36,34 /79,12 kg pro Kopf dient nur zur Plausibilisierung dieser Größenordnung. Datenrevision 31. Juli 2026 und Download 5. Oktober 2026 sind dokumentiert.

## Modell und Einheiten

Für jeden passenden Einzeltitel:

```
kcal/kg = Food supply (million kcal) / Food (1000 t)
Verlustenergie kcal = Losses (1000 t) × 1.000.000 × kcal/kg
Jahresrationen = Summe Verlustenergie × Rettungsanteil / (kcal/Tag × 365)
```

Million kcal und 1000 t enthalten dieselbe Größenordnung von einer Million in kcal bzw. kg. Die Division liefert daher direkt kcal/kg Bilanzmasse. Der Faktor stammt aus passender FBS-Food-Menge und Food-Energie, nicht aus dem Nahrungsangebot pro Kopf allein. Die FAO beschreibt interne Kalorienfaktoren ausdrücklich bei der Standardisierung. Verarbeitung und Primäräquivalente bleiben zur Bilanzform passend. Ein zusätzlicher pauschaler Essbarkeitsfaktor wäre hier eine zweite Korrektur.

**Entscheidende Annahme:** Rechtzeitig vermiedene oder vor dem Verderb gerettete Verluste hätten das gleiche Energie- und Ausbeuteprofil wie die Food-Versorgung desselben Titels. Selektive Verluste, Wasserverlust und andere Produktmischungen können diese Näherung verzerren. Die Werte sind keine direkt gemessenen Verlustkalorien. Ein 100-%-Szenario ist die Rechengrenze innerhalb dieser Modellannahme, keine physikalisch belegte Obergrenze über alle möglichen Verluste.

Zuckerrohr, Zuckerrüben, Baumwollsaat, Palmkerne, Kaffee, Tee und Alkohol sind ausgeschlossen. Je nach Titel fehlen geeignete Food-Nenner oder die direkte Ernährungsnutzung passt nicht. Alle Einzelgründe stehen in `website/daten/verlust_faktoren.csv`. Aus 644,356 Mio. t erfasster Masse gehen 481,187 Mio. t in die Energieberechnung ein, also 74,677 %. Das ist keine essbare Quote aller Abfälle.

## Vergleich mit Hunger

FAOSTAT Food Security, World 2022: jährliche Zahl Unterernährter 687,6 Mio., Prävalenz 8,6 %, durchschnittlicher Energiebedarf 2371 kcal/Tag. 210010 ist die jährliche Zahl, 21057 der Bedarf. Der Mindestbedarf 1833 kcal/Tag wird dokumentiert, aber nicht als Hauptergebnis-Nenner verwendet.

Unterernährte Menschen nehmen bereits Nahrung zu sich. Die Zahl der Menschen kann deshalb nicht einfach in ein gemessenes Kaloriendefizit übersetzt werden. Der Vergleich verwendet vollständige Jahresrationen, die den vollen Referenzbedarf eines Jahres darstellen. Ein individueller Bedarf, eine ausgewogene Ernährung oder reale Lieferung werden damit nicht behauptet.

| Szenario | kcal/Tag | Jahresrationen Mio. | Verhältnis zur Vergleichszahl % |
|---|---:|---:|---:|
| 25 % Rettung | 2371 | 193,9 | 28,2 |
| 50 % Rettung | 2371 | 387,8 | 56,4 |
| 100 % Rettung | 2371 | 775,6 | 112,8 |
| 100 % Rettung | 3000 | 613,0 | 89,2 |

671,252143450916 Billionen kcal ergeben beim Hauptnenner 775,64191 Mio. Jahresrationen. Die Vergleichsschwelle liegt bei 88,64916 % Rettung. 50 % ist ein freier Startwert. Keine Studie belegt diese globale Quote. Im Experiment ignorieren wir Kosten und weitere Verluste bei Verteilung. Nährstoffqualität und Lebensmittelsicherheit sind offene Bedingungen.

## Forschungsstand und Quellenprüfung

Die Recherchedatei enthält 22 strukturierte Evidenzzeilen, Quellenstellen und Übertragungsgrenzen. Die geprüfte starke Evidenz bestimmt keinen universellen biologischen Mindestverlust. Die Aussage folgt aus der betrachteten Evidenz und ist kein mathematischer Beweis, dass ein Mindestverlust grundsätzlich nicht existiert.

REFOWAS 2021 liefert kultur- und regionsspezifische Interviews. Maislagerung im randomisierten kenianischen Versuch: 1,7 % traditionelle Lagerung gegenüber 0,4 % insektenbedingtem Gewichtsverlust nach vier Monaten in hermetischen Beuteln. Die rund 76 % relative Reduktion betrifft ausschließlich diesen Versuch und diese Verlustart. Original-Abstract geprüft, Volltext nicht geprüft. Kühlkettenmodelle und britische Essbarkeit werden nicht global als feste Quote angewandt. WRAP 2022 wurde 2025 revidiert. Die Gatto/Chepeliev-Tabelle enthält 2004/2007/2011/2014, kein 2022.

Die gesicherte EU-PDF-Kopie von UNEP 2024 überspringt die gedruckten Seiten XII–XIII. Tabelle 1 und Fußnote wurden über den indexierten offiziellen Originalzugang geprüft. Die lokale PDF-Kopie enthält diese Tabelle nicht. Alle Einschränkungen stehen im Recherche-README.

## Gestaltung und Umsetzung

Der Titel „genug?“ stellt die Frage vor die Antwort. Papierfarbe, ruhige Serifenschrift und viel Abstand unterstützen die Lesereihenfolge. Grün codiert Modellenergie und Szenarien, Orange die Vergleichszahl. Farbe allein trägt keine Aussage: Beschriftungen und Zahlen stehen daneben. Die Tellerillustration ist atmosphärisch und hat keine Datenskala. Balken starten bei null, die Punktdarstellung nutzt die gleiche Punktmenge für beide Reihen und zeigt die Einheit an.

Die Dramaturgie führt durch Menge, Energie, eigenes Szenario und Einordnung. Die Methoden sind direkt am Modell verfügbar. Keine Serverpflicht: `daten.js` lädt einen vorbereiteten Datengegenstand als normales Skript. Relative CSS-/JS-/Datenlinks funktionieren mit dem Website-Ordner. Browserinteraktionen nutzen native HTML-Regler und Buttons für Tastatur, Maus und Touch. Die geführte Tour ist stoppbar. `prefers-reduced-motion` deaktiviert die gezeichnete Bewegung und die Übergänge.

Objektorientierung: `ScenarioModel` kapselt die Rechenannahmen und das Ergebnis. `FoodGroup` hält Produktdaten, Auswahlzustand und Darstellung. `GroupChart` kontrolliert Maßstab, Sortierung und Details. DOM-Events decken Hover/Fokus, Auswahl und Regler ab. `requestAnimationFrame` zeichnet die Tellerbewegung und interpoliert Änderungen der Rationspunkte. Vererbung wurde nicht künstlich eingeführt, da hier keine fachlich nötige Klassenhierarchie entsteht.

## Kursmaterialien und Anforderungen

Die tatsächlich vorliegenden Materialien liegen in `Data Projekt/2026 WS (public)`. Alle 285 Dateien sind inventarisiert. Relevante Folien und Beispiele wurden nach Themen gesichtet, PDF-Text und eigene HTML/JS-Beispiele extrahiert. Bibliotheken und IDE-Konfigurationen sind als Bestand erfasst. Der Kurs verbindet Datenobjekte, CSV/JSON, Ereignisse, Regler und zeitliche Animation.

| Kursinhalt bzw. Abgabeanforderung | Umsetzung |
|---|---|
| Day 1: Daten, Information, Wissen, Datenobjekte | Rohdaten, Modellannahme und Interpretation getrennt. Klassen mit Daten/Zustand/Verhalten. |
| Day 2: Hover, Auswahl, Dragging, GUI | Produktdetails bei Hover/Fokus, Klickauswahl, native veränderbare Regler, Toursteuerung. |
| Day 3: CSV und absolute/relative Werte | Streaming-Auswertung, Faktorentabelle, Produktanteile, Vergleichsverhältnis. |
| Day 4: JSON und Objektlisten | Vorberechnetes JSON und Produktobjekte, IDs, vollständige Datenexports. |
| Day 5: Zeit und Animation | Echtzeitreaktion der Regler, gezeichnete Bewegung, Tour und 96-s-Animatic. Jahresauswertung bewusst auf 2022 begrenzt. |
| Vollständige kohärente explorative Datenanalyse | Originaldateizählung, Jahre/Flags/Einheiten, Gruppenprüfung, fehlende Werte und Tabellen oben. |
| Fragestellung und verständliche Interaktion | Frage als Einstieg, gezielte Kapitel, Bedingung als Ergebnis. |
| Demonstration und Präsentation | Offlinewebsite und neun Folien mit Sprechernotizen. |
| MP4 höchstens zwei Minuten | Geprüfte finale Datei 96,00 s, 720p, H.264, keine Musik. |
| Quellen, Quellcode und Daten | Originaldatenkopien, SHA256, vollständiger Website-Code und zusätzliche Quellen. |
| Bilder und Skizzen | Bearbeitbare SVG-Skizzen, Screenshots, Film- und Folienbilder, Storyboard. |
| Hochschule, Semester, Lehrender, Studierende | Hochschule,WS 2026,Prof. Dr. Franklin Hernández-Castro enthalten. Namen auf ausdrücklichen Wunsch offen. |
| Teamfoto mit Namen | Noch zu ergänzen. Kein echtes Foto lag vor, keines erfunden. |

## Reproduzierbarkeit und Qualitätsprüfung

`auswertung.py` nutzt die Python-Standardbibliothek. Es liest die unveränderten Kopien, wählt World 2022, prüft eindeutige Schlüssel und disjunkte Titel, erzeugt CSV/JSON und die eingebettete Browserdatendatei. Die Originaldateien sind per SHA256 identifiziert. Eine erneute vollständige Ausführung auf den Kopien lieferte dieselben Modellwerte. Die Energieberechnung wurde zusätzlich mit Decimal-Arithmetik unabhängig aus den Original-Weltzeilen nachgerechnet.

Szenarioprüfung:0 %,25 %,50 %,100 %, Vergleichsschwelle, 1800/3000 kcal, ungültige Eingaben, fehlende Losses und Summen wurden geprüft. Im Browser bestätigt:100 %=775,6 Mio.;0 %=0;3000 kcal+100 %=613,0 Mio.;Reset=387,8 Mio. Maßstabswechsel, Produktwahl und unbekannte Fischverluste funktionieren. Keine JavaScript-Fehler beobachtet. Mobile Darstellung im 390 px-Testframe,375 px Inhaltsbreite einschließlich Scrollbar, ohne horizontalen Überlauf. Desktop geprüft.

Der In-App-Browser blockiert direkte file-URLs. Deshalb ist der Browserfunktionstest lokal über HTTP durchgeführt, nicht als tatsächlicher file-Protokolltest. Die Website nutzt keine Netzwerk-Datenabfragen oder externen Bibliotheken und ist für den Doppelklickstart konzipiert. Browser-Sicherheitsregeln wurden nicht umgangen.

Die Präsentation besteht Paket-, Geometrie-, Schrift-, Diagrammdaten- und Importprüfungen. Drei Diagramme sind nativ editierbar mit eingebetteten Daten-Snapshots. Alle neun finalen Folien wurden einzeln visuell geprüft. Das ist keine native PowerPoint-Öffnungsprüfung. Die MP4 wurde vollständig mit FFmpeg decodiert, auf 96,00 s kontrolliert und an sechs Szenen visuell geprüft. Der Container wurde ohne neue Bildkodierung finalisiert.

## Ausblick

Für eine empirische Vermeidbarkeitsrechnung wären stufen-, produkt- und regionsspezifische Verlustzusammensetzungen und Maßnahmen nötig. Eine genaue Hunger-Lückenrechnung braucht Angaben zur Verteilung der Nahrungsaufnahme und zum jeweiligen Defizit. Die vorhandenen Personenzahlen reichen dafür nicht. Eine spätere Erweiterung kann Länder vergleichen, muss aber alle Bezugsgrößen und Revisionen konsistent halten.

## Quellen

- FAOSTAT Food Balances: https://www.fao.org/faostat/en/#data/FBS
- FAOSTAT Food Security: https://www.fao.org/faostat/en/#data/FS
- FAO: Standardisierung & interne Kalorienfaktoren: https://www.fao.org/4/X9892E/X9892e04.htm
- FAO: Definition Unterernährung: https://www.fao.org/measuring-hunger/access-to-dietary-energy/frequently-asked-questions/
- FAO: FBS Guidelines 2017, S.16: https://www.fao.org/3/ca6404en/ca6404en.pdf
- UNEP Food Waste Index 2024, Tabelle 1: https://www.unep.org/resources/publication/food-waste-index-report-2024

Weitere Originalquellen und genaue Prüfstellen stehen in `recherche/Recherche_vermeidbare_Verluste.md` und der Evidenz-CSV. Die Recherche ist keine vollständige systematische Meta-Analyse.

Credits: HfG Schwäbisch Gmünd, Wintersemester 2026, Prof. Dr. Franklin Hernández-Castro, Studierende: Namen offen. Eigene Gestaltung, Code und Animation mit Unterstützung von Codex. Keine Fremdmusik.
