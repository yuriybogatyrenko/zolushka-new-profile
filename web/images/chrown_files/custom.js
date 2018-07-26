(function (e) {
    e.closest = e.closest || function (css) {
            var node = this;

            while (node) {
                if (node.matches(css)) return node;
                else node = node.parentElement;
            }
            return null;
        }
})(Element.prototype);

$(document).ready(function () {
    //$('head').append('<script src="http://libs.qube.su/js/PP.js"></script>');

    $('body').on('click', '.is_turned', function () {
        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
            $(this).addClass('off');
            $(this).find('.calls_slider_text').text('Звонки отключены');
        } else {
            $(this).removeClass('off');
            $(this).addClass('on');
            $(this).find('.calls_slider_text').text('Звонки включены');
        }
    });

    $('.password_visibility').click(function () {
        if ($(this).hasClass('off')) {
            $(this).removeClass('icon-eye-off off');
            $(this).addClass('icon-eye');
            $('#client_plainPassword').attr('type', 'text');
        } else {
            $(this).removeClass('icon-eye');
            $(this).addClass('icon-eye-off off');
            $('#client_plainPassword').attr('type', 'password');
        }
    });

    (function ($) {
        $.event.special.textchange = {
            setup: function (data, namespaces) {
                $(this).data('lastValue', this.contentEditable === 'true' ? $(this).html() : $(this).val());
                $(this).bind('keyup.textchange', $.event.special.textchange.handler);
                $(this).bind('cut.textchange paste.textchange input.textchange', $.event.special.textchange.delayedHandler);
            },

            teardown: function (namespaces) {
                $(this).unbind('.textchange');
            },

            handler: function (event) {
                $.event.special.textchange.triggerIfChanged($(this));
            },

            delayedHandler: function (event) {
                var element = $(this);
                setTimeout(function () {
                    $.event.special.textchange.triggerIfChanged(element);
                }, 25);
            },

            triggerIfChanged: function (element) {
                var current = element[0].contentEditable === 'true' ? element.html() : element.val();
                if (current !== element.data('lastValue')) {
                    element.trigger('textchange', [element.data('lastValue')]);
                    element.data('lastValue', current);
                }
            }
        };

        $.event.special.hastext = {

            setup: function (data, namespaces) {
                $(this).bind('textchange', $.event.special.hastext.handler);
            },

            teardown: function (namespaces) {
                $(this).unbind('textchange', $.event.special.hastext.handler);
            },

            handler: function (event, lastValue) {
                if ((lastValue === '') && lastValue !== $(this).val()) {
                    $(this).trigger('hastext');
                }
            }
        };

        $.event.special.notext = {

            setup: function (data, namespaces) {
                $(this).bind('textchange', $.event.special.notext.handler);
            },

            teardown: function (namespaces) {
                $(this).unbind('textchange', $.event.special.notext.handler);
            },

            handler: function (event, lastValue) {
                if ($(this).val() === '' && $(this).val() !== lastValue) {
                    $(this).trigger('notext');
                }
            }
        };

    })(jQuery);

    $('.blue_select .checkbox_selectlist input[type=checkbox]').change(function () {
        check_dd_checkbox($(this));
    });

    $('.blue_select .checkbox_selectlist input[type=checkbox]').each(function () {
        check_dd_checkbox($(this));
    });

    function check_dd_checkbox(bl) {
        if (bl.is(':checked')) {
            bl.closest('label').addClass('active_checkbox');
        } else {
            bl.closest('label').removeClass('active_checkbox');
        }
    }

    $('.num_input').bind('textchange', function (event) {
        checkNumberFields(this, event);
    });

    function checkNumberFields(e, k) {

        var str = jQuery(e).val();
        var new_str = s = "";

        for (var i = 0; i < str.length; i++) {

            s = str.substr(i, 1);

            if (s != " " && isNaN(s) == false) {
                new_str += s;
            }
        }
        if (eval(new_str) > 9999) {
            new_str = 9999;
        }
        if (eval(new_str) == 0) {
            new_str = "";
        }

        jQuery(e).val(new_str);

    }

    $(".invis_bl .toggle_bl").click(function () {
        $(this).closest(".invis_bl").toggleClass("active");
    });

    $(".pay_popup .pay_close").click(function () {
        $(".pay_popup").fadeOut(400);
    });

    $(".pay_popup .method_pay .item").click(function () {
        $(this).closest(".pay_popup").find(".item").removeClass("active");
        $(this).addClass("active");
        var this_data = $(this).attr("data-inset");
        $(".pay_popup .inset_form").stop().fadeOut(400);
        $(".pay_popup .inset_form[data-bl=" + this_data + "]").stop().fadeIn(400);
    });

    $(".settings .cogwheel").click(function () {
        $(this).closest(".settings").find(".drop_menu").stop().slideToggle(400);
    });

    $(".settings .close").click(function () {
        $(this).closest(".settings").find(".drop_menu").stop().slideToggle(400);
    });

    $(document).on('focusout', '.text_input_messages', function () {
        if ($(this).text() != '') {
            $(this).addClass('edited_no_ph');
        } else {
            $(this).removeClass('edited_no_ph');
        }
    });

    $(document).on('keyup', '.text_input_messages', function () {
        if ($(this).closest('.input_wrap.with_scroll').data('jsp')) {
            $(this).closest('.input_wrap.with_scroll').data('jsp').reinitialise();
        }
    });

    $(".editing_input .event_btn").click(function () {
        if (!$(this).closest(".editing_input").hasClass("active")) {
            $(this).closest(".editing_input").addClass("active");

            $(this).closest(".editing_input").find(".wrap_first").hide();
            $(this).closest(".editing_input").find(".wrap_last").show();
        } else {
            $(this).closest(".editing_input").removeClass("active");

            $(this).closest(".editing_input").find(".wrap_first").show();
            $(this).closest(".editing_input").find(".wrap_last").hide();
        }
    });

    $(".sidebar_msg_contacts .favorites").click(function () {
        if ($(this).hasClass("icon-star")) {
            $(this).removeClass("icon-star").addClass("icon-star-empty");
        } else {
            $(this).removeClass("icon-star-empty").addClass("icon-star");
        }
    });

    $(".add_photoblog").click(function () {
        setTimeout(function () {
            // $('.with_scroll').jScrollPane();
        }, 500);
    });

    if ($('input[data-inputmask]').length > 0) {
        $('input[data-inputmask]').inputmask("+9{1,3}9{7,10}");
    }

    // Run gallery by click on photo
    $("body").on("click", ".it_photo", function (e) {
        var $this = $(this);

        if ($this.find('img').length > 0 && !$(e.target).parent().hasClass('edit_links')) {
            var bl = $(e.target),
                data_slider_id = 0,
                data_id = 0,
                window_h = $(window).height() * 0.8,
                window_w = $(window).width() * 0.8;

            var $gallerySlides = $this.closest(".gallery_slides");

            if (!$gallerySlides.hasClass("finish_id")) {
                $(".it_photo").each(function () {
                    $(this).find("img").attr({
                        "data-slide-id": data_slider_id
                    });

                    data_slider_id = data_slider_id + 1;
                });

                $gallerySlides.addClass("finish_id");
            }

            var $img = $this.find("img");
            var $slidesPopup = $(".slides_popup");

            if ($('.it_photo').length > 1) {
                $slidesPopup.find(".img_wrap").prepend("<img class='first_img event_btn next'>");
            } else {
                $slidesPopup.find(".img_wrap").prepend("<img class='first_img'>");
                $slidesPopup.find(".prev.event_btn").css('display', 'none');
            }

            var $firstImg = $slidesPopup.find('.first_img');

            $firstImg.attr({
                "src": $img.attr("data-slide-src"),
                "data-slide-id": $img.attr("data-slide-id"),
                "data-id": $img.attr("data-id")
            });
            $slidesPopup.fadeIn(400);
            $slidesPopup.find("img").css({'max-height': window_h, 'max-width': window_w});
            $firstImg.fadeIn(400);

            $("body").addClass("overflow_h");
        }
    });

    // Show next or prev image by click on event btn
    $(".slides_popup").on("click", ".event_btn", function () {
        var need_img, need_src, need_data_id;
        var $slidesPopup = $(".slides_popup");

        if ($slidesPopup.hasClass("anim_ready")) {
            var delay = 0;
            var $firstImg = $slidesPopup.find('.first_img');

            if ($(this).hasClass("next")) {
                $slidesPopup.removeClass("anim_ready");

                var this_id = $firstImg.attr("data-slide-id");
                var this_data_id = $firstImg.attr("data-id");
                var $gallerySlides = $(".gallery_slides");

                this_id = parseInt(this_id) + 1;

                need_img = $gallerySlides.find("img[data-slide-id=" + this_id + "]");

                if (need_img.length == 0) {
                    this_id = 0;
                    need_img = $gallerySlides.find("img[data-slide-id=" + this_id + "]")
                }

                if (need_img.length > 0) {
                    need_src = need_img.attr("data-slide-src");
                    need_data_id = need_img.attr("data-id");

                    var $lastImg = $('<img class="last_img">');

                    $slidesPopup.find(".img_wrap").prepend($lastImg);

                    $lastImg.attr({
                        "src": need_src,
                        "data-slide-id": this_id,
                        "data-id": need_data_id
                    });

                    $firstImg.fadeOut(delay);
                    $lastImg.fadeIn(delay);
                }
            } else {
                $slidesPopup.removeClass("anim_ready");

                var this_id = $firstImg.attr("data-slide-id");
                this_id = parseInt(this_id) - 1;

                if ($(".gallery_slides img[data-slide-id=" + this_id + "]").length == 0) {
                    this_id = $(".it_photo.popup-photo").length - 1;
                }

                need_img = $(".gallery_slides img[data-slide-id=" + this_id + "]");
                if (need_img.length > 0) {
                    need_src = need_img.attr("data-slide-src");
                    need_data_id = need_img.attr("data-id");

                    var $lastImg = $('<img class="last_img">');

                    $slidesPopup.find(".img_wrap").prepend($lastImg);

                    $lastImg.attr({
                        "src": need_src,
                        "data-slide-id": this_id,
                        "data-id": need_data_id
                    });

                    $firstImg.fadeOut(delay);

                    $lastImg.fadeIn(delay);
                }
            }

            setTimeout(function () {
                var last_img = $(".slides_popup .last_img");
                $(".slides_popup .first_img").remove();
                last_img.addClass("first_img next event_btn").removeClass("last_img");
                $(".slides_popup").addClass("anim_ready");
            }, delay);

            var window_h = $(window).height() * 0.8,
                window_w = $(window).width() * 0.8;

            $(".slides_popup img").css({'max-height': window_h, 'max-width': window_w});
        }

    });

    $(".slides_popup .close").click(closeGallery);

    $(document).on('keyup', function (evt) {
        if (evt.keyCode == 27) {
            closeGallery();
        }
    });

    function closeGallery() {
        $(".slides_popup .close").closest(".slides_popup").fadeOut(400);
        $(".slides_popup .img_wrap img").remove();
        $("body").removeClass("overflow_h");
    }


    $(".card_big_photo .item_photo .open_descr").click(function (e) {
        $(this).closest(".descr_bl").addClass("active");
        e.preventDefault();
    });

    $(".card_big_photo .item_photo.descr_item").mouseleave(function () {
        $(this).find(".descr_bl").removeClass("active");
    });


    $(".city_bl .pen_icon").click(function () {
        var need_text = $(this).closest(".city_bl").find(".city_text").text();
        $(this).closest(".city_bl").find(".city_pop").fadeIn(400);
        $(this).closest(".city_bl").find(".city_pop input").val(need_text);
    });

    $(".city_pop button").click(function () {
        var need_text = $(this).closest(".city_pop").find("input").val();
        $(this).closest(".city_bl").find(".city_text").text(need_text);
        $(this).closest(".city_bl").find(".city_text").attr("title", need_text);
        $(this).closest(".city_bl").find(".city_pop").fadeOut(400);
    });


    $(".descr_area .open_textarea").click(function (e) {
        $(this).closest(".descr_area").find(".entered_text").removeClass("active");
        $(this).closest(".descr_area").find(".entry_field").addClass("active");
        var need_text = $(this).closest(".descr_area").find(".textarea_text").html();
        need_text = need_text.replace(/(\r\n|\n|\r)/gm, "").replace(/<br\s*[\/]?>/gi, "\n");
        if ($(this).closest(".descr_area").find("textarea").attr("placeholder") == need_text) {
        } else {
            $(this).closest(".descr_area").find("textarea").text(need_text);
        }
        e.preventDefault();
    });

    $(".descr_area .save_btn").click(function (e) {
        var area_text = $(this).closest(".entry_field").find("textarea").val();

        area_text = area_text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        $(this).closest(".descr_area").find(".entered_text").addClass("active");
        $(this).closest(".descr_area").find(".entry_field").removeClass("active");
        $(this).closest(".descr_area").find(".about_me").css("display", "none");
        if ($(this).closest(".descr_area").find("textarea").val() == 0) {
            var ph_area = $(this).closest(".descr_area").find("textarea").attr("placeholder");
            $(this).closest(".descr_area").find(".textarea_text").text(ph_area);
            $(this).closest(".descr_area").find(".textarea_text").addClass("txt_center");
        } else {
            $(this).closest(".descr_area").find(".textarea_text").html(area_text);
            $(this).closest(".descr_area").find(".textarea_text").removeClass("txt_center");
        }
        e.preventDefault();
    });

    $(".radio_units .in_bl").click(function () {
        $(".radio_units .in_bl").removeClass("active");
        $(this).addClass("active");
    });


    $(".main_data_wrap [data-save]").click(function (e) {
        var this_attr = $(this).attr("data-save");
        $(".data_item").removeClass("active");
        $("*[data-slide-drop=" + this_attr + "]").stop().slideUp(400);
        this_attr = parseInt(this_attr) + 1;
        if ($("*[data-slide-drop=" + this_attr + "]").closest(".item").hasClass("closed")) {
            $("*[data-slide-drop=" + this_attr + "]").closest(".item").removeClass("closed").addClass("active");
            $("*[data-slide-drop=" + this_attr + "]").slideDown(400);
        }
        e.preventDefault();
    });

    $(document).on('click', "*[data-slide-btn]", function (e) {
        var need_attr = $(this).attr("data-slide-btn");
        $(".data_item .data_bl").slideUp(400);
        if (!$(this).closest(".data_item").hasClass("active")) {
            $(".data_item").removeClass("active");
            $(this).closest(".data_item").addClass("active");
            $("*[data-slide-drop]").stop().slideUp(400);
            $("*[data-slide-drop=" + need_attr + "]").stop().slideDown(400);
        } else {
            $(".data_item").removeClass("active");
            $("*[data-slide-drop]").stop().slideUp(400);
            $("*[data-slide-drop=" + need_attr + "]").stop().slideUp(400);
            $(".data_item .data_bl").stop().slideDown(400);
        }
        e.preventDefault();
    });

    $(".close_data").click(function (e) {
        $(this).closest(".drop_it").slideUp(400);
        $(".data_item").removeClass("active");
        $(".data_item .data_bl").slideDown(400);
        e.preventDefault();
    });


    $("body").on("click", "*[data-popup-open]", function (e) {
        e.preventDefault();

        var $this = $(this);
        var need_attr = $this.attr("data-popup-open");

        if (need_attr == 'send_message') return;

        if (need_attr == 'popup_men_repeat_mail') {
            $("*[data-popup-block=popup_men_confirm_mail]").stop().hide();
            $("*[data-popup-open=popup_men_confirm_mail]").stop().removeClass("active");

            $('[data-popup-block="popup_men_repeat_mail"]').fadeIn();

            var $overlay = $('.overlay');

            if (!$overlay.is(':visible')) {
                $overlay.stop().fadeIn(400);
            }

            return;
        }

        if ($this.hasClass("it_photo")) {
            if ($this.find("img").length <= 0) {
                $this.addClass("active");
                $("*[data-popup-block=" + need_attr + "]").stop().fadeIn(400);
                $(".overlay").stop().fadeIn(400);
            }
            return;
        }
        if ($this.hasClass("icon-gift")) {
            $this.addClass("active");
            $("*[data-popup-block=" + need_attr + "]").stop().fadeIn(400);
            $(".overlay").stop().fadeIn(400);
            $('.with_scroll').jScrollPane();
            $("body").addClass("overflow_h");
            return;
        }

        $.displayPopup($("[data-popup-block=" + need_attr + "]"));

        /*if ($(e.target).attr('data-popup-open') != 'crop_component')
         $(".overlay").stop().fadeIn(400);*/

    });

    $('body').on('click', '[data-popup-close]', function (e) {
        var need_attr = $(this).attr("data-popup-close");

        $("*[data-popup-block=" + need_attr + "]").stop().fadeOut(400);
        $("*[data-popup-open=" + need_attr + "]").stop();
        $(".overlay").stop().fadeOut(400);
        $("body").removeClass("overflow_h");

        e.preventDefault();
    });

    $(document).keydown(function (event) {
        if (event.keyCode == 27) {
            $("*[data-popup-block]").stop().fadeOut(400);
            $("*[data-popup-open]").stop().removeClass("active");
            $(".overlay").stop().fadeOut(400);
            $('body').removeClass('overflow_h');
        }
    });


    $(".label_wrap input[type='radio']").change(function () {
        var bl = $(this);

        if (bl.is(':checked') && bl.closest('.travels').length > 0) {
            bl.closest(".travels").find(".check_wrap").removeClass("off");
        } else if (bl.closest('.travels').length < 1) {
            $(".label_wrap.travels .check_wrap").addClass("off");
        }
    });

    $(".popup_bl .close").click(function () {
        $(this).closest(".popup_bl").fadeOut(400);
        $(".popup_bg").fadeOut(400);
    });

    $(".reg_form .sex .radio_wrap").click(function () {
        $(".reg_form .sex .radio_wrap").removeClass("active");
        $(this).addClass("active");
    });

    if ($("select").length > 0) {
        $('select:not(.chosen-select)').selectbox();
    }

    $(document).on('mouseover', '.drop_hover .drop_btn', function (e) {
        if ((!$(this).closest(".drop_hover").hasClass("drop_vis")) & (!$(this).closest(".drop_hover").hasClass("end")) & !$(this).closest('.drop_hover').hasClass('clickable')) {
            e.preventDefault();
            $(this).closest(".drop_hover").addClass("drop_vis");
            $(this).closest(".drop_hover").find(".drop_block").stop().show();

            if (!$(this).closest('.drop_hover').hasClass('no_blackout'))
                $(".blackout").stop().show();

            $('.nano').nanoScroller();
        }
    });

    var st, st1, anim_on = false;

    $(document).on('click', '.drop_hover.clickable .drop_btn', function (e) {
        if (anim_on == false) {
            if ((!$(this).closest(".drop_hover").hasClass("drop_vis")) & (!$(this).closest(".drop_hover").hasClass("end"))) {
                clearTimeout(st);
                clearTimeout(st1);
                anim_on = true;
                e.preventDefault();
                $('.drop_hover .drop_block').hide().closest('.drop_hover').removeClass('drop_vis');
                $(this).closest(".drop_hover").addClass("drop_vis");
                $(this).closest(".drop_hover").find(".drop_block").show();
                $(this).closest(".blackout_wrap").find(".blackout").show()

                /* st1 = setTimeout(function(){ */
                anim_on = false;
                /* },205); */
            }
        }
    });

    $(document).on('mouseleave', ".drop_hover.hover_out", function (e) {
        if (anim_on == false) {
            e.preventDefault();
            var this_element = $(this).closest(".drop_hover");
            if (this_element.hasClass("gifts_drop") || $(this).closest(".drop_hover").hasClass("allways_hover")) {
                anim_on = true;
                clearTimeout(st);
                clearTimeout(st1);
                this_element.find(".drop_block").stop().hide();
                $(this).closest(".blackout_wrap").find(".blackout").stop().hide();
                /* st = setTimeout(function(){ */
                this_element.removeClass("drop_vis");
                anim_on = false;
                /* },205) */
                return;
            }
        }
    });

    $(document).on('click', ".drop_hover .drop_close", function (e) {
        e.preventDefault();
        var this_element = $(this).closest(".drop_hover");
        if ($(this).closest(".drop_hover").hasClass("gifts_drop") || $(this).closest(".drop_hover").hasClass("allways_hover")) {
            $(this).closest(".drop_hover").find(".drop_block").stop().hide();
            $(".blackout").stop().hide();
            /* setTimeout(function(){ */
            this_element.removeClass("drop_vis");
            /* },205) */
            return;
        }
        if ($(this).closest(".drop_hover").hasClass("drop_vis")) {
            $(this).closest(".drop_hover").find(".drop_block").stop().hide();
            $(".blackout").stop().hide();
            $(this).closest(".drop_hover").addClass("end");
            /* setTimeout(function(){ */
            this_element.removeClass("drop_vis");
            /* },205) */
        }
    });


    $('input[type=text]').focus(function () {
        if (!$(this).hasClass('no-js-ph')) {
            var txt = $(this).val();
            var ph = $(this).attr('data-ph');

            if (typeof ph !== typeof undefined && ph !== false) {
                if (txt == ph) {
                    $(this).val('').addClass('ph-focused');
                }
            }
        }
    });

    $('input[type=text]').blur(function () {
        if (!$(this).hasClass('no-js-ph')) {
            var txt = $(this).val();
            var ph = $(this).attr('data-ph');
            if (typeof ph !== typeof undefined && ph !== false) {
                if (txt == '' && !$(this).val()) {
                    $(this).val(ph).removeClass('ph-focused ph-edited');
                } else {
                    $(this).removeClass('ph-focused').addClass('ph-edited')
                }
            }
        }
    });


    if ($('input[type=checkbox], input[type=radio]').length > 0) {
        $('input[type=checkbox]:not(.no-style), input[type=radio]:not(.no-style)').each(function () {
            if ($(this).attr('type') == 'checkbox') {
                var this_class = $(this).attr('class');
                if ($(this).attr("class") == undefined) {
                    $(this).wrap('<span class="checkbox">');
                } else {
                    $(this).wrap('<span class="checkbox ' + this_class + '">');
                    $(this).removeClass(this_class);

                }
            } else if ($(this).attr('type') == 'radio') {
                $(this).wrap('<span class="radio_parent">');
                $(this).wrap('<span class="radio">');
            }

            if ($(this).is(':checked'))
                $(this).parent().addClass('active');
        });
    }

    // Change checkbox, radio active
    $(document).on('change', 'input[type=checkbox]:not(.no-style), input[type=radio]:not(.no-style)', function () {
        if ($(this).attr('type') == 'checkbox') {
            if (!$(this).is(':checked')) {
                $(this).parent().removeClass('active');
            } else
                $(this).parent().addClass('active');
        } else {
            if ($(this).is(':checked')) {
                var el = $(this).attr('name');
                $('input[type=radio][name="' + el + '"]').parent().removeClass('active');
                $(this).parent().addClass('active');
            }
        }
    });

    $('.search_block_wrapper .additional_trigger').click(function () {
        $(this).closest('.search_block_wrapper').find('.additional_filters_search.fw-hidden').stop().slideToggle(500);
        $(this).find('.additional_plus').toggleClass('minus');

        if ($(this).find('.additional_plus').hasClass('minus')) {
            $('.show_reg_blocked > .pos_a').fadeIn(200);
        } else {
            $('.show_reg_blocked > .pos_a').fadeOut(200);
        }

    });

    $('.profiles_view li').click(function () {
        if (!$(this).hasClass('active')) {
            var type = $(this).attr('data-vision');

            $(this).closest('.profiles_table').find('.units').removeClass('type-list type-grid').addClass(type);

            $(this).parent().find('li').removeClass('active');
            $(this).addClass('active');
        }
    });

    $('.close_reg_blocked').click(function () {
        $('.additional_plus').removeClass('minus');
        $('.show_reg_blocked > .pos_a').fadeOut(200);
        $('.additional_filters_search.fw-hidden').slideUp(500);
    });

    function slides_popup_img() {
        $(".slides_popup img").each(function () {
            var img_h = $(this).outerHeight(),
                img_w = $(this).outerWidth();
            $(this).css({"margin-left": -img_w / 2, "margin-top": -img_h / 2})
        });
    }

    $(document).on('click', '.checkbox_selectlist .select', function () {
        var bl = $(this).closest('.checkbox_selectlist');
        if (!bl.hasClass('active_dd')) {
            $('.checkbox_selectlist').removeClass('active_dd').find('.dropdown').hide();
            bl.addClass('active_dd').find('.dropdown').show();
        } else {
            bl.removeClass('active_dd').find('.dropdown').hide();
        }
    });

    $(document).on('click', '.checkbox_selectlist .dropdown li:first-child', function () {
        $(this).closest('.dropdown').hide();
        $(this).closest('.checkbox_selectlist').removeClass('active_dd');
    });

    $(document).click(function (e) {
        var bl = $(e.target);
        /* console.log(e.target) */

        if (!bl.hasClass('checkbox_selectlist') && bl.closest('.checkbox_selectlist').length < 1) {
            $('.checkbox_selectlist').removeClass('active_dd').find('.dropdown').hide();
        }

        if (!bl.hasClass('drop_menu') && bl.closest('.drop_menu').length < 1 && !bl.hasClass('cogwheel')) {
            $('.settings .drop_menu').slideUp(200);
        }
    });

    $('.add_element_plus').click(function () {
        $(this).closest('.excludes_wrap').find('.ex_contact_list').toggle();
    });

    $('.ex_contact_list').on('click', '.item', function () {
        $('.ex_contact_list').hide();
        var name = $(this).find('.the_name').text();

        $('.block_ex_elements .units_wrap').append('<div class="element_it" data-id="' + $(this).data('id') + '">' + name + '<span class="del_it icon-cancel"></span></div>');

        hideExItem($(this).data('id'));

    });

    function hideExItem(id) {
        $('.ex_contact_list > .item[data-id="' + id + '"]').hide();
    };

    function showExItem(id) {
        $('.ex_contact_list > .item[data-id="' + id + '"]').show();
    };

    $(document).on('click', '.block_ex_elements .del_it', function () {
        $(this).closest('.element_it').remove();
        showExItem($(this).parent().data('id'));
    });

    $('.settings .drop_menu').mouseleave(function () {
        $(this).slideUp(200);
    });

    $(window).resize(function () {
        if ($('.with_scroll').length > 0) {
            $('.with_scroll').each(function () {
                $.isLocked = true;

                var jsp = $(this).data('jsp');

                if (jsp) {
                    jsp.reinitialise();
                }

                $.isLocked = false;
            })
        }
    });
});


$(window).load(function () {
    if ($(".with_scroll:not(#messages-scroll)").length > 0) {
        $('.with_scroll:not(#messages-scroll)').jScrollPane();
    }
});

function move_to_search_bl() {
    $('html, body').animate({scrollTop: $('.profile_table_wrap').offset().top});
}

$(document).ready(function () {
    $('.additional_filters_search .color_sel').each(function () {
        $(this).append('<div class="add_f_wrap"></div>')
    });

    var id_n = 0;

    $('.additional_filters_search .color_sel input[type=checkbox]').each(function () {
        id_n += 1;

        $(this).attr('data-opt-id', id_n);

        if ($(this).is(':checked')) {
            var name = $(this).closest('label').find('*[data-get-value="text-label"]').text();
            $(this).closest('.color_sel').find('.add_f_wrap').append('<div class="dib vam filer_add_element_" data-opt-id="' + id_n + '">' + name + ' <span class="icon-cancel"></span></div>')
        }
    });

    $(document).on('change', '.additional_filters_search .color_sel input[type=checkbox]', function () {
        var id_n = $(this).data('opt-id');
        if ($(this).is(':checked')) {
            var name = $(this).closest('label').find('*[data-get-value="text-label"]').text();
            $(this).closest('.color_sel').find('.add_f_wrap').append('<div class="dib vam filer_add_element_" data-opt-id="' + id_n + '">' + name + ' <span class="icon-cancel"></span></div>')
        } else {
            $(this).closest('.color_sel').find('.add_f_wrap .filer_add_element_[data-opt-id="' + id_n + '"]').remove();
        }
    })

    $(document).on('click', '.filer_add_element_ .icon-cancel', function () {
        var id = $(this).closest('.filer_add_element_').data('opt-id');

        $(this).parent('.filer_add_element_').remove();
        $('.additional_filters_search .color_sel input[type=checkbox][data-opt-id="' + id + '"]').click();
    });


    $('[data-open--tr="true"]').click(function (e) {
        e.preventDefault();

        if ($(this).hasClass('active'))
            return;

        $('[data-the--tr]').hide();
        $('[data-open--tr="true"]').removeClass('active')
        $(this).addClass('active').closest('tr').next('[data-the--tr]').show();
    })

});

function msg_move_bl() {
    var $first = $('.message_table').height();

    return $first;
}

function msg_move_to(bl) {
    var $tp = $('.message_table').height(),
        pos = -($tp - bl);

    $('#messages-scroll').data('jsp').scrollTo(0, -pos);
}


// $(window).resize(function () {
// 	pop_msg_size();
// });
//
// $('.message_popup').click(function(){
// 	pop_msg_size();
// });
//
// $('.message_popup').hover(function(){
// 	pop_msg_size();
// });

setInterval(function () {
    pop_msg_size();
}, 100);

window.pop_msg_size = function () {

    var h = $(window).height() - 40;

    var $message_popup = $('.message_popup');
    var $messages_folders = $('.messages_folders');
    var $bl_title = $('.message_popup .bl_title');
    var $send_block_wrap = $('.message_popup .send_block_wrap');
    var $content_wrap_shadow = $('.message_shadow');
    var $sidebar_msg_contacts = $('.sidebar_msg_contacts');
    var $message_list_wrap = $('.message_list_wrap');
    var $message_list_window = $('.message_list_window');
    var $dialog_list_container = $('.dialog-list-container');
    var $dialog_messages_container = $('.dialog-messages-container');

    if ($content_wrap_shadow && $messages_folders && $messages_folders) {

        var content_wrap_shadow_padding_top = parseInt($content_wrap_shadow.css('padding-top'));
        var messages_folders_padding_top = parseInt($messages_folders.css('margin-top'));
        var messages_folders_padding_g = parseInt($messages_folders.height());

    }

    // console.log(content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g);

    // Main popap
    $message_popup.css('height', h);

    $sidebar_msg_contacts.css('height', $message_popup.height() - (20 + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g));

    $message_list_wrap.css('height', $message_popup.height() - (20 + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g));

    $content_wrap_shadow.css('height', $message_popup.height() - (20 + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g));

    $dialog_list_container.css('height', $message_popup.height() - (20 + 45 + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g))

    // Message list (scroll)
    $message_list_window.css('height', $message_popup.height() - (20 + $bl_title.height() + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g));

    $dialog_messages_container.css('height', $message_popup.height() - (40 + $bl_title.height() + $send_block_wrap.height() + content_wrap_shadow_padding_top + messages_folders_padding_top + messages_folders_padding_g));

    // if ( ! $(".scroll-dialogs").find('.nano-pane').is(':visible') ) {
    // 		$(".scroll-dialogs").nanoScroller();
    // }

}

var RegustrationModule = {};

RegustrationModule.multiselect = function (className) {
    var multiselect = {};
    multiselect.elements = document.querySelectorAll(className);
    multiselect.dropdowns = document.querySelectorAll('.js-multiselect__dropdown');
    multiselect.selectedValues = [];

    multiselect.init = function () {
        multiselect.bindings();
    };

    multiselect.bindings = function () {
        for (var i = 0; i < multiselect.elements.length; i++) {
            var select = multiselect.elements[i];

            multiselect.updateLabels(select);

            // console.log(select);

            select.querySelector('.js-multiselect__current').addEventListener('click', function (e) {
                e.preventDefault();

                var selectEl = this.closest('.js-multiselect');

                if (selectEl.classList.contains('dropdown-open')) {
                    multiselect.hideDropdown(selectEl);
                } else {
                    multiselect.hideDropdown(multiselect.elements);
                    multiselect.showDropdown(selectEl);
                }
            });

            var inputs = select.querySelectorAll('input');

            for (var z = 0; z < inputs.length; z++) {
                inputs[z].addEventListener('change', function () {
                    var parentSelect = this.closest('.js-multiselect');
                    multiselect.updateLabels(parentSelect);
                });
            }
        }

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.js-multiselect')) {
                multiselect.hideDropdown(multiselect.elements);
            }
        });
    };

    multiselect.updateLabels = function (selectBlock) {
        var inputs = selectBlock.querySelectorAll('input');
        var inputsText = [];
        var currentEl = selectBlock.querySelector('.js-multiselect__current');

        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.checked) {
                inputsText.push(input.closest('.js-multiselect__label').innerText);
            }
        }

        if (inputsText.length === 0 && selectBlock.hasAttribute('data-placeholder'))
            currentEl.innerText = selectBlock.getAttribute('data-placeholder');
        else
            currentEl.innerText = inputsText.join(', ');
    };

    multiselect.showDropdown = function (select) {
        select.classList.add('dropdown-open');
    };

    multiselect.hideDropdown = function (select) {
        if (Object.prototype.toString.call(select) == '[object NodeList]') {
            for (var i = 0; i < select.length; i++) {
                select[i].classList.remove('dropdown-open');
            }
        } else {
            select.classList.remove('dropdown-open');
        }
    };

    multiselect.init();
    return multiselect;
};

RegustrationModule.multiselect('.js-multiselect');