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
