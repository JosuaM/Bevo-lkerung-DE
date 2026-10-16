/* Eine gemeinsame SVG für Bildschirm und Export. Jede Produktfläche ist disjunkt. */
(function(root){'use strict';
 const colors=['#496849','#b29751','#bd754c','#a5973e','#739377','#a56a59','#88874f','#9caaa0','#749791','#8fa96b','#866757','#aaa477','#647876','#b28e78','#c7b784','#717156','#536254','#969b70','#7e897c','#a99c86','#8e8c81'];
 const fmt=(v,n=1)=>v.toLocaleString('de-DE',{maximumFractionDigits:n,minimumFractionDigits:n});
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 function render(data,model,phase=8,selection=null,group=null,exported=false){
 const r=model.result(),x=40,w=920,H=phase<3?190:phase<4?300:phase<5?435:phase<6?600:(exported?1000:760);
 const color=g=>colors[data.groups.findIndex(v=>v.name===g)%colors.length];
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${H}" width="1600" height="${H*1.6}" role="img" aria-labelledby="svg-title svg-desc"><title id="svg-title">Verluste, Studienübertragung und Mindestenergie-Referenz</title><desc id="svg-desc">Welt 2022. Massen und Energie stehen auf getrennten Skalen. ${fmt(r.people/1e6)} Millionen volle Jahresrationen im hypothetischen Fallstudien-Transfer. Unbekannte Wirkung wird schraffiert.</desc><defs><pattern id="unknown" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e6e7de"/><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="#b1b4a7" stroke-width="1"/></pattern></defs><rect width="1000" height="${H}" fill="#f5f2e8"/><g font-family="Segoe UI,Arial,sans-serif" fill="#202b21">`;
 const t=(a,b,s,size=17,weight='normal')=>`<text x="${a}" y="${b}" font-size="${size}" font-weight="${weight}">${esc(s)}</text>`;
 const rect=(a,b,width,h,fill,opacity=1)=>`<rect x="${a}" y="${b}" width="${Math.max(0,width)}" height="${h}" fill="${fill}" opacity="${opacity}"/>`;
 function seg(i,a,y,width,h,fill,opacity=1){const selected=selection===i.code;return `<g ${exported?'':`role="button" tabindex="0" data-code="${i.code}" aria-label="${esc(i.name)}: ${fmt((i.loss_1000t||0)/1000,3)} Millionen Tonnen; ${i.included?fmt(i.loss_kcal/1e12,2)+' Billionen Kilokalorien':'keine Kalorienumrechnung'}"`}><title>${esc(i.name)} · ${fmt((i.loss_1000t||0)/1000,3)} Mio. t${i.included?' · '+fmt(i.loss_kcal/1e12,2)+' Bio. kcal':''}</title><rect x="${a}" y="${y}" width="${Math.max(0,width)}" height="${h}" fill="${fill}" opacity="${opacity}" stroke="${selected?'#202b21':'#f5f2e8'}" stroke-width="${selected?3:.65}"/></g>`;}
 out+=t(x,20,'VERLUSTE NACH DER ERNTE, VOR DEM EINZELHANDEL · FAOSTAT · WELT 2022',14,'600');
 out+=t(x,49,fmt(data.loss_mass_mt)+' Mio. t Verlustmasse',24);
 let mx=x;const massScale=w/1200;
 if(phase===1)out+=rect(x,66,data.loss_mass_mt*massScale,32,'#496849');else for(const i of data.items){if(i.loss_1000t===null||i.loss_1000t<=0)continue;const iw=i.loss_1000t/1000*massScale;out+=seg(i,mx,66,iw,32,i.included?color(i.group):'url(#unknown)',group&&group!==i.group?.3:1);mx+=iw;}
 out+=t(x,121,fmt(data.included_mass_mt)+' Mio. t umgerechnet · '+fmt(data.loss_mass_mt-data.included_mass_mt)+' Mio. t bewusst ausgeschlossen',15);
 out+=t(x,140,'16 Produkte ohne Losses-Wert: Menge unbekannt, kein gemessener Nullverlust.',15);
 out+=t(x,162,'Massenskala: 0–1.200 Mio. t. Keine Addition zu einer Gesamtkette.',14);
 if(phase>=3){out+=t(x,200,'KONSUMNAHE ABFÄLLE · UNEP · ESSBARE UND NICHT ESSBARE TEILE',14,'600');let cx=x;for(const [name,value]of Object.entries(data.consumer_mass_mt)){out+=rect(cx,218,value*massScale,32,name==='Haushalte'?'#bd754c':name==='Gastronomie'?'#b29751':'#9caaa0');out+=t(cx+7,241,name+' '+value,15);cx+=value*massScale;}out+=t(x,282,'1.052 Mio. t: Haushalte 631 · Gastronomie 290 · Handel 131. Keine Kalorienzuordnung.',15);}
 if(phase>=4){out+=`<path d="M40 295H960" stroke="#d6d8c9"/>`;out+=t(x,310,'ENERGIE · NEUE SKALA · BILLIONEN KCAL (10¹²)',14,'600');out+=t(x,339,fmt(data.energy_kcal/1e12)+' Bio. kcal rechnerisch in den umgerechneten Verlusten',23);let ex=x;for(const i of data.items){if(!i.included)continue;const ew=i.loss_kcal/data.energy_kcal*w;out+=seg(i,ex,355,ew,32,color(i.group),group&&group!==i.group?.3:1);if(ew>95)out+=`<g fill="#f5f2e8" pointer-events="none">`+t(ex+7,377,i.name,13)+`</g>`;ex+=ew;}let wheat=data.items.find(i=>i.code===2511);out+=t(x,416,'Weizen: '+fmt(wheat.loss_kcal/1e12)+' Bio. kcal · '+fmt(wheat.loss_kcal/data.energy_kcal*100)+' % der dargestellten Energie',15);}
 if(phase>=5){out+=t(x,448,'HYPOTHETISCHER TRANSFER AUF '+r.application+' % DER VERLUSTE DER AKTIVEN PRODUKTE',14,'600');let ex=x;for(const i of data.items){if(!i.included)continue;const ew=i.loss_kcal/data.energy_kcal*w,rate=model.rate(i.code);out+=seg(i,ex,466,ew,26,rate===null?'url(#unknown)':'#d5d9cb',1);if(rate!==null)out+=rect(ex,466,ew*rate,26,color(i.group));ex+=ew;}
 out+=t(x,512,'Farbig: modelliert gerettet · blass: verbleibend im Falltransfer · schraffiert: Wirkung unbekannt',14);
 out+=t(x,547,'Gerettet: '+fmt(r.energy/1e12)+' Bio. kcal',19,'600')+rect(x,562,r.energy/data.energy_kcal*w,20,'#496849');}
 if(phase>=6){out+=t(x,617,'Referenz: '+fmt(r.referenceEnergy/1e12)+' Bio. kcal',19,'600')+rect(x,632,r.referenceEnergy/data.energy_kcal*w,20,'#c25c34');out+=t(x,678,'687,6 Mio. Menschen × 1.833 kcal/Tag × 365 Tage. Vollrationen, kein gemessenes Defizit.',15);out+=t(x,709,fmt(r.people/1e6)+' Mio. Jahresrationen im Szenario · '+fmt(r.ratio*100)+' % der Referenz',22,'600');out+=t(x,740,'3 recherchierte Produktfälle · '+fmt(r.coveredEnergy/data.energy_kcal*100)+' % Energieabdeckung · keine globale Wirkungsprognose',14);}
 if(phase>=6&&exported){out+=`<path d="M40 770H960" stroke="#d6d8c9"/>`;data.groups.forEach((g,n)=>{const lx=40+(n%4)*235,ly=795+Math.floor(n/4)*24;out+=rect(lx,ly-10,9,9,color(g.name))+t(lx+15,ly,g.name,13);});out+=t(x,950,'Studien: Mais 76,47 % · Weizen 69,23 % · Bohnen 54,55 % relative Gewichtsverlust-Verringerung',13);out+=t(x,972,'Aktive Fälle: '+model.studies.filter(s=>model.enabled.has(s.code)).map(s=>s.product).join(', ')+' · Reichweite '+r.application+' % (Annahme)',13);out+=t(x,993,'FAOSTAT FBS/FS 2022 · UNEP 2024 · Ndegwa 2016 · Melese 2022 · Mutungi 2022',13);}
 out+='</g></svg>';return out;
 }
 const api={render,colors,fmt,esc};if(typeof module==='object'&&module.exports)module.exports=api;else root.ProjectGraphic=api;
})(typeof window!=='undefined'?window:this);


