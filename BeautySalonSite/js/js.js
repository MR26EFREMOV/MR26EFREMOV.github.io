$(function () {
    var $hamburger = $(".hamburger, .mm-wrapper__blocker");
    $hamburger.on("click", function(e) {
        $hamburger.toggleClass("is-active");
    });
    $hamburger.on("dblclick", function(e) {
        $hamburger.toggleClass("is-active");
    });




    $(document).ready(function(){
        $(".service-carousel").owlCarousel({
                loop:false,
                margin:0,
                nav:true,
                dots: false,
                navText : ["<i class='icon-angle-double-left' aria-hidden=\"true\"></i>","<i class='icon-angle-double-right' aria-hidden=\"true\"></i>" ],
                responsive:{
                    0: {
                        items: 1
                    },
                    600: {
                        items: 2
                    },
                    1250:
                        {
                            items: 3
                        },
                    1920:
                        {items: 4}
                }
            }
        );
        $('.partners-carousel').owlCarousel({
            loop:true,
            margin:70,
            nav:true,
            dots:false,
            navText : ["<i class='icon-angle-left' aria-hidden=\"true\"></i>","<i class='icon-angle-right' aria-hidden=\"true\"></i>" ],
            responsiveClass:true,
            responsive:{
                0:{
                    items:1,
                    nav:false,
                    dots:true,
                },
                600:{
                    items:2

                },
                800:{
                    items:3
                },

            }
        })
        $(".review-carousel").owlCarousel({
            loop: false,
            nav:false,
            items: 1,
            margin: 0,
            smartSpeed: 700,
            dots: true,
        });
    });
});
document.addEventListener(
    "DOMContentLoaded", () => {
        new Mmenu( "#my-menu", {
            "extensions": [
                "pagedim-black",
                "position-right",
                "theme-dark"
            ],
            "navbar": {"title":"<img class='header__logo' src='img/logo-1.svg' alt='logo'>"}
        }
        );
    }
);
$('select').selectize({
    create:true,
    sortField:"text"
});
$("form.callback").submit(function() { //Change
    var th = $(this);
    $.ajax({
        type: "POST",
        url: "../mail.php", //Change
        data: th.serialize()
    }).done(function() {
        $(th).find('.success').addClass('active').css('display','flex').hide().fadeIn();
        setTimeout(function() {
            $(th).find('.success').removeClass('active').fadeOut();
            th.trigger("reset");
        }, 3000);
    });
    return false;
});
$(function() {
    $(window).scroll(function() {
        if($(this).scrollTop() > 300) {
            $('#topNubex').fadeIn();
        } else {
            $('#topNubex').fadeOut();
        }
    });
    $('#topNubex').click(function() {
        $('body,html').animate({scrollTop:0},700);
    });
});

$(window).on('load', function() {
    $('.preloader').fadeOut().end().delay(300).fadeOut('slow');
});
