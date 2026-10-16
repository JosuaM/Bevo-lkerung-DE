from pathlib import Path
import csv,json,html
P=Path(__file__).resolve().parent.parent
D=json.loads((P/'website/daten/modell.json').read_text(encoding='utf-8'))
R=json.loads((P/'website/daten/szenario_pruefung.json').read_text(encoding='utf-8'))
S=json.loads((P/'website/daten/studien.json').read_text(encoding='utf-8'))
def n(v,d=1):return f'{v:,.{d}f}'.replace(',','X').replace('.',',').replace('X','.')
text=f'''# Genug? – Dokumentation der Datenpräsentation, Version 2

Stand: 5.10.2026. Lokal öffnen: `website/index.html`, per Doppelklick. Alle Daten und Skripte liegen im Website-Ordner; kein Server, Abruf, Framework, Konto oder Internet für die Präsentation erforderlich. Externe Quellenlinks benötigen Internet.

## Bedienung und Gestaltung

Neun Schritte: Frage → FAO-Verlustmasse → Produkte → UNEP-Konsumabfälle → Energie → Produktmaßnahmen → feste MDER-Referenz → Ergebnis → Grenzen und Export. Der Einstieg zeigt die Frage. Nach 5,5 Sekunden folgen die Daten automatisch. Zurück/Weiter, Pause/Abspielen und Von vorn; Schrittmarken erlauben Direktwahl. Pfeiltasten navigieren, Leertaste pausiert außerhalb von Bedienelementen. Produktflächen reagieren auf Maus, Klick und Tastatur; dieselbe Auswahl steht in der durchsuchbaren 98-Produkte-Liste. Gruppen und Produkte bleiben in allen dargestellten Bilanzebenen verbunden. Interaktionen und ein verlassenes Fenster pausieren; der Nutzer startet wieder mit Abspielen. Reduzierte Bewegung unterdrückt Animationen.

Eine kumulative SVG baut sich auf. Sie hält Masse (Mio. t) und Energie (Bio. kcal = 10¹²) auf getrennten Skalen. Disjunkte Produktflächen verhindern Doppelzählung. Die Energieebene zeigt die vollständige Zusammensetzung, darunter einen ausgerichteten Wirkungsstreifen (farbig gerettet, blass verbleibend, schraffiert unbekannt), dann gerettete Energie und Referenz auf derselben Energieskala. Der PNG-/SVG-Export enthält das aktuelle Szenario, keine Filterausblendung oder Hoverauswahl. Verbraucherabfälle werden niemals in kcal umgedeutet.

## Datengrundlage und geprüfter Ausschnitt

Unveränderte Originaldateien liegen unter `originaldaten`. `auswertung.py` durchläuft alle 4.820.497 FBS-Zeilen und 287.735 Food-Security-Zeilen; SHA-256 und Umfang stehen in `website/daten/pruefnachweis.json`. Fachlich geprüft wurde der gemeinsame Ausschnitt World 2022, nicht die Richtigkeit aller Länder/Jahre. Die 2.195 FBS- und 75 Food-Security-Auswahlzeilen sind separat gespeichert. Alle FBS-World2022-Ausgangswerte tragen Flag E (geschätzt).

98 disjunkte Einzeltitel in 21 Gruppen; 29xx-Aggregate nur zum Abgleich, niemals zusätzlich summiert. 73 Einzeltitel sind für die Energieumrechnung geeignet. 9 weitere Titel haben Losses, bleiben bewusst ausgeschlossen. 16 besitzen keinen Losses-Wert; ihre Mengen sind unbekannt. Ausgeschlossen: Zuckerrohr/-rüben (zusätzliche Extraktionsfrage), Baumwollsaat, Palmkerne ohne Food-Nenner, Kaffee/Tee (Verzehrform), Alkohol. Einzelbegründungen in `verlust_faktoren.csv` und der Liste.

Nachernteverluste: {n(D['loss_mass_mt'],3)} Mio. t; darin {n(D['included_mass_mt'],3)} Mio. t umgerechnet, {n(D['loss_mass_mt']-D['included_mass_mt'],3)} Mio. t bewusst ausgeschlossen. FAO-FBS-Losses bezeichnet Verluste nach der Ernte vor dem Einzelhandel; Vorernte, Feed und technische Ausbeuteverluste sind separate Posten. [FAO FBS Guidelines, gedruckte S. 16](https://www.fao.org/3/ca6404en/ca6404en.pdf).

UNEP 2024 schätzt für 2022 631 Mio. t Haushalte, 290 Gastronomie, 131 Handel, insgesamt 1.052 Mio. t inklusive nicht essbarer Teile. Ohne passenden Produktmix keine Energieumrechnung. Eigene Datensysteme, keine Addition zu einer präzisen globalen Gesamtverlustquote. Quelle: [UNEP, Tabelle 1, S. XII](https://www.unep.org/resources/publication/food-waste-index-report-2024). Die gesicherte EU-PDF-Kopie überspringt S. XII–XIII; Tabelle 1 ist darin nicht vorhanden (siehe Recherche).

## Masse → Energie

Pro Produkt: kcal/kg = Food supply (million kcal) / Food (1000 t). Verlustenergie = Losses (1000 t) × 10⁶ kg × kcal/kg. Numerisch kürzen sich bei der ersten Division Millionen-kcal und Tausend-Tonnen auf kcal/kg. Die [FAO beschreibt interne Faktoren und standardisierte Primärproduktäquivalente](https://www.fao.org/4/X9892E/X9892e04.htm).

Die FBS-Verlustmasse kann nicht essbare Teile enthalten. 481,2 Mio. t sind umgerechnet, nicht als durchweg essbare Masse belegt. Die gerettete Masse wird mit demselben Energie- und Ausbeuteprofil wie der Food-Posten modelliert; keine Messung der tatsächlichen Verlustenergie. Ohne Beleg kein zusätzlicher essbarer Anteil. Nahrungssicherheit, Verarbeitung und Nährstoffveränderung sind hier nicht prognostiziert. Summe: {n(D['energy_kcal']/1e12,3)} Billionen kcal.

## Feste FAO-Mindestenergie-Referenz

Originalzeile im lokalen `Food_Security_Data_World2022.csv`: Area 5000 (World), Item 21056, Minimum dietary energy requirement, Element 6128 (Value), Year 2022, 1833 kcal/cap/d, Flag E. Der ADER-Wert 2371 (Item 21057) bleibt als anderer Indikator im Datensatz, wird aber nicht für den Vergleich benutzt.

MDER ist eine bevölkerungsbezogene statistische Mindestenergie-Referenz, kein universeller individueller Bedarf. Die FAO berücksichtigt die Bevölkerungszusammensetzung. [FAO-Methode und FAQ](https://www.fao.org/measuring-hunger/access-to-dietary-energy/frequently-asked-questions/).

Unterernährte: 687,6 Mio. (Item 210010, Value, jährlicher 2022-Wert), Anteil 8,6 %. Referenz = 687.600.000 × 1.833 × 365 = {n(R['referenceEnergy'],0)} kcal ({n(R['referenceEnergy']/1e12,3)} Bio.). Das ist die Energie voller Jahresrationen für diese Anzahl, **kein gemessenes Energiedefizit**. Weltbevölkerung als Kontext: 7.993.956.330.

Reine Obergrenze der umgerechneten Verlustenergie: {n(R['maximumPeople']/1e6,3)} Mio. Jahresrationen. Zum Erreichen der Referenz wären {n(R['threshold'],3)} % dieser Energie nötig. Das setzt vollständige Umrechnung und Verteilung voraus, belegt keine Rettbarkeit.

## Ausgangsszenario und Studienabdeckung

Das Default ist ein bewusst optimistischer vollständiger Transfer von drei Produktfällen auf die jeweils gesamte globale FBS-Verlustenergie des Produkts. Angenommen wird gleiche relative Wirkung für alle Sorten, Länder, Jahre, Verlustursachen und Stufen. Diese Annahme ist stark und empirisch nicht global geprüft. Es gibt keinen allgemeinen 50-%-Rettungswert und keinen Energiebedarf-Slider. Nur die Anwendungsreichweite aktiver Maßnahmen ist als Sensitivität veränderbar, Ausgangspunkt 100 %. Sie ist ein Modellparameter, kein Studienbefund. Produkte ohne ausgewählten Beleg bleiben unbekannt; sie werden nicht als gemessene Nullrettung beschrieben.

Die Studienwerte und Fundstellen stehen in `studien.json`, ihre erweiterten Grenzen in der Recherche. Relative Verringerung = (Kontrollverlust − Interventionsverlust) / Kontrollverlust. Prozentpunkte sind davon getrennt. Bohnen nutzen den publizierten gerundeten Haupteffektfaktor 2,2: Verringerung = 1 − 1/2,2. Keine Kombination mehrfacher Maßnahmenquoten am selben Produkt.

Aktive Produktfälle: Mais, Weizen, Bohnen. Ihre globale Ausgangsenergie umfasst {n(R['coveredEnergy']/1e12,3)} Bio. kcal ({n(R['coveredEnergy']/D['energy_kcal']*100)} % Energieabdeckung; {n(R['coveredMass'],3)} Mio. t). Diese Abdeckung ist eine **Produktzuordnung**, kein Nachweis der weltweiten Wirksamkeit. Für {n(R['unknownEnergy']/1e12,3)} Bio. kcal bleibt die Wirkung im Default unbekannt.

Im vollständigen Transfer: {n(R['energy']/1e12,3)} Bio. kcal gerettet = {n(R['people']/1e6,3)} Mio. volle Jahresrationen = {n(R['ratio']*100)} % der Referenz. Das verbleibende Energievolumen des Falltransfers ist kein bewiesenes biologisches Minimum. Der unbekannte Anteil wird nicht stillschweigend gerettet.

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
'''
(P/'abgabe/Dokumentation.md').write_text(text,encoding='utf-8')
# Kleine HTML-Dokumentation ohne externe Bibliothek, alle Daten auch im lokalen Nachweis verlinkt.
paragraphs=[]
for part in text.split('\n\n'):
 if part.startswith('# '):paragraphs.append('<h1>'+html.escape(part[2:])+'</h1>')
 elif part.startswith('## '):paragraphs.append('<h2>'+html.escape(part[3:])+'</h2>')
 else:paragraphs.append('<p>'+html.escape(part).replace('\n','<br>')+'</p>')
doc='<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Genug? Dokumentation</title><style>body{max-width:850px;margin:3rem auto;padding:0 1.4rem;color:#202b21;background:#f5f2e8;font:17px/1.65 Segoe UI,sans-serif}h1,h2{font-family:Georgia,serif}h2{margin-top:2.5rem}a{color:#496849}</style><p><a href="index.html">Zur Datenpräsentation</a> · <a href="daten/szenario_pruefung.json">Rechennachweis</a> · <a href="daten/studien.json">Studien</a> · <a href="daten/verlust_faktoren.csv">Produktfaktoren</a></p>'+''.join(paragraphs)+'</html>'
# Markdown-Quellenlinks in tatsächlich klickbare Links wandeln.
import re
doc=re.sub(r'\[([^\]]+)\]\((https://[^)]+)\)',r'<a href="\2">\1</a>',doc)
doc=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',doc)
doc=re.sub(r'`([^`]+)`',r'<code>\1</code>',doc)
(P/'website/dokumentation.html').write_text(doc,encoding='utf-8')
readme='''# Genug? – interaktive Datenpräsentation, Version 2

**Start: `website/index.html` per Doppelklick.** Website-Ordner vollständig zusammenlassen. Keine Installation, kein Server und kein Internet zum Abspielen erforderlich.

Neun automatisch aufbauende Schritte, Pause/Zurück/Weiter/Von vorn, Produkt- und Gruppenwahl, Fallstudien-Szenario, feste FAO-MDER-Referenz 1833 und PNG-/SVG-Export der gemeinsamen Gesamtgrafik. Namen/Teamangaben bleiben offen.

Aktuell: `website/`, `abgabe/Genug_Gesamtgrafik_2022.svg`, `abgabe/Dokumentation.md`, `website/daten/szenario_pruefung.json`, `recherche/`. `Genug_Website.zip` enthält die komplette lokale Website; `Genug_Projektpaket.zip` ergänzt Daten, Recherche, Dokumentation und reproduzierbare Auswertung.

Version 1 samt altem ADER-Modell, Präsentation und Animatic liegt in `archiv/version1`. Diese Dateien sind überholt. Maßgeblich sind die Version-2-Website und deren Dokumentation.

Ergebnisse sind Modellrechnungen, keine Prognose, dass Welthunger beseitigt wird. Produkte ohne passende Maßnahmenstudie bleiben unbekannt. Der 100-%-Anwendungsanteil ist ein optimistischer Falltransfer, keine empirische globale Quote.
'''
(P/'README.md').write_text(readme,encoding='utf-8')
addition='''

## 9. Ergänzung vom 5.10.2026: verwendbare Produktmaßnahmen für Version 2

Der alte Befund „keine universelle vermeidbare Quote“ bleibt richtig. Drei begrenzte Produktfälle sind nun als ausdrücklich hypothetische Transfers nutzbar; sie beweisen keine weltweite Wirkung und keinen biologischen Mindestverlust. Keine Übertragung auf andere Produktgruppen ohne eigene Belege.

### W04 – Weizen: konkreter kontrollierter Versuch

[Melese et al. 2022, Heliyon, Tabelle 3](https://pmc.ncbi.nlm.nih.gov/articles/PMC9803821/): Äthiopischer Emmer, neun Monate Lagerung, je drei Beobachtungen. Gewichtsverlust in PP-Beuteln 3,9 ± 0,1 %, in PICS 1,2 ± 0,5 % (Mittel ± SD): 2,7 Prozentpunkte bzw. 69,23 % relative Verringerung. Kleines n, Saatgut, Messjahr nicht eindeutig; keine Abdeckung aller Weizenarten/Stufen. Industrielle Nebenprodukte FC/TX mit niedrigeren Restverlusten werden mangels geprüfter Lebensmittelsicherheit nicht als „beste Lebensmittelpraxis“ eingesetzt. PICS ist hier die stärkere der zwei hermetischen Beutelvarianten nach neun Monaten, kein universelles Optimum.

### B01 – Bohnen: Originaltext statt unklarer Sekundärquote

[Mutungi et al. 2022, DOI](https://doi.org/10.1016/j.jspr.2021.101918), Original-PDF `Recherche_Quellen/Mutungi_2022.pdf`, Abschnitt 3.1.2, Abb. 4b: Karatu, Tansania 2018/19; 24 Einheiten, je 12 verbessert/üblich; Proben bei 0, 3,5 und 7 Monaten. Paket aus Trocknung, Handhabung und luftdichter Lagerung. Publizierter Haupteffekt: übliche Gewichtsverluste 2,2-fach größer als verbesserte, entsprechend 54,55 % relativer Verringerung. Keine randomisierte Behandlungszuweisung; gerundeter Faktor über Zeitpunkte, einschließlich nicht akzeptabler Körner. Nicht mit der separaten Insektenbeschädigungsquote verwechseln. Die Review-Zahl 14,5 → 4,5 % wird nicht als Default benutzt, da sie sich aus dem Text nicht als identischer Haupteffektvergleich verifizieren ließ.

### M05 – Mais: bereits geprüfte RCT als relative Wirkung

Die vorhandenen M01–M04 von Ndegwa et al. werden weiterverwendet. Rechnung: (1,7 − 0,4) / 1,7 = 76,47 % Verringerung insektenbedingter Lager-Gewichtsverluste. Keine neue unabhängige Studie oder zusätzliche globale Quote. Abstract geprüft, Volltexttabellen noch nicht verifiziert. Anwendungsreichweite ist hypothetisch.

### T01 – Tomaten: widersprechender Kontext bleibt sichtbar

Egah et al., Januar 2025, Originalpilot `Tomaten_Pilot_2026.pdf`, [CGIAR/Wageningen-Download](https://cgspace.cgiar.org/bitstreams/f8e04126-1e67-4ec3-88dc-764784aae747/download), Süd-Benin, Zusammenfassung und Abschnitt 3.2: wiederverwendbare Plastikkisten gegenüber traditionellen Körben zeigten gemischte Ergebnisse, keine robuste einheitliche Überlegenheit. Kleine Stichprobe, kurze Transporte, Verpackungs- und Saisonunterschiede. Deshalb keine globale Defaultquote. Titelblatt verifiziert; Dateiname 2026 bezeichnet den Abruf, nicht das Publikationsjahr.

Weitere gefundene Tomatenversuche messen teils Fruchtbeschädigung, Marktqualität oder wirtschaftlichen Verlust statt FBS-kompatibler Massenverluste. Ohne passenden Nenner werden hohe Werbewerte nicht als Rettungsquote eingesetzt. Cowpea-Studien werden nicht pauschal auf den FBS-Titel Beans angewandt. Milch-Kühlprojekte liefern in den geprüften zugänglichen Quellen keine belastbare gepaarte mengenbezogene Defaultwirkung; unbekannt ist kein Nullpotenzial.
'''
md=P/'recherche/Recherche_vermeidbare_Verluste.md'
old=md.read_text(encoding='utf-8');old=old.split('\n\n## 9. Ergänzung vom 5.10.2026:')[0];md.write_text(old+addition,encoding='utf-8')
csvpath=P/'recherche/Recherche_vermeidbare_Verluste_Evidenz.csv'
with csvpath.open(encoding='utf-8-sig',newline='') as file:reader=csv.DictReader(file);fields=reader.fieldnames;rows=[r for r in reader if r['id'] not in {'M05','W04','B01','T01'}]
for s in S:
 row={k:'' for k in fields};row.update(id=s['id'],product=s['product'],metric='Relative Gewichtsverlust-Verringerung',value=s['reduction']*100,unit='percent',denominator=s['metric'],stage='Nachernte; Lagerung / Handhabung',geography=s['context'],data_year='2012/13' if s['id']=='M05' else '2018/19' if s['id']=='B01' else 'nicht eindeutig angegeben',publication_year='2016' if s['id']=='M05' else '2022',method=s['method'],definition='Keine biologische Untergrenze; eigene relative Rechnung aus publizierten Vergleichswerten',uncertainty=s['uncertainty'],transfer_to_global_2022='Nur hypothetischer Produkttransfer; keine gemessene globale Wirkung',source_location=s['citation'],source_url=s['url'],evidence_type='intervention_case',biological_minimum_proven='false');rows.append(row)
with csvpath.open('w',encoding='utf-8-sig',newline='') as file:writer=csv.DictWriter(file,fields);writer.writeheader();writer.writerows(rows)
print('Dokumentation und Recherche aktualisiert.')
