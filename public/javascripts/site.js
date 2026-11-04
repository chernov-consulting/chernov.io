(function () {
    'use strict';
    document.documentElement.classList.remove('no-js');

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    var nav = document.querySelector('.nav');
    function syncNav() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();

    // Reveal on scroll, staggered within a parent.
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                var siblings = Array.prototype.filter.call(e.target.parentNode.children, function (c) { return c.classList.contains('reveal'); });
                e.target.style.setProperty('--d', Math.min(siblings.indexOf(e.target), 6) * 80 + 'ms');
                e.target.classList.add('is-in');
                io.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
        items.forEach(function (el) { io.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add('is-in'); });
    }

    // Mobile menu: a full-screen sheet; closes on a link, Escape, or resize to desktop.
    var root = document.documentElement;
    var toggle = document.querySelector('.nav-toggle');
    var sheet = document.getElementById('nav-sheet');
    function setMenu(open) {
        if (open) sheet.hidden = false;
        requestAnimationFrame(function () { root.classList.toggle('menu-open', open); });
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('.sr').textContent = open ? 'Close menu' : 'Menu';
        // keep focus inside the sheet while it is open
        Array.prototype.forEach.call(document.querySelectorAll('main, footer, .skip'), function (el) { el.inert = open; });
        if (open) setTimeout(function () { var first = sheet.querySelector('a'); if (first) first.focus({ preventScroll: true }); }, 60);
        if (!open) setTimeout(function () { if (!root.classList.contains('menu-open')) sheet.hidden = true; }, 350);
    }
    if (toggle && sheet) {
        toggle.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
        sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
        window.matchMedia('(min-width: 1081px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }

    // Mark the nav link for the section in view.
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    if ('IntersectionObserver' in window && links.length) {
        var byId = {};
        links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                var a = byId[e.target.id];
                if (!a) return;
                if (e.isIntersecting) {
                    links.forEach(function (l) { l.removeAttribute('aria-current'); });
                    a.setAttribute('aria-current', 'true');
                } else if (a.getAttribute('aria-current')) {
                    a.removeAttribute('aria-current');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    }

    // Hero: the Chernov mark, assembled from its own pieces.
    // MARK is the logo traced from the 512px icon: 16 right-angled pieces
    // (an inner ring of 4, an outer ring of 12) in units of the mark's radius.
    // It is near-identical after a half turn, so each ring can turn 180° and
    // lock back into the same mark. Around it, a field of small "step" glyphs,
    // the mark's own stroke, turns a quarter at a time: a wave goes out from
    // the mark each time it turns, and the pointer swings nearby steps into a
    // pinwheel, the way the mark's pieces sit around its centre.
    var MARK = [
        [[-.066,-.997],[.299,-.997],[.299,-.775],[.526,-.775],[.526,-.770],[.532,-.770],[.532,-.653],[.172,-.653],[.172,-.770],[.177,-.770],[.177,-.780],[.172,-.780],[.172,-.876],[-.066,-.876]],
        [[-.288,-.955],[-.167,-.955],[-.167,-.728],[.056,-.728],[.056,-.722],[.061,-.722],[.061,-.362],[-.066,-.362],[-.066,-.601],[-.288,-.601]],
        [[.426,-.542],[.653,-.542],[.653,-.780],[.775,-.780],[.775,-.415],[.548,-.415],[.548,-.188],[.426,-.188]],
        [[-.780,-.770],[-.415,-.770],[-.415,-.500],[-.188,-.500],[-.188,-.378],[-.542,-.378],[-.542,-.648],[-.780,-.648]],
        [[-.997,-.294],[-.765,-.294],[-.765,-.521],[-.759,-.521],[-.759,-.526],[-.638,-.526],[-.638,-.172],[-.876,-.172],[-.876,.071],[-.997,.071]],
        [[-.061,-.071],[-.056,-.071],[-.056,-.278],[.167,-.278],[.167,-.283],[.172,-.283],[.172,-.521],[.294,-.521],[.294,-.156],[.066,-.156],[.066,.003],[-.056,.003],[-.056,-.003],[-.061,-.003]],
        [[-.521,-.288],[-.156,-.288],[-.156,-.003],[-.278,-.003],[-.278,-.167],[-.521,-.167]],
        [[.368,-.066],[.648,-.066],[.648,-.288],[.960,-.288],[.960,-.167],[.775,-.167],[.775,.056],[.770,.056],[.770,.061],[.368,.061]],
        [[.653,.177],[.659,.177],[.659,.172],[.881,.172],[.881,-.066],[1.003,-.066],[1.003,.299],[.780,.299],[.780,.526],[.653,.526]],
        [[-.955,.172],[-.765,.172],[-.765,-.050],[-.759,-.050],[-.759,-.056],[-.362,-.056],[-.362,.066],[-.638,.066],[-.638,.294],[-.955,.294]],
        [[.161,.003],[.283,.003],[.283,.161],[.521,.161],[.521,.283],[.161,.283]],
        [[-.288,.119],[.066,.119],[.066,.241],[-.167,.241],[-.167,.521],[-.288,.521]],
        [[-.770,.421],[-.548,.421],[-.548,.193],[-.421,.193],[-.421,.542],[-.648,.542],[-.648,.786],[-.770,.786]],
        [[-.056,.368],[.066,.368],[.066,.606],[.294,.606],[.294,.960],[.172,.960],[.172,.733],[.167,.733],[.167,.728],[-.056,.728]],
        [[.193,.373],[.542,.373],[.542,.648],[.548,.648],[.548,.653],[.786,.653],[.786,.775],[.421,.775],[.421,.500],[.193,.500]],
        [[-.526,.653],[-.172,.653],[-.172,.881],[.071,.881],[.071,1.003],[-.294,1.003],[-.294,.780],[-.521,.780],[-.521,.775],[-.526,.775]]
    ];

    var canvas = document.querySelector('.field');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var TAU = Math.PI * 2, QUARTER = Math.PI / 2;
    var W, H, unit, fieldAlpha = 1, glyphs = [], raf;
    var mark = { x: 0, y: 0, r: 0, alpha: 1, ox: 0, oy: 0 };
    var pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var start = performance.now();

    // Each piece keeps its centroid and its outline relative to it.
    var pieces = MARK.map(function (p) {
        var A = 0, cx = 0, cy = 0;
        for (var i = 0; i < p.length; i++) {
            var a = p[i], b = p[(i + 1) % p.length], c = a[0] * b[1] - b[0] * a[1];
            A += c; cx += (a[0] + b[0]) * c; cy += (a[1] + b[1]) * c;
        }
        cx /= 3 * A; cy /= 3 * A;
        return {
            cx: cx, cy: cy,
            pts: p.map(function (q) { return [q[0] - cx, q[1] - cy]; }),
            inner: Math.sqrt(cx * cx + cy * cy) < 0.5,
            order: (Math.atan2(cy, cx) + Math.PI) / TAU   // 0..1 around the circle
        };
    });

    // One step of the field: a Z of three strokes, centred, one unit thick.
    var STEP = [[0, 0], [2, 0], [2, 2], [3, 2], [3, 3], [1, 3], [1, 1], [0, 1]].map(function (q) { return [q[0] - 1.5, q[1] - 1.5]; });

    function ease(x) { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function easeOut(x) { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 4); }

    function layout() {
        var r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var inner = document.querySelector('.hero-inner');
        var ir = inner ? inner.getBoundingClientRect() : r;
        if (W >= 1080) {
            mark.r = Math.min(W * 0.19, ir.height * 0.4, 290);
            mark.x = W * 0.76;
            mark.y = ir.top - r.top + ir.height * 0.5;
            mark.alpha = 1;
        } else {
            // On narrow screens the mark sits behind the headline, quietly.
            mark.r = Math.min(W * 0.34, 170);
            mark.x = W - mark.r * 0.7;
            mark.y = mark.r + 64;
            mark.alpha = 0.28;
        }
        // On narrow screens the field sits under the text: sparser and quieter.
        unit = W < 700 ? 3 : 3.6;
        fieldAlpha = W >= 1080 ? 1 : 0.45;
        var gap = unit * (W >= 1080 ? 8 : 11);
        glyphs = [];
        for (var y = gap / 2; y < H; y += gap) {
            for (var x = gap / 2; x < W; x += gap) {
                var dx = x - mark.x, dy = y - mark.y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < mark.r * 1.18) continue;
                var k = Math.floor(Math.random() * 4) * QUARTER;
                glyphs.push({ x: x, y: y, d: d, a: k, target: k, heat: 0, wave: -2 });
            }
        }
    }

    // The mark locks at 1.5s; after that each ring turns every 7s.
    var LOCK = 1.5, FIRST = 3.5, PERIOD = 7, WAVE_SPEED = 560;

    // While turning, the outer ring opens and the inner ring tucks in, so the
    // pieces pass each other cleanly, like a lock releasing and closing again.
    function ringTurns(t) {
        if (t < FIRST) return { inner: 0, outer: 0, innerR: 1, outerR: 1 };
        var n = Math.floor((t - FIRST) / PERIOD), u = t - FIRST - n * PERIOD;
        var pi = Math.min(1, Math.max(0, u / 1.4)), po = Math.min(1, Math.max(0, (u - 0.35) / 1.6));
        var open = Math.sin(Math.PI * Math.min(1, Math.max(0, u / 2.1)));
        return {
            inner: (n + ease(pi)) * Math.PI,
            outer: -(n + ease(po)) * Math.PI,
            innerR: 1 - 0.22 * open,
            outerR: 1 + 0.14 * open
        };
    }
    // Waves go out at the lock, then at the start of every turn.
    function waveAt(t) {
        if (t < LOCK) return null;
        if (t < FIRST) return { id: -1, r: (t - LOCK) * WAVE_SPEED };
        var n = Math.floor((t - FIRST) / PERIOD);
        return { id: n, r: (t - FIRST - n * PERIOD) * WAVE_SPEED };
    }

    var BUCKETS = 10, cool = [], hot = [];
    for (var b = 0; b < BUCKETS; b++) {
        cool.push('rgba(100,161,157,' + (0.06 + 0.3 * b / (BUCKETS - 1)).toFixed(3) + ')');
        hot.push('rgba(166,224,218,' + (0.25 + 0.65 * b / (BUCKETS - 1)).toFixed(3) + ')');
    }

    function drawField(t) {
        var w = reduced ? null : waveAt(t);
        var paths = [], b;
        for (b = 0; b < BUCKETS * 2; b++) paths.push(new Path2D());
        var R = 170, R2 = R * R, s = unit;
        for (var i = 0; i < glyphs.length; i++) {
            var g = glyphs[i];
            if (w && g.wave < w.id && g.d < w.r) { g.wave = w.id; g.target += QUARTER; g.heat = Math.max(g.heat, 0.35); }
            var dx = g.x - pointer.x, dy = g.y - pointer.y, dd = dx * dx + dy * dy;
            if (dd < R2) {
                // tangent to the pointer, on the quarter grid; a Z repeats every half turn
                var q = Math.round((Math.atan2(dy, dx) + QUARTER) / QUARTER) * QUARTER;
                var diff = ((q - g.target) % Math.PI + Math.PI * 1.5) % Math.PI - QUARTER;
                g.target += Math.round(diff / QUARTER) * QUARTER;
                g.heat = Math.max(g.heat, 1 - Math.sqrt(dd) / R);
            }
            g.a += (g.target - g.a) * 0.16;
            g.heat *= 0.97;
            // brighter to the right, where the vignette opens
            var base = (0.15 + 0.85 * (g.x / W)) * fieldAlpha;
            var isHot = g.heat > 0.12;
            var level = isHot ? g.heat : base;
            var path = paths[(isHot ? BUCKETS : 0) + Math.min(BUCKETS - 1, Math.floor(level * BUCKETS))];
            var c = Math.cos(g.a) * s, sn = Math.sin(g.a) * s;
            for (var j = 0; j < STEP.length; j++) {
                var px = g.x + STEP[j][0] * c - STEP[j][1] * sn, py = g.y + STEP[j][0] * sn + STEP[j][1] * c;
                if (j) path.lineTo(px, py); else path.moveTo(px, py);
            }
            path.closePath();
        }
        for (b = 0; b < BUCKETS; b++) { ctx.fillStyle = cool[b]; ctx.fill(paths[b]); }
        for (b = 0; b < BUCKETS; b++) { ctx.fillStyle = hot[b]; ctx.fill(paths[BUCKETS + b]); }
    }

    function drawMark(t) {
        // a slight drift toward the pointer, so the mark feels held, not printed
        var tx = pointer.x > -9000 ? (pointer.x - mark.x) * 0.02 : 0, ty = pointer.y > -9000 ? (pointer.y - mark.y) * 0.02 : 0;
        mark.ox += (tx - mark.ox) * 0.06; mark.oy += (ty - mark.oy) * 0.06;
        var mx = mark.x + mark.ox, my = mark.y + mark.oy, r = mark.r;
        var halo = ctx.createRadialGradient(mx, my, r * 0.2, mx, my, r * 1.6);
        halo.addColorStop(0, 'rgba(100,161,157,' + (0.16 * mark.alpha) + ')');
        halo.addColorStop(1, 'rgba(100,161,157,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(mx - r * 1.6, my - r * 1.6, r * 3.2, r * 3.2);
        var fill = ctx.createLinearGradient(mx - r, my - r, mx + r, my + r);
        fill.addColorStop(0, '#467370'); fill.addColorStop(0.55, '#7FB9B5'); fill.addColorStop(1, '#A6E0DA');
        ctx.fillStyle = fill;
        var turns = ringTurns(t);
        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            var e = easeOut((t - 0.15 - p.order * 0.5 - (p.inner ? 0 : 0.2)) / 1.1);
            if (e <= 0) continue;
            var ring = p.inner ? turns.inner : turns.outer;
            var cr = Math.cos(ring), sr = Math.sin(ring);
            // assemble: each piece swings in from outside and a quarter turn back
            var out = (1 + (1 - e) * 0.6) * (p.inner ? turns.innerR : turns.outerR), spin = ring - (1 - e) * QUARTER;
            var px = mx + (p.cx * cr - p.cy * sr) * r * out, py = my + (p.cx * sr + p.cy * cr) * r * out;
            var c = Math.cos(spin) * r, s = Math.sin(spin) * r;
            ctx.globalAlpha = mark.alpha * e;
            ctx.beginPath();
            for (var j = 0; j < p.pts.length; j++) {
                var q = p.pts[j], x = px + q[0] * c - q[1] * s, y = py + q[0] * s + q[1] * c;
                if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function frame(now) {
        var t = reduced ? FIRST - 0.5 : (now - start) / 1000;
        pointer.x += (pointer.tx - pointer.x) * 0.15;
        pointer.y += (pointer.ty - pointer.y) * 0.15;
        ctx.clearRect(0, 0, W, H);
        drawField(t);
        drawMark(t);
        if (!reduced) raf = requestAnimationFrame(frame);
    }

    layout();
    var resizeT;
    window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { layout(); if (reduced) frame(0); }, 120);
    });
    var hero = canvas.parentNode;
    hero.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top;
        if (pointer.x < -9000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
    });
    hero.addEventListener('pointerleave', function () { pointer.tx = pointer.ty = -9999; pointer.x = pointer.y = -9999; });

    if ('IntersectionObserver' in window && !reduced) {
        new IntersectionObserver(function (e) {
            cancelAnimationFrame(raf);
            if (e[0].isIntersecting) raf = requestAnimationFrame(frame);
        }).observe(canvas);
    } else {
        raf = requestAnimationFrame(frame);
    }
})();
