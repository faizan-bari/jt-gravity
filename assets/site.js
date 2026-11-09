/* A Black Hole in a Box — shared script: theme switch and small drawing helpers. */
(function(){
  var root = document.documentElement, btn = document.getElementById('theme-btn');
  if (!btn) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function current(){
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function label(){
    var text = current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    btn.setAttribute('aria-label', text); btn.title = text;
  }
  btn.addEventListener('click', function(){
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', label);
  label();
})();

var JT = (function(){
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent){
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, cls, attrs){
    var t = el('text', {x: x, y: y, 'class': cls || 'lab'}, parent);
    if (attrs) for (var k in attrs) t.setAttribute(k, attrs[k]);
    t.textContent = str; return t;
  }
  function pts(a){ return a.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function fmt(x, d){ var s = x.toFixed(d); return (/^-0(\.0+)?$/.test(s) ? s.slice(1) : s).replace('-', '−'); }
  function svgPoint(svg, evt){
    var p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {el: el, text: text, pts: pts, fmt: fmt, svgPoint: svgPoint, reduce: reduce};
})();

/* Marching-squares contours of fn(x, y) on a grid. Returns one SVG path string per level.
   Cells with a non-finite corner are skipped, so fn can return NaN to mask a region. */
JT.contours = function(fn, o){
  var nx = o.nx, ny = o.ny, v = [], i, j;
  for (i = 0; i <= nx; i++){ v.push([]); for (j = 0; j <= ny; j++) v[i].push(fn(o.x0 + (o.x1 - o.x0) * i / nx, o.y0 + (o.y1 - o.y0) * j / ny)); }
  function px(i, j){ return o.X(o.x0 + (o.x1 - o.x0) * i / nx); }
  function py(i, j){ return o.Y(o.y0 + (o.y1 - o.y0) * j / ny); }
  return o.levels.map(function(L){
    var d = [];
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++){
      var c = [v[i][j], v[i + 1][j], v[i + 1][j + 1], v[i][j + 1]];
      if (!(isFinite(c[0]) && isFinite(c[1]) && isFinite(c[2]) && isFinite(c[3]))) continue;
      var corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], hits = [];
      for (var k = 0; k < 4; k++){
        var a = c[k], b = c[(k + 1) % 4];
        if ((a > L) !== (b > L)){
          var f = (L - a) / (b - a), p0 = corners[k], p1 = corners[(k + 1) % 4];
          var gi = p0[0] + f * (p1[0] - p0[0]), gj = p0[1] + f * (p1[1] - p0[1]);
          hits.push([o.X(o.x0 + (o.x1 - o.x0) * gi / nx), o.Y(o.y0 + (o.y1 - o.y0) * gj / ny)]);
        }
      }
      for (var h = 0; h + 1 < hits.length; h += 2)
        d.push('M' + hits[h][0].toFixed(1) + ' ' + hits[h][1].toFixed(1) + 'L' + hits[h + 1][0].toFixed(1) + ' ' + hits[h + 1][1].toFixed(1));
    }
    return d.join('');
  });
};
/* Sutherland–Hodgman: clip polygon pts ([[x, y], ...]) to the half-plane inside(p) >= 0, edge solved linearly. */
JT.clip = function(pts, g){
  var out = [];
  for (var k = 0; k < pts.length; k++){
    var a = pts[k], b = pts[(k + 1) % pts.length], ga = g(a), gb = g(b);
    if (ga >= 0) out.push(a);
    if ((ga >= 0) !== (gb >= 0)){ var t = ga / (ga - gb); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
  }
  return out;
};
