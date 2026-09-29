(function(){
'use strict';
var ro=new IntersectionObserver(function(entries){
entries.forEach(function(e){
if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); }
});
},{threshold:.08});
document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ ro.observe(el); });
})();