/* mcad ユーザーマニュアルの動き（外部のライブラリは使わない）: 目次の引き出し、全文検索、検索語の強調。
   索引 assets/search_index.js（window.MANUAL_INDEX）は tools/build_manual.py が作る。 */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---- 目次（幅が狭いときは引き出し） ---- */
  var toc = doc.getElementById('toc');
  var box = toc ? toc.querySelector('.toc-box') : null;
  var toggle = doc.querySelector('.toc-toggle');
  var narrow = window.matchMedia('(max-width: 900px)');
  if (box) { box.open = true; }
  function closeToc() {
    doc.body.classList.remove('toc-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      doc.body.classList.add('toc-anim');
      var open = doc.body.classList.toggle('toc-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (narrow.addEventListener) {
    narrow.addEventListener('change', function () { if (!narrow.matches) { closeToc(); } });
  }
  if (toc) {
    toc.addEventListener('click', function (ev) {
      if (narrow.matches && ev.target.closest && ev.target.closest('a')) { closeToc(); }
    });
    var cur = toc.querySelector('.current');
    if (cur && cur.scrollIntoView) { cur.scrollIntoView({ block: 'nearest' }); }
  }

  /* ---- 全文検索（日本語は語に区切らず、空白で区切った語がすべて含まれる節を探す） ---- */
  var input = doc.getElementById('q');
  var panel = doc.getElementById('search-results');
  var index = (window.MANUAL_INDEX && window.MANUAL_INDEX.entries) || [];
  var cache = null;
  var active = -1;

  function norm(s) { return String(s).normalize('NFKC').toLowerCase(); }
  function terms(q) { return norm(q).split(/\s+/).filter(function (t) { return t.length > 0; }); }
  /* 本文は正規化した文字列と、正規化した位置 → 元の文字の位置の表を持つ（正規化で長さが変わっても、元の文字で抜粋する） */
  function mapped(text) {
    var out = [], map = [], i = 0;
    while (i < text.length) {
      var ch = String.fromCodePoint(text.codePointAt(i));
      var n = ch.normalize('NFKC').toLowerCase();
      for (var k = 0; k < n.length; k++) { out.push(n.charAt(k)); map.push(i); }
      i += ch.length;
    }
    return { s: out.join(''), map: map };
  }
  function build() {
    cache = index.map(function (e) {
      var m = mapped(e[3]);
      return { url: e[0], page: e[1], title: e[2], text: e[3], nt: norm(e[2]), np: norm(e[1]), nx: m.s, map: m.map };
    });
  }
  function count(hay, t) {
    var n = 0, i = hay.indexOf(t);
    while (i >= 0 && n < 20) { n++; i = hay.indexOf(t, i + t.length); }
    return n;
  }
  function search(q) {
    var ts = terms(q);
    if (!ts.length) { return []; }
    if (!cache) { build(); }
    var out = [];
    cache.forEach(function (e) {
      var score = 0;
      for (var k = 0; k < ts.length; k++) {
        var t = ts[k];
        var inTitle = count(e.nt, t), inPage = count(e.np, t), inText = count(e.nx, t);
        if (!inTitle && !inPage && !inText) { return; }
        score += inTitle * 30 + inPage * 4 + Math.min(inText, 8);
      }
      out.push({ e: e, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 40).map(function (x) { return x.e; });
  }
  /* text の中の ts（正規化済みの語）の位置を強調して parent に足す。text を正規化しても長さが同じときだけ強調する（見出し用） */
  function highlight(parent, text, ts) {
    var low = norm(text);
    if (low.length !== text.length) { parent.appendChild(doc.createTextNode(text)); return; }
    var pos = 0;
    while (pos < text.length) {
      var best = -1, len = 0;
      for (var k = 0; k < ts.length; k++) {
        var i = low.indexOf(ts[k], pos);
        if (i >= 0 && (best < 0 || i < best)) { best = i; len = ts[k].length; }
      }
      if (best < 0) { break; }
      if (best > pos) { parent.appendChild(doc.createTextNode(text.slice(pos, best))); }
      var m = doc.createElement('mark');
      m.textContent = text.slice(best, best + len);
      parent.appendChild(m);
      pos = best + len;
    }
    if (pos < text.length) { parent.appendChild(doc.createTextNode(text.slice(pos))); }
  }
  /* 本文の抜粋（最初の語の前後）を元の文字で作り、語を強調する */
  function snippet(parent, e, ts) {
    var at = -1;
    for (var k = 0; k < ts.length && at < 0; k++) { at = e.nx.indexOf(ts[k]); }
    var from = Math.max(0, at < 0 ? 0 : at - 40), to = Math.min(e.nx.length, from + 140);
    var o0 = e.map[from] || 0, o1 = to < e.map.length ? e.map[to] : e.text.length;
    var hits = [];
    ts.forEach(function (t) {
      var i = e.nx.indexOf(t, from);
      while (i >= 0 && i < to) { hits.push([e.map[i], i + t.length < e.map.length ? e.map[i + t.length] : e.text.length]); i = e.nx.indexOf(t, i + t.length); }
    });
    hits.sort(function (a, b) { return a[0] - b[0]; });
    var pos = o0;
    if (from > 0) { parent.appendChild(doc.createTextNode('…')); }
    hits.forEach(function (h) {
      if (h[0] < pos) { return; }
      if (h[0] > pos) { parent.appendChild(doc.createTextNode(e.text.slice(pos, h[0]))); }
      var mk = doc.createElement('mark');
      mk.textContent = e.text.slice(h[0], h[1]);
      parent.appendChild(mk);
      pos = h[1];
    });
    if (pos < o1) { parent.appendChild(doc.createTextNode(e.text.slice(pos, o1))); }
  }
  function hrefOf(e, q) {
    var parts = e.url.split('#');
    return parts[0] + '?q=' + encodeURIComponent(q) + (parts[1] ? '#' + parts[1] : '');
  }
  function render(q) {
    var hits = search(q), ts = terms(q);
    panel.textContent = '';
    active = -1;
    if (!ts.length) { panel.hidden = true; return; }
    var head = doc.createElement('p');
    head.className = 'count';
    head.textContent = hits.length ? hits.length + ' 件' + (hits.length >= 40 ? '（上位 40 件）' : '') : '見つかりません';
    panel.appendChild(head);
    hits.forEach(function (e) {
      var a = doc.createElement('a');
      a.className = 'hit';
      a.href = hrefOf(e, q);
      var t = doc.createElement('span');
      t.className = 'hit-title';
      highlight(t, e.title || e.page, ts);
      var p = doc.createElement('span');
      p.className = 'hit-page';
      p.textContent = e.title ? e.page : '';
      var x = doc.createElement('span');
      x.className = 'hit-text';
      snippet(x, e, ts);
      a.appendChild(t); a.appendChild(p); a.appendChild(x);
      panel.appendChild(a);
    });
    panel.hidden = false;
  }
  function move(delta) {
    var items = panel.querySelectorAll('a.hit');
    if (!items.length) { return; }
    if (active >= 0) { items[active].classList.remove('active'); }
    active = (active + delta + items.length) % items.length;
    items[active].classList.add('active');
    items[active].scrollIntoView({ block: 'nearest' });
  }
  if (input && panel) {
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () { if (input.value) { render(input.value); } });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); move(1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(-1); }
      else if (ev.key === 'Enter') {
        var items = panel.querySelectorAll('a.hit');
        var pick = active >= 0 ? items[active] : items[0];
        if (pick) { window.location.href = pick.href; }
      } else if (ev.key === 'Escape') { input.value = ''; panel.hidden = true; input.blur(); }
    });
    doc.addEventListener('click', function (ev) {
      if (!panel.hidden && ev.target !== input && !panel.contains(ev.target)) { panel.hidden = true; }
    });
    doc.addEventListener('keydown', function (ev) {
      var tag = (ev.target && ev.target.tagName) || '';
      if (ev.key === '/' && !ev.ctrlKey && !ev.altKey && !ev.metaKey && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        ev.preventDefault(); input.focus(); input.select();
      }
    });
  }

  /* ---- 検索から開いたページ: 検索語を強調する（?q=…） ---- */
  var m = /[?&]q=([^&#]*)/.exec(window.location.search);
  var main = doc.getElementById('main');
  if (m && main && doc.createTreeWalker) {
    var qs = decodeURIComponent(m[1].replace(/\+/g, ' ')).split(/\s+/).filter(Boolean);
    if (qs.length) {
      var esc = qs.map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
      var re = new RegExp(esc, 'gi');
      var walker = doc.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
      var nodes = [], n;
      while ((n = walker.nextNode())) {
        var pt = n.parentNode && n.parentNode.nodeName;
        if (pt !== 'SCRIPT' && pt !== 'STYLE' && re.test(n.nodeValue)) { nodes.push(n); }
        re.lastIndex = 0;
      }
      nodes.slice(0, 400).forEach(function (tn) {
        var frag = doc.createDocumentFragment(), s = tn.nodeValue, last = 0, mm;
        re.lastIndex = 0;
        while ((mm = re.exec(s))) {
          if (mm.index > last) { frag.appendChild(doc.createTextNode(s.slice(last, mm.index))); }
          var mk = doc.createElement('mark');
          mk.textContent = mm[0];
          frag.appendChild(mk);
          last = mm.index + mm[0].length;
          if (mm[0].length === 0) { re.lastIndex++; }
        }
        if (last < s.length) { frag.appendChild(doc.createTextNode(s.slice(last))); }
        tn.parentNode.replaceChild(frag, tn);
      });
    }
  }
})();
