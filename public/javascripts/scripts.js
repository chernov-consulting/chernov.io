/*!
* Start Bootstrap - Grayscale v6.0.4 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
(function ($) {
    "use strict";

    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').on('click', function () {
        if (
            location.pathname.replace(/^\//, "") ==
            this.pathname.replace(/^\//, "") &&
            location.hostname == this.hostname
        ) {
            var target = $(this.hash);
            target = target.length ?
                target :
                $("[name=" + this.hash.slice(1) + "]");
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 72
                }, 800);
                return false;
            }
        }
    });

    $(".js-scroll-trigger").click(function () {
        $(".navbar-collapse").collapse("hide");
    });

    $("body").scrollspy({
        target: "#mainNav",
        offset: 100,
    });

    var navbarUpdate = function () {
        var scrollTop = $(window).scrollTop();
        var heroEl = document.querySelector('.masterhead');
        var heroBottom = heroEl ? heroEl.offsetHeight - 80 : 0;

        if (scrollTop > 100) {
            $("#mainNav").addClass("navbar-shrink");
        } else {
            $("#mainNav").removeClass("navbar-shrink");
        }

        if (scrollTop < heroBottom) {
            $("#mainNav").addClass("nav-over-dark");
        } else {
            $("#mainNav").removeClass("nav-over-dark");
        }
    };

    navbarUpdate();
    $(window).scroll(navbarUpdate);
    $(window).on('resize', navbarUpdate);

    $('#navbarResponsive')
        .on('show.bs.collapse', function () { $('#mainNav').addClass('nav-open'); })
        .on('hide.bs.collapse', function () { $('#mainNav').removeClass('nav-open'); });

})(jQuery);

particlesJS.load('particles-js', 'assets/particles.json');

(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
    });
})();
