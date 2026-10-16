/* Interaktive Vertiefung für Variation 1. Bestehende Personen-Dashboards bleiben unabhängig. */
window.populationExplorer = (() => {
  const style = document.createElement('style');
  style.textContent = `
  #explorer{display:none;position:fixed;left:0;top:0;z-index:30;overflow:auto;color:var(--ink);width:calc(100vw / var(--ex-z,1));height:calc(100vh / var(--ex-z,1));padding:calc(108px / var(--ex-z,1)) calc(var(--pad) / var(--ex-z,1)) calc(24px / var(--ex-z,1));transform:scale(var(--ex-z,1));transform-origin:0 0}
  .exploring #explorer{display:block}.exploring #c{visibility:hidden}
  #explorer h1{font-size:var(--fs-m);font-weight:400;margin:0 0 8px}#explorer p{color:#a4adbd;font-size:14px;line-height:1.5;margin:0}
  .ex-insight{border:1px solid #ffffff40;border-radius:8px;margin:0 0 18px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018) 65%)}
  .ex-insight summary{cursor:pointer;padding:13px 16px;font-size:14px;color:#eef2f6}
  .ex-insight summary::marker{color:#a4adbd}
  .ex-insight summary small{color:#a4adbd;font-size:12px;margin-left:12px}
  .ex-insight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;padding:5px 18px 16px}
  .ex-insight h3{font-size:14px;font-weight:400;color:var(--ink);margin:0 0 7px}
  #explorer .ex-insight p{font-size:13px}
  #explorer .ex-insight-footer{font-size:12px;padding:0 18px 15px;color:#a4adbd}
  .ex-insight a{color:#c6d4e4;text-underline-offset:3px}
  @media(max-width:700px){.ex-insight-grid{grid-template-columns:1fr;gap:14px}.ex-insight summary small{display:block;margin:5px 0 0}}
  #explorer [hidden]{display:none!important}
  #explorer{scrollbar-width:none}#explorer::-webkit-scrollbar{display:none}
  #explorer{--fs-l:51.408px;--fs-m:29.817px;--fs-s:20.563px}
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
  #ex-surplus-particles:focus-visible{outline:2px solid #eef2f6;outline-offset:4px}
  #ex-surplus-particles{cursor:pointer}
  .ex-bar{transition:opacity .03s}
  .ex-bar.bar-hover:not(.bar-selected){opacity:.9}
  .ex-bar.bar-selected{stroke:#fff;stroke-width:1.5;paint-order:stroke fill}
  .ex-legend .ex-key-line::before{display:none}
  .ex-key-line svg{width:24px;height:12px;margin-right:7px;vertical-align:middle;overflow:visible}
  .chart-event{cursor:pointer;outline:none}
  .chart-event line{stroke:#6e8997;stroke-width:1.5;stroke-opacity:.45;transition:stroke .2s,stroke-width .2s,stroke-opacity .2s}
  .chart-event text{fill:#a4adbd;font-size:12px;stroke:none;transition:fill .2s}
  .chart-event.hovered line,.chart-event:focus-visible line,.chart-event.selected line{stroke:var(--c-in);stroke-width:2.5;stroke-opacity:1}
  .chart-event.hovered text,.chart-event:focus-visible text,.chart-event.selected text{fill:white}
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
  #explorer.variant-two #ex-chart{height:clamp(260px,calc(40vh / var(--ex-z,1)),420px)}
  #ex-event-tooltip{border-radius:10px;width:265px;padding:12px 15px;box-sizing:border-box;transition:width .5s cubic-bezier(.2,.8,.2,1),box-shadow .4s;pointer-events:none}
  #ex-event-tooltip.expanded{width:390px;box-shadow:0 10px 32px #0006}
  .ex-tooltip-heading{font-size:calc(var(--fs-s)*.85);line-height:1.4;font-weight:400;color:#eef2f6}
  .ex-tooltip-detail{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .5s cubic-bezier(.2,.8,.2,1),opacity .35s}
  .expanded .ex-tooltip-detail{grid-template-rows:1fr;opacity:1}
  .ex-tooltip-detail>div{overflow:hidden}
  #explorer .ex-tooltip-detail p{padding-top:9px;font-size:calc(var(--fs-s)*.8);line-height:1.5;color:#c5cddb}
  @media(max-width:1000px){#explorer.variant-two .ex-tools h2{max-width:100%}#explorer.variant-two .ex-tools .ex-tabs{margin-left:auto}}
  .ex-individual #ex-side-values{height:100%;display:flex;flex-direction:column}
  .ex-individual #ex-side-values>div:not(.ex-particle-slot){flex-shrink:0}
  .ex-individual .ex-particle-slot{flex:1;display:flex;align-items:center;box-sizing:border-box;padding-top:12px;min-height:0}
  .ex-individual #ex-surplus-particles{flex-shrink:0}
  .ex-year-column{display:flex;flex-direction:column;gap:18px;min-width:0}
  #explorer.variant-two .ex-year-column .ex-tabs{display:flex;flex-wrap:nowrap;padding:0;gap:0;margin:0;border:1px solid #3a4252;border-radius:8px;overflow:hidden;background:#ffffff05}
  #explorer.variant-two .ex-year-column .ex-tabs button{flex:1;min-width:0;border:0;border-radius:0;padding:10px 7px;font-size:13px;white-space:normal}
  #explorer.variant-two .ex-year-column .ex-tabs button[aria-selected=true]{background:#eef2f6}
  .ex-year-column .ex-card{flex:1}
  #explorer.variant-two .ex-grid{margin-top:36px}
  #explorer.variant-two .ex-tools h2{display:none}
  #explorer.variant-two .ex-tools{min-height:0}
  #explorer.variant-two #ex-switch:empty{display:none}
  #explorer.variant-two #ex-chart{height:clamp(340px,calc(49vh / var(--ex-z,1)),560px);margin-top:18px}
  #ex-event-tooltip{width:max-content;min-width:280px;max-width:none!important;transition:width .4s,box-shadow .4s}
  #ex-event-tooltip.expanded{width:max-content}
  .ex-tooltip-heading{white-space:nowrap}
  #explorer .ex-tooltip-detail p{color:#a4adbd}
  .ex-tooltip-detail{grid-template-rows:1fr;opacity:1}
  .ex-dashboard-switch{display:flex;justify-content:flex-end;margin:26px 0 18px}
  #explorer.variant-two .ex-dashboard-switch .ex-tabs{display:flex;width:270px;gap:0;margin:0;padding:0;border:1px solid #ffffff40;border-radius:8px;overflow:hidden;background:#ffffff05}
  #explorer.variant-two .ex-dashboard-switch .ex-tabs button{flex:1;border:0;border-radius:0;padding:10px 7px;font-size:13px;white-space:normal}
  #explorer.variant-two .ex-grid{margin-top:0}
  #explorer.variant-two .ex-tools{display:none}
  .ex-chart-footer{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:44px;margin-top:12px}
  #explorer.variant-two .ex-chart-footer .ex-legend{margin:0;flex:1}
  #explorer.variant-two .ex-chart-footer #ex-switch{display:flex;width:auto;flex-shrink:0;gap:0;padding:0;border:1px solid #ffffff40;border-radius:7px;overflow:hidden;background:#ffffff05}
  #explorer.variant-two .ex-chart-footer #ex-switch:empty{display:none}
  #explorer .ex-chart-footer #ex-switch button{border:0;border-radius:0;margin:0;padding:8px 12px;font-size:13px}
  #ex-chart,#ex-chart:focus,#ex-chart:focus-visible{outline:none!important;box-shadow:none}
  @media(max-width:1000px){#explorer.variant-two .ex-dashboard-switch .ex-tabs{width:220px}}
  @media(max-width:700px){.ex-chart-footer{flex-wrap:wrap}.ex-dashboard-switch{margin-top:18px}}
  .ex-topline{align-items:center;gap:24px}.ex-topline h1{margin:0!important}
  .ex-dashboard-switch{margin:0;flex-shrink:0}
  #explorer.variant-two .ex-grid{margin-top:36px}
  .ex-topline+p{margin-top:10px!important}
  .ex-value-tooltip{position:absolute;z-index:7;pointer-events:none;padding:10px 13px;border:1px solid #495563;border-radius:10px;background:#20252c;box-shadow:0 6px 24px #0004;min-width:190px;animation:valueCardIn .22s ease both}
  .ex-value-tooltip span{display:block;font-size:12px;color:#a4adbd;margin-bottom:4px}
  .ex-value-tooltip strong{display:block;font-weight:500;font-size:var(--fs-s);color:#eef2f6;font-variant-numeric:tabular-nums}
  @keyframes valueCardIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .value-stem{stroke-dasharray:50;stroke-dashoffset:50;animation:valueStemIn .25s ease forwards}
  @keyframes valueStemIn{to{stroke-dashoffset:0}}
  .chart-event .event-star{fill:#91a5b1;font-size:13px;transition:fill .2s}
  .chart-event.hovered .event-star,.chart-event:focus-visible .event-star,.chart-event.selected .event-star{fill:var(--c-in)}
  .chart-event.selected{filter:drop-shadow(0 0 5px #38e0ff66)}
  #ex-chart.value-hover .chart-event.selected{filter:none}
  #ex-chart.value-hover .chart-event.selected line{stroke:#6e8997;stroke-width:1.5;stroke-opacity:.45}
  #ex-chart.value-hover .chart-event.selected .event-star{fill:#91a5b1}
  @media(max-width:800px){.ex-topline{flex-wrap:wrap}.ex-dashboard-switch{margin-left:auto}}
  #explorer.variant-two .ex-dashboard-switch .ex-tabs{width:380px}
  #explorer.variant-two .ex-dashboard-switch .ex-tabs button{flex:1 1 0;white-space:nowrap;padding:10px 12px}
  @media(max-width:700px){#explorer.variant-two .ex-dashboard-switch .ex-tabs{width:min(380px,calc(100vw - 40px))}#explorer.variant-two .ex-dashboard-switch .ex-tabs button{font-size:12px;padding-inline:8px}}
  .ex-dashboard-switch{margin:24px 0 10px}
  #explorer.variant-two .ex-grid{margin-top:0;padding:22px;border:1px solid #ffffff40;border-radius:10px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018) 65%)}
  #explorer.variant-two .ex-grid .ex-plot{padding:0;border:0;border-radius:0;background:transparent}
  #explorer.variant-two .ex-grid .ex-card{padding:0 0 0 22px;border:0;border-left:1px solid #ffffff40;border-radius:0;background:transparent}
  @media(max-width:1000px){#explorer.variant-two .ex-grid{padding:18px}#explorer.variant-two .ex-grid .ex-card{padding-left:18px}}
  @media(max-width:700px){#explorer.variant-two .ex-grid .ex-card{border-left:0;border-top:1px solid #ffffff40;padding:18px 0 0}.ex-dashboard-switch{margin-top:18px}}
  .ex-topline{margin-top:14px;align-items:center}
  .ex-heading-group{min-width:0}
  #explorer .ex-heading-group p{margin-top:10px}
  .ex-topline .ex-dashboard-switch{margin:0;align-self:center;transform:none}
  #explorer .ex-heading-group h1{font-size:calc(var(--fs-m)*.85);line-height:1.3}
  #explorer.variant-two .ex-grid{margin-top:24px}
  @media(max-width:800px){.ex-topline .ex-dashboard-switch{transform:none}.ex-topline{row-gap:18px}}
  .ex-tabs{display:flex;gap:8px;margin:22px 0;flex-wrap:wrap}
  #explorer button{font-size:14px;background:transparent;border:1px solid #3a4252;border-radius:6px;padding:9px 14px;color:#a4adbd}
  #explorer button:hover{border-color:#a4adbd;color:white}#explorer button[aria-selected=true],#explorer button[aria-pressed=true]{background:#eef2f6;color:#121212;border-color:#eef2f6}
  #explorer button:focus-visible,#ex-chart:focus-visible{outline:2px solid var(--c-in);outline-offset:3px}
  .ex-grid{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:24px}.ex-plot,.ex-card{border:1px solid #30343b;border-radius:10px;background:rgba(255,255,255,.018);padding:22px}
  .ex-tools{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:38px;flex-wrap:wrap}.ex-tools h2{font-size:17px;font-weight:400;margin:0}.ex-switch{display:flex;gap:5px}#explorer .ex-switch button{padding:6px 10px;font-size:12px}
  #ex-chart{display:block;width:100%;height:calc(clamp(220px,calc(34vh / var(--ex-z,1)),350px) + var(--event-space,0px));margin-top:14px;touch-action:pan-y;cursor:pointer}
  .ex-legend{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:#a4adbd;margin-top:12px}.ex-legend span::before{content:'';display:inline-block;width:14px;height:3px;background:var(--key);margin-right:7px;vertical-align:middle}
  #ex-year{font-size:var(--fs-l);font-weight:300;margin:6px 0 20px}.ex-yearbar{display:flex;justify-content:space-between;align-items:center;color:#a4adbd;font-size:12px}.ex-yearbar button{padding:4px 10px!important}
  .ex-metric{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:10px 0;color:#a4adbd;border-bottom:1px solid #30343b}.ex-metric strong{font-weight:400;color:var(--ink);white-space:nowrap}.ex-total{padding-top:18px;font-size:13px;color:#a4adbd}.ex-total strong{display:block;font-size:25px;font-weight:300;color:var(--ink);margin:5px 0 12px}
  .ex-stories{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px}.ex-stories>span{font-size:12px;color:#a4adbd;margin-right:4px}#explorer .ex-stories button{font-size:12px;padding:7px 10px}
  #ex-context{margin-top:12px;max-width:900px;min-height:42px}#ex-note{margin-top:12px;font-size:11px;color:#8893a5}
  @media(max-height:780px){.ex-tabs{margin:12px 0}.ex-metric{padding:7px 0}#ex-year{margin:4px 0 10px}.ex-total{padding-top:10px}.ex-total strong{font-size:22px;margin:4px 0}.ex-plot,.ex-card{padding:15px}}
  @media(max-width:1000px){.ex-grid{grid-template-columns:minmax(0,1fr) 220px;gap:12px}.ex-plot,.ex-card{padding:15px}#explorer{inset-inline:20px}}
  @media(max-width:700px){.ex-grid{grid-template-columns:1fr}.ex-card{display:block}.ex-tabs{margin:14px 0}#explorer{top:97px}.ex-metric{padding:7px 0}}
  `;
  document.head.appendChild(style);
  const el = document.createElement('section');el.id='explorer';el.setAttribute('aria-label','Bevölkerung erkunden');
  el.innerHTML=`<div class="ex-topline"><h1>Bevölkerung verstehen</h1></div>
  <div class="ex-tabs" role="tablist" aria-label="Perspektive">
  <button role="tab" data-view="balance" aria-selected="true">Bevölkerungsbilanz</button><button role="tab" data-view="population" aria-selected="false">Mit & ohne Wanderung</button></div>
  <details class="ex-insight"><summary>Warum Zuwanderung zählt <small>Bevölkerung · Arbeitskräfte · Sozialversicherung</small></summary>
  <div class="ex-insight-grid">
    <div><h3>Bevölkerungsrückgang abfedern</h3><p>Ein positiver Wanderungssaldo kann ausgleichen, dass mehr Menschen sterben als geboren werden. Wie weit das gelingt, zeigt die Bilanz für jedes Jahr.</p></div>
    <div><h3>Arbeitskräfte gewinnen</h3><p>Zugewanderte können freie Stellen besetzen und helfen, den Rückgang der Arbeitskräfte durch den Renteneintritt älterer Jahrgänge abzumildern.</p></div>
    <div><h3>Renten mitfinanzieren</h3><p>Wer sozialversicherungspflichtig arbeitet, zahlt Beiträge und trägt zur Finanzierung laufender Renten und weiterer Sozialleistungen bei.</p></div>
  </div><p class="ex-insight-footer">Entscheidend sind Alter, Beschäftigung und Einkommen. Zuwanderung kann die Alterung abmildern, löst sie aber nicht allein.</p></details>
  <div class="ex-grid"><div class="ex-plot" role="tabpanel" id="ex-panel"><div class="ex-tools"><h2 id="ex-heading"></h2><div class="ex-switch" id="ex-switch"></div></div><svg id="ex-chart" viewBox="0 0 850 350" preserveAspectRatio="xMidYMid meet" role="img" tabindex="0" aria-label="Jahresdiagramm. Mit den Pfeiltasten das Jahr wählen."></svg><div id="ex-event-tooltip" role="tooltip" hidden></div><div class="ex-legend" id="ex-legend"></div><div id="ex-chart-event" hidden></div></div>
  <aside class="ex-card" aria-label="Jahreswerte und Ereignisse"><div id="ex-side-values"><div class="ex-yearbar"><span>Ausgewähltes Jahr</span></div><div id="ex-year"></div><div id="ex-metrics"></div></div></aside></div>

`;
  document.body.appendChild(el);
  // Das ganze Dashboard wird proportional zur Fenstergröße skaliert (Referenz 1512×860), damit es überall gleich aussieht.
  let zoom=1;
  const applyZoom=()=>{zoom=Math.max(.4,Math.min(3,Math.min(innerWidth/1512,innerHeight/860)));el.style.setProperty('--ex-z',zoom);};
  applyZoom();addEventListener('resize',applyZoom);
  const localRect=node=>{const r=node.getBoundingClientRect();return {left:r.left/zoom,top:r.top/zoom,width:r.width/zoom,height:r.height/zoom};};
  el.querySelector('.ex-grid').insertAdjacentElement('afterend',el.querySelector('.ex-insight'));
  let view='population',detail=false,populationPercent=false,api=null,lastKey='',story=null;
  const percentFmt=n=>n.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
  const variant='2';
  const $=id=>document.getElementById(id);
  const surplusCanvas=document.createElement('canvas');
  surplusCanvas.id='ex-surplus-particles';
  surplusCanvas.setAttribute('role','button');
  surplusCanvas.tabIndex=0;
  surplusCanvas.setAttribute('aria-label','Partikelwolke bewegen');
  surplusCanvas.style.cssText='position:relative;inset:auto;display:block;width:100%;height:clamp(120px,calc(19vh / var(--ex-z,1)),190px);margin-top:4px;pointer-events:auto';
  const particleSlot=document.createElement('div');particleSlot.className='ex-particle-slot';
  particleSlot.append(surplusCanvas);$('ex-side-values').append(particleSlot);
  surplusCanvas.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();surplusCanvas.click();}
  });
  const surplusContext=surplusCanvas.getContext('2d');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const cloudPointer={active:false,x:0,y:0};
  const cloudClickPulses=[];
  let cloudSpinTime=-Infinity,cloudSpinOffset=0;
  surplusCanvas.addEventListener('click',e=>{
    if(!reducedMotion.matches&&e.detail<2)cloudClickPulses.push(performance.now()/1000);
  });
  surplusCanvas.addEventListener('dblclick',e=>{
    e.preventDefault();
    if(reducedMotion.matches)return;
    const now=performance.now()/1000;
    if(now-cloudSpinTime<6)return;
    cloudSpinTime=now;
  });
  surplusCanvas.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const box=surplusCanvas.getBoundingClientRect();
    cloudPointer.x=(e.clientX-box.left)/zoom;cloudPointer.y=(e.clientY-box.top)/zoom;cloudPointer.active=true;
  });
  const releaseCloud=()=>{cloudPointer.active=false;};
  surplusCanvas.addEventListener('pointerleave',releaseCloud);
  surplusCanvas.addEventListener('pointercancel',releaseCloud);
  addEventListener('blur',releaseCloud);
  const randomParticle=(i,s)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};
  const surplusParticles=Array.from({length:240},(_,i)=>({
    angle:randomParticle(i,1)*Math.PI*2,
    radius:Math.sqrt(randomParticle(i,2))*.82,
    size:1.1+Math.pow(randomParticle(i,3),1.8)*3.2,
    phase:randomParticle(i,4)*Math.PI*2,
    speed:.35+randomParticle(i,5)*.35,
    opacity:.42+randomParticle(i,6)*.48,
    alpha:0,offsetX:0,offsetY:0
  }));
  let surplusLastTime=0,surplusMotionTime=0;
  function drawSurplus(a){
    surplusCanvas.hidden=false;
    surplusCanvas.style.display=surplusCanvas.hidden?'none':'block';
    if(surplusCanvas.hidden){surplusLastTime=0;return;}
    const value=Math.max(0,a.d.wp-(a.BASE+a.cumN[a.year]));
    const balanceCloud=view==='balance';
    surplusCanvas.setAttribute('aria-label','Partikelwolke bewegen');
    const natural=Math.abs(a.d.wb-a.d.wd),migration=Math.abs(a.d.zu-a.d.fort);
    const individualWeights=[a.d.wb,a.d.wd,a.d.zu,a.d.fort];
    const individualTotal=individualWeights.reduce((sum,n)=>sum+n,0);
    const individualColors=[a.COLORS.birth,a.COLORS.death,a.COLORS.in,a.COLORS.out];
    const magnitude=detail&&balanceCloud?individualTotal:natural+migration;
    const count=balanceCloud?(magnitude?180:0):Math.min(surplusParticles.length,Math.round(value/50000));
    const blueCount=balanceCloud&&magnitude?Math.round(count*migration/magnitude):0;
    surplusCanvas.dataset.blueCount=blueCount;
    surplusCanvas.dataset.redCount=balanceCloud?count-blueCount:0;
    surplusCanvas.dataset.particleCount=count;
    const width=surplusCanvas.clientWidth,height=surplusCanvas.clientHeight;
    if(!width||!height)return;
    const ratio=Math.min((devicePixelRatio||1)*zoom,4);
    if(surplusCanvas.width!==Math.round(width*ratio)||surplusCanvas.height!==Math.round(height*ratio)){
      surplusCanvas.width=Math.round(width*ratio);surplusCanvas.height=Math.round(height*ratio);
    }
    const now=performance.now()/1000,dt=surplusLastTime?Math.min(.06,now-surplusLastTime):1/60;
    const resumed=!surplusLastTime||now-surplusLastTime>.5;
    if(resumed){surplusMotionTime=0;cloudPointer.active=false;}
    else if(!reducedMotion.matches)surplusMotionTime+=dt;
    surplusLastTime=now;
    const time=reducedMotion.matches?0:now;
    // Kurze Bewegungsphasen mit ruhigen Pausen und weichem Ein-/Ausblenden.
    const beat=surplusMotionTime%29;
    const first=beat>=5&&beat<9,second=beat>=19&&beat<24;
    const progress=first?(beat-5)/4:second?(beat-19)/5:0;
    const variation=reducedMotion.matches?0:Math.sin(Math.PI*progress)**2;
    surplusCanvas.dataset.motion=variation>0?'breathe':'normal';
    // Weitere Klicks überlagern den laufenden Impuls, statt die Wolke zurückzusetzen.
    while(cloudClickPulses.length&&now-cloudClickPulses[0]>=2.2)cloudClickPulses.shift();
    const clickExpansion=reducedMotion.matches?0:1-cloudClickPulses.reduce((rest,start)=>{
      const progress=Math.max(0,Math.min(1,(now-start)/2.2));
      return rest*(1-Math.sin(Math.PI*progress)**2);
    },1);
    const spinDuration=6,spinArc=Math.PI*2*spinDuration/32;
    const spinProgress=Math.min(1,Math.max(0,(now-cloudSpinTime)/spinDuration));
    const spinActive=!reducedMotion.matches&&spinProgress<1;
    if(Number.isFinite(cloudSpinTime)&&(spinProgress>=1||reducedMotion.matches)){
      cloudSpinOffset=(cloudSpinOffset+spinArc*(spinProgress**3*(10-15*spinProgress+6*spinProgress**2)))%(Math.PI*2);
      cloudSpinTime=-Infinity;
    }
    const spinAngle=cloudSpinOffset+(spinActive?spinArc*(spinProgress**3*(10-15*spinProgress+6*spinProgress**2)):0);
    if(spinActive)surplusCanvas.dataset.motion='spin';
    const cloudHeight=height;
    const ctx=surplusContext,radius=Math.min(width*.38,cloudHeight*.42);
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    ctx.fillStyle=a.COLORS.birth;
    surplusParticles.forEach((p,i)=>{
      const target=i<count?1:0;
      p.alpha=reducedMotion.matches?target:p.alpha+(target-p.alpha)*(1-Math.exp(-dt*3));
      if(p.alpha<.005)return;
      const angle=p.angle+Math.sin(time*.13+p.phase)*.12+spinAngle;
      const contour=1+.13*Math.sin(angle*3+time*.18)+.08*Math.cos(angle*5-time*.14);
      const driftX=Math.sin(time*p.speed+p.phase)*radius*.12;
      const driftY=Math.cos(time*p.speed*.8+p.phase)*radius*.11;
      const expansion=1+variation*.13+clickExpansion*.27;
      let x=width/2+Math.cos(angle)*p.radius*radius*contour*1.14*expansion+driftX;
      let y=cloudHeight/2+Math.sin(angle)*p.radius*radius*contour*.88*expansion+driftY;
      let pushX=0,pushY=0;
      if(cloudPointer.active&&!reducedMotion.matches){
        const dx=x-cloudPointer.x,dy=y-cloudPointer.y,distance=Math.hypot(dx,dy);
        const reach=Math.min(48,radius*.6),force=Math.max(0,1-distance/reach)**2*5;
        const direction=distance>.01?Math.atan2(dy,dx):p.angle;
        pushX=Math.cos(direction)*force;pushY=Math.sin(direction)*force;
      }
      const response=1-Math.exp(-dt*(cloudPointer.active?8:5));
      p.offsetX=reducedMotion.matches?0:p.offsetX+(pushX-p.offsetX)*response;
      p.offsetY=reducedMotion.matches?0:p.offsetY+(pushY-p.offsetY)*response;
      x=Math.max(p.size+1,Math.min(width-p.size-1,x+p.offsetX));
      y=Math.max(p.size+1,Math.min(height-p.size-1,y+p.offsetY));
      if(balanceCloud&&detail){
        const share=((i*73)%180+.5)/180;let cumulative=0;
        const category=individualWeights.findIndex(weight=>{cumulative+=weight/individualTotal;return share<cumulative;});
        ctx.fillStyle=individualColors[category<0?3:category];
      }else ctx.fillStyle=balanceCloud?((i*73)%180<blueCount?a.COLORS.in:a.COLORS.death):a.COLORS.birth;
      ctx.globalAlpha=p.opacity*p.alpha;
      ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;
  }
  let selectedEventYear=null;
  const choose=(y,event=false)=>{story=null;selectedEventYear=event?y:null;api.selectYear(y);lastKey='';};
  const tabs=[...el.querySelectorAll('[role=tab]')];
  tabs.forEach((b,i)=>{b.setAttribute('aria-controls','ex-panel');b.onclick=()=>{view=b.dataset.view;lastKey='';render(api);};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const visibleTabs=[...el.querySelectorAll('[role=tab]')],index=visibleTabs.indexOf(b);const j=e.key==='Home'?0:e.key==='End'?visibleTabs.length-1:(index+(e.key==='ArrowRight'?1:visibleTabs.length-1))%visibleTabs.length;visibleTabs[j].focus();visibleTabs[j].click();};});

  const tablist=el.querySelector('.ex-tabs');
  const yearColumn=document.createElement('div');yearColumn.className='ex-year-column';
  const card=el.querySelector('.ex-card');card.before(yearColumn);yearColumn.append(card);
  const switchRow=document.createElement('div');switchRow.className='ex-dashboard-switch';
  switchRow.append(tablist);
  const header=el.querySelector('.ex-topline');
  const headingGroup=document.createElement('div');headingGroup.className='ex-heading-group';
  headingGroup.append(header.querySelector('h1'));header.append(headingGroup,switchRow);
  const footer=document.createElement('div');footer.className='ex-chart-footer';
  $('ex-legend').before(footer);footer.append($('ex-legend'),$('ex-switch'));
  tablist.append(tablist.querySelector('[data-view="population"]'),tablist.querySelector('[data-view="balance"]'));
  const svg=$('ex-chart');
  const valueTooltip=document.createElement('div');valueTooltip.className='ex-value-tooltip';valueTooltip.hidden=true;svg.parentElement.append(valueTooltip);
  const comparisonTooltip=document.createElement('div');comparisonTooltip.className='ex-value-tooltip';comparisonTooltip.hidden=true;svg.parentElement.append(comparisonTooltip);
  const valueTooltips=[valueTooltip,comparisonTooltip];
  let hoverGeometry=null,valueHoverKey='';
  function clearValueHover(){svg.querySelectorAll('.bar-hover').forEach(bar=>bar.classList.remove('bar-hover'));svg.classList.remove('value-hover');valueTooltips.forEach(box=>box.hidden=true);valueHoverKey='';const overlay=svg.querySelector('#ex-value-marker');if(overlay)overlay.replaceChildren();}
  function showValueHover(e){
    if(!hoverGeometry){clearValueHover();return false;}
    const {rows,sets,X,Y,top,bottom,formatValue}=hoverGeometry;
    const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const local=point.matrixTransform(svg.getScreenCTM().inverse());
    if(local.x<X(api.FIRST)-8||local.x>X(api.LAST)+8||local.y<top-14||local.y>bottom+10){clearValueHover();return false;}
    const position=api.clamp((local.x-X(api.FIRST))/(X(api.LAST)-X(api.FIRST))*(rows.length-1),0,rows.length-1);
    if(view==='balance'){
      const row=rows[Math.round(position)],x=X(row.y),zero=Y(0);
      const hoverSets=detail?sets:[...sets,overallBalance];
      const near=hoverSets.some(series=>{
        if(detail){
          const before=Math.floor(position),after=Math.min(rows.length-1,before+1),fraction=position-before;
          return Math.abs(local.y-(linearValue(rows.map(r=>Y(series[2](r))),position)))<32;
        }
        const y=Y(series[2](row));return local.y>=Math.min(y,zero)-24&&local.y<=Math.max(y,zero)+24;
      });
      if(!near){clearValueHover();return false;}
      const panel=localRect(svg.parentElement),chart=localRect(svg);
      const groups=detail?[sets.slice(0,2),sets.slice(2)]:sets.map(series=>[series]);
      let nextTop=Math.max(8,chart.top-panel.top+top+12);
      groups.forEach((group,index)=>{
        const box=valueTooltips[index];
        box.innerHTML='<span>'+row.y+'</span>'+group.map(series=>'<span>'+series[0]+'</span><strong style="color:'+series[1]+'">'+api.sgn(series[2](row))+'</strong>').join('');
        box.hidden=false;
        box.style.left=Math.max(10,Math.min(panel.width-box.offsetWidth-10,chart.left-panel.left+x+18))+'px';
        box.style.top=nextTop+'px';nextTop+=box.offsetHeight+10;
      });
      valueHoverKey='balance-'+row.y;
      svg.querySelector('#ex-value-marker').replaceChildren();
      svg.querySelectorAll('.bar-hover').forEach(bar=>bar.classList.remove('bar-hover'));
      if(!detail){
        const bar=[...svg.querySelectorAll('rect[data-baryear]')].reverse().find(bar=>{
          const box=bar.getBBox();return local.x>=box.x-3&&local.x<=box.x+box.width+3&&local.y>=box.y-4&&local.y<=box.y+box.height+4;
        });
        if(bar)svg.querySelectorAll('rect[data-baryear="'+bar.dataset.baryear+'"]').forEach(segment=>segment.classList.add('bar-hover'));
      }
      return true;
    }
    const before=Math.floor(position),after=Math.min(rows.length-1,before+1),fraction=position-before;
    let nearest=null;
    sets.forEach((series,index)=>{
      const interpolated=linearValue(rows.map(r=>Y(series[2](r))),position);
      const distance=Math.abs(local.y-interpolated);
      if(distance<32&&(!nearest||distance<nearest.distance))nearest={series,index,distance};
    });
    if(!nearest){clearValueHover();return false;}
    const row=rows[Math.round(position)],x=X(row.y),key=String(row.y);
    const changed=key!==valueHoverKey;
    const panel=localRect(svg.parentElement),chart=localRect(svg);
    if(populationPercent){
      const box=valueTooltip,model=sets[1],modelValue=model[2](row);
      comparisonTooltip.hidden=true;
      if(changed)box.innerHTML='<span>'+row.y+' · Abstand zur tatsächlichen Bevölkerung</span><strong>'+percentFmt(100-modelValue)+'</strong>';
      box.hidden=false;
      const upper=Y(100),lower=Y(modelValue),middle=(upper+lower)/2;
      const sx=chart.width/svg.viewBox.baseVal.width,sy=chart.height/svg.viewBox.baseVal.height;
      const originX=chart.left-panel.left,originY=chart.top-panel.top;
      const minLeft=originX+X(api.FIRST)*sx,maxLeft=originX+X(api.LAST)*sx-box.offsetWidth;
      const left=Math.max(minLeft,Math.min(Math.max(minLeft,maxLeft),originX+x*sx-box.offsetWidth/2));
      const cardTop=Math.max(originY+top*sy+12,Math.min(originY+bottom*sy-box.offsetHeight-8,originY+middle*sy-box.offsetHeight/2));
      box.style.left=left+'px';box.style.top=cardTop+'px';
      const edge=(left-originX+box.offsetWidth/2)/sx;
      const upperEnd=(cardTop-originY-4)/sy,lowerEnd=(cardTop-originY+box.offsetHeight+4)/sy;
      svg.querySelector('#ex-value-marker').innerHTML=`<line x1="${x}" y1="${upper}" x2="${edge}" y2="${upperEnd}" stroke="#eef2f6" stroke-width="1.5"/><line x1="${x}" y1="${lower}" x2="${edge}" y2="${lowerEnd}" stroke="${model[1]}" stroke-width="1.5"/><circle cx="${x}" cy="${lower}" r="5" fill="${model[1]}" stroke="#121212" stroke-width="2"/>`;
      valueHoverKey=key;
      return true;
    }
    const positions=sets.map((series,index)=>{
      const box=valueTooltips[index],y=Y(series[2](row));
      if(changed)box.innerHTML='<span>'+row.y+' · '+series[0]+'</span><strong style="color:'+series[1]+'">'+formatValue(series[2](row))+'</strong>';
      box.hidden=false;
      return {box,series,y,direction:-1,left:Math.max(10,Math.min(panel.width-box.offsetWidth-10,chart.left-panel.left+x-box.offsetWidth/2)),top:Math.max(8,chart.top-panel.top+y-42-box.offsetHeight-8)};
    });
    // Bei eng beieinanderliegenden Linien die zweite Karte unterhalb platzieren.
    if(positions[1].top < positions[0].top + positions[0].box.offsetHeight + 10){
      positions[1].top=chart.top-panel.top+positions[1].y+50;
      positions[1].direction=1;
    }
    positions.forEach(item=>{item.box.style.left=item.left+'px';item.box.style.top=item.top+'px';});
    if(changed){
      valueHoverKey=key;
      svg.querySelector('#ex-value-marker').innerHTML=positions.map(({series,y,direction})=>`<line class="value-stem" x1="${x}" x2="${x}" y1="${y}" y2="${Math.max(8,y+direction*42)}" stroke="${series[1]}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="${series[1]}" stroke="#121212" stroke-width="2"/>`).join('');
    }
    return true;
  }
  const tooltip=$('ex-event-tooltip');
  tooltip.innerHTML='<div class="ex-tooltip-heading"></div><div class="ex-tooltip-detail"><div><p></p></div></div>';
  function showEventTooltip(target,expanded=false){
    const marker=target&&target.closest('[data-eventyear]');
    if(!marker||!api){if(!story)tooltip.hidden=true;return;}
    const year=+marker.dataset.eventyear,event=api.EVENTS[year];
    tooltip.querySelector('.ex-tooltip-heading').textContent=year+' · '+event.t;
    tooltip.querySelector('p').textContent=event.s;
    tooltip.hidden=false;
    const panel=localRect(svg.parentElement),line=localRect(marker.querySelector('line')),chart=localRect(svg);
    tooltip.classList.add('expanded');
    const expandedWidth=Math.min(Math.max(340,tooltip.querySelector('.ex-tooltip-heading').scrollWidth+32),panel.width-24);
    tooltip.style.width=expandedWidth+'px';
    tooltip.style.left=Math.max(12,Math.min(panel.width-expandedWidth-12,line.left-panel.left+12))+'px';
    tooltip.style.top=(chart.top-panel.top+chart.height*.25)+'px';
    tooltip.classList.toggle('pinned',expanded);
  }
  function clearEventHover(){svg.querySelectorAll('.chart-event.hovered').forEach(marker=>marker.classList.remove('hovered'));}
  svg.addEventListener('pointermove',e=>{
    clearEventHover();
    if(showValueHover(e)){svg.classList.add('value-hover');tooltip.hidden=true;return;}
    const marker=e.target.closest('[data-eventyear]');
    if(marker){marker.classList.add('hovered');showEventTooltip(marker);}else tooltip.hidden=true;
  });
  svg.addEventListener('pointerleave',()=>{clearEventHover();clearValueHover();if(!story)tooltip.hidden=true;});
  svg.addEventListener('focusin',e=>{if(!story)showEventTooltip(e.target);});
  svg.addEventListener('focusout',()=>{if(!story)tooltip.hidden=true;});

  function eventYear(e){
    const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const local=point.matrixTransform(svg.getScreenCTM().inverse());
    const {X}=hoverGeometry;
    return api.clamp(Math.round(api.FIRST+(local.x-X(api.FIRST))/(X(api.LAST)-X(api.FIRST))*(api.LAST-api.FIRST)),api.FIRST,api.LAST);
  }
  svg.addEventListener('pointerdown',e=>{
    // Sichtbare Balken haben beim Klick Vorrang.
    if(view==='balance'){
      const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
      const local=point.matrixTransform(svg.getScreenCTM().inverse());
      const bar=[...svg.querySelectorAll('rect[data-baryear]')].reverse().find(rect=>{
        const box=rect.getBBox();
        return local.x>=box.x&&local.x<=box.x+box.width&&local.y>=box.y&&local.y<=box.y+box.height;
      });
      if(bar){e.preventDefault();choose(+bar.dataset.baryear);return;}
    }
    const marker=e.target.closest('[data-eventyear]');
    if(marker){e.preventDefault();choose(+marker.dataset.eventyear,true);return;}
    choose(eventYear(e));
  });
  svg.addEventListener('keydown',e=>{const marker=e.target.closest('[data-eventyear]');if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();choose(+marker.dataset.eventyear,true);return;}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();choose(api.year+(e.key==='ArrowRight'?1:-1));}});
  const overallBalance=['Gesamtbilanz','#eef2f6',r=>r.wb-r.wd+r.zu-r.fort];
  const compact=n=>Math.abs(n)>=1e6?(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio.':Math.round(n/1000).toLocaleString('de-DE')+' Tsd.';
  function linearValue(values,position){
    const i=Math.min(values.length-2,Math.floor(position)),f=position-i;
    return values[i]*(1-f)+values[i+1]*f;
  }
  function linearPath(rows,series,X,Y){
    return rows.map((r,i)=>`${i===0?'M':'L'}${X(r.y)} ${Y(series[2](r))}`).join(' ');
  }
  function render(a){
    api=a;
    el.classList.toggle('ex-individual',view==='balance'&&detail);
    drawSurplus(a);
    el.classList.add('variant-two');
    const chartWidth=Math.max(280,Math.round(svg.clientWidth));
    const shortNames={1992:'Jugoslawienkriege',1993:'Asylkompromiss',2011:'EU-Freizügigkeit',2012:'Eurokrise',2014:'Bulgarien & Rumänien',2015:'Flucht aus Syrien',2020:'Corona',2022:'Ukrainekrieg'};
    const leftMargin=variant==='2'?90:65;
    const markers=variant==='2'?Object.entries(a.EVENTS).map(([y,event])=>({year:+y,label:shortNames[y]||event.t,x:leftMargin+(+y-a.FIRST)/(a.LAST-a.FIRST)*(chartWidth-leftMargin-20)})):[];
    const eventSpace=0;
    el.style.setProperty('--event-space',eventSpace+'px');
    const chartHeight=Math.max(220,Math.round(svg.clientHeight));
    const key=[variant,chartWidth,chartHeight,view,detail,populationPercent,a.year,...Object.values(a.COLORS),story,selectedEventYear].join('|');if(key===lastKey)return;lastKey=key;
    const {DATA,FIRST,LAST,year,d,COLORS:c,fmt,sgn,BASE,cumN}=a;
    const eventInfo=$('ex-chart-event'),selectedEvent=variant==='2'&&story?a.EVENTS[story]:null;
    eventInfo.hidden=true;
    if(selectedEvent)eventInfo.innerHTML='<strong>'+story+' · '+selectedEvent.t+'</strong><p>'+selectedEvent.s+'</p>';
    tabs.forEach(b=>{const selected=b.dataset.view===view;b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1;});
    $('ex-year').textContent=year;
    const metric=(label,value,color)=>`<div class="ex-metric"><span>${label}</span><strong${color?` style="color:${color}"`:''}>${value}</strong></div>`;
    const total=(label,value,color)=>`<div class="ex-total">${label}<strong${color?` style="color:${color}"`:""}>${value}</strong></div>`;
    let sets=[],rows=DATA,heading='',note='Quelle: Destatis · Jahreswerte 1991–2025.',metrics='',unit='Menschen';
    if(view==='balance'){
      heading=detail?'Vier Größen hinter Deutschlands Bevölkerungsbilanz':'Was hat Deutschlands Bevölkerungsentwicklung beeinflusst?';
      sets=detail?[['Geburten',c.birth,r=>r.wb],['Sterbefälle',c.death,r=>-r.wd],['Einwanderung',c.in,r=>r.zu],['Auswanderung',c.out,r=>-r.fort]]:[['Geburten − Sterbefälle',c.death,r=>r.wb-r.wd],['Einwanderung − Auswanderung',c.in,r=>r.zu-r.fort]];
      metrics=detail
        ?metric('Geburten',fmt(d.wb),c.birth)+metric('Sterbefälle',fmt(d.wd),c.death)+metric('Einwanderung',fmt(d.zu),c.in)+metric('Auswanderung',fmt(d.fort),c.out)
        :metric('Geburten − Sterbefälle',sgn(d.wb-d.wd),c.death)+metric('Einwanderung −<br>Auswanderung',sgn(d.zu-d.fort),c.in)+total('Bilanz der beiden Salden',sgn(d.wb-d.wd+d.zu-d.fort),'#eef2f6');
      note+=' '+(detail?'Abgänge stehen unterhalb der Nulllinie. ':'')+'Die Saldenbilanz kann durch statistische Korrekturen von der Bestandsänderung abweichen.';
    }else if(view==='population'){
      heading='Wie hat sich Deutschlands Bevölkerung mit und ohne Wanderung entwickelt?';sets=[['Tatsächliche Bevölkerung','#eef2f6',r=>r.wp],['Modell ohne Wanderung',c.death,r=>BASE+cumN[r.y]]];
      metrics=metric('Tatsächlich',fmt(d.wp))+metric('Modell ohne Wanderung',fmt(BASE+cumN[year]),c.death)+total('Abstand zum Modell',sgn(d.wp-(BASE+cumN[year])),c.birth);
      if(populationPercent){
        unit='Anteil an der tatsächlichen Bevölkerung (%)';
        sets=[['Tatsächliche Bevölkerung','#eef2f6',()=>100],['Modell ohne Wanderung',c.death,r=>(BASE+cumN[r.y])/r.wp*100]];
        const modelShare=(BASE+cumN[year])/d.wp*100;
        metrics=metric('Tatsächlich',percentFmt(100))+metric('Modell ohne Wanderung',percentFmt(modelShare),c.death)+total('Abstand zum Modell',percentFmt(100-modelShare),c.birth);
      }
      note+=' Bevölkerung am 31.12. · Modell: Bevölkerung Ende 1990 + beobachtete Geburten − Sterbefälle; keine Prognose.';
    }
    el.querySelector('h1').textContent=heading;$('ex-metrics').innerHTML=metrics;
    const switchLabels=view==='population'?['Anzahl','Prozent']:['Bilanz','Einzelwerte'];
    const switchValue=view==='population'?populationPercent:detail;
    $('ex-switch').setAttribute('role','group');
    $('ex-switch').setAttribute('aria-label',view==='population'?'Darstellung der Bevölkerung':'Darstellung der Bilanz');
    $('ex-switch').innerHTML=switchLabels.map((label,i)=>`<button aria-pressed="${i===Number(switchValue)}" data-option="${i}">${label}</button>`).join('');
    $('ex-switch').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      if(view==='population')populationPercent=!!+b.dataset.option;else detail=!!+b.dataset.option;
      lastKey='';render(api);
    });
    const displayedSeries=view==='balance'&&!detail?[...sets,overallBalance]:sets;
    const lineDash=index=>view==='population'?(index===1?'8 5':''):['','8 5','2 5','10 4 2 4'][index];
    $('ex-legend').innerHTML=displayedSeries.map(([label,color],index)=>{
      const isLine=view==='population'||detail||index===sets.length;
      return isLine?`<span class="ex-key-line"><svg aria-hidden="true" viewBox="0 0 24 12"><line x1="0" x2="24" y1="6" y2="6" stroke="${color}" stroke-width="2.5" stroke-dasharray="${index===sets.length?'':lineDash(index)}"/></svg>${label}</span>`:`<span style="--key:${color}">${label}</span>`;
    }).join('');
    const values=rows.flatMap(r=>displayedSeries.map(s=>s[2](r)));let lo=Math.min(...values),hi=Math.max(...values);
    if(view==='balance')lo=Math.min(0,lo);
    const pad=(hi-lo)*.12||1;if(lo!==0)lo-=pad;hi+=pad;
    let axisTicks;
    if(view==='balance'||(view==='population'&&populationPercent)){
      const roughStep=(hi-lo)/5,power=10**Math.floor(Math.log10(roughStep));
      const step=([1,2,5,10].find(n=>n*power>=roughStep)||10)*power;
      lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;
      axisTicks=Array.from({length:Math.round((hi-lo)/step)+1},(_,i)=>lo+i*step);
    }else axisTicks=Array.from({length:5},(_,i)=>lo+(hi-lo)*i/4);
    if(view==='population'&&populationPercent){
      hi=100;
      axisTicks=axisTicks.filter(v=>v<=100);
      if(!axisTicks.includes(100))axisTicks.push(100);
    }
    // Eine SVG-Einheit entspricht einem CSS-Pixel: Schrift bleibt unverzerrt.
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    const right=chartWidth-20, bottom=chartHeight-64-eventSpace, top=47, plotWidth=right-leftMargin;
    const yearInset=12;
    const X=y=>leftMargin+yearInset+(y-FIRST)/(LAST-FIRST)*(plotWidth-2*yearInset),Y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
    markers.forEach(marker=>marker.x=X(marker.year));
    hoverGeometry={rows,sets,X,Y,top,bottom,formatValue:view==='population'&&populationPercent?percentFmt:fmt};clearValueHover();
    let out=`<text x="8" y="15" text-anchor="start" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):11}">${unit}</text>`;
    if(view==='population'){
      const actual=sets[0],model=sets[1];
      const actualEdge=linearPath(rows,actual,X,Y);
      const modelEdge=linearPath(rows,model,X,Y);
      const returnEdge=linearPath([...rows].reverse(),model,X,Y).replace(/^M/,'L');
      const redTop=Math.min(...rows.map(r=>Y(model[2](r))));
      const whiteTop=Math.min(...rows.map(r=>Y(actual[2](r))));
      const whiteBottom=Math.max(...rows.map(r=>Y(model[2](r))));
      out+=`<defs>
        <linearGradient id="population-red-fill" gradientUnits="userSpaceOnUse" x1="0" y1="${redTop}" x2="0" y2="${bottom}"><stop offset="0" stop-color="${c.death}" stop-opacity=".32"/><stop offset=".65" stop-color="${c.death}" stop-opacity=".13"/><stop offset="1" stop-color="${c.death}" stop-opacity=".025"/></linearGradient>
        <linearGradient id="population-white-fill" gradientUnits="userSpaceOnUse" x1="0" y1="${whiteTop}" x2="0" y2="${whiteBottom}"><stop offset="0" stop-color="#92f2bd" stop-opacity=".18"/><stop offset=".6" stop-color="#92f2bd" stop-opacity=".075"/><stop offset="1" stop-color="#92f2bd" stop-opacity=".025"/></linearGradient>
      </defs><g pointer-events="none"><path d="${modelEdge} L${X(LAST)} ${bottom} L${X(FIRST)} ${bottom} Z" fill="url(#population-red-fill)"/><path d="${actualEdge} ${returnEdge} Z" fill="url(#population-white-fill)"/>
      </g>`;
    }
    for(const v of axisTicks){const y=Y(v);out+=`<path d="M${leftMargin} ${y}H${right}" stroke="#30343b"/><text x="${leftMargin-11}" y="${y+4}" text-anchor="end" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):11}">${view==='population'&&populationPercent?percentFmt(v):v===0?'0':unit.startsWith('Index')?Math.round(v):compact(v)}</text>`;}
    if(variant==='2'){
      for(let y=FIRST;y<=LAST;y++){
        const major=y===FIRST||y===LAST||y%5===0;
        out+=`<line x1="${X(y)}" x2="${X(y)}" y1="${bottom+3}" y2="${bottom+(major?12:8)}" stroke="${major?'#a4adbd':'#667183'}" stroke-width="${major?1.5:1}"/>`;
      }
    }
    if(variant!=='3')for(const y of [FIRST,1995,2000,2005,2010,2015,2020,LAST])out+=`<text x="${X(y)}" y="${bottom+42}" text-anchor="middle" fill="#a4adbd" font-size="${variant==='2'?Math.round(a.FS.s*.85):12}">${y}</text>`;
    // Ereignisse liegen hinter den Daten; Balken und Linien haben Vorrang.
    if(variant==='2')for(const marker of markers){
      out+=`<g class="chart-event ${year===marker.year&&selectedEventYear===year?'selected':''}" data-eventyear="${marker.year}" role="button" tabindex="0" aria-label="Jahr auswählen: ${marker.year} · ${marker.label}"><rect x="${marker.x-Math.min(9,plotWidth/(LAST-FIRST)*.4)}" y="${top-18}" width="${Math.min(18,plotWidth/(LAST-FIRST)*.8)}" height="${bottom-top+18}" fill="transparent"/><text class="event-star" x="${marker.x}" y="${top-10}" text-anchor="middle">★</text><line x1="${marker.x}" x2="${marker.x}" y1="${top}" y2="${bottom}"/></g>`;
    }
    if(view==='balance'){
      out+=`<path d="M${leftMargin} ${Y(0)}H${right}" stroke="#7d879b"/>`;
      const slot=plotWidth/(LAST-FIRST+1),bw=slot*.38/(detail?sets.length:1);
      if(detail){
        sets.forEach((series,index)=>{
          const path=linearPath(rows,series,X,Y);
          out+=`<path class="ex-individual-line" stroke-dasharray="${lineDash(index)}" d="${path}" fill="none" stroke="${series[1]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
          out+=`<circle cx="${X(year)}" cy="${Y(series[2](d))}" r="4" fill="${series[1]}" stroke="#121212" stroke-width="2"/>`;
        });
      }else rows.forEach(r=>sets.forEach(s=>{const v=s[2](r),x=X(r.y)-bw/2;out+=`<rect class="ex-bar ${r.y===year?'bar-selected':''}" data-baryear="${r.y}" x="${x}" y="${Math.min(Y(0),Y(v))}" width="${bw-1}" height="${Math.max(1,Math.abs(Y(v)-Y(0)))}" fill="${s[1]}" opacity="${r.y===year?1:.62}"></rect>`;}));
      if(!detail){
        const path=linearPath(rows,overallBalance,X,Y);
        out+=`<path class="ex-balance-line" d="${path}" fill="none" stroke="${overallBalance[1]}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`;
      }
    }else{
      sets.forEach((s,index)=>{const path=linearPath(rows,s,X,Y);out+=`<path stroke-dasharray="${lineDash(index)}" d="${path}" fill="none" stroke="${s[1]}" stroke-width="2.5"/>`;
      });
    }
    if(selectedEventYear!==year)out+=`<path d="M${X(year)} ${top}V${bottom}" stroke="#eef2f6" stroke-dasharray="3 5" opacity=".5"/>`;
    if(view!=='balance')sets.forEach(s=>out+=`<circle cx="${X(year)}" cy="${Y(s[2](d))}" r="5" fill="${s[1]}" stroke="#121212" stroke-width="2"/>`);
    out+='<g id="ex-value-marker" pointer-events="none" aria-hidden="true"></g>';
    svg.innerHTML=out;
    const pinned=variant==='2'&&story?svg.querySelector('[data-eventyear="'+story+'"]'):null;
    if(pinned)showEventTooltip(pinned,true);else{tooltip.hidden=true;tooltip.classList.remove('expanded');}

  }
  return {render};
})();
