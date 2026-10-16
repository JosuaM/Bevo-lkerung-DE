# Genug? – Dokumentation der Datenpräsentation, Version 2

Stand: 5.10.2026. Lokal öffnen: `website/index.html`, per Doppelklick. Alle Daten und Skripte liegen im Website-Ordner; kein Server, Abruf, Framework, Konto oder Internet für die Präsentation erforderlich. Externe Quellenlinks benötigen Internet.

## Bedienung und Gestaltung

Neun Schritte: Frage → FAO-Verlustmasse → Produkte → UNEP-Konsumabfälle → Energie → Produktmaßnahmen → feste MDER-Referenz → Ergebnis → Grenzen und Export. Der Einstieg zeigt die Frage. Nach 5,5 Sekunden folgen die Daten automatisch. Zurück/Weiter, Pause/Abspielen und Von vorn; Schrittmarken erlauben Direktwahl. Pfeiltasten navigieren, Leertaste pausiert außerhalb von Bedienelementen. Produktflächen reagieren auf Maus, Klick und Tastatur; dieselbe Auswahl steht in der durchsuchbaren 98-Produkte-Liste. Gruppen und Produkte bleiben in allen dargestellten Bilanzebenen verbunden. Interaktionen und ein verlassenes Fenster pausieren; der Nutzer startet wieder mit Abspielen. Reduzierte Bewegung unterdrückt Animationen.

Eine kumulative SVG baut sich auf. Sie hält Masse (Mio. t) und Energie (Bio. kcal = 10¹²) auf getrennten Skalen. Disjunkte Produktflächen verhindern Doppelzählung. Die Energieebene zeigt die vollständige Zusammensetzung, darunter einen ausgerichteten Wirkungsstreifen (farbig gerettet, blass verbleibend, schraffiert unbekannt), dann gerettete Energie und Referenz auf derselben Energieskala. Der PNG-/SVG-Export enthält das aktuelle Szenario, keine Filterausblendung oder Hoverauswahl. Verbraucherabfälle werden niemals in kcal umgedeutet.

## Datengrundlage und geprüfter Ausschnitt

Unveränderte Originaldateien liegen unter `originaldaten`. `auswertung.py` durchläuft alle 4.820.497 FBS-Zeilen und 287.735 Food-Security-Zeilen; SHA-256 und Umfang stehen in `website/daten/pruefnachweis.json`. Fachlich geprüft wurde der gemeinsame Ausschnitt World 2022, nicht die Richtigkeit aller Länder/Jahre. Die 2.195 FBS- und 75 Food-Security-Auswahlzeilen sind separat gespeichert. Alle FBS-World2022-Ausgangswerte tragen Flag E (geschätzt).

98 disjunkte Einzeltitel in 21 Gruppen; 29xx-Aggregate nur zum Abgleich, niemals zusätzlich summiert. 73 Einzeltitel sind für die Energieumrechnung geeignet. 9 weitere Titel haben Losses, bleiben bewusst ausgeschlossen. 16 besitzen keinen Losses-Wert; ihre Mengen sind unbekannt. Ausgeschlossen: Zuckerrohr/-rüben (zusätzliche Extraktionsfrage), Baumwollsaat, Palmkerne ohne Food-Nenner, Kaffee/Tee (Verzehrform), Alkohol. Einzelbegründungen in `verlust_faktoren.csv` und der Liste.

Nachernteverluste: 644,356 Mio. t; darin 481,187 Mio. t umgerechnet, 163,169 Mio. t bewusst ausgeschlossen. FAO-FBS-Losses bezeichnet Verluste nach der Ernte vor dem Einzelhandel; Vorernte, Feed und technische Ausbeuteverluste sind separate Posten. [FAO FBS Guidelines, gedruckte S. 16](https://www.fao.org/3/ca6404en/ca6404en.pdf).

UNEP 2024 schätzt für 2022 631 Mio. t Haushalte, 290 Gastronomie, 131 Handel, insgesamt 1.052 Mio. t inklusive nicht essbarer Teile. Ohne passenden Produktmix keine Energieumrechnung. Eigene Datensysteme, keine Addition zu einer präzisen globalen Gesamtverlustquote. Quelle: [UNEP, Tabelle 1, S. XII](https://www.unep.org/resources/publication/food-waste-index-report-2024). Die gesicherte EU-PDF-Kopie überspringt S. XII–XIII; Tabelle 1 ist darin nicht vorhanden (siehe Recherche).

## Masse → Energie

Pro Produkt: kcal/kg = Food supply (million kcal) / Food (1000 t). Verlustenergie = Losses (1000 t) × 10⁶ kg × kcal/kg. Numerisch kürzen sich bei der ersten Division Millionen-kcal und Tausend-Tonnen auf kcal/kg. Die [FAO beschreibt interne Faktoren und standardisierte Primärproduktäquivalente](https://www.fao.org/4/X9892E/X9892e04.htm).

Die FBS-Verlustmasse kann nicht essbare Teile enthalten. 481,2 Mio. t sind umgerechnet, nicht als durchweg essbare Masse belegt. Die gerettete Masse wird mit demselben Energie- und Ausbeuteprofil wie der Food-Posten modelliert; keine Messung der tatsächlichen Verlustenergie. Ohne Beleg kein zusätzlicher essbarer Anteil. Nahrungssicherheit, Verarbeitung und Nährstoffveränderung sind hier nicht prognostiziert. Summe: 671,252 Billionen kcal.

## Feste FAO-Mindestenergie-Referenz

Originalzeile im lokalen `Food_Security_Data_World2022.csv`: Area 5000 (World), Item 21056, Minimum dietary energy requirement, Element 6128 (Value), Year 2022, 1833 kcal/cap/d, Flag E. Der ADER-Wert 2371 (Item 21057) bleibt als anderer Indikator im Datensatz, wird aber nicht für den Vergleich benutzt.

MDER ist eine bevölkerungsbezogene statistische Mindestenergie-Referenz, kein universeller individueller Bedarf. Die FAO berücksichtigt die Bevölkerungszusammensetzung. [FAO-Methode und FAQ](https://www.fao.org/measuring-hunger/access-to-dietary-energy/frequently-asked-questions/).

Unterernährte: 687,6 Mio. (Item 210010, Value, jährlicher 2022-Wert), Anteil 8,6 %. Referenz = 687.600.000 × 1.833 × 365 = 460.035.342.000.000 kcal (460,035 Bio.). Das ist die Energie voller Jahresrationen für diese Anzahl, **kein gemessenes Energiedefizit**. Weltbevölkerung als Kontext: 7.993.956.330.

Reine Obergrenze der umgerechneten Verlustenergie: 1.003,299 Mio. Jahresrationen. Zum Erreichen der Referenz wären 68,534 % dieser Energie nötig. Das setzt vollständige Umrechnung und Verteilung voraus, belegt keine Rettbarkeit.

## Ausgangsszenario und Studienabdeckung

Das Default ist ein bewusst optimistischer vollständiger Transfer von drei Produktfällen auf die jeweils gesamte globale FBS-Verlustenergie des Produkts. Angenommen wird gleiche relative Wirkung für alle Sorten, Länder, Jahre, Verlustursachen und Stufen. Diese Annahme ist stark und empirisch nicht global geprüft. Es gibt keinen allgemeinen 50-%-Rettungswert und keinen Energiebedarf-Slider. Nur die Anwendungsreichweite aktiver Maßnahmen ist als Sensitivität veränderbar, Ausgangspunkt 100 %. Sie ist ein Modellparameter, kein Studienbefund. Produkte ohne ausgewählten Beleg bleiben unbekannt; sie werden nicht als gemessene Nullrettung beschrieben.

Die Studienwerte und Fundstellen stehen in `studien.json`, ihre erweiterten Grenzen in der Recherche. Relative Verringerung = (Kontrollverlust − Interventionsverlust) / Kontrollverlust. Prozentpunkte sind davon getrennt. Bohnen nutzen den publizierten gerundeten Haupteffektfaktor 2,2: Verringerung = 1 − 1/2,2. Keine Kombination mehrfacher Maßnahmenquoten am selben Produkt.

Aktive Produktfälle: Mais, Weizen, Bohnen. Ihre globale Ausgangsenergie umfasst 269,591 Bio. kcal (40,2 % Energieabdeckung; 90,186 Mio. t). Diese Abdeckung ist eine **Produktzuordnung**, kein Nachweis der weltweiten Wirksamkeit. Für 401,661 Bio. kcal bleibt die Wirkung im Default unbekannt.

Im vollständigen Transfer: 199,531 Bio. kcal gerettet = 298,232 Mio. volle Jahresrationen = 43,4 % der Referenz. Das verbleibende Energievolumen des Falltransfers ist kein bewiesenes biologisches Minimum. Der unbekannte Anteil wird nicht stillschweigend gerettet.

## Grenzen und Projekt-Credits

Keine Aussage, dass diese Maßnahmen Welthunger beseitigen. Kalorien reichen als Ernährungskriterium nicht aus. Region, Zugang, Kaufkraft, Lebensmittelqualität, Logistik, Kosten und Ursachen von Hunger bleiben entscheidend. Kein belegter Vergleich „Bio besser als industrielle Milch“. Keine unzulässige Übertragung von Cowpea-Messungen auf alle FBS-Bohnen. Für Tomaten zeigt der neue Benin-Pilot gemischte Ergebnisse, deshalb kein Default. Für Milch keine geeignete quantitative Paarwirkung in dieser Recherche verifiziert; Wirkung bleibt unbekannt.

HfG Schwäbisch Gmünd · Wintersemester 2026 · 3-dimensionale Grundlagen im medialen Raum · Prof. Dr. Franklin Hernández-Castro. Projekt-Credits: Namen, Teamangaben und ggf. Teamfoto bleiben ausdrücklich offen.

## Reproduzierbarkeit und Versionsstand

1. `python auswertung.py` erzeugt World2022-Daten und MDER-Modell aus den Originalen.
2. `node build/pruefen_v2.cjs` prüft Modell und erzeugt Studien-JSON, Szenario-Nachweis und Gesamtgrafik-SVG.
3. `python build/dokumentieren_v2.py` aktualisiert Dokumentation und Rechercheergänzung.
4. `python build/unabhaengig_pruefen_v2.py` kontrolliert die Rechnung mit Dezimalarithmetik aus FBS-Auswahlzeilen und prüft die tatsächlich erzeugte PNG-Datei. Die Datei muss vorher über die Website oder den lokalen QA-Export erzeugt sein.
5. `python build/paket_v2.py` erstellt und prüft beide ZIP-Dateien.

Version 1 (lange Webseite, 50-%-Default, ADER 2371) ist in `archiv/version1` erhalten. Deren Präsentation und Animatic sind als überholt archiviert und keine aktuellen fachlichen Ergebnisse. Aktuelle Hauptabgabe: Website, Gesamtgrafik, Quellen, Rechennachweis und diese Dokumentation. Browserprüfung über localhost; `file://` ist im automatisierten Browser nicht freigegeben. Doppelklick-Kompatibilität wird anhand klassischer lokaler Skripte, relativer Pfade und fehlender Datenabrufe geprüft; kein behaupteter automatisierter file://-Test.
