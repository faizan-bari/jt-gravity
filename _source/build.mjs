// Build "A Black Hole in a Box": src/*.html -> deploy/, with maths rendered by KaTeX at build time.
import fs from 'fs';
import path from 'path';
import katex from 'katex';

const SRC = 'src', OUT = 'deploy';
const SITE = 'https://faizan-bari.github.io/jt-gravity/';
const PROJECT = 'A Black Hole in a Box';
const VERSION = '0.2', DATE = '9 November 2026';
const EMAIL = 'fbarinitsgr@gmail.com';
const ISSUES = 'https://github.com/faizan-bari/jt-gravity/issues';

const PAGES = [
  {src: 'index.html', title: PROJECT, nav: 'contents',
   desc: 'An interactive introduction to JT gravity: AdS2, its black holes and wormholes, drawn from exact solutions.'},
  {src: 'box.html', title: 'AdS₂ is a box', nav: 'contents',
   desc: 'Step 1: free particles in AdS2 oscillate with the same period whatever their speed, light reaches infinity in finite time, and everything refocuses.'},
  {src: 'black-hole.html', title: 'Where is the black hole?', nav: 'contents',
   desc: 'Step 2: in JT gravity the geometry is always AdS2. The black hole lives in the dilaton and the boundary. Horizons, temperature and infinite redshift.'},
  {src: 'shock.html', title: 'Throw something in', nav: 'contents',
   desc: 'Step 3: a shock wave thrown into a JT black hole leaves the geometry alone but moves the horizon, before it arrives. Negative energy makes the wormhole traversable.'},
  {src: 'wormhole.html', title: 'Two sides, one wormhole', nav: 'contents',
   desc: 'Step 4: the renormalised length of the JT wormhole grows forever, and behaves like a particle bouncing off an exponential wall.'},
  {src: 'conventions.html', title: 'Conventions', nav: 'conventions',
   desc: 'The JT action, boundary conditions, equations of motion and formulas used on these pages, with a conversion table to Harlow and Jafferis.'},
  {src: 'changes.html', title: 'Changes and corrections', nav: 'changes',
   desc: 'Version history and corrections log for A Black Hole in a Box.'},
];

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=IBM+Plex+Mono:wght@400;500' +
  '&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">\n';

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Cpath d='M6 3V29M26 3V29' stroke='%2316202A' stroke-width='2.2'/%3E" +
  "%3Cpath d='M16 29C24 20 24 12 16 3' stroke='%232B5D51' stroke-width='2.4' fill='none'/%3E" +
  "%3Ccircle cx='21.9' cy='16' r='3' fill='%23A33F28'/%3E%3C/svg%3E";

const THEME_HEAD = "<script>try{var t=localStorage.getItem('theme');" +
  "if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>\n";

const THEME_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
  '<path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>';

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Typographic apostrophes in text nodes, outside maths.
function smart(html) {
  return html.replace(/>[^<>]+</g, m => m.replace(/(?<=[A-Za-z])'(?=[A-Za-z])/g, '’'));
}

const MATH = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
function renderMath(body, file) {
  // Protect maths, smarten the rest, then render.
  const parts = [];
  let out = body.replace(MATH, (m, d, i) => { parts.push({tex: d ?? i, display: d !== undefined}); return `\u0000${parts.length - 1}\u0000`; });
  out = smart(out);
  return out.replace(/\u0000(\d+)\u0000/g, (m, n) => {
    const {tex, display} = parts[+n];
    const t = tex.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    try { return katex.renderToString(t, {displayMode: display, throwOnError: true, strict: 'ignore'}); }
    catch (e) { throw new Error(`${file}: ${e.message}\n  in: ${tex}`); }
  });
}

function nav(active) {
  const items = [['Contents', 'index.html', 'contents'], ['Conventions', 'conventions.html', 'conventions'], ['Changes', 'changes.html', 'changes']];
  return items.map(([label, href, key]) =>
    `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n    ');
}

function page(p) {
  const src = fs.readFileSync(path.join(SRC, p.src), 'utf8');
  const [bodyRaw, js = ''] = src.split('<!--JS-->');
  const hasMath = MATH.test(bodyRaw); MATH.lastIndex = 0;
  const body = renderMath(bodyRaw.replace('<!--BODY-->', '').trim(), p.src);
  const isHome = p.src === 'index.html';
  const fullTitle = isHome ? `${PROJECT}: an interactive introduction to JT gravity` : `${p.title} · ${PROJECT}`;
  const url = SITE + (isHome ? '' : p.src);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="author" content="Faizan Bari">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="${PROJECT}">
<meta property="og:title" content="${esc(isHome ? PROJECT : p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A Black Hole in a Box: the AdS2 strip with oscillating particles and a black hole's horizons.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}og-image.png">
<meta name="theme-color" content="#F3F5F2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F151B" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${FAVICON}">
${THEME_HEAD}${FONTS}${hasMath ? '<link rel="stylesheet" href="assets/katex/katex.min.css">\n' : ''}<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="wrap top">
  <a class="brand" href="index.html">${PROJECT}</a>
  <nav class="nav" aria-label="Main">
    ${nav(p.nav)}
    <button class="theme-btn" id="theme-btn" type="button" aria-label="Switch theme">${THEME_ICON}</button>
  </nav>
</header>
<main id="main" class="wrap">
${body}
</main>
<footer class="wrap foot">
  <p>Version ${VERSION} · ${DATE}. Made by <a href="https://faizan-bari.github.io/">Faizan Bari</a>.</p>
  <p>Found an error? Email <a href="mailto:${EMAIL}">${EMAIL}</a> or <a href="${ISSUES}">open an issue</a>. Every correction is logged on the <a href="changes.html">changes page</a>.</p>
</footer>
<script src="assets/site.js"></script>
${js.trim() ? `<script>\n${js.trim()}\n</script>\n` : ''}</body>
</html>
`;
}

fs.rmSync(OUT, {recursive: true, force: true});
fs.mkdirSync(path.join(OUT, 'assets/katex/fonts'), {recursive: true});
for (const p of PAGES) fs.writeFileSync(path.join(OUT, p.src), page(p));
fs.copyFileSync(path.join(SRC, 'site.css'), path.join(OUT, 'assets/site.css'));
fs.copyFileSync(path.join(SRC, 'site.js'), path.join(OUT, 'assets/site.js'));
fs.copyFileSync(path.join(SRC, 'README.md'), path.join(OUT, 'README.md'));
const KD = 'node_modules/katex/dist';
fs.copyFileSync(path.join(KD, 'katex.min.css'), path.join(OUT, 'assets/katex/katex.min.css'));
for (const f of fs.readdirSync(path.join(KD, 'fonts')).filter(f => f.endsWith('.woff2')))
  fs.copyFileSync(path.join(KD, 'fonts', f), path.join(OUT, 'assets/katex/fonts', f));
fs.copyFileSync('node_modules/katex/LICENSE', path.join(OUT, 'assets/katex/LICENSE'));
if (fs.existsSync('og-image.png')) fs.copyFileSync('og-image.png', path.join(OUT, 'og-image.png'));
console.log('built', fs.readdirSync(OUT).join(', '));

// Fragment of the contents page for a Claude artifact preview (only when ARTIFACT=1 is set).
if (process.env.ARTIFACT) {
  const full = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  const head = full.split('<head>')[1].split('</head>')[0]
    .replace(/<meta charset="utf-8">\n|<meta name="viewport"[^>]*>\n/g, '')
    .replace(/<title>[^<]*<\/title>/, '<title>A Black Hole in a Box</title>\n<meta name="claude:viewport-fit-sides" content="cover">');
  const bodyInner = full.split('<body>')[1].split('</body>')[0];
  fs.writeFileSync('../jt_site.html', head.trim() + '\n' + bodyInner.trim() + '\n');
}
