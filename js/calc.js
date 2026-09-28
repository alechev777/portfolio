/* calc.js — KPI-калькулятор экономики ИТ-услуг */
(function(){
  'use strict';
  function resetKpi(){
    ['k-cost','k-total','k-ex','k-year'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.textContent='0';
    });
    ['k-roi','k-roi2'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent='0%'; });
    ['k-pb','k-pb2'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent='—'; });
  }
  function calc(){
    var load=parseFloat(document.getElementById('k-load').value)||0;
    var fot=parseFloat(document.getElementById('k-fot').value)||0;
    var inf=parseFloat(document.getElementById('k-inf').value)||0;
    var save=parseFloat(document.getElementById('k-save').value)||0;
    var cost=(fot*load/100)+inf;
    if(cost===0){ resetKpi(); return; }
    var yearCost=cost*12;
    var yearSave=yearCost*save/100;
    var roi=yearCost>0&&yearSave>0 ? (yearSave/yearCost)*100 : 0;
    var pb=yearSave>0 ? (yearCost/yearSave)*12 : null;
    function r(v){ return Math.round(v).toLocaleString('ru-RU'); }
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('k-cost', r(cost)+' ₽/мес'); set('k-total', r(cost));
    set('k-year', r(yearSave)+' ₽/год'); set('k-ex', r(yearSave));
    set('k-roi', Math.round(roi)+'%'); set('k-roi2', Math.round(roi)+'%');
    set('k-pb', pb?pb.toFixed(1)+' мес.':'—'); set('k-pb2', pb?pb.toFixed(1)+' мес.':'—');
  }
  var inputs = document.querySelectorAll('[data-kpi]');
  if(inputs.length && document.getElementById('k-load')){
    inputs.forEach(function(inp){
      inp.addEventListener('input', function(){
        calc();
        if(window.MultiTrack) try{ window.MultiTrack('kpi_run'); }catch(e){}
      });
    });
    calc();
  }
})();