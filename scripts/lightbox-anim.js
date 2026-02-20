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
