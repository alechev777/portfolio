(function(){
'use strict';
var ov=null, img=null, cap=null, close=null, zoomIn=null, zoomOut=null, reset=null;
var scale=1, tx=0, ty=0, baseW=1, baseH=1, fitScale=1, dragging=false, sx=0, sy=0, stx=0, sty=0;
var pinch=null;
var cur=null, svgHost=null;
/* Центрирование: картинка в центре через flex+margin:auto; transform только для зума. */
function apply(){
  var el=cur||img;
  if(!el) return;
  el.style.transform='translate(-50%,-50%) translate('+tx+'px,'+ty+'px) scale('+scale+')';
}
function clampScale(s){
  return Math.max(fitScale, Math.min(8, s));
}
var isSvg=false;
function fit(){
  var el=cur||img;
  if(!el) return;
  if(cur===svgHost){
    /* SVG: нативный размер уже вписан CSS (max-width/height). Не уменьшаем JS-масштабом. */
    el.style.position='absolute';
    el.style.left='50%'; el.style.top='50%';
    el.style.margin='0';
    el.style.maxWidth=(ov.clientWidth-24)+'px';
    el.style.maxHeight=(ov.clientHeight-80)+'px';
    el.style.transformOrigin='center center';
    el.style.transform='none';
    void el.offsetWidth;
    var rw2=el.getBoundingClientRect();
    baseW=(rw2&&rw2.width)||1; baseH=(rw2&&rw2.height)||1;
    fitScale=1; scale=1; tx=0; ty=0;
    apply();
    return;
  }
  el.style.position='absolute';
  el.style.left='50%'; el.style.top='50%';
  el.style.margin='0';
  el.style.width='auto'; el.style.height='auto';
  el.style.maxWidth=(ov.clientWidth-48)+'px';
  el.style.maxHeight=(ov.clientHeight-88)+'px';
  el.style.transformOrigin='center center';
  el.style.transform='none';
  void el.offsetWidth;
  var rw=el.getBoundingClientRect();
  baseW=(rw&&rw.width)||ov.clientWidth; baseH=(rw&&rw.height)||ov.clientHeight;
  if(baseW<=0)baseW=1; if(baseH<=0)baseH=1;
  fitScale=Math.min((ov.clientWidth-48)/baseW,(ov.clientHeight-88)/baseH,1);
  scale=fitScale; tx=0; ty=0;
  apply();
}
function zoomAt(f, cx, cy){
  var el=cur||img;
  var r=ov.getBoundingClientRect();
  var mx=cx-r.left-ov.clientWidth/2, my=cy-r.top-ov.clientHeight/2;
  if(scale<0.01) scale=fitScale||1;
  var ns=clampScale(scale*f);
  if(el.style.position!=='absolute'){
    el.style.position='absolute';
    el.style.left='50%'; el.style.top='50%';
    el.style.margin='0';
    el.style.maxWidth='none'; el.style.maxHeight='none';
    el.style.transformOrigin='center center';
  }
  tx=mx-(mx-tx)*(ns/scale);
  ty=my-(my-ty)*(ns/scale);
  scale=ns; apply();
}
/* --- SVG: рендер как инлайн-вектор (чёткость при любом зуме, центровка flex) --- */
function loadSvgInline(src, mode){
  if(typeof fetch==='undefined'){ img.src=src; return; }
  fetch(src).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(function(svgTxt){
    var stage=img.parentElement;
    if(svgHost){ svgHost.parentNode&&svgHost.parentNode.removeChild(svgHost); svgHost=null; }
    var wrap=document.createElement('div');
    wrap.id='lbSvgHost';
    wrap.innerHTML=svgTxt;
    var sv=wrap.querySelector('svg');
    if(!sv) throw 0;
    /* задать нативные размеры из viewBox, чтобы svg имел реальную геометрию */
    var vb=(sv.getAttribute('viewBox')||'').split(/[\s,]+/);
    if(vb.length===4){ sv.setAttribute('width',vb[2]); sv.setAttribute('height',vb[3]); }
    if(mode!=='natural'){ sv.setAttribute('preserveAspectRatio','xMidYMid meet'); }
    /* уникализируем id градиентов/фильтров внутри SVG */
    sv.querySelectorAll('[id]').forEach(function(n){ n.id += '__lb'; });
    stage.appendChild(wrap);
    svgHost=wrap; cur=wrap;
    img.style.display='none';
    requestAnimationFrame(function(){ requestAnimationFrame(fit); });
  }).catch(function(){ img.type=''; img.src=src; cur=img; });
}
function openLb(src, title, mode){
if(!img||!ov) return;
isSvg = /\.svg(\?|#|$)/i.test(src);
baseW=0; baseH=0;
cur=img; svgHost=null;
/* убрать старый инлайн-SVG */
var stage=img.parentElement;
var old=document.getElementById('lbSvgHost'); if(old&&old.parentNode) old.parentNode.removeChild(old);
img.style.display=''; img.style.width='auto'; img.style.height='auto'; img.src=src;
img.removeAttribute('src'); img.src=src;
scale=1; tx=0; ty=0; img.style.transform='none';
function doFit(){ requestAnimationFrame(function(){ requestAnimationFrame(fit); }); }
if(img.complete) doFit();
img.addEventListener('load', doFit, {once:true});
setTimeout(doFit, 150);
if(isSvg) loadSvgInline(src, mode);
if(cap){ cap.textContent=title||''; cap.classList.add('on'); }
ov.classList.add('on');
if(close){ close.classList.add('on'); close.style.display='flex'; }
if(zoomIn){ zoomIn.style.display='flex'; } if(zoomOut){ zoomOut.style.display='flex'; } if(reset){ reset.style.display='flex'; }
document.body.style.overflow='hidden';
}
function resetView(){ fit(); }
function closeLb(){
if(ov) ov.classList.remove('on');
if(close){ close.classList.remove('on'); close.style.display='none'; }
if(zoomIn){ zoomIn.style.display='none'; } if(zoomOut){ zoomOut.style.display='none'; } if(reset){ reset.style.display='none'; }
if(cap) cap.classList.remove('on');
document.body.style.overflow='';
}
window.MultiLightbox={open:openLb, close:closeLb};
function init(){
ov=document.getElementById('lbOverlay');
img=document.getElementById('lbImg');
cap=document.getElementById('lbCap');
close=document.getElementById('lbClose');
var stage=document.getElementById('lbStage');
if(!ov||!img) return;
if(!stage){
stage=document.createElement('div'); stage.id='lbStage'; stage.className='lb-stage';
ov.insertBefore(stage, img); stage.appendChild(img);
}
stage.addEventListener('wheel', function(e){
e.preventDefault();
var f=e.deltaY<0?1.2:1/1.2;
zoomAt(f, e.clientX, e.clientY);
}, {passive:false});
/* колесо работает по всему лайтбоксу, а не только над картинкой */
ov.addEventListener('wheel', function(e){
e.preventDefault();
var f=e.deltaY<0?1.2:1/1.2;
zoomAt(f, e.clientX, e.clientY);
}, {passive:false});
stage.addEventListener('dblclick', function(e){ zoomAt(2, e.clientX, e.clientY); });
stage.addEventListener('mousedown', function(e){ if(e.button!==0) return; dragging=true; sx=e.clientX; sy=e.clientY; stx=tx; sty=ty; stage.classList.add('lb-grabbing'); });
window.addEventListener('mousemove', function(e){ if(!dragging) return; tx=stx+(e.clientX-sx); ty=sty+(e.clientY-sy); apply(); });
window.addEventListener('mouseup', function(){ dragging=false; stage.classList.remove('lb-grabbing'); });
stage.addEventListener('touchstart', function(e){
if(e.touches.length===1){ pinch={d:1,mx:e.touches[0].clientX,my:e.touches[0].clientY,tx:tx,ty:ty}; }
else if(e.touches.length===2){
var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
pinch={d:d, scale:scale, cx:(e.touches[0].clientX+e.touches[1].clientX)/2, cy:(e.touches[0].clientY+e.touches[1].clientY)/2};
}
}, {passive:true});
stage.addEventListener('touchmove', function(e){
e.preventDefault();
if(e.touches.length===2 && pinch && pinch.scale){
var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
var f=d/pinch.d;
zoomAt(f, pinch.cx, pinch.cy);
} else if(e.touches.length===1 && pinch && pinch.d===1){
tx=pinch.tx+(e.touches[0].clientX-pinch.mx);
ty=pinch.ty+(e.touches[0].clientY-pinch.my);
apply();
}
}, {passive:false});
stage.addEventListener('touchend', function(){ pinch=null; });
zoomIn=document.getElementById('lbZoomIn');
zoomOut=document.getElementById('lbZoomOut');
reset=document.getElementById('lbReset');
if(zoomIn) zoomIn.addEventListener('click', function(ev){ ev.stopPropagation(); zoomAt(1.35, ov.clientWidth/2, ov.clientHeight/2); });
if(zoomOut) zoomOut.addEventListener('click', function(ev){ ev.stopPropagation(); zoomAt(1/1.35, ov.clientWidth/2, ov.clientHeight/2); });
if(reset) reset.addEventListener('click', function(ev){ ev.stopPropagation(); resetView(); });
/* явное и надёжное закрытие с первого клика (стоп-пропагация) */
if(close){ close.addEventListener('click', function(ev){ ev.preventDefault(); ev.stopPropagation(); closeLb(); }); }
if(ov){ ov.addEventListener('click', function(ev){ if(ev.target===ov){ closeLb(); } }); }
window.addEventListener('resize', function(){ if(ov&&ov.classList.contains('on')) fit(); });
}
document.addEventListener('DOMContentLoaded', init);
if(document.readyState!=='loading') init();
document.addEventListener('click', function(e){
var t=e.target;
var trig = t.closest? t.closest('.lb-trigger') : null;
if(trig){ e.preventDefault();
var src=trig.getAttribute('data-lb')|| (trig.querySelector('img')||{}).src;
openLb(src, trig.getAttribute('data-lb-t')||'', trig.getAttribute('data-lb-mode')||'');
return;
}
if(t.tagName==='IMG'){
var inCard=t.closest && (t.closest('.case2')||t.closest('.art2')||t.closest('.art-feat')||t.closest('.tlm'));
if(inCard){ e.preventDefault(); e.stopPropagation();
var cap=(inCard.querySelector('b')||{}).textContent||'';
openLb(t.src, cap); return;
}
}
});
document.addEventListener('click', function(e){
if(e.target.id==='lbOverlay'||e.target.id==='lbClose') closeLb();
});
document.addEventListener('keydown', function(e){
if(e.key==='Escape') closeLb();
if(e.key==='+'||e.key==='=') { if(ov&&ov.classList.contains('on')) zoomAt(1.3, ov.clientWidth/2, ov.clientHeight/2); }
if(e.key==='-') { if(ov&&ov.classList.contains('on')) zoomAt(1/1.3, ov.clientWidth/2, ov.clientHeight/2); }
});
})();