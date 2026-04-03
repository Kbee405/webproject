document.addEventListener("DOMContentLoaded", function () {

    // ── HERO SLIDESHOW ──
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        slides.forEach(s => s.classList.remove('active'));
        slides[0].classList.add('active');
        setInterval(function () {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ── MEDIA LIBRARY SLIDER ──
    const DURATION = 4000;
    const cards    = Array.from(document.querySelectorAll('.ml-card'));
    const dots     = Array.from(document.querySelectorAll('.ml-dot'));
    const counter  = document.getElementById('mlCounter');
    const fill     = document.getElementById('mlAutoplayFill');
    const wrap     = document.querySelector('.ml-slider-wrap');
    const video    = document.getElementById('mlVideo');
    const mlSlides = document.getElementById('mlSlides');

    if (cards.length && mlSlides) {
        let current   = 0;
        let direction = 1;
        let timer     = null;

        function syncHeight() {
            if (mlSlides && cards[current]) {
                mlSlides.style.height = cards[current].offsetHeight + 'px';
            }
        }

        function pad(n) { return String(n).padStart(2, '0'); }

        function updateCounter() {
            if (counter) counter.textContent = pad(current + 1) + ' / ' + pad(cards.length);
        }

        function goTo(next, dir) {
            if (next === current) return;
            var prev = current;
            current  = next;

            cards[prev].classList.remove('active');
            cards[prev].classList.add(dir > 0 ? 'exit-left' : 'exit-right');

            cards[next].style.transform = dir > 0 ? 'translateX(50px)' : 'translateX(-50px)';
            cards[next].style.opacity   = '0';
            cards[next].style.position  = 'absolute';
            cards[next].offsetHeight;
            cards[next].classList.add('active');
            cards[next].style.transform = '';
            cards[next].style.opacity   = '';
            cards[next].style.position  = '';

            setTimeout(function () {
                cards[prev].classList.remove('exit-left', 'exit-right');
                syncHeight();
            }, 850);

            if (video) {
                if (next === 0) { video.currentTime = 0; video.play(); }
                else { video.pause(); }
            }

            dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
            updateCounter();
        }

        function resetFill() {
            if (!fill) return;
            fill.style.transition = 'none';
            fill.style.width = '0%';
            fill.offsetHeight;
            fill.style.transition = 'width ' + DURATION + 'ms linear';
            fill.style.width = '100%';
        }

        function advance() {
            var next = current + direction;
            if (next >= cards.length)  { direction = -1; next = cards.length - 2; }
            else if (next < 0)         { direction =  1; next = 1; }
            goTo(next, direction);
            resetFill();
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(advance, DURATION);
            resetFill();
        }

        cards[0].classList.add('active');
        updateCounter();
        if (video) video.play();
        syncHeight();
        startAuto();
        window.addEventListener('load', syncHeight);
        window.addEventListener('resize', syncHeight);

        var btnNext = document.getElementById('mlNext');
        if (btnNext) btnNext.addEventListener('click', function () {
            var next = (current + 1) % cards.length;
            direction = 1; goTo(next, 1); startAuto();
        });

        var btnPrev = document.getElementById('mlPrev');
        if (btnPrev) btnPrev.addEventListener('click', function () {
            var next = (current - 1 + cards.length) % cards.length;
            direction = -1; goTo(next, -1); startAuto();
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                var dir = i > current ? 1 : -1;
                direction = dir; goTo(i, dir); startAuto();
            });
        });

        if (wrap) {
            wrap.addEventListener('mouseenter', function () {
                clearInterval(timer);
                if (!fill) return;
                var w  = parseFloat(window.getComputedStyle(fill).width);
                var pw = fill.parentElement.offsetWidth;
                fill.style.transition = 'none';
                fill.style.width = ((w / pw) * 100).toFixed(1) + '%';
            });
            wrap.addEventListener('mouseleave', function () { startAuto(); });
        }
    }

    // ── ML VIDEO: inline play button ──
    const mlPlayBtn = document.getElementById('mlPlayBtn');
    const mlVideo   = document.getElementById('mlVideo');

    if (mlPlayBtn && mlVideo) {
        mlPlayBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            mlVideo.muted    = false;
            mlVideo.loop     = false;
            mlVideo.controls = true;
            mlVideo.play();
            mlPlayBtn.style.display = 'none';
            mlVideo.addEventListener('ended', function () {
                mlVideo.controls = false;
                mlPlayBtn.style.display = 'flex';
            }, { once: true });
        });
    }

    // ── FILM PAGE: media-box → fullscreen ──
    var boxes = document.querySelectorAll('.media-box');
    boxes.forEach(function (box) {
        box.addEventListener('click', function () {
            var src   = box.dataset.src;
            var title = box.dataset.title;
            var desc  = box.dataset.desc;
            if (!src) return;

            var overlay  = document.getElementById('videoOverlay');
            var fsVideo  = document.getElementById('fullscreenVideo');
            var fsSource = document.getElementById('fullscreenSource');
            var fsTitle  = document.getElementById('fullscreenTitle');
            var fsText   = document.getElementById('fullscreenText');

            if (fsTitle) fsTitle.textContent = title || '';
            if (fsText)  fsText.textContent  = desc  || '';
            fsSource.src = src;
            fsVideo.load();
            fsVideo.play();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // ── VIDEO OVERLAY: close on backdrop click ──
    var overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) window.closeVideoFull();
        });
    }

    // ── LANGUAGE TOGGLE ──
    const langWrapper  = document.getElementById('lang-wrapper');
    const langBtn      = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const langLabel    = document.getElementById('lang-label');

    if (langBtn && langWrapper && langDropdown) {

        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = langWrapper.classList.contains('open');
            langWrapper.classList.toggle('open', !isOpen);
            langDropdown.style.display = isOpen ? 'none' : 'flex';
        });

        document.addEventListener('click', function () {
            langWrapper.classList.remove('open');
            langDropdown.style.display = 'none';
        });

        langDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        document.querySelectorAll('.lang-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (btn.hasAttribute('disabled')) return;

                document.querySelectorAll('.lang-option').forEach(function (b) {
                    b.classList.remove('active');
                    b.querySelector('.lang-check').textContent = '';
                });

                btn.classList.add('active');
                btn.querySelector('.lang-check').textContent = '✓';
                langLabel.textContent = btn.querySelector('.lang-code').textContent;

                langWrapper.classList.remove('open');
                langDropdown.style.display = 'none';
            });
        });
    }

});

// ── CLOSE FULLSCREEN VIDEO ──
window.closeVideoFull = function () {
    var overlay  = document.getElementById('videoOverlay');
    var fsVideo  = document.getElementById('fullscreenVideo');
    var fsSource = document.getElementById('fullscreenSource');
    if (fsVideo)  { fsVideo.pause(); fsVideo.currentTime = 0; }
    if (fsSource) fsSource.src = '';
    if (overlay)  overlay.classList.remove('active');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeVideoFull();
});
/* ═══════════════════════════════════════════════
   mobile.js
   Highland Heritage — Mobile Navigation & Manga Scroll
   Load this AFTER script.js in your HTML:
   <script src="mobile.js"></script>
═══════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ───────────────────────────────────────────
       ELEMENTS
    ─────────────────────────────────────────── */

    var burger   = document.getElementById('hamburger');
    var navMenu  = document.getElementById('navMenu');
    var backdrop = document.getElementById('navBackdrop');

    /* Guard — if elements don't exist, stop */
    if (!burger || !navMenu || !backdrop) return;

    /* ───────────────────────────────────────────
       OPEN / CLOSE HELPERS
    ─────────────────────────────────────────── */

    function openMenu() {
        navMenu.classList.add('nav-open');
        burger.classList.add('open');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        burger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        navMenu.classList.remove('nav-open');
        burger.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        burger.setAttribute('aria-expanded', 'false');

        /* Close all mobile sub-menus */
        document.querySelectorAll('.dropdown.mobile-open').forEach(function (d) {
            d.classList.remove('mobile-open');
        });
    }

    /* ───────────────────────────────────────────
       HAMBURGER TOGGLE
    ─────────────────────────────────────────── */

    burger.setAttribute('aria-expanded', 'false');

    burger.addEventListener('click', function () {
        if (navMenu.classList.contains('nav-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    /* ───────────────────────────────────────────
       BACKDROP CLICK → CLOSE
    ─────────────────────────────────────────── */

    backdrop.addEventListener('click', closeMenu);

    /* ───────────────────────────────────────────
       MOBILE DROPDOWN TOGGLES
       Tap on a parent link expands its sub-menu
    ─────────────────────────────────────────── */

    document.querySelectorAll('.navbar .dropdown > a').forEach(function (link) {
        link.addEventListener('click', function (e) {

            /* Only intercept on mobile */
            if (window.innerWidth > 900) return;

            e.preventDefault();

            var parent = this.closest('.dropdown');

            /* Close any other open dropdowns */
            document.querySelectorAll('.dropdown.mobile-open').forEach(function (d) {
                if (d !== parent) d.classList.remove('mobile-open');
            });

            /* Toggle this one */
            parent.classList.toggle('mobile-open');
        });
    });

    /* ───────────────────────────────────────────
       CLOSE MENU WHEN A LEAF LINK IS TAPPED
    ─────────────────────────────────────────── */

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            /* Skip parent dropdown links (handled above) */
            if (this.closest('.dropdown') &&
                this.parentElement.classList.contains('dropdown')) return;

            if (window.innerWidth <= 900) {
                closeMenu();
            }
        });
    });

    /* ───────────────────────────────────────────
       ESCAPE KEY → CLOSE
    ─────────────────────────────────────────── */

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('nav-open')) {
            closeMenu();
            burger.focus();
        }
    });

    /* ───────────────────────────────────────────
       RESET ON DESKTOP RESIZE
    ─────────────────────────────────────────── */

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });

    /* ───────────────────────────────────────────
       MANGA HORIZONTAL SCROLL
    ─────────────────────────────────────────── */

    var wrap  = document.getElementById('msTrackWrap');
    var fill  = document.getElementById('msProgressFill');
    var hint  = document.getElementById('msHint');
    var dots  = document.querySelectorAll('#msDots .ms-dot');
    var nodes = document.querySelectorAll('.ms-node');
    var conns = document.querySelectorAll('.ms-connector');

    if (!wrap) return;

    /* Animate SVG connector paths on reveal */
    function animatePath(conn) {
        var path = conn.querySelector('.ms-conn-path');
        if (!path || path.dataset.animated) return;
        path.dataset.animated = '1';
        var len = path.getTotalLength();
        path.style.strokeDasharray  = len;
        path.style.strokeDashoffset = len;
        path.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                path.style.strokeDashoffset = '0';
            });
        });
    }

    /* Reveal panels and connectors as they scroll into view */
    function checkVisible() {
        var wLeft  = wrap.scrollLeft;
        var wRight = wLeft + wrap.clientWidth;

        nodes.forEach(function (n) {
            if (n.offsetLeft < wRight + 80) {
                n.classList.add('ms-node--visible');
            }
        });

        conns.forEach(function (c) {
            if (c.offsetLeft < wRight + 40 && !c.classList.contains('ms-conn--visible')) {
                c.classList.add('ms-conn--visible');
                animatePath(c);
            }
        });
    }

    /* Scroll handler */
    wrap.addEventListener('scroll', function () {
        var max = wrap.scrollWidth - wrap.clientWidth;

        /* Progress bar */
        if (fill && max > 0) {
            fill.style.width = ((wrap.scrollLeft / max) * 100) + '%';
        }

        /* Hide scroll hint after first scroll */
        if (hint && wrap.scrollLeft > 80) {
            hint.classList.add('ms-hint--gone');
        }

        /* Active dot — find closest panel to viewport centre */
        var mid = wrap.scrollLeft + wrap.clientWidth / 2;
        var closest = 0;
        var minDist = Infinity;

        nodes.forEach(function (n, i) {
            var nx = n.offsetLeft + n.offsetWidth / 2;
            var d  = Math.abs(nx - mid);
            if (d < minDist) { minDist = d; closest = i; }
        });

        dots.forEach(function (d) { d.classList.remove('ms-dot--active'); });
        if (dots[closest]) dots[closest].classList.add('ms-dot--active');

        checkVisible();
    }, { passive: true });

    /* Dot click → scroll to panel */
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var n = nodes[+this.dataset.goto];
            if (n) wrap.scrollTo({ left: n.offsetLeft - 60, behavior: 'smooth' });
        });
    });

    /* Arrow key navigation for the manga track */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') wrap.scrollBy({ left: 340, behavior: 'smooth' });
        if (e.key === 'ArrowLeft')  wrap.scrollBy({ left: -340, behavior: 'smooth' });
    });

    /* Initial visibility check after layout settles */
    setTimeout(checkVisible, 300);

})();
/* Mouse drag support for manga scroll */
var isDown = false;
var startX;
var scrollLeft;

wrap.addEventListener('mousedown', function(e) {
    isDown = true;
    wrap.style.cursor = 'grabbing';
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
});

wrap.addEventListener('mouseleave', function() {
    isDown = false;
    wrap.style.cursor = 'grab';
});

wrap.addEventListener('mouseup', function() {
    isDown = false;
    wrap.style.cursor = 'grab';
});

wrap.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - wrap.offsetLeft;
    var walk = (x - startX) * 1.5;
    wrap.scrollLeft = scrollLeft - walk;
});
