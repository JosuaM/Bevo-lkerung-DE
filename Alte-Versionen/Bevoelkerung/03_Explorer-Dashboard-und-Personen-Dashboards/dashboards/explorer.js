/* Interaktive Vertiefung für Variation 1. Bestehende Personen-Dashboards bleiben unabhängig. */
window.populationExplorer = (() => {
  const style = document.createElement('style');
  style.textContent = `
  #explorer{display:none;position:fixed;inset:76px var(--pad) 24px;z-index:30;overflow:auto;color:var(--ink)}
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
  #explorer [hidden]{display:none!important}
  .ex-topline{display:flex;align-items:center;justify-content:space-between;gap:16px}
  #ex-variant{font:inherit;font-size:13px;color:var(--ink);background:var(--bg);border:1px solid #3a4252;border-radius:5px;padding:8px 12px;color-scheme:dark}
  .ex-side-switch{display:flex;gap:4px;padding-bottom:16px;margin-bottom:14px;border-bottom:1px solid #30343b}
  #explorer .ex-side-switch button{flex:1;padding:7px 8px;font-size:12px}
  #ex-side-events{max-height:430px;overflow:auto}
  .ex-reason{border-bottom:1px solid #30343b}
  #explorer .ex-reason button{width:100%;text-align:left;border:0;border-radius:0;padding:12px 0;font-size:13px;display:flex;gap:10px;align-items:baseline;line-height:1.4}
  .ex-reason button span{color:var(--c-in);font-variant-numeric:tabular-nums;font-size:12px}
  #explorer .ex-reason button[aria-expanded=true]{color:white}
  #explorer .ex-reason p{font-size:12px;line-height:1.5;padding-bottom:14px;color:#a4adbd}
  @media(max-width:700px){.ex-topline{align-items:flex-start}#ex-variant{max-width:150px;font-size:12px}}
  #explorer .ex-insight{margin:18px 0 0}
  .ex-plot{position:relative}
  #ex-event-tooltip{position:absolute;z-index:5;pointer-events:none;background:#20252c;border:1px solid #495563;border-radius:5px;padding:7px 10px;font-size:12px;color:#eef2f6;max-width:calc(100% - 24px);box-shadow:0 4px 16px #0004}
  #ex-chart-event strong{display:inline!important;margin:0 10px 0 0!important;font-size:13px!important}
  #ex-chart-event p{display:inline;font-size:13px!important}
  .chart-event{cursor:pointer;outline:none}
  .chart-event line{stroke:#6e8997;stroke-width:1.5;stroke-opacity:.45;transition:stroke .2s,stroke-width .2s,stroke-opacity .2s}
  .chart-event text{fill:#a4adbd;font-size:12px;paint-order:stroke;stroke:var(--bg);stroke-width:5px;stroke-linejoin:round;transition:fill .2s}
  .chart-event:hover line,.chart-event:focus line,.chart-event.selected line{stroke:var(--c-in);stroke-width:2.5;stroke-opacity:1}
  .chart-event:hover text,.chart-event:focus text,.chart-event.selected text{fill:white}
  #ex-chart-event{border-top:1px solid #30343b;margin-top:16px;padding-top:13px}
  #ex-chart-event strong{display:block;color:var(--c-in);font-size:14px;font-weight:400;margin-bottom:6px}
  #explorer #ex-chart-event p{font-size:13px;line-height:1.5}
  #ex-floating-info{display:none}
  .dashboard-three #explorer{bottom:112px}
  .dashboard-three #ex-floating-info{display:block;position:absolute;top:144px;left:0;right:296px;z-index:3;max-height:210px;overflow:auto}
  .dashboard-three #ex-floating-info .ex-insight,.dashboard-three #ex-floating-info .ex-ratio{margin:0 0 9px;background:#17191d}
  .dashboard-three .ex-grid{display:block;position:absolute;inset:340px 0 0;padding:0;min-height:260px}
  .dashboard-three .ex-card{position:fixed;right:var(--pad);top:220px;width:270px;padding:14px 18px;background:#17191d;z-index:3}
  .dashboard-three #ex-year{font-size:30px;margin:2px 0 7px}
  .dashboard-three .ex-metric{padding:5px 0;font-size:12px}
  .dashboard-three .ex-total{padding-top:6px;font-size:12px}
  .dashboard-three .ex-total strong{font-size:21px;margin:3px 0}
  .dashboard-three .ex-plot{height:100%;border:0;padding:0;background:transparent}
  .dashboard-three #ex-chart{height:calc(100% - 150px);min-height:220px;margin-top:6px}
  .dashboard-three .ex-legend{margin-top:2px}
  .dashboard-three .ex-insight-grid{gap:12px}.dashboard-three #explorer .ex-insight p{font-size:12px}
  @media(max-width:800px){.dashboard-three #ex-floating-info{right:236px}.dashboard-three .ex-card{width:220px}.dashboard-three .ex-insight-grid{grid-template-columns:1fr}}
  #explorer.variant-two .ex-tools{align-items:flex-start}
  #explorer.variant-two .ex-tools h2{font-size:var(--fs-m);max-width:55%;line-height:1.25}
  #explorer.variant-two .ex-tools .ex-tabs{display:flex;flex-wrap:nowrap;margin:0 0 0 auto;padding:3px;gap:0;border:1px solid #3a4252;border-radius:8px;background:#ffffff05}
  #explorer.variant-two .ex-tabs button{border:0;border-radius:5px;font-size:calc(var(--fs-s)*.85);padding:8px 12px;white-space:nowrap}
  #explorer.variant-two .ex-metric{font-size:calc(var(--fs-s)*.85);padding:12px 0}
  #explorer.variant-two .ex-yearbar{font-size:calc(var(--fs-s)*.8)}
  #explorer.variant-two .ex-total{font-size:calc(var(--fs-s)*.85)}
  #explorer.variant-two .ex-legend{font-size:calc(var(--fs-s)*.8)}
  #explorer.variant-two #ex-switch{width:100%;display:flex;justify-content:flex-end}
  #explorer.variant-two #ex-chart{height:clamp(260px,40vh,420px)}
  #ex-event-tooltip{border-radius:10px;width:265px;padding:12px 15px;box-sizing:border-box;transition:width .5s cubic-bezier(.2,.8,.2,1),box-shadow .4s;pointer-events:none}
  #ex-event-tooltip.expanded{width:390px;box-shadow:0 10px 32px #0006}
  .ex-tooltip-heading{font-size:calc(var(--fs-s)*.85);line-height:1.4;font-weight:400;color:#eef2f6}
  .ex-tooltip-detail{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .5s cubic-bezier(.2,.8,.2,1),opacity .35s}
  .expanded .ex-tooltip-detail{grid-template-rows:1fr;opacity:1}
  .ex-tooltip-detail>div{overflow:hidden}
  #explorer .ex-tooltip-detail p{padding-top:9px;font-size:calc(var(--fs-s)*.8);line-height:1.5;color:#c5cddb}
  @media(max-width:1000px){#explorer.variant-two .ex-tools h2{max-width:100%}#explorer.variant-two .ex-tools .ex-tabs{margin-left:auto}}
  .ex-tabs{display:flex;gap:8px;margin:22px 0;flex-wrap:wrap}
  #explorer button{font-size:14px;background:transparent;border:1px solid #3a4252;border-radius:6px;padding:9px 14px;color:#a4adbd}
  #explorer button:hover{border-color:#a4adbd;color:white}#explorer button[aria-selected=true],#explorer button[aria-pressed=true]{background:#eef2f6;color:#121212;border-color:#eef2f6}
  #explorer button:focus-visible,#ex-chart:focus-visible{outline:2px solid var(--c-in);outline-offset:3px}
  .ex-grid{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:24px}.ex-plot,.ex-card{border:1px solid #30343b;border-radius:10px;background:rgba(255,255,255,.018);padding:22px}
  .ex-tools{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:38px;flex-wrap:wrap}.ex-tools h2{font-size:17px;font-weight:400;margin:0}.ex-switch{display:flex;gap:5px}#explorer .ex-switch button{padding:6px 10px;font-size:12px}
  #ex-chart{display:block;width:100%;height:calc(clamp(220px,34vh,350px) + var(--event-space,0px));margin-top:14px;touch-action:pan-y;cursor:pointer}
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
  el.innerHTML=`<div class="ex-topline"><h1>Bevölkerung verstehen</h1><select id="ex-variant" aria-label="Dashboard-Variation"><option value="1">Dashboard 1</option><option value="2">Dashboard 2</option><option value="3">Dashboard 3</option></select></div><p>Zwei Perspektiven. Wähle ein Jahr im Diagramm.</p>
  <div class="ex-tabs" role="tablist" aria-label="Perspektive">
  <button role="tab" data-view="balance" aria-selected="true">Bevölkerungsbilanz</button><button role="tab" data-view="population" aria-selected="false">Mit & ohne Wanderung</button></div>
  <details class="ex-insight"><summary>Warum Zuwanderung zählt <small>Bevölkerung · Arbeitskräfte · Sozialversicherung</small></summary>
  <div class="ex-insight-grid">
    <div><h3>Bevölkerungsrückgang abfedern</h3><p>Ein positiver Wanderungssaldo kann ausgleichen, dass mehr Menschen sterben als geboren werden. Wie weit das gelingt, zeigt die Bilanz für jedes Jahr.</p></div>
    <div><h3>Arbeitskräfte gewinnen</h3><p>Zugewanderte können freie Stellen besetzen und helfen, den Rückgang der Arbeitskräfte durch den Renteneintritt älterer Jahrgänge abzumildern.</p></div>
    <div><h3>Renten mitfinanzieren</h3><p>Wer sozialversicherungspflichtig arbeitet, zahlt Beiträge und trägt zur Finanzierung laufender Renten und weiterer Sozialleistungen bei.</p></div>
  </div><p class="ex-insight-footer">Entscheidend sind Alter, Beschäftigung und Einkommen. Zuwanderung kann die Alterung abmildern, löst sie aber nicht allein. Einordnung: <a href="https://iab.de/publikationen/publikation/?id=14799426" target="_blank" rel="noopener noreferrer">IAB · Arbeitsmarkt</a> · <a href="https://fdz.iab.de/publikation/?id=10134835" target="_blank" rel="noopener noreferrer">IAB · Rentenversicherung</a></p></details>
  <div class="ex-grid"><div class="ex-plot" role="tabpanel" id="ex-panel"><div class="ex-tools"><h2 id="ex-heading"></h2><div class="ex-switch" id="ex-switch"></div></div><svg id="ex-chart" viewBox="0 0 850 350" preserveAspectRatio="xMidYMid meet" role="img" tabindex="0" aria-label="Jahresdiagramm. Mit den Pfeiltasten das Jahr wählen."></svg><div id="ex-event-tooltip" role="tooltip" hidden></div><div class="ex-legend" id="ex-legend"></div><div id="ex-chart-event" hidden></div></div>
  <aside class="ex-card" aria-label="Jahreswerte und Ereignisse"><div id="ex-side-values"><div class="ex-yearbar"><span>Ausgewähltes Jahr</span></div><div id="ex-year"></div><div id="ex-metrics"></div></div></aside></div>
  <details class="ex-ratio"><summary id="ex-ratio-summary"></summary><div class="ex-ratio-body"><div class="ex-ratio-grid"><div><div class="ex-ratio-label">100 Abgänge · Sterbefälle + Fortzüge</div><div class="ex-ratio-dots" id="ex-out-dots" aria-hidden="true"></div></div><div><div class="ex-ratio-label" id="ex-in-label"></div><div class="ex-ratio-dots" id="ex-in-dots" aria-hidden="true"></div></div></div><p class="ex-ratio-caption" id="ex-ratio-caption"></p></div></details>
  <div class="ex-stories"><span>Jahre entdecken</span><div id="ex-events" style="display:contents"></div></div><p id="ex-context"></p>`;
  document.body.appendChild(el);
  el.querySelector('.ex-grid').insertAdjacentElement('afterend',el.querySelector('.ex-insight'));
  const floatingInfo=document.createElement('div');floatingInfo.id='ex-floating-info';el.appendChild(floatingInfo);
  let view='balance',detail=false,api=null,lastKey='',story=null,variant='1';
  const $=id=>document.getElementById(id);
  $('ex-variant').onchange=e=>{
    variant=e.target.value;view=variant!=='1'?'population':'balance';story=null;
    const tablist=el.querySelector('.ex-tabs');
    const order=variant!=='1'?['population','balance']:['balance','population'];
    order.forEach(id=>tablist.appendChild(tablist.querySelector('[data-view="'+id+'"]')));
    lastKey='';if(api)render(api);
  };
  const choose=y=>{story=null;api.selectYear(y);lastKey='';};
  const tabs=[...el.querySelectorAll('[role=tab]')];
  tabs.forEach((b,i)=>{b.setAttribute('aria-controls','ex-panel');b.onclick=()=>{view=b.dataset.view;lastKey='';render(api);};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const visibleTabs=[...el.querySelectorAll('[role=tab]')],index=visibleTabs.indexOf(b);const j=e.key==='Home'?0:e.key==='End'?visibleTabs.length-1:(index+(e.key==='ArrowRight'?1:visibleTabs.length-1))%visibleTabs.length;visibleTabs[j].focus();visibleTabs[j].click();};});

  const svg=$('ex-chart');
  const tooltip=$('ex-event-tooltip');
  tooltip.innerHTML='<div class="ex-tooltip-heading"></div><div class="ex-tooltip-detail"><div><p></p></div></div>';
  function showEventTooltip(target,expanded=false){
    const marker=target&&target.closest('[data-eventyear]');
    if(!marker||!api){if(!story)tooltip.hidden=true;return;}
    const year=+marker.dataset.eventyear,event=api.EVENTS[year];
    tooltip.querySelector('.ex-tooltip-heading').textContent=year+' · '+event.t;
    tooltip.querySelector('p').textContent=event.s;
    tooltip.hidden=false;
    const panel=svg.parentElement.getBoundingClientRect(),line=marker.querySelector('line').getBoundingClientRect(),chart=svg.getBoundingClientRect();
    const expandedWidth=Math.min(390,panel.width-24);
    tooltip.style.left=Math.max(12,Math.min(panel.width-expandedWidth-12,line.left-panel.left+12))+'px';
    tooltip.style.top=(chart.top-panel.top+chart.height*.25)+'px';
    requestAnimationFrame(()=>tooltip.classList.toggle('expanded',expanded));
  }
  svg.addEventListener('pointermove',e=>{if(!story)showEventTooltip(e.target);});
  svg.addEventListener('pointerleave',()=>{if(!story)tooltip.hidden=true;});
  svg.addEventListener('focusin',e=>{if(!story)showEventTooltip(e.target);});
  svg.addEventListener('focusout',()=>{if(!story)tooltip.hidden=true;});

  function eventYear(e){
    const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const local=point.matrixTransform(svg.getScreenCTM().inverse());
    const width=svg.viewBox.baseVal.width;
    const left=variant==='2'?90:65;
    return api.clamp(Math.round(api.FIRST+(local.x-left)/(width-left-20)*(api.LAST-api.FIRST)),api.FIRST,api.LAST);
  }
  svg.addEventListener('pointerdown',e=>{
    const marker=e.target.closest('[data-eventyear]');
    if(marker){story=+marker.dataset.eventyear;api.selectYear(story);lastKey='';return;}
    choose(eventYear(e));
  });
  svg.addEventListener('keydown',e=>{const marker=e.target.closest('[data-eventyear]');if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();story=+marker.dataset.eventyear;api.selectYear(story);lastKey='';return;}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();choose(api.year+(e.key==='ArrowRight'?1:-1));}});
  const compact=n=>Math.abs(n)>=1e6?(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio.':Math.round(n/1000).toLocaleString('de-DE')+' Tsd.';
  function render(a){
    api=a;
    if (!$('ex-events').children.length){
      Object.entries(a.EVENTS).forEach(([year,event])=>{
        const button=document.createElement('button');button.dataset.story=year;button.textContent=year+' · '+event.t;
        button.onclick=()=>{story=+year;api.selectYear(story);lastKey='';};$('ex-events').appendChild(button);
      });
    }
    a.setTimelineVisible(variant==='3');
    el.classList.toggle('variant-two',variant==='2');
    const tablist=el.querySelector('.ex-tabs'),tools=el.querySelector('.ex-tools');
    if(variant==='2'&&tablist.parentElement!==tools)tools.insertBefore(tablist,$('ex-switch'));
    else if(variant!=='2'&&tablist.parentElement===tools)el.querySelector('.ex-topline').nextElementSibling.insertAdjacentElement('afterend',tablist);
    const insight=el.querySelector('.ex-insight'),ratio=el.querySelector('.ex-ratio');
    if(variant==='3'){
      if(insight.parentElement!==floatingInfo){floatingInfo.append(insight,ratio);}
    }else if(insight.parentElement===floatingInfo){
      el.querySelector('.ex-grid').insertAdjacentElement('afterend',insight);insight.insertAdjacentElement('afterend',ratio);
    }
    const chartWidth=Math.max(280,Math.round(svg.clientWidth));
    const shortNames={1992:'Jugoslawienkriege',1993:'Asylkompromiss',2011:'EU-Freizügigkeit',2012:'Eurokrise',2014:'Bulgarien & Rumänien',2015:'Flucht aus Syrien',2020:'Corona',2022:'Ukrainekrieg'};
    const leftMargin=variant==='2'?90:65;
    const markers=variant==='2'?Object.entries(a.EVENTS).map(([y,event])=>({year:+y,label:shortNames[y]||event.t,x:leftMargin+(+y-a.FIRST)/(a.LAST-a.FIRST)*(chartWidth-leftMargin-20)})):[];
    const eventSpace=0;
    el.style.setProperty('--event-space',eventSpace+'px');
    const chartHeight=Math.max(220,Math.round(svg.clientHeight));
    const key=[variant,chartWidth,chartHeight,view,detail,a.year,...Object.values(a.COLORS),story].join('|');if(key===lastKey)return;lastKey=key;
    const {DATA,FIRST,LAST,year,d,COLORS:c,fmt,sgn,BASE,cumN}=a;
    el.querySelector('.ex-stories').hidden=variant!=='1';$('ex-context').hidden=variant!=='1';
    const eventInfo=$('ex-chart-event'),selectedEvent=variant==='2'&&story?a.EVENTS[story]:null;
    eventInfo.hidden=true;
    if(selectedEvent)eventInfo.innerHTML='<strong>'+story+' · '+selectedEvent.t+'</strong><p>'+selectedEvent.s+'</p>';
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
    $('ex-year').textContent=year;
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
    const right=chartWidth-20, bottom=chartHeight-38-eventSpace, top=35, plotWidth=right-leftMargin;
    const X=y=>leftMargin+(y-FIRST)/(LAST-FIRST)*plotWidth,Y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
    let out=`<text x="${leftMargin}" y="15" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):11}">${unit}</text>`;
    for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=Y(v);out+=`<path d="M${leftMargin} ${y}H${right}" stroke="#30343b"/><text x="${leftMargin-11}" y="${y+4}" text-anchor="end" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):11}">${unit.startsWith('Index')?Math.round(v):compact(v)}</text>`;}
    if(variant==='2'){
      for(let y=FIRST;y<=LAST;y++){
        const major=y===FIRST||y===LAST||y%5===0;
        out+=`<line x1="${X(y)}" x2="${X(y)}" y1="${bottom+3}" y2="${bottom+(major?12:8)}" stroke="${major?'#a4adbd':'#667183'}" stroke-width="${major?1.5:1}"/>`;
      }
    }
    if(variant!=='3')for(const y of [FIRST,1995,2000,2005,2010,2015,2020,LAST])out+=`<text x="${X(y)}" y="${bottom+28}" text-anchor="middle" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):12}">${y}</text>`;
    if(view==='balance'){
      out+=`<path d="M${leftMargin} ${Y(0)}H${right}" stroke="#7d879b"/>`;
      const slot=plotWidth/(LAST-FIRST+1),bw=slot*.72/sets.length;
      rows.forEach(r=>sets.forEach((s,j)=>{const v=s[2](r),x=X(r.y)+(j-sets.length/2)*bw;out+=`<rect x="${x}" y="${Math.min(Y(0),Y(v))}" width="${bw-1}" height="${Math.max(1,Math.abs(Y(v)-Y(0)))}" fill="${s[1]}" opacity="${r.y===year?1:.55}"><title>${r.y} · ${s[0]}: ${sgn(v)}</title></rect>`;}));
    }else{
      sets.forEach(s=>{const path=rows.map((r,i)=>`${i===0?'M':'L'}${X(r.y)} ${Y(s[2](r))}`).join(' ');out+=`<path d="${path}" fill="none" stroke="${s[1]}" stroke-width="2.5"/>`;});
    }
    out+=`<path d="M${X(year)} ${top}V${bottom}" stroke="#eef2f6" stroke-dasharray="3 5" opacity=".5"/>`;
    if(view!=='balance')sets.forEach(s=>out+=`<circle cx="${X(year)}" cy="${Y(s[2](d))}" r="5" fill="${s[1]}" stroke="#121212" stroke-width="2"/>`);
    // Transparent year targets provide per-year values on hover without changing the selected year.
    rows.forEach(r=>{out+=`<rect x="${X(r.y)-10}" y="${top}" width="20" height="${bottom-top}" fill="transparent"><title>${r.y}\n${sets.map(s=>s[0]+': '+(unit.startsWith('Index')?s[2](r).toLocaleString('de-DE',{maximumFractionDigits:1}):fmt(s[2](r)))).join('\n')}</title></rect>`;});
    if(variant==='2')for(const marker of markers){
      out+=`<g class="chart-event ${story===marker.year?'selected':''}" data-eventyear="${marker.year}" role="button" tabindex="0" aria-label="${marker.year} · ${marker.label}"><rect x="${marker.x-Math.min(9,plotWidth/(LAST-FIRST)*.4)}" y="${top}" width="${Math.min(18,plotWidth/(LAST-FIRST)*.8)}" height="${bottom-top}" fill="transparent"/><line x1="${marker.x}" x2="${marker.x}" y1="${top}" y2="${bottom}"/></g>`;
    }
    svg.innerHTML=out;
    const pinned=variant==='2'&&story?svg.querySelector('[data-eventyear="'+story+'"]'):null;
    if(pinned)showEventTooltip(pinned,true);else{tooltip.hidden=true;tooltip.classList.remove('expanded');}
    const event=a.EVENTS[year];
    $('ex-context').textContent=event ? year+' · '+event.t+': '+event.s : year===2025 ? '2025: Der Wanderungssaldo gleicht das Geburtendefizit in diesem Jahr nicht vollständig aus.' : 'Klicke auf ein Jahr, um seine Werte zu vergleichen.';
    el.querySelectorAll('[data-story]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.story===year));
  }
  return {render};
})();
