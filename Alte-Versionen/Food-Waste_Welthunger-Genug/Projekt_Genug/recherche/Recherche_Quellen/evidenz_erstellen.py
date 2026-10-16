from pathlib import Path
import csv, json, hashlib

root=Path(__file__).parent
rows=[]
def add(id, product, metric, value=None, low=None, high=None, unit='percent', denominator='', stage='', geography='', data_year='', publication_year='', method='', sample='', definition='', uncertainty='', transfer='', location='', url='', evidence_type='observed', minimum=False):
    rows.append(dict(id=id,product=product,metric=metric,value=value,lower=low,upper=high,unit=unit,denominator=denominator,stage=stage,geography=geography,data_year=data_year,publication_year=publication_year,method=method,sample=sample,definition=definition,uncertainty=uncertainty,transfer_to_global_2022=transfer,source_location=location,source_url=url,evidence_type=evidence_type,biological_minimum_proven=str(minimum).lower()))

fruit=dict(denominator='Genussfaehige Produktion / Gesamterntemenge auf Erzeugerebene',stage='Erzeugerebene; Vorernte und Ernte nicht sauber trennbar',geography='Deutschland; ausgewaehlte Anbauregionen',data_year='Projekt 2015-2020; kein einheitliches Bezugsjahr',publication_year='2021',method='Experteninterviews; Workshopvalidierung; gezielte Fallstudien',definition='Berichtete mengenbezogene Verluste; keine essbar/nichtessbar Zerlegung',uncertainty='Selbstangaben; kleine Fallzahlen; keine Konfidenzintervalle; keine randomisierte Verfahrenszuweisung',transfer='Nicht direkt global oder auf FBS 2022 uebertragbar',url='https://literatur.thuenen.de/digbib_extern/dn064081.pdf')
for code,prod,lo,hi,n in [('R01','Moehren Freiland',25,40,'20 Erzeugerinterviews'),('R02','Salat Freiland',25,30,'20 Erzeugerinterviews'),('R03','Aepfel',6,16,'20 Erzeugerinterviews'),('R04','Erdbeeren Freiland',15,20,'21 Erzeugerinterviews')]:
    add(code,prod,'Berichteter durchschnittlicher Verlust',low=lo,high=hi,sample=n+'; insgesamt 136 Interviews entlang der Kette',location='Tabelle 2 S.160; Tabelle 1 S.159',**fruit)
add('R05','Himbeeren Freiland','Berichteter durchschnittlicher Verlust',15,sample='5 Erzeugerinterviews; insgesamt 136 Interviews entlang der Kette',location='Tabelle 2 S.160',**fruit)
add('R06','Erdbeeren geschuetzt','Berichteter durchschnittlicher Verlust',10,sample='11 Erzeugerinterviews geschuetzter Anbau',location='Tabelle 3 S.163; Tabelle 1 S.159',**fruit)
add('R07','Himbeeren geschuetzt','Berichteter durchschnittlicher Verlust',7,sample='10 Erzeugerinterviews geschuetzter Anbau',location='Tabelle 3 S.163; Tabelle 1 S.159',**fruit)
for code,prod in [('R08','Moehren Freiland'),('R09','Salat Freiland')]:
    add(code,prod,'Verlust in guten Jahren',low=10,high=15,sample='Je 20 Erzeugerinterviews',location='Tabelle 2 S.160',**fruit)

maize=dict(denominator='Gelagerte Maisbezugsmenge; Insekten-Gewichtsverlust',stage='Lagerung auf Betrieben; vier Monate',geography='Kenia',data_year='2012-2013 Hauptlagersaison',publication_year='2016',method='Randomisierter kontrollierter Feldversuch; Kornproben',sample='300 Behandlung; 300 Kontrolle; besuchte Teilstichprobe 224',definition='Gewichtsverlust durch Insektenschaedlinge; keine gesamte Lieferkettenquote',uncertainty='Original-Abstract geprueft; Volltexttabellen nicht vollstaendig geprueft; gerundete Werte',transfer='Lokale Wirkung; kein globaler Mais-/Getreidefaktor 2022',location='Original-Abstract; Crop Protection 90 S.17-26',url='https://doi.org/10.1016/j.cropro.2016.08.007')
add('M01','Mais herkoemmlich','Insekten-Gewichtsverlust nach vier Monaten',1.7,**maize)
add('M02','Mais hermetische Saecke','Insekten-Gewichtsverlust nach vier Monaten',0.4,**maize)
derived=maize.copy()
derived.update(denominator='Insekten-Gewichtsverlust der Kontrollgruppe',method='Eigene Rechnung (1.7-0.4)/1.7*100',location='Ableitung aus M01 und M02',uncertainty='Berechnung aus gerundeten Gruppenwerten; keine gesamte Verlustvermeidbarkeit')
add('M03','Mais hermetische Saecke vs Kontrolle','Relative Reduktion des untersuchten Verlusts',round((1.7-0.4)/1.7*100,2),evidence_type='derived',**derived)
derived.update(denominator=maize['denominator'],method='Eigene Rechnung 1.7-0.4')
add('M04','Mais hermetische Saecke vs Kontrolle','Absolute Differenz der Verlustraten',1.3,unit='percentage_points',evidence_type='derived',**derived)

cold=dict(denominator='Verlustmenge im Basisszenario der Modellkette',stage='Modellkette Produktion bis Konsum; Kuehlwirkung nach Hoftor bis Handel',geography='Global; sieben Modellregionen',data_year='FAOSTAT Mengen 2020; Verlustquoten u.a. Gustavsson 2011',publication_year='2024',method='Szenariomodell; niedrigste Basisverlustraten als Optimierungsannahme',sample='Sieben Gruppen und sieben Regionen; keine neue Feldstichprobe',definition='Relative modellierte Verlustreduktion; gruppenuebergreifender Bereich',uncertainty='Qualitaetsklassen umfassen weitere Faktoren; Kuehlung nicht isoliert; Rest kein biologisches Minimum',transfer='Nicht direkt mit FBS Losses 2022 multiplizieren',location='Abschnitt 4 gedruckte S.6; Abb.2; Methodik Abschnitte 2.2-2.7',url='https://doi.org/10.1088/1748-9326/ad4c7b',evidence_type='modelled')
add('C01','Milchprodukte; Obst/Gemuese; Fleisch','Relative Reduktion durch Modelloptimierung',low=26,high=63,**cold)
add('C02','Getreide; Fisch; Oelsaaten/Huelsenfruechte; Wurzeln/Knollen','Relative Reduktion durch Modelloptimierung',low=13,high=20,**cold)

wrap=dict(stage='Haushalt; alle untersuchten Entsorgungswege',geography='Vereinigtes Koenigreich',data_year='2022; zusammengestellte Erhebungen und Tagebuecher',publication_year='2025',method='Abfallzusammensetzung; Tagebuecher; Gewichtung und Extrapolation',sample='193 Abfallzusammensetzungsstudien; etwa 39000 Haushalte; weitere Tagebucherhebungen',definition='Frischmasse inklusive nicht essbarer Teile; Essbarkeit nach britischem Kontext',uncertainty='Tagebuecher unterschätzen; methodisch revidierte Reihe; essbar nicht sofort rettbar',transfer='Keine globale Essbarkeits- oder Vermeidbarkeitsquote',location='Hauptbericht S.4-5; Methodenbericht Abschnitte 5.3 und 9',url='https://www.wrap.ngo/resources/report/household-food-and-drink-waste-united-kingdom-2021-22',evidence_type='estimated')
add('W01','Alle Lebensmittel und Getraenke','Haushaltsabfall insgesamt',6.0,unit='million_tonnes',denominator='Absolute nationale Jahresmenge',**wrap)
add('W02','Essbare Teile','Haushaltsabfall essbarer Teile',4.4,unit='million_tonnes',denominator='Absolute nationale Jahresmenge',**wrap)
add('W03','Essbare Teile','Essbarer Anteil der Haushaltsabfallmasse',73,denominator='Gesamte Haushaltsabfallmasse; nicht Produktion',**wrap)

unep=dict(denominator='Absolute globale Jahresmenge',geography='Global',data_year='2022 Schaetzjahr; Studien verschiedener Jahre',publication_year='2024',method='Literaturauswertung; Harmonisierung und Extrapolation auf 2022',sample='288 Datenpunkte in 102 Laendern insgesamt; keine Weltvollerhebung 2022',definition='Frischmasse einschliesslich nicht essbarer Teile',uncertainty='Luecken nach Sektor und Region; keine globale Vermeidbarkeit bestimmt',transfer='Globales Abfallvolumen 2022; keine essbare Kalorienmenge',location='Tabelle 1 S.XII; Kapitel 2',url='https://www.unep.org/resources/publication/food-waste-index-report-2024',evidence_type='estimated')
for code,st,val in [('U01','Haushalte',631),('U02','Gastronomie',290),('U03','Einzelhandel',131),('U04','Haushalte; Gastronomie; Einzelhandel',1052)]:
    add(code,'Alle Lebensmittel und Getraenke','Globale Abfallmasse',val,unit='million_tonnes',stage=st,**unep)

out=root.parent/'Recherche_vermeidbare_Verluste_Evidenz.csv'
with out.open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]))
    writer.writeheader(); writer.writerows(rows)
assert len({r['id'] for r in rows})==len(rows)
assert all(r['biological_minimum_proven']=='false' for r in rows)
manifest=[]
for p in root.iterdir():
    if p.suffix in ['.pdf','.xlsx','.json'] and p.name!='Quellen_Pruefnachweis.json':
        b=p.read_bytes()
        valid=(b.startswith(b'%PDF') if p.suffix=='.pdf' else b.startswith(b'PK') if p.suffix=='.xlsx' else True)
        manifest.append(dict(file=p.name,bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),valid_signature=valid))
meta=json.loads((root/'Gatto_Chepeliev_Datensatz_Metadaten.json').read_text(encoding='utf-8-sig'))
xlsx=root/'Gatto_Chepeliev_Supplementary_info_database.xlsx'
assert hashlib.md5(xlsx.read_bytes()).hexdigest()==meta['files'][0]['computed_md5']
(root/'Quellen_Pruefnachweis.json').write_text(json.dumps(dict(checked_on='2026-10-05',evidence_rows=len(rows),files=manifest,gatto_years_checked=[2004,2007,2011,2014],gatto_md5_matches=True,unep_pdf_download='https://capacity4dev.europa.eu/system/files/documents/2024-03/food_waste_index_report_2024%20%281%29_0.pdf'),ensure_ascii=False,indent=2),encoding='utf8')
print('CSV',len(rows),'Zeilen; Gatto MD5 stimmt; Quelldateien',len(manifest))
