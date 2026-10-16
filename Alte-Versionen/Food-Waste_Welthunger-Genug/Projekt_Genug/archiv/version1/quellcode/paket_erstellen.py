from pathlib import Path
from decimal import Decimal,getcontext
import json,csv,hashlib,shutil,zipfile,subprocess,re
HERE=Path(__file__).resolve().parents[1];PARENT=HERE.parent
D=json.loads((HERE/'website/daten/modell.json').read_text(encoding='utf-8'))
QA=json.loads((HERE/'website/daten/pruefnachweis.json').read_text(encoding='utf-8'))
getcontext().prec=40
with (HERE/'website/daten/FoodBalanceSheets_World2022.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
T={(int(r['Item Code']),int(r['Element Code'])):Decimal(r['Value']) for r in rows if r['Value']}
independent=sum(T[(i['code'],5123)]*Decimal(1000000)*T[(i['code'],661)]/T[(i['code'],5142)] for i in D['items'] if i['included'])
assert abs(float(independent)-D['energy_kcal'])/D['energy_kcal']<1e-12
assert D['hungry_people']==687600000 and D['reference_kcal']==2371
originalchecks=[]
for section,folder in [('fbs','FoodBalanceSheets'),('security','Food_Security_Data')]:
    source=next((HERE/'originaldaten'/folder).glob('*Normalized*.csv'))
    digest=hashlib.sha256(source.read_bytes()).hexdigest();assert digest==QA[section]['sha256']
    originalchecks.append({'path':str(source.relative_to(HERE)),'sha256':digest,'equal_to_input_snapshot':True})

(HERE/'recherche').mkdir(exist_ok=True)
for name in ['Recherche_vermeidbare_Verluste.md','Recherche_vermeidbare_Verluste_Evidenz.csv']:
    shutil.copy2(PARENT/name,HERE/'recherche'/name)
shutil.copytree(PARENT/'Recherche_Quellen',HERE/'recherche'/'Recherche_Quellen',dirs_exist_ok=True)
sources=HERE/'quellcode';sources.mkdir(exist_ok=True)
for name in ['animatic.html','animatic.js','praesentation.mjs','rechnung_test.cjs','serve.py','paket_erstellen.py']:
    shutil.copy2(HERE/'build'/name,sources/name)
shutil.copy2(HERE/'build'/'kurs_inventar.json',sources/'kurs_inventar.json')
shutil.copy2(HERE/'build'/'kurs_materialien_komplett.txt',sources/'kurs_materialien_komplett.txt')
# Relative path for the portable animatic source. Its data lives in ../website/daten.js.
(sources/'README.md').write_text('''# Zusätzliche Quellen

Der vollständige Website-Code steht in `../website/`. `../auswertung.py` benötigt Python 3 und keine Zusatzpakete.

`animatic.html` und `animatic.js` enthalten die originale Videoanimation. Ein aktueller Chromium-Browser mit MP4-MediaRecorder-Unterstützung kann die Quelle öffnen und die 96-sekündige Aufnahme erzeugen. Für gute MP4-Kompatibilität die Aufnahme anschließend mit FFmpeg ohne Neukodierung remuxen: `ffmpeg -i aufnahme.mp4 -c copy -movflags +faststart final.mp4`. Der fertige Film liegt bereits im Abgabeordner.

`praesentation.mjs` verwendet den gebündelten Codex-Runtimepfad und @oai/artifact-tool. Zur Neugenerierung die am Dateianfang gesetzten Pfade und einen neuen finalen Dateinamen/Prüfnachweis wählen. Die fertige PPTX benötigt diese Entwicklungsumgebung nicht. Native Diagramme enthalten eingebettete Tabellen-Snapshots ihrer dargestellten Daten.

`rechnung_test.cjs` kann mit Node ausgeführt werden. Die Datei liegt hier zur Dokumentation, der ausgeführte Test liegt im ursprünglichen build-Ordner mit passenden relativen Pfaden. `kurs_inventar.json` katalogisiert alle Kursmaterialien, `kurs_materialien_komplett.txt` dokumentiert die Textsichtung.

`serve.py` ist ausschließlich ein lokaler Entwicklungshelfer für die Videoaufnahme. Für die Website ist er unnötig. `paket_erstellen.py` dokumentiert die Paketierung und unabhängige Zahlenprüfung und nutzt die ursprüngliche Arbeitsordnerstruktur.

FFmpeg kam aus dem offiziellen PyPI-Paket imageio-ffmpeg 0.6.0 (FFmpeg 7.1 für Windows). Die Laufzeitpakete werden nicht mit der Abgabe verteilt. Website und Film benutzen keine Fremdmusik oder fremde Illustrationen.
''',encoding='utf-8')
pictures=HERE/'abgabe'/'Bilder';pictures.mkdir(exist_ok=True)
for name in ['website_start.png','website_szenario.png','website_mobile_echt.png','website_mobile_szenario.png']:
    shutil.copy2(HERE/'build'/name,pictures/name)
for t in [3,16,30,54,72,90]:shutil.copy2(HERE/'build'/f'video_frame{t}.png',pictures/f'Animatic_{t:02d}s.png')
for n in range(1,10):shutil.copy2(HERE/'build/slides'/f'slide-{n}.png',pictures/f'Folie_{n:02d}.png')

def fmt(v,d=1):return f'{v:,.{d}f}'.replace(',','X').replace('.',',').replace('X','.')
groups=sorted(D['groups'],key=lambda g:g['energy_kcal'],reverse=True)
table='\n'.join(f"| {g['name']} | {fmt(g['mass_mt'])} | {fmt(g['mass_mt']/D['loss_mass_mt']*100)} | {fmt(g['energy_kcal']/1e12)} | {fmt(g['energy_kcal']/D['energy_kcal']*100)} | {g['missing_loss_items']} |" for g in groups)
included=sum(i['included'] for i in D['items']);missing=sum(i['loss_1000t'] is None for i in D['items'])
doc=f'''# Genug? – Projektdokumentation

## Fragestellung und Ziel

Könnte verschwendetes Essen den Welthunger stillen? Die interaktive Datenreise beantwortet die Frage als transparentes theoretisches Energieexperiment für die Welt im Jahr 2022. Sie spricht interessierte Besucher ohne Vorwissen an. Sie führt von Verlustmengen über produktbezogene Kalorienfaktoren zur frei veränderbaren Rettungsannahme. Die Kernaussage bleibt bedingt: erhebliche Modellenergie, unbekannte globale Rettbarkeit und keine automatische Hungerbekämpfung.

## Vollständige Sichtung und Auswahl der Daten

Die beiden großen normalisierten Originaldateien wurden vollständig zeilenweise gelesen. Die Originale bleiben unverändert, zusätzliche Kopien liegen in `originaldaten/`. Zählung und strukturbezogene Prüfungen erfassen alle Zeilen. Die inhaltliche Berechnung und Eindeutigkeitsprüfung beziehen sich auf die ausgewählten World/2022-Zeilen. Eine inhaltliche Validierung sämtlicher Länderwerte wird nicht behauptet.

| Datensatz | Originalzeilen | Bereiche | Produkt-/Indikatortitel | Fehlende Value-Felder | World2022-Zeilen |
|---|---:|---:|---:|---:|---:|
| Food Balances | {QA['fbs']['rows']:,} | {QA['fbs']['unique_areas']} | {QA['fbs']['unique_items']} | {QA['fbs']['missing_values']} | {QA['fbs']['world_2022_rows']} |
| Food Security | {QA['security']['rows']:,} | {QA['security']['unique_areas']} | {QA['security']['unique_items']} | {QA['security']['missing_values']} | {QA['security']['world_2022_rows']} |

Bereiche umfassen auch aggregierte Regionen. World wird direkt aus Code5000 gelesen, nicht durch Addieren von Ländern und Regionen erzeugt. Jahr 2022 ist ein Kalenderjahr, kein dreijähriger Durchschnitt. Die Food-Balances-Datei deckt 2010–2023 ab. Die Food-Security-Datei enthält Jahreswerte und dreijährige Perioden, die getrennt behandelt werden. Alle Jahre, Einheiten, Elemente, Flags und Häufigkeiten stehen im maschinenlesbaren Prüfnachweis.

Die vorliegende FBS-ItemCodes-Datei enthält lediglich die Kopfzeile. Deshalb gewinnt die Auswertung die tatsächlich vorhandenen Titel direkt aus der normalisierten Hauptdatei und speichert eine vollständige Itemliste. Die verwendeten Produktcodes sind explizit und disjunkt zugeordnet. Gruppensummen (29xx) werden nicht zusätzlich zu ihren Einzeltiteln addiert. Die Gruppenprüfung toleriert nur Abweichungen aus der Rundung der Ausgangsmengen.

Für das Modell ergeben sich {len(D['items'])} Einzeltitel. {included} besitzen geeignete Faktoren. Für {missing} Titel fehlen Losses-Zeilen. Fehlende Werte bleiben in der Faktorentabelle leer bzw. null und werden nicht als gemessene Null dargestellt. Die Summe 644,356 Mio. t ist die Summe erfasster Verlustwerte, keine Behauptung vollständiger Messung aller Lebensmittelverluste.

Die Flags der ausgewählten globalen FBS-Werte sind E (Estimated). Die Hungerzahl und der Bedarfswert sind ebenfalls Schätzwerte. Die Datenbasis ist keine direkte globale Messung jedes verlorenen Kilogramms. Ohne geeignete Unsicherheitsangaben wurde kein statistisches Konfidenzintervall konstruiert. Die Regler zeigen Szenario- und Nenner-Sensitivität.

## Explorative Datenanalyse

Absolute Masse und Energie führen zu anderen Rangfolgen. Getreide macht rund {fmt(next(g for g in groups if g['name']=='Getreide')['mass_mt']/D['loss_mass_mt']*100)} % der erfassten Masse aus, aber {fmt(next(g for g in groups if g['name']=='Getreide')['energy_kcal']/D['energy_kcal']*100)} % der Modellenergie. Große Mengen wasserreichen Gemüses tragen weniger Energie pro kg. Zuckerpflanzen dominieren die Masse mit, bleiben wegen zusätzlicher Verarbeitung in dieser Rechnung ohne Energieansatz. So wird eine scheinbar naheliegende Umrechnung „alle Tonnen mal ein Durchschnittsfaktor“ als ungeeignet erkennbar.

| Gruppe | Erfasste Mio. t | Anteil Masse % | Modellenergie Bio. kcal | Anteil Energie % | Fehlende Losses-Titel |
|---|---:|---:|---:|---:|---:|
{table}

Bei vollständig fehlenden Losses-Titeln ist 0 in der Summenrechnung eine leere Teilsumme, kein gemessener Wert. Die Website zeigt diese Gruppen als „k. A.“ und erläutert den Grund. 0 Modellenergie bei ausgeschlossenen Titeln bedeutet ebenfalls keinen Nachweis von Kalorienfreiheit.

## Quellenabgrenzung

FBS-Losses umfasst die Phase nach der Ernte bis vor dem Einzelhandel, laut FAO Guidelines2017, S.16. Vorernte- und Ernteverluste fehlen. Technische Verarbeitungsverluste stecken in Umrechnungs-/Ausbeuteraten. Feed, Seed, Other uses und Food sind eigene Kategorien. FBS-Mengen können Primäräquivalente und nicht essbare Teile enthalten.

UNEP2024 schätzt global 2022 1.052 Mio.t Food Waste, einschließlich nicht essbarer Teile: 631 in Haushalten, 290 in Gastronomie und131 im Handel. Diese Zahlen bleiben als eigener Mengenblock sichtbar. Sie fließen nicht in die Kalorienrechnung ein, weil eine passende globale Produktzusammensetzung fehlt. Unterschiedliche Mengenbasen verhindern eine unkritische gemeinsame Prozentrechnung. Die lokale OWID-Datei mit Welt2022 16,45 /36,34 /79,12kg pro Kopf dient nur zur Plausibilisierung dieser Größenordnung. Datenrevision31.7.2026 und Download5.10.2026 sind dokumentiert.

## Modell und Einheiten

Für jeden passenden Einzeltitel:

```
kcal/kg = Food supply (million kcal) / Food (1000 t)
Verlustenergie kcal = Losses (1000 t) × 1.000.000 × kcal/kg
Jahresrationen = Summe Verlustenergie × Rettungsanteil / (kcal/Tag ×365)
```

Million kcal und 1000t enthalten dieselbe Größenordnung von einer Million in kcal bzw.kg. Die Division liefert daher direkt kcal/kg Bilanzmasse. Der Faktor stammt aus passender FBS-Food-Menge und Food-Energie, nicht aus dem Nahrungsangebot pro Kopf allein. Die FAO beschreibt interne Kalorienfaktoren ausdrücklich bei der Standardisierung. Verarbeitung und Primäräquivalente bleiben zur Bilanzform passend. Ein zusätzlicher pauschaler Essbarkeitsfaktor wäre hier eine zweite Korrektur.

**Entscheidende Annahme:** Rechtzeitig vermiedene oder vor dem Verderb gerettete Verluste hätten das gleiche Energie- und Ausbeuteprofil wie die Food-Versorgung desselben Titels. Selektive Verluste, Wasserverlust und andere Produktmischungen können diese Näherung verzerren. Die Werte sind keine direkt gemessenen Verlustkalorien. Ein 100-%-Szenario ist die Rechengrenze innerhalb dieser Modellannahme, keine physikalisch belegte Obergrenze über alle möglichen Verluste.

Zuckerrohr, Zuckerrüben, Baumwollsaat, Palmkerne, Kaffee, Tee und Alkohol sind ausgeschlossen. Je nach Titel fehlen geeignete Food-Nenner oder die direkte Ernährungsnutzung passt nicht. Alle Einzelgründe stehen in `website/daten/verlust_faktoren.csv`. Aus 644,356Mio.t erfasster Masse gehen 481,187Mio.t in die Energieberechnung ein, also74,677%. Das ist keine essbare Quote aller Abfälle.

## Vergleich mit Hunger

FAOSTAT Food Security, World2022: jährliche Zahl Unterernährter687,6Mio., Prävalenz8,6%, durchschnittlicher Energiebedarf2371kcal/Tag. 210010 ist die jährliche Zahl, 21057 der Bedarf. Der Mindestbedarf1833kcal/Tag wird dokumentiert, aber nicht als Hauptergebnis-Nenner verwendet.

Unterernährte Menschen nehmen bereits Nahrung zu sich. Die Zahl der Menschen kann deshalb nicht einfach in ein gemessenes Kaloriendefizit übersetzt werden. Der Vergleich verwendet vollständige Jahresrationen, die den vollen Referenzbedarf eines Jahres darstellen. Ein individueller Bedarf, eine ausgewogene Ernährung oder reale Lieferung werden damit nicht behauptet.

| Szenario | kcal/Tag | Jahresrationen Mio. | Verhältnis zur Vergleichszahl % |
|---|---:|---:|---:|
| 25% Rettung | 2371 | {fmt(D['full_rations_people']*.25/1e6)} | {fmt(D['full_rations_people']*.25/D['hungry_people']*100)} |
| 50% Rettung | 2371 | {fmt(D['full_rations_people']*.5/1e6)} | {fmt(D['full_rations_people']*.5/D['hungry_people']*100)} |
| 100% Rettung | 2371 | {fmt(D['full_rations_people']/1e6)} | {fmt(D['full_rations_people']/D['hungry_people']*100)} |
| 100% Rettung | 3000 | {fmt(D['energy_kcal']/(3000*365)/1e6)} | {fmt(D['energy_kcal']/(3000*365)/D['hungry_people']*100)} |

671,252143450916 Billionenkcal ergeben beim Hauptnenner775,64191Mio.Jahresrationen. Die Vergleichsschwelle liegt bei88,64916% Rettung. 50% ist ein freier Startwert. Keine Studie belegt diese globale Quote. Im Experiment ignorieren wir Kosten und weitere Verluste bei Verteilung. Nährstoffqualität und Lebensmittelsicherheit sind offene Bedingungen.

## Forschungsstand und Quellenprüfung

Die Recherchedatei enthält22 strukturierte Evidenzzeilen, Quellenstellen und Übertragungsgrenzen. Die geprüfte starke Evidenz bestimmt keinen universellen biologischen Mindestverlust. Die Aussage folgt aus der betrachteten Evidenz und ist kein mathematischer Beweis, dass ein Mindestverlust grundsätzlich nicht existiert.

REFOWAS2021 liefert kultur- und regionsspezifische Interviews. Maislagerung im randomisierten kenianischen Versuch:1,7% traditionelle Lagerung gegenüber0,4% insektenbedingtem Gewichtsverlust nach vier Monaten in hermetischen Beuteln. Die rund76% relative Reduktion betrifft ausschließlich diesen Versuch und diese Verlustart. Original-Abstract geprüft, Volltext nicht geprüft. Kühlkettenmodelle und britische Essbarkeit werden nicht global als feste Quote angewandt. WRAP2022 wurde2025 revidiert. Die Gatto/Chepeliev-Tabelle enthält2004/2007/2011/2014, kein2022.

Die gesicherte EU-PDF-Kopie von UNEP2024 überspringt die gedruckten SeitenXII–XIII. Tabelle1 und Fußnote wurden über den indexierten offiziellen Originalzugang geprüft. Die lokale PDF-Kopie enthält diese Tabelle nicht. Alle Einschränkungen stehen im Recherche-README.

## Gestaltung und Umsetzung

Der Titel „genug?“ stellt die Frage vor die Antwort. Papierfarbe, ruhige Serifenschrift und viel Abstand unterstützen die Lesereihenfolge. Grün codiert Modellenergie und Szenarien, Orange die Vergleichszahl. Farbe allein trägt keine Aussage: Beschriftungen und Zahlen stehen daneben. Die Tellerillustration ist atmosphärisch und hat keine Datenskala. Balken starten bei null, die Punktdarstellung nutzt die gleiche Punktmenge für beide Reihen und zeigt die Einheit an.

Die Dramaturgie führt durch Menge, Energie, eigenes Szenario und Einordnung. Die Methoden sind direkt am Modell verfügbar. Keine Serverpflicht: `daten.js` lädt einen vorbereiteten Datengegenstand als normales Skript. Relative CSS-/JS-/Datenlinks funktionieren mit dem Website-Ordner. Browserinteraktionen nutzen native HTML-Regler und Buttons für Tastatur, Maus und Touch. Die geführte Tour ist stoppbar. `prefers-reduced-motion` deaktiviert die gezeichnete Bewegung und die Übergänge.

Objektorientierung: `ScenarioModel` kapselt die Rechenannahmen und das Ergebnis. `FoodGroup` hält Produktdaten, Auswahlzustand und Darstellung. `GroupChart` kontrolliert Maßstab, Sortierung und Details. DOM-Events decken Hover/Fokus, Auswahl und Regler ab. `requestAnimationFrame` zeichnet die Tellerbewegung und interpoliert Änderungen der Rationspunkte. Vererbung wurde nicht künstlich eingeführt, da hier keine fachlich nötige Klassenhierarchie entsteht.

## Kursmaterialien und Anforderungen

Die tatsächlich vorliegenden Materialien liegen in `Data Projekt/2026 WS (public)`. Alle285 Dateien sind inventarisiert. Relevante Folien und Beispiele wurden nach Themen gesichtet, PDF-Text und eigene HTML/JS-Beispiele extrahiert. Bibliotheken und IDE-Konfigurationen sind als Bestand erfasst. Der Kurs verbindet Datenobjekte, CSV/JSON, Ereignisse, Regler und zeitliche Animation.

| Kursinhalt bzw. Abgabeanforderung | Umsetzung |
|---|---|
| Day1: Daten, Information, Wissen, Datenobjekte | Rohdaten, Modellannahme und Interpretation getrennt. Klassen mit Daten/Zustand/Verhalten. |
| Day2: Hover, Auswahl, Dragging, GUI | Produktdetails bei Hover/Fokus, Klickauswahl, native veränderbare Regler, Toursteuerung. |
| Day3: CSV und absolute/relative Werte | Streaming-Auswertung, Faktorentabelle, Produktanteile, Vergleichsverhältnis. |
| Day4: JSON und Objektlisten | Vorberechnetes JSON und Produktobjekte, IDs, vollständige Datenexports. |
| Day5: Zeit und Animation | Echtzeitreaktion der Regler, gezeichnete Bewegung, Tour und 96s-Animatic. Jahresauswertung bewusst auf2022 begrenzt. |
| Vollständige kohärente explorative Datenanalyse | Originaldateizählung, Jahre/Flags/Einheiten, Gruppenprüfung, fehlende Werte und Tabellen oben. |
| Fragestellung und verständliche Interaktion | Frage als Einstieg, gezielte Kapitel, Bedingung als Ergebnis. |
| Demonstration und Präsentation | Offlinewebsite und neun Folien mit Sprechernotizen. |
| MP4 höchstens zwei Minuten | Geprüfte finale Datei96,00s,720p,H.264,keine Musik. |
| Quellen, Quellcode und Daten | Originaldatenkopien, SHA256, vollständiger Website-Code und zusätzliche Quellen. |
| Bilder und Skizzen | Bearbeitbare SVG-Skizzen, Screenshots, Film- und Folienbilder, Storyboard. |
| Hochschule, Semester, Lehrender, Studierende | Hochschule,WS2026,Prof.Dr.FranklinHernández-Castro enthalten. Namen auf ausdrücklichen Wunsch offen. |
| Teamfoto mit Namen | Noch zu ergänzen. Kein echtes Foto lag vor, keines erfunden. |

## Reproduzierbarkeit und Qualitätsprüfung

`auswertung.py` nutzt die Python-Standardbibliothek. Es liest die unveränderten Kopien, wählt World2022, prüft eindeutige Schlüssel und disjunkte Titel, erzeugt CSV/JSON und die eingebettete Browserdatendatei. Die Originaldateien sind per SHA256 identifiziert. Eine erneute vollständige Ausführung auf den Kopien lieferte dieselben Modellwerte. Die Energieberechnung wurde zusätzlich mit Decimal-Arithmetik unabhängig aus den Original-Weltzeilen nachgerechnet.

Szenarioprüfung:0%,25%,50%,100%, Vergleichsschwelle,1800/3000kcal, ungültige Eingaben, fehlende Losses und Summen wurden geprüft. Im Browser bestätigt:100%=775,6Mio.;0%=0;3000kcal+100%=613,0Mio.;Reset=387,8Mio. Maßstabswechsel, Produktwahl und unbekannte Fischverluste funktionieren. Keine JavaScript-Fehler beobachtet. Mobile Darstellung im390px-Testframe,375px Inhaltsbreite einschließlich Scrollbar, ohne horizontalen Überlauf. Desktop geprüft.

Der In-App-Browser blockiert direkte file-URLs. Deshalb ist der Browserfunktionstest lokal über HTTP durchgeführt, nicht als tatsächlicher file-Protokolltest. Die Website nutzt keine Netzwerk-Datenabfragen oder externen Bibliotheken und ist für den Doppelklickstart konzipiert. Browser-Sicherheitsregeln wurden nicht umgangen.

Die Präsentation besteht Paket-, Geometrie-, Schrift-, Diagrammdaten- und Importprüfungen. Drei Diagramme sind nativ editierbar mit eingebetteten Daten-Snapshots. Alle neun finalen Folien wurden einzeln visuell geprüft. Das ist keine native PowerPoint-Öffnungsprüfung. Die MP4 wurde vollständig mit FFmpeg decodiert, auf96,00s kontrolliert und an sechs Szenen visuell geprüft. Der Container wurde ohne neue Bildkodierung finalisiert.

## Ausblick

Für eine empirische Vermeidbarkeitsrechnung wären stufen-, produkt- und regionsspezifische Verlustzusammensetzungen und Maßnahmen nötig. Eine genaue Hunger-Lückenrechnung braucht Angaben zur Verteilung der Nahrungsaufnahme und zum jeweiligen Defizit. Die vorhandenen Personenzahlen reichen dafür nicht. Eine spätere Erweiterung kann Länder vergleichen, muss aber alle Bezugsgrößen und Revisionen konsistent halten.

## Quellen

'''+''.join(f"- {s['label']}: {s['url']}\n" for s in D['sources'])+'''
Weitere Originalquellen und genaue Prüfstellen stehen in `recherche/Recherche_vermeidbare_Verluste.md` und der Evidenz-CSV. Die Recherche ist keine vollständige systematische Meta-Analyse.

Credits: HfG Schwäbisch Gmünd, Wintersemester2026, Prof.Dr.FranklinHernández-Castro, Studierende: Namen offen. Eigene Gestaltung, Code und Animation mit Unterstützung von Codex. Keine Fremdmusik.
'''
for old,new in {
 '4,820,497':'4.820.497','287,735':'287.735','World2022':'World 2022','Code5000':'Code 5000',
 'FAO Guidelines2017':'FAO Guidelines 2017','UNEP2024':'UNEP 2024','WRAP2022':'WRAP 2022',
 'REFOWAS2021':'REFOWAS 2021','Mio.t':'Mio. t','Mio.Jahresrationen':'Mio. Jahresrationen',
 'Mio.Unterernährtejährlich2022':'Mio. Unterernährte im Jahr 2022','Millionenkcal':'Millionen kcal',
 'Billionenkcal':'Billionen kcal','Food-Versorgung':'Food-Versorgung',
 '687,6Mio.':'687,6 Mio.','Prävalenz8,6':'Prävalenz 8,6','Mindestbedarf1833':'Mindestbedarf 1833',
 'alle285':'alle 285','Day1':'Day 1','Day2':'Day 2','Day3':'Day 3','Day4':'Day 4','Day5':'Day 5',
 'Prof.Dr.FranklinHernández-Castro':'Prof. Dr. Franklin Hernández-Castro',
 'Prof.Dr.Franklin Hernández-Castro':'Prof. Dr. Franklin Hernández-Castro',
 'Wintersemester2026':'Wintersemester 2026','WS2026':'WS 2026',
 '96s-Animatic':'96-s-Animatic','375px':'375 px','390px':'390 px',
 '96,00s,720p,H.264,keine':'96,00 s, 720p, H.264, keine',
 '31.7.2026':'31. Juli 2026','5.10.2026':'5. Oktober 2026',
 'beinhaltet2004':'beinhaltet 2004','enthält2004':'enthält 2004','kein2022':'kein 2022',
 'bedarf2371':'bedarf 2371','Unterernährter687':'Unterernährter 687',
 'Trade2022':'Trade 2022','Positionen(29xx)':'Positionen (29xx)',
 'gedruckten SeitenXII':'gedruckten Seiten XII','Tabelle1':'Tabelle 1',
 'sindE':'sind E','Tag ×365':'Tag × 365','kcal bzw.kg':'kcal bzw. kg',
 'Millio':'Millio',
 'und131':'und 131','Welt2022':'Welt 2022','Datenrevision31':'Datenrevision 31','Download5':'Download 5',
 'also74':'also 74','Hauptnenner775':'Hauptnenner 775','bei88':'bei 88','enthält22':'enthält 22',
 'Versuch:1':'Versuch: 1','gegenüber0':'gegenüber 0','rund76':'rund 76','wurde2025':'wurde 2025',
 'Alle285':'Alle 285','auf2022':'auf 2022','Datei96':'Datei 96','im390':'im 390','auf96,00s':'auf 96,00 s',
 'Szenarioprüfung:0 %,25 %,50 %,100 %':'Szenarioprüfung: 0 %, 25 %, 50 %, 100 %',
 'Vergleichsschwelle,1800':'Vergleichsschwelle, 1800','bestätigt:100 %=775,6 Mio.;0 %=0;3000 kcal+100 %=613,0 Mio.;Reset=387,8 Mio.':'bestätigt: 100 % = 775,6 Mio.; 0 % = 0; 3000 kcal + 100 % = 613,0 Mio.; Reset = 387,8 Mio.',
}.items():doc=doc.replace(old,new)
doc=re.sub(r'(\d)(?=Mio\.|kcal|kg|t\b|%)',r'\1 ',doc)
doc=re.sub(r'(\d)%',r'\1 %',doc)
doc=doc.replace('Mio. t.','Mio. t.').replace('sind ebenfalls Schätzwerte.','sind ebenfalls Schätzwerte.')
(HERE/'abgabe'/'Dokumentation.md').write_text(doc,encoding='utf-8')
receipt=json.loads((HERE/'build/praesentation.final.validation.json').read_text(encoding='utf-8'))
verification={'date':'2026-10-05','original_copy_hash_checks':originalchecks,'decimal_energy_kcal':str(independent),
 'relative_error_float_vs_decimal':abs(float(independent)-D['energy_kcal'])/D['energy_kcal'],
 'presentation':{'file':'abgabe/Genug_Praesentation_final.pptx','sha256':receipt['finalSha256'],'slides':9,'native_charts':3,'structure_pass':True,'visually_reviewed_slides':9,'native_powerpoint_opening_verified':False},
 'video':{'file':'abgabe/Genug_Animatic_final.mp4','duration_seconds':96,'dimensions':[1280,720],'fully_decoded':True,'reviewed_frame_seconds':[3,16,30,54,72,90],'audio':False},
 'browser':{'desktop':True,'mobile_frame_width_px':390,'mobile_content_width_px':375,'horizontal_overflow':False,'javascript_errors_observed':0,'file_protocol_test':'Blocked by in-app browser URL policy. No bypass attempted.','tests':['mass_to_energy','product_selection','unknown_loss_values','zero_rescue','full_rescue','high_daily_requirement','reset','mobile_full_rescue']},
 'open_items':['Student names intentionally open per user request','Actual team photo with names absent']}
(HERE/'abgabe'/'Pruefbericht.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2),encoding='utf-8')
print('Dokumentation, Quellen, Bilder und unabhängige Prüfung abgeschlossen.',flush=True)
# Only the standalone website folder is archived here. Full project ZIP is built separately.
with zipfile.ZipFile(HERE/'Genug_Website.zip','w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
    for p in sorted((HERE/'website').rglob('*')):
        if p.is_file():z.write(p,'Genug_Website/'+str(p.relative_to(HERE/'website')).replace('\\','/'))
print('Website-ZIP erstellt.',flush=True)
