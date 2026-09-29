/* lightbox.js — увеличение изображений с зумом (колесо/тач/кнопки) и панорамированием */
(function(){
  'use strict';
  var ov=null, img=null, cap=null, close=null, zoomIn=null, zoomOut=null, reset=null;
  var scale=1, tx=0, ty=0, baseW=1, baseH=1, fitScale=1, dragging=false, sx=0, sy=0, stx=0, sty=0;
  var pinch=null;

  function apply(){ img.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; }
  function clampScale(s){ return Math.max(fitScale, Math.min(20, s)); }
  function fit(){
    var w=ov.clientWidth-48, h=ov.clientHeight-88;
    if(w<=0||h<=0||!img.naturalWidth){ scale=fitScale=1; tx=0; ty=0; apply(); return; }
    fitScale=Math.min(w/img.naturalWidth, h/img.naturalHeight, 1);
    scale=fitScale;
    tx=(ov.clientWidth-img.naturalWidth*scale)/2;
    ty=(ov.clientHeight-img.naturalHeight*scale)/2;
    apply();
  }
  function zoomAt(f, cx, cy){
    var r=ov.getBoundingClientRect();
    var mx=cx-r.left, my=cy-r.top;
    var ns=clampScale(scale*f);
    // точка под курсором остаётся на месте
    tx=mx-(mx-tx)*(ns/scale);
    ty=my-(my-ty)*(ns/scale);
    scale=ns; apply();
  }
  function openLb(src, title){
    if(!img||!ov) return;
    img.src=src;
    scale=1; tx=0; ty=0;
    if(img.complete && img.naturalWidth) { fit(); }
    else { img.addEventListener('load', fit, {once:true}); }
    if(cap){ cap.textContent=title||''; cap.classList.add('on'); }
    ov.classList.add('on');
    if(close){ close.classList.add('on'); close.style.display='flex'; }
    if(zoomIn){ zoomIn.style.display='flex'; } if(zoomOut){ zoomOut.style.display='flex'; } if(reset){ reset.style.display='flex'; }
    document.body.style.overflow='hidden';
  }
  function resetView(){ scale=fitScale; tx=(ov.clientWidth-img.naturalWidth*scale)/2; ty=(ov.clientHeight-img.naturalHeight*scale)/2; apply(); }
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
    // stage wraps the image for events; ensure it exists
    if(!stage){
      stage=document.createElement('div'); stage.id='lbStage'; stage.className='lb-stage';
      ov.insertBefore(stage, img); stage.appendChild(img);
    }

    // wheel zoom (anchored at cursor)
    stage.addEventListener('wheel', function(e){
      e.preventDefault();
      var f=e.deltaY<0?1.2:1/1.2;
      zoomAt(f, e.clientX, e.clientY);
    }, {passive:false});

    // double-click: zoom in steps
    stage.addEventListener('dblclick', function(e){ zoomAt(2, e.clientX, e.clientY); });

    // drag pan
    stage.addEventListener('mousedown', function(e){ if(e.button!==0) return; dragging=true; sx=e.clientX; sy=e.clientY; stx=tx; sty=ty; stage.classList.add('lb-grabbing'); });
    window.addEventListener('mousemove', function(e){ if(!dragging) return; tx=stx+(e.clientX-sx); ty=sty+(e.clientY-sy); apply(); });
    window.addEventListener('mouseup', function(){ dragging=false; stage.classList.remove('lb-grabbing'); });

    // touch: pinch + pan
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

    // controls
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
      openLb(src, trig.getAttribute('data-lb-t')||'');
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