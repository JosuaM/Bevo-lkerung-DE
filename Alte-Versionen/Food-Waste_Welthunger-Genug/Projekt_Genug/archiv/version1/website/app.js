/* Eigenständige Datenobjekte, Hover-Auswahl, Regler und Animation.
   Keine externen Bibliotheken oder Netzwerkanfragen. */
(() => {
 'use strict';
 const D=window.PROJECT_DATA, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 if(!D){document.body.insertAdjacentHTML('afterbegin','<p class="no-script">Die Datendatei fehlt. Bitte den gesamten Website-Ordner zusammen lassen.</p>');return;}
 const nf=new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}), integer=new Intl.NumberFormat('de-DE',{maximumFractionDigits:0});
 const fmt=v=>nf.format(v), model=new ScenarioModel(D);let reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const icons={
  grain:'<g stroke="#dbe5a1" stroke-width="2" fill="#dbe5a1"><path d="M35 62V14" fill="none"/><ellipse cx="28" cy="22" rx="4" ry="8" transform="rotate(-35 28 22)"/><ellipse cx="42" cy="29" rx="4" ry="8" transform="rotate(35 42 29)"/><ellipse cx="28" cy="38" rx="4" ry="8" transform="rotate(-35 28 38)"/><ellipse cx="42" cy="45" rx="4" ry="8" transform="rotate(35 42 45)"/></g>',
  carrot:'<path d="M22 19Q35 12 49 21L30 61Q26 66 24 60Z" fill="#db865a"/><path d="M33 19L27 6M34 18L38 4M35 18L47 8" stroke="#a8c189" stroke-width="5"/><path d="M26 31L38 33M27 43L33 44" stroke="#9e492b" stroke-width="2"/>',
  milk:'<path d="M21 22L29 10H46L51 23V61H20Z" fill="#f5f2e8"/><path d="M21 23H51M30 10L36 23V61" stroke="#82916d" stroke-width="2"/><path d="M36 33H51V49H36" fill="#a8c189"/>'
 };
 class FoodGroup {
  constructor(data){Object.assign(this,data);this.selected=false;}
  value(metric){return metric==='mass'?this.mass_mt:this.energy_kcal/1e12;}
  render(metric,max){const button=document.createElement('button');button.className='bar-row';button.setAttribute('aria-pressed',String(this.selected));
   if(this.selected)button.classList.add('selected');const value=this.value(metric),unit=metric==='mass'?'Mio. t':'Bio. kcal';
   const allMissing=this.missing_loss_items===D.items.filter(i=>i.group===this.name).length;
   const noEnergy=metric==='energy'&&!D.items.some(i=>i.group===this.name&&i.included);
   const label=allMissing?'k. A.':noEnergy?'—':fmt(value);
   button.innerHTML=`<span>${this.name}</span><span class="bar-track"><i class="bar-fill" style="--w:${max?value/max*100:0}%"></i></span><span class="bar-number">${label}</span>`;
   button.title=`${this.name}: ${allMissing?'keine Verlustdaten':noEnergy?'ohne Kalorienwert im Modell':fmt(value)+' '+unit}${this.missing_loss_items&&!allMissing?' · einzelne Verlustwerte fehlen':''}`;
   button.setAttribute('aria-label',button.title);button.addEventListener('click',()=>chart.select(this.name));
   button.addEventListener('mouseenter',()=>chart.detail(this));button.addEventListener('mouseleave',()=>chart.detail(chart.groups.find(g=>g.selected)));
   button.addEventListener('focus',()=>chart.detail(this));button.addEventListener('blur',()=>chart.detail(chart.groups.find(g=>g.selected)));
   return button;
  }
 }
 class GroupChart {
  constructor(){this.groups=D.groups.map(g=>new FoodGroup(g));this.metric='mass';this.groups.find(g=>g.name==='Getreide').selected=true;this.render();}
  select(name){this.groups.forEach(g=>g.selected=g.name===name);this.render();}
  setMetric(metric){this.metric=metric;this.render();$$('[data-metric]').forEach(b=>{const on=b.dataset.metric===metric;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});}
  render(){const sorted=[...this.groups].sort((a,b)=>b.value(this.metric)-a.value(this.metric));const max=Math.max(...sorted.map(g=>g.value(this.metric)));$('#group-chart').replaceChildren(...sorted.map(g=>g.render(this.metric,max)));$('#group-chart').setAttribute('aria-label',`Produktgruppen nach ${this.metric==='mass'?'Millionen Tonnen':'Billionen kcal'}, absteigend sortiert`);this.detail(this.groups.find(g=>g.selected));}
  detail(g){if(!g)return;const subset=D.items.filter(i=>i.group===g.name),inc=subset.filter(i=>i.included),allMissing=g.missing_loss_items===subset.length;$('#group-detail').innerHTML=`<b>${g.name}</b><p>${allMissing?'Keine Losses-Werte vorhanden':fmt(g.mass_mt)+' Mio. t erfasste Verluste'}</p><p>${inc.length?fmt(g.energy_kcal/1e12)+' Billionen kcal im Modell':'Ohne Kalorienwert im Modell'}</p><p>${inc.length} von ${subset.length} Titeln für Energie geeignet</p><p class="detail-note">${g.energy_kcal===0?'Diese Gruppe fließt nicht in das Kalorienmodell ein.':'Der Verlustmix wird mit den effektiven FBS-Faktoren der Einzeltitel geschätzt.'}${g.missing_loss_items?' Für '+g.missing_loss_items+' Position(en) fehlen Losses-Zeilen.':''} ${subset.filter(i=>!i.included&&i.loss_1000t>0).map(i=>i.exclusion).join(' ')}</p>`;}
 }
 const chart=new GroupChart();$$('[data-metric]').forEach(b=>b.addEventListener('click',()=>chart.setMetric(b.dataset.metric)));
 $('#mass-total').textContent=fmt(D.loss_mass_mt);$('#energy-total').textContent=fmt(D.energy_kcal/1e12);
 $('#coverage').textContent=`${fmt(D.included_mass_mt)} von ${fmt(D.loss_mass_mt)} Mio. t erfasster Verlustmasse berücksichtigt (${fmt(D.included_mass_mt/D.loss_mass_mt*100)} %). Die übrige Masse bleibt ohne Kalorienwert.`;
 $('#food-comparison').innerHTML=[{code:2511,icon:'grain',title:'Weizen'},{code:2601,icon:'carrot',title:'Tomaten'},{code:2848,icon:'milk',title:'Milch'}].map(g=>{const i=D.items.find(i=>i.code===g.code);return `<div class="food-item"><svg viewBox="0 0 70 70" aria-hidden="true">${icons[g.icon]}</svg><div><strong>${g.title}</strong><small>Effektiver FBS-Faktor</small><div class="density-track"><i style="--w:${i.effective_kcal_kg/4000*100}%"></i></div></div><div class="density-value">${integer.format(i.effective_kcal_kg)}<small>kcal / kg Bilanzmasse</small></div></div>`;}).join('');
 // The second drawing depicts tomatoes, so replace the carrot icon with a matching illustration.
 $('#food-comparison .food-item:nth-child(2) svg').innerHTML='<path d="M14 36C14 14 56 14 56 36C56 64 14 64 14 36Z" fill="#db865a"/><path d="M35 24L23 16L32 17L36 8L40 18L52 16L44 24" fill="#a8c189"/><path d="M24 31Q20 36 23 43" fill="none" stroke="#f0bd8d" stroke-width="3"/>';
 const dotCanvas=$('#ration-dots'),ctx=dotCanvas.getContext('2d');let shown=0,target=0,last=0;
 const dotUnit=Math.ceil(Math.max(D.energy_kcal/(1800*365),D.hungry_people)/400/1e6)*1e6;
 function drawDots(people){const W=800;ctx.clearRect(0,0,W,320);ctx.font='16px Segoe UI, Arial';ctx.fillStyle='#60685c';ctx.fillText(`Ein Punkt ≈ ${integer.format(dotUnit/1e6)} Mio. Jahresrationen bzw. Menschen`,0,20);
  [[people,'#496849','Theoretische Jahresrationen',55],[D.hungry_people,'#c25c34','Unterernährte Menschen (Vergleich)',193]].forEach(([v,color,label,y])=>{
   ctx.font='14px Segoe UI, Arial';ctx.fillStyle='#202b21';ctx.fillText(label,0,y);
   const n=v/dotUnit;
   for(let i=0;i<400;i++){const x=8+(i%50)*15.7,py=y+18+Math.floor(i/50)*11;ctx.beginPath();ctx.arc(x,py,3.2,0,Math.PI*2);ctx.fillStyle='#cbd2b9';ctx.fill();
    const fill=Math.min(1,Math.max(0,n-i));if(fill>0){ctx.save();ctx.beginPath();ctx.rect(x-4,py-4,8*fill,8);ctx.clip();ctx.beginPath();ctx.arc(x,py,3.2,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore();}}
  });
 }
 function update(){const r=model.set(+$ ('#rescue').value,+$('#requirement').value);target=r.people;if(reduced){shown=target;drawDots(shown);}
  $('#rescue-value').textContent=integer.format(r.rescue)+' %';$('#requirement-value').textContent=integer.format(r.requirement)+' kcal';
  $('#rations').textContent=fmt(r.people/1e6);$('#result-sub').textContent=`${fmt(r.energy/1e12)} Billionen kcal ÷ ${integer.format(r.requirement)} kcal ÷ 365 Tage`;
  $('#ratio').textContent=fmt(r.ratio*100)+' %';
  $('#threshold').textContent=r.threshold<=100?`Bei diesem Tagesbedarf liegt die rechnerische Vergleichsschwelle bei ${fmt(r.threshold)} % Rettung.`:`Bei diesem Tagesbedarf wären ${fmt(r.threshold)} % nötig. Selbst 100 % der modellierten Verluste reichen für diesen Vergleich nicht aus.`;
  $('#conclusion').textContent=`Bei ${integer.format(r.rescue)} % Rettung ergibt das Modell ${fmt(r.people/1e6)} Mio. vollständige Jahresrationen. Das entspricht ${fmt(r.ratio*100)} % der Zahl unterernährter Menschen.`;
  dotCanvas.setAttribute('aria-label',`${fmt(r.people/1e6)} Millionen theoretische Jahresrationen im Vergleich zu 687,6 Millionen unterernährten Menschen. Ein Punkt entspricht ungefähr ${dotUnit/1e6} Millionen.`);
  $$('[data-rescue]').forEach(b=>{const on=+b.dataset.rescue===r.rescue;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 }
 ['#rescue','#requirement'].forEach(s=>$(s).addEventListener('input',update));
 $$('[data-rescue]').forEach(b=>b.addEventListener('click',()=>{$('#rescue').value=b.dataset.rescue;update();}));
 $('#reset').addEventListener('click',()=>{$('#rescue').value=50;$('#requirement').value=D.reference_kcal;update();});
 $('#export').addEventListener('click',()=>{const r=model.result();const result={project:'Genug?',year:2022,scope:'FBS after harvest before retail',...r,comparison_people:D.hungry_people,assumption:'Losses have the same effective kcal/kg as Food for matching commodity. Rescue fraction freely chosen. Full annual rations, not observed hunger deficit.'};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));a.download='Genug_Szenario_2022.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
 $('#final-answer').textContent=`Die modellierten Verluste enthalten Energie für rund ${fmt(D.full_rations_people/1e6)} Millionen vollständige Jahresrationen, wenn wir 100 % retten und ${integer.format(D.reference_kcal)} kcal pro Tag ansetzen. Das zeigt eine Größenordnung. Es beweist nicht, dass diese Rettung erreichbar ist oder Welthunger dadurch endet.`;
 $('#source-count').textContent=`${integer.format(D.source_rows)} Originalzeilen in zwei großen FAOSTAT-Dateien geprüft. Für die Rechnung: ausschließlich World, 2022, passende Einzeltitel. Mengen und Energie bleiben getrennt.`;
 $('#source-links').innerHTML=D.sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a></li>`).join('');
 // A subtle original illustration, independent of quantitative chart scales.
 const plate=$('#plate'),p=plate.getContext('2d');
 function drawPlate(time){const t=reduced?0:time*.00004;p.clearRect(0,0,720,720);p.save();p.translate(360,350);
  p.strokeStyle='#cfd4bf';p.lineWidth=1;[286,242,220].forEach(r=>{p.beginPath();p.arc(0,0,r,0,Math.PI*2);p.stroke();});p.fillStyle='#e7ead8';p.beginPath();p.arc(0,0,219,0,Math.PI*2);p.fill();
  p.setLineDash([2,9]);p.beginPath();p.arc(0,0,320,0,Math.PI*2);p.stroke();p.setLineDash([]);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+t;const r=163+Math.sin(i*7)*13;p.save();p.translate(Math.cos(a)*r,Math.sin(a)*r);p.rotate(a+Math.PI/2);
   if(i%3===0){p.fillStyle='#c9693c';p.beginPath();p.moveTo(-18,-32);p.quadraticCurveTo(10,-40,22,-24);p.lineTo(0,49);p.quadraticCurveTo(-8,50,-11,35);p.closePath();p.fill();p.strokeStyle='#6b8550';p.lineWidth=5;[-12,0,12].forEach(x=>{p.beginPath();p.moveTo(0,-29);p.lineTo(x,-57);p.stroke();});}
   else if(i%3===1){p.strokeStyle='#aa9a57';p.lineWidth=2;p.beginPath();p.moveTo(0,45);p.lineTo(0,-43);p.stroke();for(let j=0;j<5;j++){p.fillStyle='#bfa969';p.beginPath();p.ellipse(j%2?8:-8,-28+j*13,6,12,j%2?.6:-.6,0,Math.PI*2);p.fill();}}
   else{p.fillStyle='#79936a';p.beginPath();p.ellipse(0,0,25,41,.3,0,Math.PI*2);p.fill();p.strokeStyle='#b3c39d';p.lineWidth=1;p.beginPath();p.moveTo(0,32);p.lineTo(0,-31);p.stroke();}
   p.restore();}
  p.fillStyle='#496849';p.font='italic 55px Georgia';p.textAlign='center';p.fillText('genug?',0,15);p.fillStyle='#60685c';p.font='10px Segoe UI';p.fillText('EINE FRAGE DER MENGE.',0,49);p.fillText('UND DES ZUGANGS.',0,68);p.restore();
 }
 function frame(t){if(document.hidden){last=t;requestAnimationFrame(frame);return;}if(!reduced){if(Math.abs(shown-target)>10000){shown+=(target-shown)*Math.min(1,(t-last)/150);drawDots(shown);}else if(shown!==target){shown=target;drawDots(shown);}drawPlate(t);}last=t;requestAnimationFrame(frame);}
 update();drawDots(shown);drawPlate(0);requestAnimationFrame(frame);
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;shown=target;drawDots(shown);drawPlate(0);});
 let tourTimer=null,tourIndex=0;const chapters=['start','verluste','energie','szenario','grenzen'],captions=['Die Ausgangsfrage','Wo die Verluste liegen','Masse wird zu Energie','Das freie Rechenexperiment','Was das Ergebnis bedeutet'];
 function stopTour(){clearInterval(tourTimer);tourTimer=null;$('#tour-status').hidden=true;$('#tour').textContent='▶ Geführte Tour';$('#tour').setAttribute('aria-pressed','false');}
 $('#tour').addEventListener('click',()=>{if(tourTimer){stopTour();return;}tourIndex=0;$('#tour-status').hidden=false;$('#tour').textContent='Ⅱ Tour läuft';$('#tour').setAttribute('aria-pressed','true');$('#tour-caption').textContent='1 / 5 · '+captions[0];$('#start').scrollIntoView({behavior:reduced?'auto':'smooth'});tourTimer=setInterval(()=>{tourIndex++;if(tourIndex>=chapters.length){stopTour();return;}$('#'+chapters[tourIndex]).scrollIntoView({behavior:reduced?'auto':'smooth'});$('#tour-caption').textContent=`${tourIndex+1} / 5 · ${captions[tourIndex]}`;},10000);});
 $('#tour-stop').addEventListener('click',stopTour);document.addEventListener('keydown',e=>{if(e.key==='Escape')stopTour();});
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('nav a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -55% 0px',threshold:0});$$('.chapter').forEach(s=>observer.observe(s));
})();
