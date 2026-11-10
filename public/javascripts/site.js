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

    // Hero: the Chernov mark, in pieces.
    // MARK is the logo traced from the 512px icon: 16 right-angled pieces
    // (an inner ring of 4, an outer ring of 12) in units of the mark's radius.
    // At rest the pieces drift loose across the hero. Hover the right side
    // (or tap, on touch) and they swing in and lock into the mark; while it
    // holds, each ring turns half a turn now and then. The mark is
    // near-identical after a half turn, so it always locks back into itself.
    var MARK = [
        [[-.061,-.997],[.296,-.997],[.296,-.775],[.526,-.775],[.526,-.651],[.169,-.651],[.169,-.876],[-.061,-.876]],
        [[-.291,-.955],[-.169,-.955],[-.169,-.725],[.064,-.725],[.064,-.362],[-.061,-.362],[-.061,-.601],[-.291,-.601]],
        [[.423,-.542],[.653,-.542],[.653,-.775],[.778,-.775],[.778,-.415],[.545,-.415],[.545,-.188],[.423,-.188]],
        [[-.78,-.775],[-.418,-.775],[-.418,-.5],[-.188,-.5],[-.188,-.378],[-.545,-.378],[-.545,-.651],[-.78,-.651]],
        [[-.997,-.286],[-.765,-.286],[-.765,-.524],[-.638,-.524],[-.638,-.169],[-.876,-.169],[-.876,.064],[-.997,.064]],
        [[-.061,-.286],[.169,-.286],[.169,-.524],[.296,-.524],[.296,-.156],[.064,-.156],[.064,0],[-.061,0]],
        [[-.524,-.286],[-.156,-.286],[-.156,0],[-.278,0],[-.278,-.169],[-.524,-.169]],
        [[.368,-.069],[.653,-.069],[.653,-.286],[.96,-.286],[.96,-.169],[.778,-.169],[.778,.064],[.368,.064]],
        [[.653,.174],[.881,.174],[.881,-.069],[1.003,-.069],[1.003,.296],[.778,.296],[.778,.524],[.653,.524]],
        [[-.955,.174],[-.765,.174],[-.765,-.053],[-.362,-.053],[-.362,.064],[-.638,.064],[-.638,.296],[-.955,.296]],
        [[.169,0],[.283,0],[.283,.161],[.526,.161],[.526,.283],[.169,.283]],
        [[-.291,.119],[.064,.119],[.064,.241],[-.169,.241],[-.169,.524],[-.291,.524]],
        [[-.765,.421],[-.545,.421],[-.545,.193],[-.418,.193],[-.418,.542],[-.648,.542],[-.648,.78],[-.765,.78]],
        [[-.061,.37],[.064,.37],[.064,.606],[.296,.606],[.296,.96],[.169,.96],[.169,.73],[-.061,.73]],
        [[.193,.37],[.545,.37],[.545,.651],[.778,.651],[.778,.78],[.423,.78],[.423,.5],[.193,.5]],
        [[-.524,.651],[-.169,.651],[-.169,.881],[.064,.881],[.064,1.003],[-.291,1.003],[-.291,.78],[-.524,.78]]
    ];

    var canvas = document.querySelector('.field');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentNode;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var TAU = Math.PI * 2, QUARTER = Math.PI / 2;
    var W, H, narrow, raf, fill;
    var mark = { x: 0, y: 0, r: 0, alpha: 1, loose: 0.3, ox: 0, oy: 0 };
    var pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var hover = false, tapped = false, intro = !reduced;
    var g = reduced ? 1 : 0, clock = 0, start = performance.now(), last = start;

    // A seeded random, so the loose layout is the same on every visit.
    function seeded(a) {
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Each piece keeps its centroid and its outline relative to it.
    var rnd = seeded(11);
    var pieces = MARK.map(function (p, i) {
        var A = 0, cx = 0, cy = 0;
        for (var j = 0; j < p.length; j++) {
            var a = p[j], b = p[(j + 1) % p.length], c = a[0] * b[1] - b[0] * a[1];
            A += c; cx += (a[0] + b[0]) * c; cy += (a[1] + b[1]) * c;
        }
        cx /= 3 * A; cy /= 3 * A;
        return {
            cx: cx, cy: cy,
            pts: p.map(function (q) { return [q[0] - cx, q[1] - cy]; }),
            inner: Math.sqrt(cx * cx + cy * cy) < 0.5,
            order: (Math.atan2(cy, cx) + Math.PI) / TAU,          // 0..1 around the circle
            turn: [-1, 1, 2, -1, 1][i % 5] * QUARTER,            // how it lies when loose
            scale: 0.72 + rnd() * 0.3,
            phase: rnd() * TAU, freq: 0.18 + rnd() * 0.16,
            arc: rnd() < 0.5 ? -1 : 1,
            sx: 0, sy: 0
        };
    });

    function clamp(x) { return Math.min(1, Math.max(0, x)); }
    function ease(x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    function layout() {
        var r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        narrow = W < 1080;
        var inner = document.querySelector('.hero-inner');
        var ir = inner ? inner.getBoundingClientRect() : r;
        if (!narrow) {
            mark.r = Math.min(W * 0.19, ir.height * 0.4, 290);
            mark.x = W * 0.76;
            mark.y = ir.top - r.top + ir.height * 0.5;
            mark.alpha = 1; mark.loose = 0.42;
        } else {
            // On narrow screens the mark sits behind the headline, quietly.
            mark.r = Math.min(W * 0.34, 170);
            mark.x = W - mark.r * 0.7;
            mark.y = mark.r + 64;
            mark.alpha = 0.3; mark.loose = 0.2;
        }
        fill = ctx.createLinearGradient(mark.x - mark.r, mark.y - mark.r, mark.x + mark.r, mark.y + mark.r);
        fill.addColorStop(0, '#467370'); fill.addColorStop(0.55, '#7FB9B5'); fill.addColorStop(1, '#A6E0DA');

        // Loose places: spread out (best of a few random candidates), leaning
        // right on wide screens where the vignette opens.
        var spots = [], pick = seeded(23);
        var x0 = narrow ? W * 0.04 : W * 0.06, x1 = W * 0.97;
        var y0 = narrow ? 80 : H * 0.12, y1 = narrow ? H * 0.94 : H * 0.84;
        for (var i = 0; i < pieces.length; i++) {
            var best = null, bestD = -1;
            for (var k = 0; k < 24; k++) {
                var c = [x0 + (x1 - x0) * Math.pow(pick(), narrow ? 1 : 0.7), y0 + (y1 - y0) * pick()];
                var d = Infinity;
                for (var j = 0; j < spots.length; j++) d = Math.min(d, Math.hypot(c[0] - spots[j][0], (c[1] - spots[j][1]) * 1.3));
                if (d > bestD) { bestD = d; best = c; }
            }
            spots.push(best);
        }
        // Hand the places out by angle around the mark, so the pieces fly
        // apart outwards rather than across each other.
        function around(x, y) { return (Math.atan2(y, x) + TAU) % TAU; }
        spots.sort(function (a, b) { return around(a[0] - mark.x, a[1] - mark.y) - around(b[0] - mark.x, b[1] - mark.y); });
        var byAngle = pieces.slice().sort(function (a, b) { return around(a.cx, a.cy) - around(b.cx, b.cy); });
        byAngle.forEach(function (p, i) { p.sx = spots[i][0]; p.sy = spots[i][1]; });
    }

    // While assembled, each ring turns every 6.5s. While turning, the outer
    // ring opens and the inner ring tucks in, so the pieces pass cleanly,
    // like a lock releasing and closing again.
    var FIRST = 2.4, PERIOD = 6.5, TURN = 2.1;
    function ringTurns(c) {
        if (c < FIRST) return { inner: 0, outer: 0, innerR: 1, outerR: 1 };
        var n = Math.floor((c - FIRST) / PERIOD), u = c - FIRST - n * PERIOD;
        var pi = clamp(u / 1.4), po = clamp((u - 0.35) / 1.6);
        var open = Math.sin(Math.PI * clamp(u / TURN));
        return {
            inner: (n + ease(pi)) * Math.PI,
            outer: -(n + ease(po)) * Math.PI,
            innerR: 1 - 0.22 * open,
            outerR: 1 + 0.14 * open
        };
    }
    function turning(c) { return c >= FIRST && (c - FIRST) % PERIOD < TURN; }

    function frame(now) {
        var t = (now - start) / 1000, dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        // The first visit shows the mark once, then lets it go.
        if (intro && t > 4.8) intro = false;
        var target = reduced || hover || tapped || (intro && t > 0.7) ? 1 : 0;
        g += Math.max(-dt / 1.6, Math.min(dt / 1.3, target - g));
        if ((g >= 1 && target) || turning(clock)) clock += dt;

        pointer.x += (pointer.tx - pointer.x) * 0.15;
        pointer.y += (pointer.ty - pointer.y) * 0.15;
        ctx.clearRect(0, 0, W, H);

        // a slight drift toward the pointer, so the mark feels held, not printed
        var tx = pointer.x > -9000 ? (pointer.x - mark.x) * 0.02 : 0, ty = pointer.y > -9000 ? (pointer.y - mark.y) * 0.02 : 0;
        mark.ox += (tx - mark.ox) * 0.06; mark.oy += (ty - mark.oy) * 0.06;
        var mx = mark.x + mark.ox, my = mark.y + mark.oy, r = mark.r;

        var whole = ease(g), fadeIn = reduced ? 1 : ease(t / 0.8);
        if (whole > 0) {
            var halo = ctx.createRadialGradient(mx, my, r * 0.2, mx, my, r * 1.6);
            halo.addColorStop(0, 'rgba(100,161,157,' + (0.16 * mark.alpha * whole) + ')');
            halo.addColorStop(1, 'rgba(100,161,157,0)');
            ctx.fillStyle = halo;
            ctx.fillRect(mx - r * 1.6, my - r * 1.6, r * 3.2, r * 3.2);
        }

        var turns = ringTurns(clock);
        ctx.lineWidth = 1.25;
        ctx.lineJoin = 'miter';
        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            // pieces arrive one after another around the circle
            var e = ease(g * 1.6 - p.order * 0.6);
            var ring = p.inner ? turns.inner : turns.outer, spread = p.inner ? turns.innerR : turns.outerR;
            var cr = Math.cos(ring), sr = Math.sin(ring);
            var hx = mx + (p.cx * cr - p.cy * sr) * r * spread, hy = my + (p.cx * sr + p.cy * cr) * r * spread;

            // loose: a slow float, and a little room made for the pointer
            var lx = p.sx + Math.sin(t * p.freq + p.phase) * 14, ly = p.sy + Math.cos(t * p.freq * 0.8 + p.phase) * 10;
            var dx = lx - pointer.x, dy = ly - pointer.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 200) { var push = Math.pow(1 - d / 200, 2) * 26; lx += dx / d * push; ly += dy / d * push; }

            // travel on a gentle arc, not a straight line
            var vx = hx - lx, vy = hy - ly, bow = Math.sin(Math.PI * e) * 0.16 * p.arc;
            var px = lx + vx * e - vy * bow, py = ly + vy * e + vx * bow;
            var spin = ring + (p.turn + Math.sin(t * p.freq * 0.7 + p.phase) * 0.18) * (1 - e);
            var size = r * (p.scale + (1 - p.scale) * e);
            // loose pieces fade under the headline, brighter to the right
            var loose = mark.loose * (narrow ? 1 : 0.35 + 0.65 * clamp(lx / W));
            var c = Math.cos(spin) * size, s = Math.sin(spin) * size;

            ctx.beginPath();
            for (var j = 0; j < p.pts.length; j++) {
                var q = p.pts[j], x = px + q[0] * c - q[1] * s, y = py + q[0] * s + q[1] * c;
                if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
            ctx.closePath();
            if (e > 0) {
                ctx.globalAlpha = fadeIn * mark.alpha * e;
                ctx.fillStyle = fill;
                ctx.fill();
            }
            if (e < 1) {
                // loose pieces read as outlines with a breath of fill: a blueprint of the mark
                ctx.globalAlpha = fadeIn * loose * 0.35 * (1 - e);
                ctx.fillStyle = '#64A19D';
                ctx.fill();
                ctx.globalAlpha = fadeIn * Math.min(1, loose * 1.5) * (1 - e);
                ctx.strokeStyle = '#7FB9B5';
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
        if (!reduced) raf = requestAnimationFrame(frame);
    }

    layout();
    var resizeT;
    window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { layout(); if (reduced) frame(performance.now()); }, 120);
    });
    hero.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = canvas.getBoundingClientRect();
        pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top;
        if (pointer.x < -9000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
        // the right side of the hero is where the mark lives
        hover = pointer.tx > W * 0.5;
        if (hover) intro = false;
    });
    hero.addEventListener('pointerleave', function () {
        hover = false;
        pointer.tx = pointer.ty = -9999; pointer.x = pointer.y = -9999;
    });
    // On touch, a tap on the hero (not on a link) brings the mark together or apart.
    var lastPointer = 'mouse';
    hero.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; });
    hero.addEventListener('click', function (e) {
        if (lastPointer === 'mouse' || e.target.closest('a, button')) return;
        tapped = !(tapped || (intro && g > 0.5));
        intro = false;
    });

    if ('IntersectionObserver' in window && !reduced) {
        new IntersectionObserver(function (e) {
            cancelAnimationFrame(raf);
            if (e[0].isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); }
        }).observe(canvas);
    } else {
        raf = requestAnimationFrame(frame);
    }
})();
