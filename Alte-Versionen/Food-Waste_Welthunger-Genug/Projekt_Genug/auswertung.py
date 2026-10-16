"""Reproduzierbare Auswertung der unveränderten lokalen FAOSTAT-Dateien.
Ausführen: python auswertung.py. Keine zusätzlichen Pakete erforderlich.
"""
import csv, json, hashlib, math
from collections import Counter, defaultdict
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE/'originaldaten' if (HERE/'originaldaten').is_dir() else HERE.parent
OUT=HERE/'website'/'daten'
OUT.mkdir(parents=True,exist_ok=True)
GROUPS={
 'Getreide':[2511,2807,2513,2514,2515,2516,2517,2518,2520],
 'Wurzeln & Knollen':[2532,2531,2533,2535,2534],
 'Zuckerpflanzen':[2536,2537], 'Zucker & Honig':[2541,2542,2543,2745],
 'Hülsenfrüchte':[2546,2547,2549], 'Nüsse':[2551],
 'Ölpflanzen':[2555,2552,2557,2558,2559,2560,2561,2562,2563,2570],
 'Pflanzenöle':[2571,2572,2573,2574,2575,2576,2577,2578,2579,2580,2581,2582,2586],
 'Gemüse':[2601,2602,2605],
 'Obst':[2611,2612,2613,2614,2615,2616,2617,2618,2619,2620,2625],
 'Kaffee, Kakao & Tee':[2630,2633,2635], 'Gewürze':[2640,2641,2642,2645],
 'Alkohol':[2655,2656,2657,2658,2659], 'Fleisch':[2731,2732,2733,2734,2735],
 'Innereien':[2736], 'Tierische Fette':[2740,2743,2737,2781,2782],
 'Eier':[2744], 'Milch':[2848], 'Fisch & Meeresfrüchte':[2761,2762,2763,2764,2765,2766,2767,2769],
 'Wasserpflanzen & Meeressäuger':[2768,2775], 'Sonstiges':[2680,2899]
}
AGGREGATES=dict(zip(GROUPS,[2905,2907,2908,2909,2911,2912,2913,2914,2918,2919,2922,2923,2924,2943,2945,2946,2949,2948,2960,2961,2928]))
EXCLUDE={2536:'Zuckerrohr: zusätzliche Verarbeitung zu Zucker wäre nötig.',2537:'Zuckerrüben: zusätzliche Verarbeitung zu Zucker wäre nötig.',
2559:'Baumwollsaat: direkte Verzehrbarkeit ungeeignet.',2562:'Palmkerne: keine positive Food-Menge für einen internen Faktor.',
2630:'Kaffee: Getränkezubereitung und Verlustform nicht vergleichbar.',2635:'Tee: Getränkezubereitung und Verlustform nicht vergleichbar.',
2655:'Alkohol zählt hier nicht als Ernährungsration.',2656:'Alkohol zählt hier nicht als Ernährungsration.',2657:'Alkohol zählt hier nicht als Ernährungsration.',2658:'Alkohol zählt hier nicht als Ernährungsration.',2659:'Nicht für Lebensmittel bestimmter Alkohol.'}
GERMAN={2511:'Weizen',2807:'Reis',2514:'Mais',2531:'Kartoffeln',2532:'Maniok',2601:'Tomaten',2602:'Zwiebeln',2615:'Bananen',2617:'Äpfel',2848:'Milch',2744:'Eier',2605:'Sonstiges Gemüse',2625:'Sonstiges Obst'}
GERMAN.update({2513:'Gerste',2515:'Roggen',2516:'Hafer',2517:'Hirse',2518:'Sorghum',2520:'Sonstiges Getreide',2533:'Süßkartoffeln',2535:'Yams',2534:'Sonstige Wurzeln',2536:'Zuckerrohr',2537:'Zuckerrüben',2541:'Nicht zentrifugierter Zucker',2542:'Zucker (Rohzuckeräquivalent)',2543:'Sonstige Süßungsmittel',2745:'Honig',2546:'Bohnen',2547:'Erbsen',2549:'Sonstige Hülsenfrüchte',2551:'Nüsse',2555:'Sojabohnen',2552:'Erdnüsse',2557:'Sonnenblumenkerne',2558:'Raps- und Senfsaat',2559:'Baumwollsaat',2560:'Kokosnüsse inkl. Kopra',2561:'Sesamsaat',2562:'Palmkerne',2563:'Oliven',2570:'Sonstige Ölpflanzen',2571:'Sojaöl',2572:'Erdnussöl',2573:'Sonnenblumenöl',2574:'Raps- und Senföl',2575:'Baumwollsaatöl',2576:'Palmkernöl',2577:'Palmöl',2578:'Kokosöl',2579:'Sesamöl',2580:'Olivenöl',2581:'Reiskleieöl',2582:'Maiskeimöl',2586:'Sonstige Pflanzenöle',2611:'Orangen und Mandarinen',2612:'Zitronen und Limetten',2613:'Grapefruit',2614:'Sonstige Zitrusfrüchte',2616:'Kochbananen',2618:'Ananas',2619:'Datteln',2620:'Trauben (ohne Wein)',2630:'Kaffee',2633:'Kakaobohnen',2635:'Tee inkl. Mate',2640:'Pfeffer',2641:'Piment',2642:'Gewürznelken',2645:'Sonstige Gewürze',2655:'Wein',2656:'Bier',2657:'Fermentierte Getränke',2658:'Alkoholische Getränke',2659:'Alkohol (nicht als Nahrung)',2731:'Rindfleisch',2732:'Schaf- und Ziegenfleisch',2733:'Schweinefleisch',2734:'Geflügelfleisch',2735:'Sonstiges Fleisch',2736:'Essbare Innereien',2740:'Butter und Ghee',2743:'Sahne',2737:'Rohe tierische Fette',2781:'Fischkörperöl',2782:'Fischleberöl',2761:'Süßwasserfisch',2762:'Bodenfisch',2763:'Pelagischer Fisch',2764:'Sonstiger Meeresfisch',2765:'Krebstiere',2766:'Kopffüßer',2767:'Sonstige Weichtiere',2769:'Sonstige Wassertiere',2771:'Fleisch von Meeressäugern',2775:'Wasserpflanzen',2680:'Säuglingsnahrung',2899:'Verschiedenes'})

def dump(name,data):
    (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def write_csv(name,rows,fields=None):
    with (OUT/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)
def scan(folder):
    path=next((ROOT/folder).glob('*Normalized*.csv'))
    counters={k:Counter() for k in ['Year','Flag','Unit','Element','Area']}
    count=missing=0;items={};selected=[];keys=set()
    with path.open(encoding='utf-8-sig',newline='') as f:
        for r in csv.DictReader(f):
            count+=1;missing+=not bool(r['Value'].strip());items[r['Item Code']]=r['Item']
            for k,c in counters.items(): c[r[k]]+=1
            if r['Area Code']=='5000' and r['Year']=='2022':
                key=(r['Item Code'],r['Element Code'])
                assert key not in keys,('duplicate World2022',key)
                keys.add(key);selected.append(r)
    sha=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(4*1024*1024),b''):sha.update(block)
    meta={'path':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,'sha256':sha.hexdigest(),'rows':count,'missing_values':missing,
      'unique_areas':len(counters['Area']),'unique_items':len(items),'years':dict(counters['Year']),
      'flags':dict(counters['Flag']),'units':dict(counters['Unit']),'elements':dict(counters['Element']),
      'world_2022_rows':len(selected),'world_2022_duplicate_keys':0}
    print(folder, count, 'Zeilen geprüft.',flush=True)
    write_csv(folder+'_World2022.csv',selected);dump(folder+'_items.json',items)
    return selected,meta

fbs,fbsmeta=scan('FoodBalanceSheets')
security,securitymeta=scan('Food_Security_Data')
table=defaultdict(dict);names={};flags=defaultdict(dict)
for r in fbs:
    code=int(r['Item Code']);names[code]=r['Item']
    if r['Value'].strip():table[code][int(r['Element Code'])]=float(r['Value'])
    flags[code][int(r['Element Code'])]=r['Flag']
leafcodes=[i for ids in GROUPS.values() for i in ids]
assert len(leafcodes)==len(set(leafcodes))
assert all(i<2900 for i in leafcodes)
assert set(i for i in table if i<2900 and i!=2501)==set(leafcodes)
items=[];groups=[];checks=[]
for group,ids in GROUPS.items():
    for code in ids:
        t=table[code];loss=t.get(5123);food=t.get(5142);foodkcal=t.get(661)
        reason=EXCLUDE.get(code)
        if loss is None:reason='Keine Losses-Zeile vorhanden. Fehlender Wert bleibt unbekannt.'
        elif not reason and (not food or foodkcal is None):reason='Kein positiver, passender Food-Nenner und Energiezähler.'
        density=None if reason else foodkcal/food # million kcal / thousand t = kcal/kg
        kcal=None if density is None else loss*1e6*density # thousand t -> kg
        if density is not None:assert 0<=density<=12000
        items.append({'code':code,'name':GERMAN.get(code,names[code]),'source_name':names[code],'group':group,
         'loss_1000t':loss,'food_1000t':food,'food_million_kcal':foodkcal,'effective_kcal_kg':density,
         'loss_kcal':kcal,'included':density is not None,'exclusion':reason,'flag_loss':flags[code].get(5123),
         'flag_food':flags[code].get(5142),'flag_kcal':flags[code].get(661)})
    subset=[i for i in items if i['group']==group]
    groups.append({'name':group,'mass_mt':sum(i['loss_1000t'] or 0 for i in subset)/1000,
     'energy_kcal':sum(i['loss_kcal'] or 0 for i in subset),'included_mass_mt':sum(i['loss_1000t'] or 0 for i in subset if i['included'])/1000,
     'missing_loss_items':sum(i['loss_1000t'] is None for i in subset)})
    leafsum=sum(i['loss_1000t'] or 0 for i in subset);agg=table[AGGREGATES[group]].get(5123)
    delta=None if agg is None else leafsum-agg
    assert delta is None or abs(delta)<=len(ids),('aggregate mismatch',group,delta)
    checks.append({'group':group,'aggregate_code':AGGREGATES[group],'leaf_loss_1000t':leafsum,'aggregate_loss_1000t':agg,'rounding_delta_1000t':delta})
sec={(int(r['Item Code']),r['Element']):float(r['Value']) for r in security if r['Value'].strip() and r['Item Code'].isdigit()}
hungry=sec[(210010,'Value')]*1e6
reference=sec[(21056,'Value')] # Fester World-2022-MDER, keine individuelle Empfehlung.
energy=sum(i['loss_kcal'] or 0 for i in items)
mass=sum(i['loss_1000t'] or 0 for i in items)/1000
incmass=sum(i['loss_1000t'] or 0 for i in items if i['included'])/1000
consumerpath=ROOT/'Food_Waste_Consumer'/'food-waste-per-capita_OWID.csv'
with consumerpath.open(encoding='utf-8-sig',newline='') as f:consumer=list(csv.DictReader(f))
worldconsumer=[r for r in consumer if r['Entity']=='World' and r['Year']=='2022']
metadata={'fbs':fbsmeta,'security':securitymeta,'consumer':{'rows':len(consumer),'world_2022':worldconsumer,'path':str(consumerpath.relative_to(ROOT)),
 'sha256':hashlib.sha256(consumerpath.read_bytes()).hexdigest()},'group_crosschecks':checks,
 'method':'FBS-Einzeltitel, World2022. Faktor = Food supply (million kcal) / Food (1000 t) in kcal/kg. Gleiches Energie- und Ausbeuteprofil für gerettete Verlustmasse wie für Food ist eine Modellannahme.',
 'exclusion_policy':'Zuckerpflanzen, Baumwollsaat, Palmkerne, Kaffee, Tee, Alkohol ausgeschlossen. Fehlende Losses nicht als gemessene Null interpretiert.',
 'source_download_date':'2026-10-05','analysis_date':'2026-10-05'}
data={'year':2022,'area':'World','loss_mass_mt':mass,'included_mass_mt':incmass,'energy_kcal':energy,'hungry_people':hungry,
 'hunger_pct':sec[(210040,'Value')],'reference_kcal':reference,'minimum_kcal':sec[(21056,'Value')], 'average_kcal':sec[(21057,'Value')],
 'population':table[2501][511]*1000,'supply_kcal_day':table[2901][664],
 'full_rations_people':energy/(reference*365),'threshold_fraction':hungry*reference*365/energy,
 'consumer_mass_mt':{'Haushalte':631,'Gastronomie':290,'Handel':131},
 'groups':groups,'items':items,'source_rows':fbsmeta['rows']+securitymeta['rows'],
 'sources':[
 {'label':'FAOSTAT Food Balances','url':'https://www.fao.org/faostat/en/#data/FBS'},
 {'label':'FAOSTAT Food Security','url':'https://www.fao.org/faostat/en/#data/FS'},
 {'label':'FAO: Standardisierung & interne Kalorienfaktoren','url':'https://www.fao.org/4/X9892E/X9892e04.htm'},
 {'label':'FAO: Definition Unterernährung','url':'https://www.fao.org/measuring-hunger/access-to-dietary-energy/frequently-asked-questions/'},
 {'label':'FAO: FBS Guidelines 2017, S.16','url':'https://www.fao.org/3/ca6404en/ca6404en.pdf'},
 {'label':'UNEP Food Waste Index 2024, Tabelle 1','url':'https://www.unep.org/resources/publication/food-waste-index-report-2024'}]}
dump('modell.json',data);dump('pruefnachweis.json',metadata)
write_csv('verlust_faktoren.csv',items)
(HERE/'website'/'daten.js').write_text('window.PROJECT_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
assert energy>0 and hungry>0 and reference>0
assert math.isclose(sum(g['energy_kcal'] for g in groups),energy,rel_tol=1e-12)
print(json.dumps({k:data[k] for k in ['loss_mass_mt','included_mass_mt','energy_kcal','hungry_people','reference_kcal','full_rations_people','threshold_fraction']},indent=2))
print('OWID World2022',worldconsumer)
