import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='C:/Users/J5sua/Documents/HfG/3D Denken/Data Projekt/Projekt_Welthunger';
const SKILL='C:/Users/J5sua/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const PY='C:/Users/J5sua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/J5sua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {resolvePresentationFont,applyPresentationChartFont,finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const FONT=resolvePresentationFont({fontFamily:'Georgia'});
const D=JSON.parse(await fs.readFile(path.join(ROOT,'website/daten/modell.json'),'utf8'));
const P=Presentation.create({slideSize:{width:1280,height:720}});
const C={paper:'#F5F2E8',ink:'#202B21',green:'#496849',orange:'#C25C34',muted:'#60685C',lime:'#DBE5A1'};
const format=v=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v);
function text(s,value,x,y,w,h,size=26,color=C.ink,bold=false){const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=value;z.text.style={typeface:FONT,fontSize:size,color,bold,autoFit:'none'};return z;}
function rect(s,x,y,w,h,color){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0}});}
function slide(title,notes='',dark=false){const s=P.slides.add();s.background.fill=dark?C.ink:C.paper;const fg=dark?C.paper:C.ink;text(s,title,60,54,1140,145,50,fg);text(s,'genug?   /   Welt 2022',60,675,900,24,14,dark?C.lime:C.muted);text(s,String(P.slides.items.length).padStart(2,'0'),1150,675,60,24,14,fg);s.speakerNotes.textFrame.setText(notes);return s;}
function chart(s,categories,series,x,y,w,h){const q=s.charts.add('bar',{position:{left:x,top:y,width:w,height:h},categories,series:series.map(v=>({...v,valuesFormatCode:'0.0',dataLabelOverrides:v.values.map((n,idx)=>({idx,text:n?format(n):'',showValue:false,textStyle:{typeface:FONT,fontSize:19,fill:C.ink}}))})),barOptions:{direction:'bar',grouping:'clustered'},hasLegend:false,xAxis:{visible:false,min:0,majorGridlines:null},yAxis:{textStyle:{typeface:FONT,fontSize:20,fill:C.muted},line:{fill:'#D3D5C7',width:1}},dataLabels:{showValue:true,position:'outEnd',textStyle:{typeface:FONT,fontSize:19,fill:C.ink}}});applyPresentationChartFont(q,{fontFamily:FONT});return q;}
let s=slide('Könnte verschwendetes Essen\nden Welthunger stillen?','Einstieg: Die Frage kurz stehen lassen. Das Projekt ist ein hypothetisches globales Rechenexperiment. Jahr2022. Die Website ist unter website/index.html offline startbar. Alle Illustrationen und Code für dieses Projekt erstellt.');
text(s,'Eine Datenreise über Lebensmittelverluste\nund vollständige Jahresrationen.',65,315,800,110,31,C.green);
text(s,'HfG Schwäbisch Gmünd\nWintersemester 2026\nStudierende: Namen offen',65,510,800,110,22);
for(let i=0;i<3;i++)s.shapes.add({geometry:'ellipse',position:{left:950+i*18,top:340+i*18,width:230-i*36,height:230-i*36},fill:i===2?C.lime:'none',line:{fill:C.green,width:1}});
s=slide('Die Rechnung beginnt\nnach der Ernte.',D.sources.map(q=>q.label+': '+q.url).join('\n')+'\nDie Originaldateien umfassen 4.820.497 FBS- und287.735 Food-Security-Zeilen. World2022: 2.195 und75 Zeilen. Ganze CSV-Dateien werden gestreamt. FBS-Itemliste lokal leer, deshalb Einzeltitel direkt abgeleitet und explizit disjunkt zugeordnet. Kein Vermischen von Ländern, Regionen und World. Keine drei-Jahreswerte mit Jahreswerten mischen.');
text(s,'5.108.232',65,240,650,115,86,C.green);text(s,'Originalzeilen in zwei FAOSTAT-Dateien geprüft',70,356,1070,48,25);
rect(s,65,455,280,80,'#E3E8D1');text(s,'Ernte',90,477,230,40,27);rect(s,370,455,540,80,C.green);text(s,'Lagerung, Transport, Verarbeitung',392,476,496,50,26,C.paper);text(s,'Handel und\nKonsum',955,463,250,80,26);
text(s,'Modell: FBS-Verluste bis vor dem Einzelhandel.\nUNEP-Konsumabfälle bleiben separat, ohne Kalorienrechnung.',65,563,1120,80,23);
s=slide('Getreide und Zuckerpflanzen\nprägen die erfasste Verlustmasse.','Quelle: '+D.sources[0].url+'\nWorld2022, Losses5123 in1000t, disjunkte Einzeltitel ohne Gruppensummen. Fehlende Losses, insbesondere Fisch, sind keine gemessenen Nullen. Die Summe vorhandener Zeilen beträgt644.356Mio.t. Native editierbares Balkendiagramm.');
const top=[...D.groups].sort((a,b)=>b.mass_mt-a.mass_mt).slice(0,6);
chart(s,top.map(g=>g.name),[{name:'Erfasste Verluste in Mio. t',values:top.map(g=>+g.mass_mt.toFixed(3)),fill:C.green}],55,220,1120,350);
text(s,format(D.loss_mass_mt)+' Mio. t erfasste Verluste insgesamt',65,593,1090,50,28,C.green);
s=slide('Der Faktor folgt dem Produkt.','FAO-Handbuch Standardisierung: '+D.sources[2].url+'\nEffektiver Faktor: million kcal Food supply661 /1000t Food5142 desselben Titels. Das ergibtkcal/kg. Primäräquivalente und Energieausbeute bleiben passend. Keine zweite pauschale Essbarkeitsreduktion. Annahme: gerettete Losses haben Energieprofil vonFood. Der Faktor ist nicht gemessener Verlustnährwert.');
const fact=[2511,2807,2514,2601,2848].map(i=>D.items.find(q=>q.code===i));chart(s,fact.map(i=>i.name),[{name:'Effektive kcal pro kg Bilanzmasse',values:fact.map(i=>Math.round(i.effective_kcal_kg)),fill:C.orange}],55,225,1110,350);
text(s,'Effektive kcal pro kg Bilanzmasse, abgeleitet aus FBS Food',65,590,1100,40,24);
s=slide('671,3 Billionen kcal\nin den berücksichtigten Verlusten.',D.sources[0].url+'\n'+D.sources[2].url+'\nSumme671252143450915.9kcal. 481.187Mio.t einbezogen von644.356erfasst. Ausgeschlossen: Zuckerpflanzen, Baumwollsaat, Palmkerne, Kaffee, Tee, Alkohol, fehlendeLosses/ungeeigneterNenner. Diese Ausschlüsse sind methodisch vorsichtig, keine konservative Untergrenze, weil Faktoren selbst unsicher sind. Kein statistisches Konfidenzintervall behaupten.',true);
text(s,'481,2',65,245,600,115,91,C.lime);text(s,'Mio. t für das Kalorienmodell berücksichtigt',70,365,1110,55,26,C.paper);
text(s,'Verlustmasse × passender Food-Faktor\nAnnahme: gleiches Energie- und Ausbeuteprofil',65,455,1110,105,31,C.paper);
text(s,'Die übrige erfasste Masse bleibt ohne Kalorienwert.',65,605,1110,40,24,C.lime);
s=slide('Die Rettungsquote verändert\ndas theoretische Potenzial.','QuelleFAOSTATFBS undFS: '+D.sources[0].url+'\n'+D.sources[1].url+'\nEnergiebedarf2371kcal/d,365Tage.25%=193.910477Mio.,50%=387.820955Mio.,100%=775.64191Mio.Jahresrationen.687.6Mio.Unterernährtejährlich2022. Szenarienfrei, keinegemessene globaleVermeidbarkeit. Unterernährteessenbereits. VergleichekeinegemesseneKalorienlücke.');
chart(s,['25 % Rettung','50 % Rettung','100 % Rettung','Unterernährte'],[{name:'Jahresrationen in Mio.',values:[D.full_rations_people*.25/1e6,D.full_rations_people*.5/1e6,D.full_rations_people/1e6,0].map(v=>+v.toFixed(1)),fill:C.green},{name:'Unterernährte Menschen in Mio.',values:[0,0,0,687.6],fill:C.orange}],50,220,1120,345);
text(s,'Millionen Jahresrationen bzw. Menschen',65,586,1100,35,24);text(s,'Volle Ration: 2.371 kcal pro Tag für 365 Tage. Rettungsszenarien frei gewählt.',65,629,1100,32,20);
s=slide('Die Website macht\ndie Annahmen veränderbar.','Live-Demo: website/index.html öffnen. Tonnen und Kalorien im Produktdiagramm wechseln, Gemüse anklicken,50%Rettung auf100%ändern, Tagesbedarfändern, Szenarioexportieren.\nKursbezug: CSV/JSON mitDatenobjekten. FoodGroup kapselt Daten+Auswahlzustand+Darstellung. ScenarioModel kapselt Rechnung. GroupChart steuert Sortierung, Hover undClick. Die Animationsschleife interpoliert Punkte und zeichnet Teller mit requestAnimationFrame. SemantischeHTML-Controls ersetzenp5-Canvasbedienung, damitTab/Pfeiltasten/Touchfunktionieren.\nCode: website/modell.js undapp.js. Kursmaterialgelesen: day1bisday5.');
text(s,'Tonnen oder Kalorien',65,245,1110,60,36,C.green);text(s,'Produktgruppen auswählen, Details per Hover oder Fokus',65,308,1120,50,26);
text(s,'Geretteten Anteil selbst einstellen',65,407,1110,60,36,C.green);text(s,'Tagesbedarf verändern, Ergebnis animieren, Szenario speichern',65,470,1120,65,26);
text(s,'Offline startbar mit index.html. Tastatur und reduzierte Bewegung unterstützt.',65,605,1120,45,22);
s=slide('88,6 % Rettung wären\nfür den Vergleich nötig.','FAOSTATJahr2022: threshold=687600000*2371*365/671252143450915.9=.886491551. Das ist eine theoretische Vergleichsschwelle, keine technisch erreichbare Quote. Kein universeller biologischerMindestverlustbelegt. MaisRCT:insektenbedingterGewichtsverlust1.7zu0.4%nach4Monaten (nurOriginalabstractgeprüft), doi10.1016/j.cropro.2016.08.007. GlobaleAnwendungunzulässig. KostenundweitereVerteilungsverlusteignoriert, keineMikronährstoffeoderSicherheitgeprüft.');
text(s,'Das Modell zeigt eine Größenordnung.',65,250,1100,70,40,C.green);
text(s,'Die globale Rettbarkeit bleibt offen.\nDie Zahl der Unterernährten misst kein Kaloriendefizit.\nZugang und Qualität entscheiden mit.',65,365,1130,170,30);
text(s,'Ein großer Energieverlust begründet Potenzial.\nEr beweist keine automatische Lösung des Welthungers.',65,575,1110,75,26);
s=slide('Quellen, Code und Credits','Quellen vollständig inwebsite/dokumentation.html, Recherche_vermeidbare_Verluste.md und Recherche_vermeidbare_Verluste_Evidenz.csv. OriginalquelleninRecherche_Quellen. KursanforderungVideoMax2min undFoto mitNamen:Video96s, Namenbewusstoffen aufNutzerwunsch. Teamfoto muss vomMenschen kommen, keinAuthentischesFotoerfinden.\nHfGSchwäbischGmündWintersemester2026. Prof.Dr.FranklinHernández-Castro. Kurs:3-dimensionaleGrundlagenimmedialenRaum. EigeneIllustrationenundCode, UnterstützungCodex, keineMusik.');
text(s,'FAOSTAT Food Balances und Food Security, World 2022\nFAO FBS Handbook und Guidelines 2017\nUNEP Food Waste Index 2024, Tabelle 1',65,225,1110,160,28);
text(s,'HfG Schwäbisch Gmünd · Wintersemester 2026\nProf. Dr. Franklin Hernández-Castro\nStudierende: Namen offen',65,443,1110,135,26,C.green);
text(s,'Eigene Grafiken und Animation. Unterstützung: Codex.\nDatenprüfung und Recherche: 5. Oktober 2026.',65,602,1110,58,19);
await fs.mkdir(path.join(ROOT,'build/slides'),{recursive:true});
const candidatePath=path.join(ROOT,'build/candidate.pptx');
await (await PresentationFile.exportPptx(P)).save(candidatePath);
const finalPath=path.join(ROOT,'abgabe/Genug_Praesentation_final.pptx');
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath,finalPath,pythonExecutable:PY,
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 explicitTotalSlideCount:9,requiredNativeChartOwnerSlides:[3,4,6],materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:[FONT]},verifyArtifactToolImport:true,
 receiptPath:path.join(ROOT,'build/praesentation.final.validation.json')});
console.log(JSON.stringify(result));
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
for(let i=0;i<final.slides.items.length;i++){const slide=final.slides.items[i];const image=await final.export({slide,format:'png',scale:1});await fs.writeFile(path.join(ROOT,'build/slides',`slide-${i+1}.png`),new Uint8Array(await image.arrayBuffer()));}
console.log('Finale Folien gerendert.');
