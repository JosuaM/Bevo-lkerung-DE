/* Interaktive Vertiefung für Variation 1. Bestehende Personen-Dashboards bleiben unabhängig. */
window.populationExplorer = (() => {
  const style = document.createElement('style');
  style.textContent = `
  #explorer{display:none;position:fixed;inset:76px var(--pad) 112px;z-index:30;overflow:auto;color:var(--ink)}
  .exploring #explorer{display:block}.exploring #c{visibility:hidden}
  #explorer h1{font-size:var(--fs-m);font-weight:400;margin:0 0 8px}#explorer p{color:#a4adbd;font-size:14px;line-height:1.5;margin:0}
  .ex-insight{border:1px solid #30343b;border-radius:8px;margin:0 0 18px;background:rgba(56,224,255,.025)}
  .ex-insight summary{cursor:pointer;padding:13px 16px;font-size:14px;color:#eef2f6}
  .ex-insight summary::marker{color:var(--c-in)}
  .ex-insight summary small{color:#a4adbd;font-size:12px;margin-left:12px}
  .ex-insight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;padding:5px 18px 16px}
  .ex-insight h3{font-size:14px;font-weight:400;color:var(--c-in);margin:0 0 7px}
  #explorer .ex-insight p{font-size:13px}
  #explorer .ex-insight-footer{font-size:12px;padding:0 18px 15px;color:#a4adbd}
  .ex-insight a{color:#c6d4e4;text-underline-offset:3px}
  @media(max-width:700px){.ex-insight-grid{grid-template-columns:1fr;gap:14px}.ex-insight summary small{display:block;margin:5px 0 0}}
  .ex-ratio{margin-top:16px;border:1px solid #30343b;border-radius:8px}
  .ex-ratio summary{padding:13px 16px;cursor:pointer;font-size:14px;color:#eef2f6}
  .ex-ratio-body{padding:2px 16px 16px}.ex-ratio-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px}
  .ex-ratio-label{font-size:13px;color:#a4adbd;margin-bottom:10px}.ex-ratio-dots{display:flex;flex-wrap:wrap;gap:5px;max-width:340px;min-height:65px;align-content:flex-start}
  .ex-ratio-dots i{width:7px;height:7px;border-radius:50%;background:var(--dot);animation:ratioAppear .7s ease both}
  @keyframes ratioAppear{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
  #explorer .ex-ratio-caption{font-size:12px;margin-top:13px;color:#a4adbd}
  @media(prefers-reduced-motion:reduce){.ex-ratio-dots i{animation:none}}
  .ex-tabs{display:flex;gap:8px;margin:22px 0;flex-wrap:wrap}
  #explorer button{font-size:14px;background:transparent;border:1px solid #3a4252;border-radius:6px;padding:9px 14px;color:#a4adbd}
  #explorer button:hover{border-color:#a4adbd;color:white}#explorer button[aria-selected=true],#explorer button[aria-pressed=true]{background:#eef2f6;color:#121212;border-color:#eef2f6}
  #explorer button:focus-visible,#ex-chart:focus-visible{outline:2px solid var(--c-in);outline-offset:3px}
  .ex-grid{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:24px}.ex-plot,.ex-card{border:1px solid #30343b;border-radius:10px;background:rgba(255,255,255,.018);padding:22px}
  .ex-tools{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:38px;flex-wrap:wrap}.ex-tools h2{font-size:17px;font-weight:400;margin:0}.ex-switch{display:flex;gap:5px}#explorer .ex-switch button{padding:6px 10px;font-size:12px}
  #ex-chart{display:block;width:100%;height:clamp(220px,34vh,350px);margin-top:14px;touch-action:pan-y;cursor:crosshair}
  .ex-legend{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:#a4adbd;margin-top:12px}.ex-legend span::before{content:'';display:inline-block;width:14px;height:3px;background:var(--key);margin-right:7px;vertical-align:middle}
  #ex-year{font-size:var(--fs-l);font-weight:300;margin:6px 0 20px}.ex-yearbar{display:flex;justify-content:space-between;align-items:center;color:#a4adbd;font-size:12px}.ex-yearbar button{padding:4px 10px!important}
  .ex-metric{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:10px 0;color:#a4adbd;border-bottom:1px solid #30343b}.ex-metric strong{font-weight:400;color:var(--ink);white-space:nowrap}.ex-total{padding-top:18px;font-size:13px;color:#a4adbd}.ex-total strong{display:block;font-size:25px;font-weight:300;color:var(--ink);margin:5px 0 12px}
  .ex-stories{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px}.ex-stories>span{font-size:12px;color:#a4adbd;margin-right:4px}#explorer .ex-stories button{font-size:12px;padding:7px 10px}
  #ex-context{margin-top:12px;max-width:900px;min-height:42px}#ex-note{margin-top:12px;font-size:11px;color:#8893a5}
  @media(max-height:780px){.ex-tabs{margin:12px 0}.ex-metric{padding:7px 0}#ex-year{margin:4px 0 10px}.ex-total{padding-top:10px}.ex-total strong{font-size:22px;margin:4px 0}.ex-plot,.ex-card{padding:15px}}
  @media(max-width:1000px){.ex-grid{grid-template-columns:minmax(0,1fr) 220px;gap:12px}.ex-plot,.ex-card{padding:15px}#explorer{inset-inline:20px}}
  @media(max-width:700px){.ex-grid{grid-template-columns:1fr}.ex-card{display:block}.ex-tabs{margin:14px 0}#explorer{top:65px}.ex-metric{padding:7px 0}}
  `;
  document.head.appendChild(style);
  const el = document.createElement('section');el.id='explorer';el.setAttribute('aria-label','Bevölkerung erkunden');
  el.innerHTML=`<h1>Bevölkerung verstehen</h1><p>Zwei Perspektiven. Wähle ein Jahr im Diagramm oder auf dem Zeitstrahl.</p>
  <div class="ex-tabs" role="tablist" aria-label="Perspektive">
  <button role="tab" data-view="balance" aria-selected="true">Bevölkerungsbilanz</button><button role="tab" data-view="population" aria-selected="false">Mit & ohne Wanderung</button></div>
  <details class="ex-insight"><summary>Warum Zuwanderung zählt <small>Bevölkerung · Arbeitskräfte · Sozialversicherung</small></summary>
  <div class="ex-insight-grid">
    <div><h3>Bevölkerungsrückgang abfedern</h3><p>Ein positiver Wanderungssaldo kann ausgleichen, dass mehr Menschen sterben als geboren werden. Wie weit das gelingt, zeigt die Bilanz für jedes Jahr.</p></div>
    <div><h3>Arbeitskräfte gewinnen</h3><p>Zugewanderte können freie Stellen besetzen und helfen, den Rückgang der Arbeitskräfte durch den Renteneintritt älterer Jahrgänge abzumildern.</p></div>
    <div><h3>Renten mitfinanzieren</h3><p>Wer sozialversicherungspflichtig arbeitet, zahlt Beiträge und trägt zur Finanzierung laufender Renten und weiterer Sozialleistungen bei.</p></div>
  </div><p class="ex-insight-footer">Entscheidend sind Alter, Beschäftigung und Einkommen. Zuwanderung kann die Alterung abmildern, löst sie aber nicht allein. Einordnung: <a href="https://iab.de/publikationen/publikation/?id=14799426" target="_blank" rel="noopener noreferrer">IAB · Arbeitsmarkt</a> · <a href="https://fdz.iab.de/publikation/?id=10134835" target="_blank" rel="noopener noreferrer">IAB · Rentenversicherung</a></p></details>
  <div class="ex-grid"><div class="ex-plot" role="tabpanel" id="ex-panel"><div class="ex-tools"><h2 id="ex-heading"></h2><div class="ex-switch" id="ex-switch"></div></div><svg id="ex-chart" viewBox="0 0 850 350" preserveAspectRatio="xMidYMid meet" role="img" tabindex="0" aria-label="Jahresdiagramm. Mit den Pfeiltasten das Jahr wählen."></svg><div class="ex-legend" id="ex-legend"></div></div>
  <aside class="ex-card" aria-label="Werte des gewählten Jahres"><div class="ex-yearbar"><span>Ausgewähltes Jahr</span><div><button id="ex-prev" aria-label="Vorheriges Jahr">←</button> <button id="ex-next" aria-label="Nächstes Jahr">→</button></div></div><div id="ex-year"></div><div id="ex-metrics"></div></aside></div>
  <details class="ex-ratio"><summary id="ex-ratio-summary"></summary><div class="ex-ratio-body"><div class="ex-ratio-grid"><div><div class="ex-ratio-label">100 Abgänge · Sterbefälle + Fortzüge</div><div class="ex-ratio-dots" id="ex-out-dots" aria-hidden="true"></div></div><div><div class="ex-ratio-label" id="ex-in-label"></div><div class="ex-ratio-dots" id="ex-in-dots" aria-hidden="true"></div></div></div><p class="ex-ratio-caption" id="ex-ratio-caption"></p></div></details>
  <div class="ex-stories"><span>Jahre entdecken</span><div id="ex-events" style="display:contents"></div></div><p id="ex-context"></p>`;
  document.body.appendChild(el);
  let view='balance',detail=false,api=null,lastKey='',story=null;
  const $=id=>document.getElementById(id);
  const choose=y=>{story=null;api.selectYear(y);lastKey='';};
  const tabs=[...el.querySelectorAll('[role=tab]')];
  tabs.forEach((b,i)=>{b.setAttribute('aria-controls','ex-panel');b.onclick=()=>{view=b.dataset.view;lastKey='';render(api);};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[j].focus();tabs[j].click();};});
  $('ex-prev').onclick=()=>choose(api.year-1);$('ex-next').onclick=()=>choose(api.year+1);

  const svg=$('ex-chart');
  function eventYear(e){
    const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const local=point.matrixTransform(svg.getScreenCTM().inverse());
    const width=svg.viewBox.baseVal.width;
    return api.clamp(Math.round(api.FIRST+(local.x-65)/(width-85)*(api.LAST-api.FIRST)),api.FIRST,api.LAST);
  }
  svg.addEventListener('pointerdown',e=>choose(eventYear(e)));
  svg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();choose(api.year+(e.key==='ArrowRight'?1:-1));}});
  const compact=n=>Math.abs(n)>=1e6?(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio.':Math.round(n/1000).toLocaleString('de-DE')+' Tsd.';
  function render(a){
    api=a;
    if (!$('ex-events').children.length){
      Object.entries(a.EVENTS).forEach(([year,event])=>{
        const button=document.createElement('button');button.dataset.story=year;button.textContent=year+' · '+event.t;
        button.onclick=()=>{story=+year;api.selectYear(story);lastKey='';};$('ex-events').appendChild(button);
      });
    }
    const chartWidth=Math.max(280,Math.round(svg.clientWidth)),chartHeight=Math.max(220,Math.round(svg.clientHeight));
    const key=[chartWidth,chartHeight,view,detail,a.year,...Object.values(a.COLORS),story].join('|');if(key===lastKey)return;lastKey=key;
    const {DATA,FIRST,LAST,year,d,COLORS:c,fmt,sgn,BASE,cumN}=a;
    tabs.forEach(b=>{const selected=b.dataset.view===view;b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1;});
    const outgoing=d.wd+d.fort, incoming=d.wb+d.zu;
    const incomingPer100=Math.round(incoming/outgoing*100);
    $('ex-ratio-summary').textContent=year+' · Auf 100 Abgänge kommen '+incomingPer100+' Zugänge';
    $('ex-in-label').textContent=incomingPer100+' Zugänge · Geburten + Zuzüge';
    const dots=(count,firstShare,firstColor,secondColor)=>Array.from({length:count},(_,i)=>`<i style="--dot:${i<Math.round(count*firstShare)?firstColor:secondColor};animation-delay:${(i*37%350)/1000}s"></i>`).join('');
    $('ex-out-dots').innerHTML=dots(100,d.wd/outgoing,c.death,c.out);
    $('ex-in-dots').innerHTML=dots(incomingPer100,d.wb/incoming,c.birth,c.in);
    const leap=year%4===0&&(year%100!==0||year%400===0);
    const seconds=(leap?366:365)*86400;
    const interval=Math.round(seconds/d.zu);
    $('ex-ratio-caption').textContent='Im Jahresdurchschnitt ein Zuzug alle '+interval+' Sekunden. Zuzüge umfassen Menschen mit deutscher und ausländischer Staatsangehörigkeit. Gezählt werden Ereignisse, nicht unterschiedliche Personen. Farben wie im Diagramm; Verhältnis gerundet.';
    $('ex-prev').disabled=year===FIRST;$('ex-next').disabled=year===LAST;$('ex-year').textContent=year;
    const metric=(label,value,color)=>`<div class="ex-metric"><span>${label}</span><strong${color?` style="color:${color}"`:''}>${value}</strong></div>`;
    const total=(label,value)=>`<div class="ex-total">${label}<strong>${value}</strong></div>`;
    let sets=[],rows=DATA,heading='',note='Quelle: Destatis · Jahreswerte 1991–2025.',metrics='',unit='Menschen';
    if(view==='balance'){
      heading=detail?'Vier Größen hinter der Bilanz':'Was verändert die Bevölkerung?';
      sets=detail?[['Geburten',c.birth,r=>r.wb],['Sterbefälle',c.death,r=>-r.wd],['Zuzüge',c.in,r=>r.zu],['Fortzüge',c.out,r=>-r.fort]]:[['Geburten − Sterbefälle',c.death,r=>r.wb-r.wd],['Zuzüge − Fortzüge',c.in,r=>r.zu-r.fort]];
      metrics=metric('Geburten',fmt(d.wb),c.birth)+metric('Sterbefälle',fmt(d.wd),c.death)+metric('Zuzüge',fmt(d.zu),c.in)+metric('Fortzüge',fmt(d.fort),c.out)+metric('Natürlicher Saldo',sgn(d.wb-d.wd))+metric('Wanderungssaldo',sgn(d.zu-d.fort))+total('Bilanz der beiden Salden',sgn(d.wb-d.wd+d.zu-d.fort));
      note+=' '+(detail?'Abgänge stehen unterhalb der Nulllinie. ':'')+'Die Saldenbilanz kann durch statistische Korrekturen von der Bestandsänderung abweichen.';
    }else if(view==='population'){
      heading='Wie entwickelt sich die Bevölkerung?';sets=[['Tatsächliche Bevölkerung','#eef2f6',r=>r.wp],['Modell ohne Wanderung',c.death,r=>BASE+cumN[r.y]]];
      metrics=metric('Tatsächlich',fmt(d.wp))+metric('Modell ohne Wanderung',fmt(BASE+cumN[year]),c.death)+total('Abstand zum Modell',sgn(d.wp-(BASE+cumN[year])));
      note+=' Bevölkerung am 31.12. · Modell: Bevölkerung Ende 1990 + beobachtete Geburten − Sterbefälle; keine Prognose.';
    }
    $('ex-heading').textContent=heading;$('ex-metrics').innerHTML=metrics;
    $('ex-switch').innerHTML=view==='population'?'':['Bilanz','Einzelwerte'].map((label,i)=>`<button aria-pressed="${i===Number(detail)}" data-option="${i}">${label}</button>`).join('');
    $('ex-switch').querySelectorAll('button').forEach(b=>b.onclick=()=>{detail=!!+b.dataset.option;lastKey='';render(api);});
    $('ex-legend').innerHTML=sets.map(([label,color])=>`<span style="--key:${color}">${label}</span>`).join('');
    const values=rows.flatMap(r=>sets.map(s=>s[2](r)));let lo=Math.min(...values),hi=Math.max(...values);
    if(view==='balance')lo=Math.min(0,lo);
    const pad=(hi-lo)*.12||1;if(lo!==0)lo-=pad;hi+=pad;
    // Eine SVG-Einheit entspricht einem CSS-Pixel: Schrift bleibt unverzerrt.
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    const right=chartWidth-20, bottom=chartHeight-38, top=35, plotWidth=right-65;
    const X=y=>65+(y-FIRST)/(LAST-FIRST)*plotWidth,Y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
    let out=`<text x="65" y="15" fill="#a4adbd" font-size="11">${unit}</text>`;
    for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=Y(v);out+=`<path d="M65 ${y}H${right}" stroke="#30343b"/><text x="54" y="${y+4}" text-anchor="end" fill="#a4adbd" font-size="11">${unit.startsWith('Index')?Math.round(v):compact(v)}</text>`;}
    for(const y of [FIRST,1995,2000,2005,2010,2015,2020,LAST])out+=`<text x="${X(y)}" y="${bottom+28}" text-anchor="middle" fill="#a4adbd" font-size="12">${y}</text>`;
    if(view==='balance'){
      out+=`<path d="M65 ${Y(0)}H${right}" stroke="#7d879b"/>`;
      const slot=plotWidth/(LAST-FIRST+1),bw=slot*.72/sets.length;
      rows.forEach(r=>sets.forEach((s,j)=>{const v=s[2](r),x=X(r.y)+(j-sets.length/2)*bw;out+=`<rect x="${x}" y="${Math.min(Y(0),Y(v))}" width="${bw-1}" height="${Math.max(1,Math.abs(Y(v)-Y(0)))}" fill="${s[1]}" opacity="${r.y===year?1:.55}"><title>${r.y} · ${s[0]}: ${sgn(v)}</title></rect>`;}));
    }else{
      sets.forEach(s=>{const path=rows.map((r,i)=>`${i===0?'M':'L'}${X(r.y)} ${Y(s[2](r))}`).join(' ');out+=`<path d="${path}" fill="none" stroke="${s[1]}" stroke-width="2.5"/>`;});
    }
    out+=`<path d="M${X(year)} ${top}V${bottom}" stroke="#eef2f6" stroke-dasharray="3 5" opacity=".5"/>`;
    if(view!=='balance')sets.forEach(s=>out+=`<circle cx="${X(year)}" cy="${Y(s[2](d))}" r="5" fill="${s[1]}" stroke="#121212" stroke-width="2"/>`);
    // Transparent year targets provide per-year values on hover without changing the selected year.
    rows.forEach(r=>{out+=`<rect x="${X(r.y)-10}" y="${top}" width="20" height="${bottom-top}" fill="transparent"><title>${r.y}\n${sets.map(s=>s[0]+': '+(unit.startsWith('Index')?s[2](r).toLocaleString('de-DE',{maximumFractionDigits:1}):fmt(s[2](r)))).join('\n')}</title></rect>`;});
    svg.innerHTML=out;
    const event=a.EVENTS[year];
    $('ex-context').textContent=event ? year+' · '+event.t+': '+event.s : year===2025 ? '2025: Der Wanderungssaldo gleicht das Geburtendefizit in diesem Jahr nicht vollständig aus.' : 'Klicke auf ein Jahr, um seine Werte zu vergleichen.';
    el.querySelectorAll('[data-story]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.story===year));
  }
  return {render};
})();
