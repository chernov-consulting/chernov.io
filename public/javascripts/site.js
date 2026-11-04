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

    // Hero field: a grid of short bars, like the strokes of the Chernov mark.
    // A slow flow field turns them; they lean toward right angles, and the
    // pointer pulls nearby bars into a bright ring.
    var canvas = document.querySelector('.field');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, step, cols, rows, raf;
    var pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var HALF_PI = Math.PI / 2;

    function size() {
        var r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        step = W < 700 ? 24 : 30;
        cols = Math.ceil(W / step) + 1;
        rows = Math.ceil(H / step) + 1;
    }

    function flow(x, y, t) {
        return Math.sin(x * 0.0035 + t * 0.18) * 1.6 +
               Math.cos(y * 0.0042 - t * 0.14) * 1.3 +
               Math.sin((x + y) * 0.0021 + t * 0.09) * 1.1;
    }

    // Bars are batched into a few paths, one stroke each: far bars by column
    // (their brightness only depends on x), near bars by how close they are.
    var COLS = 10, RINGS = 8;
    var farStyle = [], nearStyle = [], nearWidth = [];
    for (var b = 0; b < COLS; b++) farStyle.push('rgba(100,161,157,' + (0.08 + 0.22 * (b + 0.5) / COLS).toFixed(3) + ')');
    for (var k = 0; k < RINGS; k++) {
        var n = (k + 1) / RINGS;
        nearStyle.push('rgba(166,224,218,' + Math.min(1, 0.2 + n * 0.75).toFixed(3) + ')');
        nearWidth.push(2 + n * 1.2);
    }

    function frame(now) {
        var t = now / 1000;
        pointer.x += (pointer.tx - pointer.x) * 0.12;
        pointer.y += (pointer.ty - pointer.y) * 0.12;
        ctx.clearRect(0, 0, W, H);
        ctx.lineCap = 'round';
        var len = step * 0.42;
        var far = [], near = [], b, k;
        for (b = 0; b < COLS; b++) far.push(new Path2D());
        for (k = 0; k < RINGS; k++) near.push(new Path2D());
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
                var x = i * step + (j % 2 ? step / 2 : 0);
                var y = j * step;
                var a = flow(x, y, t);
                var snap = Math.round(a / HALF_PI) * HALF_PI;
                a = a + (snap - a) * 0.72;
                var dx = x - pointer.x, dy = y - pointer.y;
                var p = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 220);
                if (p > 0) a = a + (Math.atan2(dy, dx) + HALF_PI - a) * p * 0.9;
                var l = len * (1 + p * 0.6);
                var cx = Math.cos(a) * l, cy = Math.sin(a) * l;
                // brighter to the right, where the vignette opens
                var path = p > 0.05 ? near[Math.min(RINGS - 1, Math.floor(p * RINGS))] : far[Math.min(COLS - 1, Math.floor(x / W * COLS))];
                path.moveTo(x - cx, y - cy);
                path.lineTo(x + cx, y + cy);
            }
        }
        ctx.lineWidth = 2;
        for (b = 0; b < COLS; b++) { ctx.strokeStyle = farStyle[b]; ctx.stroke(far[b]); }
        for (k = 0; k < RINGS; k++) { ctx.strokeStyle = nearStyle[k]; ctx.lineWidth = nearWidth[k]; ctx.stroke(near[k]); }
        if (!reduced) raf = requestAnimationFrame(frame);
    }

    size();
    window.addEventListener('resize', size);
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
