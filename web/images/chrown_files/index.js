// Ajax setup
$.ajaxSetup({
    beforeSend: function () {
        // Show spinner
        $(".main_loader").show();
    },
    complete: function () {
        // Hide spinner
        $(".main_loader").hide();
    }
});

var $overlay = $(".overlay");

// Hide all popups then show needle popup
$.displayPopup = function ($popup) {
    $('body').addClass('overflow_h');

    $overlay.stop().fadeIn(400);

    $('*[data-popup-block]:visible').stop().fadeOut(400);

    $popup.stop().fadeIn(400);
};

$.createPopup = function (id, text) {
    var $popup = $('[data-popup-block="' + id + '"]');

    if (!$popup.length) {
        $popup = $(
            '<div class="main_popup send_message_popup tac" data-popup-block="' + id + '"><div class="close_popup" data-popup-close="' + id + '"></div>' +
            '<div class="descr pop_bold_text">' + text + '</div></div>'
        );

        $('.table_wrap > .td_wrap:first').append($popup);
    }

    $.displayPopup($popup);
};

// Hide all popups
$.hidePopup = function () {
    $('body').removeClass('overflow_h');
    $('*[data-popup-block]').stop().fadeOut(400);

    $(".overlay").stop().fadeOut(400);

    $("*[data-popup-open]").removeClass('active');
};

// Show message popup
$.displayMessagePopup = function () {
    $('body').addClass('overflow-message-h');
    $(".messagePopup").css('display', 'block');
    $('.overlay-message').css('display', 'block');
    $('.bg-dialog').css('display', 'block');
    $('.overlay').css('z-index', 55);
};

// Hide message popup
$.hideMessagePopup = function () {
    $('body').removeClass('overflow-message-h');
    $(".messagePopup").css('display', 'none');
    $('.overlay-message').css('display', 'none');
    $('.bg-dialog').css('display', 'none');
    $('.overlay').css('z-index', 51);
};

// Show error on input and in dev somewhere
$.showError = function (response, $input, $error) {
    $input.addClass('error_border');
    $error.show().html(response.message);
};

// Hide error when success response came
$.hideError = function ($input, $error) {
    $input.removeClass('error_border');
    $error.hide().html('');
};

// Create messages scrol
$.createMessagesScroll = function () {
    $.isLocked = true;

    $('.message_list .with_scroll').jScrollPane();

    $.isLocked = false;
};

// Reinitialise messages
$.updateMessagesScroll = function () {
    var $scroll = $('#messages-scroll');

    if ($scroll.length && $scroll.data('jsp')) {
        $scroll.data('jsp').reinitialise();
    } else {
        $.isLocked = true;

        $.createMessagesScroll();

        $.isLocked = false;
    }
};

// Scroll to bottom of messages
$.messagesScrollBottom = function () {
    if ($('#messages-scroll').length) {
        $('#messages-scroll').data('jsp').scrollToBottom();

        $.isLocked = false;
    }
};

// Load new messages when scrolled to top
$.loadMessages = function () {
    $.isLocked = true;

    $.post('/ajax/messages/' + $('#send-message').data('id'), {'part': $.part}, 'json').success(function (response) {
        if (response['content'] != '') {
            var block = msg_move_bl();

            $('#messages-table').prepend(response['content']);

            $.part++;
            $.updateMessagesScroll();

            msg_move_to(block);
        }

        $.isLocked = false;
    });
};

// Show only contacts that belongs to this tab
$.showContactsTab = function () {
    $a = $('.folders_ul li.active a');

    $('.contacts_ul li').hide();

    $('#dialog-in-blacklist').attr('title', 'Добавить в черный список');

    if ($a.parent().hasClass('default_folder')) {
        if ($a.parent().hasClass('dialog-blacklist')) {
            $('.contacts_ul li.dialog-blacklist').show();
            $('#dialog-in-blacklist').attr('title', 'Удалить из черного списка');
        } else if ($a.data('class')) {
            $('.contacts_ul li.' + $a.data('class') + ':not(.dialog-blacklist)').show();
        } else {
            $('.contacts_ul li:not(.dialog-blacklist)').show();
        }
    } else {
        $('.contacts_ul li[data-folder=' + $a.data('id') + ']:not(.dialog-blacklist)').show();
    }

    if ($('.sidebar_msg_contacts .with_scroll').length) {
        $('.sidebar_msg_contacts .with_scroll').data('jsp').destroy();
        $('.sidebar_msg_contacts .with_scroll').jScrollPane();
    }
};

// Set or remove favorite star and class
$.favoriteContact = function ($favorite) {
    if ($favorite.hasClass('icon-star-empty')) {
        $favorite.parent().parent().removeClass('contact-favorite')
    } else {
        $favorite.parent().parent().addClass('contact-favorite')
    }
};

// Update contact tab on new response from socket
$.updateContact = function (friend, me, data) {
    // If no dialogs available before - remove text and show message wrap
    if ($('.no-dialogs-available').length) {
        $('.no-dialogs-available').hide();
        $('.main_massage_wrap').show();
    }

    var $contact = $('.contacts_ul li[data-id=' + friend['id'] + ']');

    if ($contact.length == 0) {
        $contact = $.buildContact(friend['id'], friend['name'], friend['avatar'], data['short_message'], me['tab_unread_messages'], friend['online']);

        $('.contacts_ul').prepend($contact);

        $('.sidebar_msg_contacts .with_scroll').data('jsp').destroy();
        $('.sidebar_msg_contacts .with_scroll').jScrollPane();
    } else {
        $contact.find('.last_message').html(data['short_message']);
    }

    if (friend['online']) {
        $contact.find('.status_round').removeClass('offline').addClass('online');
        $contact.addClass('contact-online');
    } else {
        $contact.find('.status_round').removeClass('online').addClass('offline');
        $contact.removeClass('contact-online');
    }

    if (parseInt(me['unread_messages'], 10) == 0) {
        $contact.addClass('contact-readed');
    } else {
        $contact.removeClass('contact-readed');
    }

    return $contact;
};

// Update messages on new response from socket
$.updateMessages = function (friend, me, data, className, $contact) {
    var $table = $('body').find('.message_table[data-id=' + friend['id'] + ']');

    if ($table.length) {
        if (data['message'] || data['images']) {
            $table.append(
                $.buildMessage(data['from']['id'], data['from']['name'], data['message'], data['time'], data['from']['avatar'], data['from']['type'], data['images'], className)
            );

            $.isLocked = true;
            $.updateMessagesScroll();
            $.messagesScrollBottom();
            $.isLocked = false;
        }

        if (data['gift']) {

            // Template
            var $tmp = $('<div class="message-gift"><img src="' + data['gift'] + '" alt=""></div>');

            $table.find('.message_text:last')
                .append($tmp);


            $tmp.find('img').load(function () {

                $.isLocked = true;
                $.updateMessagesScroll();
                $.messagesScrollBottom();
                $.isLocked = false;

            });


        }

        var $parent = $table.parent().parent().parent();

        if (friend['online']) {
            $parent.find('.lips_ic').addClass('active');
            $parent.find('.dib.status').addClass('online').html('Он-лайн');
        } else {
            $parent.find('.lips_ic').removeClass('active');
            $parent.find('.dib.status').removeClass('online').html(friend['online_ago']);
        }

        // If user send us message in active dialog - mark it all as readed
        if (me == data['to']) {
            $.get('/ajax/mark-readed/' + friend['id'], {}, 'json');
        }

        me['unread_messages'] = parseInt(me['unread_messages'], 10) - parseInt(me['tab_unread_messages'], 10);
    } else {
        $contact.find('.message_num').html(me['tab_unread_messages']);

        if (me['tab_unread_messages'] == '0' || me['tab_unread_messages'] == 0) {
            $contact.find('.message_num').hide();
        } else {
            $contact.find('.message_num').show();
        }
    }
};

$.hideContactsEdit = function () {
    $('.add_folder_btn_wrap').addClass('active_btn');
    $('.add_folder_btn_wrap .add_folder_form').hide();
    $('.edit_params_msg_folder > .item').hide();
    $('.messages_folders .has_del_btn').removeClass('active_btn');
    $('.open_edit_chats').show();
    $('.sidebar_msg_contacts').removeClass('editing_process');

    $('.contacts_ul li .checkbox.active input').each(function () {
        $(this).prop('checked', false);
        $(this).parent().removeClass('active');
    });
};

// Update images on profile page
$.updateProfileImages = function (response) {
    if (!response['content']) {
        return;
    }
    $('.cont_wrap .container').html(response['content']);

    $('#profile-images').slidesjs({
        pagination: false
    });
};

// Show dropblock in profile
$.showDropblock = function ($block) {
    $('.overlay').show();

    $block.show();
};

// Scroll page to needle block
$.scrollToBlock = function (id) {
    var $block = $('#' + id);

    $('html, body').animate({scrollTop: $block.offset().top}, 'slow');
};

// Show or hide that no dialogs available in selected folder
$.showNoDialogsAvailable = function () {
    if ($('body .contacts_ul li:visible').length) {
        $('.no-contacts-available').hide();

        if (!$('body .contacts_ul li:visible:first').hasClass('active')) {
            $('body .contacts_ul li:visible:first label').click();
        }
    } else {
        $('body .contacts_ul li').removeClass('active');

        $('#messages-wrap').html('');
        $('.no-contacts-available').show();
    }
};

$.initialiseSearchAdditionalSliders = function (reset) {
    var heightFrom, heightTo, weightFrom, weightTo;
    if (reset === true || !$('[name="heightFrom"]').length || !$('[name="heightFrom"]').val()) {
        heightFrom = 150;
    } else {
        heightFrom = $('[name="heightFrom"]').val();
    }

    if (reset === true || !$('[name="heightTo"]').length || !$('[name="heightTo"]').val()) {
        heightTo = 170;
    } else {
        heightTo = $('[name="heightTo"]').val();
    }

    $(".height_slider").slider({
        range: true,
        min: 140,
        max: 200,
        values: [heightFrom, heightTo],
        slide: function (event, ui) {
            $(this).find(".amount1").val(ui.values[0]);
            $(this).find(".amount2").val(ui.values[1]);
            $('#reset-search-additional').show();
        }
    });
    $('.height_slider').parent().find(".amount1").val($(".height_slider").slider("values", 0));
    $('.height_slider').parent().find(".amount2").val($(".height_slider").slider("values", 1));

    if (reset === true || !$('[name="weightFrom"]').length || !$('[name="weightFrom"]').val()) {
        weightFrom = 40;
    } else {
        weightFrom = $('[name="weightFrom"]').val();
    }

    if (reset === true || !$('[name="weightTo"]').length || !$('[name="weightTo"]').val()) {
        weightTo = 70;
    } else {
        weightTo = $('[name="weightTo"]').val();
    }

    /* weight slider range */
    $(".weight_slider").slider({
        range: true,
        min: 40,
        max: 150,
        values: [weightFrom, weightTo],
        slide: function (event, ui) {
            $(this).find(".amount1").val(ui.values[0]);
            $(this).find(".amount2").val(ui.values[1]);
            $('#reset-search-additional').show();
        }
    });
    $('.weight_slider').parent().find(".amount1").val($(".weight_slider").slider("values", 0));
    $('.weight_slider').parent().find(".amount2").val($(".weight_slider").slider("values", 1));
};

$.isTabIsActive = function () {
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };

    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }

    return function (c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
};


if (typeof fabric !== 'undefined') {
    var CropZone = fabric.util.createClass(fabric.Circle, {
        _render: function (ctx) {
            this.callSuper('_render', ctx);

            var canvas = ctx.canvas;
            var dashWidth = 7;

            // Set original scale
            var flipX = this.flipX ? -1 : 1;
            var flipY = this.flipY ? -1 : 1;
            var scaleX = flipX / this.scaleX;
            var scaleY = flipY / this.scaleY;

            ctx.scale(scaleX, scaleY);

            // Overlay rendering
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this._renderOverlay(ctx);

            // Set dashed borders
            if (ctx.setLineDash !== undefined)
                ctx.setLineDash([dashWidth, dashWidth]);
            else if (ctx.mozDash !== undefined)
                ctx.mozDash = [dashWidth, dashWidth];

            // First lines rendering with black
            ctx.strokeStyle = 'grey';
            this._renderBorders(ctx);

            // Reset scale
            ctx.scale(1 / scaleX, 1 / scaleY);
        },

        _renderOverlay: function (ctx) {
            var canvas = ctx.canvas;

            var x0 = Math.ceil(-this.getWidth() / 2 - this.getLeft());
            var x1 = Math.ceil(-this.getWidth() / 2);
            var x2 = Math.ceil(this.getWidth() / 2);
            var x3 = Math.ceil(this.getWidth() / 2 + (canvas.width - this.getWidth() - this.getLeft()));

            var y0 = Math.ceil(-this.getHeight() / 2 - this.getTop());
            var y1 = Math.ceil(-this.getHeight() / 2);
            var y2 = Math.ceil(this.getHeight() / 2);
            var y3 = Math.ceil(this.getHeight() / 2 + (canvas.height - this.getHeight() - this.getTop()));

            ctx.beginPath();

            // Draw outer rectangle.
            // Numbers are +/-1 so that overlay edges don't get blurry.
            ctx.moveTo(x0 - 1, y0 - 1);
            ctx.lineTo(x3 + 1, y0 - 1);
            ctx.lineTo(x3 + 1, y3 + 1);
            ctx.lineTo(x0 - 1, y3 - 1);
            ctx.lineTo(x0 - 1, y0 - 1);
            ctx.closePath();

            // Draw inner rectangle.
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x1, y1);

            ctx.closePath();
            ctx.fill();
        },

        _renderBorders: function (ctx) {
            ctx.beginPath();
            ctx.moveTo(-this.getWidth() / 2, -this.getHeight() / 2); // upper left
            ctx.lineTo(this.getWidth() / 2, -this.getHeight() / 2); // upper right
            ctx.lineTo(this.getWidth() / 2, this.getHeight() / 2); // down right
            ctx.lineTo(-this.getWidth() / 2, this.getHeight() / 2); // down left
            ctx.lineTo(-this.getWidth() / 2, -this.getHeight() / 2); // upper left
            ctx.stroke();
        }
    });
}

// Show profile popups for first time excursion
function showPopups() {
    if ($('.added_photo .avatar').attr('src')) {
        $('.main_photo').removeClass('drop_vis');
        $('#dropblock-photo').remove();

        if ($('.city_text').text() == 'Город') {
            $('.city_bl').addClass('drop_vis drop_hover');

            $.showDropblock($('#dropblock-city'));

            $('.receive_calls > .in_bl').addClass('drop_vis drop_hover');
            $.showDropblock($('#dropblock-call'));
        } else if (!$('.the_phone').length) {
            $('#dropblock-city').remove();
            $('.city_bl').removeClass('drop_vis drop_hover');

            $.showDropblock($('#dropblock-call'));

            $('.receive_calls > .in_bl').addClass('drop_vis drop_hover');
        } else {
            $('.overlay').hide();
        }
    } else {
        $('.main_photo').addClass('drop_vis');

        $.showDropblock($('#dropblock-photo'));
    }
}

// Show profile popups for first time sponsor excursion
function showExcursionForSponsor() {
    if ($('.added_photo .avatar').attr('src')) {
        $('.main_photo').removeClass('drop_vis');
        $('#dropblock-photo').remove();

        $('#dropblock-city').remove();
        $('.city_bl').removeClass('drop_vis drop_hover');

        $.showDropblock($('#dropblock-call'));
        $('.receive_calls > .in_bl').addClass('drop_vis drop_hover');
    } else {
        $('.main_photo').addClass('drop_vis');

        $.showDropblock($('#dropblock-photo'));
    }
}

// Get url parameter from URL
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
}

function removeUrlParam(param) {
    return;
    var currentURL = window.location.href + '&';
    var change = new RegExp('(' + param + ')=(.*)&', 'g');
    var newURL = currentURL.replace(change, '');

    if (getURLParameter(param) !== null) {
        try {
            window.history.replaceState('', '', newURL.slice(0, -1));
        } catch (e) {
            console.log(e);
        }
    } else {
        var currURL = window.location.href;
        if (currURL.indexOf("?") !== -1) {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '&' + param + '=' + value);
        } else {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '?' + param + '=' + value);
        }
    }
}

// Change url GET parameter
function changeUrlParam(param, value) {
    var currentURL = window.location.href + '&';
    var change = new RegExp('(' + param + ')=(.*)&', 'g');
    var newURL = currentURL.replace(change, '$1=' + value + '&');

    if (getURLParameter(param) !== null) {
        try {
            window.history.replaceState('', '', newURL.slice(0, -1));
        } catch (e) {
            console.log(e);
        }
    } else {
        var currURL = window.location.href;
        if (currURL.indexOf("?") !== -1) {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '&' + param + '=' + value);
        } else {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '?' + param + '=' + value);
        }
    }
}

// Ajax-load clients search
function loadSearchClients(page) {
    $.each(window.searchData, function (key, value) {
        if (!value) {
            removeUrlParam(key);
        } else if (value instanceof Array) {
            removeUrlParam(key);

            $.each(value, function (valueKey, valueValue) {
                changeUrlParam(key + "[" + valueKey + "]", valueValue);
            });
        } else {
            changeUrlParam(key, value);
        }
    });

    changeUrlParam('page', page);

    if (history !== undefined) {
        history.pushState(window.searchData, 'search', window.location.href);
    }

    $.post('/ajax/search/' + page, window.searchData, 'json').success(function (response) {
        if (response['content']) {
            $('#search-clients').html(response['content']);
        }

        if (response['used_cities'] && response['used_cities'].length > 0) {
            var $element = $('#nearest-cities');

            $element.find('.nearest-city').remove();
            $element.find('#few-users').remove();

            var $p = $('#nearest-cities p');

            $p.show();

            var html = [];
            var used_cities = [];

            $.each(response['used_cities'], function (key, value) {
                html.push('<a href="#" class="nearest-city" data-id="' + value.id + '">' + value.title + '</a>');

                used_cities.push(value.id);
            });

            $p.append(html.join(',&nbsp'));

            $('#nearest-cities').show();

            window.searchData['used_cities'] = used_cities;
        } else {
            $('#nearest-cities .nearest-city').remove();
            $('#nearest-cities').hide();

            delete window.searchData['used_cities'];
        }

        if (response.kept_access_denied) {
            $.displayPopup($('[data-popup-block="kept_access_denied"]'));
        }

        var $mode = $('[data-vision="type-list"]');

        if ($mode.hasClass('active')) {
            $('#search-clients > .units').removeClass('type-grid').addClass('type-list');
        }

        move_to_search_bl();
    });
}

// show announce banner (min) with cookies
function showAnnounceBannerWithCookie(firstTime, minutes) {

    // For first show
    if (!Cookies.get("banner_interval_time")) {
        setTimeout(function () {
            $.hidePopup();
            $.displayPopup($('[data-popup-block="announce_banner"]'));
        }, firstTime * 60 * 1000);

        // Set new cookie
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        Cookies.set("banner_interval_time", "time", {expires: date});

    }

    var i = 0;

    setInterval(function () {
        // if cookie done
        if (!Cookies.get("banner_interval_time")) {

            $.hidePopup();

            // Show banner
            $.displayPopup($('[data-popup-block="announce_banner"]'));

            // Set new cookie
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            Cookies.set("banner_interval_time", "time", {expires: date});
        }
    }, 1000);


}

function showAnnounceBanner(firstTime, lastTime) {
    setTimeout(function () {
        openAnnounceBanner();
    }, firstTime * 1000);

    setTimeout(function () {
        openAnnounceBanner();
    }, (firstTime + lastTime) * 1000);

}

function openAnnounceBanner() {

    if ($('.overlay').css('display') !== 'block') {
        $.displayPopup($('[data-popup-block="announce_banner"]'));
    }

}

var OldCropModule = function (canvasId, $canvasBlock) {
    var self = this;

    self.canvasBlock = $canvasBlock;
    self.canvasId = canvasId;
    self.canvas = null;
    self.image = null;
    self.imageId = null;
    self.imageHeight = null;
    self.imageOriginalHeight = null;
    self.imageWidth = null;
    self.imageOriginalWidth = null;
    self.imageScaleY = null;
    self.imageScaleX = null;
    self.canvasOriginalHeight = null;
    self.canvasOriginalWidth = null;
    self.currentBlurLevel = null;
    self.activeMask = null;
    self.angle = null;
    self.resizeValue = 0;
    self.mainCheckbox = self.canvasBlock.find('#make-main');

    self.dragging = false;
    self.clickPosX = null;
    self.clickPosY = null;

    // Disable clicks on track
    var sliderMouseDown = function (e) {
        var sliderHandle = $('#slider-range').find('.ui-slider-handle');
        if (e.target != sliderHandle[0]) {
            e.stopImmediatePropagation();
        }
    };

    $('#slider-range')
        .on('mousedown', sliderMouseDown)
        .on('touchstart', sliderMouseDown)
        .slider({
            min: 1,
            max: 90,
            slide: function (event, ui) {
                self.zoom(ui.value);
            }
        });

    if (self.mainCheckbox) {
        // Set make_main prop for image object
        self.mainCheckbox.on('change', function () {
            self.image.make_main = self.mainCheckbox.prop('checked');
        });
    }

    // Zoom
    self.zoom = function (value) {
        if (undefined === self.resizeValue) {
            self.resizeValue = 0;
        }

        if (value > self.resizeValue) {
            self.zoomIn(value);
        } else {
            self.zoomOut(value);
        }
    };


    // MAKE EVERYTHING BIGGER WHAHAHA
    self.zoomIn = function (value) {
        var previousValue = self.resizeValue;

        self.resizeValue = value;

        value = value - previousValue;
        value = value / 100;

        var newHeight = self.canvas.height + (self.canvas.height * value);
        var newWidth = self.canvas.width + (self.canvas.width * value);

        if (newHeight > (self.canvasOriginalHeight + 700) || newWidth > (self.canvasOriginalWidth + 700)) {
            return;
        }

        self.canvas.setHeight(newHeight);
        self.canvas.setWidth(newWidth);

        var image = self.canvas.item(0);

        if (image.angle > 0 && (270 % image.angle) == 0) {
            image.setScaleY(self.canvas.height / image.width);
            image.setScaleX(self.canvas.width / image.height);
        } else {
            image.setScaleY(self.canvas.height / image.height);
            image.setScaleX(self.canvas.width / image.width);
        }

        image.setLeft(image.left + (image.left * value));
        image.setTop(image.top + (image.top * value));

        var crop = self.canvas.item(1);

        crop.setTop(crop.top + (crop.top * value));

        if (self.canvas.width >= 570 && crop.width < 570) {
            crop.setLeft((570 - crop.width) / 2);
        } else {
            crop.setLeft(0);
        }

        // If masks exists
        if (self.canvas._objects.length > 2) {
            var mask = self.canvas.item(2);

            mask.setHeight(mask.height + (mask.height * value));
            mask.setWidth(mask.width + (mask.width * value));
            mask.setLeft(mask.left + (mask.left * value));
            mask.setTop(mask.top + (mask.top * value));
            mask.setCoords();
        }

        crop.setCoords();
        image.setCoords();

        /*if ((image.left + image.width) < (crop.left + crop.width)) {
         image.left = crop.left - (crop.left + crop.width) - (image.left + crop.width);
         }

         if ((image.top + image.height) < (crop.top + crop.height)) {
         crop.top = crop.top - (crop.top + crop.height) - (image.top + crop.height);
         }*/

        self.canvas.renderAll();
        self.canvas.calcOffset();

        self.scroll();
    };

    // MAKE EVERYTHING smaller
    self.zoomOut = function (value) {
        var previousValue = self.resizeValue;

        self.resizeValue = value;

        value = previousValue - value;
        value = value / 100;

        var newHeight = self.canvas.height - (self.canvas.height * value);
        var newWidth = self.canvas.width - (self.canvas.width * value);

        if (newHeight < self.canvasOriginalHeight || newWidth < self.canvasOriginalWidth) {
            return;
        }

        self.canvas.setHeight(newHeight);
        self.canvas.setWidth(newWidth);

        var image = self.canvas.item(0);

        if (image.angle > 0 && (270 % image.angle) == 0) {
            image.setScaleY(self.canvas.height / image.width);
            image.setScaleX(self.canvas.width / image.height);
        } else {
            image.setScaleY(self.canvas.height / image.height);
            image.setScaleX(self.canvas.width / image.width);
        }

        image.setLeft(image.left - (image.left * value));
        image.setTop(image.top - (image.top * value));

        var crop = self.canvas.item(1);

        if (self.canvas.width >= 570 && crop.width < 570) {
            crop.setLeft((570 - crop.width) / 2);
        } else {
            crop.setLeft(0);
        }

        // If masks exists
        if (self.canvas._objects.length > 2) {
            var mask = self.canvas.item(2);

            mask.setHeight(mask.height - (mask.height * value));
            mask.setWidth(mask.width - (mask.width * value));
            mask.setLeft(mask.left - (mask.left * value));
            mask.setTop(mask.top - (mask.top * value));
            mask.setCoords();
        }

        crop.setCoords();
        image.setCoords();

        var imageLeftSide = image.left;

        var cropLeftSide = crop.left;
        var cropRightSide = cropLeftSide + crop.width;

        if (image.angle > 0 && (270 % image.angle) == 0) {
            var imageRightSide = imageLeftSide + image.height * image.scaleY;
        } else {
            var imageRightSide = imageLeftSide + image.width * image.scaleX;
        }

        if (image.angle == 90 || image.angle == 180) {
            cropLeftSide += self.canvas.width;
            cropRightSide += self.canvas.width;
        }

        if (imageRightSide < cropRightSide) {
            image.left = image.left + (cropRightSide - imageRightSide);
        }

        if (imageLeftSide > cropLeftSide) {
            image.left = image.left + (cropLeftSide - imageLeftSide);
        }


        var imageTopSide = image.top;

        if (image.angle > 0 && (270 % image.angle) == 0) {
            var imageBottomSide = imageTopSide + image.width * image.scaleX;
        } else {
            var imageBottomSide = imageTopSide + image.height * image.scaleY;
        }

        var cropTopSide = crop.top;
        var cropBottomSide = cropTopSide + crop.height;

        if (image.angle == 180 || image.angle == 270) {
            cropTopSide += self.canvas.height;
            cropBottomSide += self.canvas.height;
        }

        if (imageBottomSide < cropBottomSide) {
            image.top = image.top + (cropBottomSide - imageBottomSide);
        }

        if (imageTopSide > cropTopSide) {
            image.top = image.top + (cropTopSide - imageTopSide);
        }

        crop.setCoords();

        // If not in scroll mode
        if (self.canvas.width < 570) {
            self.canvas.centerObject(crop);
        }

        self.canvas.renderAll();
        self.canvas.calcOffset();

        self.scroll();
    };


    // Scroll to left and top depends on crop position
    self.scroll = function () {
        var crop = self.canvas.item(1);

        var $crop = $('.new-popup-registration__crop');

        $crop.scrollTop(crop.top - ((self.imageHeight - crop.height) / 2));

        if (self.canvas.width > 570) {
            var blockWidth = 570;
        } else {
            var blockWidth = self.canvas.width;
        }

        var newScrollLeft = crop.left - ((blockWidth - crop.width) / 2);

        if (newScrollLeft < 0) {
            $crop.scrollLeft(0);
        } else {
            $crop.scrollLeft(newScrollLeft);
        }
    };

    // Set mask
    self.canvasBlock.on('click', '.mask-item', function () {
        var $this = $(this);

        // If we clicked twice on mask - remove masks and effects
        if ($this.hasClass('active')) {
            self.removeMaskOrEffect();

            $this.removeClass('active');

            return true;
        }

        $('.mask-item').removeClass('active');

        var mask = $this.data('mask');

        if (mask == 'none') {
            self.removeMaskOrEffect();
            self.activeMask = null;

            return true;
        }

        $this.addClass('active');

        if ((mask && self.activeMask == mask) || (mask == undefined && self.activeMask == 'blur')) {
            return false;
        }

        self.activeMask = mask ? mask : 'blur';

        // If data-mask exists - we have to append mask. Otherwise we have to add blur filter
        if (mask) {
            self.setMask($this.data('mask'));
        } else {
            self.setBlur(12);
        }
    });

    // Fire saveImage event
    self.canvasBlock.on('click', '.new-popup-registration__crop-success', function (e) {
        e.preventDefault();

        self.save();

        mediator.publish('crop-save-image', self.image);
    });

    // Create canvas
    self.createCanvas = function () {
        self.canvas = new fabric.Canvas(self.canvasId);
        self.canvas.setWidth(570);
        self.canvas.setHeight(570);
        self.canvas.selectionDashArray = [10, 5];
        self.canvas.selection = false;

        self.canvas.on('object:moving', function (e) {
            var obj = e.target;
            // if object is too big ignore
            if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
                return;
            }

            obj.setCoords();

            // top-left  corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
                obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });

        self.canvas.on('mouse:down', function (e) {
            if (!self.canvas.getActiveObject()) {
                self.dragging = true;
                self.clickPosX = e.e.screenX;
                self.clickPosY = e.e.screenY;
            }
        });

        self.canvas.on('mouse:move', function (e) {
            if (self.canvas.getActiveObject()) {
                self.dragging = false;
            }

            if (self.dragging) {
                var image = self.canvas.item(0);
                var crop2 = self.canvas.item(1);

                var top = image.top;
                var left = image.left;

                // If angle equals to 90\270 - reverse sides
                if (image.angle > 0 && (image.angle % 270) === 0) {
                    var height = image.width * image.scaleX;
                    var width = image.height * image.scaleY;
                } else {
                    var height = image.height * image.scaleY;
                    var width = image.width * image.scaleX;
                }

                var X = (self.clickPosX - e.e.screenX) * -1;
                var Y = (self.clickPosY - e.e.screenY) * -1;

                self.clickPosX = e.e.screenX;
                self.clickPosY = e.e.screenY;

                var newY = Y + top;
                var newX = X + left;

                var topCorner = crop2.top;
                var bottomCorner = crop2.top + crop2.height;

                if (image.angle > 0 && (270 % image.angle ) == 0) {
                    var minImageYCoord = bottomCorner - image.width * image.scaleY;
                } else {
                    var minImageYCoord = bottomCorner - image.height * image.scaleX;
                }

                var maxImageYCoord = topCorner;

                if (image.angle == 180 || image.angle == 270) {
                    minImageYCoord += self.canvas.height;
                    maxImageYCoord += self.canvas.height;
                }

                if (newY < maxImageYCoord && newY > minImageYCoord) {
                    image.setTop(newY);

                    if (self.canvas._objects.length > 2) {
                        self.canvas.item(2).setTop(Y + self.canvas.item(2).top);
                        self.canvas.item(2).setCoords();
                    }
                }


                var leftCorner = crop2.left;
                var rightCorner = crop2.left + crop2.width;

                if (image.angle > 0 && (270 % image.angle ) == 0) {
                    var minImageXCoord = rightCorner - image.height * image.scaleY;
                } else {
                    var minImageXCoord = rightCorner - image.width * image.scaleX;
                }

                var maxImageXCoord = leftCorner;

                if (image.angle == 90 || image.angle == 180) {
                    minImageXCoord += self.canvas.width;
                    maxImageXCoord += self.canvas.width;
                }

                if (newX < maxImageXCoord && newX > minImageXCoord) {
                    image.setLeft(newX);

                    if (self.canvas._objects.length > 2) {
                        self.canvas.item(2).setLeft(X + self.canvas.item(2).left);
                        self.canvas.item(2).setCoords();
                    }
                }

                self.scroll();

                self.canvas.renderAll();
            }
        });

        self.canvas.on('mouse:up', function (e) {
            self.dragging = false;
        });

        self.canvas.on("object:scaling", function (e) {
            var obj = e.target
                , maxWidth = obj.get("maxWidth")
                , maxHeight = obj.get("maxHeight")
                , actualWidth = obj.scaleX * obj.width
                , actualHeight = obj.scaleY * obj.height;

            if (!isNaN(maxWidth) && actualWidth >= maxWidth) {
                // dividing maxWidth by the shape.width gives us our 'max scale'
                obj.set({scaleX: maxWidth / obj.width})
            }

            if (!isNaN(maxHeight) && actualHeight >= maxHeight) {
                obj.set({scaleY: maxHeight / obj.height})
            }

            obj.setCoords();

            // top-left  corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
                obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });


        // Preload masks for fast rendering
        var mask1 = new Image();
        mask1.src = '/images/masks/mask1.png';
        var mask2 = new Image();
        mask2.src = '/images/masks/mask2.png';
        var mask4 = new Image();
        mask4.src = '/images/masks/mask4.png';
    };

    // Clear canvas
    self.clear = function () {
        self.canvas.clear();
    };

    // Remove current active mask or blur effect
    self.removeMaskOrEffect = function () {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];
        self.activeMask = null;

        // If we already have some mask - remove it before create new one
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        // If we already have blur - remove it before mask append
        if (image.filters.length > 0) {
            image.filters = [];

            image.applyFilters(self.canvas.renderAll.bind(self.canvas));
        }
    };

    // Set crop to an image if not defined yet
    self.setCrop = function () {
        // Crop already exists
        if (self.canvas._objects.length > 1) {
            return;
        }

        if (self.canvas.height > self.canvas.width) {
            var defaultSize = self.canvas.width;
        } else {
            var defaultSize = self.canvas.height;
        }

        var defaultSize = 370;
        var size = defaultSize;// * 0.90;

        self.cropZone = new CropZone({
            fill: 'transparent',
            hasBorders: false,
            originX: 'left',
            originY: 'top',
            hasRotatingPoint: false,
            borderColor: 'red',
            cornerColor: 'red',
            cornerSize: 12,
            selectable: false
        });

        if (self.canvas.width > 570) {
            var width = 570;
        } else {
            var width = self.canvas.width;
        }

        self.cropZone.left = (570 - size) / 2;
        self.cropZone.top = (470 - size) / 2;
        self.cropZone.width = size;
        self.cropZone.height = size;

        // Allow only corner resize
        self.cropZone.setControlsVisibility({
            mb: false,
            ml: false,
            mr: false,
            mt: false
        });

        // Set max allowed size
        self.cropZone.set({maxWidth: size, maxHeight: size});
        self.cropZone.setCoords();

        self.canvas.add(self.cropZone);
        self.canvas.renderAll();
    };

    // On publish setImage
    mediator.subscribe('crop-set-image', function (imageClass, $img, isMain) {
        self.setImage(imageClass, $img, isMain);
    });

    // Set image to canvas
    self.setImage = function (imageClass, $img, isMain) {
        self.image = imageClass;
        self.img = $img;
        self.canvas.clear();

        if (self.mainCheckbox) {
            self.mainCheckbox.prop('checked', isMain);

            if (isMain) {
                self.mainCheckbox.parent().addClass('active');
            } else {
                self.mainCheckbox.parent().removeClass('active');
            }

            self.image.make_main = isMain;
        }

        self.canvas.setWidth(570);
        self.canvas.setHeight(570);

        $('.mask-item').removeClass('active');

        var imgInstance = new fabric.Image($img, {
            left: 0,
            top: 0,
            selectable: false
        });

        var width = imgInstance.width;
        var height = imgInstance.height;
        var ratio = 1;

        self.imageOriginalHeight = height;
        self.imageOriginalWidth = width;

        var newRatio = (imgInstance.width / imgInstance.height) * 570;

        self.canvas.setWidth(newRatio);

        imgInstance.set({
            scaleY: self.canvas.height / imgInstance.height,
            scaleX: self.canvas.width / imgInstance.width,
            selectable: false
        });

        self.imageHeight = self.imageOriginalHeight * imgInstance.scaleY;
        self.imageWidth = self.imageOriginalWidth * imgInstance.scaleX;
        self.imageScaleY = imgInstance.scaleY;
        self.imageScaleX = imgInstance.scaleX;

        self.canvas.add(imgInstance);

        self.setCrop();

        self.canvasOriginalHeight = self.canvas.height;
        self.canvasOriginalWidth = self.canvas.width;
    };

    // Set mask to canvas
    self.setMask = function (url) {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];
        self.activeMask = url;

        // If we already have some mask - remove it before create new one
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        // If we already have blur - remove it before mask append
        if (image.filters.length > 0) {
            image.filters = [];

            image.applyFilters(self.canvas.renderAll.bind(self.canvas));
        }

        fabric.Image.fromURL(url, function (oImg) {
            var heightCoff = oImg.height / self.canvasOriginalHeight;
            var widthCoff = oImg.width / self.canvasOriginalWidth;

            if (oImg.height > oImg.width) {
                var ratio = (oImg.height / self.canvasOriginalHeight) / 3;
            } else {
                var ratio = (oImg.width / self.canvasOriginalHeight) / 3;
            }

            var crop = self.canvas.item(1);

            var left = crop.left + (crop.width / 3);
            var top = crop.top + (crop.height / 3);

            oImg.set({
                top: top,
                left: left,
                height: oImg.height * ratio,
                width: oImg.width * ratio,
                borderColor: 'white',
                cornerColor: 'red',
                cornerSize: 12,
                transparentCorners: false
            });

            oImg.setControlsVisibility({
                mt: false,
                mb: false,
                ml: false,
                mr: false
            });

            self.canvas.add(oImg);
            self.canvas.setActiveObject(oImg);
        });
    };

    // Set blur filter
    self.setBlur = function (level) {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];
        self.activeMask = 'blur';

        // If we already have some mask - remove it before blur append
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        if (image.filters.length == 0) {
            image.filters.push(new fabric.Image.filters.GaussianBlur(level));
            image.applyFilters(self.canvas.renderAll.bind(self.canvas));

            self.currentBlurLevel = level;
        }
    };

    // Save image changes
    self.save = function () {
        var image = self.canvas._objects[0];
        var crop = self.canvas._objects[1];

        if (image.angle == 90) {
            var left = image.left - self.canvas.width;
            var top = image.top;
        } else if (image.angle == 180) {
            var left = image.left - self.canvas.width;
            var top = image.top - self.canvas.height;
        } else if (image.angle == 270) {
            var left = image.left;
            var top = image.top - self.canvas.height;
        } else {
            var left = image.left;
            var top = image.top;
        }

        // If we added mask
        if (self.canvas._objects.length > 2) {
            var mask = self.canvas._objects[2];
            var angle = mask.angle;

            // Set angle to 0 for valid left\top offsets
            mask.setAngle(0);

            self.image.mask = $('.mask-item.active').data('mask-name');
            self.image.mask_height = mask.height * mask.scaleX;
            self.image.mask_width = mask.width * mask.scaleY;
            self.image.mask_left = mask.left - left;
            self.image.mask_top = mask.top - top;
            self.image.mask_angle = angle;

            // Set angle to back for valid preview image
            mask.setAngle(angle);
        }

        // If we added blur
        if (image.filters.length > 0) {
            self.image.mask = 'blur';
            self.image.blur_level = self.currentBlurLevel;
        }

        self.image.width = self.canvas.width;
        self.image.height = self.canvas.height;
        self.image.cropX = crop.width * crop.scaleY;
        self.image.cropY = crop.height * crop.scaleX;
        self.image.left = crop.left < 0 ? 0 : crop.left - left;
        self.image.top = crop.top < 0 ? 0 : crop.top - top;
        self.image.deg = image.angle;

        if (self.image.previewElement) {
            self.image.previewElement.find('img').attr('src', self.canvas.toDataURL({
                left: crop.left,
                top: crop.top,
                width: crop.width * crop.scaleY,
                height: crop.height * crop.scaleX
            }));
        }

        $('#slider-range').slider('value', 1);

        if (self.image.make_main) {
            mediator.publish('crop-uncheck-main-flag-for-all-images-except-one', self.image);
        }
    };

    // Rotate everything on canvas
    self.rotateCanvas = function (angle) {
        var image = self.canvas.item(0);
        angle = (image.get('angle') + angle) % 360;

        if (angle < 0) {
            angle = 360 + angle;
        }

        self.removeMaskOrEffect();
        self.canvas.item(1).remove();

        for (var i = 1; i < self.canvas._objects.length; i++) {
            self.canvas.item(i).remove();
        }

        if ((270 % angle) == 0) {
            var needleWidth = (image.height / image.width) * 570;

            self.canvas.setHeight(570);
            self.canvas.setWidth(needleWidth);

            image.set({
                scaleY: self.canvas.width / image.height,
                scaleX: self.canvas.height / image.width,
                selectable: false
            });
        } else {
            var needleWidth = (image.width / image.height) * 570;

            self.canvas.setHeight(570);
            self.canvas.setWidth(needleWidth);

            image.set({
                scaleY: self.canvas.height / image.height,
                scaleX: self.canvas.width / image.width,
                selectable: false
            });
        }

        image.originX = 'left';
        image.originY = 'top';

        image.setAngle(angle).setCoords();

        if (angle == 90) {
            image.setLeft(self.canvas.width);
            image.setTop(0);
        } else if (angle == 180) {
            image.setLeft(self.canvas.width);
            image.setTop(self.canvas.height);
        } else if (angle == 270) {
            image.setLeft(0);
            image.setTop(self.canvas.height);
        } else {
            image.setLeft(0);
            image.setTop(0);
        }

        image.setCoords();

        self.setCrop();

        $('#slider-range').slider('value', 1);
    };

    self.createCanvas();
};

// Place caret in contenteditable at end
function placeCaretAtEnd(el) {
    el.focus();

    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

// Image model
var ImgModel = function (value, previewElement, width, height) {
    var self = this;

    self.value = value;
    self.previewElement = previewElement;
    self.id = null;
    self.width = width;
    self.height = height;
    self.left = 0;
    self.top = 0;
    self.cropX = null;
    self.cropY = null;
    self.deg = 0;
    self.mask = null;
    self.mask_height = null;
    self.mask_width = null;
    self.mask_left = null;
    self.mask_top = null;
    self.mask_angle = null;
    self.blur_level = null;
    self.make_main = false;

    // Image resize ratio
    self.ratio = null;

    // Crop data
    self.cropWidth = null;
    self.cropHeight = null;
    self.cropLeft = null;
    self.cropTop = null;

    // Get params to JSON request
    self.getParams = function () {
        return {
            left: self.left,
            top: self.top,
            cropX: self.cropX,
            cropY: self.cropY,
            canvas_height: self.canvas_height,
            canvas_width: self.canvas_width,
            mask: self.mask,
            mask_width: self.mask_width,
            mask_height: self.mask_height,
            mask_left: self.mask_left,
            mask_top: self.mask_top,
            mask_angle: self.mask_angle,
            blur_level: self.blur_level
        };
    };

    // Reset all crop and masks data
    self.resetEditorData = function () {
        self.left = 0;
        self.top = 0;
        self.cropX = null;
        self.cropY = null;
        self.deg = 0;
        self.mask = null;
        self.mask_height = null;
        self.mask_width = null;
        self.mask_left = null;
        self.mask_top = null;
        self.mask_angle = null;
        self.blur_level = null;
    };
};
// Crop-module, based on HTML5 canvas and FabricJs library
var CropModule = function (canvasId, $canvasBlock) {
    var self = this;

    // Id of the canvas element
    self.canvasId = canvasId;

    // Crop element on canvas
    self.crop = null;

    // Crop coordinates (because it never moves)
    self.cropLeft = null;
    self.cropRight = null;
    self.cropTop = null;
    self.cropBottom = null;

    // Default size of the crop element
    self.cropSize = 370;

    // ImageModel of the current image
    self.image = null;

    // DOM-element of the current image
    self.imageElement = null;

    // Visible width and height of the canvas element
    self.visibleWidth = 375;
    self.visibleHeight = 375;

    // Active mask's url
    self.activeMask = null;

    // Level of the blur effect
    self.blurLevel = null;

    // If left-mouse was held
    self.dragging = false;

    // Click position of mouse on click event
    self.clickPosX = null;
    self.clickPosY = null;

    // Last resize value coof
    self.lastResizeValue = 0;

    // Original sizes of all elements for good resize implementation
    self.originalSizes = {};

    // Main checkbox
    self.mainCheckbox = $canvasBlock.find('#make-main');

    if (self.mainCheckbox) {
        // Set make_main prop for image object
        self.mainCheckbox.on('change', function () {
            self.image.make_main = self.mainCheckbox.prop('checked');
        });
    }

    // Set an image on the event
    mediator.subscribe('crop-set-image', function (imageClass, $img, isMain) {
        self.setImage(imageClass, $img, isMain);
    });

    // Set a mask on the event
    mediator.subscribe('crop-set-mask', function (maskName, maskUrl) {
        self.setMask(maskName, maskUrl);
    });

    // Set blur effect on the event
    mediator.subscribe('crop-set-blur', function () {
        self.setBlur(18);
    });

    // Remove mask and blur effects from crop
    mediator.subscribe('crop-remove-effects', function () {
        self.removeEffects();
    });

    // Save current image and fire the event
    mediator.subscribe('crop-save-current-image', function () {
        self.save();
    });

    // Zoom crop
    mediator.subscribe('crop-zoom', function (value) {
        self.zoom(value);
    });

    // Initialize canvas
    self.createCanvas = function () {
        self.canvas = new fabric.Canvas(self.canvasId);

        // Set-up default width and height (we'll change it on email)
        self.canvas.setWidth(self.visibleWidth);
        self.canvas.setHeight(self.visibleHeight);
        self.canvas.selectionDashArray = [10, 5];
        self.canvas.selection = false;

        // On click set dragging flasg and X\Y coordinates of click (if mask not selected)
        self.canvas.on('mouse:down', function (e) {
            if (!self.canvas.getActiveObject()) {
                self.dragging = true;
                self.clickPosX = e.e.screenX;
                self.clickPosY = e.e.screenY;
            }
        });

        // Move image on mouse move, if mouse was held earlier
        self.canvas.on('mouse:move', function (e) {
            if (self.canvas.getActiveObject()) {
                self.dragging = false;
            }

            // Only if we drag the mouse
            if (!self.dragging) {
                return false;
            }

            var currentX = e.e.screenX;
            var currentY = e.e.screenY;

            // Calculate difference in the coordinates
            var XDiff = (self.clickPosX - currentX) * -1;
            var YDiff = (self.clickPosY - currentY) * -1;

            // Set-up current mouse coordinates
            self.clickPosX = currentX;
            self.clickPosY = currentY;

            // Get elements
            var image = self.canvas.item(0);
            var crop = self.canvas.item(1);
            var mask = self.canvas.item(2);

            var cropTop = crop.top;
            var cropBottom = cropTop + crop.height;
            var cropLeft = crop.left;
            var cropRight = cropLeft + crop.width;

            // If image doesn't go beyond crop's left\right coordinates - set new left coordinate
            if ((self.getImageLeftCoordinate(image) + XDiff) < cropLeft && (self.getImageRightCoordinate(image) + XDiff) > cropRight) {
                image.setLeft(image.getLeft() + XDiff);

                if (mask) {
                    mask.left += XDiff;

                    mask.setCoords();
                }
            }

            // If image doesn't go beyond crop's top\bottom coordinates - set new top coordinate
            if ((self.getImageTopCoordinate(image) + YDiff) < cropTop && (self.getImageBottomCoordinate(image) + YDiff) > cropBottom) {
                image.setTop(image.getTop() + YDiff);

                if (mask) {
                    mask.top += YDiff;

                    mask.setCoords();
                }
            }

            image.setCoords();

            self.canvas.renderAll();
        });

        // Release left-mouse and setup dragging flag
        self.canvas.on('mouse:up', function (e) {
            self.dragging = false;
        });

        // Preload masks for the better rendering
        var mask1 = new Image();
        mask1.src = '/images/masks/mask1.png';
        var mask2 = new Image();
        mask2.src = '/images/masks/mask2.png';
        var mask4 = new Image();
        mask4.src = '/images/masks/mask4.png';
    };

    // Rotate canvas with image (remove other stuff or recreate it)
    self.rotateCanvas = function (angle) {
        var image = self.canvas.item(0);

        angle = (image.get('angle') + angle) % 360;

        if (angle < 0) {
            angle = 360 + angle;
        }

        // Clear crop and mask before rotate
        self.removeEffects();

        self.canvas.item(1).remove();
        self.crop = null;

        // Set image's angle
        image.setAngle(angle).setCoords();

        // For 90* and 180* we should take other side's size
        if (angle == 90 || angle == 270) {
            var imageWidth = self.image.height;
            var imageHeight = self.image.width;
        } else {
            var imageWidth = self.image.width;
            var imageHeight = self.image.height;
        }

        // Calculate size ratio by the smallest side
        var ratio = self.calculateImageRatio(imageWidth, imageHeight);

        var newCanvasHeight = imageHeight * ratio;
        var newCanvasWidth = imageWidth * ratio;

        self.canvas.setWidth(newCanvasWidth);
        self.canvas.setHeight(newCanvasHeight);

        image.set({
            scaleY: ratio,
            scaleX: ratio
        });

        self.setImageCenterCoordinates(image);

        image.setCoords();

        self.canvas.renderAll();

        // Recreate crop
        self.setCrop();
    };

    // Clear everything on the canvas
    self.clear = function () {
        self.canvas.clear();

        self.crop = null;
    };

    // Set image to canvas
    self.setImage = function (imageClass, $img, isMain) {
        self.image = imageClass;
        self.imageElement = $img;

        // First - clear everything on canvas
        self.clear();

        // Check if image is main
        if (self.mainCheckbox) {
            self.mainCheckbox.prop('checked', isMain);

            if (isMain) {
                self.mainCheckbox.parent().addClass('active');
            } else {
                self.mainCheckbox.parent().removeClass('active');
            }

            self.image.make_main = isMain;
        }

        // Reset width and height of the canvas to the default values
        self.canvas.setWidth(self.visibleWidth);
        self.canvas.setHeight(self.visibleHeight);

        // Create ImgInstance
        var imgInstance = new fabric.Image($img, {
            left: 0,
            top: 0,
            selectable: false,
            originX: 'center',
            originY: 'center'
        });

        var imageWidth = imgInstance.width;
        var imageHeight = imgInstance.height;

        // Calculate size ratio by the smallest side
        var ratio = self.calculateImageRatio(imageWidth, imageHeight);

        var newCanvasHeight = imageHeight * ratio;
        var newCanvasWidth = imageWidth * ratio;

        self.canvas.setWidth(newCanvasWidth);
        self.canvas.setHeight(newCanvasHeight);

        imgInstance.set({
            scaleY: ratio,
            scaleX: ratio,
            selectable: false
        });

        self.setImageCenterCoordinates(imgInstance);

        self.canvas.add(imgInstance);
        self.canvas.renderAll();

        // Create crop element
        self.setCrop();

        // Set original sizes
        self.setOriginalSizes();
    };

    // Set image center coordinates for center based coordinate system
    self.setImageCenterCoordinates = function (imgInstance) {
        if (imgInstance.get('angle') == 90 || imgInstance.get('angle') == 270) {
            imgInstance.setLeft((imgInstance.scaleX * imgInstance.height) / 2);
            imgInstance.setTop((imgInstance.scaleY * imgInstance.width) / 2);
        } else {
            imgInstance.setLeft((imgInstance.scaleX * imgInstance.width) / 2);
            imgInstance.setTop((imgInstance.scaleY * imgInstance.height) / 2);
        }
    };

    // Get image left corner coordinate
    self.getImageLeftCoordinate = function (imgInstance) {
        if (imgInstance.get('angle') == 90 || imgInstance.get('angle') == 270) {
            return imgInstance.getLeft() - ((imgInstance.height * imgInstance.scaleX) / 2);
        }

        return imgInstance.getLeft() - ((imgInstance.width * imgInstance.scaleX) / 2);
    };

    // Get image right corner coordinate
    self.getImageRightCoordinate = function (imgInstance) {
        if (imgInstance.get('angle') == 90 || imgInstance.get('angle') == 270) {
            return imgInstance.getLeft() + ((imgInstance.height * imgInstance.scaleX) / 2);
        }

        return imgInstance.getLeft() + ((imgInstance.width * imgInstance.scaleX) / 2);
    };

    // Get image top corner coordinate
    self.getImageTopCoordinate = function (imgInstance) {
        if (imgInstance.get('angle') == 90 || imgInstance.get('angle') == 270) {
            return imgInstance.getTop() - ((imgInstance.width * imgInstance.scaleY) / 2);
        }

        return imgInstance.getTop() - ((imgInstance.height * imgInstance.scaleY) / 2);
    };

    // Get image bottom corner coordinate
    self.getImageBottomCoordinate = function (imgInstance) {
        if (imgInstance.get('angle') == 90 || imgInstance.get('angle') == 270) {
            return imgInstance.getTop() + ((imgInstance.width * imgInstance.scaleY) / 2);
        }

        return imgInstance.getTop() + ((imgInstance.height * imgInstance.scaleY) / 2);
    };

    // Calculate image size ratio from width and height
    self.calculateImageRatio = function (imageWidth, imageHeight) {
        if (imageHeight < imageWidth) {
            return self.visibleHeight / imageHeight;
        }

        return self.visibleWidth / imageWidth;
    };

    // Create crop element
    self.setCrop = function () {
        // Crop already exists
        if (self.crop != null) {
            return false;
        }

        // Create crop
        self.crop = new CropZone({
            fill: 'none',
            hasBorders: true,
            originX: 'left',
            originY: 'top',
            hasRotatingPoint: false,
            borderColor: 'grey',
            cornerColor: 'grey',
            cornerSize: 12,
            strokeWidth: 0,
            selectable: false
        });

        var cropSize = self.canvas.height > self.canvas.width ? self.canvas.width : self.canvas.height;

        self.crop.setWidth(self.cropSize);
        self.crop.setHeight(self.cropSize);

        // Center crop
        var canvasVisibleWidth = self.canvas.width > 570 ? 570 : self.canvas.width;
        var canvasVisibleHeight = self.canvas.height > 470 ? 470 : self.canvas.height;

        // Calculate crop start left and top positions
        var startLeftPosition = (canvasVisibleWidth - self.cropSize) / 2;
        var startTopPosition = (canvasVisibleHeight - self.cropSize) / 2;

        self.crop.setLeft(startLeftPosition);
        self.crop.setTop(startTopPosition);

        // Put crop on the canvas
        self.crop.setCoords();

        self.canvas.add(self.crop);
        self.canvas.renderAll();

        self.setCropCoordinates();
    };

    // Calculate crop coordinates (top, bottom, left, right)
    self.setCropCoordinates = function () {
        self.cropTop = self.crop.top;
        self.cropBottom = self.cropTop + self.crop.height;
        self.cropLeft = self.crop.left;
        self.cropRight = self.cropLeft + self.crop.width;
    };

    // Set mask to canvas
    self.setMask = function (name, url) {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];

        // If mask already set - remove it
        if (self.activeMask == name) {
            self.removeEffects();

            return false;
        }

        self.activeMask = name;

        // If we already have some mask - remove it before create new one
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        // If we already have blur - remove it before mask add
        if (image.filters.length > 0) {
            image.filters = [];

            image.applyFilters(self.canvas.renderAll.bind(self.canvas));
        }

        fabric.Image.fromURL(url, function (oImg) {
            if (oImg.width < oImg.height) {
                var ratio = (self.canvas.width / oImg.width) / 5;
            } else {
                var ratio = (self.canvas.height / oImg.height) / 5;
            }

            var crop = self.canvas.item(1);

            var left = crop.left + (crop.width / 2) - (oImg.width * ratio);
            var top = crop.top + (crop.height / 2) - (oImg.height * ratio);

            oImg.set({
                top: top,
                left: left,
                height: oImg.height * ratio,
                width: oImg.width * ratio,
                borderColor: 'white',
                cornerColor: 'red',
                cornerSize: 12,
                transparentCorners: false
            });

            oImg.setControlsVisibility({
                mt: false,
                mb: false,
                ml: false,
                mr: false
            });

            self.canvas.add(oImg);
            self.canvas.setActiveObject(oImg);

            // Set mask original sizes
            self.setMaskOriginalSizes(oImg);
        });
    };

    // Set blur effect
    self.setBlur = function (blurLevel) {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];

        self.activeMask = 'blur';
        self.blurLevel = blurLevel;

        // If we already have some mask - remove it before blur append
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        // If blur wasn't appended yer - append it. Otherwise remove it.
        if (image.filters.length == 0) {
            image.filters.push(new fabric.Image.filters.GaussianBlur(self.blurLevel));
            image.applyFilters(self.canvas.renderAll.bind(self.canvas));
        } else {
            self.removeEffects();
        }
    };

    // Remove mask or blur effects
    self.removeEffects = function () {
        var canvasObjects = self.canvas._objects;
        var image = canvasObjects[0];

        self.activeMask = null;

        // If we already have some mask - remove it before create new one
        if (canvasObjects.length > 2) {
            self.canvas.remove(canvasObjects[canvasObjects.length - 1]);

            self.canvas.renderAll();
        }

        // If we already have blur - remove it before mask append
        if (image.filters.length > 0) {
            image.filters = [];

            image.applyFilters(self.canvas.renderAll.bind(self.canvas));
        }
    };

    // Save the image
    self.save = function () {
        // Get the image instance
        var image = self.canvas.item(0);
        var crop = self.canvas.item(1);

        // Left coordinate
        var left = self.getImageLeftCoordinate(image);

        // Top coordinate
        var top = self.getImageTopCoordinate(image);

        // Set up images params
        self.image.deg = image.angle;

        if (self.image.deg == 90 || self.image.deg == 270) {
            self.image.width = self.canvas.height;
            self.image.height = self.canvas.width;
        } else {
            self.image.width = self.canvas.width;
            self.image.height = self.canvas.height;
        }

        // If we used the mask - setup mask data
        if (self.canvas._objects.length > 2) {
            var mask = self.canvas._objects[2];
            var maskAngle = mask.angle;

            // Set angle to 0 for valid left\top offsets
            mask.setAngle(0);

            self.image.mask = self.activeMask;
            self.image.mask_height = mask.height * mask.scaleX;
            self.image.mask_width = mask.width * mask.scaleY;
            self.image.mask_left = mask.left - left;
            self.image.mask_top = mask.top - top;
            self.image.mask_angle = maskAngle;

            // Set angle to back for valid preview image
            mask.setAngle(maskAngle);
        }

        // If we used the blur effect
        if (image.filters.length > 0) {
            self.image.mask = 'blur';
            self.image.blur_level = self.currentBlurLevel;
        }

        // Set image's ratio
        self.image.ratio = image.scaleX;

        self.image.cropLeft = crop.left - left;
        self.image.cropTop = crop.top - top;
        self.image.cropWidth = crop.width * crop.scaleX;
        self.image.cropHeight = crop.height * crop.scaleY;

        /// Update previewElement
        if (self.image.previewElement) {
            self.image.previewElement.find('img').attr('src', self.canvas.toDataURL({
                left: crop.left,
                top: crop.top,
                width: self.image.cropWidth,
                height: self.image.cropHeight
            }));
        }

        mediator.publish('crop-save-image', self.image);

        // Reset slider data
        self.lastResizeValue = 0;

        mediator.publish('crop-reset-slider');

        if (self.image.make_main) {
            mediator.publish('crop-uncheck-main-flag-for-all-images-except-one', self.image);
        }
    };

    // Zoom canvas and all elements
    self.zoom = function (value) {
        var image = self.canvas.item(0);
        var crop = self.canvas.item(1);
        var mask = self.canvas.item(2);

        // If last resize value equals to zero
        if (self.lastResizeValue == 0) {
            self.setOriginalSizes();
        }

        if (value == 1) {
            value = 0;
        }

        if (value > self.lastResizeValue) {
            // Zoom in
            var difference = value - self.lastResizeValue;

            self.lastResizeValue = value;

            var ratio = difference / 100;

            var widthBeforeZoom = image.width * image.scaleX;
            var heightBeforeZoom = image.height * image.scaleY;

            var imageScaleXDiff = self.originalSizes['image']['scaleX'] * ratio;
            var imageScaleYDiff = self.originalSizes['image']['scaleY'] * ratio;

            image.scaleX = image.scaleX + imageScaleXDiff;
            image.scaleY = image.scaleY + imageScaleYDiff;

            var widthAfterZoom = image.width * image.scaleX;
            var heightAfterZoom = image.height * image.scaleY;

            var widthDiff = widthAfterZoom - widthBeforeZoom;
            var heightDiff = heightAfterZoom - heightBeforeZoom;

            var newCanvasWidth = image.width * image.scaleX;
            var newCanvasHeight = image.height * image.scaleY;

            self.canvas.setWidth(newCanvasWidth);
            self.canvas.setHeight(newCanvasHeight);

            var imageLeftDiff = self.originalSizes['image']['left'] * ratio;
            var imageTopDiff = self.originalSizes['image']['top'] * ratio;

            var imageOriginalLeft = image.left;
            var imageOriginalTop = image.top;

            image.left = image.left + imageLeftDiff;
            image.top = image.top + imageTopDiff;

            crop.left = crop.left + (self.originalSizes['crop']['left'] * ratio);
            crop.top = crop.top + (self.originalSizes['crop']['top'] * ratio);

            // Resize and move a mask
            if (mask) {
                mask.width = mask.width + (mask.width * ratio);
                mask.height = mask.height + (mask.height * ratio);
                mask.left = mask.left + (mask.left * ratio);
                mask.top = mask.top + (mask.top * ratio);
            }

            self.canvas.renderAll();
        } else {
            // Zoom out
            var difference = self.lastResizeValue - value;

            self.lastResizeValue = value;

            var ratio = difference / 100;

            var imageScaleXDiff = self.originalSizes['image']['scaleX'] * ratio;
            var imageScaleYDiff = self.originalSizes['image']['scaleY'] * ratio;

            image.scaleX = image.scaleX - imageScaleXDiff;
            image.scaleY = image.scaleY - imageScaleYDiff;

            var newCanvasWidth = image.width * image.scaleX;
            var newCanvasHeight = image.height * image.scaleY;

            self.canvas.setWidth(newCanvasWidth);
            self.canvas.setHeight(newCanvasHeight);

            var imageLeftDiff = self.originalSizes['image']['left'] * ratio;
            var imageTopDiff = self.originalSizes['image']['top'] * ratio;

            image.left = image.left - imageLeftDiff;
            image.top = image.top - imageTopDiff;

            crop.left = crop.left - (self.originalSizes['crop']['left'] * ratio);
            crop.top = crop.top - (self.originalSizes['crop']['top'] * ratio);

            // Resize and move a mask
            if (mask) {
                mask.width = mask.width - (mask.width * ratio);
                mask.height = mask.height - (mask.height * ratio);
                mask.left = mask.left - (mask.left * ratio);
                mask.top = mask.top - (mask.top * ratio);
            }

            self.canvas.renderAll();
        }

        // Center crop
        var canvasVisibleWidth = self.canvas.width > 570 ? 570 : self.canvas.width;
        var canvasVisibleHeight = self.canvas.height > 470 ? 470 : self.canvas.height;

        var needleCropLeft = (canvasVisibleWidth - crop.width) / 2;
        var needleCropTop = (canvasVisibleHeight - crop.height) / 2;

        crop.setLeft(needleCropLeft);
        crop.setTop(needleCropTop);

        var cropTop = crop.top;
        var cropBottom = cropTop + crop.height;
        var cropLeft = crop.left;
        var cropRight = cropLeft + crop.width;

        // Check if crop went beyond the borders
        if (self.getImageLeftCoordinate(image) > cropLeft) {
            var diff = self.getImageLeftCoordinate(image) - cropLeft;

            image.left -= diff;

            if (mask) {
                mask.left -= diff;
            }
        }

        if (self.getImageRightCoordinate(image) < cropRight) {
            var diff = cropRight - self.getImageRightCoordinate(image);

            image.left += diff;

            if (mask) {
                mask.left += diff;
            }
        }

        if (self.getImageTopCoordinate(image) > cropTop) {
            var diff = self.getImageTopCoordinate(image) - cropTop;

            image.top -= diff;

            if (mask) {
                mask.top -= diff;
            }
        }

        if (self.getImageBottomCoordinate(image) < cropBottom) {
            var diff = cropBottom - self.getImageBottomCoordinate(image);

            image.top += diff;

            if (mask) {
                mask.top += diff;
            }
        }

        self.canvas.renderAll();
    };

    // Set original sizes values
    self.setOriginalSizes = function () {
        var image = self.canvas.item(0);
        var crop = self.canvas.item(1);
        var mask = self.canvas.item(2);

        self.originalSizes = {
            'canvas': {
                'width': self.canvas.width,
                'height': self.canvas.height
            }, 'image': {
                'scaleX': image.scaleX,
                'scaleY': image.scaleY,
                'left': image.left,
                'top': image.top
            }, 'crop': {
                'width': crop.width,
                'height': crop.height,
                'left': crop.left,
                'top': crop.top
            }, 'mask': {
                'width': 0,
                'height': 0,
                'left': 0,
                'top': 0
            }
        };

        if (mask) {
            self.setMaskOriginalSizes(mask);
        }
    };

    // Set original sizes of a mask
    self.setMaskOriginalSizes = function (mask) {
        self.originalSizes['mask'] = {
            'width': mask.width,
            'height': mask.height,
            'left': mask.left,
            'top': mask.top
        };
    };

    // Initialize the canvas on module initialization
    self.createCanvas();
};
/**
 * Adv messages file
 * For awesome adv messages functional
 */

$(document).ready(function () {
    // Render adv in archive
    function renderAdv(item) {
        var $template = '<div class="delivery-archive__item clearfix" data-id="' + item.id + '"><div class="delivery-archive__item-visible clearfix"><div class="delivery-archive__time l_bl">'
            + item.createdAtText + '</div><div class="delivery-archive__content ovh">'
            + item.message + '</div></div>';

        // Add interests and blacklist
        $template += ' <div class="delivery-archive__hidden hidden"><div class="ng-isolate-scope"><div class="ex-contact-list round-10">' +
            '<div class="drap-and-drop-block"><div class="pull-left w50"><div class="header"><h3 class="text-center">Отклики</h3><div class="mrg-15">&nbsp;</div>' +
            '</div><div class="body"><div class="nano-custom nano has-scrollbar"><div class="nano-content" ng-transclude="" tabindex="0" style="right: -17px;">';

        if (item.interests.length == 0) {
            $template += '<p class="text-center mrg-15 ng-scope">Нет откликов</p>';
        }

        $template += '<ul class="items round-6 ng-scope ng-isolate-scope">';

        $.each(item.interests, function (key, user) {
            $template += '<li class="item pointer ng-scope"><a href="/profile/she/'+user.id+'"><div class="avatar-34 round-6 pull-left">' +
                '<img src="' + user.avatar + '" data-evernote-hover-show="true">' +
                '</div><div class="text-34 pull-left ng-binding">' + user.name + ', ' + user.age + '</div>' +
                '<div class="clearfix"></div></a></li>';
        });

        $template += '</ul></div><div class="nano-pane" style="display: block;"><div class="nano-slider"' +
            'style="height: 323px; transform: translate(0px, 0px);"></div></div></div></div></div><div class="pull-right w50"><div class="header">' +
            '<h3 class="text-center">Черный список</h3><div class="mrg-15">&nbsp;</div></div><div class="body"><div class="nano-custom round-6 nano has-scrollbar">' +
            '<div class="nano-content" tabindex="0" style="right: -17px;">';

        if (item.blacklist.length == 0) {
            $template += '<p class="text-center mrg-15 ng-scope">Нет черного списка</p>';
        }

        $template += '<ul class="items round-6 ng-scope ng-isolate-scope">';

        $.each(item.blacklist, function (key, user) {
            $template += '<li class="item pointer ng-scope"><a href="/profile/she/'+user.id+'"><div class="avatar-34 round-6 pull-left">' +
                '<img src="' + user.avatar + '" data-evernote-hover-show="true">' +
                '</div><div class="text-34 pull-left ng-binding">' + user.name + ', ' + user.age + '</div>' +
                '<div class="clearfix"></div></a></li>';
        });

        $template += '</ul></div><div class="nano-pane" style="display: block;"><div class="nano-slider" style="height: 312px; transform: translate(0px, 0px);"></div></div></div></div></div><div class="clearfix"></div></div></div></div></div>';
        $template += '</div>';

        return $template;
    }

    // Show edit form on href click
    $('#edit-adv').on('click', function (e) {
        e.preventDefault();

        $(this).parent().find('.txt').hide();
        $(this).hide();

        $('#edit-adv-message').show();
    });

    // Submit edit on click
    $('#submit-adv-edit').on('click', function (e) {
        e.preventDefault();

        // var text = $('#adv-message-text').val();

        var $a = $('#edit-adv');

        var data = {
            'message': $('#adv-message-text').val(),
            'blacklist': []
        };

        $('[name="blacklist"]').each(function () {
            data['blacklist'].push($(this).attr('value'));
        });

        $a.parent().find('.txt').show();
        $a.show();

        $('#edit-adv-message').hide();

        if (!data.message) {
            return;
        }

        $.post('/ajax/change-adv', data, 'json');

        text = data.message.replace(/\n/g, '<br>');

        $a.parent().find('.txt').html(text);
        $('.author-post').html(text);
    });


    // Send request when kept clicked on 'interested'
    $('.adv-interest').on('click', function (e) {
        e.preventDefault();

        if ($(this).hasClass('interested')) {
            return;
        }

        $(this).addClass('interested');
        $(this).text('Интерес проявлен');

        $.post('/ajax/adv-interest/' + $(this).data('id'), {}, 'json');
    });

    // Add client in exclude list
    $('.ex_contact_list').on('click', '.item', function (e) {
        e.preventDefault();

        if ($('.units_wrap .element_it[data-id="' + $(this).data('id') + '"]').length > 1) {
            $('.units_wrap .element_it[data-id="' + $(this).data('id') + '"]:last').remove();
        }
    });

    // Change adv notification
    $('#client-adv-notify').on('change', function () {
        $.post('/ajax/change-adv-notify');
    });

    // Toggle archive item
    $('body').on('click', '.delivery-archive__item-visible', function (e) {
        $(this).closest('.delivery-archive__item').toggleClass('active').find('.delivery-archive__hidden').slideToggle(200)

        e.preventDefault();
    });

    // Display adv archive
    $('#display-adv-archive').on('click', function (e) {
        e.preventDefault();

        if ($('.delivery-archive__item').length > 0) {

            $('#adv-add').hide();
            $('#adv-archive').show();
        } else {
            $.post('/api/notice/archive', {'limit': 10}, 'json').success(function (response) {
                $.each(response.response.advs, function (key, item) {
                    $template = renderAdv(item);

                    $('#advs-archive').append($template);

                    $('#adv-add').hide();
                    $('#adv-archive').show();

                    if (response.response.loadMore) {
                        $('#load-adv-archive').parent().show();
                    } else {
                        $('#load-adv-archive').parent().hide();
                    }
                });
            });
        }
    });

    // Display adv add
    $('#display-adv-add').on('click', function (e) {
        e.preventDefault();

        $('#adv-archive').hide();
        $('#adv-add').show();
    });

    // Load more archives on adv click
    $('#load-adv-archive').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        $this.prop('disabled', true);

        $.post('/api/notice/archive', {
            'last_id': $('.delivery-archive__item:last').data('id'),
            'limit': 10
        }, 'json').success(function (response) {
            $.each(response.response.advs, function (key, item) {
                $template = renderAdv(item);

                $('#advs-archive').append($template);

                if (response.response.loadMore) {
                    $('#load-adv-archive').parent().show();
                } else {
                    $('#load-adv-archive').parent().hide();
                }

                $this.prop('disabled', false);
            });
        });
    });
});

/**
 * Calls file
 * For awesome call functional
 */

$(document).ready(function () {
    // Collect schedule for kept's form
    function collectSchedule($form) {
        var schedule = {};

        $form.find('.line').each(function () {
            var $this = $(this);

            if (!$this.hasClass('weekdays') && $this.find('.active').length) {

                var subdata = {
                    'from': $this.find('.schedule-from').val(),
                    'to': $this.find('.schedule-to').val()
                };

                if (subdata['from'] != subdata['to']) {
                    schedule[$this.data('day')] = subdata;
                }
            }
        });

        return schedule;
    }

    function updateSchedule() {
        $('.schedule-from, #weekdays-from').each(function () {
            var $select = $(this).parent().parent().find('.schedule-to, #weekdays-to');
            var value = parseInt($(this).val(), 10);

            if ($select.val() <= value) {
                $select.val(value + 1);
                $select.parent().find('.text').text($select.find('option:selected').text());
            }

            $select.parent().find('ul li').each(function (key, val) {
                if (key <= value) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });

        });
    }

    // Remove all values in schedule to that less than our
    $('body').on('change', '.schedule-from, #weekdays-from', function () {
        var $select = $(this).parent().parent().find('.schedule-to, #weekdays-to');
        var value = parseInt($(this).val(), 10);

        if ($select.val() <= value) {
            $select.val(value + 1);
            $select.parent().find('.text').text($select.find('option:selected').text());
        }

        $select.parent().find('ul li').each(function (key, val) {
            if (key <= value) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    });

    // Repeate code after click
    $('#popup-repeat-code').on('click', function (e) {
        e.preventDefault();

        if ($(this).prop('disabled')) {
            return false;
        }

        $(this).prop('disabled', true);

        $.post('/ajax/repeat-code/' + $(this).data('id'), {}, 'json').success(function (response) {
            $('#confirm-second-string').show();
            $('#repeat-code-left').html(response['repeat_after']);

            var interval = setInterval(function () {
                var left = parseInt($('#repeat-code-left').text());

                if (left == 0) {
                    $('#confirm-second-string').hide();
                    $('#popup-repeat-code').prop('disabled', false);
                    clearInterval(interval);
                } else {
                    left = left - 1;
                    $('#repeat-code-left').html(left);
                }
            }, 1000);
        }).error(function (response) {
            console.log(response);
        });
    });

    // Change active tab on call list
    $('.call_list').on('click', 'li', function (e) {
        e.preventDefault();

        $('.call_list li').removeClass('active');
        $(this).addClass('active');

        $('.all_call_table_list tr').hide();

        if ($(this).data('block')) {
            $('.all_call_table_list tr.' + $(this).data('block')).show();
        } else {
            $('.all_call_table_list tr').show();
        }
    });

    // Select kept's weekdays schedule
    $('.set-weekdays').on('change', function () {
        if ($(this).hasClass('active')) {
            $('.weekdays').hide();
            $('.weekday').show();
        } else {
            if ($('.weekdays .checkbox').hasClass('active')) {
                $('.weekday .checkbox').addClass('active');
            } else {
                $('.weekday .checkbox').removeClass('active');
            }

            $('.weekdays').show();
            $('.weekday').hide();
        }
    });

    // Remove active from weekdays checkbox on change
    $('.weekday .checkbox').on('change', function () {
        $('.weekdays .checkbox').removeClass('active');
        $('.weekdays .checkbox input[type="checkbox"]').prop('checked', false);
    });

    // Mark all weekday on weekdays checkbox change
    $('.weekdays .checkbox').on('change', function () {
        if ($(this).hasClass('active')) {
            $('.weekday .checkbox').removeClass('active');
            $('.weekday .checkbox input[type="checkbox"]').prop('checked', false);
        } else {
            $('.weekday .checkbox').addClass('active');
            $('.weekday .checkbox input[type="checkbox"]').prop('checked', true);
        }
    });

    // Change all weekdays from schedule when changed on weekdays-from
    $('#weekdays-from').on('change', function () {
        $('.weekday-from option[value="' + $(this).val() + '"]').prop('selected', true);

        $('.weekday-from').trigger('refresh');

        updateSchedule();
    });

    // Change all weekdays to schedule when changed on weekdays-from
    $('#weekdays-to').on('change', function () {
        $('.weekday-to option[value="' + $(this).val() + '"]').prop('selected', true);

        $('.weekday-to').trigger('refresh');
    });

    // Drop weekdays values when changed weekday select
    $('.weekday select').on('change', function () {
        $('#weekdays-from option:first').prop('selected', true);
        $('#weekdays-to option:first').prop('selected', true);

        $('#weekdays-from, #weekdays-to').trigger('refresh');
    });


    // Add phone and generate confirmation code
    $('body').on('submit', '#add-phone', function (e) {
        e.preventDefault();

        var data = {
            'phone': $('#add-phone-number').val(),
            'schedule': collectSchedule($(this))
        };

        $.post('/ajax/add-phone', data, 'json').success(function (response) {
            if (response['error']) {
                $.showError(response.error, $('#add-phone-number'), $('#add-phone .error_text'));

                return;
            }

            $('.you_number').html($('#add-phone-number').val());

            $.hidePopup($('[data-popup-block="voice_call"]'));
            $.displayPopup($('[data-popup-block="sms_pop"]'));

            $.hideError($('#add-phone-number'), $('#add-phone .error_text'));

            $('#popup-repeat-code').attr('data-id', response['id']);
        }).error(function (response) {
            $.showError(response.responseJSON.error, $('#add-phone-number'), $('#add-phone .error_text'));
        });
    });

    // Send confirmation code
    $('#confirm-code').on('submit', function (e) {
        e.preventDefault();

        $.post('/ajax/confirm-code', $(this).serializeArray(), 'json').success(function (response) {
            if (response['error']) {
                $.showError(response.error, $('#confirm-code-value'), $('#confirm-code .error_text'));

                return;
            }

            $.hidePopup($('[data-popup-block="sms_pop"]'));

            if ($('#profile-add-phone').length) {
                $('#profile-add-phone').parent().remove();
            }

            if ($('[data-popup-block="user_call_pop"]').length) {
                $.displayPopup($('[data-popup-block="user_call_pop"]'));

                $.hideError($('#confirm-code-value'), $('#confirm-code .error_text'));

                $callButton = $('.call[data-popup-open="voice_call"]');

                $callButton.removeClass('active');

                if ($('[data-popup-block="call_not_connected"]').length) {
                    $callButton.attr('data-popup-open', 'call_not_connected');
                } else {
                    $callButton.addClass('call_kept');
                }

                if ($('#header-minutes-left').length && response['minutes']) {
                    $('#header-minutes-left').html(response['minutes']);
                }

                var $nav = $('.prof_nav li a[data-popup-open="voice_call"]');

                $nav.attr('href', '/calls');
                $nav.removeAttr('data-popup-open');
            } else {
                $.displayPopup($('[data-popup-block="phone_changed"]'));
            }

        }).error(function (response) {
            $.showError(response.responseJSON.error, $('#confirm-code-value'), $('#confirm-code .error_text'));
        });
    });

    // Redirect to calls after phone added for sponsor
    $('.phone-added-redirect').on('click', function () {
        if ($('.what_calls').length) {
            window.location.reload();
        }
    });

    // Change number when we confirm phone
    $('#popup-change-number').on('click', function (e) {
        e.preventDefault();

        $.hideError($('#confirm-code-value'), $('#confirm-code .error_text'));

        $('#confirm-code-value').val('');

        $.hidePopup($('[data-popup-block="sms_pop"]'));

        if ($('[data-popup-block="voice_call"]').length) {
            $.displayPopup($('[data-popup-block="voice_call"]'));
        } else if ($('[data-popup-block="kept_edit"]').length) {
            $.displayPopup($('[data-popup-block="kept_edit"]'));
        } else if ($('#change-phone').length) {
            $('.your_phone .wrap_first').hide();
            $('.your_phone .wrap_last').show();
        }
    });

    // Remove active class on call button when close confirm phone
    $('[data-popup-close="sms_pop"]').on('click', function () {
        $('[data-popup-open="voice_call"]').removeClass('active');
    });

    // Change current sponsor's phone
    $('#change-phone').on('click', function () {
        $('.your_phone .wrap_first').show();
        $('.your_phone .wrap_last').hide();

        $.post('/ajax/change-phone', {'phone': $('#new-phone').val()}, 'json').success(function (response) {
            if (!response['success']) {
                if (response['reason'] == 'already_call') {
                    $.displayPopup($('[data-popup-block="already_call"]'));
                }
            } else {
                if (response['changed']) {
                    $('.you_number').html($('#new-phone').val());

                    $.displayPopup($('[data-popup-block="sms_pop"]'));

                    $('#popup-repeat-code').attr('data-id', response['id']);
                }
            }
        }).error(function (response) {
            console.log(response);
        });
    });

    // Change current kept's phone
    $('body').on('submit', '#edit-phone', function (e) {
        e.preventDefault();

        var schedule = collectSchedule($(this))

        var data = {
            'phone': $('#edit-phone-number').val(),
            'schedule': schedule
        };

        $.post('/ajax/change-phone', data, 'json').success(function (response) {
            if (response['error']) {
                $.showError(response.error, $('#edit-phone-number'), $('#edit-phone .error_text'));

                return;
            }

            $('.the_phone').html($('#edit-phone-number').val());
            $('[data-popup-open="kept_edit"]').removeClass('active');

            $.hidePopup();

            if (response['changed']) {
                $('.you_number').html($('#edit-phone-number').val());

                $.displayPopup($('[data-popup-block="sms_pop"]'));

                $('#popup-repeat-code').attr('data-id', response['id']);
            }
        }).error(function (response) {
            $.showError(response.responseJSON.error, $('#edit-phone-number'), $('#edit-phone .error_text'));
        });

        var text = [];

        var days = {
            1: 'Пнд',
            2: 'Втр',
            3: 'Срд',
            4: 'Чтв',
            5: 'Птн',
            6: 'Суб',
            7: 'Вск'
        };

        var isWeekdays = true;

        for (i = 1; i <= 5; i++) {
            if (schedule[i]) {
                if (i > 1) {
                    var k = i - 1;
                } else {
                    var k = i + 1;
                }

                if (schedule[k] && schedule[k].from == schedule[i].from && schedule[k].to == schedule[i].to) {
                    continue;
                }
            }

            isWeekdays = false;
        }

        if (isWeekdays) {
            text.push("Будни: с " + schedule[1].from + '-00 до ' + schedule[1].to + '-00');
            var i = 6;
        } else {
            var i = 1;
        }

        for (i; i <= 7; i++) {
            if (schedule[i]) {
                text.push(days[i] + ': с ' + schedule[i].from + '-00 до ' + schedule[i].to + '-00');
            }
        }

        $('.in_bl.days').text(text.join(', '));
    });

    // Display popup on buy minutes from calls page
    $('#buy-minutes').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));

        return;

    });

    // Buy minutes
    $('#confirm-buy-minutes').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-minutes/' + $('#minutes-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $('#popup-minutes-count').html(response['count']);

                $.displayPopup($('[data-popup-block="minutes_success"]'));

                $('#current-balance').html(response['balance']);
                $('#header-minutes-left').html(response['minutes_count']);
                $('#minutes-left').html(response['minutes_count']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['reason'] == 'balance') {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                } else if (response['reason'] == 'already_call') {
                    $.displayPopup($('[data-popup-block="already_call"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function (response) {
            $this.removeClass('disabled');
        });
    });

    // Check if we can call kept
    $('body').on('click', '.call_kept', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.get('/ajax/check-call/' + $this.data('id'), {}, 'json').success(function (response) {

            if (response['success']) {
                var $block = $('[data-popup-block="call_allowed"]');
                var $img = $block.find('a img');
                var $button = $block.find('#call-kept');

                $button.attr('data-id', $this.data('id'));
                $button.attr('data-name', $this.data('name'));
                $button.attr('data-avatar', $this.data('avatar'));

                $img.attr('src', $this.data('avatar'));
                $block.find('.name-span').html($this.data('name'));

                $img.one('load', function () {
                    $.displayPopup($block);
                });
            } else {
                if (response['reason'] == 'count') {
                    $.displayPopup($('[data-popup-block="minutes_count"]'));
                } else if (response['reason'] == 'not_allowed') {
                    $('[data-popup-block="not_allowed"] .name').html($this.data('name'));

                    $.displayPopup($('[data-popup-block="not_allowed"]'));
                } else if (response['reason'] == 'already_call') {
                    $.displayPopup($('[data-popup-block="already_call"]'));
                } else if (response['reason'] == 'schedule') {
                    var $popup = $('[data-popup-block="time_to_call"]');

                    $popup.find('.pop_bold_text').html(response['error_message']);

                    $.displayPopup($popup);
                } else if (response['reason'] == 'premium') {
                    $.displayPopup($('[data-popup-block="not_premium"]'));
                } else if (response['reason'] == 'not_specified') {
                    $.displayPopup($('[data-popup-block="call_not_connected"]'));
                }
            }
        });
    });

    // Call kept
    $('body').on('click', '#call-kept', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.get('/ajax/make-call/' + $this.attr('data-id'), {}, 'json').success(function (response) {
            if (response['success']) {
                var $block = $('[data-popup-block="call"]');
                var $img = $block.find('a img');

                $img.attr('src', $this.data('avatar'));
                $block.find('.name').html($this.data('name'));

                $img.one('load', function () {
                    $.displayPopup($block);
                });
            } else {
                if (response['reason'] == 'count') {
                    $.displayPopup($('[data-popup-block="minutes_count"]'));
                } else if (response['reason'] == 'not_allowed') {
                    $('[data-popup-block="not_allowed"] .name').html($this.data('name'));

                    $.displayPopup($('[data-popup-block="not_allowed"]'));
                } else if (response['reason'] == 'already_call') {
                    $.displayPopup($('[data-popup-block="already_call"]'));
                } else if (response['reason'] == 'schedule') {
                    var $popup = $('[data-popup-block="time_to_call"]');

                    $popup.find('.pop_bold_text').html(response['error_message']);

                    $.displayPopup($popup);
                } else if (response['reason'] == 'premium') {
                    $.displayPopup($('[data-popup-block="not_premium"]'));
                }
            }
        });
    });

    // Add notify when calls kept without phone. Also html client's name
    $('body').on('click', '[data-popup-open="call_not_connected"]', function () {
        $.get('/ajax/notify/' + $(this).data('id'), {}, 'json');

        $('[data-popup-block="call_not_connected"] .name').text($(this).data('name'));
    });

    // Turn calls on or off for kept
    $('body').on('click', '.calls_toggle_settings', function () {
        if ($(this).hasClass('off')) {
            $(this).removeClass('off').addClass('on');
            $(this).find('.calls_slider_text').html('Звонки включены');
        } else {
            $(this).find('.calls_slider_text').html('Звонки отключены');
            $(this).addClass('off').removeClass('on');
        }

        $.get('/ajax/call-allowed', {}, 'json');
    });

    // Remove all values in schedule to that less than our
    updateSchedule();
});

/**
 * Common file
 * For common functional like authentication
 */

// Классическая реализация медиатора
var mediator = (function () {
    var subscribe = function (channel, fn) {
            if (!mediator.channels[channel]) mediator.channels[channel] = [];
            mediator.channels[channel].push({context: this, callback: fn, oneTime: false});
            return this;
        },

        // Run callback just one time then remove it from channels
        oneSubscribe = function (channel, fn) {
            if (!mediator.channels[channel]) mediator.channels[channel] = [];
            mediator.channels[channel].push({context: this, callback: fn, oneTime: true});
            return this;
        },

        publish = function (channel) {
            if (!mediator.channels[channel]) return false;
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
                var subscription = mediator.channels[channel][i];
                subscription.callback.apply(subscription.context, args);

                if (subscription.oneTime) {
                    mediator.channels[channel].splice(i, 1);
                }
            }
            return this;
        };

    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        oneSubscribe: oneSubscribe,
        installTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };

}());

// Notify by mediator on popstate
window.addEventListener('popstate', function (e) {
    if (e.state && e.state.popup) {
        mediator.publish('popup-popsate', e.state.popup);
    }
}, false);

// Helper for popup rendering
var popupRender = (function () {
    var self = this;

    self.wrap = $('.overlay .table_wrap .td_wrap');

    self.template = '<div class="new-popup-registration tac hidden" style="position: relative; z-index: 100;" data-popup-block="{{block}}">' +
        '<div class="new-popup-registration__step-container no-min-height no-pb new-popup-registration__thx pos_r">' +
        '<div class="close_popup" data-popup-close="{{block}}"></div>' +
        '{{#contents}}' +
        '{{{.}}}' +
        '{{/contents}}' +
        '</div>' +
        '</div>';

    return {
        create: function (data) {
            var $template = $(Mustache.render(self.template, data));

            self.wrap.append($template);

            return $template;
        }
    };
}());

$(document).ready(function () {
    var defaultCities = [];

    // Change avatar on avatar-changed event
    mediator.subscribe('avatar-changed', function (id, newUrl, newSmallUrl) {
        var $bigAvatar = $('.added_photo .avatar');

        if ($bigAvatar.length) {
            $bigAvatar.attr('src', newUrl);
            $bigAvatar.attr('data-id', id);
        }

        $('.prof_setting_header .photo_bl img').attr('src', newSmallUrl);
    });

    // Display one or another popup when customer can't buy service because of account status
    mediator.subscribe('service-buy-error-not-premium', function () {
        var $promoBlock = $('[data-popup-block="popup_men_confirm_mail"]');

        if ($promoBlock.length) {
            $.displayPopup($promoBlock);
        } else {
            $.displayPopup($('[data-popup-block="service_not_premium"]'));
        }
    });

    // Try to authenticate new user
    mediator.subscribe('authenticate', function (email, password) {
        var data = {
            '_username': email,
            '_password': password
        };

        $.post('/login_check', data, 'json').success(function (response) {
            if (typeof response != 'object') {
                try {
                    response = jQuery.parseJSON(response);
                } catch (e) {
                    window.location.reload();
                }
            }


            if (typeof response == 'object') {
                if (response['success']) {
                    window.location.reload();

                    return;
                } else if (!response['success'] && response.error && response.error_type) {
                    mediator.publish('authenticate-error', response.error, response.error_type, email, response.client_type);
                } else {
                    mediator.publish('authenticate-error', response.responseJSON.error, null, email, response.client_type);
                }
            } else {
                window.location.reload();
            }
        }).error(function (response) {
            mediator.publish('authenticate-error', response.responseJSON.error, null, email);
        });
    });

    // On error authenticate display errors for authentication form if it is visible
    mediator.subscribe('authenticate-error', function (error, error_type, email) {
        var $form = $('#authentication-form');

        $.hideError(
            $form.find('input'),
            $form.find('.error_text')
        );

        if (!$form.is(':visible') || error_type !== 'wrong_credentials') {
            return false;
        }

        $.showError(
            {'message': error},
            $form.find('input'),
            $form.find('.error_text')
        );
    });

    // Authenticate user
    $('body').on('submit', '#authentication-form', function (e) {
        e.preventDefault();

        var $form = $(this);

        mediator.publish('authenticate', $form.find('input[name="_username"]').val(), $form.find('input[name="_password"]').val());
    });

    // Change invisible mode on click
    $(".invis_bl .toggle_bl").on('click', function () {
        $.post('/ajax/payment/change-invisible');
    });

    // Display popup
    $('body').on('click', '[data-popup-open="call_not_connected"]', function () {
        $.displayPopup($('[data-popup-block="call_not_connected"]'));
    });

    // Display notify if exists
    if ($('[data-popup-block="call_notify"]').length) {
        $.displayPopup($('[data-popup-block="call_notify"]'));
    }

    // Forget password ajax request
    $('#forget-password').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);

        $this.find('button').prop('disabled', true);

        var email = $this.find('input').val();

        $.post('/ajax/forget-password', {email: email}, 'json').success(function (response) {
            if (response['success']) {
                $this.find('.error_text').hide();

                $.displayPopup($('[data-popup-block="forget_success"]'));
            } else {
                // Run deleted account scenario
                if (response.error_type && response.error_type == 'deleted') {
                    deletedAccountOnLoginController.init(email);
                } else if (response.error_type && response.error_type == 'not_confirmed_account') {
                    mediator.publish('password-reset-error', response.error, response.error_type, email);
                } else {
                    $this.find('.error_text').show().text(response['error']);
                }

                $this.find('button').prop('disabled', false);
            }
        });
    });

    // Maxlength textarea or input
    $('[maxlength]').keyup(function () {
        var limit = parseInt($(this).attr('maxlength'));
        var text = $(this).val();
        var chars = text.length;

        if (chars > limit) {
            var new_text = text.substr(0, limit);

            $(this).val(new_text);
        }
    });

    // Add guide view
    $('body').on('click', '.add-guide-view', function () {
        $.post('/api/users/guide/view', {}, 'json');
    });

    // Send download sms
    $('#send-download-sms').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);
        $.post('/api/send-download-sms', $this.serializeArray(), 'json').success(function (response) {
            $.hideError($this.find('input'), $this.find('.error_text'));

            $.createPopup('send-download-sms-success', 'Сообщение успешно отправлено.');
        }).error(function (response) {
            $.showError(
                response.responseJSON.error,
                $this.find('input'),
                $this.find('.error_text')
            );
        });
    });

    // Display or hide folder settings
    $('body').on('click', '#display-folder-settings', function (e) {
        console.log('clicked');

        e.preventDefault();

        var $element = $('.folder-settings__dialog--hidden');

        if ($element.is(':visible')) {
            $element.hide();
        } else {
            $element.show();
        }
    });

    $('body').on('click', function (e) {
        var $element = $('.folder-settings__dialog--hidden');

        if ($element.length && $element.is(':visible') && $(e.target).closest(".folder-settings__dialogs").length === 0) {
            $element.hide();
        }
    });

    // Load youtube video when clicked on image
    $('.youtube-image').on('click', function (e) {
        e.preventDefault();

        var code = $(this).data('code');

        if (!code || $(this).find('img').length == 0) {
            return false;
        }

        $(this).html('<iframe frameborder="0" allowfullscreen src="https://www.youtube.com/embed/' + code + '?autoplay=0&hd=1"></iframe>');
    });

    // Insert just text/plain on copy-paste
    $('body').on('paste', ' div[contenteditable]', function (e) {
        e.preventDefault();

        var text = e.originalEvent.clipboardData.getData("text/plain");
        text = (text + '').replace(new RegExp('\r?\n', 'g'), '<br>');

        document.execCommand("insertHTML", false, text);
    });

    // Remove cookies on uncheck
    $('#remember-age').on('change', function () {
        if (!$(this).prop('checked')) {
            Cookies.remove('age_from');
            Cookies.remove('age_to');
        }
    });


    $.post('/api/location/nearest', {
        locale: window.navigator.userLanguage || window.navigator.language
    }, 'json').success(function (response) {
        $('.city-search').each(function (key, value) {
            var $this = $(value);

            defaultCities = response.response;

            if ($this.val() == '') {
                $this.parent().find('.easy-autocomplete-container').trigger('loadElements.eac', [[{
                    data: defaultCities,
                    getValue: function (element) {
                        return element.title;
                    },
                    maxListSize: 5
                }], '']);

                if ($this.is(':focus')) {
                    $this.parent().find('.easy-autocomplete-container').trigger("show.eac");
                }
            }

        });
    });

    // On city input click - show container
    $('.city-search').on('click', function () {
        var $this = $(this);

        if ($this.getItems().length > 0) {
            $this.parent().find('.easy-autocomplete-container').trigger("show.eac");
        }

        $this.select();
    });

    // Cities
    $(document).on('click', '.icon--new-select__clean', function () {
        var $this = $(this);
        var $parent = $this.parent();

        $parent.find('input.citysearch__new-select').val('');

        $parent.find('.easy-autocomplete-container ul').hide();

        $parent.find('.easy-autocomplete-container').trigger('loadElements.eac', [[{
            data: defaultCities,
            getValue: function (element) {
                return element.title;
            },
            maxListSize: 5
        }], '']);

        $parent.find('input[type="hidden"]').val('');
    });

    $(document).on('keyup', 'input.citysearch__new-select', function () {
        var $this = $(this);

        check_new__select($this);

        if ($this.val() == '') {
            $this.parent().find('.easy-autocomplete-container').trigger('loadElements.eac', [[{
                data: defaultCities,
                getValue: function (element) {
                    return element.title;
                },
                maxListSize: 5
            }], '']);

            $this.parent().find('.easy-autocomplete-container').trigger("show.eac");
        }
    });

    $('input.citysearch__new-select').each(function () {
        check_new__select($(this));
    });

    function check_new__select(input) {
        if (input.val() != '') {
            input.closest('.citysearch__new-select__wrapper').find('.icon--new-select__clean').show();
        } else {
            input.closest('.citysearch__new-select__wrapper').find('.icon--new-select__clean').hide();
        }
    }

    // Repeat confirmation email
    $('body').on('click', '.resend-registration-mail', function (e) {
        e.preventDefault();

        var $this = $(this);
        var $parent = $this.parent().parent();
        var $successText = $parent.find('.success_text');
        var $errorText = $parent.find('.error_text');

        $.post('/api/repeat-confirm-mail', {}, 'json').success(function (response) {
            if (response.response.success) {
                $.hideError($this, $errorText);

                $successText.show();
            } else {
                $successText.hide();

                $.showError(
                    response.response,
                    $this,
                    $errorText
                );
            }
        });
    });

    // Change and confirm email
    $('body').on('submit', '#change-and-confirm-mail', function (e) {
        e.preventDefault();

        var $this = $(this);
        var $input = $this.find('input');
        var $successText = $this.find('.success_text');
        var $errorText = $this.find('.error_text');

        $.post('/api/change-and-confirm-mail', {'email': $input.val()}, 'json').success(function (response) {
            if (response.response.success) {
                $.hideError($input, $errorText);

                $successText.show();
            } else {
                $successText.hide();

                $.showError(
                    response.response,
                    $input,
                    $errorText
                );
            }
        });
    });

    // On click - show additional params views
    $('.show-additional-fields').on('click', function (e) {
        $('*[data-popup-block]').stop().hide();

        $('[data-popup-block="reg_additional_params"]').stop().show();
    });

    // On click - show additional params views
    $('[data-popup-block="reg_additional_params"] form').on('submit', function (e) {
        e.preventDefault();

        $.post('/ajax/profile', $(this).serializeArray(), 'json');

        $.hidePopup();
    });

    //
    $('.js-scrollto-button').each(function () {
        var $this = $(this);

        $this.on('click', function () {
            var pos = $($this.attr('data-scrollto')).offset().top;
            $this.closest('.overlay').animate({scrollTop: pos}, 500);
        });
    });

    // Send ajax-registration request
    $('#registration-form').on('submit', function (e) {
        e.preventDefault();

        var $form = $(this);

        $.post($form.attr('action'), $form.serializeArray(), 'json').success(function (response) {
            if (response.success) {
                window.location.href = response.redirect;
            } else {
                if (response.error_type == 'form-error') {
                    $.each(response.errors, function (key, message) {
                        var $errorBlock = $form.find('#' + key + '-error-block');

                        if ($errorBlock && $errorBlock.length) {
                            $errorBlock.html(message);
                            $errorBlock.show();
                        }
                    });
                } else {
                    mediator.publish('registration-error-' + response.error_type, $form, response.errors, response.client_type);
                }
            }
        });
    });

    // Set mask for crop
    $('.mask-item').on('click', function () {
        var $this = $(this);

        var mask = $this.data('mask');

        if (mask == 'none') {
            mediator.publish('crop-remove-effects');

            return true;
        }

        if (!mask || mask == 'blur') {
            mediator.publish('crop-set-blur');
        } else {
            mediator.publish('crop-set-mask', $this.data('mask-name'), mask);
        }
    });

    // Fire saveImage event for the crop module
    $('.new-popup-registration__crop-success').on('click', function (e) {
        e.preventDefault();

        mediator.publish('crop-save-current-image');
    });

    var $cropSlider = $('#slider-range');

    // Disable clicks on track
    var sliderMouseDown = function (e) {
        var sliderHandle = $cropSlider.find('.ui-slider-handle');
        if (e.target != sliderHandle[0]) {
            e.stopImmediatePropagation();
        }
    };

    $cropSlider
        .on('mousedown', sliderMouseDown)
        .on('touchstart', sliderMouseDown)
        .slider({
            min: 1,
            max: 90,
            slide: function (event, ui) {
                mediator.publish('crop-zoom', ui.value);
            }
        });

    // Reset slider's value
    mediator.subscribe('crop-reset-slider', function () {
        $cropSlider.slider('value', 1);
    });

    // Validate input
    $('.validate-phone').on('input', function () {
        this.value = this.value.replace(/[^0-9\.\+\(\)\ ]/g, '');
    });
});

$(window).load(function () {
    // Async fullsize image upload
    if ($('img[data-slide-src]').length) {
        var images = $('img[data-slide-src]');

        for (var i = 0; i <= 7 && i < images.length; i++) {
            var $img = $(images[i]);

            $('<img>').attr("src", $img.attr('data-slide-src'));
        }
    }
});

function loadImages() {

    var arr = $('img[data-src]');
    // async

    var limit = 10;
    var delay = 100;

    var m = 0;
    for (i = 0; i < arr.size(); i += limit) {
        m++;
        setTimeout(function (items) {
            $.each(items, function () {
                var item = $(this);
                item.attr('src', item.data('src'));
            })
        }, delay * m, arr.slice(i, i + limit))
    }

}

loadImages();


$(document).ready(function () {

    // Set up id when we send message somebody
    $('body').on('click', '[data-popup-open="send_message"]', function () {
        if ($('[data-popup-open="login"]').length) {
            $.displayPopup($('[data-popup-block="send_message"]'));
            return;
        }

        $.hidePopup($('[data-popup-block="send_message"]'));

        $('#profile-send-message').attr('data-id', $(this).data('id'));

        $.post('/ajax/in-contacts/' + $(this).data('id'), {}, 'json').success(function (response) {
            if (response['in_contacts']) {
                $('#first-message').hide();
            } else {
                $('#first-message').show();
            }
            $.displayPopup($('[data-popup-block="send_message"]'));
        });
    });

    $('body').on('click', '.message-image', function (e) {
        e.preventDefault();

        $('.slides_popup .img_wrap').html('<img src="' + $(this).attr('href') + '" />');

        var $img = $('.slides_popup .img_wrap img');

        if ($('.prev.trans_all').length) {
            $('.prev.trans_all').remove();
        }

        $img.css({'max-height': $(window).height() - 100});

        $img.show();

        $img.one('load', function () {
            $('.slides_popup').show();
        });
    });
});

/**
 * My profile file
 * For edit client's profile
 */

$(document).ready(function () {
    // Set profile's status active for sponsor
    function profileActive(active) {
        if (active && $('.status .text').text() == 'Не активна') {
            $('.status .text').text('');
            $('.status .icon_status').hide();

            var $dropBlockCall = $('#dropblock-call');

            if ($dropBlockCall.length == 0 || !$dropBlockCall.is(':visible')) {
                $.displayPopup($('[data-popup-block="active_profile"]'));
            }

            $('#header-search-place').show();

            if ($('.kept-non-active').length) {
                $('.kept-non-active').hide();
            }

            if ($('#kept-not-active').length) {
                $('#kept-not-active').attr('style', 'display: none;');
            }
        } else if (!active && $('.status .text').text() == '') {
            $('.status .text').text('Не активна');

            $('.status .icon_status').show();

            $('#header-search-place').hide();

            if ($('.kept-non-active').length) {
                $('.kept-non-active').show();
            }

            if ($('#kept-not-active').length) {
                $('#kept-not-active').removeAttr('style');
            }
        }
    }

    // Change status of photo confirmed
    function photoConfirmed(confirmed) {
        if (currentUser.type == 1) {
            return false;
        }

        var $div = $('.confirmation');

        currentUser.photoConfirmed = confirmed;

        if (!$div.length || (confirmed && $div.hasClass('active')) || (!confirmed && !$div.hasClass('active'))) {
            return false;
        }

        $text = $div.find('.text:first');

        if (confirmed == true) {
            $div.addClass('active');
            $text.removeAttr('data-popup-open');
            $text.html('<p>Фото подтверждено</p>');
        } else {
            $div.removeClass('active');
            $text.attr('data-popup-open', 'confirmation');
            $text.html('<p class="top_text">Подтверждение фото</p><p class="bot_text">Что это?</p>');
        }
    }

    // Update appearance text data for block
    function updateAppearanceData(value, text, $div) {
        if (value) {
            $div.find('.r_bl').text(text);

            $div.show();
        } else {
            $div.hide();
        }
    }

    // Update color for block
    function updateAppearanceColor(value, text, $div) {
        if (value) {
            $div.find('.color-text').text(text);
            $div.find('.circle_color').css({'background': value});

            $div.show();
        } else {
            $div.hide();
        }
    }

    // Update sexual data
    function updateSexualData(value, $div) {
        if (value) {
            $div.find('.num').text(value);

            $div.show();
        } else {
            $div.hide();
        }
    }

    // Generate text and show image delete popup
    function showImageDeletePopup(id, isAvatar) {
        var $submitButton = $('#remove-image');

        $submitButton.attr('data-id', id);
        $submitButton.attr('data-avatar', isAvatar);

        var $popup = $('[data-popup-block="delete_image"]');

        if (currentUser.photoConfirmed && isAvatar) {
            var text = 'При удалении данной фотографии, Вам необходимо будет повторно пройти<br>процедуру подтверждения фотографии.<br><br>Вы уверены, что хотите удалить фотографию?';
        } else {
            var text = 'Вы уверены, что хотите удалить фотографию?<br/>';

            if (isAvatar) {
                text += 'Ваша анкета станет неактивной, если Вы удалите свой аватар.';
            }
        }

        $popup.find('.descr_txt').html(text);

        $.displayPopup($popup);
    }

    // Display popups on fill profile
    $('body').on('click', '#fill-profile', function () {
        showPopups();
    });

    // Disla popups on client's first screen close
    $('body').on('click', '[data-popup-close="sponsor_success"]', function () {
        showExcursionForSponsor();

        $('.overlay').stop().show();
    });

    // Remove photo dropblock and show city dropblock
    $('#close-photo-dropblock').on('click', function (e) {
        e.preventDefault();

        $('.main_photo').removeClass('drop_vis');
        $('#dropblock-photo').remove();

        $('#dropblock-city').remove();
        $('.city_bl').removeClass('drop_vis drop_hover');

        $.showDropblock($('#dropblock-call'));
        $('.receive_calls > .in_bl').addClass('drop_vis drop_hover');

        /*$.showDropblock($('#dropblock-city'));

         $('.city_bl').addClass('drop_vis drop_hover');*/
    });

    // Remove city dropblock and show call dropblock
    $('#close-city-dropblock').on('click', function (e) {
        e.preventDefault();

        if (!$('.the_phone').length) {
            $('#dropblock-city').remove();
            $('.city_bl').removeClass('drop_vis drop_hover');

            $.showDropblock($('#dropblock-call'));
            $('.receive_calls > .in_bl').addClass('drop_vis drop_hover');
        } else {
            $('.overlay').hide();
        }
    });

    // Remove dropbox on close and hide overlay
    $('#close-call-dropblock').on('click', function (e) {
        e.preventDefault();

        $('#dropblock-call').remove();
        $('.receive_calls > .in_bl').removeClass('drop_vis drop_hover');

        $('.overlay').hide();

        // If kept activated account while block showed
        if ($('.status .text').text() == '' && $('.kept-non-active').length) {
            $.displayPopup($('[data-popup-block="active_profile"]'))
        }
    });

    // Display popup on click and remove dropblock
    $('#add-phone-popup').on('click', function (e) {
        e.preventDefault();

        $('.receive_calls > .in_bl').removeClass('drop_vis drop_hover');

        $('#dropblock-call').remove();

        $.displayPopup($('[data-popup-block="1"]'));
    });

    // Rotate crop left
    $('body').on('click', '.rotate-crop-left', function () {
        $.cropModule.rotateCanvas(-90);

        $('.mask-item.active').removeClass('active');
    });


    // Rotate crop left
    $('body').on('click', '.rotate-crop-right', function () {
        $.cropModule.rotateCanvas(90);

        $('.mask-item.active').removeClass('active');
    });

    // Ajax-load avatar from profile
    $('body').on('change', '#profile-avatar', function () {
        var value = $(this).val();

        if (!value) {
            return false;
        }

        // #avatar-resize-image

        var reader = new FileReader();

        reader.onload = function (e) {
            var $img = $('<img>');

            $img.attr('src', e.target.result);

            $img.one('load', function () {
                $.cropModule.setImage(new ImgModel(value, null, $img[0].width, $img[0].height), $img[0], false);

                $.displayPopup($('[data-popup-block="crop"]'));
                $('.new-popup-registration__crop-wrapper').fadeIn();
            });
        };

        reader.readAsDataURL(this.files[0]);

        $('#save-crop').attr('data-type', 'avatar');
        $('#save-crop').removeAttr('data-id');
    });

    // Save image on click
    $('[data-popup-block="crop"]').on('click', '.new-popup-registration__crop-success', function () {
        var image = $.cropModule.image;

        if (!image) {
            return false;
        }

        $.cropModule.save();

        var data = new FormData();

        data.append('avatar', document.getElementById('profile-avatar').files[0]);
        data.append('width', image.width);
        data.append('height', image.height);
        data.append('left', image.left);
        data.append('top', image.top);
        data.append('cropX', image.cropX);
        data.append('cropY', image.cropY);
        data.append('deg', image.deg);
        data.append('mask', image.mask);
        data.append('mask_height', image.mask_height);
        data.append('mask_width', image.mask_width);
        data.append('mask_left', image.mask_left);
        data.append('mask_top', image.mask_top);
        data.append('mask_angle', image.mask_angle);
        data.append('blur_level', image.blur_level);

        // Set up crop data
        data.append('ratio', image.ratio);
        data.append('cropWidth', image.cropWidth);
        data.append('cropHeight', image.cropHeight);
        data.append('cropLeft', image.cropLeft);
        data.append('cropTop', image.cropTop);

        var url = '';

        if (image.id != null) {
            url = '/ajax/crop-image/' + image.id;
        } else {
            url = '/ajax/avatar';
        }

        $('#profile-avatar').val('');

        $.ajax({
            type: 'post',
            url: url,
            data: data,
            success: function (response) {
                if (!response.error) {
                    $('.added_photo .avatar').attr('src', response['image']);
                    $('.added_photo .avatar').attr('data-id', response['id']);
                    $('.prof_setting_header .photo_bl img').attr('src', response['image_small']);

                    $('.main_photo .added_photo').show();
                    $('.main_photo .add_photo').hide();

                    $.updateProfileImages(response);

                    profileActive(response['active']);
                    photoConfirmed(response['photoConfirmed']);

                    var $avatarOnModeration = $('#avatar-on-moderation');

                    if ($avatarOnModeration.length) {
                        if (response['onModeration']) {
                            $avatarOnModeration.show();
                        } else {
                            $avatarOnModeration.hide();
                        }
                    }
                } else {
                    if (response.error == 'min_image_size') {
                        $.displayPopup($('[data-popup-block="image_min_size"]'));
                    }
                }

                $('.m_photo .load_wrap').hide();
            },
            error: function (response) {
                $('.m_photo .load_wrap').hide();

                var errorMessage = response.responseJSON.error.message;

                console.log('Can\'t save the image, error: ', errorMessage);

                $.createPopup('crop-image-'+image.id+'-error', errorMessage);
            },
            processData: false,
            contentType: false
        });

        $('#crop-image').html($('.resize-image'));

        $.hidePopup();

        $('#profile-avatar').val('');

        // If dropblock is active
        if ($('#dropblock-photo').length) {
            $('#close-photo-dropblock').click();

            $('.overlay').stop().show();
        }

        $('body').removeClass('overflow_h');
    });

    // Save image on click without crop
    $('[data-popup-block="crop"]').on('click', '.new-popup-registration__crop-cross', function () {
        var image = $.cropModule.image;

        if (!image) {
            return false;
        }

        $.cropModule.save();

        var data = new FormData();

        data.append('avatar', document.getElementById('profile-avatar').files[0]);
        data.append('width', image.width);
        data.append('height', image.height);

        var url = '';

        if (image.id != null) {
            url = '/ajax/crop-image/' + image.id;
        } else {
            url = '/ajax/avatar';
        }

        $.ajax({
            type: 'post',
            url: url,
            data: data,
            success: function (response) {
                if (!response.error) {
                    $('.added_photo .avatar').attr('src', response['image']);
                    $('.prof_setting_header .photo_bl img').attr('src', response['image_small']);
                    $('.prof_setting_header .photo_bl img').attr('data-id', response['id']);

                    $('.main_photo .added_photo').show();
                    $('.main_photo .add_photo').hide();

                    $.updateProfileImages(response);

                    profileActive(response['active']);
                    photoConfirmed(response['photoConfirmed']);

                    var $avatarOnModeration = $('#avatar-on-moderation');

                    if ($avatarOnModeration.length) {
                        if (response['onModeration']) {
                            $avatarOnModeration.show();
                        } else {
                            $avatarOnModeration.hide();
                        }
                    }
                } else {
                    if (response.error == 'min_image_size') {
                        $.displayPopup($('[data-popup-block="image_min_size"]'));
                    }
                }

                $('.m_photo .load_wrap').hide();
            },
            error: function (response) {
                $('.m_photo .load_wrap').hide();

                var errorMessage = response.responseJSON.error.message;

                console.log('Can\'t save the image, error: ', errorMessage);

                $.createPopup('crop-image-'+image.id+'-error', errorMessage);
            },
            processData: false,
            contentType: false
        });

        $('#crop-image').html($('.resize-image'));

        $.hidePopup();

        $('#profile-avatar').val('');

        // If dropblock is active
        if ($('#dropblock-photo').length) {
            $('#close-photo-dropblock').click();

            $('.overlay').stop().show();
        }

        $('body').removeClass('overflow_h');
    });

    // Save avatar crop on click
    $('body').on('click', '#save-crop', function (e) {
        e.preventDefault();

        var $container = $('.resize-image').parent('.resize-container');
        var width = $('.resize-image').width(),
            height = $('.resize-image').height(),
            left = $('.overlay_crop').offset().left - $container.offset().left,
            top = $('.overlay_crop').offset().top - $container.offset().top,
            cropX = $('.overlay_crop').width(),
            cropY = $('.overlay_crop').height(),
            deg = $('.overlay_rotate').data('overlay-deg'),
            url;

        var data = new FormData();

        data.append('avatar', document.getElementById('profile-avatar').files[0]);
        data.append('width', width);
        data.append('height', height);
        data.append('left', left);
        data.append('top', top);
        data.append('cropX', cropX);
        data.append('cropY', cropY);
        data.append('deg', deg);

        $('.m_photo .load_wrap').show();

        if ($(this).attr('data-type') == 'image') {
            url = '/ajax/crop-image/' + $(this).attr("data-id");
        } else {
            url = '/ajax/avatar';
        }

        $(this).removeAttr('data-id');

        $.ajax({
            type: 'post',
            url: url,
            data: data,
            success: function (response) {
                if (!response.error) {
                    $('.added_photo .avatar').attr('src', response['image']);
                    $('.prof_setting_header .photo_bl img').attr('src', response['image_small']);
                    $('.prof_setting_header .photo_bl img').attr('data-id', response['id']);

                    $('.main_photo .added_photo').show();
                    $('.main_photo .add_photo').hide();

                    $.updateProfileImages(response);

                    profileActive(response['active']);
                    photoConfirmed(response['photoConfirmed']);

                    var $avatarOnModeration = $('#avatar-on-moderation');

                    if ($avatarOnModeration.length) {
                        if (response['onModeration']) {
                            $avatarOnModeration.show();
                        } else {
                            $avatarOnModeration.hide();
                        }
                    }
                } else {
                    if (response.error == 'min_image_size') {
                        $.displayPopup($('[data-popup-block="image_min_size"]'));
                    }
                }

                $('.m_photo .load_wrap').hide();
            },
            error: function (response) {
                $('.m_photo .load_wrap').hide();

                var errorMessage = response.responseJSON.error.message;

                console.log('Can\'t save the image, error: ', errorMessage);

                $.createPopup('crop-image-error', errorMessage);
            },
            processData: false,
            contentType: false
        });

        $('#crop-image').html($('.resize-image'));

        $.hidePopup();

        $('#profile-avatar').val('');

        // If dropblock is active
        if ($('#dropblock-photo').length) {
            $('#close-photo-dropblock').click();

            $('.overlay').stop().show();
        }

        $('body').removeClass('overflow_h');
    });

    // Remove crop on crop popup close and unset avatar value
    $('[data-popup-close="crop_component"]').on('click', function () {
        $('#crop-image').html($('.resize-image'));

        $('#profile-avatar').val('');

        $('.overlay').stop().hide();
    });

    // Remove avatar
    $('body').on('click', '.remove-avatar', function (e) {
        e.preventDefault();

        showImageDeletePopup(0, true);
    });

    // Update zodiac on short info when we change it
    $('body').on('change', '#client-zodiac', function () {
        if ($(this).val() != '') {
            $('#info-zodiac').text(', ' + $(this).find('option:selected').text());
        }
    });

    // Ajax save relationship type tab
    $('body').on('click', '#save-relationship', function () {
        $('#relationship-form').submit();
    });

    // Ajax save apperance tab
    $('body').on('click', '#save-apperance', function () {
        $('#appearance-form').submit();
    });

    // Ajax save sexual tab
    $('body').on('click', '#save-sexual', function () {
        $('#sexual-form').submit();
    });

    // Ajax save special offer form
    $('body').on('click', '#save-special', function () {
        $('#special-form').submit();
    });

    // Ajax save about me form
    $('body').on('click', '#save-about', function () {
        $('#about-form').submit();
    });

    // Ajax save special birthdate
    $('body').on('click', '#save-birthdate', function (e) {
        e.preventDefault();

        $('#birthdate-form').submit();
    });

    // Commit changes and change data in profile view on about edit
    $('#about-form').on('submit', function (e) {
        e.preventDefault();

        $.post($(this).attr('action'), $(this).serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });
    });

    // Commit changes and change data in profile view on city edit
    $('#city-form').on('submit', function (e) {
        e.preventDefault();

        $.post($(this).attr('action'), $(this).serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        $('.city_text').html($('#city').val());

        if ($('#dropblock-city').length) {
            $('#close-city-dropblock').click();
        }
    });

    // Hide dropblock on profile add phone click
    $('#profile-add-phone').on('click', function (e) {
        $('#close-call-dropblock').click();
    });

    // Commit changes and change data in profile view on birthdate edit
    $('#birthdate-form').on('submit', function (e) {
        e.preventDefault();

        var valid = true;
        var selects = [
            '#birthdate-day',
            '#birthdate-month',
            '#birthdate-year'
        ];

        for (var i = 0; i < selects.length; i++) {
            var $select = $(this).find(selects[i]);

            if (!$select.val()) {
                $select.parent().find('.select').addClass('error_border');
                valid = false;
            } else {
                $select.parent().find('.select').removeClass('error_border');
            }
        }

        if (!valid) {
            return;
        }

        $.hidePopup();

        $(this).find('.select').removeClass('error_border');

        $.post($(this).attr('action'), $(this).serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);

            if (response['zodiac'] || response['age']) {
                $('#profile-zodiac').removeClass('no-birthdate');

                $('#profile-zodiac').text(response['zodiac']);
                $('#profile-age').text(response['age'] + ',');
            } else if (response['zodiac'] == '' && response['age'] == '') {
                $('#profile-zodiac').addClass('no-birthdate');
                $('#profile-zodiac').text('Дата рождения');
                $('#profile-age').text('');
            }
        });
    });

    // Commit changes and change data in profile view on sexual edit
    $('#sexual-form').on('submit', function (e) {
        e.preventDefault();

        $.post($(this).attr('action'), $(this).serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        if ($('#sexual-period option:selected').val()) {
            updateSexualData($('#sexual-period option:selected').text(), $('#profile-sexual-period'));
        } else {
            $('#profile-sexual-period').hide();
        }

        if ($('#sexual-role option:selected').val()) {
            updateSexualData($('#sexual-role option:selected').text(), $('#profile-sexual-role'));
        } else {
            $('#profile-sexual-role').hide();
        }

        $('#profile-sexual-kind .num').remove();

        $('#search-sexual-kind .active_checkbox').each(function () {
            $('#profile-sexual-kind').append($('<div class="num">' + $(this).find('[data-get-value="text-label"]').text() + '</div>'));
        });

        if (!$('#profile-sexual-kind .num').length) {
            $('#profile-sexual-kind').hide();
        } else {
            $('#profile-sexual-kind').show();
        }
    });

    // Commit changes and change data in profile view on appearance edit
    $('#appearance-form').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.post($this.attr('action'), $this.serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        updateAppearanceColor($this.find('#appearance-hair-color option:selected').data('color'), $this.find('#appearance-hair-color option:selected').text(), $('#profile-hair-color'));
        updateAppearanceColor($this.find('#appearance-eye-color option:selected').data('color'), $this.find('#appearance-eye-color option:selected').text(), $('#profile-eye-color'));

        updateAppearanceData($this.find('#appearance').val(), $this.find('#appearance option:selected').text(), $('#profile-appearance'));
        updateAppearanceData($this.find('#appearance-physique').val(), $this.find('#appearance-physique option:selected').text(), $('#profile-physique'));
        updateAppearanceData($this.find('#appearance-height').val(), $this.find('#appearance-height').val(), $('#profile-height'));
        updateAppearanceData($this.find('#appearance-height').val(), $this.find('#appearance-weight').val(), $('#profile-weight'));
        updateAppearanceData($this.find('#appearance-breast input:checked').val(), $this.find('#appearance-breast input:checked').data('text'), $('#profile-breast'));
    });

    // Commit changes and change data in profile view on relationship edit
    $('#relationship-form').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);


        $.post($this.attr('action'), $this.serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        $('#relationship-types').html('');

        // Display all checked relationships
        $('.relationship-type input[type="checkbox"]').each(function () {
            if (!$(this).prop('checked')) {
                return;
            }

            $('#relationship-types')
                .append('<div class="sect clearfix"><div class="tit_num">' + $(this).data('text') + '</div></div>');
        });

        $('#profile-relationship').show();

        var $keptPay = $('.relationship-kept-pay-type input[type="checkbox"]');

        if ($keptPay.prop('checked')) {
            $('#profile-relationship').show();

            $('#kept-pay-profile').text($('#relationship-pay option:selected').text());
        } else {
            $('#profile-relationship').hide();
        }

        var $travel = $('#profile-travel');

        $travel.find('.passport, .schengen').hide();

        if ($('#relationship-passport').parent().hasClass('active') || $('#relationship-schengen').parent().hasClass('active')) {
            if ($('#relationship-passport').parent().hasClass('active')) {
                $travel.find('.passport').show();
            }

            if ($('#relationship-schengen').parent().hasClass('active')) {
                $travel.find('.schengen').show();
            }

            $travel.show();
        } else {
            $travel.hide();
        }
    });

    // Commit changes and save data on special offer edit
    $('#special-form').on('submit', function (e) {
        e.preventDefault();

        $.post($(this).attr('action'), $(this).serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        $('#special-offer').text($('#special-text').val());
    });

    // Submit form on click
    $('#save-additional').on('click', function () {
        $('#additional-form').submit();
    });

    function applyBlockValues($block, value) {
        if (value) {
            $block.show();
            $block.find('.value').html(value);
        } else {
            $block.hide();
        }
    }

    // Commit changes and change data in profile view on additional edit
    $('#additional-form').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);

        $.post($this.attr('action'), $this.serializeArray(), 'json').success(function (response) {
            profileActive(response['active']);
        });

        var education = $this.find('#higher-education option:selected').text();
        var family = $this.find('#family-exist option:selected').text();
        var children = $this.find('#children-exist option:selected').text();
        var hobbies = "";

        $this.find('#hobbies .active_checkbox').each(function (key, value) {
            var text = $(value).text();

            if (hobbies != "") {
                hobbies += ", ";

                text = text.toLowerCase();
            }

            hobbies += text;
        });

        var $block = $('#additional-profile-block');

        var $education = $block.find('#profile-education');
        var $hobbies = $block.find('#profile-hobbies');
        var $family = $block.find('#profile-family');
        var $children = $block.find('#profile-children');

        applyBlockValues($education, education);
        applyBlockValues($hobbies, hobbies);
        applyBlockValues($family, family);
        applyBlockValues($children, children);
    });

    // Block or unblock select on change kept pay
    $('.relationship-kept-pay-type input').on('change', function (e) {
        if ($(this).prop('checked')) {
            $('#relationship-pay').attr('name', 'client[keptPay]');
        } else {
            $('#relationship-pay').attr('name', '');
        }

        $('select').trigger('refresh');
    });

    // Show popup for image delete from profile
    $('body').on('click', '.delete-image', function (e) {
        e.preventDefault();

        var $this = $(this);

        showImageDeletePopup($this.attr('data-id'), $this.attr('data-avatar'));
    });

    // Remove image from profile
    $('body').on('click', '#remove-image', function (e) {
        e.preventDefault();

        var id = $(this).attr('data-id'),
            avatar = $(this).attr('data-avatar'),
            default_header_avatar_url = '/images/default-user-avatar-small.jpg';

        if (id != 0) {
            var $parent = $('.delete-image[data-id="' + id + '"]').parent().parent(),
                $slide = $parent.parent();

            $.post('/ajax/photo/remove-image/' + id, {}, 'json').success(function (response) {
                profileActive(response['active']);
                photoConfirmed(response['photoConfirmed']);

                if (response.isLastImage) {
                    $.displayPopup($('[data-popup-block="cant_delete_last_image"]'));
                } else {
                    $parent.remove();
                    $slide.append($('.it_photo[data-popup-open="photo"]:first').clone());

                    if (response.avatar && (avatar || id != response.avatar_id)) {
                        var $newAvatar = $('.photo_slides').find('img[data-id="' + response.avatar_id + '"]');

                        console.log($newAvatar);

                        if ($newAvatar.length) {
                            $newAvatar.attr('data-avatar', 1);
                        }

                        $('.prof_setting_header .photo_bl img').attr('src', response.avatar_small);
                        $('.main_photo .added_photo').show();
                        $('.main_photo .add_photo').hide();
                        $('.added_photo .avatar').attr('src', response.avatar);
                    } else if (avatar) {
                        $('.prof_setting_header .photo_bl img').attr('src', default_header_avatar_url);

                        $('.main_photo .added_photo').hide();
                        $('.main_photo .add_photo').show();

                        $('.added_photo .avatar').attr('src', '#');
                    }
                }
            });
        } else {
            $.get('/ajax/remove-avatar', {}, 'json').success(function (response) {
                $.updateProfileImages(response);

                photoConfirmed(response['photoConfirmed']);

                $('.prof_setting_header .photo_bl img').attr('src', default_header_avatar_url);

                profileActive(response['active']);
            });

            $('.main_photo .added_photo').hide();
            $('.main_photo .add_photo').show();

            $('.added_photo .avatar').attr('src', '#');

            $('.delete-image').attr('data-avatar', false);
        }

        $.hidePopup($('[data-popup-block="delete_image"]'));
    });

    if ($('.isProfile').length) {
        $('.checked-avatar').css('display', 'block');
    }

    // Set image as avatar
    $('body').on('click', '.set-as-avatar', function (e) {
        e.preventDefault();

        var $this = $(this);

        var $obj = $this.parent().parent().find('img');
        var src = $obj.attr('data-slide-src');

        // If user has original photo without effects
        if ($obj.attr('data-original')) {
            src = $obj.attr('data-original');
        }

        var $img = $('<img>');

        $img.attr('crossOrigin', 'anonymous');
        $img.attr('src', src);

        $img.one('load', function () {
            var image = new ImgModel($img[0], null, $img[0].width, $img[0].height);
            image.id = $this.attr('data-id');

            $.cropModule.setImage(image, $img[0]);

            $.displayPopup($('[data-popup-block="crop"]'));

            $('.new-popup-registration__crop-wrapper').fadeIn();
        });


        /*setImageAvatar({
         data_id: $(this).data('id'),
         data_slide_src: $(this).parent().parent().find('img').attr('data-slide-src')
         });*/
    });

    // Set image as avatar
    $('body').on('click', '.checked-avatar', function (e) {
        e.preventDefault();

        var $obj = $('.slides_popup .img_wrap .first_img');
        var $obj = $('.popup-photo img[data-id="' + $obj.attr('data-id') + '"]');

        var src = $obj.attr('data-slide-src');

        // If user has original photo without effects
        if ($obj.attr('data-original')) {
            src = $obj.attr('data-original');
        }

        var $img = $('<img>');

        $img.attr('crossOrigin', 'anonymous');
        $img.attr('src', src);

        $img.one('load', function () {
            var image = new ImgModel($img[0], null, $img[0].width, $img[0].height);
            image.id = $obj.attr('data-id');

            $.cropModule.setImage(image, $img[0]);

            $.displayPopup($('[data-popup-block="crop"]'));

            $('.new-popup-registration__crop-wrapper').fadeIn("fast", function () {
                $('.slides_popup').hide();
            });
        });
    });

    function setImageAvatar(options) {

        var data_id = options.data_id;
        var data_slide_src = options.data_slide_src;
        var $img = $('#avatar-resize-image');

        // console.log(options)

        $img.attr('src', data_slide_src);

        $img.one('load', function () {
            $.displayPopup($('[data-popup-block="crop_component"]'));
        });

        var $img = $('#avatar-resize-image');

        if (this.height > this.width) {
            var crop = this.width;
        } else {
            var crop = this.height;
        }

        resizeableImage($('.resize-image'), crop);
        var ww = $(window).width() * 0.6;
        var wh = $(window).height() * 0.6;

        $('.resize-image').css({'max-width': ww, 'max-height': wh});

        get_crop_size();
        $('body').addClass('overflow_h');

        $('#save-crop').attr('data-type', 'image');
        $('#save-crop').attr('data-id', data_id);
    }

    // Confirm image
    $('body').on('change', '#confirm-upload-input', function () {
        var data = new FormData();

        data.append('image', this.files[0]);

        $.ajax({
            type: 'post',
            url: '/ajax/confirm-image',
            data: data,
            processData: false,
            contentType: false
        });

        $.displayPopup($('[data-popup-block="confirmation_success"]'));

        $('[data-popup-open="confirmation"]').removeClass('active');
    });

    // Display avatar on click
    $('.open-avatar').on('click', function () {
        $('.it_photo img[data-id="' + $(this).data('id') + '"]').parent().click();
    });

    // Display avatar on click for current profile
    $('.open-avatar-current-profile').on('click', function () {
        if ($('.it_photo img[data-avatar="1"]').length) {
            $('.it_photo img[data-avatar="1"]').parent().click();
        }
    });

    // Confirm name change by ajax
    $('#name-change-form').on('submit', function (e) {
        e.preventDefault();

        var name = $(this).find('input').val().trim();

        if (!name) {
            return;
        }

        $.post($(this).attr('action'), $(this).serializeArray(), 'json');

        $.hidePopup($('[data-popup-block="name_change"]'));

        $('.short_inf .name').text(name.split(' ')[0])
    });

    // Load new profile views
    $('#load-profile-views').on('click', function () {
        $.post('/ajax/profile-views', {'offset': $('body .view_profile_table li').length}, 'json').success(function (response) {
            $('.view_profile_table').append(response['content']);

            if (!response['need_load']) {
                $('#load-profile-views').parent().remove();
            }

            changeUrlParam('offset', $('body .view_profile_table li').length);
        });
    });
});

/**
 * Profile file
 * For function in others profiles
 */

$(document).ready(function () {
    // Send message for profile
    $('#profile-send-message').on('submit', function (e) {
        e.preventDefault();

        if (!$('#profile-message').val()) {
            return false;
        }

        var $button = $(this).find('button');

        $button.prop('disabled', true);

        // $.displayPopup($('[data-popup-block="message_popup"]'));

        $.post('/ajax/message/' + $(this).attr('data-id') + '/add',
            {'message': $('#profile-message').val()}, 'json').success(function (response) {
                $button.prop('disabled', false);

                if (response['success']) {

                    $('#profile-message').val('');

                    $.displayPopup($('[data-popup-block="message_send_popup"]'));
                    angular.element('[get-dialogs]').scope().$broadcast('getProfileDialogs', {});

                    // $( document ).trigger( "renderDialogs" );
                    // window.location.href = response['redirect'];

                } else {
                    $.hidePopup($('[data-popup-block="send_message"]'));

                    if (response['error'] == 'premium') {
                        $.displayPopup($('[data-popup-block="not_premium"]'));
                    } else if (response['error'] == 'not_active') {
                        $.displayPopup($('[data-popup-block="message_not_active"]'));
                    } else if (response['error'] == 'in_blacklist') {
                        $.displayPopup($('[data-popup-block="in_blacklist"]'));
                    } else if (response['error'] == 'empty_message') {
                        $.displayPopup($('[data-popup-block="empty_message"]'));
                    } else {
                        $.displayPopup($('[data-popup-block="contacts_count"]'));
                    }
                }
            });
    });

    // Show special offer
    $('.show-special-offer').on('click', function (e) {
        e.preventDefault();

        $(this).hide();
        $('.special-offer').show();
    });

    // Change text and icon module
    var ChangeStatus = function () {

        return {
            initialize: function (options) {
                this.options = options;
                this.clickEl();
            },

            clickEl: function () {
                var that = this;
                this.options.el.on('click', function (e) {
                    e.preventDefault();
                    that.setData();
                });
            },

            setData: function () {
                var $el = this.options.el;
                $.get(this.options.url + $el.data('id'), {}, 'json');

                if ($el.text() == this.options.on) {
                    $el.text(this.options.off);
                    this.setImage();
                } else {
                    $el.text(this.options.on);
                    this.setImage();
                }
            },

            setImage: function () {
                var $el = this.options.el;
                if ($el.text() == this.options.on) {
                    if (this.options.onImage) {
                        $el.css('background-image', 'url("/images' + this.options.onImage + '")');
                    } else if (this.options.onClass) {
                        $el.removeClass(this.options.offClass).addClass(this.options.onClass);
                    }
                } else {
                    if (this.options.offImage) {
                        $el.css('background-image', 'url("/images' + this.options.offImage + '")');
                    } else if (this.options.offClass) {
                        $el.removeClass(this.options.onClass).addClass(this.options.offClass);
                    }
                }
            }

        };

    };

    // Add client in blacklist
    var addBlacklistOptions = {
        el: $('.add_blacklist'),
        on: 'Добавить в игнор',
        off: 'Убрать из игнора',
        onImage: '/ignore_grey_bg.png',
        offImage: '/ignore_bg.png',
        url: '/ajax/blacklist/'
    };

    var addBlacklist = new ChangeStatus();
    addBlacklist.initialize(addBlacklistOptions);
    if ($('.add_blacklist')) addBlacklist.setImage();

    // Add client in favorite list
    var addFavouritesOptions = {
        el: $('.add_favourites'),
        on: 'Добавить в избранные',
        off: 'Убрать из избранного',
        onClass: 'icon-star-empty',
        offClass: 'icon-star',
        url: '/ajax/favorite/'
    };

    var addFavourites = new ChangeStatus();
    addFavourites.initialize(addFavouritesOptions);
    if ($('.add_favourites')) addFavourites.setImage();

    // Add or remove class for dropblock
    $('.add_favourites').on('click', function () {
        var $parent = $(this).parent();
        var needleClass = 'added-in-favorites';

        if ($parent.hasClass(needleClass)) {
            $parent.removeClass(needleClass);
        } else {
            $parent.addClass(needleClass);
        }
    });

    // Click on a gift when user not in contact
    $('.gift-not-in-contact').on('click', function (e) {
        e.preventDefault();

        $('#not-in-contact-accept').attr('data-id', $(this).data('id'));
        $.displayPopup($('[data-popup-block="not_in_contact"]'))
    });

    // Send gift from profile when user not in contacts
    $('#not-in-contact-accept').on('click', function (e) {
        e.preventDefault();

        var friend_id = $(this).data('client');
        var gift_id = $(this).data('id');

        $.post('/ajax/payment/buy-gift/' + gift_id, {'friend': friend_id}, 'json')
            .success(function (response) {
                if (response['success']) {

                    // Render by id
                    // Gift.addListItem({'gift_id': gift_id});

                    $.displayPopup($('[data-popup-block="gift_success"]'));

                    $('body').on('click', '[data-popup-close="gift_success"]', function (e) {
                        e.preventDefault();

                        window.location.href = response['redirect'];
                    });

                } else {
                    if (response['error'] == 'balance') {
                        $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                    } else if (response['error'] == 'tokens') {
                        $.displayPopup($('[data-popup-block="contacts_count"]'));
                    }
                }
                console.log(response);
            }).error(function (response) {
                console.log(response);
            });
    });

    // Gift module
    Gift = {
        initialize: function () {
            this.getList();
        },

        // Get list ajax
        getList: function () {
            var that = this;
            $.ajax({
                'url': '/ajax/gift/list',
                'type': 'get',
                'data': {},
                success: function (response) {
                    if (response) {
                        // $.displayPopup($('[data-popup-block="gift_success"]'));
                        that.render(response);

                    }

                }
            });
        },

        showAlert: function () {
        },

        htmlListItem: function () {
        },

        addListItem: function (option) {
            // alert(option.gift_id);
        },

        render: function (data) {
        }
    }

    $('#delete-profile-form').on('submit', function (e) {
        var $form = $(this),
            $err = $form.find('.error_text'),
            formData = $form.serialize();
        e.preventDefault();
        $err.hide();
        $.post(this.action, formData, function (r) {
            var err_msg = 'Заполните все поля';
            if (!r.success) {
                if (r.errors) {
                    err_msg = r.errors.join('<br>');
                }
                $err.html(err_msg).show();
                return;
            }
            window.location.href = r.redirect || '/';
        });
        return false;
    });
});

_Drop = Drop.createContext({
    // classPrefix: 'drop-element'
});

$('.drop-click').each(function () {

    var $this = $(this);
    var target = $(this).data('drop-target');
    var position = $(this).data('drop-position');

    // alert(target);

    var drop = new _Drop({
        target: $this[0],
        content: $(target)[0],
        classes: 'drop-theme-arrows',
        targetAttachment: 'top left',
        constrainToWindow: false,
        constrainToScrollParent: false,
        position: position,
        openOn: 'click'
    });

    drop.on('open', function () {
        // console.log(drop);
        $('.drop').css('z-index', '55');
        $('.nano').nanoScroller();
        $('.drop-element').css('opacity', '1');
        $('.pen_btn').css('z-index', '0');
        // $(target).css('display', 'block');
    });

});

/**
 * Search file
 * For search page
 */

$(document).ready(function () {
    window.searchData = {
        'type': $('#search-type').val(),
        'tab': 'all',
        'ageFrom': $('#search-age-from').val(),
        'ageTo': $('#search-age-to').val()
    };

    if ($('#search-city').length && $('#search-city').val()) {
        window.searchData['city'] = $('#search-city').val();
    }

    // Add or remove disabled for add params in search form
    $('#search-add-params').on('click', function () {
        if ($('.show_reg_blocked').length) {
            return;
        }

        if ($('.additional_submit_btn:visible').length) {
            $('.additional_submit_btn').hide();
            $('.submit_search_wrap button#submit-search-additional').show();
        } else {
            $('.additional_submit_btn').show();
            $('.submit_search_wrap button').hide();
        }
    });

    // Select other search tab
    $('#search-tab').on('click', 'li', function (e) {
        e.preventDefault();

        if (!$(this).data('name')) {
            return;
        }

        $('#search-tab li').removeClass('active');
        $(this).addClass('active');

        if ($(this).data('name') == 'new') {
            $('li.control_bar_select').show();
        } else {
            $('li.control_bar_select').hide();
        }

        window.searchData['tab'] = $(this).data('name');
        window.searchData['new_from'] = $('.control_bar_select select').val();

        loadSearchClients(1);
    });

    // Hide or show fields depends on type
    $('#search-type').on('change', function () {
        var type = $(this).find('option:selected').data('type');
        var ageFrom = $('.slider_age_range').parent().find(".amount1").val();
        var ageTo = $('.slider_age_range').parent().find(".amount2").val();

        if (type == 'kept') {
            if (ageFrom == 26 && ageTo == 45) {
                $(".slider_age_range").slider({
                    range: true,
                    min: 18,
                    max: 70,
                    values: [18, 35],
                    slide: function (event, ui) {
                        $(this).find(".amount1").val(ui.values[0]);
                        $(this).find(".amount2").val(ui.values[1]);
                    }
                });

                $('.slider_age_range').parent().find(".amount1").val($(".slider_age_range").slider("values", 0));
                $('.slider_age_range').parent().find(".amount2").val($(".slider_age_range").slider("values", 1));
            }

            $('.kept-fields').show();
            $('.kept-fields select, .kept-fields input').prop('disabled', false);

            $('.sponsor-fields').hide();
            $('.sponsor-fields select, .sponsor-fields input').prop('disabled', true);

            $('#search-kept-pay').show();
            $('#search-sponsor-pay').hide();

            $('#relationship-types .sponsor-fields input[type="checkbox"]').prop('checked', false);
            $('#relationship-types .sponsor-fields input[type="checkbox"]').parent().removeClass('active');

            $('.type-select-title').each(function () {
                $(this).text($(this).data('female'));
            });

            $('.person_checked_wrap').show();
        } else {
            if (ageFrom == 18 && ageTo == 28)  {
                $(".slider_age_range").slider({
                    range: true,
                    min: 18,
                    max: 70,
                    values: [26, 45],
                    slide: function (event, ui) {
                        $(this).find(".amount1").val(ui.values[0]);
                        $(this).find(".amount2").val(ui.values[1]);
                    }
                });

                $('.slider_age_range').parent().find(".amount1").val($(".slider_age_range").slider("values", 0));
                $('.slider_age_range').parent().find(".amount2").val($(".slider_age_range").slider("values", 1));
            }

            $('.kept-fields').hide();
            $('.kept-fields select, .kept-fields input').prop('disabled', true);

            $('.sponsor-fields').show();
            $('.sponsor-fields select, .sponsor-fields input').prop('disabled', false);

            $('#search-kept-pay').hide();
            $('#search-sponsor-pay').show();

            $('#relationship-types .kept-fields input[type="checkbox"]').prop('checked', false);
            $('#relationship-types .kept-fields input[type="checkbox"]').parent().removeClass('active');

            $('.type-select-title').each(function () {
                $(this).text($(this).data('male'));
            });

            $('.person_checked_wrap').hide();
        }
    });

    //Ajax-load on pagination
    $('#search-clients').on('click', '.pagination li a', function (e) {
        e.preventDefault();

        var page = $(this).data('page'),
            $element;

        if (!page) {
            if ($(this).parent().attr('class') == "icon-angle-right") {
                $element = $('#search-clients .active').next();
            } else {
                $element = $('#search-clients .active').prev();
            }

            page = $element.find('a').data('page');
        }

        loadSearchClients(page);
    });

    // Add all selected values in multiselect
    function addMultiselectInSearchData(key, $select) {
        var data = [];

        $select.find('label.active_checkbox').each(function () {
            data.push(parseInt($(this).find('input[type="checkbox"]').val(), 10));
        });

        window.searchData[key] = data;
    }

    // Load clients when changed new from select
    $('.control_bar_select select').on('change', function () {
        window.searchData['new_from'] = $(this).val();

        loadSearchClients(1);
    });

    // Ajax-load on change filters
    $('#search-form').on('submit', function (e) {
        e.preventDefault();

        window.searchData = {};

        $.each($(this).serializeArray(), function () {
            window.searchData[this.name] = this.value;
        });

        window.searchData['new_from'] = $('.control_bar_select select').val();

        if ($(this).find('.additional_plus.minus').length == 0) {
            delete window.searchData['heightFrom'];
            delete window.searchData['heightTo'];
            delete window.searchData['weightFrom'];
            delete window.searchData['weightTo'];
        } else {
            addMultiselectInSearchData('hairColor', $('#search-hair-color'));
            addMultiselectInSearchData('eyeColor', $('#search-eye-color'));
            addMultiselectInSearchData('appearance', $('#search-appearance'));
            addMultiselectInSearchData('physique', $('#search-physique'));
            addMultiselectInSearchData('zodiac', $('#search-zodiac'));
            addMultiselectInSearchData('sexualPeriodicity', $('#search-sexual-periodicity'));
            addMultiselectInSearchData('sexualRole', $('#search-sexual-role'));
            addMultiselectInSearchData('sexualKind', $('#search-sexual-kind'));
            addMultiselectInSearchData('familyExist', $('#search-family-exist'));
            addMultiselectInSearchData('childrenExist', $('#search-children-exist'));
            addMultiselectInSearchData('higherEducation', $('#search-higher-education'));
            addMultiselectInSearchData('hobbies', $('#search-hobbies'));

            var relationshipTypes = [];

            $('#relationship-types input').each(function () {
                if (!$(this).prop('checked')) {
                    return;
                }

                relationshipTypes.push(parseInt($(this).val(), 10));
            });

            window.searchData['relationshipType'] = relationshipTypes;
        }

        window.searchData['tab'] = $('#search-tab li.active').data('name');

        loadSearchClients(1);
    });

    // Disable select on search kept checkbox
    $('#search-kept-checkbox').on('change', function () {
        if ($(this).prop('checked')) {
            $('#kept-pay-select').prop('disabled', false);
        } else {
            $('#kept-pay-select').prop('disabled', true);
        }
    });

    // Reset additional params on search
    $('#reset-search-additional').on('click', function (e) {
        e.preventDefault();

        $('.additional_search_filters .add_f_wrap').html('');

        $('.additional_search_filters .active_checkbox').removeClass('active_checkbox');

        $('.additional_search_filters .active input').prop('checked', false);
        $('.additional_search_filters .active').removeClass('active');
        $('.additional_search_filters .travels .check_wrap').addClass('off');

        $.initialiseSearchAdditionalSliders(true);
        $(this).hide();
    });

    // Show `reset` on additional imput change
    $('.additional_search_filters input').on('change', function() {
        $('#reset-search-additional').show();
    });

    // Change ages on type change
    $('#home-search-type').on('change', function () {
        var type = $(this).find('option:selected').data('type');
        var ageFrom = $('.slider_age_range').parent().find(".amount1").val();
        var ageTo = $('.slider_age_range').parent().find(".amount2").val();

        if (type == 'kept' && ageFrom == 26 && ageTo == 45) {
            $(".slider_age_range").slider({
                range: true,
                min: 18,
                max: 70,
                values: [18, 28],
                slide: function (event, ui) {
                    $(this).find(".amount1").val(ui.values[0]);
                    $(this).find(".amount2").val(ui.values[1]);
                }
            });

            $('.slider_age_range').parent().find(".amount1").val($(".slider_age_range").slider("values", 0));
            $('.slider_age_range').parent().find(".amount2").val($(".slider_age_range").slider("values", 1));
        } else if (type == 'sponsor' && ageFrom == 18 && ageTo == 28)  {
            $(".slider_age_range").slider({
                range: true,
                min: 18,
                max: 70,
                values: [26, 45],
                slide: function (event, ui) {
                    $(this).find(".amount1").val(ui.values[0]);
                    $(this).find(".amount2").val(ui.values[1]);
                }
            });

            $('.slider_age_range').parent().find(".amount1").val($(".slider_age_range").slider("values", 0));
            $('.slider_age_range').parent().find(".amount2").val($(".slider_age_range").slider("values", 1));
        }
    });

    // Set nearest city instead of current
    $('body').on('click', '.nearest-city', function (e) {
        e.preventDefault();

        var $this = $(this);

        window.searchData['city'] = $this.data('id');
        delete window.searchData['used_cities'];

        $('#search-city').val($this.data('id'));
        $('#search-city-title').val($this.text());

        loadSearchClients(1);
    });
});
/**
 * Services file
 * For buy some stuff
 */

// Hide contacts list on mouseup
$(document).mouseup(function (e) {
    var $element = $(".ex_contact_list");

    if (!$element.is(e.target) && $element.has(e.target).length === 0) {
        $element.hide();
    }
});

$(document).ready(function () {
    // Load photo place image then crop it
    function cropPhotoPlaceImage(image) {
        if (!image.name.match(/\.(jpg|jpeg|png|gif)$/)) {
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            $.displayPopup($('[data-popup-block="crop_component"]'));

            var $img = $('#photo-place-crop-image');
            $img.attr('src', e.target.result);

            if ($img.height() > $img.width()) {
                var crop = $img.width();
            } else {
                var crop = $img.height();
            }

            resizeableImage($('.resize-image'), crop);
            var ww = $(window).width() * 0.6;
            var wh = $(window).height() * 0.6;

            $('.resize-image').css({'max-width': ww, 'max-height': wh});

            $("<img/>").attr('src', e.target.result).load(function () {
                $.originalWidth = this.width;
                $.originalHeight = this.height;
            });

            $('#photo-place-crop-image').one('load', function () {
                var w = $(this).width();
                var h = $(this).height();
                var s = 0;

                if (w >= h) {
                    s = h;
                    l = w / 2 - h / 2;
                    $('.overlay_crop').css({top: 0, left: l});
                } else {
                    s = w;
                    //FRONT-1211
                    t = 0;
                    $('.overlay_crop').css({top: t, left: 0});
                }

                $('.overlay_crop').css({width: s, height: s});
            });
        };

        reader.readAsDataURL(image);
    }


    // Update contacts total price when selected other
    $('#contact-service').on('change', function () {
        $('#contacts-service-amount').html($(this).find('option:selected').data('price'));
    });

    // Show confirm on buy contacts
    $('#buy-contact').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy contacts
    $('#confirm-buy-contact').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-contacts/' + $('#contact-service').val(), {}, 'json').success(function (response) {
            $this.removeClass('disabled');

            if (response['success']) {
                $('#popup-contacts-count').html(response['count']);

                $.displayPopup($('[data-popup-block="contacts_success"]'));

                $('#current-balance').html(response['balance']);
                $('.contacts-left').html(response['contacts_count']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }
        }).error(function () {
            $this.removeClass('disabled');
        });
    });


    // Change price on package-block click
    $('.package-block input').on('click', function () {
        $('.premium-total').html($(this).data('price'));
    });

    // Show confirm on buy premium
    $('#buy-premium').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_premium_service"]:first'));
    });

    // Buy premium
    $('#confirm-buy-premium').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-premium/' + $('[name="premium-service"]:checked').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $('.premium-icon').show();
                $('.not-premium-icon').hide();

                $.displayPopup($('[data-popup-block="premium_success"]:last'));

                if (response['was_blocked']) {
                    $('body').on('click', '[data-popup-close="premium_success"]:last', function () {
                        window.location.href = $('.prof_link .photo_bl a').attr('href');
                    });
                }

                $('#current-balance').html(response['balance']);

                $('#premium-expires').html(response['premium_expires']);
                $('#premium-expires').parent().show();

                $('.type_prof .type_txt').html('Премиум');

                $('.type_prof .type_txt').addClass('premium');

                $('.contacts-left').html(response['contacts_count']);
                $('#header-minutes-left').html(response['minutes_count']);

                if ($('#just-buy-premium').length) {
                    $('#just-buy-premium').remove();
                }

                $('.not-premium-dropblock').remove();

                $('.premium-dropblock').removeAttr('style');
                $('.premium-dropblock h3').text(response['premium_expires']);

                if ($('.buy_premium.in_bl').length) {
                    $('.buy_premium.in_bl').remove();
                }
            } else {
                if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else if (response['error'] == 'one_time') {
                    $.displayPopup($('[data-popup-block="one_time"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Show confirm on buy premium
    $('#buy-premium-form').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service_form"]:first'));
    });

    // Buy premium
    $('#confirm-buy-premium-form').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-premium/' + $('[name="premium-service-wallet"]:checked').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $('.premium-icon').show();
                $('.not-premium-icon').hide();

                var $popup = $('[data-popup-block="premium_success"]:first');

                $.displayPopup($popup);

                if (response['after_text']) {
                    $popup.find('.after_text').html('<br>' + response['after_text']);
                }

                if (response['was_blocked']) {
                    $('body').on('click', '[data-popup-close="premium_success"]:first', function () {
                        window.location.href = $('.prof_link .photo_bl a').attr('href');
                    });

                    return false;
                }

                if (response['reload']) {
                    $('body').on('click', '[data-popup-close="premium_success"]', function () {
                        window.location.reload();
                    });

                    return false;
                }

                $('#current-balance').html(response['balance']);

                $('#premium-expires').html(response['premium_expires']);
                $('#premium-expires').parent().show();

                $('.type_prof .type_txt').html('Премиум');

                $('.type_prof .type_txt').addClass('premium');

                $('.contacts-left').html(response['contacts_count']);
                $('#header-minutes-left').html(response['minutes_count']);

                if ($('#just-buy-premium').length) {
                    $('#just-buy-premium').remove();
                }

                $('.not-premium-dropblock').remove();

                $('.premium-dropblock').removeAttr('style');
                $('.premium-dropblock h3').text(response['premium_expires']);

                if ($('.buy_premium.in_bl').length) {
                    $('.buy_premium.in_bl').remove();
                }
            } else {
                if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else if (response['error'] == 'one_time') {
                    $.displayPopup($('[data-popup-block="one_time"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Show popup on buy online
    $('#buy-online').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy online
    $('#confirm-buy-online').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-online/' + $('#online-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="online_success"]'));

                $('#current-balance').html(response['balance']);
                $('#online-expires').html(response['online_expires']);

                $('#online-expires').parent().show();

                var $premium = $('.buy_premium.in_bl:first a');

                $premium.attr('href', response['button_href']);
                $premium.text(response['button_text']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Display popup on buy confirmed
    $('#buy-confirmed').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy confirmed
    $('#confirm-buy-confirmed').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-confirmed/' + $('#confirmed-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="confirmed_success"]'));

                $('#current-balance').html(response['balance']);
                $('#confirmed-expires').html(response['confirmed_expires']);

                $('#confirmed-expires').parent().show();
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Buy confirmed from popup
    $('#buy-confirmed-popup').on('submit', function (e) {
        e.preventDefault();

        var $btn = $(this).find('button');

        $btn.prop('disabled', true);

        $.get('/ajax/payment/buy-confirmed/' + $('#confirmed-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="confirmed_success"]'))

                $('#current-balance').html(response['balance']);

                var $parent = $('.person_checked_wrap:first');
                var $a = $parent.find('a');

                $a.removeAttr('data-popup-open');

                // Activate filter
                $parent.attr('data-name', 'confirmed');
                $parent.trigger('click');
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $btn.prop('disabled', false);
        }).error(function () {
            $btn.prop('disabled', false);
        });
    });

    // Buy online from popup
    $('#buy-online-popup').on('submit', function (e) {
        e.preventDefault();

        var $btn = $(this).find('button');

        $btn.prop('disabled', true);

        $.get('/ajax/payment/buy-online/' + $('#online-popup-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="online_success"]'));

                $('#current-balance').html(response['balance']);

                var $a = $('a[data-popup-open="who_online"]');
                var $parent = $a.parent();

                $a.removeAttr('data-popup-open');

                // Activate filter
                $parent.attr('data-name', 'online');
                $parent.trigger('click');
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $btn.prop('disabled', false);
        }).error(function () {
            $btn.prop('disabled', false);
        });
    });

    // Display popup on buy invisible
    $('#buy-invisible').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy invisible
    $('#confirm-buy-invisible').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-invisible/' + $('#invisible-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="invisible_success"]'));

                if (response['reload']) {
                    $('body').on('click', '[data-popup-close="invisible_success"]', function () {
                        window.location.reload();
                    });

                    return false;
                }

                $('#current-balance').html(response['balance']);
                $('#invisible-expires').html(response['invisible_expires']);

                $('#invisible-expires').parent().show();

                if ($('.invis_bl .icon').attr('href') != '#') {
                    $('[data-popup-close="invisible_success"]').on('click', function () {
                        window.location.reload();
                    });
                }
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Display popup on buy top fixed
    $('#buy-top-fixed').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy top fixed
    $('#confirm-buy-top-fixed').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-top-fixed/' + $('#top-fixed-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="top_fixed_success"]'));

                if (response['reload']) {
                    $('body').on('click', '[data-popup-close="top_fixed_success"]', function () {
                        window.location.reload();
                    });

                    return false;
                }

                $('#current-balance').html(response['balance']);
                $('#top-fixed-expires').html(response['top_expires']);

                $('#top-fixed-expires').parent().show();

                $('.search-place').text(response['search_place']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Display popup on buy top elevated
    $('#buy-top-elevated').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy top elevated
    $('#confirm-buy-top-elevated').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-top-elevated/' + $('#top-elevated-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="top_elevated_success"]'));

                if (response['reload']) {
                    $('body').on('click', '[data-popup-close="top_elevated_success"]', function () {
                        window.location.reload();
                    });

                    return false;
                }

                $('#current-balance').html(response['balance']);
                $('.search-place').text(response['search_place']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Display popup on buy female unblock
    $('#buy-female-unblock').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Display popup on buy bad behavior unblock
    $('#buy-bad-behavior-unblock').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Display popup on buy inactive unblock
    $('#buy-inactive-unblock').on('submit', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy female unblock
    $('#confirm-buy-female-unblock').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-female-unblock/' + $('#female-unblock-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="female_unblock_success"]'));

                $('body').on('click', '[data-popup-close="female_unblock_success"]', function () {
                    window.location.href = $('.prof_link .photo_bl a').attr('href');
                });

                $('#current-balance').html(response['balance']);
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Buy bad behavior unblock
    $('#confirm-buy-bad-behavior-unblock').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-bad-behavior-unblock/' + $('#bad-behavior-unblock-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="bad_behavior_unblock_success"]'));

                $('body').on('click', '[data-popup-close="bad_behavior_unblock_success"]', function () {
                    window.location.href = $('.prof_link .photo_bl a').attr('href');
                });

                $('#current-balance').html(response['balance']);
            } else {
                $.displayPopup($('[data-popup-block="insufficient_funds"]'));
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });


    // Buy inactive unblock
    $('#confirm-buy-inactive-unblock').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.get('/ajax/payment/buy-inactive-unblock/' + $('#inactive-unblock-service').val(), {}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="inactive_unblock_success"]'));

                $('body').on('click', '[data-popup-close="inactive_unblock_success"]', function () {
                    window.location.href = $('.prof_link .photo_bl a').attr('href');
                });

                $('#current-balance').html(response['balance']);
            } else {
                $.displayPopup($('[data-popup-block="insufficient_funds"]'));
            }

            $this.removeClass('disabled');
        }).error(function () {
            $this.removeClass('disabled');
        });
    });

    // Display popup on buy adv
    $('#buy-adv').on('submit', function (e) {
        e.preventDefault();

        if (!$('#adv-message-text').val() || !($('#adv-message-city').val())) {
            return;
        }

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy adv
    $('#confirm-buy-adv').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        var data = {
            'message': $('#adv-message-text').val(),
            'city': $('#adv-message-city').val(),
            'blacklist': []
        };

        $('[name="blacklist"]').each(function () {
            data['blacklist'].push($(this).attr('value'));
        });

        $.post('/ajax/payment/buy-adv/' + $('#adv-service').val(), data, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="adv_success"]'));

                $('#current-balance').html(response['balance']);

                $('body').on('click', '[data-popup-close="adv_success"]', function (e) {
                    e.preventDefault();

                    window.location.reload();
                });
            } else {
                if (response['error'] == 'not_premium') {
                    mediator.publish('service-buy-error-not-premium');
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function (response) {
            $this.removeClass('disabled');
        });
    });

    // Show popup on buy club card
    $('.buy-card').on('click', function (e) {
        e.preventDefault();

        window.buy_card_id = $(this).attr('data-id');

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Show popup on buy club card
    $('#buy-club-card').on('click', function (e) {
        e.preventDefault();

        window.buy_card_id = $('#club-card-service').val();

        $.displayPopup($('[data-popup-block="buy_service"]'));
    });

    // Buy online
    $('#confirm-buy-club-card').on('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('disabled')) {
            return;
        }

        $this.addClass('disabled');

        $.post('/api/payment/club-card/' + window.buy_card_id, {}, 'json').success(function (data) {
            if (data.response.success) {
                var response = data.response;

                var $popup = $('[data-popup-block="buy_card_success"]');

                $.displayPopup($popup);

                $('#current-balance').html(response['balance']);

                if (response['after_text']) {
                    $popup.find('.after_text').html('<br>' + response['after_text']);
                }

                if (response.reload) {
                    $('[data-popup-close="buy_card_success"]').on('click', function () {
                        window.location.reload();
                    });
                }

                $('#club-card-expires').html(response['expires']);
            } else {
                var response = data.error;

                if (response.message == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response.message == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $this.removeClass('disabled');
        }).error(function (data) {
            var response = data.error;

            if (response.message == 'not_premium') {
                $.displayPopup($('[data-popup-block="service_not_premium"]'));
            } else if (response.message == 'not_active') {
                $.displayPopup($('[data-popup-block="service_not_active"]'));
            } else {
                $.displayPopup($('[data-popup-block="insufficient_funds"]'));
            }

            $this.removeClass('disabled');
        });
    });

    // Add photo and buy photo place
    $('.js-addPhoto').on('click', function (e) {
        e.preventDefault();

        $(this).css('z-index', '10');
        buyPhotoPlace();
    });

    // Buy photo place
    $('body').on('submit', '#buy-photo-place', function (e) {
        e.preventDefault();
        var checkedPhotoUrl = $('.select_photo').find('.active').next('img').attr('src');

        if (checkedPhotoUrl === undefined) {
            $(this).append('<p class="error_text">Вы не выбрали фотографию</p>');
        } else {
            $(this).find('.error_text').hide();
            checkBuyPhotoInAlbum(checkedPhotoUrl);
        }

    });

    // Update photo place
    $('body').on('submit', '#update-photo-place', function (e) {
        e.preventDefault();
        updatePhotoPlace();
    });

    // For single checkbox
    $('.photos .item').click(function () {
        $('.photos .active').removeClass('active');
        $(this).find('.js-singleCheckbox').addClass('active');
    });

    // Check photo in photo list
    function checkBuyPhotoInAlbum(checkedPhotoUrl) {
        $('#buy-photo-place button, #update-photo-place button').prop('disabled', true);

        var $btn;
        $.post('/ajax/payment/check-balance/' + $('#photo-place-service').val(), {}, 'json').success(function () {

            // Convert to base64
            convertImgToBase64(checkedPhotoUrl, function (base64Img) {

                // Send ajax buy photo place
                buyPhotoPlaceAjax($('#photo-place-service').val(), {
                    'message': $('#photo-place-text').val(),
                    'image': base64Img
                }, $btn);
            });

            $('#buy-photo-place button, #update-photo-place button').prop('disabled', false);
        }).error(function () {
            $.displayPopup($('[data-popup-block="insufficient_funds"]'));

            $('#buy-photo-place button, #update-photo-place button').prop('disabled', false);
        });
    }

    // Buy photo place
    function buyPhotoPlace() {
        $.post('/ajax/payment/check-balance/' + $('#photo-place-service').val(), {}, 'json').success(function () {
            $.displayPopup($('[data-popup-block="photo_block"]'));

            $('#dragAndDropFiles').on("dragover", function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            document.getElementById('dragAndDropFiles').addEventListener("drop", function (e) {
                console.log(e);
                e.preventDefault();

                if (e.dataTransfer.files.length) {
                    cropPhotoPlaceImage(e.dataTransfer.files[0]);
                }
            });
        }).error(function () {
            $.displayPopup($('[data-popup-block="insufficient_funds"]'));
        });
    }

    // Update photo place
    function updatePhotoPlace() {
        console.log('update');
        var $btn = $(this).find('button');

        $btn.prop('disabled', true);

        $.post('/ajax/payment/buy-photo-place/' + $('#photo-place-service').val(), {'message': $('#photo-place-text').val()}, 'json').success(function (response) {
            if (response['success']) {
                $.displayPopup($('[data-popup-block="photo_place_success"]'));

                $('#current-balance').html(response['balance']);

                $('#photo-place-expires').html(response['expires']);

                $('#photo-place-expires').parent().show();

                $('#buy-photo-place button[type="submit"]').text('Продлить');
                $('#edit-photoplace').show();
            } else {
                if (response['error'] == 'not_premium') {
                    $.displayPopup($('[data-popup-block="service_not_premium"]'));
                } else if (response['error'] == 'not_active') {
                    $.displayPopup($('[data-popup-block="service_not_active"]'));
                } else {
                    $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                }
            }

            $btn.prop('disabled', false);
        }).error(function (response) {
            $btn.prop('disabled', false);
        });
    }

    // Display crop when we uploaded image to photo place
    $('#photo-place-upload').on('change', function (e) {
        if (e.target.files.length) {
            cropPhotoPlaceImage(e.target.files[0]);
        }
    });

    // Display popup on save photo place
    $('#save-photo-place-crop').on('click', function (e) {
        e.preventDefault();

        var $container = $('#photo-place-crop-image').parent('.resize-container');

        var wCoof = $.originalWidth / $('#photo-place-crop-image').width();
        var hCoof = $.originalHeight / $('#photo-place-crop-image').height();

        var crop_canvas,
            left = $('.overlay_crop').offset().left - $container.offset().left,
            top = $('.overlay_crop').offset().top - $container.offset().top,
            width = $('.overlay_crop').width() * wCoof,
            height = $('.overlay_crop').height() * hCoof;

        crop_canvas = document.createElement('canvas');
        crop_canvas.width = $('.overlay_crop').width();
        crop_canvas.height = $('.overlay_crop').height();

        crop_canvas.getContext('2d').drawImage($('#photo-place-crop-image').get(0), left * wCoof, top * hCoof, width, height, 0, 0, $('.overlay_crop').width(), $('.overlay_crop').height());

        var data = crop_canvas.toDataURL("image/png");

        // var $btn;
        // alert(data);

        pasteImageInPhotoPlaceList(data);

        // Hide this popup
        $.hidePopup();

        // Send ajax buy photo place
        // buyPhotoPlaceAjax($('#photo-place-service').val(), {
        //   'message': $('#photo-place-text').val(),
        //   'image': data
        // }, $btn);

    });

    function pasteImageInPhotoPlaceList(data) {
        var html = "<label class='in_bl item js-photo'>";
        html += "<span class='checkbox icon-check js-singleCheckbox'>";
        html += "</span>";
        html += "<img src='" + data + "'>";
        html += "</label>";

        $('.js-photo').last().after(html);

        // add event
        $('.js-photo').last().click(function () {
            $('.photos .active').removeClass('active');
            $(this).find('.js-singleCheckbox').addClass('active');
        });

        // Reinitialise scroll
        var $scroll = $('.with_scroll');
        $scroll.data('jsp').reinitialise();
        var scrollTo = $scroll.data('jsp').getContentWidth();
        $scroll.data('jsp').scrollTo(scrollTo, 0);

    }

    function buyPhotoPlaceAjax(service_id, data, $btn) {
        // console.log(data);

        $.post('/ajax/payment/buy-photo-place/' + service_id, data, 'json')
            .success(function (response) {
                if (response['success']) {
                    $('#buy-photo-place').find('button[type="submit"]').text('Продлить');
                    $('#buy-photo-place').attr('id', 'update-photo-place');

                    $.displayPopup($('[data-popup-block="photo_place_success"]'));

                    $('#current-balance').html(response['balance']);

                    $('#photo-place-expires').html(response['expires']);

                    $('#photo-place-expires').parent().show();

                    $('#buy-photo-place button[type="submit"]').text('Продлить');
                } else {
                    if (response['error'] == 'not_premium') {
                        $.displayPopup($('[data-popup-block="service_not_premium"]'));
                    } else if (response['error'] == 'not_active') {
                        $.displayPopup($('[data-popup-block="service_not_active"]'));
                    } else {
                        $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                    }
                }
            }).error(function (response) {

        });
    }

    // To base64
    function convertImgToBase64(url, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            var dataURL = canvas.toDataURL(outputFormat || 'image/png');
            callback(dataURL);
            canvas = null;
        };
        img.src = url;
    }

    // Update price on select some value
    $('#online-popup-service').on('change', function () {
        $('#online-popup-total').html($(this).find('option:selected').data('price'));
    });

    // Update price for top fixed service on select some value
    $('#top-fixed-service').on('change', function () {
        $('#top-fixed-total').html($(this).find('option:selected').data('price'));
    });

    // Update price for top elevated service on select some value
    $('#top-elevated-service').on('change', function () {
        $('#top-elevated-total').html($(this).find('option:selected').data('price'));
    });

    // Update price for female unblock service on select some value
    $('#female-unblock-service').on('change', function () {
        $('#female-unblock-total').html($(this).find('option:selected').data('price'));
    });

    // Update price for top adv messages service on select some value
    $('#adv-service').on('change', function () {
        $('#adv-service-total').html($(this).find('option:selected').data('price'));
    });

    // Update price for top adv messages service on select some value
    $('#photo-place-service').on('change', function () {
        $('#photo-place-total').html($(this).find('option:selected').data('price'));
    });

    // Update total for online service on select some value
    $('#online-service').on('change', function () {
        $('#online-total').html($(this).find('option:selected').data('price'));
    });

    // Update total for invisible service on select some value
    $('#invisible-service').on('change', function () {
        $('#invisible-total').html($(this).find('option:selected').data('price'));
    });

    // Update total for invisible service on select some value
    $('#confirmed-service').on('change', function () {
        $('#confirmed-total').html($(this).find('option:selected').data('price'));
    });

    // Edit photo place message
    $('#edit-photoplace').on('click', function (e) {
        e.preventDefault();

        $('#update-photo-place button').prop('disabled', true);

        $.post('/ajax/payment/edit-photo-place', {'message': $('#photo-place-text').val()}, 'json').success(function (response) {
            $('#update-photo-place button').prop('disabled', false);

            if (response['success']) {
                $.displayPopup($('[data-popup-block="photoplace_updated"]'));
            }
        });
    });

    // On promo-code submit
    $('#promo-code').on('submit', function (e) {
        e.preventDefault();

        var $this = $(this);
        var $btn = $(this).find('button');

        $btn.find('button').prop('disabled', true);

        $.post('/api/payment/promo-code', $(this).serializeArray(), 'json').success(function (response) {
            $this.find('input').removeClass('error_border');
            $this.find('.error_text').hide();
            $btn.find('button').prop('disabled', false);

            var $popup = $('[data-popup-block="promo_code_activated"]');

            $popup.find('.pop_bold_text').text('Поздравляем - Вы получили ' + response.response.description);

            $.displayPopup($popup);

            $('body').on('click', '[data-popup-close="promo_code_activated"]', function () {
                window.location.reload();
            });
        }).error(function (response) {
            var $error = $this.find('.error_text');

            $this.find('input').addClass('error_border');

            if (response.status == 404) {
                $error.text('Неправильный код')
            } else {
                $error.text(response.responseJSON.error.message);
            }

            $error.show();

            $btn.find('button').prop('disabled', false);
        });
    });

    // Preview image on unblock-form change
    $('#unblock-form').on('change', function () {
        var input = this;

        if (input.files && input.files[0]) {
            var type = input.files[0].type;

            if (type != "image/jpeg" && type != "image/png" && type != "image/gift" && type != "image/jpg") {
                $('#unblock-form').val("");

                return false;
            }

            var reader = new FileReader();

            reader.onload = function (e) {
                var $img = $('#unblock-preview');

                $img.show();
                $img.attr('src', e.target.result);

                $('.add_photo_unblock').css({'border': 'none', 'background': 'none'});
            };

            reader.readAsDataURL(input.files[0]);
        }
    });

    // Send request to rule violation unblock
    $('#unblock-rule-violation').on('click', function (e) {
        e.preventDefault();

        var $input = $('#unblock-form');

        if (!$input.val()) {
            $input.parent().find('.add_photo_unblock').attr('style', 'border: 3px dashed red;');

            return false;
        }

        var formData = new FormData();
        formData.append('image', $input[0].files[0]);

        var $select = $('#rule-violation-unblock-service');

        if ($select.length) {
            formData.append('service', $select.val());
        }

        $.ajax({
            url: '/api/blocking/rule_violation/unblock',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.response.success) {
                    $.displayPopup($('[data-popup-block="rule_violation_success"]'));

                    $('#current-balance').html(data.response.balance);
                } else {
                    if (data.response.error == 'insufficient_funds') {
                        $.displayPopup($('[data-popup-block="insufficient_funds"]'));
                    }
                }
            },
            error: function (data) {
                console.log(data);
            }
        });
    });

    // Display wallet history and hide balance add
    $('#display-wallet-history').on('click', function (e) {
        e.preventDefault();

        $('#wallet-add').hide();
        $('#wallet-history').show();
    });

    // Display wallet history and hide balance add
    $('#display-wallet-add').on('click', function (e) {
        e.preventDefault();

        $('#wallet-history').hide();
        $('#wallet-add').show();
    });

    // Load more payment history
    $('#load-payment-history').on('click', function (e) {
        var $this = $(this);
        var $incomeTable = $('#income-table');
        var $purchaseTable = $('#purchase-table');
        var offset = $incomeTable.find('tr').length >= $purchaseTable.find('tr').length ? $incomeTable.find('tr').length : $purchaseTable.find('tr').length;

        $.post('/api/payment/transactions', {'limit': 15, 'offset': offset}, 'json').success(function (response) {
            var data = response.response;

            $.each(data.income, function (key, value) {
                $incomeTable.append('<tr><td>' + value.number + '</td><td>' + value.amount + '</td><td>' + value.date + '</td><td>' + value.type + '</td></tr>');
            });

            $.each(data.purchase, function (key, value) {
                $purchaseTable.append('<tr><td>' + value.number + '</td><td>' + value.amount + '</td><td>' + value.date + '</td><td>' + value.type + '</td></tr>');
            });

            if (data.loadMore === false) {
                $this.parent().hide();
            }
        });
    });
});

/**
 * Settings file
 * For settings page
 */

$(document).ready(function () {
    // Change email text when we changed it
    $('body').on('click', '.change-settings-email, .change-settings-phone', function () {
        var text = $(this).parent().find('input').val();

        $(this).parent().parent().find('.input_text').text(text);
    });

     // Change password text when we changed it
    $('body').on('click', '.change-settings-password', function () {
        var text = $(this).parent().find('input').val();

        if (text) {
            $(this).parent().parent().find('.input_text').text(new Array(text.length+1).join("*"));
        }
    });

    // Show popup when we clicked to delete profile
    $('#delete-profile').on('click', function (e) {
        e.preventDefault();

        $.displayPopup($('[data-popup-block="delete_profile"]'));
    });

    // Submit settings form
    $('form.settings_bl').on('submit', function (e) {
        e.preventDefault();

        $('.error_text').hide();

        $.post('/ajax/settings', $(this).serializeArray(), 'json').success(function (response) {
            console.log(response);
            if (response['success']) {
                var $popup = $('[data-popup-block="settings_success"]');

                if (response['email_changed']) {
                    $popup.find('#new-email-success').show();
                } else {
                    $popup.find('#new-email-success').hide();
                }

                if (response['password_changed']) {
                    $popup.find('#new-password-success').show();
                } else {
                    $popup.find('#new-password-success').hide();
                }

                if (response['phone_changed']) {
                    $popup.find('#new-phone-success').show();

                    $('body').one('click', '[data-popup-close="settings_success"]', function () {
                        $.displayPopup($('[data-popup-block="sms_pop"]'));
                    });

                    $('.you_number').text($('#client_phone').val());
                } else {
                    $popup.find('#new-phone-success').hide();
                }

                $.displayPopup($popup);
            } else {
                $.each(response['errors'], function (key, value) {
                    $('.' + key + '-error').text(value).show();
                });
            }
        }).error(function (response) {
            console.log(response);
        });

    });

    // Display error text when click on pen
    $('.change-this-password').on('click', function () {
        $(this).parent().parent().parent().find('.password-error').show();
    });

    // Hide error text when click on pen
    $('.change-settings-password').on('click', function () {
        $(this).parent().parent().parent().find('.password-error').hide();
    });

    // Browser push notifications
    if(typeof OneSignal !== 'undefined' && $.isFunction(OneSignal.push)) {
        var $input = $('#client_browserPushNotify');
        if(!$input.length) return;

        OneSignal.push(["isPushNotificationsEnabled", function (enabled) {
            $input.prop({
                'disabled': false,
                'checked': enabled
            });
        }]);

        $input.closest('label').on('click', function() {
            OneSignal.push(["setSubscription", $input.is(':checked')]);
        })
    }

});
// Controller for common cases (like an account restore)

var CommonController = function () {
    var self = this;

    // Handle restore-account event
    mediator.subscribe('restore-account', function (email) {
        $.post('/api/restore-account', {'email': email}, 'json').success(function (response) {
            if (response.error_code == 0) {
                mediator.publish('restore-account-success', response);
            } else {
                mediator.publish('restore-account-error', response);
            }
        }).error(function (response) {
            mediator.publish('restore-account-error', response);
        });
    });

    // Handle create-new-account event
    mediator.subscribe('create-new-account', function (form, $btn) {
        $btn.prop('disabled', true);

        if (form && form !== null) {
            var data = form.serializeArray();

            data.push({name: 'create_new', value: true});

            $.post(form.attr('action'), data, 'json').success(function (response) {
                if (response.success) {
                    window.location.href = response.redirect;
                } else {
                    if (response.error_type == 'form-error') {
                        $.each(response.errors, function (key, message) {
                            var $errorBlock = form.find('#' + key + '-error-block');

                            if ($errorBlock && $errorBlock.length) {
                                $errorBlock.html(message);
                                $errorBlock.show();
                            }
                        });
                    } else {
                        mediator.publish('registration-error-' + response.error_type, $form, response.errors);
                    }
                }

                $btn.prop('disabled', false);
            }).error(function (response) {
                var $errorBlock = form.find('#email-error-block');

                $errorBlock.html(response.responseJSON.error);
                $errorBlock.show();
            });
        } else {
            window.location.href = '/registration?create_new=true';
        }
    });

    if (!document.querySelectorAll('[data-phone-country-code-call]').length > 0)
        return false;

    var settings = {
        container: document.querySelectorAll('[data-phone-code-container]'),
        caller: document.querySelectorAll('[data-phone-country-code-call]'),
        dropdown: document.querySelectorAll('[data-counties-codes-dropdown]')
    };

    var phoneCode = {};

    phoneCode.init = function () {
        for (var i = 0; i < settings.dropdown.length; i++) {
            var input = settings.dropdown[i].querySelector('.phone-countries__item.selected');
            phoneCode.updateInput(input, input.getAttribute('data-phone-code'), input.getAttribute('data-phone-mask'));
        }

        phoneCode.bindings();
    };

    phoneCode.bindings = function () {
        for (var i = 0; i < settings.caller.length; i++) {
            settings.caller[i].addEventListener('click', function () {
                phoneCode.openDropdown(this);
            });
        }

        for (var i = 0; i < settings.dropdown.length; i++) {
            var dropdownItems = settings.dropdown[i].querySelectorAll('.phone-countries__item');

            for (var z = 0; z < dropdownItems.length; z++) {
                dropdownItems[z].addEventListener('click', function () {
                    phoneCode.closeDropdowns(this);

                    phoneCode.updateInput(this, this.getAttribute('data-phone-code'), this.getAttribute('data-phone-mask'));
                });
            }
        }

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('phone-countries__dropdown')
                || e.target.closest('.phone-countries__dropdown')
                || e.target.classList.contains('new-popup-registration__phone-country')
                || e.target.closest('.new-popup-registration__phone-country')
            )
                return;

            phoneCode.closeDropdowns(e.target);
        });
    };

    phoneCode.openDropdown = function (block) {
        var container = block.closest('[data-phone-code-container]');

        container.querySelector('[data-phone-country-code-call]').classList.add('active');
        container.querySelector('[data-counties-codes-dropdown]').classList.add('active');

        container.querySelector('.display-flex').classList.add('phone-on-focus');
    };

    phoneCode.closeDropdowns = function (block) {
        var dropdowns = settings.dropdown;
        var container = $('[data-phone-code-container]');

        if (container.length) {
            container = container[0];
        } else {
            container = null;
        }

        for (var i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('active');
            settings.caller[i].classList.remove('active');
        }

        if (container && (!block || !block.classList.contains('phone-input'))) {
            container.querySelector('.display-flex').classList.remove('phone-on-focus');
        }
    };

    phoneCode.updateInput = function (block, value, mask) {
        var container = block.closest('[data-phone-code-container]');
        var input = container.querySelector('[data-phone-country-code-input]').value = value;

        container.querySelector('[data-phone-country-code-input]').setAttribute('data-phone-mask', mask);

        var $phoneInput = $(container).find('.phone-input');

        $phoneInput.val('');
        $phoneInput.focus();
    };

    phoneCode.init();
};

var commonController = new CommonController();
// When user logged in with deleted account
var DeletedAccountOnLoginController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.email = null;

    self.activePopup = null;
    self.deletedPopup = null;
    self.createNewPopup = null;
    self.restorePopup = null;
    self.successPopup = null;

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init controller on deleted error
    mediator.subscribe('authenticate-error', function (error, error_type, email, client_type) {
        if (error_type != 'deleted' || client_type != 1) {
            return false;
        }

        // Init controller
        self.init(email);
    });

    // Init popups
    self.init = function (email) {
        self.email = email;

        // Create deleted popup
        if (!self.deletedPopup) {
            self.deletedPopup = popupRender.create({
                block: 'deleted-account-deleted-popup',
                contents: [
                    '<p class="mb20">Анкета удалена пользователем.</p>',
                    '<p class="mb20"><a href="#" class="violet_btn restore-deleted-account">Восстановить анкету</a></p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style create-new-account">Создать новую анкету</a></p>'
                ]
            });

            self.deletedPopup.find('.restore-deleted-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.restorePopup);
            });

            self.deletedPopup.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.createNewPopup);
            });
        }

        if (!self.restorePopup) {
            self.restorePopup = popupRender.create({
                block: 'deleted-account-restore-popup',
                contents: [
                    '<p class="mb20">Для того чтобы восстановить анкету необходимо заново подтвердить Ваш e-mail.</p>',
                    '<p class="mb20">Отправить e-mail для восстановления анкеты.</p>',
                    '<p class="mb20"><a href="#" class="violet_btn send-restore-email">Отправить</a></p>'
                ]
            });

            // Call API method and show success popup
            self.restorePopup.find('.send-restore-email').on('click', function (e) {
                e.preventDefault();

                mediator.publish('restore-account', self.email);

                self.setActivePopup(self.successPopup);
            });
        }

        if (!self.successPopup) {
            self.successPopup = popupRender.create({
                block: 'deleted-account-success-popup',
                contents: [
                    '<p class="mb20">На Ваш адрес ' + email + ' отправлено письмо для восстановления анкеты.<br/>Проверьте почту и следуйте дальнейшим шагам.</p>'
                ]
            });
        }

        if (!self.createNewPopup) {
            self.createNewPopup = popupRender.create({
                block: 'deleted-account-create-new-popup',
                contents: [
                    '<p class="mb20">По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта при создании новой анкеты Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, будет удалена без возможности восстановления.</p>',
                    '<p class="mb20"><a href="/registration?create_new=true" class="violet_btn">Создать</a></p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style restore-deleted-account">Восстановить удаленную анкету</a></p>'
                ]
            });

            self.createNewPopup.find('.restore-deleted-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.restorePopup);
            });
        } else {
            self.createNewPopup.find('.second-email').html(email);
        }

        self.setActivePopup(self.deletedPopup);
    };
};

var deletedAccountOnLoginController = new DeletedAccountOnLoginController();
// For deleted kepts accounts
var DeletedKeptAccountController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.form = null;
    self.email = null;

    self.activePopup = null;
    self.deletedPopupFromLogin = null;
    self.deletedPopupFromRegistration = null;
    self.restorePopup = null;
    self.createNewPopup = null;

    // Init controller on deleted error
    mediator.subscribe('authenticate-error', function (error, error_type, email, client_type) {
        if (error_type != 'deleted' || client_type != 2) {
            return false;
        }

        // Init controller
        self.init(null, email);
    });

    // Init controller on deleted error
    mediator.subscribe('registration-error-deleted', function ($form, errors, client_type) {
        if (client_type != 2) {
            return false;
        }

        self.init($form, errors.email);
    });


    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init controller
    self.init = function ($form, email) {
        self.form = $form;
        self.email = email;

        if (!self.deletedPopupFromLogin) {
            self.deletedPopupFromLogin = popupRender.create({
                block: 'deleted-kept-account-deleted-popup-from-login',
                contents: [
                    '<p class="mb20">Анкета удалена пользователем.<br />Вы можете восстановить Вашу анкету или создать новую, стоимость 200 руб.</p>',
                    '<p class="mb20"><a href="#" class="violet_btn restore-account">Восстановить</a></p>',
                    '<p class="mb20"><a href="#" class="new-popup-registration__back-link--style create-new-account">Создать новую анкету</a></p>'
                ]
            });

            // Display restore account popup
            self.deletedPopupFromLogin.find('.restore-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.restorePopup);
            });

            // Display create new account popup
            self.deletedPopupFromLogin.find('.create-new-account').on('click', function (e) {
                e.preventDefault();
                self.setActivePopup(self.createNewPopup);
            });
        }

        if (!self.deletedPopupFromRegistration) {
            self.deletedPopupFromRegistration = popupRender.create({
                block: 'deleted-kept-account-deleted-popup-from-registration',
                contents: [
                    '<p class="mb20">Для данного адреса (устройства) возможно восстановление удаленной анкеты.</p>',
                    '<p class="mb20">Вы можете восстановить Вашу анкету или создать новую. Для пользователей удаливших свою анкету эти действия платные: стоимость 200 руб.</p>',
                    '<p class="mb20"><a href="#" class="violet_btn create-new-account">Создать новую</a></p>',
                    '<p class="mb20"><a href="#" class="new-popup-registration__back-link--style restore-account">Восстановить</a></p>'
                ]
            });

            // Display restore account popup
            self.deletedPopupFromRegistration.find('.restore-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.restorePopup);
            });

            // Display create new account popup
            self.deletedPopupFromRegistration.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.createNewPopup);
            });
        }

        if (!self.restorePopup) {
            self.restorePopup = popupRender.create({
                block: 'deleted-kept-account-restore-popup',
                contents: [
                    '<p class="mb20">Для восстановления анкеты необходимо заново подтвердить Ваш e-mail.</p>',
                    '<p class="mb20">По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта восстановление удаленной анкеты пользователем является платной услугой, стоимость 200 рублей.</p>',
                    '<div class="mb20"><span class="in_bl viol_radio"><span class="checkbox icon-ok"><input type="checkbox" name="agreed" id="deleted-kept-account-agreed" /></span></span><label for="deleted-kept-account-agreed">Я ознакомился с правилами</label></div>',
                    '<p class="mb20"><button type="button" class="violet_btn send-restore-email" disabled>Отправить</button></p>'
                ]
            });

            var $btn = self.restorePopup.find('button.send-restore-email');

            // Change button state depends on checkbox
            self.restorePopup.find('#deleted-kept-account-agreed').on('change', function () {
                if ($(this).prop('checked')) {
                    $btn.prop('disabled', false);
                } else {
                    $btn.prop('disabled', true);
                }
            });

            // Call mediator method and show success popup
            $btn.on('click', function () {
                mediator.publish('restore-account', email);

                self.setActivePopup(self.successPopup);
            });
        }

        if (!self.createNewPopup) {
            self.createNewPopup = popupRender.create({
                block: 'deleted-kept-account-create-new-popup',
                contents: [
                    '<p class="mb20">По <a href="/rules" class="new-popup-registration__back-link--style">правилам</a> сайта при создании новой анкеты Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, а так же все данные, покупки, контакты и диалоги будут удалены без возможности восстановления.</p>',
                    '<p class="mb20"><input type="text" disabled value="Создать новую анкету 200 руб." style="width: 40%; display: inline-block; margin-right: 15px;" /><a href="#" class="violet_btn create-new-account">Создать новую анкету</a></p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style back-step">Восстановить старую анкету</a></p>'
                ]
            });

            // Display old popup on back-step click
            self.createNewPopup.find('.back-step').on('click', function (e) {
                e.preventDefault();
                if (self.form && self.form !== null) {
                    self.setActivePopup(self.deletedPopupFromRegistration);
                } else {
                    self.setActivePopup(self.deletedPopupFromLogin);
                }
            });

            // Create new account or redirect to the registration page
            self.createNewPopup.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                mediator.publish('create-new-account', self.form, $(this));
            });
        } else {
            self.createNewPopup.find('.second-email').html(email);
        }

        if (!self.successPopup) {
            self.successPopup = popupRender.create({
                block: 'deleted-kept-account-success-popup',
                contents: [
                    '<p class="mb20">На Ваш адрес ' + email + ' отправлено письмо для восстановления анкеты.<br/>Проверьте почту и следуйте дальнейшим шагам.</p>'
                ]
            });
        }

        if (self.form && self.form !== null) {
            self.setActivePopup(self.deletedPopupFromRegistration);
        } else {
            self.setActivePopup(self.deletedPopupFromLogin);
        }
    };
};

var deletedKeptAccountController = new DeletedKeptAccountController();
// When kept's account is an inactive
var InactiveKeptAccountController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.form = null;
    self.email = null;

    self.activePopup = null;
    self.blockedPopup = null;
    self.confirmPopup = null;
    self.successPopup = null;
    self.createNewPopup = null;

    // Activate popup on authenticate error
    mediator.subscribe('authenticate-error', function (error, error_type, email, client_type) {
        if (error_type !== 'inactive') {
            return false;
        }

        self.init(null, email);
    });

    // We should init controller on registration error event
    mediator.subscribe('registration-error-inactive-account', function ($form, errors, clientType) {
        self.init($form, errors.email);
    });

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init controller
    self.init = function ($form, email) {
        self.form = $form;
        self.email = email;

        if (!self.blockedPopup) {
            self.blockedPopup = popupRender.create({
                block: 'inactive-account-blocked-popup',
                contents: [
                    '<p class="new-popup-registration__title lhn tac mb30">Ваша анкета заблокировна.</p>',
                    '<p class="mb20">Вы отсутствовали на проекте более 180 дней.<br/>По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта, чтобы не мешать активной аудитории в достижении их личных целей, анкеты не активные более 180 дней удаляются из поиска и блокируются для дальнейшего использования.</p>',
                    '<p class="mb20">Вы можете восстановить Вашу анкету или создать новую, стоимость - 200 руб.</p>',
                    '<div class="mb20"><button class="violet_btn mb60 restore-old-account" type="submit" style="display: inline-block; width: 45%;">Восстановить старую</button><button class="violet_btn mb60 create-new-account" type="button" style="display: inline-block; width: 45%; margin-left: 20px;">Создать новую</button></div>'
                ]
            });

            // Restore an old account
            self.blockedPopup.find('.restore-old-account').on('click', function () {
                self.setActivePopup(self.confirmPopup);
            });

            // Restore an old account
            self.blockedPopup.find('.create-new-account').on('click', function () {
                self.setActivePopup(self.createNewPopup);
            });
        }

        if (!self.confirmPopup) {
            self.confirmPopup = popupRender.create({
                block: 'inactive-account-confirm-popup',
                contents: [
                    '<p class="mb20">Для того чтобы восстановить анкету необходимо подтвердить Ваш e-mail</p>',
                    '<div class="mb20"><span class="in_bl viol_radio"><span class="checkbox icon-ok"><input type="checkbox" name="agreed" id="inactive-account-agreed" class="icon-ok" /></span></span><label for="inactive-account-agreed">Я ознакомился с правилами, отправить e-mail для восстановления анкеты</label></div>',
                    '<div class="mb20"><button class="violet_btn mb20 send-restore" disabled type="button">Отправить</button></div>'
                ]
            });

            var $btn = self.confirmPopup.find('button');

            // Change button state depends on checkbox
            self.confirmPopup.find('#inactive-account-agreed').on('change', function () {
                if ($(this).prop('checked')) {
                    $btn.prop('disabled', false);
                } else {
                    $btn.prop('disabled', true);
                }
            });

            // Show next popup on click
            $btn.on('click', function () {
                mediator.publish('restore-account', self.email);

                self.setActivePopup(self.successPopup);
            });
        }

        if (!self.successPopup) {
            self.successPopup = popupRender.create({
                block: 'inactive-account-success-popup',
                contents: [
                    '<p class="mb20" style="margin: 0 auto; width: 75%;">На Ваш адрес ' + email + ' отправлено письмо для восстановления анкеты.<br/>Проверьте почту и следуйте дальнейшим шагам.</p>'
                ]
            });
        }

        if (!self.createNewPopup) {
            var contents = [
                '<p class="mb20">По <a href="/rules" class="new-popup-registration__back-link--style">правилам</a> сайта при создании новой анкеты Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, а так же все данные, покупки, контакты и диалоги будут удалены без возможности восстановления.</p>',
                '<p class="mb20">Удалить старую и создать новую анкету:.</p>',
                '<p class="mb20"><input type="text" disabled value="Создать новую анкету 200 руб." style="width: 40%; display: inline-block; margin-right: 15px;" /><a href="#" class="violet_btn create-new-account">Создать</a></p>',
                '<p class="tac"><a href="#" class="new-popup-registration__back-link--style back-step">Восстановить старую анкету</a></p>'
            ];

            self.createNewPopup = popupRender.create({
                block: 'inactive-account-create-new-popup',
                contents: contents
            });

            // Display old popup on back-step click
            self.createNewPopup.find('.back-step').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.blockedPopup);
            });

            // Create new account or redirect to the registration page
            self.createNewPopup.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                mediator.publish('create-new-account', self.form, $(this));
            });
        } else {
            self.createNewPopup.find('.second-email').html(email);
        }

        self.setActivePopup(self.blockedPopup);
    };
};

var inactiveKeptAccountController = new InactiveKeptAccountController();
// Permanent blocked account
var PermanentBlockedAccountController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.form = null;

    self.activePopup = null;
    self.loginPopup = null;
    self.registrationPopup = null;

    // Activate popup on authenticate error
    mediator.subscribe('authenticate-error', function (error, error_type, email) {
        if (error_type !== 'permanent-blocked') {
            return false;
        }

        self.init();
        self.setActivePopup(self.loginPopup);
    });

    // We should init controller on registration error event
    mediator.subscribe('registration-error-permanent-blocked', function ($form, errors, clientType) {
        self.init(errors[0]);
        self.setActivePopup(self.registrationPopup);
    });

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init registration
    self.init = function (error) {
        if (!error) {
            var loginError = 'Ваша анкета удалена по решению администрации за неоднократное нарушение <a href="/rules" class="new-popup-registration__back-link--style">правил</a> сайта';
        } else {
            var loginError = error;
        }

        // Render login popup
        if (!self.loginPopup) {
            self.loginPopup = popupRender.create({
                block: 'permanent-blocked-login-popup',
                contents: [
                    '<p class="mb40 error-notification">' + loginError + '</p>',
                    '<p class="tac" style="margin-top: 20px;"><a href="#" data-popup-close="permanent-blocked-login-popup" class="new-popup-registration__back-link--style">Закрыть</a></p>'
                ]
            });
        } else {
            self.loginPopup.find('.error-notification').html(loginError);
        }

        // Render login popup
        if (!self.registrationPopup) {
            self.registrationPopup = popupRender.create({
                block: 'permanent-blocked-registration-popup',
                contents: [
                    '<p class="mb40 error-notification">' + error + '</p>',
                    '<p class="tac" style="margin-top: 20px;"><a href="#" data-popup-close="permanent-blocked-login-popup" class="new-popup-registration__back-link--style">Закрыть</a></p>'
                ]
            });
        } else {
            self.registrationPopup.find('.error-notification').html(error);
        }
    };
};

var permanentBlockedAccountController = new PermanentBlockedAccountController();
// Restore account
var RestoreAccountController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.activePopup = null;
    self.passwordPopup = null;
    self.successPopup = null;

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init popups
    self.init = function (token) {
        if (!self.passwordPopup) {
            self.passwordPopup = popupRender.create({
                block: 'restore-account-password-popup',
                contents: [
                    '<p class="mb20">Для активации анкеты придумайте новый пароль</p>',
                    '<div class="mb20"><form action="#" class="descr parsley-validate-on-submit" id="restore-account-form"><div class="new-popup-registration__step2__form-content">',
                    '<input type="hidden" name="token" value="' + token + '" />',
                    '<p class="pos_r"><input type="password" placeholder="Пароль" name="password" id="restore-password" required data-parsley-required="true" data-parsley-required-message="Укажите пароль" data-parsley-errors-container="#restore-account-error" style="width: 60%; margin: 0 auto; margin-bottom: 12px;"/></p>',
                    '<p class="pos_r"><input type="password" placeholder="Повторите пароль" name="repeat_password" required data-parsley-required="true" data-parsley-required-message="" data-parsley-errors-container="#restore-account-error" data-parsley-equalto="#restore-password" data-parsley-equalto-message="Пароли должны совпадать" style="width: 60%; margin: 0 auto; margin-bottom: 12px;"/></p>',
                    '<p class="error_text" id="restore-account-error"></p>',
                    '<button class="violet_btn mb60" type="submit" style="display: block; width: 60%; margin: 0 auto;">Продолжить</button>',
                    '</div></form></div>'
                ]
            });

            // Validate form
            self.passwordPopup.find('form').parsley({
                'trigger': 'submit',
                errorsWrapper: '<div></div>',
                errorTemplate: '<p></p>',
                excluded: 'input[type=button], input[type=submit], input[type=reset]',
                inputs: 'input, textarea, select, input[type=hidden], :hidden'
            });

            // Send data on submit and show next popup after it
            self.passwordPopup.find('form').on('submit', function (e) {
                e.preventDefault();

                var $btn = $(this).find('[type="submit"]');

                $btn.prop('disabled', true);

                $.post('/api/activate-account', $(this).serializeArray(), 'json').success(function (response) {
                    self.setActivePopup(self.successPopup);

                    $btn.prop('disabled', false);
                }).error(function (response) {
                    $btn.prop('disabled', false);
                });
            });
        }

        if (!self.successPopup) {
            self.successPopup = popupRender.create({
                block: 'restore-account-success-popup',
                contents: [
                    '<p class="mb20">Ваша анкета восстановлена</p>',
                    '<p class="mb20"><a href="/?restored=true" class="violet_btn">Войти</a></p>'
                ]
            });
        }

        self.setActivePopup(self.passwordPopup);
    };
};

var restoreAccountController = new RestoreAccountController();
// When user clicked on 'restore account' button and he tries to restore deleted account
var RestoreDeletedAccountController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.emailInput = null;
    self.errorText = null;

    self.activePopup = null;
    self.restorePopup = null;
    self.successPopup = null;

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init popups
    self.init = function () {
        if (!self.restorePopup) {
            self.restorePopup = popupRender.create({
                block: 'deleted-account-restore-popup',
                contents: [
                    '<p class="mb20">Для того чтобы восстановить анкету необходимо заново подтвердить Ваш e-mail.</p>',
                    '<p class="mb20">Укажите Ваш e-mail и нажмите \'Отправить\':</p>',
                    '<p><input type="email" required style="width: 40%; display: inline-block; margin-right: 15px;" placeholder="Укажите e-mail" />',
                    '<a href="#" class="violet_btn send-restore-email">Отправить</a></p>',
                    '<p class="error_text hidden" style="width: 40%; margin-left: 17%; text-align: left;">Неправильный e-mail или пароль</p>'
                ]
            });

            self.emailInput = self.restorePopup.find('input:first');
            self.errorText = self.restorePopup.find('.error_text');

            // Call API method to restore an account
            self.restorePopup.find('.send-restore-email').on('click', function (e) {
                e.preventDefault();

                var email = self.emailInput.val();

                if (!email) {
                    self.emailInput.addClass('parsley-error');

                    return false;
                }

                mediator.publish('restore-account', email);
            });

            // On error display error message
            mediator.subscribe('restore-account-error', function (response) {
                if (!self.restorePopup.is(':visible')) {
                    return false;
                }

                if (response.status && response.status === 404) {
                    var errorText = 'Анкета не найдена';
                } else {
                    var errorText = 'Неизвестная ошибка, попробуйте ещё раз';
                }

                self.emailInput.addClass('parsley-error');
                self.errorText.html(errorText).show();
            });

            // On success display next popup
            mediator.subscribe('restore-account-success', function (response) {
                if (!self.restorePopup.is(':visible')) {
                    return false;
                }

                self.emailInput.removeClass('parsley-error');
                self.errorText.hide();

                self.setActivePopup(self.successPopup);
            });
        }

        if (!self.successPopup) {
            self.successPopup = popupRender.create({
                block: 'deleted-account-success-popup',
                contents: [
                    '<p class="mb20">На Ваш адрес <span class="email"></span> отправлено письмо для восстановления анкеты.<br/>Проверьте почту и следуйте дальнейшим шагам.</p>'
                ]
            });
        }


        self.setActivePopup(self.restorePopup);
    };
};

var restoreDeletedAccountController = new RestoreDeletedAccountController();
// Controller for 'secondAccount' events while the registration process
var SecondAccountByCookieOnRegistrationController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.form = null;

    self.popup = null;

    // We should init controller on error event
    mediator.subscribe('registration-error-second-account-by-cookie', function ($form, errors, clientType) {
        self.init($form, errors.email, clientType);
    });

    // Set active popup and display it
    self.showPopup = function () {
        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        self.popup.show();
    };

    // Init the controller
    self.init = function ($form, email, clientType) {
        self.form = $form;

        if (!self.popup) {
            if (clientType == 2) {
                var contents = [
                    '<p class="mb20">Ранее с Вашего устройства была создана другая анкета.  По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта создание повторных анкет запрещено.</p>',
                    '<p class="mb20">Вы можете создать новую анкету, при этом Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, а так же все данные, покупки, контакты и диалоги будут удалены без возможности восстановления.</p>',
                    '<p class="mb20"><input type="text" disabled value="Создать новую анкету 200 руб." style="width: 40%; display: inline-block; margin-right: 15px;" /><a href="#" class="violet_btn create-new-account">Создать</a></p>',
                    '<p class="mb20">Вы можете войти в свою старую анкету бесплатно, используя e-mail и пароль, указанный при регистрации.</p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style login-popup">Войти в старую анкету</a></p>'
                ];

            } else {
                var contents = [
                    '<p class="mb20">Ранее с Вашего устройства была создана другая анкета.  По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта создание повторных анкет запрещено.</p>',
                    '<p class="mb20">Вы можете создать новую анкету, при этом Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, а так же все данные, покупки, контакты и диалоги будут удалены без возможности восстановления.</p>',
                    '<p class="mb20"><a href="#" class="violet_btn create-new-account">Создать</a></p>',
                    '<p class="mb20">Вы можете войти в свою старую анкету бесплатно, используя e-mail и пароль, указанный при регистрации.</p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style login-popup">Войти в старую анкету</a></p>'
                ];
            }

            self.popup = popupRender.create({
                block: 'second-account-by-cookie-popup',
                contents: contents
            });

            // Display login popup
            self.popup.find('.login-popup').on('click', function (e) {
                e.preventDefault();

                self.popup.hide();

                $('[data-popup-block="login"]').show();
            });

            // Handle create new account
            self.popup.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                mediator.publish('create-new-account', self.form, $(this));
            });
        } else {
            self.popup.find('.second-email').html(email);
        }

        self.showPopup();
    };
};

var secondAccountByCookieOnRegistrationController = new SecondAccountByCookieOnRegistrationController();
// Controller for 'secondAccount' events while the registration process
var SecondAccountByEmailOnRegistrationController = function () {
    var self = this;

    self.overlay = $('.overlay');

    self.form = null;

    self.activePopup = null;
    self.loginPopup = null;
    self.createNewPopup = null;

    // We should init controller on error event
    mediator.subscribe('registration-error-second-account', function ($form, errors, clientType) {
        console.log('REGISTRATION ERROR WUT?');

        self.init($form, errors.email, clientType);
    });

    // Set active popup and display it
    self.setActivePopup = function (popup) {
        self.activePopup = popup;

        if (!self.overlay.is(':visible')) {
            self.overlay.stop().fadeIn(400);
        }

        $('*[data-popup-block]:visible').stop().hide();

        self.activePopup.show();
    };

    // Init the controller
    self.init = function ($form, email, clientType) {
        self.form = $form;

        if (!self.loginPopup) {
            self.loginPopup = popupRender.create({
                block: 'second-account-login-popup',
                contents: [
                    '<p class="mb20" style="width: 60%; margin: 0 auto 20px;">С почтового адреса <span class="second-email">' + email + '</span> уже была создана анкета ранее, чтобы войти в свою анкету введите пароль указанный при регистрации:</p>',
                    '<div class="mb20"><form action="#" class="descr parsley-validate-on-submit" id="another-login-form"><div class="new-popup-registration__step2__form-content">',
                    '<input type="hidden" name="email" value="' + email + '" />',
                    '<p class="pos_r"><input type="password" placeholder="Пароль" name="password" required data-parsley-required="true" style="width: 60%; margin: 0 auto; margin-bottom: 12px;"/></p>',
                    '<p class="error_text" style="display: none;">Неправильный e-mail или пароль</p>',
                    '<button class="violet_btn mb60" type="submit" style="display: block; width: 60%; margin: 0 auto;">Войти</button>',
                    '</div></form></div>',
                    '<p class="tac mb20"><a href="/forget-password" class="new-popup-registration__back-link--style">Восстановить пароль</a></p>',
                    '<p class="tac"><a href="#" class="new-popup-registration__back-link--style next-step">Создать новую анкету</a></p>'
                ]
            });

            // Create parsley validator
            self.loginPopup.find('form').parsley({
                trigger: 'submit',
                errorsWrapper: '<div></div>',
                errorTemplate: '<p></p>',
                excluded: 'input[type=button], input[type=submit], input[type=reset]',
                inputs: 'input, textarea, select, input[type=hidden], :hidden'
            });

            // Display next popup
            self.loginPopup.find('.next-step').on('click', function (e) {
                e.preventDefault();

                self.setActivePopup(self.createNewPopup);
            });

            // Publish authenticate event on submit
            self.loginPopup.find('form').on('submit', function (e) {
                e.preventDefault();

                var $form = $(this);

                mediator.publish('authenticate', $form.find('input[name="email"]').val(), $form.find('input[name="password"]').val());
            });

            // Handle authenticate error
            mediator.subscribe('authenticate-error', function (error, error_type, email) {
                // If we already left login popup
                if (!self.loginPopup.is(':visible') || error_type !== 'wrong_credentials') {
                    return false;
                }

                self.loginPopup.find('.error_text').show().html(error);
            });
        } else {
            self.loginPopup.find('.second-email').html(email);
        }

        if (!self.createNewPopup) {
            var contents = [
                '<p class="mb20">По <a href="/rules" class="new-popup-registration__back-link--style" target="_blank">правилам</a> сайта при создании новой анкеты Ваша старая анкета зарегистрированная на <span class="second-email">' + email + '</span>, а так же все данные, покупки, контакты и диалоги будут удалены без возможности восстановления.</p>',
                '<p class="mb20">Удалить старую и создать новую анкету:.</p>'
            ];

            // If kept
            if (clientType == 2) {
                contents.push('<p class="mb20"><input type="text" disabled value="Создать новую анкету 200 руб." style="width: 40%; display: inline-block; margin-right: 15px;" /><a href="#" class="violet_btn create-new-account">Создать</a></p>');
            } else {
                contents.push('<p class="mb20"><a href="#" class="violet_btn create-new-account">Создать</a></p>');
            }

            contents.push(
                '<p class="mb20">Вы можете войти в свою старую анкету бесплатно, используя e-mail и пароль, указанный при регистрации.</p>',
                '<p class="tac"><a href="#" class="new-popup-registration__back-link--style back-step">Войти в старую анкету</a></p>'
            );

            self.createNewPopup = popupRender.create({
                block: 'second-account-create-new-popup',
                contents: contents
            });

            self.createNewPopup.find('.back-step').on('click', function (e) {
                e.preventDefault();
                self.setActivePopup(self.loginPopup);
            });

            self.createNewPopup.find('.create-new-account').on('click', function (e) {
                e.preventDefault();

                mediator.publish('create-new-account', self.form, $(this));
            });
        } else {
            self.createNewPopup.find('.second-email').html(email);
        }

        self.setActivePopup(self.loginPopup);
    };
};

var secondAccountByEmailOnRegistrationController = new SecondAccountByEmailOnRegistrationController();