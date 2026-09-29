const fs = require('fs');
const path = require('path');

// ---------- CONFIG ----------
const SRC = process.argv[2];              // source HTML
const OUT = process.argv[3];              // output site root
const WORK = path.join(__dirname, '.build');
const DOMAIN = 'https://alechev777.github.io/portfolio';  // GitHub Pages project site
const METRIKA = 'XXXXXXXX';               // PLACEHOLDER Yandex Metrika counter id
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='#1d6fe0'/><text x='50' y='66' font-size='52' font-weight='900' fill='white' text-anchor='middle' font-family='sans-serif'>ЧА</text></svg>");
const FONT_PRELOAD = 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2';

// id -> file
const fileOf = {
  home:'index.html', cases:'cases.html', artifacts:'artifacts.html',
  portfolio:'portfolio.html', timeline:'timeline.html', roadmap:'timeline.html',
  stack:'stack.html', contact:'contact.html',
  archive:'archive.html', kpi:'kpi.html'
};
for (let i=1;i<=17;i++) fileOf['w'+i] = `case-w${i}.html`;
for (let i=1;i<=15;i++) fileOf['a'+i] = `artifact-a${i}.html`;
fileOf['a8'] = 'artifact-a8.html';

const pageKind = id => id==='home'?'home' : id[0]==='w'?'case' : id[0]==='a'?'artifact' : 'page';

// Titles per page (for <title>/description)
function titleOf(id, h1){
  const map={
    home:'Портфолио · Чевтаев Александр · Директор по цифровой трансформации',
    cases:'Кейсы и работы · Александр Чевтаев',
    artifacts:'Артефакты · Александр Чевтаев',
    archive:'Библиотека документов · Александр Чевтаев',
    portfolio:'Портфель проектов · Александр Чевтаев',
    timeline:'Весь путь: 15 лет в ИТ · Александр Чевтаев',
    stack:'Навыки и стек · Александр Чевтаев',
    contact:'Контакты · Александр Чевтаев',
    kpi:'Калькулятор экономики ИТ-услуг · Александр Чевтаев'
  };
  if(map[id]) return map[id];
  if(id[0]==='w'){ const name=(h1||'вакансия').split(/:/)[0].trim(); return `Кейс: ${name} · Чевтаев Александр`; }
  if(id[0]==='a') return `Артефакт: ${h1||'документ'} · Чевтаев Александр`;
  return (h1?h1+' · ':'')+'Александр Чевтаев';
}
function descOf(id, h1, pageText){
  const map={
    home:'Чевтаев Александр — директор по цифровой трансформации. 15 лет в ИТ, 11 компаний, 8 отраслей. Эффект 250–400 млн ₽/год по одному проекту, окупаемость от 4 месяцев.',
    cases:'Кейсы и работы Александра Чевтаева: результаты в цифрах — эффект 250–400 млн ₽/год по проекту, окупаемость от 4 месяцев.',
    artifacts:'Каталог артефактов Александра Чевтаева: KPI-модели, регламенты, ТЗ на ИИ, аналитика обращений. Живые продукты и рабочие документы.',
    archive:'Библиотека документов и схем: регламенты, модели, памятки из проектов цифровой трансформации.',
    portfolio:'Портфель проектов Александра Чевтаева: 17 кейсов и проектов с измеримым эффектом и источниками цифр.',
    timeline:'Весь путь Александра Чевтаева: 15 лет в ИТ — от 1С до стратегии ИИ, 11 компаний, 8 отраслей.',
    stack:'Навыки и стек директора по цифровой трансформации: стратегия и архитектура, экономика ИТ, технологии.',
    contact:'Контакты Александра Чевтаева: Telegram @Alechev, chev.alex@mail.ru, +7 915 023-43-24. Обсудим задачу с расчётом ROI.',
    kpi:'KPI-калькулятор экономики ИТ-услуг: стоимость услуги, аллокация затрат, окупаемость и ROI. Логика модели Казахмыс.',
    a8:'ИИ-атлас бэк-офиса: 21 ассистент, 76 use-кейсов, 16 домов. Интерактивная карта автоматизации ИИ.'
  };
  if(map[id]) return map[id];
  const CASEDESC={
    w1:'Кейс «Казахмыс»: целевая ИТ-архитектура и KPI-модель услуг. Сценарии эффекта 120/250/400 млн ₽ в год, окупаемость до 6 месяцев.',
    w2:'Кейс «Аэроклуб»: AI-виджет автоклассификации в Jira. 76,9% обращений решаются без оператора, −40% стоимости, окупаемость 4 месяца.',
    w3:'Кейс «Arlight»: поддержка клиентов с AI-NLP в 3 раза дешевле аутсорса, CSAT +20%.',
    w4:'Кейс «ББР-банк»: ITSM и ITAM под 716-П/787-П ЦБ, ROI 300% в первый год, экономия 10+ млн ₽/год.',
    w5:'Кейс «М-Групп»: ИТ-департамент с нуля, аналитика 9 800+ обращений в год, −18 млн ₽/год ФОТ.',
    w6:'Кейс «ПроСервис»: портфель 16 цифровых инициатив, 4 пилота, 10+ вендоров.',
    w7:'Кейс «ГосТех ↔ МинЦифры»: 4 регламента уровня Минцифры, SLA 5 минут, 11 ролей процесса.',
    w8:'Кейс «R-Vision»: перезапуск бэк-офиса за 2 месяца, ИИ-атлас (21 ассистент, 76 use-кейсов).',
    w9:'Кейс «АЛРОСА»: управление техподдержкой холдинга, 100+ специалистов, NPS 7,46→8,76, SLA 90%+.',
    w10:'Кейс «ПСБ-ФИНАНС»: директор департамента эксплуатации ИС. −47% обращений, −42% OPEX, +71% скорость решения.',
    w11:'Кейс «SUNLIGHT»: поддержка 260 торговых точек, 42 специалиста, SLA/OLA/UC.',
    w12:'Кейс «MERLION»: KPI-модель ИТ-блока (~700 человек), аллокация по методу ФСА, SLA «Ситилинк».',
    w13:'Кейс «Дельта»: отдел разработки и сопровождения ИС, команда 25 человек, ITSM.',
    w14:'Кейс «Инженер-Центр»: программист 1С, перенос 32 баз 1С 7.7→8.2 без потерь.',
    w15:'Этап «Вооружённые силы РФ»: командир отделения, управление до 15 человек.',
    w16:'Кейс «Сбер R&D»: модель управления инновациями и портфелем НИОКР, 12+ R&D-инициатив.',
    w17:'Кейс «SRG»: Service Office Operations с нуля — SLA, роли, автоматизация.'
  };
  if(CASEDESC[id]) return CASEDESC[id];
  if(id[0]==='a'){
    const name=(h1||'документ').replace(/\s+/g,' ').slice(0,60);
    return `Артефакт: ${name} — рабочий документ/модель Александра Чевтаева из реальных проектов цифровой трансформации.`;
  }
  const t=(pageText||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  return t ? t.slice(0,160) : titleOf(id,'').replace(/ ·.*/,'');
}
function breadcrumbOf(id, h1, kind){
  const main={home:'Главная',cases:'Кейсы',artifacts:'Артефакты',archive:'Библиотека',portfolio:'Портфель',timeline:'Путь',stack:'Навыки',contact:'Контакты',kpi:'KPI-калькулятор'};
  if(id==='home') return ['index.html','Главная', h1!=='Превращаю ИТ-затраты в управляемый актив компании'? 'Главная':''] ;
  const root = kind==='case' ? ['cases.html','Кейсы'] : kind==='artifact' ? ['artifacts.html','Артефакты'] : ['index.html','Главная'];
  return root;
}
function jsonLd(id, h1){
  if(id==='home'){
    return {
      "@context":"https://schema.org","@type":"Person","name":"Чевтаев Александр",
      "jobTitle":"Директор по цифровой трансформации",
      "email":"mailto:chev.alex@mail.ru","telephone":"+79150234324",
      "description":"Директор по цифровой трансформации. 15 лет в ИТ, 11 компаний, 8 отраслей. Эффект 250–400 млн ₽/год, окупаемость от 4 месяцев.",
      "url": DOMAIN+"/","image": DOMAIN+"/img/photo.jpg",
      "worksFor":{"@type":"Organization","name":"независимый консультант"}
    };
  }
  if(id[0]==='w'){
    return {"@context":"https://schema.org","@type":"Article","headline":h1||'Кейс',
      "author":{"@type":"Person","name":"Чевтаев Александр"},
      "publisher":{"@type":"Person","name":"Чевтаев Александр"},
      "url": DOMAIN+"/"+fileOf[id], "inLanguage":"ru"};
  }
  return null;
}

// ---------- Shared fragments ----------
function navHTML(activeId){
  const menu = [
    {label:'Главная', href:'index.html', id:'home'},
    {label:'Кейсы', href:'cases.html', id:'cases'},
    {label:'Артефакты', href:'artifacts.html', id:'artifacts'},
    {label:'Путь', href:'timeline.html', id:'timeline'},
    {label:'Навыки', href:'stack.html', id:'stack'},
    {label:'Портфель', href:'portfolio.html', id:'portfolio'},
    {label:'Калькулятор', href:'kpi.html', id:'kpi'}
  ];
  const li = menu.map(m=>{
    const cur = m.id===activeId ? ' aria-current="page"' : '';
    return `<a href="${m.href}" data-nav${cur}>${m.label}</a>`;
  }).join('\n        ');
  return `<a class="brand" href="index.html" data-nav aria-label="На главную"><div class="mk">ЧА</div><div class="nm">Чевтаев Александр<small>ЦИФРОВАЯ ТРАНСФОРМАЦИЯ</small></div></a>
  <nav class="nav" id="menu" aria-label="Основная навигация">
    ${li}
    <a href="contact.html" class="cta" data-nav>Контакты</a>
  </nav>
  <button class="burger" id="burgerBtn" aria-expanded="false" aria-controls="menu" aria-label="Меню навигации">
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path class="b1" d="M4 7h18"/><path class="b2" d="M4 13h18"/><path class="b3" d="M4 19h18"/></svg>
  </button>
  <button id="themeToggle" class="theme-toggle" aria-label="Переключить тему" title="Тёмная/светлая тема"><span class="th-ic" aria-hidden="true">🌙</span></button>`;
}
const FOOTER = `<footer>
  <div class="wrap foot-inner">
    <div><strong>Чевтаев Александр</strong><span style="display:block;margin-top:4px">Директор по цифровой трансформации</span></div>
    <div class="foot-links">
      <a href="contact.html" data-nav>Контакты</a> ·
      <a href="cases.html" data-nav>Кейсы</a> ·
      <a href="kpi.html" data-nav>KPI-калькулятор</a>
    </div>
    <span>© 2026 · портфель 17+ кейсов и проектов</span>
  </div>
</footer>
<div id="lbOverlay"><div id="lbStage"><img id="lbImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="1200" height="800" alt="Увеличенное изображение"></div><button id="lbClose" aria-label="Закрыть увеличенное изображение">✕</button><button id="lbZoomIn" aria-label="Приблизить">＋</button><button id="lbZoomOut" aria-label="Отдалить">－</button><button id="lbReset" aria-label="Сбросить масштаб">⤢</button><div id="lbCap"></div></div>
<button id="toTop" aria-label="Наверх" hidden>↑</button>
<div id="progressBar" aria-hidden="true"></div>`;

const METRIKA_SCRIPT = `<script>
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(${METRIKA}, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});
</script>`;
const METRIKA_NOSCRIPT = `<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA}" style="position:absolute; left:-9999px;" alt=""></div></noscript>`;
const OG_COVER = `${DOMAIN}/img/og-cover.webp`;

function breadcrumbJsonLd(id, h1){
  const f=fileOf[id];
  const url=DOMAIN+'/'+f;
  const first=['index.html','Главная'];
  let items;
  if(id[0]==='w') items=[first,['cases.html','Кейсы'],[null, (h1||'').split(/:/)[0].trim()||'Кейс']];
  else if(id[0]==='a') items=[first,['artifacts.html','Артефакты'],[null,h1||'Артефакт']];
  else items=[first,[url,(h1||titleOf(id,h1)).slice(0,40)]];
  const list=items.map((it,i)=>({"@type":"ListItem","position":i+1,"name":it[1],...(it[0]?{"item":DOMAIN+'/'+it[0]}:{'@id':url+"#"+slug(it[1])})}));
  function slug(s){return s.replace(/\W+/g,'-').slice(0,40);}
  return {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":list};
}
function headHTML(id, h1, pageText){
  const title = titleOf(id, h1);
  const desc = descOf(id, h1, pageText);
  const file = fileOf[id];
  // главная — canonical/og:url без «index.html»
  const canonical = id==='home' ? `${DOMAIN}/` : `${DOMAIN}/${file}`;
  const ld = jsonLd(id, h1);
  const ldTag = `\n<script type="application/ld+json">${JSON.stringify(jsonLd(id, h1))}</script>` +
                `\n<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd(id,h1))}</script>`;
  const itemList = id==='artifacts' ? `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":"Артефакты · Александр Чевтаев","url":DOMAIN+"/artifacts.html","numberOfItems":17})}</script>` : '';
  const isIndex = id==='home';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0f1e34">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${id[0]==='w'?'article':id==='home'?'profile':'website'}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${OG_COVER}">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Чевтаев Александр · Портфолио">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG_COVER}">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages.css">
<link rel="stylesheet" href="css/print.css" media="print">
<link rel="icon" href="${FAVICON}">
${METRIKA_SCRIPT}${itemList}${ldTag}
</head>`;
}

// ---------- content transformation ----------
const SRC_TEXT = fs.readFileSync(SRC, 'utf8');
const RAW = {}; // id -> object {chunk, h1, pageText}

// reuse splitter logic inline (simple tag scanner)
function pagesOf(html){
  const out = {}; const re=/\$__PAGE__\$/gi; // noop
  const tagRe = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g;
  let depth=0, current=null;
  while(true){ const m=tagRe.exec(html); if(!m) break;
    const tok=m[0]; const idx=m.index;
    if(tok.startsWith('<!--')) continue;
    if(tok.startsWith('</')){ const t=/^<\/([a-zA-Z0-9]+)/.exec(tok)[1].toLowerCase();
      if(t==='div'){ depth--;
        if(current && depth===0){ current.end=html.indexOf('</div>',idx)+6; out[current.id]=html.slice(current.start,current.end); current=null; }
      } continue; }
    const tm=/^<([a-zA-Z0-9]+)/.exec(tok); if(!tm) continue;
    const t=tm[1].toLowerCase();
    if(/\/>$/.test(tok)||['img','br','input','hr','meta','link','source','wbr','area','base','col','embed','iframe'].includes(t)) continue;
    if(t==='div'){ const p=/class="page( on)?" id="p-([^"]+)"/.exec(tok);
      if(p){ if(current) {} current={id:p[2],start:idx}; depth=1; } else if(current) depth++;
    } else if(t==='script'||t==='style'){ const c=html.indexOf('</'+t+'>',m.index); tagRe.lastIndex=c+('</'+t+'>').length; }
  }
  return out;
}
const PAGES = pagesOf(SRC_TEXT);

function fixLinks(html, id){
  // 1) anchor routing links: href="#x" onclick="return go('x')|closeMenu('x')
  html = html.replace(/<a([^>]*)\bhref="#([^"]+)"([^>]*?)\bonclick="return (?:go|closeMenu)\('([^']+)'\)"[^>]*>([\s\S]*?)<\/a>/g, (all,pre,href,mid,tgt,inner)=>{
    const f=fileOf[tgt]||fileOf.id||'index.html';
    const aria = ' data-nav';
    return `<a${pre}href="${f}"${mid}${aria}>${inner}</a>`;
  });
  // 2) anchor without onclick but href="#x" (bare) -> real file
  html = html.replace(/<a([^>]*)\bhref="#([A-Za-z0-9-]+)"([^>]*)>([\s\S]*?)<\/a>/g, (all,pre,href,mid,inner)=>{
    const f=fileOf[href]||'index.html';
    return `<a${pre}href="${f}"${mid} data-nav>${inner}</a>`;
  });
  // 3) non-anchor elements with onclick="go('x')" or inline go('x')/openAtlasModal outside anchors
  html = html.replace(/\sonclick="go\('([^']+)'\)"/g, (a,tgt)=>` data-href="${fileOf[tgt]||'index.html'}"`);
  html = html.replace(/\sonclick="return go\('([^']+)'\)"/g, (a,tgt)=>` data-href="${fileOf[tgt]||'index.html'}"`);
  html = html.replace(/\sonkeydown="[^"]*go\('[^']+'\)[^"]*"/g, '');
  return html;
}
function removeHandlerAttrs(html){
  html = html.replace(/\sonclick="([^"]*)"/g, (a,h)=> h==='calcKpi()' ? '' : ''); // handled separately
  html = html.replace(/\sonclick="return false"/g,'');
  return html;
}
function transformInputs(html){
  html = html.replace(/<input([^>]*?)\boninput="calcKpi\(\)"([^>]*)>/g, (a,pre,post)=>`<input${pre}${post} data-kpi>`);
  // "Показать все этапы" button in timeline
  html = html.replace(/<button class="btn gh" id="tlShowBtn"[^>]*>Показать все этапы<\/button>/, `<button type="button" class="btn gh" id="tlShowBtn" data-action="tl-show" aria-expanded="false">Показать все этапы</button>`);
  html = html.replace(/\sonkeydown="[^"]*"/g, '');
  return html;
}
function toBreadcrumb(html, id, h1, kind){
  // convert crumbs div into nav[aria-label=breadcrumb]
  const crumbsRe = /<div class="crumbs">([\s\S]*?)<\/div>/;
  const m=crumbsRe.exec(html);
  if(m){ html = html.replace(crumbsRe, m=>`<nav aria-label="breadcrumb" class="crumbs">${m.match(/<div class="crumbs">([\s\S]*?)<\/div>/)[1]}</nav>`); }
  return html;
}
function base64ToFiles(html, pageId){
  // 0) HERO PHOTO (home only) — replace the real base64 <img> with semantic <picture>
  if(pageId==='home'){
    html = html.replace(/<img src="(data:image\/jpeg;base64,[^"]+)"([^>]*)>/, `<picture><source srcset="img/photo.webp" type="image/webp"><img src="img/photo.jpg" alt="Чевтаев Александр" width="800" height="798" loading="eager" fetchpriority="high"></picture>`);
  }
  // 1) kazakhmys d-shot lb-trigger data-lb base64 -> file
  html = html.replace(/data-lb="data:image\/jpeg;base64,[^"]+"/g, `data-lb="img/artifacts/kazakhmys-slide-1.jpg"`);
  // 2) kpi png slide
  html = html.replace(/<img src="data:image\/png;base64,[^"]+"([^>]*)>/g, (a,rest)=>`<img src="img/artifacts/kpi-slide.webp" width="1280" height="720" alt="Исходный слайд расчёта KPI" loading="lazy" decoding="async"${rest}>`);
  return html;
}
function injectCallout(html, kind){
  if(kind!=='case' && kind!=='artifact') return html;
  if(/class="callout"/.test(html)) return html;
  const cta = kind==='case'
    ? `<div class="callout"><div><b>Хотите такой же результат?</b><p>Обсудим задачу — пришлю гипотезу с расчётом ROI в течение 48 часов.</p></div><a class="btn p" href="contact.html" data-nav data-track="cta-contact">Обсудить похожую задачу →</a></div>`
    : `<div class="callout"><div><b>Нужен такой же документ под ваш проект?</b><p>Адаптирую артефакт под вашу задачу и данные.</p></div><a class="btn p" href="contact.html" data-nav data-track="cta-contact">Обсудить похожую задачу →</a></div>`;
  // insert right after the crumbs/breadcrumb or at top of .wrap
  const wm = html.match(/<div class="crumbs">[\s\S]*?<\/nav>|<div class="crumbs">[\s\S]*?<\/div>/);
  if(wm){ html = html.replace(wm[0], wm[0]+'\n    '+cta); }
  else { html = html.replace(/<div class="wrap">/, '<div class="wrap">\n    '+cta); }
  return html;
}
function specialPage(html, id){
  if(id==='cases'){
    // удалить карер-блок «ОПЫТ» (радуга) — дублируется ниже «Результаты по компаниям»
    const a = html.indexOf('<section class="sec career-sec');
    const b = html.indexOf('<section class="sec" id="cases-anchor">');
    if(a>=0 && b>a){ html = html.slice(0,a) + html.slice(b); }
    // фильтр по типу эффекта перед сеткой кейсов
    const effFilter = `<div class="eff-filter" role="group" aria-label="Фильтр по типу эффекта">
      <span class="eff-label">Тип эффекта:</span>
      <button type="button" class="eff-chip active" data-eff="all" aria-pressed="true">Все</button>
      <button type="button" class="eff-chip" data-eff="money" aria-pressed="false">Экономия ₽</button>
      <button type="button" class="eff-chip" data-eff="roi" aria-pressed="false">ROI</button>
      <button type="button" class="eff-chip" data-eff="ops" aria-pressed="false">OPEX / бэк-офис</button>
      <button type="button" class="eff-chip" data-eff="nps" aria-pressed="false">NPS / клиенты</button>
    </div>`;
    const grid=html.indexOf('<div class="cases reveal">');
    if(grid>0 && !html.includes('eff-filter')) html=html.slice(0,grid)+effFilter+'\n    '+html.slice(grid);
  }
  if(id==='w7'){
    const fig = `<figure class="gostekh-fig"><img src="img/gostekh-reglament.svg" width="920" height="500" alt="Схема регламента информационного взаимодействия ГосТех и МинЦифры" loading="lazy" decoding="async"><figcaption>Выжимка из 3 регламентов: СРО «ГосТех» ↔ ФГИС СЦ · 11 ролей · 3 процедуры · SLA 5 мин · зонд-контроль &lt;60 сек</figcaption></figure>`;
    const pos = html.indexOf('<div class="d-body">');
    if(pos>=0){ html = html.slice(0,pos) + fig + '\n' + html.slice(pos); }
  }
  if(id==='a4'){
    const fig = `<figure class="gostekh-fig"><a class="lb-trigger fig-zoom" data-lb="img/incident-ib-orig.png" data-lb-mode="natural" data-lb-t="Схема обработки отклонений · Инцидент ИБ"><img src="img/incident-ib-orig.png" width="2200" height="618" alt="Схема обработки отклонений на примере инцидента ИБ" loading="lazy" decoding="async"></a><figcaption>Нажмите на схему, чтобы увеличить и рассмотреть каждый шаг · 12 шагов · решения и связанные процессы ITSM</figcaption></figure>`;
    if(/art-pre/.test(html)){ html = html.replace(/<div class="art-pre">[\s\S]*?<\/div>/, fig); }
    else { const pos = html.indexOf('<div class="d-body">'); if(pos>=0) html = html.slice(0,pos)+fig+'\n'+html.slice(pos); }
  }
  if(id==='w7'){
    // схема инцидента ИБ (пример прорисовки процесса) — добавляем после регистрационной инфографики
    const more = `<figure class="gostekh-fig"><a class="lb-trigger fig-zoom" data-lb="img/incident-ib-orig.png" data-lb-mode="natural" data-lb-t="Схема обработки отклонений · Инцидент ИБ"><img src="img/incident-ib-orig.png" width="2200" height="618" alt="Схема обработки отклонений на примере инцидента ИБ" loading="lazy" decoding="async"></a><figcaption>Пример прорисовки процесса — реагирование на инцидент ИБ (нажмите для увеличения)</figcaption></figure>`;
    html = html.replace(/(<figure class="gostekh-fig">[\s\S]*?<\/figure>)/, '$1\n  '+more);
  }
  if(id==='a2'||id==='a10'){
    const fig = `<figure class="gostekh-fig"><img src="img/gostekh-reglament.svg" width="920" height="500" alt="Схема регламента информационного взаимодействия ГосТех и МинЦифры" loading="lazy" decoding="async"><figcaption>Выжимка из регламента: СРО «ГосТех» ↔ ФГИС СЦ · 11 ролей · 3 процедуры · 6 правил инцидентов · SLA 5 мин</figcaption></figure>`;
    // заменить арт-превью, если есть
    if(/art-pre/.test(html)){ html = html.replace(/<div class="art-pre">[\s\S]*?<\/div>/, fig); }
    else { const pos = html.indexOf('<div class="d-body">'); if(pos>=0) html = html.slice(0,pos)+fig+'\n'+html.slice(pos); }
  }
  if(id==='kpi'){
    const btn = `<p class="kpi-export"><button type="button" class="btn gh" id="kpiExport" data-action="kpi-export">Скачать расчёт в PDF (печать) 🖨</button></p>`;
    const pos = html.indexOf('<div class="d-body">');
    if(pos>=0 && !/kpi-export/.test(html)) html = html.slice(0,pos) + btn + '\n' + html.slice(pos);
  }
  if(id==='a8'){
    html = html.replace(/<iframe id="atlasFrameInline" class="atlas-inline"[^>]*><\/iframe>/, `<iframe src="atlas.html" class="atlas-inline" title="ИИ-атлас бэк-офиса" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`);
    html = html.replace(/<button type="button" class="btn gh"[^>]*>Полный экран<\/button>/, `<a class="btn gh" href="atlas.html" target="_blank" rel="noopener noreferrer" data-track="atlas">Полный экран</a>`);
  }
if(id==='a9'){
    // Заменяем растровый «слайд» (не соответствующий смыслу) на собственную KPI-инфографику
    const svg = `<div class="slide-embed">
<div class="kpi-diagram" aria-label="KPI-модель Казахмыс: каталог уровней, веса и пороговые оценки">
<svg viewBox="0 0 720 300" role="img">
  <defs>
    <linearGradient id="kd1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d6fe0"/><stop offset="1" stop-color="#0e9bbf"/></linearGradient>
  </defs>
  <rect width="720" height="300" rx="16" fill="#f4f7fb"/>
  <text x="24" y="34" font-size="16" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">Каталог KPI · уровни 1–5 с весами</text>
  <text x="24" y="54" font-size="11.5" fill="#5f6e82" font-family="Inter,system-ui,sans-serif">Каждый показатель привязан к SLA и тарифу · модель аллокации по фактическому потреблению</text>
  <!-- levels bars -->
  <g font-family="Inter,system-ui,sans-serif">
    <rect x="24" y="72" width="380" height="30" rx="8" fill="#e3edf8"/>
    <rect x="24" y="72" width="300" height="30" rx="8" fill="url(#kd1)"/>
    <text x="34" y="92" font-size="12.5" font-weight="700" fill="#123052">L1 · Бизнес-процессы</text>
    <text x="318" y="92" font-size="12" font-weight="800" fill="#ffffff">вес 1,0</text>
    <rect x="24" y="108" width="380" height="26" rx="8" fill="#e3edf8"/>
    <rect x="24" y="108" width="340" height="26" rx="8" fill="url(#kd1)"/>
    <text x="34" y="125" font-size="12" font-weight="700" fill="#123052">L2 · ИТ-услуги</text>
    <text x="338" y="125" font-size="12" font-weight="700" fill="#ffffff">вес 0,85</text>
    <rect x="24" y="140" width="380" height="26" rx="8" fill="#e3edf8"/>
    <rect x="24" y="140" width="300" height="26" rx="8" fill="url(#kd1)"/>
    <text x="34" y="157" font-size="12" font-weight="700" fill="#123052">L3 · Компоненты / системы</text>
    <text x="298" y="157" font-size="12" font-weight="700" fill="#ffffff">вес 0,7</text>
    <rect x="24" y="172" width="380" height="26" rx="8" fill="#e3edf8"/>
    <rect x="24" y="172" width="250" height="26" rx="8" fill="url(#kd1)"/>
    <text x="34" y="189" font-size="12" font-weight="700" fill="#123052">L4 · Ресурсы / персонал</text>
    <text x="248" y="189" font-size="12" font-weight="700" fill="#ffffff">вес 0,55</text>
    <rect x="24" y="204" width="380" height="26" rx="8" fill="#e3edf8"/>
    <rect x="24" y="204" width="200" height="26" rx="8" fill="url(#kd1)"/>
    <text x="34" y="221" font-size="12" font-weight="700" fill="#123052">L5 · Инфраструктура</text>
    <text x="198" y="221" font-size="12" font-weight="700" fill="#ffffff">вес 0,4</text>
  </g>
  <!-- thresholds -->
  <g font-family="Inter,system-ui,sans-serif">
    <rect x="420" y="72" width="272" height="40" rx="10" fill="#ffffff" stroke="#dbe5f0"/>
    <text x="434" y="90" font-size="12" font-weight="800" fill="#1d6fe0">Порог исполнения · 80%</text>
    <text x="434" y="106" font-size="11" fill="#5f6e82">оценка показателя = 100%</text>
    <rect x="420" y="118" width="272" height="40" rx="10" fill="#ffffff" stroke="#dbe5f0"/>
    <text x="434" y="136" font-size="12" font-weight="800" fill="#0e7490">70–79% · 50%</text>
    <text x="434" y="152" font-size="11" fill="#5f6e82">&lt;70% · 0%</text>
  </g>
  <!-- allocation -->
  <g font-family="Inter,system-ui,sans-serif">
    <rect x="420" y="166" width="272" height="60" rx="10" fill="#eef4fb"/>
    <text x="434" y="186" font-size="12" font-weight="800" fill="#123052">Аллокация затрат</text>
    <text x="434" y="204" font-size="11" fill="#5f6e82">на бизнес-процессы по фактическому</text>
    <text x="434" y="218" font-size="11" fill="#5f6e82">потреблению услуги</text>
  </g>
  <text x="24" y="256" font-size="12.5" font-weight="800" fill="#1d6fe0" font-family="Inter,system-ui,sans-serif">Эффект: −15–25% потребления · окупаемость &lt;6 мес · сценарии 120/250/400 млн ₽/год</text>
</svg>
</div>
<p class="slide-caption">Схема KPI-модели · Казахмыс · Accenture, 2023</p>
</div>`;
    html = html.replace(/<div class="slide-embed">[\s\S]*?<\/div>/, svg);
  }
  if(id==='stack'){
    // стек → 5 компетенций с примерами и результатом (данные из готовых кейсов)
    function matchClose2(html,open){ var d=0,i=open; for(;i<html.length;i++){ if(html[i]==='<'){ var m=/^<div[\s>]/.exec(html.slice(i,i+30)); var c=/^<\/div/.exec(html.slice(i,i+10)); if(c){d--; if(d===0) return i+6; i+=5;} else if(m){d++; i+=4;} } } return -1; }
    var s=html.indexOf('<div class="stack-cols reveal">');
    if(s>=0){ var e=matchClose2(html,s); if(e>s){
      var G=[
        ['Управленческие компетенции',['P&L-ответственность','Аллокация затрат','KPI / OKR','Команды до 100+ чел.','Бюджетирование ИТ','Вендор-менеджмент','Дорожная карта'],'От диагностики до P&L-эффекта','ПСБ-ФИНАНС — −42% OPEX, команда 29 чел. с нуля'],
        ['Экономика ИТ',['ROI','TCO','Unit Economics','CAPEX / OPEX','Cost Saving','ФСА','Тарификация'],'Каждую инициативу считаю в деньгах','Казахмыс — сценарии 120/250/400 млн ₽/год, ROI 250–300%'],
        ['Архитектура и процессы',['TOGAF','ArchiMate','BPMN','ITIL 4','SLA / OLA / UC','PMBOK','Целевые модели'],'Проектирую целевую архитектуру под стратегию','ГосТех — 4 регламента уровня Минцифры, SLA 5 мин'],
        ['ИИ и данные',['LLM','RAG','NLP','AI-виджеты','Power BI','SQL','Дашборды'],'Внедряю ИИ ради P&amp;L, а не хайпа','Аэроклуб — 76,9% вопросов решает ИИ, −40% стоимости'],
        ['Технологический стек',['Jira / Structure','Confluence','ServiceNow','1С:ITIL','ELMA365','Optimacros','Zabbix'],'Инструменты под масштаб и экономику','MERLION — KPI ~700 ИТ-сотрудников, SLA «Ситилинк»']
      ];
      var blocks=G.map(function(g){ return '\n      <div class="grp"><h4>'+g[0]+'</h4><div>'+g[1].map(function(c){return '<span class="chip">'+c+'</span>';}).join('')+'</div><p class="grp-ex">'+g[2]+'. <b>'+g[3]+'.</b></p></div>'; }).join('');
      html=html.slice(0,s)+'<div class="stack-cols reveal">'+blocks+'\n    </div>'+html.slice(e);
    }}
  }
  return html;
}
function homeEdits(html){
  // KPI hero: до 400 млн ₽ -> 250–400 млн ₽
  html = html.replace(/до 400&nbsp;млн&nbsp;₽<small>\/год<\/small>/, '250–400&nbsp;млн&nbsp;₽<small>/год</small>');
  html = html.replace(/до 400 млн ₽<\/div><div class="l"/, '250–400 млн ₽</div><div class="l"'); // fpill handled separately
  html = html.replace(/<div class="fpill fpill-a">до 400 млн ₽<span>\/год<\/span><\/div>/, '<div class="fpill fpill-a">250–400 млн ₽<span>/год</span></div>');
  // kpi3 caption
  html = html.replace(/(<div class="l">эффект по одному проекту · Казахмыс<\/div>)/, '<div class="l">эффект по одному проекту · Казахмыс</div>');
  html = html.replace(/(<a class="kpi3" href="cases.html"[^>]*><div class="v">250–400&nbsp;млн&nbsp;₽<small>\/год<\/small><\/div><div class="l">эффект по одному проекту · Казахмыс<\/div><div class="d">)[^<]*(<\/div>)/, '$1целевой сценарий · KPI-модель Казахмыс$2');
  html = html.replace(/<b>400\+ млн ₽\/год<\/b>/, '<b>250–400 млн ₽/год</b>');
  // --- selling hero copy: AI-цифровизация + ИИ-контур ---
  html = html.replace(/<div class="hero-tagline">[^<]*<\/div>/, '<div class="hero-tagline">Цифровая трансформация бизнеса на базе ИИ</div>');
  html = html.replace(/<h1>Превращаю ИТ-затраты в управляемый актив компании<\/h1>/, '<h1>Идеальный ИТ-контур на базе ИИ — каждый рубль приносит прибыль</h1>');
  html = html.replace(/<p class="lead">([\s\S]*?)<\/p>/, '<p class="lead">Проектирую и внедряю целевой ИТ-контур с ИИ-ядром: от экономики услуг и аллокации до автономной поддержки. Каждые 4–5 месяцев — измеримый эффект в P&amp;L бизнеса. <b>250–400 млн ₽/год</b> по проекту, <b>ROI 250–300%</b>, <b>−42% OPEX</b>. 15 лет, 11 компаний, 8 отраслей — стратегия, архитектура, внедрение под ключ.</p>');
  // --- declutter: pf-section -> 6 ключевых метрик + блок «Почему я» + CTA ---
  (function(){
    // replace the whole pf-section with balanced div matching
    function matchClose(html, open){
      var depth=0, i=open;
      for(; i<html.length; i++){
        if(html[i]==='<'){
          var m=/^<div[\s>]/.exec(html.slice(i,i+30));
          var c=/^<\/div/.exec(html.slice(i,i+10));
          if(c){ depth--; if(depth===0) return i+6; i=i+5; }
          else if(m){ depth++; i=i+4; }
        }
      }
      return -1;
    }
    var s=html.indexOf('<div class="pf-section reveal">');
    if(s>=0){ var e=matchClose(html,s); if(e>s){
      var pfSec=`<div class="pf-section reveal">
      <div class="sec-h"><span class="sec-n">РЕЗУЛЬТАТЫ</span><h2>Измеримый эффект в цифрах</h2></div>
      <div class="sec-s">6 ключевых метрик. Остальные цифры и источники — в кейсах.</div>
      <div class="pf-grid">
        <div class="pf-item"><div class="pf-v">250–400 млн ₽<small>/год</small></div><div class="pf-l">эффект по одному проекту (целевой)</div><div class="pf-s">Казахмыс · KPI-модель</div></div>
        <div class="pf-item"><div class="pf-v">250–300%</div><div class="pf-l">ROI за 1-й год</div><div class="pf-s">Казахмыс · ББР-банк</div></div>
        <div class="pf-item"><div class="pf-v">−42%</div><div class="pf-l">OPEX ИТ-функции</div><div class="pf-s">ПСБ-ФИНАНС · KPI-модель</div></div>
        <div class="pf-item"><div class="pf-v">76,9%</div><div class="pf-l">вопросов решает ИИ</div><div class="pf-s">Аэроклуб · ТЗ_ИИ</div></div>
        <div class="pf-item"><div class="pf-v">7,46 → 8,76</div><div class="pf-l">NPS</div><div class="pf-s">АЛРОСА · кейс w9</div></div>
        <div class="pf-item"><div class="pf-v">100+</div><div class="pf-l">человек в подчинении</div><div class="pf-s">АЛРОСА · холдинг</div></div>
      </div>
      <p class="pf-more"><a href="cases.html" data-nav>Все цифры и источники — в кейсах →</a></p>
    </div>
    <section class="sec why-me reveal">
      <div class="sec-h"><span class="sec-n">ПОЧЕМУ Я</span><h2>Чем я отличаюсь от «просто директора по ИТ»</h2></div>
      <div class="why-grid">
        <div class="why-card"><b>Считаю экономику каждого решения</b><p>Не «внедрим LLM», а: «вот стоимость, вот эффект в P&amp;L, вот окупаемость». Каждая инициатива — с цифрой.</p></div>
        <div class="why-card"><b>Внедряю ИИ ради прибыли, а не хайпа</b><p>76,9% охвата и −40% стоимости на Аэроклубе, ИИ-атлас на R-Vision — ИИ как управляемый актив.</p></div>
        <div class="why-card"><b>Управляю командами разного масштаба</b><p>От поддержки из 29 специалистов до ИТ-функции на ~700 человек — в частных, полугосударственных и государственных компаниях. Разбираюсь в оргструктурах от десятков людей до корпораций мирового уровня (Accenture: ТОП-4 в мире по численности, 750 000+ сотрудников).</p></div>
        <div class="why-card"><b>Работал в 8 отраслях</b><p>От добычи (АЛРОСА, Казахмыс) до банков и госплатформ — переношу лучшие практики между отраслями.</p></div>
      </div>
    </section>`;
      html=html.slice(0,s)+pfSec+html.slice(e);
    }}
  })();
  return html;
}

function processPage(id){
  let chunk = PAGES[id];
  if(!chunk) return null;
  // remove the outer page div wrapper (we control shell)
  chunk = chunk.replace(/^<div class="page( on)?" id="p-[^"]+">/, '').replace(/<\/div>\s*$/, '');
  const h1m = chunk.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1m ? contentRename(h1m[1].replace(/<[^>]*>/g,'').trim()) : '';
  const kind = pageKind(id);
  let body = contentRename(chunk);
  body = fixLinks(body, id);
  body = transformInputs(body);
  body = toBreadcrumb(body, id, h1, kind);
  body = base64ToFiles(body, id);
  body = specialPage(body, id);
  body = addAnalytics(body, id);
  body = injectCallout(body, kind);
  body = injectSvgPreview(body, id, h1);
  body = injectMetaNote(body, id);
  if(id==='home') body = homeEdits(body);
  body = ensureH1(body, id);
  body = injectLogos(body, id);
  if(id==='artifacts') body = injectArchiveDocs(body);
  if(kind==='case' && !/case-cta-float/.test(body)){
    body += '\n<a class="case-cta-float" href="contact.html" data-nav data-track="cta-contact">Обсудить похожую задачу →</a>';
  }

  const pageText = body.replace(/<script[\s\S]*?<\/script>/g,'');
  const head = headHTML(id, h1, pageText);
  const nav = navHTML(id);
  const progress = kind==='case' ? '' : ''; // progress added via JS on .case-page
  const bodyClass = kind==='case' ? ' class="case-page"' : kind==='artifact' ? ' class="artifact-page"' : (id==='home'?' class="home-page"':'');
  const pageWrap = kind==='home' ? `<main id="main">` : `<main id="main">`;
  const out = `${head}
<body${bodyClass} data-page="${id}" data-metrika="${METRIKA}">
${METRIKA_NOSCRIPT}
<a class="skip-link" href="#main">Перейти к содержимому</a>
<header class="top"><div class="wrap">
${nav}
</div></header>
<main id="main">
<div class="page on">${body}</div>
</main>
${FOOTER}
<script src="js/router.js"></script>
<script src="js/reveal.js"></script>
<script src="js/lightbox.js"></script>
<script src="js/portfolio.js"></script>
<script src="js/calc.js"></script>
</body>
</html>`;
  return out;
}
function contentRename(body){
  body = body.replace(/Точка Займа/g,'ПСБ-ФИНАНС').replace(/CarMoney/g,'ПСБ-ФИНАНС');
  body = body.replace(/МГУПС \(МИИТ\) · Информационные системы и технологии · 2015/g,'ВолгГТУ · Информатика и вычислительная техника · Инженер-программист · 2011');
  body = body.replace(/ и переезду в Красногорск/g,'');
  // KPI: инфраструктура по умолчанию 350 000 ₽ (пример сходится: 600 000 ₽/мес, 1 440 000 ₽/год, 5 мес. окуп.)
  body = body.replace(/(id="k-inf"[^>]*value=")300000(")/, '$1350000$2');
  // unify KPI metric 400
  body = body.replace(/до 400 млн ₽\/год/g,'250–400 млн ₽/год');
  body = body.replace(/до 400 млн ₽/g,'250–400 млн ₽');
  body = body.replace(/400\+ млн ₽\/год/g,'250–400 млн ₽/год');
  // unify response SLA -> the most specific & favourable
  body = body.replace(/в течение рабочего дня/gi,'в течение 2 часов в рабочее время');
  body = body.replace(/Отвечаю в течение 2 часов в рабочее время/g,'Отвечаю в течение 2 часов в рабочее время');
  body = body.replace(/пришлю гипотезу с расчётом ROI в течение 48 часов/g,'пришлю гипотезу с расчётом ROI в течение рабочего дня');
  return body;
}
function ensureH1(body, id){
  const LIST_H1=['cases','artifacts','timeline','contact'];
  if(!LIST_H1.includes(id)) return body;
  if(!/<h1[\s>]/.test(body) && /<h2[\s>]/.test(body)){
    body = body.replace(/<h2>([\s\S]*?)<\/h2>/, '<h1>$1</h1>');
  }
  // after promotion/dedup: demote any h2 whose text exactly equals the page h1 (avoid duplicate headings)
  const h1m = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if(h1m){
    const t = h1m[1];
    const re = new RegExp('<h2[^>]*>'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</h2>','g');
    body = body.replace(re, '<h3 class="dup-h">'+t+'</h3>');
  }
  return body;
}

// компания кейса -> слага логотипа
const LOGO_BY_WORK = {w1:'kazakhmys',w2:'aeroclub',w3:'arlight',w4:'bbr',w5:'mgrup',w6:'proservis',
  w7:'gostech',w8:'rvision',w9:'alrosa',w10:'psb',w11:'sunlight',w12:'merlion',
  w13:'delta',w14:'incenter',w15:'vsrf',w16:'sber',w17:'srg'};
function logoNameByCompany(txt){
  const s=txt.toLowerCase();
  if(s.includes('сбер')) return 'sber';
  // клиенты Accenture → отраслевые иконки
  if(s.includes('ббр')) return 'bbr';
  if(s.includes('казах')) return 'kazakhmys';
  if(s.includes('аэроклуб')||s.includes('aero')) return 'aeroclub';
  if(s.includes('арлайт')||s.includes('arlight')) return 'arlight';
  if(s.includes('м-групп')||s.includes('м групп')||s.includes('м-групп')||s.includes('м-групп')) return 'mgrup';
  if(s.includes('просервис')||s.includes('pro-сервис')||s.includes('proservis')) return 'proservis';
  // компании
  if(s.includes('accenture')||s.includes('axenix')||s.includes('аксе')) return 'accenture';
  if(s.includes('psb')||s.includes('псб')) return 'psb';
  if(s.includes('сол')||s.includes('sun')) return 'sunlight';
  if(s.includes('мерлион')||s.includes('merlion')) return 'merlion';
  if(s.includes('алроса')||s.includes('alrosa')) return 'alrosa';
  if(s.includes('r-vision')||s.includes('rvision')) return 'rvision';
  if(s.includes('госте')||s.includes('мин')||s.includes('ецп')||s.includes('гос')||s.includes('цифров')) return 'gostech';
  if(s.includes('дельта')||s.includes('delta')) return 'delta';
  if(s.includes('инженер')) return 'incenter';
  if(s.includes('воор')||s.includes('арми')||s.includes('вооруж')) return 'vsrf';
  if(s.includes('srg')||s.includes('service office')) return 'srg';
  if(s.includes('р-vis')) return 'rvision';
  return null;
}
function injectArchiveDocs(html){
  // Документы из бывшей «Библиотеки», которых нет в Tier 2 Артефактов → единая сетка без дублей
  const cards=[
    {href:'artifact-a2.html',tag:'DOCX · Министерство',title:'Регламент взаимодействия СРО ЕЦП и ФГИС СЦ',sub:'Регламент уровня Министерства',mets:[['11','ролей'],['3','процедуры'],['6','правил']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="30" y="40" width="76" height="44" rx="8" fill="#0e2850"/><text x="68" y="68" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">11 ролей</text><rect x="122" y="40" width="76" height="44" rx="8" fill="#1d6fe0"/><text x="160" y="68" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">3 процедуры</text><rect x="214" y="40" width="76" height="44" rx="8" fill="#0f8f7f"/><text x="252" y="68" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">SLA 5 мин</text><rect x="40" y="100" width="240" height="8" rx="4" fill="#e3e9f0"/><rect x="40" y="100" width="180" height="8" rx="4" fill="#1d6fe0"/><text x="160" y="124" text-anchor="middle" font-size="10" font-weight="800" fill="#0e2850">ЕЦП «ГосТех» ↔ ФГИС СЦ · МинЦифры</text></svg>`},
    {href:'artifact-a3.html',tag:'XLSX · Интеграция',title:'Интеграция данных между ГосТех и ФГИС СЦ',sub:'Атрибуты, статусы, справочники для REST-обмена',mets:[['60+','полей'],['12','справочников'],['6','приоритетов']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="30" y="40" width="116" height="42" rx="8" fill="#eef5ff"/><text x="88" y="66" text-anchor="middle" font-size="11" font-weight="800" fill="#1d6fe0">clientName</text><rect x="170" y="40" width="120" height="42" rx="8" fill="#eef5ff"/><text x="230" y="66" text-anchor="middle" font-size="11" font-weight="800" fill="#1d6fe0">ФИО</text><rect x="30" y="96" width="116" height="36" rx="8" fill="#eef5ff"/><text x="88" y="119" text-anchor="middle" font-size="11" font-weight="800" fill="#1d6fe0">priority →</text><rect x="170" y="96" width="120" height="36" rx="8" fill="#eef5ff"/><text x="230" y="119" text-anchor="middle" font-size="11" font-weight="800" fill="#1d6fe0">Приоритет</text><text x="160" y="142" text-anchor="middle" font-size="10" font-weight="800" fill="#0e2850">карта полей и статусов двух СУЗ</text></svg>`},
    {href:'artifact-a4.html',tag:'PDF · ITSM · Процесс',title:'Схема обработки инцидента ИБ',sub:'BPMN-модель реагирования на инциденты ИБ',mets:[['12','шагов'],['3','решения'],['BPMN','']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="24" y="45" width="70" height="40" rx="8" fill="#1d6fe0"/><text x="59" y="70" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">1.1 Регист.</text><line x1="94" y1="65" x2="118" y2="65" stroke="#53637a" stroke-width="2"/><rect x="120" y="45" width="70" height="40" rx="8" fill="#c7912a"/><text x="155" y="70" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">умышл.? </text><line x1="190" y1="65" x2="214" y2="65" stroke="#53637a" stroke-width="2"/><rect x="216" y="45" width="78" height="40" rx="8" fill="#0f8f7f"/><text x="255" y="70" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">Устранение</text><rect x="120" y="100" width="84" height="32" rx="8" fill="#0e2850"/><text x="162" y="121" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">Закрытие</text></svg>`},
    {href:'artifact-a5.html',tag:'DOCX · AI',title:'AI-ассистент Service Desk',sub:'Логика работы и экономика ИИ-виджета',mets:[['76,9%','охват'],['−40%','стоимость'],['−62%','труд']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="24" y="45" width="80" height="44" rx="8" fill="#0e7490"/><text x="64" y="69" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff">AI-виджет</text><line x1="104" y1="67" x2="128" y2="67" stroke="#53637a" stroke-width="2"/><rect x="130" y="45" width="80" height="44" rx="8" fill="#1d6fe0"/><text x="170" y="69" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff">1-я линия</text><line x1="210" y1="67" x2="234" y2="67" stroke="#53637a" stroke-width="2"/><rect x="236" y="45" width="60" height="44" rx="8" fill="#1f7a52"/><text x="266" y="69" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">JIRA</text><text x="160" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="#0e7490">Охват ИИ 76,9%</text></svg>`},
    {href:'artifact-a6.html',tag:'PDF · Инструкция',title:'Памятка сотрудникам склада',sub:'Самообслуживание в ночную смену и выходные',mets:[['3','блока'],['24/7',''],['PDF','']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="24" y="45" width="84" height="48" rx="8" fill="#0e2850"/><text x="66" y="73" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">Что решить</text><rect x="120" y="45" width="84" height="48" rx="8" fill="#c7912a"/><text x="162" y="73" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">Диагностика</text><rect x="216" y="45" width="80" height="48" rx="8" fill="#1d6fe0"/><text x="256" y="73" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">Кому звонить</text><text x="160" y="122" text-anchor="middle" font-size="10" fill="#53637a">без вызова ИТ-специалиста</text></svg>`},
    {href:'artifact-a7.html',tag:'DOCX · Тендер',title:'ТЗ на приобретение ITSM-системы',sub:'30+ модулей ITIL 4, отказоустойчивость RC4, ИБ',mets:[['30+','модулей'],['RC4','класс'],['17','блоков ИБ']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="30" y="42" width="120" height="30" rx="8" fill="#eef5ff"/><text x="90" y="62" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1d6fe0">✓ Инциденты</text><rect x="170" y="42" width="120" height="30" rx="8" fill="#eef5ff"/><text x="230" y="62" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1d6fe0">✓ CMDB</text><rect x="30" y="80" width="120" height="30" rx="8" fill="#fdf1dc"/><text x="90" y="100" text-anchor="middle" font-size="10.5" font-weight="700" fill="#b3741f">17 блоков ИБ</text><rect x="170" y="80" width="120" height="30" rx="8" fill="#fdf1dc"/><text x="230" y="100" text-anchor="middle" font-size="10.5" font-weight="700" fill="#b3741f">RC4 · HA</text><text x="160" y="132" text-anchor="middle" font-size="10" font-weight="800" fill="#0e2850">Кумтор Голд · 2022</text></svg>`},
    {href:'artifact-a11.html',tag:'PPTX · KPI',title:'Операционные и целевые KPI ИТ-блока MERLION',sub:'Система KPI для ~700 сотрудников',mets:[['~700','чел.'],['6','групп'],['SLA','']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><text x="30" y="34" font-size="12" font-weight="800" fill="#0e2850">KPI ИТ · ~700 чел.</text><rect x="30" y="44" width="90" height="22" rx="6" fill="#eef5ff"/><text x="75" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d6fe0">Time2Market</text><rect x="128" y="44" width="90" height="22" rx="6" fill="#eef5ff"/><text x="173" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d6fe0">Непрерывн.</text><rect x="226" y="44" width="64" height="22" rx="6" fill="#eef5ff"/><text x="258" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d6fe0">SLA</text><rect x="30" y="74" width="160" height="22" rx="6" fill="#fdf1dc"/><text x="110" y="90" text-anchor="middle" font-size="10" font-weight="700" fill="#b3741f">Аллокация ФСА</text><rect x="198" y="74" width="92" height="22" rx="6" fill="#fdf1dc"/><text x="244" y="90" text-anchor="middle" font-size="10" font-weight="700" fill="#b3741f">6 групп</text></svg>`},
    {href:'artifact-a14.html',tag:'PPTX · Статус',title:'Статус «Управление ИТ-услугами»',sub:'Срез состояния и целевая модель ITIL 4',mets:[['AS-IS',''],['TO-BE',''],['ITIL 4','']],
     svg:`<svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f2f5f8"/><rect x="30" y="50" width="110" height="50" rx="10" fill="#fbeaea"/><text x="85" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="#c03a3a">AS IS</text><text x="85" y="90" text-anchor="middle" font-size="9" fill="#8c5a5a">хаос</text><line x1="150" y1="75" x2="184" y2="75" stroke="#53637a" stroke-width="3"/><rect x="190" y="50" width="100" height="50" rx="10" fill="#e6f4ec"/><text x="240" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="#1f7a52">TO BE</text><text x="240" y="90" text-anchor="middle" font-size="9" fill="#3f7d63">ITIL 4</text></svg>`}
  ];
  const gridEnd = html.indexOf('<div class="docs-grid">');
  if(gridEnd<0) return html;
  // закрывающий </div> самой сетки — тот, что непосредственно перед </section>
  const secEnd = html.lastIndexOf('</section>');
  const close = secEnd>gridEnd ? html.lastIndexOf('</div>', secEnd) : -1;
  if(close<0 || close<gridEnd) return html;
  const cardsHtml = cards.map(c=>`
      <a class="doc-card" href="${c.href}"  data-nav>
        <div class="doc-head"><span class="doc-tag">${c.tag}</span><span class="doc-arrow">→</span></div>
        <div class="doc-viz">${c.svg}</div>
        <h4>${c.title}</h4>
        <p class="doc-sub">${c.sub}</p>
        <div class="doc-mets">${c.mets.map(m=>`<div><b>${m[0]}</b><span>${m[1]}</span></div>`).join('')}</div>
      </a>`).join('');
  return html.slice(0, close) + cardsHtml + html.slice(close);
}
function injectLogos(body, id){
  // 1) home trust chips -> logo pill (brand tile + wordmark)
  const DISPLAY={accenture:'Accenture',merlion:'MERLION',alrosa:'АЛРОСА',sunlight:'SUNLIGHT',gostech:'ГосТех',psb:'ПСБ-ФИНАНС',sber:'Сбер',srg:'SRG',rvision:'R-Vision'};
  body = body.replace(/<span class="trust-chip(\s+[a-z0-9-]+)?"[^>]*>([^<]*)<\/span>/g, (all,cls,name)=>{
    const t = (name||'').toString()+' '+(cls||'');
    const slug = logoNameByCompany(t);
    if(!slug) return all;
    const display = DISPLAY[slug] || name.trim();
    return `<span class="trust-chip" data-co="${slug}"><span class="tc-logo"><img src="img/logos/${slug}.svg" alt="" width="26" height="26" loading="lazy" decoding="async"></span><span class="tc-name">${display}</span></span>`;
  });
  // 2) case hero -> company logo block
  const slug = LOGO_BY_WORK[id];
  if(slug){
    body = body.replace(/<div class="d-hero([^"]*)">/, (m,cls)=> `<div class="d-hero${cls}"><div class="co-logo-lg" aria-hidden="true"><img src="img/logos/${slug}.svg" alt="" width="72" height="72" loading="eager" decoding="async"></div>`);
  }
  // 3) cases list: career rows and case2 cards get a logo
  const coMap = [
    {re:/<span class="co-dot"><\/span><b>([^<]*)<\/b>/, wrap:true},
  ];
  // career rows
  body = body.replace(/(<div class="career-co"[^>]*>)(<span class="co-dot"><\/span>)(<b>[^<]*<\/b>)/g, (m,a,d,b)=>{
    const name=(b.match(/<b>([^<]*)<\/b>/)||[])[1]||'';
    const slug2=logoNameByCompany(name);
    const logo = slug2 ? `<span class="co-logo-sm"><img src="img/logos/${slug2}.svg" alt="" width="22" height="22" loading="lazy" decoding="async"></span>` : '';
    return a+logo+d+b;
  });
  // case2 cards: swap emoji .ic for logo
  body = body.replace(/<span class="co">\s*<span class="ic">[^<]*<\/span>\s*([^<]+)<\/span>/g, (m,name)=>{
    const slug2=logoNameByCompany(name);
    const logo = slug2 ? `<img class="co-ic-logo" src="img/logos/${slug2}.svg" alt="" width="18" height="18" loading="lazy" decoding="async">` : `<span class="ic">◈</span>`;
    return `<span class="co">${logo}<span>${name.trim()}</span></span>`;
  });
  return body;
}
function injectImpact(body, id){
  // на страницах кейсов — компактная «панель сценариев и эффекта» (SVG), если нет своей графики
  if(id[0]!=='w') return body;
  if(/impact-panel/.test(body)) return body;
  // соберём KPI-значения из d-kpis
  const vals=[];
  for(const m of body.matchAll(/<div class="dk"><b>([\s\S]*?)<\/b><span>([\s\S]*?)<\/span><\/div>/g)){
    vals.push({v:m[1].replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim(),
               l:m[2].replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim()});
  }
  const top=vals.slice(0,4);
  if(top.length<2) return body;
  const cells=top.map((c,i)=>`
    <g transform="translate(${14+(i%4)*118}, ${i<4?8:0})">
      <rect x="0" y="0" width="108" height="56" rx="10" fill="${i===0?'#eef4fb':'#ffffff'}" stroke="#dbe5f0"/>
      <text x="12" y="24" font-size="17" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">${c.v||'—'}</text>
      <text x="12" y="42" font-size="9.5" fill="#5f6e82" font-family="Inter,system-ui,sans-serif">${c.l||''}</text>
    </g>`).join('');
  const panel=`<div class="impact-panel" aria-label="Ключевые показатели и эффект">
<svg viewBox="0 0 500 72" role="img">${cells}</svg>
</div>`;
  // вставляем сразу после .d-kpis
  const idx=body.indexOf('</div>', body.indexOf('<div class="d-kpis">'));
  if(idx<0) return body;
  body=body.slice(0,idx)+'\n'+panel+'\n'+body.slice(idx);
  return body;
}
function injectSvgPreview(html, id, h1){
  // Only for artifact detail pages without a real image preview
  if(!/^a\d+$/.test(id)) return html;
  if(id==='a8') return html; // atlas is the preview itself
  if(/<img|<svg|slide-embed|d-shot|zoomable/.test(html)) return html;
  if(/class="art-pre"/.test(html)) return html;
  const title = (h1||'Документ').slice(0, 48);
  const kindTxt = 'Документ / схема / модель';
  const svg = `<div class="art-pre" aria-hidden="true">
<svg viewBox="0 0 480 320" role="img" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="lgh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d6fe0"/><stop offset="1" stop-color="#0e9bbf"/></linearGradient>
    <linearGradient id="lgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4fb"/><stop offset="1" stop-color="#f8fbfe"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="480" height="320" rx="18" fill="url(#lgb)"/>
  <path d="M0 66 L480 66 L480 320 L0 320 Z" fill="#ffffff" opacity="0"/>
  <rect x="0" y="0" width="480" height="66" rx="18" fill="url(#lgh)"/>
  <rect x="0" y="48" width="480" height="18" fill="url(#lgh)"/>
  <g fill="#ffffff" opacity=".9">
    <circle cx="26" cy="33" r="7"/>
    <circle cx="50" cy="33" r="7"/>
    <circle cx="74" cy="33" r="7"/>
  </g>
  <text x="454" y="44" font-size="13" font-weight="800" fill="#ffffff" text-anchor="end" font-family="Inter,system-ui,sans-serif">АРТЕФАКТ</text>
  <text x="22" y="108" font-size="18" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">${(h1||'Документ').slice(0,44).replace(/&/g,'&amp;')}</text>
  <text x="22" y="132" font-size="11.5" fill="#5f6e82" font-family="Inter,system-ui,sans-serif">${kindTxt} · из практики цифровой трансформации</text>
  <rect x="22" y="152" width="436" height="44" rx="10" fill="#ffffff" stroke="#e2eaf3"/>
  <text x="36" y="171" font-size="11" fill="#5f6e82" font-family="Inter,system-ui,sans-serif">Структура</text>
  <rect x="36" y="179" width="120" height="7" rx="3.5" fill="#c9d9ea"/>
  <rect x="36" y="192" width="180" height="7" rx="3.5" fill="#dbe5f0"/>
  <text x="300" y="180" font-size="11" font-weight="800" fill="#1d6fe0" font-family="Inter,system-ui,sans-serif">читаемый · структурированный</text>
  <rect x="22" y="204" width="436" height="44" rx="10" fill="#ffffff" stroke="#e2eaf3"/>
  <text x="36" y="223" font-size="11" fill="#5f6e82" font-family="Inter,system-ui,sans-serif">Факты и цифры</text>
  <rect x="36" y="231" width="96" height="7" rx="3.5" fill="#0e9bbf"/>
  <text x="150" y="235" font-size="11" font-weight="700" fill="#0e7490" font-family="Inter,system-ui,sans-serif">проверяемо · из утверждённых моделей</text>
  <rect x="22" y="256" width="436" height="40" rx="10" fill="#eef4fb"/>
  <circle cx="42" cy="276" r="6" fill="#1d6fe0"/>
  <text x="56" y="281" font-size="12" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">Готово к проекту: берите как шаблон для своей задачи</text>
</svg></div>`;
  // place right after the breadcrumb nav (or top of wrap)
  const crumb = html.match(/<nav aria-label="breadcrumb"[\s\S]*?<\/nav>|<\/div>\s*<div class="d-hero">/);
  if(crumb){ html = html.replace(crumb[0], crumb[0]+'\n    '+svg); }
  else { html = html.replace(/<div class="wrap">/, '<div class="wrap">\n    '+svg); }
  return html;
}
function addAnalytics(html, id){
  if(id==='contact'){
    // форма обратной связи (без перезагрузки): Formspree-плейсхолдер + mailto-fallback
    const form=`<div class="contact-form-wrap">
      <h2>Обсудить задачу</h2>
      <p class="cf-sub">Пришлю гипотезу с расчётом ROI в течение 48 часов.</p>
      <form id="cf" class="contact-form" data-cf-endpoint="https://formspree.io/f/XXXXXXX" novalidate>
        <div class="cf-row"><label for="cf-name">Имя</label><input id="cf-name" name="name" type="text" required autocomplete="name"></div>
        <div class="cf-row"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required autocomplete="email"></div>
        <div class="cf-row"><label for="cf-msg">Задача</label><textarea id="cf-msg" name="message" rows="5" required></textarea></div>
        <button type="submit" class="btn p" data-track="contact-form">Отправить →</button>
        <p class="cf-note">Форма отправляется без перезагрузки. Если что-то не работает — напишите в <a href="https://t.me/Alechev" target="_blank" rel="noopener noreferrer">Telegram</a> или на <a href="mailto:chev.alex@mail.ru">почту</a>.</p>
      </form>
      <p class="cf-status" id="cf-status" hidden></p>
    </div>`;
    const pos=html.indexOf('<div class="contact reveal">');
    if(pos>=0){ html=html.slice(0,pos)+form+'\n'+html.slice(pos); }
    // кнопка «Скачать резюме PDF» (печатная версия)
    if(!/resume-dl/.test(html)){
      const dl=`<p class="resume-dl"><button type="button" class="btn p" data-action="resume-print">Скачать резюме (PDF) ⬇️</button></p>`;
      const anchor='<div class="contact reveal">';
      html=html.replace(anchor, dl+'\n    '+anchor);
    }
  }
    // insert data-track INSIDE the opening tag (before closing '>')
    function tag(sel, hrefRe, track){
      const re=new RegExp('(<a class="'+sel+'" href="'+hrefRe+'"[^>]*)(>)');
      return function(m,a,b){ return a+' data-track="'+track+'"'+b; };
    }
    html = html.replace(new RegExp('(<a class="btn p" href="https:\\/\\/t\\.me\\/Alechev"[^>]*)(>)'), '$1 data-track="contact-tg"$2');
    html = html.replace(new RegExp('(<a class="btn gh" href="mailto:chev\\.alex@mail\\.ru"[^>]*)(>)'), '$1 data-track="contact-email"$2');
    html = html.replace(new RegExp('(<a class="btn gh" href="tel:\\+79150234324"[^>]*)(>)'), '$1 data-track="contact-phone"$2');
    html = html.replace(new RegExp('(<a class="cl" href="https:\\/\\/t\\.me\\/Alechev"[^>]*)(>)'), '$1 data-track="contact-tg"$2');
    html = html.replace(new RegExp('(<a class="cl" href="mailto:chev\\.alex@mail\\.ru"[^>]*)(>)'), '$1 data-track="contact-email"$2');
    html = html.replace(new RegExp('(<a class="cl" href="tel:\\+79150234324"[^>]*)(>)'), '$1 data-track="contact-phone"$2');
  return html;
}
function injectMetaNote(html,id){
  if(id==='portfolio'){
    // add note under table about 16 из 17
    if(!/16 из 17/.test(html)){
      html = html.replace(/<\/table>/, `</table>\n  <p class="port-note">В таблице 16 проектов из архива; 17-й — текущая роль COO в SRG (2026, в работе), детали — на <a href="case-w17.html" data-nav>странице кейса</a>.</p>`);
    }
  }
  return html;
}

// ---------- build pages ----------
fs.mkdirSync(path.join(OUT,'css'), {recursive:true});
fs.mkdirSync(path.join(OUT,'js'), {recursive:true});
fs.mkdirSync(path.join(OUT,'img','artifacts'), {recursive:true});

const pageIds = Object.keys(PAGES);
const buildList = pageIds.map(id=>fileOf[id]).filter((v,i,a)=>a.indexOf(v)===i);
// decide which id produces which file (for multiple ids -> same file: timeline/roadmap merge)
function buildFile(id){ return fileOf[id]; }

// Build each unique file
const produced = {};
for (const id of pageIds){
  const f = fileOf[id];
  if(produced[f]) {
    // append second content (e.g. roadmap into timeline) inside the same <main>
    const prev = fs.readFileSync(path.join(OUT,f),'utf8');
    let chunk = PAGES[id].replace(/^<div class="page( on)?" id="p-[^"]+">/, '').replace(/<\/div>\s*$/, '');
    chunk = contentRename(chunk); chunk = fixLinks(chunk,id); chunk = toBreadcrumb(chunk,id,'','page'); chunk = base64ToFiles(chunk,id); chunk = injectLogos(chunk,id);
    const merged = prev.replace('</main>', '<div class="page on">'+chunk+'</div>\n</main>');
    fs.writeFileSync(path.join(OUT,f), merged);
    produced[f].push(id);
    continue;
  }
  const out = processPage(id);
  if(out){ fs.writeFileSync(path.join(OUT,f), out); produced[f]=[id]; console.log('built', f); }
}

// Merge roadmap into timeline explicitly if separate
require('fs').writeFileSync(path.join(OUT,'build-manifest.json'), JSON.stringify({produced, pageIds},null,2));
// post-pass: demote any h2 whose text exactly equals the page h1 (e.g. merged timeline sections)
for(const id of pageIds){
  const file=fileOf[id];
  const p=path.join(OUT,file);
  if(!fs.existsSync(p)) continue;
  let h=fs.readFileSync(p,'utf8');
  const h1m=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if(h1m){
    const t=h1m[1];
    const esc=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp('<h2[^>]*>'+esc+'</h2>','g');
    const nh=h.replace(re, '<h3 class="dup-h">'+t+'</h3>');
    if(nh!==h) fs.writeFileSync(p, nh, 'utf8');
  }
}
// Библиотека объединена с Артефактами → archive.html делает редирект на artifacts.html
try{
  fs.writeFileSync(path.join(OUT,'archive.html'), `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=artifacts.html">
<link rel="canonical" href="${DOMAIN}/artifacts.html">
<title>Библиотека · Александр Чевтаев</title></head>
<body style="font-family:system-ui;padding:60px;text-align:center">
<h2>Библиотека объединена с разделом «Артефакты»</h2>
<p><a href="artifacts.html">Перейти к артефактам →</a></p>
<script>location.replace('artifacts.html');</script>
</body></html>`, 'utf8');
}catch(e){}
console.log('DONE pages. produced files:', Object.keys(produced));

// ---- пост-обработка: артефакты ВНУТРИ кейсов (встраиваем превью, не ссылки) ----
(function(){
  function artTitle(n){ const p=path.join(OUT,'artifact-a'+n+'.html'); if(!fs.existsSync(p)) return ''; const h=fs.readFileSync(p,'utf8'); return (h.match(/<h1[^>]*>([^<]*)<\/h1>/)||[])[1]||''; }
  function artVisual(n){ const p=path.join(OUT,'artifact-a'+n+'.html'); if(!fs.existsSync(p)) return null; const h=fs.readFileSync(p,'utf8');
    if(/gostekh-reglament\.svg/.test(h)) return '<img src="img/gostekh-reglament.svg" alt="Схема" width="920" height="500" loading="lazy" decoding="async">';
    if(/incident-ib-orig\.png/.test(h)) return '<img src="img/incident-ib-orig.png" alt="Схема инцидента ИБ" width="2200" height="618" loading="lazy" decoding="async">';
    const m=h.match(/(<div class="art-pre">[\s\S]*?<\/div>)/); if(m) return m[1];
    const s=h.match(/(<svg[\s\S]*?<\/svg>)/); if(s) return s[1];
    return null;
  }
  for(let i=1;i<=17;i++){
    const cf='case-w'+i+'.html', cp=path.join(OUT,cf);
    if(!fs.existsSync(cp)) continue;
    let body=fs.readFileSync(cp,'utf8');
    const arts=[...new Set([...body.matchAll(/artifact-a(\d+)\.html/g)].map(m=>m[1]))];
    if(!arts.length) continue;
    const cards=arts.map(n=>{
      const title=artTitle(n); const vis=artVisual(n);
      const v = vis || '<span class="art-tile-ic">📄</span>';
      var nlink=null;
      if(n==='8') nlink='artifact-a8.html';
      else if(n==='9') nlink='kpi.html';
      const cta = nlink
        ? '<em><a href="'+nlink+'" data-nav>Открыть '+(n==='8'?'ИИ-атлас':'KPI-калькулятор')+' →</a></em>'
        : '<em class="inline-only">встроен в кейс</em>';
      return '<div class="case-art'+(nlink?'':' case-art-static')+'"><div class="case-art-viz">'+v+'</div><div class="case-art-meta"><b>Артефакт</b><span>'+title+'</span>'+cta+'</div></div>';
    }).join('');
    const sec=`<section class="case-artifacts"><div class="sec-h"><span class="sec-n">АРТЕФАКТЫ КЕЙСА</span><h2>Доказательная база</h2></div>
    <div class="case-art-grid">${cards}</div></section>`;
    if(!/case-artifacts/.test(body)){ body=body.replace(/<\/main>/, ()=> '\n  '+sec+'\n</main>'); }
    fs.writeFileSync(cp, body, 'utf8');
  }
  console.log('embedded artifacts into cases');
})();