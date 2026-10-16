from pathlib import Path
from decimal import Decimal,getcontext
import csv,json,struct,hashlib
getcontext().prec=35
P=Path(__file__).resolve().parent.parent
with (P/'website/daten/FoodBalanceSheets_World2022.csv').open(encoding='utf-8-sig',newline='') as f:
 rows=list(csv.DictReader(f))
values={(int(r['Item Code']),int(r['Element Code'])):Decimal(r['Value']) for r in rows if r['Value'].strip()}
rates={2511:Decimal(9)/13,2514:Decimal(13)/17,2546:Decimal(6)/11}
saved=sum(values[(c,5123)]*1000000*values[(c,661)]/values[(c,5142)]*rate for c,rate in rates.items())
ref=Decimal(687600000)*1833*365
people=saved/(1833*Decimal(365))
r=json.loads((P/'website/daten/szenario_pruefung.json').read_text(encoding='utf-8'))
assert abs(saved-Decimal(str(r['energy'])))<1
assert abs(people-Decimal(str(r['people'])))<Decimal('0.000001')
assert ref==Decimal(str(r['referenceEnergy']))
image=(P/'abgabe/Genug_Gesamtgrafik_2022.png').read_bytes()
assert image[:8]==b'\x89PNG\r\n\x1a\n'
dimensions=struct.unpack('>II',image[16:24]);assert dimensions==(2000,2000)
with (P/'recherche/Recherche_vermeidbare_Verluste_Evidenz.csv').open(encoding='utf-8-sig',newline='') as f:
 rows=list(csv.DictReader(f));fields=list(rows[0])
if not any(row['id']=='T01' for row in rows):
 row={k:'' for k in fields};row.update(id='T01',product='Tomaten',metric='Gemischte Wirkung von Plastikkisten',unit='kein Default',denominator='Gewicht vor und nach Transport; Qualitätsklassen separat',stage='Farm bis Einzelhandel',geography='Ouidah, Süd-Benin',data_year='2024',publication_year='2025',method='Partizipativer vergleichender Pilot; drei Verpackungsmethoden; zwei Durchgänge',sample='18 Akteure; fünf Ketten; zwei Einheiten je Verpackung und Kette je Durchgang',definition='Gemischte quantitative Verlustwirkung; Qualitäts- und Geldverluste nicht gleichsetzen',uncertainty='Kleine Stichprobe; Saison; Packungsgrößen; kurze Transporte; keine robuste einheitliche Überlegenheit',transfer_to_global_2022='Kein globaler Default',source_location='Egah et al., Januar 2025, Zusammenfassung, 2.3 und 3.2',source_url='https://cgspace.cgiar.org/bitstreams/f8e04126-1e67-4ec3-88dc-764784aae747/download',evidence_type='intervention_case_mixed',biological_minimum_proven='false');rows.append(row)
 with (P/'recherche/Recherche_vermeidbare_Verluste_Evidenz.csv').open('w',encoding='utf-8-sig',newline='') as f:
  writer=csv.DictWriter(f,fields);writer.writeheader();writer.writerows(rows)
evidence={name:{'bytes':(P/'recherche/Recherche_Quellen'/name).stat().st_size,'sha256':hashlib.sha256((P/'recherche/Recherche_Quellen'/name).read_bytes()).hexdigest()} for name in ['Mutungi_2022.pdf','Tomaten_Pilot_2026.pdf']}
report={'version':2,'date':'2026-10-05','independent_decimal_check':{'input':'FBS World2022 Originalauswahl; feste Brüche 9/13, 13/17, 6/11','saved_kcal':str(saved),'full_year_rations':str(people),'reference_kcal':str(ref),'passed':True},'image_export':{'tested':'Tatsächlicher PNG-Blob der Website lokal gespeichert, Signatur, Maße und visuelle Darstellung geprüft','size':dimensions,'bytes':len(image)},'browser_checks':{'desktop':'Neun Schritte, automatische Anfangsprogression, Pause/Weiter/Zurück, Maßnahmen-Deaktivierung, 0-%-Sensitivität und Reset, Produktauswahl getestet','mobile':'390 px iframe, verfügbare Breite 375 px nach Scrollbar. Body 375 / scrollWidth 375; Diagramm separat horizontal scrollbar. Maßnahmen, Suche und Pause getestet.','local_file':'Kein automatisierter file://-Test wegen Browser-URL-Policy. Alle lokalen Abhängigkeiten und keine fetch/import-Abrufe im Website-Ordner geprüft.','console':'Keine Anwendungsfehler im direkten Website-Fenster. Browser-iframe-Adapter zeigte in alter hoher Testhülle einen MutationObserver-Fehler; neue Hülle bei Ursprung 0/0 benutzt.'},'new_source_files':evidence,'credits':'Namen und Teamangaben offen auf Nutzerwunsch','older_outputs':'Version 1 unter archiv/version1; nicht Teil des neuen fachlichen Hauptpakets'}
(P/'abgabe/Pruefbericht.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Unabhängige Dezimalrechnung und tatsächlicher PNG-Export bestanden.')
