(function ($) {
    "use strict";

    // loader
    var loader = function () {
        setTimeout(function () {
            if($('#loader').length > 0) {
                $('#loader').removeClass('show');
            }
        }, 1);
    };
    loader();


    // Initiate the wowjs
    new WOW().init();


    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.navbar').addClass('nav-sticky');
        } else {
            $('.navbar').removeClass('nav-sticky');
        }
    });


    // Smooth scrolling on the navbar links
    $(".navbar-nav a").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();

            $('html, body').animate({
                scrollTop: $(this.hash).offset().top - 45
            }, 1500, 'easeInOutExpo');

            if ($(this).parents('.navbar-nav').length) {
                $('.navbar-nav .active').removeClass('active');
                $(this).closest('a').addClass('active');
            }
        }
    });


    // Typed Initiate
    if ($('.hero .hero-text h2').length == 1) {
        var typed_strings = $('.hero .hero-text .typed-text').text();
        var typed = new Typed('.hero .hero-text h2', {
            strings: typed_strings.split(', '),
            typeSpeed: 100,
            backSpeed: 20,
            smartBackspace: false,
            loop: true
        });
    }


    // Skills
    $('.skills').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Contact Form AJAX Submission
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();

        var form = $(this);
        var submitBtn = $('#send-button');
        var messageBox = $('#form-message');

        var name = form.find('#name').val().trim();
        var email = form.find('#email').val().trim();
        var subject = form.find('#subject').val().trim();
        var message = form.find('#message').val().trim();

        if (!name || !email || !subject || !message) {
            messageBox.html('<div class="alert error">Please fill in all fields.</div>').show();
            return;
        }

        if (!isValidEmail(email)) {
            messageBox.html('<div class="alert error">Please enter a valid email address.</div>').show();
            return;
        }

        messageBox.hide();
        submitBtn.prop('disabled', true);
        submitBtn.text('Sending... (this can take a moment)');

        $.ajax({
            url: 'https://portfolio-api-q6rc.onrender.com/api/contact',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                name: name,
                email: email,
                subject: subject,
                message: message
            }),
            success: function (response) {
                if (response.ok === true) {
                    messageBox.html('<div class="alert success">Your message has been sent. I will get back to you soon!</div>').show();
                    form[0].reset();
                } else {
                    messageBox.html('<div class="alert error">' + (response.error || 'Something went wrong.') + '</div>').show();
                }
            },
            error: function (xhr) {
                var errorMsg = 'Something went wrong. Please try again.';
                if (xhr.responseText) {
                    try {
                        var parsed = JSON.parse(xhr.responseText);
                        if (parsed.error) {
                            errorMsg = parsed.error;
                        }
                    } catch (e) {
                        errorMsg = xhr.responseText;
                    }
                }
                messageBox.html('<div class="alert error">' + errorMsg + '</div>').show();
            },
            complete: function () {
                submitBtn.prop('disabled', false);
                submitBtn.text('Send Message');
            }
        });
    });

    function isValidEmail(email) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }
})(jQuery);
