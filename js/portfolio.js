/* portfolio.js — фильтры и сортировка таблицы портфеля */
(function(){
  'use strict';
  /* фильтр по отрасли/статусу */
  var ind=document.getElementById('pf-filter-industry');
  var st=document.getElementById('pf-filter-status');
  function filterPortfolio(){
    if(!ind||!st) return;
    var i=ind.value, s=st.value;
    document.querySelectorAll('#portTable tbody tr').forEach(function(tr){
      var ok=(!i||tr.getAttribute('data-industry')===i)&&(!s||tr.getAttribute('data-status')===s);
      tr.style.display=ok?'':'none';
    });
    var rows=Array.prototype.slice.call(document.querySelectorAll('#portTable tbody tr')).filter(function(r){return r.style.display!=='none';});
    var note=document.querySelector('.port-count');
    if(note) note.textContent=rows.length;
  }
  if(ind&&st){ ind.addEventListener('change',filterPortfolio); st.addEventListener('change',filterPortfolio); }

  /* сортировка по клику на <th> */
  var table=document.getElementById('portTable');
  if(table){
    table.querySelectorAll('th').forEach(function(th){
      th.addEventListener('click', function(){
        var col=th.getAttribute('data-col'); if(!col) return;
        var tbody=table.querySelector('tbody');
        var rows=Array.prototype.slice.call(tbody ? tbody.rows : []);
        var dir=th.getAttribute('data-dir')==='asc'?'desc':'asc';
        th.setAttribute('data-dir',dir);
        var idx=Array.prototype.indexOf.call(th.parentNode.children, th);
        rows.sort(function(a,b){
          var va=(a.children[idx]?a.children[idx].textContent:'').trim();
          var vb=(b.children[idx]?b.children[idx].textContent:'').trim();
          var n1=parseFloat(va.replace(/[^\d.-]/g,''))||0, n2=parseFloat(vb.replace(/[^\d.-]/g,''))||0;
          var rr=(n1||n2)?n1-n2:va.localeCompare(vb,'ru');
          return dir==='asc'?rr:-rr;
        });
        rows.forEach(function(r){ tbody.appendChild(r); });
      });
    });
  }

  /* фильтр карточек кейсов по отраслям */
  window.filterCases=function(cf, btn){
    document.querySelectorAll('.cf-chip').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    document.querySelectorAll('.case2').forEach(function(card){
      var v=card.getAttribute('data-cf');
      card.style.display=(cf==='all'||v===cf)?'':'none';
    });
  };
})();