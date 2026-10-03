(function(){
'use strict';
var ov=null, img=null, cap=null, close=null, zoomIn=null, zoomOut=null, reset=null;
var scale=1, tx=0, ty=0, baseW=1, baseH=1, fitScale=1, dragging=false, sx=0, sy=0, stx=0, sty=0;
var pinch=null;
/* Центрирование: картинка в центре через flex+margin:auto; transform только для зума.
   В zoom-режиме: absolute left50/top50 + translate(-50%,-50%) -> центр в центре экрана. */
function apply(){
  /* transform-scale: стабильно центрируется и зумится, без «убегания» */
  img.style.transform='translate(-50%,-50%) translate('+tx+'px,'+ty+'px) scale('+scale+')';
}
function clampScale(s){
  /* зум в разумных пределах; при превышении нативного разреза допускаем лёгкую интерполяцию ради удобства */
  return Math.max(fitScale, Math.min(8, s));
}
var isSvg=false;
function fit(){
  img.style.position='absolute';
  img.style.left='50%'; img.style.top='50%';
  img.style.margin='0';
  img.style.width='auto'; img.style.height='auto';
  img.style.maxWidth=(ov.clientWidth-48)+'px';
  img.style.maxHeight=(ov.clientHeight-88)+'px';
  img.style.transformOrigin='center center';
  img.style.transform='none';
  void img.offsetWidth;
  var rw=img.getBoundingClientRect();
  baseW=(rw&&rw.width)||ov.clientWidth; baseH=(rw&&rw.height)||ov.clientHeight;
  if(baseW<=0)baseW=1; if(baseH<=0)baseH=1;
  fitScale=Math.min((ov.clientWidth-48)/baseW,(ov.clientHeight-88)/baseH,1);
  scale=fitScale; tx=0; ty=0;
  apply();
}
function zoomAt(f, cx, cy){
  var r=ov.getBoundingClientRect();
  var mx=cx-r.left-ov.clientWidth/2, my=cy-r.top-ov.clientHeight/2;
  if(scale<0.01) scale=fitScale||1;
  var ns=clampScale(scale*f);
  if(img.style.position!=='absolute'){
    /* страховка, если вдруг static — включить absolute заранее (без apply до пересчёта) */
    img.style.position='absolute';
    img.style.left='50%'; img.style.top='50%';
    img.style.margin='0';
    img.style.maxWidth='none'; img.style.maxHeight='none';
    img.style.transformOrigin='center center';
  }
  tx=mx-(mx-tx)*(ns/scale);
  ty=my-(my-ty)*(ns/scale);
  scale=ns; apply();
}
function openLb(src, title, mode){
if(!img||!ov) return;
isSvg = /\.svg(\?|#|$)/i.test(src);
baseW=0; baseH=0;
img.src=src;
scale=1; tx=0; ty=0;
img.style.transform='none';
function doFit(){ requestAnimationFrame(function(){ requestAnimationFrame(fit); }); }
/* fit гарантированно, не только по load */
if(img.complete) doFit();
img.addEventListener('load', doFit, {once:true});
setTimeout(doFit, 150);
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