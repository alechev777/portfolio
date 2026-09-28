/* lightbox.js — увеличение изображений по клику */
(function(){
  'use strict';
  function openLb(src, title){
    var img=document.getElementById('lbImg'), ov=document.getElementById('lbOverlay'),
        cap=document.getElementById('lbCap'), close=document.getElementById('lbClose');
    if(!img||!ov) return;
    img.src=src;
    if(cap){ cap.textContent=title||''; cap.classList.add('on'); }
    ov.classList.add('on');
    if(close){ close.classList.add('on'); close.style.display='flex'; }
    document.body.style.overflow='hidden';
  }
  function closeLb(){
    var ov=document.getElementById('lbOverlay'), close=document.getElementById('lbClose'), cap=document.getElementById('lbCap');
    if(ov) ov.classList.remove('on');
    if(close){ close.classList.remove('on'); close.style.display='none'; }
    if(cap) cap.classList.remove('on');
    document.body.style.overflow='';
  }
  window.MultiLightbox={open:openLb, close:closeLb};

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
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLb(); });
})();