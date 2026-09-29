const fs = require('fs');

const css = fs.readFileSync(process.argv[2], 'utf8');

// ---------- 1. Statement tokenizer (top-level) ----------
function tokenize(css){
  const stmts = []; // {type:'rule'|'media', sel, body, prec, raw}
  let i = 0, n = css.length;
  // strip comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  while(i < n){
    const ch = css[i];
    if(/[\s\n\r\t]/.test(ch)){ i++; continue; }
    // @media...{ }
    if(ch === '@'){
      const brace = css.indexOf('{', i);
      const cl = css.indexOf('}', brace);
      // find matching close
      let depth=1, j=brace+1;
      while(j < n && depth>0){
        if(css[j]==='{')depth++;
        else if(css[j]==='}')depth--;
        j++;
      }
      const mediaBlock = css.slice(i, j);
      // inner statements
      const inner = mediaBlock.slice(mediaBlock.indexOf('{')+1, -1);
      const msel = mediaBlock.slice(0, mediaBlock.indexOf('{'));
      stmts.push({type:'media', sel:msel.trim(), body:parseInner(inner), prec:i});
      i = j;
      continue;
    }
    // rule selectors{...}
    let j = i, depth=0, found=false, k=i;
    while(k < n){
      if(css[k] === '{'){ if(depth===0){ found=true; break; } depth--; }
      else if(css[k] === '}'){ depth++; }
      k++;
    }
    if(!found){ i++; continue; }
    const sel = css.slice(i, k).trim();
    const brace = k;
    depth=1; j=brace+1;
    while(j < n && depth>0){
      if(css[j]==='{')depth++;
      else if(css[j]==='}')depth--;
      j++;
    }
    const body = css.slice(brace+1, j-1);
    stmts.push({type:'rule', sel, body, prec:i});
    i = j;
  }
  return stmts;
}
function parseInner(inner){
  // return array of {sel, body}
  const out=[]; let a=0;
  while(a < inner.length){
    while(a<inner.length && (/\s/.test(inner[a])||inner[a]===';')) a++;
    if(a>=inner.length) break;
    let br=inner.indexOf('{',a);
    if(br<0) break;
    let depth=1, e=br+1;
    while(e<inner.length&&depth>0){ if(inner[e]==='{')depth++; else if(inner[e]==='}')depth--; e++; }
    out.push({sel:inner.slice(a,br).trim(), body:inner.slice(br+1,e-1).trim()});
    a=e;
  }
  return out;
}

// ---------- 2. Split PREMIUM block ----------
// Find the PREMIUM comment start and the following adaptive section.
const preStart = css.indexOf('PREMIUM DESIGN SYSTEM');
let head = css, tail = '';
if(preStart>=0){
  // the comment begins with /* =====... ; find it
  const cStart = css.lastIndexOf('/*', preStart);
  const adapt = css.indexOf('/* === ');
  // find the adaptive header AFTER premium
  const markers = ['АДАПТИВНОСТЬ','АДАПТ','adaptive'];
  let adaptIdx = -1;
  for(const mk of markers){ const t = css.indexOf(mk, preStart); if(t>0){ adaptIdx=t; break; } }
  const adaptHeader = adaptIdx>=0 ? css.lastIndexOf('/*', adaptIdx) : -1;
  if(adaptHeader>0){
    // save premium :root tokens
    const premBlock = css.slice(cStart, adaptHeader);
    const root = premBlock.match(/:root\s*\{([^}]*)\}/);
    const premTokens = root ? root[1].trim() : '';
    head = css.slice(0, cStart);
    tail = css.slice(adaptHeader);
    global.__premiumTokens = premTokens;
  }
}
let body = head + tail;

// ---------- 3. Tokenize merged body ----------
const stmts = tokenize(body);

// ---------- 4. Dedup plain rules keep LAST; merge :root ----------
const kept = new Set();
const rulesAcc = [];
const rootAcc = [];
for(const s of stmts){
  if(s.type==='rule'){
    if(s.sel===':root'){ rootAcc.push(s.body); }
    else { rulesAcc.push(s); }
  }
}
// dedupe by selector keep last
const bySel = new Map();
for(const r of rulesAcc){ bySel.set(r.sel, r); }
// root merged: base first, then premium tokens appended
let rootBody = rootAcc.join(';') + ';' + (global.__premiumTokens||'');
// merge premium tokens if they define same name -> later wins (premium at end)
function mergeRoot(body){
  // split into prop:value
  const props={}; const order=[];
  for(const part of body.split(';')){
    const pp = part.trim(); if(!pp) continue;
    const m = pp.match(/^([\w-]+)\s*:\s*(.+)$/);
    if(m){ let name=m[1].trim(); const val=m[2].trim(); if(!name.startsWith('--')) name='--'+name; if(!(name in props))order.push(name); props[name]=val; }
  }
  return order.map(n=>`  ${n}:${props[n]};`).join('\n');
}
const finalRoot = mergeRoot(rootBody);

// ---------- 5. Bucketing ----------
const COMPONENTS = /^(\.top|\.[a-zA-Z]*burger|\.brand|\.nav|\.cta|\.btn|\.chip|\.trust|\.case|\.ex|\.doc-|\.art|\.kpi3|\.problem|\.pf-item|\.pf-l|\.pf-s|\.pf-v|\.how-|\.career|\.box|\.d-|\.linkrow|\.mini-metric|\.callout|\.calc|\.oval|\.inp|\.kpi-calc|\.kpi-note|\.kpi-mini|\.kpi-teaser|\.tlm|\.tl-|\.contact|\.cl\b|\.cta-actions|\.work-|\.portfolio|\.port-|\.cf-|\.filter|\.foot|#lb|\.lb-|\.exec-summary|\.case-note|\.port-note|\.zoom|\.arc-|\.slide-|\.stack|\.grp|\.rgantt|\.gl\b|\.gr\b|\.bar|\.tp-|\.tl-hint|\.tlShow|\.toTop|#toTop|#progress|\.doc-viz|\.live-|\.d-tag|\.no-js)/;

function bucketOf(sel){
  if(/^(a|abbr|address|article|aside|b|blockquote|body|button|code|dd|details|div|dl|dt|em|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hr|html|img|input|label|legend|li|main|nav|ol|p|pre|section|select|small|span|strong|summary|table|tbody|td|textarea|th|thead|tr|ul|svg|iframe|picture|source|sup)([^a-zA-Z]|$)/.test(sel)) return 'page';
  if(COMPONENTS.test(sel)) return 'component';
  if(/^:root$/.test(sel)) return 'root';
  return 'page';
}

const baseSel = /^(html|body|\*|\:root|h1|h2|h3|h4|h5|h6)([^a-zA-Z-]|$)|\.wrap\b|\.skip-link|::selection|\.reveal|b,strong|\.page\b|\.sec-h|\.sec-n\b|\.k\b|\.k\b\./;
const mediaBuckets = { components:[], pages:[], base:[], print:[] };
const ruleBuckets = { components:[], pages:[], base:[] };

function classifyPlain(sel, body){
  if(/^\*$/.test(sel)||/^html/.test(sel)||/^body/.test(sel)||/^:root/.test(sel)) return 'base';
  if(baseSel.test(sel)) return 'base';
  if(bucketOf(sel)==='component') return 'components';
  return 'pages';
}

for(const r of bySel.values()){
  const b = classifyPlain(r.sel, r.body);
  ruleBuckets[b].push(`${r.sel}{${r.body}}`);
}

// media queries
for(const s of stmts){
  if(s.type!=='media') continue;
  const msel = s.sel; // e.g. @media(max-width:980px) or @media print or @media (hover:none)
  if(/print/.test(msel)){
    for(const inner of s.body) mediaBuckets.print.push(`@media print{${inner.sel}{${inner.body}}}`);
    continue;
  }
  if(/prefers-color-scheme/.test(msel)){
    // whole dark block to base (as-is, one block)
    mediaBuckets.base.push(`@media ${msel.replace(/^@media\s*/,'')}{\n${s.body.map(x=>`  ${x.sel}{${x.body}}`).join('\n')}\n}`);
    continue;
  }
  if(/prefers-reduced-motion/.test(msel)){
    mediaBuckets.base.push(`@media ${msel.replace(/^@media\s*/,'')}{\n${s.body.map(x=>`  ${x.sel}{${x.body}}`).join('\n')}\n}`);
    continue;
  }
  if(/hover:/.test(msel)||/pointer:/.test(msel)){
    mediaBuckets.components.push(`@media ${msel.replace(/^@media\s*/,'')}{\n${s.body.map(x=>`  ${x.sel}{${x.body}}`).join('\n')}\n}`);
    continue;
  }
  // breakpoint
  mediaBuckets.pages.push(`@media ${msel.replace(/^@media\s*/,'')}{\n${s.body.map(x=>`  ${x.sel}{${x.body}}`).join('\n')}\n}`);
}

// sort media blocks by ascending breakpoint number
function sortMedia(blocks){
  return blocks.sort((a,b)=>{
    const na=(a.match(/max-width:\s*(\d+)/)||[])[1];
    const nb=(b.match(/max-width:\s*(\d+)/)||[])[1];
    const va = na?parseInt(na): (a.indexOf('max-width')>=0? 99999: 0);
    const vb = nb?parseInt(nb): (b.indexOf('max-width')>=0? 99999: 0);
    return va-vb;
  });
}

// ---------- 6. Assemble files ----------
const BASE_HEADER = `/* MultiTool portfolio — base.css
   reset, custom properties, typography, layout, accessibility, theme */
:root{
${finalRoot}
}
`;
const RESET = ruleBuckets.base.join('\n')+'\n';
const DARK = mediaBuckets.base.join('\n')+'\n';
const PRINT_EXTRA = `/* print.css — hide app chrome, print the content */
@media print{
  .top,.burger,.no-js-c,.skip-link,#toTop,#progressBar,.callout,.cta,.nav,.btn.gh,.career-row,.foot-print{
    display:none !important;
  }
  header.top{display:none}
  body{background:#fff;color:#000}
  .wrap{max-width:100%}
  a{color:#000}
  .hero{background:#fff !important;color:#000 !important;border-radius:0}
  .hero h1,.hero-name,.hero .lead,.hero .k{color:#000 !important}
  .hero-photo,.fpill{display:none}
  .page.on,.page{display:block !important}
  img,svg{max-width:100%}
  .d-hero,.d-card,.box{border:1px solid #ccc;border-radius:8px;box-shadow:none !important}
}
`;

fs.writeFileSync(process.argv[3]+'/base.css', BASE_HEADER+RESET+'\n'+mediaBuckets.base.join('\n')+'\n');

const comp = ruleBuckets.components.join('\n')+'\n'+sortMedia(mediaBuckets.components).join('\n')+'\n';
fs.writeFileSync(process.argv[3]+'/components.css', `/* components.css — buttons, cards, tables, forms, nav, chips */\n`+comp);

const pages = ruleBuckets.pages.join('\n')+'\n'+sortMedia(mediaBuckets.pages).join('\n')+'\n';
fs.writeFileSync(process.argv[3]+'/pages.css', `/* pages.css — page-specific styles + responsive breakpoints */\n`+pages);
// типографика (в pages.css — подключается последним, перекрывает base/components)
fs.appendFileSync(process.argv[3]+'/pages.css', `
/* ===== типографика: аккуратный TOP-вид (overrides) ===== */
.hero h1{font-size:clamp(28px,3.3vw,44px)!important;line-height:1.12;letter-spacing:-.03em;margin-bottom:14px}
.hero-name{font-size:clamp(26px,3vw,40px)!important;line-height:1.1}
.hero .lead{font-size:15.5px!important;line-height:1.55;max-width:700px}
.hero{padding:clamp(24px,4vh,44px) 0 clamp(24px,3.6vh,40px)!important}
.kpi3 .v{line-height:1.05}
@media(max-width:640px){
  .hero h1{font-size:30px!important}
  .hero-name{font-size:26px!important}
  .hero .lead{font-size:15px!important}
}
/* вертикальный таймлайн */
/* вертикальный таймлайн (страница «Путь») */
.tlmini{display:block;position:relative;margin:24px 0 8px;padding-left:8px}
.tlmini::before{content:"";position:absolute;left:12px;top:6px;bottom:6px;width:3px;border-radius:3px;background:linear-gradient(180deg,var(--blue),var(--teal),var(--gold))}
.tlmini .tlm{position:relative;display:block;margin:0 0 14px 34px;padding:16px 18px;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:var(--shadow-sm);transition:.18s}
.tlmini .tlm:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:rgba(29,111,224,.35)}
.tlmini .tlm::before{content:"";position:absolute;left:-32px;top:20px;width:14px;height:14px;border-radius:50%;background:var(--blue);border:3px solid #fff;box-shadow:0 0 0 3px rgba(29,111,224,.2)}
.tlmini .tlm .yr{display:inline-block;font-family:var(--mono);font-size:12px;font-weight:800;color:var(--blue);margin-bottom:6px}
.tlmini .tlm b{color:var(--navy);font-family:var(--head)}
.tlmini .tlm .po{display:block;color:var(--muted);font-size:11px;margin:2px 0 6px}
.tlmini .tlm p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
@media(max-width:640px){.tlmini .tlm{margin-left:28px}.tlmini .tlm::before{left:-28px}}
footer .foot-inner div span{display:block!important;margin-top:4px!important}
`);

const printRules = mediaBuckets.print.join('\n');
fs.writeFileSync(process.argv[3]+'/print.css', PRINT_EXTRA + (printRules? '\n/* original print overrides */\n'+printRules : ''));

// ---- WCAG AA contrast darkening: light --dim (#6b7a91 -> #5f6f87, 5.11:1 on white) ----
const basePath = process.argv[3]+'/base.css';
let baseFile = fs.readFileSync(basePath,'utf8');
baseFile = baseFile.replace('#6b7a91','#5f6f87');
fs.writeFileSync(basePath, baseFile);

// ---- Additions (build) appended to components ----
const ADDITIONS = `
/* ===== Additions (build) ===== */
/* системный шрифтовый стек вместо внешнего Google Fonts: мгновенно, без запросов, кириллица встроена */
:root{
  --head:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:ui-monospace,"Cascadia Mono","SF Mono",Consolas,Menlo,monospace;
  /* дизайн-система: явные токены */
  --primary:#1d6fe0;--accent:#f5a623;--surface:#1a2a44;--bg-deep:#0f1e34;--text-on:#e8eef7;
  --blue:var(--primary);
}
body{font-family:var(--sans)}
.nav a[aria-current="page"]{color:var(--navy);background:#eef3f9;font-weight:800}
#toTop{position:fixed;right:22px;bottom:24px;z-index:900;width:46px;height:46px;border:0;border-radius:50%;background:linear-gradient(135deg,#1d6fe0,#0e9bbf);color:#fff;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 10px 26px rgba(29,111,224,.4);transition:opacity .2s,transform .2s}
#toTop[hidden]{display:none}
#toTop:hover{transform:translateY(-2px)}
#progressBar{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#1d6fe0,#0e9bbf);width:0;z-index:950;transition:width .1s linear}
footer{border-top:1px solid var(--line);padding:30px 0 18px;color:var(--dim);font-size:12px;text-align:center;line-height:1.9}
footer .foot-inner{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
footer .foot-inner strong{color:var(--navy);font-family:var(--head);font-size:13px}
footer .foot-inner div strong{display:block}
footer .foot-inner div span{display:block;margin-top:3px;color:var(--muted);font-size:11px}
footer .foot-inner span{color:var(--muted)}
footer .foot-links a{color:var(--blue);font-weight:800}
footer .foot-print{display:block;margin-top:10px;color:var(--muted)}
/* фильтр по типу эффекта в кейсах */
.eff-filter{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:4px 0 14px}
.eff-label{font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.eff-chip{border:1px solid var(--line);background:#fff;color:var(--muted);font-size:12.5px;font-weight:700;padding:7px 13px;border-radius:999px;cursor:pointer;transition:.15s}
.eff-chip:hover{border-color:var(--blue);color:var(--blue)}
.eff-chip.active{background:var(--blue);border-color:var(--blue);color:#fff}
/* stack: пример с результатом */
.grp-ex{margin:10px 0 0;font-size:12px;line-height:1.5;color:var(--muted);border-top:1px dashed var(--line);padding-top:8px}
.grp-ex b{color:var(--navy)}
.grp{height:100%}
/* артефакты внутри кейса — инлайн-контент (без ссылок) */
.case-artifacts{padding:26px 0 4px}
.case-art-stack{display:grid;gap:22px;margin-top:12px}
.case-art-artifact{margin:0;padding:0;border:1px solid var(--line);border-radius:16px;background:var(--card);box-shadow:var(--shadow-sm);overflow:hidden}
.case-art-artifact figcaption{padding:14px 18px;border-bottom:1px solid var(--line);background:#f8fafc}
.case-art-artifact figcaption span{display:block;font-size:10.5px;font-weight:800;color:var(--blue);letter-spacing:.05em;text-transform:uppercase}
.case-art-artifact figcaption b{font-size:16px;font-weight:900;color:var(--navy);font-family:var(--head);letter-spacing:-.01em}
.case-art-content{padding:16px 18px}
.case-art-content img{display:block;width:100%;height:auto;border-radius:10px}
.case-art-content svg{display:block;width:100%;height:auto}
.case-art-content .art-pre{margin:0;border:0;box-shadow:none}
.case-art-content .art-pre svg{width:100%;height:auto}
.case-art-ph{display:flex;flex-direction:column;align-items:center;gap:10px;justify-content:center;padding:40px 20px;border:1px dashed var(--line);border-radius:12px;text-align:center;color:var(--muted);font-weight:700}
/* резюме: кнопка печати */
.resume-dl{margin:0 0 16px}
.resume-dl button{width:100%;justify-content:center}
@media print{.resume-dl,.kpi-export{display:none}}
/* kpi: кнопка экспорта расчёта */
.kpi-export{margin:0 0 16px}
@media print{.kpi-export{display:none}}
.theme-toggle{width:40px;height:40px;margin-left:4px;border:0;border-radius:10px;background:#eef3f9;color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:17px}
.theme-toggle:hover{background:#dfe8f3}
/* принудительно тёмная тема, когда включён переключатель */
html[data-theme="dark"]{
  --bg:#0f1826;--card:#16233a;--ink:#e8eef7;--muted:#9db0c6;--dim:#7d90a8;
  --line:#24334d;--navy:#dbe7f5;
  --shadow:0 10px 32px rgba(0,0,0,.35);--shadow-sm:0 2px 10px rgba(0,0,0,.35);--shadow-md:0 8px 30px rgba(0,0,0,.4);
}
html[data-theme="dark"] body{background:var(--bg);color:var(--ink)}
html[data-theme="dark"] .top{background:rgba(15,24,38,.9)}
html[data-theme="dark"] .card,html[data-theme="dark"] .d-card,html[data-theme="dark"] .box,html[data-theme="dark"] .case2,html[data-theme="dark"] .doc-card,html[data-theme="dark"] .pf-item,html[data-theme="dark"] .how-card,html[data-theme="dark"] .why-card,html[data-theme="dark"] .career-row,html[data-theme="dark"] .problem-card{background:var(--card);border-color:var(--line)}
html[data-theme="dark"] .theme-toggle{background:#1d2f4a;color:#e8eef7}

.contact-wrap-h2{ } /* reserved */
.contact-wa{margin:0 0 6px}
.contact-wa .btn{width:100%;justify-content:center;margin:0 0 12px}
.contact-form-wrap h2{margin:0 0 4px;font-size:20px;font-weight:900;color:var(--navy);font-family:var(--head)}
.cf-sub{margin:0 0 16px;color:var(--muted);font-size:13px}
.contact-form .cf-row{margin-bottom:14px}
.contact-form label{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px}
.contact-form input,.contact-form textarea{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:10px;font:14px var(--sans);color:var(--ink);background:#fff}
.contact-form input{height:44px}
.contact-form textarea{resize:vertical}
.contact-form input:focus,.contact-form textarea:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(29,111,224,.15)}
.cf-note{font-size:11.5px;color:var(--dim);margin-top:10px}
.cf-note a{color:var(--blue);font-weight:700}
.cf-status{font-size:13px;font-weight:700;margin-top:10px}

/* главная: declutter метрик + «Почему я» */
.pf-more{margin-top:16px;font-weight:800}
.pf-more a{color:var(--blue)}
.why-me{padding:28px 0 8px}
.why-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:8px}
.why-card{padding:20px;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:var(--shadow-sm)}
.why-card b{display:block;font-size:15px;font-weight:900;color:var(--navy);font-family:var(--head);margin-bottom:6px;letter-spacing:-.01em}
.why-card p{margin:0;font-size:13px;line-height:1.55;color:var(--muted)}
@media(max-width:640px){.why-grid{grid-template-columns:1fr}}
/* zoomable lightbox */
#lbOverlay{position:fixed;inset:0;z-index:960;background:rgba(8,15,30,.94);display:none;align-items:center;justify-content:center;cursor:zoom-in}
#lbOverlay.on{display:flex}
#lbStage{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:grab}
#lbStage.lb-grabbing{cursor:grabbing}
#lbOverlay #lbImg{max-width:none;max-height:none;display:block;will-change:transform;-webkit-user-drag:none;border-radius:6px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.6);transform-origin:0 0;transition:transform .05s linear}
#lbClose,#lbZoomIn,#lbZoomOut,#lbReset{position:fixed;z-index:970;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font-size:20px;font-weight:800;cursor:pointer;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
#lbClose{top:18px;right:22px}
#lbZoomIn{bottom:26px;right:118px}
#lbZoomOut{bottom:26px;right:64px}
#lbReset{bottom:26px;right:10px}
#lbClose.on,#lbZoomIn.on,#lbZoomOut.on,#lbReset.on{display:flex}
#lbZoomIn:hover,#lbZoomOut:hover,#lbReset:hover,#lbClose:hover{background:rgba(255,255,255,.3)}
#lbCap{position:fixed;bottom:18px;left:0;right:0;text-align:center;color:#cdd8e6;font-size:13px;z-index:970;display:none;padding:0 20px}
#lbCap.on{display:block}
@media(max-width:640px){#lbZoomIn{bottom:22px;right:104px}#lbZoomOut{bottom:22px;right:56px}#lbReset{bottom:22px;right:8px}}
.port-note{margin-top:12px;font-size:12px;color:var(--muted);padding:10px 14px;border:1px dashed var(--line);border-radius:12px;background:#fbfcfe}
.port-note a{color:var(--blue);font-weight:800}
.art-pre{margin:0 0 18px;padding:0;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden}
.art-pre svg{display:block;width:100%;height:auto}
.gostekh-fig{margin:0 0 20px;padding:0;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);background:#fff}
.gostekh-fig img{display:block;width:100%;height:auto}
.gostekh-fig figcaption{padding:10px 16px;font-size:11.5px;color:var(--muted);border-top:1px solid var(--line);background:#f8fafc}
.gostekh-fig a.fig-zoom{cursor:zoom-in;display:block}
.gostekh-fig a.fig-zoom::after{content:"🔍 нажмите, чтобы увеличить";position:absolute;right:14px;top:12px;background:rgba(9,18,34,.72);color:#fff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:999px;z-index:4}
.gostekh-fig{position:relative}
/* brand & label overflow fixes */
.sec-h h1{font-family:var(--head);font-size:clamp(24px,2.6vw,30px);font-weight:900;letter-spacing:-.025em;margin:0;line-height:1.1}
.brand{min-width:0}
.brand .nm{min-width:0;line-height:1.25}
.brand .nm small{white-space:nowrap}
.about-item span{white-space:nowrap;letter-spacing:.04em}
.kpi3 .l{white-space:nowrap}
.foot-print{display:block;margin-top:10px;color:var(--muted)}
/* company logos & trust bar */
.trust{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.trust-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid rgba(255,255,255,.7);box-shadow:0 6px 18px rgba(14,40,80,.16);white-space:nowrap;flex:none}
.trust-chip .tc-logo{width:28px;height:28px;border-radius:10px;overflow:hidden;flex:none;display:grid;place-items:center}
.trust-chip .tc-logo img{width:100%;height:100%;object-fit:cover;border-radius:10px;display:block}
.trust-chip .tc-name{font-size:12px;font-weight:800;color:#123052;letter-spacing:.2px}
.co-logo{width:20px;height:20px;border-radius:6px;object-fit:contain;display:block}
/* ===== типографика: аккуратный TOP-вид ===== */
.hero h1{font-size:clamp(28px,3.3vw,44px);line-height:1.12;letter-spacing:-.03em;margin-bottom:14px;text-wrap:balance}
.hero-name{font-size:clamp(26px,3vw,40px);line-height:1.1}
.hero .lead{font-size:15.5px;line-height:1.55;max-width:700px}
.hero{padding:clamp(24px,4vh,44px) 0 clamp(24px,3.6vh,40px)}
.kpi3 .v{line-height:1.05}
.sec-h h2{letter-spacing:-.028em}
@media(max-width:640px){
  .hero h1{font-size:30px}
  .hero-name{font-size:26px}
  .hero .lead{font-size:15px}
}
.d-hero{position:relative}
.co-logo-lg{position:absolute;top:16px;right:18px;z-index:3;opacity:.95}
.co-logo-lg img{width:72px;height:72px;border-radius:16px;box-shadow:0 12px 30px rgba(21,42,66,.18);display:block}
.co-logo-sm{flex:none;display:inline-flex}
.co-logo-sm img{width:22px;height:22px;border-radius:6px}
.co-ic-logo{width:18px;height:18px;border-radius:5px;vertical-align:middle;display:inline-block;margin-right:6px}
.case2 .co img.co-ic-logo,.co img.co-ic-logo{width:18px;height:18px;border-radius:5px}
.case-cta-float{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:940;background:linear-gradient(135deg,#1d6fe0,#0e9bbf);color:#fff;font-weight:800;font-size:13.5px;padding:12px 20px;border-radius:999px;box-shadow:0 12px 30px rgba(29,111,224,.45);white-space:nowrap}
.case-cta-float:hover{transform:translateX(-50%) translateY(-2px);color:#fff}
@media(max-width:640px){.case-cta-float{left:16px;right:16px;transform:none;text-align:center}.case-cta-float:hover{transform:translateY(-2px)}}
@media(max-width:640px){
  .co-logo-lg{width:48px;height:48px;top:12px;right:12px}
  .co-logo-lg img{width:48px;height:48px}
}
@media(max-width:480px){
  footer .foot-inner{flex-direction:column;text-align:center}
}
@media print{
  .nav a[aria-current="page"],#toTop,#progressBar,.art-pre,.port-note,.co-logo-lg{display:none !important}
}
`;
fs.appendFileSync(process.argv[3]+'/components.css', ADDITIONS);
console.log('additions + contrast applied');

console.log('base rules:', ruleBuckets.base.length, 'comp:', ruleBuckets.components.length, 'pages:', ruleBuckets.pages.length);
console.log('media base(dark/red):', mediaBuckets.base.length, 'comp:', mediaBuckets.components.length, 'pages(breakpoints):', mediaBuckets.pages.length, 'print:', mediaBuckets.print.length);
console.log('dedup: input', stmts.length, 'rules kept', rulesAcc.length, '->', bySel.size);
console.log('root tokens:', finalRoot.slice(0,150));