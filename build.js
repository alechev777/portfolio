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
  if(id[0]==='w') return `Кейс: ${h1||'работа'} · Чевтаев Александр`;
  if(id[0]==='a') return `Артефакт: ${h1||'документ'} · Чевтаев Александр`;
  return (h1?h1+' · ':'')+'Александр Чевтаев';
}
function descOf(id, pageText){
  const map={
    home:'Чевтаев Александр — директор по цифровой трансформации. 15 лет в ИТ, 11 компаний, 8 отраслей. Эффект 250–400 млн ₽/год по одному проекту, окупаемость от 4 месяцев.',
    cases:'Кейсы и работы Александра Чевтаева: 15 лет по годам и компаниям, результаты в цифрах — эффект до 250–400 млн ₽/год, окупаемость от 4 месяцев.',
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
  if(id[0]==='w') return 'Кейс из практики Александра Чевтаева (директор по цифровой трансформации): задача, что сделано и измеримый результат с цифрами и источниками.';
  if(id[0]==='a') return 'Рабочий артефакт Александра Чевтаева: документ, регламент или модель из реальных проектов цифровой трансформации.';
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
      "url": DOMAIN+"/index.html","image": DOMAIN+"/img/photo.jpg",
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
    {label:'Библиотека', href:'archive.html', id:'archive'},
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
  </button>`;
}
const FOOTER = `<footer>
  <div class="wrap foot-inner">
    <div><strong>Чевтаев Александр</strong><span>Директор по цифровой трансформации</span></div>
    <div class="foot-links">
      <a href="contact.html" data-nav>Контакты</a> ·
      <a href="cases.html" data-nav>Кейсы</a> ·
      <a href="kpi.html" data-nav>KPI-калькулятор</a>
    </div>
    <span>© 2026 · портфель 17+ кейсов и проектов</span>
  </div>
  <span class="foot-print">Сделано в MultiTool · 2026</span>
</footer>
<div id="lbOverlay"><img id="lbImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Увеличенное изображение"></div><button id="lbClose" aria-label="Закрыть увеличенное изображение">✕</button><div id="lbCap"></div>
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
const OG_COVER = `${DOMAIN}/img/og-cover.jpg`;

function headHTML(id, h1, pageText){
  const title = titleOf(id, h1);
  const desc = descOf(id, pageText);
  const file = fileOf[id];
  const canonical = `${DOMAIN}/${file}`;
  const ld = jsonLd(id, h1);
  const ldTag = ld ? `\n<script type="application/ld+json">${JSON.stringify(ld)}</script>` : '';
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
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="${FONT_PRELOAD}" as="font" type="font/woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/pages.css">
<link rel="stylesheet" href="css/print.css" media="print">
<link rel="icon" href="${FAVICON}">
${METRIKA_SCRIPT}${ldTag}
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
  if(id==='a8'){
    html = html.replace(/<iframe id="atlasFrameInline" class="atlas-inline"[^>]*><\/iframe>/, `<iframe src="atlas.html" class="atlas-inline" title="ИИ-атлас бэк-офиса" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`);
    html = html.replace(/<button type="button" class="btn gh"[^>]*>Полный экран<\/button>/, `<a class="btn gh" href="atlas.html" target="_blank" rel="noopener noreferrer" data-track="atlas">Полный экран</a>`);
  }
  if(id==='a9'){
    let n = 0;
    html = html.replace(/<img src="data:image\/jpeg;base64,[A-Za-z0-9+/=]+[^>]*>/g, (full)=>{
      n++;
      const f = n===1 ? 'img/artifacts/kazakhmys-slide-1.webp' : 'img/artifacts/kazakhmys-slide-2.webp';
      const w = n===1 ? '1000':'1400', h = n===1 ? '562':'408';
      const alt = n===1 ? 'Скриншот KPI-модели Казахмыс' : 'Фрагмент KPI-модели · Казахмыс';
      return `<img src="${f}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async">`;
    });
  }
  if(id==='stack'){
    const newSkills = `<div class="stack-cols reveal">
      <div class="grp"><h4>Стратегия и архитектура</h4><div><span class="chip">TOGAF</span><span class="chip">ArchiMate</span><span class="chip">BPMN</span><span class="chip">ITIL 4</span><span class="chip">Целевые модели</span><span class="chip">SLA / OLA / UC</span><span class="chip">PMBOK</span><span class="chip">Agile / Scrum</span><span class="chip">OKR / KPI</span></div></div>
      <div class="grp"><h4>Экономика ИТ</h4><div><span class="chip">ROI</span><span class="chip">TCO</span><span class="chip">Unit Economics</span><span class="chip">CAPEX / OPEX</span><span class="chip">Cost Saving</span><span class="chip">Аллокация затрат</span><span class="chip">ФСА</span></div></div>
      <div class="grp"><h4>Технологии</h4><div><span class="chip">LLM</span><span class="chip">RAG</span><span class="chip">NLP</span><span class="chip">AI-виджеты</span><span class="chip">Jira / Structure</span><span class="chip">ServiceNow</span><span class="chip">ELMA365</span><span class="chip">Optimacros</span><span class="chip">SQL</span><span class="chip">Power BI</span><span class="chip">Confluence</span><span class="chip">ManageEngine</span><span class="chip">1С:ITIL</span><span class="chip">Zabbix</span><span class="chip">REST API / ESB</span><span class="chip">Visiology</span><span class="chip">Camunda</span></div></div>
    </div>`;
    const s = html.indexOf('<div class="stack-cols reveal">');
    const sp = html.indexOf('<div class="stack-cols" style="margin-top:18px">', s);
    if(s>=0 && sp>s){ html = html.slice(0,s) + newSkills + html.slice(sp); }
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
  return html;
}

function processPage(id){
  let chunk = PAGES[id];
  if(!chunk) return null;
  // remove the outer page div wrapper (we control shell)
  chunk = chunk.replace(/^<div class="page( on)?" id="p-[^"]+">/, '').replace(/<\/div>\s*$/, '');
  const h1m = chunk.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1m ? h1m[1].replace(/<[^>]*>/g,'').trim() : '';
  const kind = pageKind(id);
  let body = chunk;
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
function injectSvgPreview(html, id, h1){
  // Only for artifact detail pages without a real image preview
  if(!/^a\d+$/.test(id)) return html;
  if(id==='a8') return html; // atlas is the preview itself
  if(/<img|<svg|slide-embed|d-shot|zoomable/.test(html)) return html;
  if(/class="art-pre"/.test(html)) return html;
  const title = (h1||'Документ').slice(0, 46);
  const svg = `<div class="art-pre" aria-hidden="true">
<svg viewBox="0 0 480 300" role="img" preserveAspectRatio="xMidYMid meet">
  <rect x="0" y="0" width="480" height="300" rx="18" fill="#f2f6fb"/>
  <rect x="0" y="0" width="480" height="66" rx="18" fill="#e3edf8"/>
  <circle cx="30" cy="33" r="9" fill="#c9d9ea"/>
  <circle cx="60" cy="33" r="9" fill="#c9d9ea"/>
  <circle cx="90" cy="33" r="9" fill="#c9d9ea"/>
  <text x="30" y="116" font-size="19" font-weight="800" fill="#123052" font-family="Inter,system-ui,sans-serif">Документ / модель</text>
  <text x="30" y="148" font-size="15" fill="#5f6e82" font-family="Inter,system-ui,sans-serif" style="max-width:400px">${title.replace(/&/g,'&amp;')}</text>
  <rect x="30" y="176" width="420" height="8" rx="4" fill="#c9d9ea"/>
  <rect x="30" y="200" width="380" height="8" rx="4" fill="#dbe5f0"/>
  <rect x="30" y="224" width="404" height="8" rx="4" fill="#dbe5f0"/>
  <rect x="30" y="248" width="300" height="8" rx="4" fill="#dbe5f0"/>
  <path d="M30 278 h360" stroke="#1d6fe0" stroke-width="3" stroke-linecap="round"/>
</svg></div>`;
  // place right after the breadcrumb nav (or top of wrap)
  const crumb = html.match(/<nav aria-label="breadcrumb"[\s\S]*?<\/nav>|<\/div>\s*<div class="d-hero">/);
  if(crumb){ html = html.replace(crumb[0], crumb[0]+'\n    '+svg); }
  else { html = html.replace(/<div class="wrap">/, '<div class="wrap">\n    '+svg); }
  return html;
}
function addAnalytics(html, id){
  if(id==='contact'){
    html = html.replace(/(<a class="btn p" href="https:\/\/t\.me\/Alechev"[^>]*>)/, '$1 data-track="contact-tg"');
    html = html.replace(/(<a class="btn gh" href="mailto:chev\.alex@mail\.ru"[^>]*>)/, '$1 data-track="contact-email"');
    html = html.replace(/(<a class="btn gh" href="tel:\+79150234324"[^>]*>)/, '$1 data-track="contact-phone"');
    html = html.replace(/(<a class="cl" href="https:\/\/t\.me\/Alechev"[^>]*>)/, '$1 data-track="contact-tg"');
    html = html.replace(/(<a class="cl" href="mailto:chev\.alex@mail\.ru"[^>]*>)/, '$1 data-track="contact-email"');
    html = html.replace(/(<a class="cl" href="tel:\+79150234324"[^>]*>)/, '$1 data-track="contact-phone"');
  }
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
    chunk = fixLinks(chunk,id); chunk = toBreadcrumb(chunk,id,'','page'); chunk = base64ToFiles(chunk,id);
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
console.log('DONE pages. produced files:', Object.keys(produced));