/* router.js — navigation, burger, hash-redirect, back-to-top, progress, analytics */
(function(){
  'use strict';
  var METRIKA = document.body.getAttribute('data-metrika') || 'XXXXXXXX';
  var PAGE = document.body.getAttribute('data-page') || '';

  /* ---- переключатель темы (тёмная/светлая) ---- */
  (function(){
    var btn=document.getElementById('themeToggle');
    if(!btn) return;
    var saved=null;
    try{ saved=localStorage.getItem('mt-theme'); }catch(e){}
    var html=document.documentElement;
    if(saved){ html.setAttribute('data-theme', saved); updateIcon(); }
    btn.addEventListener('click', function(){
      var cur=html.getAttribute('data-theme')==='dark';
      html.setAttribute('data-theme', cur?'light':'dark');
      updateIcon();
      try{ localStorage.setItem('mt-theme', cur?'light':'dark'); }catch(e){}
    });
    function updateIcon(){
      var ic=btn.querySelector('.th-ic');
      if(ic) ic.textContent = html.getAttribute('data-theme')==='dark' ? '☀️' : '🌙';
    }
  })();

  function track(goal){
    // Yandex.Metrika reachGoal; no-op with placeholder id
    try{
      if(window.ym){ window.ym(METRIKA, 'reachGoal', goal); }
    }catch(e){}
  }
  window.MultiTrack = track;

  /* ---- analytics: delegated clicks on [data-track] and case/artifact nav ---- */
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if(t){ track(t.getAttribute('data-track')); }
    var nav = e.target && e.target.closest ? e.target.closest('[data-nav]') : null;
    if(nav){
      var href = nav.getAttribute('href') || '';
      if(/case-/.test(href)) track('open_case');
      if(/artifact-/.test(href)) track('open_artifact');
      if(/contact\.html/.test(href)) track('click_contact');
    }
  });

  /* ---- hash redirect for legacy #wN / #aN deep links ---- */
  (function(){
    var h = location.hash.replace('#','').trim();
    if(!h) return;
    var map = {
      'atlas':'atlas.html'
    };
    var m = /^w(\d+)$/.exec(h); if(m){ map[h]='case-w'+m[1]+'.html'; }
    m = /^a(\d+)$/.exec(h); if(m){ map[h]='artifact-a'+m[1]+'.html'; }
    var simple = {home:'index.html',cases:'cases.html',artifacts:'artifacts.html',
      archive:'archive.html',portfolio:'portfolio.html',timeline:'timeline.html',
      roadmap:'timeline.html',stack:'stack.html',contact:'contact.html',kpi:'kpi.html'};
    if(!map[h] && simple[h]) map[h]=simple[h];
    if(map[h]){ try{ location.replace(map[h]); }catch(err){} return; }
  })();

  /* ---- burger menu + focus handling ---- */
  var burger = document.getElementById('burgerBtn');
  var menu = document.getElementById('menu');
  function setMenu(open){
    if(!menu||!burger) return;
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if(open){ var first=menu.querySelector('a'); if(first) first.focus(); }
  }
  if(burger) burger.addEventListener('click', function(){
    setMenu(!menu.classList.contains('open'));
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      if(menu && menu.classList.contains('open')){ setMenu(false); return; }
    }
  });
  document.addEventListener('click', function(e){
    if(menu && menu.classList.contains('open') && !menu.contains(e.target) && !(burger && burger.contains(e.target))){
      setMenu(false);
    }
  });

  /* ---- back-to-top ---- */
  var toTop = document.getElementById('toTop');
  if(toTop){
    toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
    window.addEventListener('scroll', function(){
      var show = window.scrollY > 600;
      toTop.hidden = !show;
    }, {passive:true});
  }

  /* ---- reading progress on long (case) pages ---- */
  var prog = document.getElementById('progressBar');
  if(prog){
    function updateProg(){
      var st = document.documentElement.scrollTop || document.body.scrollTop;
      var sh = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
      prog.style.width = (st/sh*100) + '%';
    }
    window.addEventListener('scroll', updateProg, {passive:true});
    window.addEventListener('resize', updateProg);
    updateProg();
  }

  /* ---- timeline "Показать все этапы" ---- */
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest ? e.target.closest('[data-action="tl-show"]') : null;
    if(!b) return;
    var full = document.getElementById('tlFull');
    if(full){
      var show = full.style.display !== 'grid';
      full.style.display = show ? 'grid' : 'none';
      b.style.display = show ? 'none' : '';
      b.setAttribute('aria-expanded', String(show));
    }
  });

  /* ---- "Нажимаемые" не-анкоры (career-row, tlm, tr rows) с data-href ---- */
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ') return;
    var t = e.target;
    var nav = t.closest && t.closest('[data-href]');
    if(nav){ e.preventDefault(); location.href = nav.getAttribute('data-href'); }
  });
  document.addEventListener('click', function(e){
    var nav = e.target && e.target.closest ? e.target.closest('[data-href]') : null;
    if(nav){ e.preventDefault(); location.href = nav.getAttribute('data-href'); }
  });

  /* ---- KPI-mini preview (Tier1 artifact card / home) ---- */
  function r(v){ return Math.round(v).toLocaleString('ru-RU'); }
  function initKpiPreview(){
    var t2=document.getElementById('k-total2'), r2=document.getElementById('k-roi2b'),
        e2=document.getElementById('k-ex2'), p2=document.getElementById('k-pb2b');
    if(!t2||!r2||!e2||!p2) return;
    var load=25, fot=1200000, inf=300000, save=20;
    var cost=(fot*load/100)+inf;
    var ysave=cost*12*save/100;
    var roi=(ysave/(cost*12))*100;
    var pb = cost>0 ? cost/(cost*save/100) : 0;
    t2.textContent=r(cost)+' ₽'; r2.textContent=Math.round(roi)+'%';
    e2.textContent=r(ysave)+' ₽'; p2.textContent=Math.round(pb)+' мес.';
    track('kpi_run_preview');
  }

  /* ---- industry icons on detail heroes ---- */
  var INDUSTRY_ICONS={w7:'🏛️',w1:'⛏️',w2:'✈️',w8:'🧭',w4:'🏦',w5:'📦',w3:'💡',w6:'🍽️',w9:'💎',w10:'💳',w11:'💍',w12:'📦',w13:'🛠️',w14:'⚙️',w15:'🎖️',a1:'📊',a2:'📋',a3:'🔗',a4:'🗺️',a5:'🤖',a6:'📋',a7:'🛠️',a8:'🧭',a9:'📈',a10:'⚖️',a11:'📊',a12:'🎫',a13:'📐',a14:'📊',a15:'🎯',kpi:'🧮'};

  /* ---- Zoomable BPMN (#p-a4 equivalent) ---- */
  (function(){
    var stage=document.getElementById('zStage'), img=document.getElementById('zImg');
    if(!stage||!img) return;
    var s=1, tx=0, ty=0, drag=false, sx=0, sy=0, stx=0, sty=0;
    function apply(){ img.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')'; }
    function fit(){
      var sw=stage.clientWidth, sh=stage.clientHeight;
      var nw=img.naturalWidth||1600, nh=img.naturalHeight||900;
      s=Math.min(sw/nw, sh/nh, 1);
      tx=(sw-nw*s)/2; ty=(sh-nh*s)/2; apply();
    }
    img.addEventListener('load', fit); if(img.complete) fit();
    window.addEventListener('resize', fit);
    var zIn=document.getElementById('zIn'), zOut=document.getElementById('zOut'), zReset=document.getElementById('zReset');
    if(zIn) zIn.onclick=function(){ s=Math.min(4,s*1.2); apply(); };
    if(zOut) zOut.onclick=function(){ s=Math.max(.2,s/1.2); apply(); };
    if(zReset) zReset.onclick=fit;
    stage.addEventListener('wheel', function(e){
      e.preventDefault();
      var r=stage.getBoundingClientRect();
      var mx=e.clientX-r.left, my=e.clientY-r.top;
      var f=e.deltaY<0?1.15:1/1.15;
      var ns=Math.min(4, Math.max(.2, s*f));
      tx=mx-(mx-tx)*(ns/s); ty=my-(my-ty)*(ns/s); s=ns; apply();
    },{passive:false});
    stage.addEventListener('mousedown', function(e){ drag=true; sx=e.clientX; sy=e.clientY; stx=tx; sty=ty; stage.classList.add('grabbing'); });
    window.addEventListener('mousemove', function(e){ if(!drag)return; tx=stx+(e.clientX-sx); ty=sty+(e.clientY-sy); apply(); });
    window.addEventListener('mouseup', function(){ drag=false; stage.classList.remove('grabbing'); });
    var pt=null;
    stage.addEventListener('touchstart', function(e){ if(e.touches.length===1) pt={x:e.touches[0].clientX,y:e.touches[0].clientY,tx:tx,ty:ty}; },{passive:true});
    stage.addEventListener('touchmove', function(e){ if(!pt||e.touches.length!==1)return; e.preventDefault(); tx=pt.tx+(e.touches[0].clientX-pt.x); ty=pt.ty+(e.touches[0].clientY-pt.y); apply(); },{passive:false});
  })();

  document.addEventListener('DOMContentLoaded', initKpiPreview);

/* ---- печать резюме (PDF) ---- */
document.addEventListener("click", function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-action="resume-print"]'):null;
  if(b){ if(typeof window.print==="function") window.print(); }
});
})();