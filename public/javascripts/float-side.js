let lastScrollTop = 0;
$(window).scroll(function(event){
    var st = $(this).scrollTop();
    if (st > lastScrollTop){
        $('.js-sticky-block').removeClass('sticky-top2');
        const mt = $('.js-sticky-block').offset().top;
        $('.right-box').css({'align-items': 'flex-end'});
        $('.js-sticky-block').css({
            'top': 'auto',
            'bottom': 0,
        });
        if (parseInt($('.js-sticky-block').css('margin-top')) === 0) {
            $('.js-sticky-block').css({
                "margin-top": mt - 100 + 'px'
            });
        }

    } else {
        const scrollTop = $(window).scrollTop();
        const elementOffset = $('.js-sticky-block').offset().top;
        const currentElementOffset = (elementOffset - scrollTop);
        if (currentElementOffset >= 0) {
            $('.js-sticky-block').css({
                "margin-top": 0 + 'px',
                'top': 0,
                'bottom': 'auto'
            });
            $('.right-box').css({
                'align-items': 'flex-start'
            })
        }
        if (!$('.js-sticky-block').hasClass('sticky-top2')) {
            const mt = $('.js-sticky-block').offset().top
            $('.js-sticky-block').css({
                "margin-top": mt - 100 + 'px'
            });
            $('.js-sticky-block').addClass('sticky-top2');
        }
    }
    lastScrollTop = st;
});