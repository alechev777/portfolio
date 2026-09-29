/* portfolio.js — фильтры таблицы портфеля, сортировка, фильтр кейсов и эффекта */
(function(){
  'use strict';

  var ind = document.getElementById('pf-filter-industry');
  var st = document.getElementById('pf-filter-status');

  function filterPortfolio(){
    if(!ind || !st) return;
    var i = ind.value, s = st.value;
    var rows = document.querySelectorAll('#portTable tbody tr');
    var shown = 0;
    for(var k=0;k<rows.length;k++){
      var tr = rows[k];
      var ok = (!i || tr.getAttribute('data-industry')===i) && (!s || tr.getAttribute('data-status')===s);
      tr.style.display = ok ? '' : 'none';
      if(ok) shown++;
    }
    var note = document.querySelector('.port-count');
    if(note) note.textContent = String(shown);
  }
  if(ind && st){
    ind.addEventListener('change', filterPortfolio);
    st.addEventListener('change', filterPortfolio);
  }

  /* сортировка таблицы по клику на <th> */
  var table = document.getElementById('portTable');
  if(table){
    var headers = table.querySelectorAll('th');
    for(var hi=0; hi<headers.length; hi++){
      headers[hi].addEventListener('click', function(){
        var th = this;
        var col = th.getAttribute('data-col');
        if(!col) return;
        var tbody = table.querySelector('tbody');
        var rowArr = Array.prototype.slice.call(tbody.rows);
        var dir = th.getAttribute('data-dir')==='asc' ? 'desc' : 'asc';
        th.setAttribute('data-dir', dir);
        var idx = Array.prototype.indexOf.call(th.parentNode.children, th);
        rowArr.sort(function(a,b){
          var va=(a.children[idx]?a.children[idx].textContent:'').trim();
          var vb=(b.children[idx]?b.children[idx].textContent:'').trim();
          var n1=parseFloat(va.replace(/[^\d.\-]/g,''))||0;
          var n2=parseFloat(vb.replace(/[^\d.\-]/g,''))||0;
          var r=(n1||n2) ? n1-n2 : va.localeCompare(vb,'ru');
          return dir==='asc' ? r : -r;
        });
        for(var k=0;k<rowArr.length;k++) tbody.appendChild(rowArr[k]);
      });
    }
  }

  /* фильтр карточек кейсов по отраслям */
  window.filterCases = function(cf, btn){
    var chips = document.querySelectorAll('.cf-chip');
    for(var k=0;k<chips.length;k++) chips[k].classList.remove('active');
    if(btn) btn.classList.add('active');
    var cards = document.querySelectorAll('.case2');
    for(var j=0;j<cards.length;j++){
      var v = cards[j].getAttribute('data-cf');
      cards[j].style.display = (cf==='all' || v===cf) ? '' : 'none';
    }
  };

  /* фильтр по типу эффекта (cases) */
  var eff = 'all', effChips = document.querySelectorAll('.eff-chip');
  function effMatch(kw, text){
    if(kw==='all') return true;
    if(kw==='money') return /млн ₽|₽\/год|млн ₽|дешевле|экономия|эффект/.test(text);
    if(kw==='roi') return /ROI/.test(text);
    if(kw==='ops') return /OPEX|бэк-офис|SLA|поддержк/.test(text);
    if(kw==='nps') return /NPS|CSAT|feedback|обращений/.test(text);
    return true;
  }
  function applyEff(){
    var cards = document.querySelectorAll('.case2');
    for(var k=0;k<cards.length;k++){
      cards[k].style.display = effMatch(eff, cards[k].textContent) ? '' : 'none';
    }
  }
  for(var ei=0; ei<effChips.length; ei++){
    effChips[ei].addEventListener('click', function(){
      for(var k=0;k<effChips.length;k++){ effChips[k].classList.remove('active'); effChips[k].setAttribute('aria-pressed','false'); }
      this.classList.add('active'); this.setAttribute('aria-pressed','true');
      eff = this.getAttribute('data-eff');
      applyEff();
    });
  }
})();