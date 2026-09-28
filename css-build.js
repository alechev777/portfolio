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
.nav a[aria-current="page"]{color:var(--navy);background:#eef3f9;font-weight:800}
#toTop{position:fixed;right:22px;bottom:24px;z-index:900;width:46px;height:46px;border:0;border-radius:50%;background:linear-gradient(135deg,#1d6fe0,#0e9bbf);color:#fff;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 10px 26px rgba(29,111,224,.4);transition:opacity .2s,transform .2s}
#toTop[hidden]{display:none}
#toTop:hover{transform:translateY(-2px)}
#progressBar{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#1d6fe0,#0e9bbf);width:0;z-index:950;transition:width .1s linear}
footer{border-top:1px solid var(--line);padding:30px 0 18px;color:var(--dim);font-size:12px;text-align:center;line-height:1.9}
footer .foot-inner{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
footer .foot-inner strong{color:var(--navy);font-family:var(--head);font-size:13px}
footer .foot-inner span{color:var(--muted)}
footer .foot-links a{color:var(--blue);font-weight:800}
footer .foot-print{display:block;margin-top:10px;color:var(--muted)}
.port-note{margin-top:12px;font-size:12px;color:var(--muted);padding:10px 14px;border:1px dashed var(--line);border-radius:12px;background:#fbfcfe}
.port-note a{color:var(--blue);font-weight:800}
.art-pre{margin:0 0 18px;padding:0;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden}
.art-pre svg{display:block;width:100%;height:auto}
/* brand & label overflow fixes */
.brand{min-width:0}
.brand .nm{min-width:0;line-height:1.25}
.brand .nm small{white-space:nowrap}
.about-item span{white-space:nowrap;letter-spacing:.04em}
.kpi3 .l{white-space:nowrap}
.foot-print{display:block;margin-top:10px;color:var(--muted)}
/* company logos */
.trust-chip{display:inline-flex;align-items:center;gap:6px}
.trust-chip .co-logo,.trust-chip img.co-logo{width:20px;height:20px;border-radius:6px;object-fit:contain;display:block}
.d-hero{position:relative}
.co-logo-lg{position:absolute;top:16px;right:18px;z-index:3;opacity:.95}
.co-logo-lg img{width:72px;height:72px;border-radius:16px;box-shadow:0 12px 30px rgba(21,42,66,.18);display:block}
.co-logo-sm{flex:none;display:inline-flex}
.co-logo-sm img{width:22px;height:22px;border-radius:6px}
.co-ic-logo{width:18px;height:18px;border-radius:5px;vertical-align:middle;display:inline-block;margin-right:6px}
.case2 .co img.co-ic-logo,.co img.co-ic-logo{width:18px;height:18px;border-radius:5px}
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