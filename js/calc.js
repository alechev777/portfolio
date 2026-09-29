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
var pb=yearSave>0 ? (cost/(yearSave/12)) : null;
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
(function(){
var INP=['k-staff','k-salary','k-inc','k-incsave','k-downtime','k-dowhour'];
function num(id){return parseFloat(document.getElementById(id).value)||0;}
function money(v){return Math.round(v).toLocaleString('ru-RU')+' ₽';}
function compute(){
var staff=num('k-staff'), sal=num('k-salary'), inc=num('k-inc'), incsave=num('k-incsave'), dt=num('k-downtime'), dwh=num('k-dowhour');
var fotYear=staff*sal*12;
var fotSave=fotYear*incsave/100;
var dowCost=(dt*4)*dwh;
var dowSave=dowCost*incsave/100;
function set(id,v){var el=document.getElementById(id); if(el) el.textContent=v;}
set('k-fotyear', money(fotYear));
set('k-fotsave', money(fotSave));
set('k-dowcost', money(dowCost));
set('k-dowsave', money(dowSave));
drawChart(fotYear, fotSave, dowCost, dowSave);
}
function drawChart(fot,fs,dc,ds){
var svg=document.getElementById('kpiChartSvg'); if(!svg) return;
var W=420,H=180,pad=36, bars=[['ФОТ',fot,'#1d6fe0'],['Экономия',fs,'#0e9bbf'],['Простои',dc,'#c9711f'],['Выгода от простоев',ds,'#1f7a52']];
var max=Math.max(fot,fs,dc,ds,1);
var bw=76, gap=(W-pad*2-bw*4)/3, x0=pad, base=H-34;
var out='';
bars.forEach(function(b,i){ var h=(b[1]/max)*(H-pad*2-20); if(h<2) h=2;
var x=x0+i*(bw+gap);
out+='<rect x="'+x+'" y="'+(base-h)+'" width="'+bw+'" height="'+h+'" rx="6" fill="'+b[2]+'"/>';
out+='<text x="'+(x+bw/2)+'" y="'+(base-h-6)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">'+money(b[1])+'</text>';
out+='<text x="'+(x+bw/2)+'" y="'+(base+16)+'" text-anchor="middle" font-size="10" fill="#6b7a91" font-family="Inter,system-ui,sans-serif">'+b[0]+'</text>';
});
out+='<line x1="'+pad+'" y1="'+base+'" x2="'+pad+(bw*4+gap*3)+'" y2="'+base+'" stroke="#cbd5e1" stroke-width="1.2"/>';
svg.innerHTML=out;
}
INP.forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('input', compute); });
if(INP.some(function(id){return document.getElementById(id);})) compute();
})();
})();
document.addEventListener('submit', function(e){
var f=e.target; if(!f || f.id!=='cf') return;
e.preventDefault();
var status=document.getElementById('cf-status'); if(!status) return;
var name=document.getElementById('cf-name').value.trim();
var email=document.getElementById('cf-email').value.trim();
var msg=document.getElementById('cf-msg').value.trim();
if(!name||!email||!msg){ status.textContent='Заполните все поля.'; status.hidden=false; status.style.color='#c03a3a'; return; }
var endpoint=f.getAttribute('data-cf-endpoint')||'';
status.hidden=true;
if(/XXXXXXX/.test(endpoint)){
var subject=encodeURIComponent('Запрос из портфолио: '+name);
var body=encodeURIComponent('Имя: '+name+'\nEmail: '+email+'\n\nЗадача:\n'+msg);
window.location.href='mailto:chev.alex@mail.ru?subject='+subject+'&body='+body;
status.textContent='Почтовый клиент открыт. Если нет — напишите в Telegram или на почту.';
status.hidden=false; status.style.color='#1f7a52';
return;
}
fetch(endpoint,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,message:msg})})
.then(function(r){ if(!r.ok) throw new Error('bad'); status.textContent='Отправлено! Свяжусь в течение 48 часов.'; status.hidden=false; status.style.color='#1f7a52'; f.reset(); })
.catch(function(){ window.location.href='mailto:chev.alex@mail.ru?subject='+encodeURIComponent('Запрос из портфолио: '+name)+'&body='+encodeURIComponent('Имя: '+name+'\nEmail: '+email+'\n\nЗадача:\n'+msg); });
});
document.addEventListener("click", function(e){
var t=e.target && e.target.closest ? e.target.closest('[data-action="kpi-export"]') : null;
if(t){ if(typeof window.print==="function") window.print(); }
});