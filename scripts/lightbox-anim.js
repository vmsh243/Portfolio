// Lightbox FLIP animation — grow image from its origin position into the lightbox
(function () {
    var _sourceEl = null;

    // Capture the clicked image element before onclick handlers fire
    document.addEventListener('click', function (e) {
        var t = e.target;
        _sourceEl = t.tagName === 'IMG' ? t : (t.querySelector && t.querySelector('img')) || null;
    }, true);

    function getSourceRect() {
        return _sourceEl ? _sourceEl.getBoundingClientRect() : null;
    }

    function flipIn(sourceRect, img) {
        var destRect = img.getBoundingClientRect();
        if (!destRect.width || !destRect.height) return;

        var scaleX = sourceRect.width / destRect.width;
        var scaleY = sourceRect.height / destRect.height;
        var tx = (sourceRect.left + sourceRect.width / 2) - (destRect.left + destRect.width / 2);
        var ty = (sourceRect.top + sourceRect.height / 2) - (destRect.top + destRect.height / 2);

        img.style.transition = 'none';
        img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scaleX + ',' + scaleY + ')';
        img.offsetHeight; // force reflow
        img.style.transition = '';
        img.style.transform = '';
    }

    // Call after adding lightbox--active and setting img.src
    window.lightboxAnimateIn = function () {
        var sourceRect = getSourceRect();
        if (!sourceRect) return;

        var img = document.getElementById('lightbox-img');

        function run() {
            requestAnimationFrame(function () { flipIn(sourceRect, img); });
        }

        if (img.complete && img.naturalWidth) {
            run();
        } else {
            img.addEventListener('load', run, { once: true });
        }
    };

    // Call instead of directly removing lightbox--active
    window.lightboxAnimateOut = function (onDone) {
        var img = document.getElementById('lightbox-img');
        var lightbox = document.getElementById('lightbox');
        var sourceRect = getSourceRect();

        // Animate image back to source if visible
        if (sourceRect && sourceRect.width) {
            var destRect = img.getBoundingClientRect();
            if (destRect.width && destRect.height) {
                var scaleX = sourceRect.width / destRect.width;
                var scaleY = sourceRect.height / destRect.height;
                var tx = (sourceRect.left + sourceRect.width / 2) - (destRect.left + destRect.width / 2);
                var ty = (sourceRect.top + sourceRect.height / 2) - (destRect.top + destRect.height / 2);
                img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scaleX + ',' + scaleY + ')';
            }
        }

        lightbox.classList.remove('lightbox--active');
        document.body.style.overflow = '';

        setTimeout(function () {
            img.style.transition = 'none';
            img.style.transform = '';
            requestAnimationFrame(function () { img.style.transition = ''; });
            if (onDone) onDone();
        }, 350);
    };
})();

// Zoom affordance — every image already wired to openLightbox() gets a visible
// control. Without this, `cursor: zoom-in` was the only signal that case study
// images expand: invisible until hover, and absent on touch. The trigger may be
// the image itself or a wrapping div/figure, so the button always pins to the
// image and forwards the click to whichever element carries the handler.
(function () {
    var TRIGGER = '[onclick*="openLightbox"]';

    function decorate(img) {
        var trigger = img.matches(TRIGGER) ? img : img.closest(TRIGGER);
        if (!trigger) return;

        var wrap = document.createElement('span');
        wrap.className = 'zoomable';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'zoomable__btn';
        btn.setAttribute('aria-label', 'Open this image full size');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"></circle>' +
            '<line x1="16.5" y1="16.5" x2="21" y2="21"></line>' +
            '<line x1="11" y1="8" x2="11" y2="14"></line>' +
            '<line x1="8" y1="11" x2="14" y2="11"></line></svg>';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            trigger.click();
        });

        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
        wrap.appendChild(btn);
    }

    function injectZoomAffordance() {
        var imgs = document.querySelectorAll('img' + TRIGGER + ', ' + TRIGGER + ' img');
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            // Homepage cards ship their own .card-zoom control.
            if (img.closest('.zoomable') || img.closest('.project-card') ||
                img.closest('.tile--mimir') || img.id === 'lightbox-img') continue;
            decorate(img);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectZoomAffordance);
    } else {
        injectZoomAffordance();
    }
})();
