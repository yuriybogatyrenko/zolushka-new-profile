// Build message template for socket
$.buildMessage = function (id, name, message, time, avatar, type, images, className) {
    if (type == 1) {
        var href = '/profile/he/' + id;
    } else {
        var href = '/profile/she/' + id;
    }

    var imagesTemplate = '';

    if (images && images.length) {
        imagesTemplate += '<div class="message-images">';

        for (var i = 0; i < images.length; i++) {
            imagesTemplate += '<a href="' + images[i].full + '" class="message-image"><img src="' + images[i].thumb + '" /></a>';
        }
        imagesTemplate += '</div>';
    }

    var $template = $([
        "<li class='message_item " + className + "'>",
        "<div class='avatar'>",
        "<a href='" + href + "' target='_blank'><img src='" + avatar + "' alt=''  onerror=\"this.src='/images/default-user-avatar.png'\"/></a>",
        "</div>",
        "<div class='message_block'>",
        "<p class='person_name ffr'>" + name + "</p>",
        "<div class='message_text_wrap pos_r'>",
        "<div class='message_text ffr'>",
        "<p>" + message + "</p>" + imagesTemplate,
        "</div>",
        "<div class='message_time ffr'>" + time + "</div>",
        "<span class='corner'></span>",
        "</div></div></li>"
    ].join("\n"));

    return $template;
}

// Build contacts from socket when new dialog
$.buildContact = function (id, name, avatar, lastMessage, unreadedMessages, online) {
    liClass = '';

    if (unreadedMessages === 0 || parseInt(unreadedMessages, 10) === 0) {
        liClass += 'contact-readed';
    }

    if (online) {
        liClass += 'contact-online';
    }

    if (online) {
        onlineClass = 'online';
    } else {
        onlineClass = 'offline';
    }

    var $template = $([
        '<li class="' + liClass + '" data-id="' + id + '">',
        '<label>',
        '<div class="in_bl photo vam">',
        '<img src="' + avatar + '" alt=""  onerror="this.src=\'/images/default-user-avatar.png\'"  />',
        '<div class="message_num">' + unreadedMessages + '</div>',
        '<div class="hidden_checkbox"><span class="checkbox icon-ok">',
        '<input type="checkbox" class="icon-ok"  value="' + id + '"/>',
        '</span></div>',
        '</div>',
        '<div class="name_wrap dib vam">',
        '<div class="top_line">',
        '<span class="name ffr in_bl vam">' + name + '</span>',
        '<span class="status_round ' + onlineClass + ' in_bl"></span>',
        '</div>',
        '<p class="last_message trans">' + lastMessage + '</p>',
        '</div>',
        '<div class="favorites icon-star-empty dib vam"></div>',
        '</label>',
        '</li>'
    ].join("\n"));

    return $template;
}

$.buildFolder = function (name) {
    var $template = $([
        '<li class="dib vam has_del_btn active_btn drop_hover clickable allways_hover">',
        '<a class="dib vam" href="#">' + name + '</a>',
        '<span class="delete_folder dib vam trans icon-cancel drop_btn"></span>',
        '<div class="drop_block tac">',
        '<div class="drop_descr">',
        '<p>Удалить папку ' + name + '?</p>',
        '</div>',
        '<div class="main_red_btn drop_close dib cursor-pointer">Отмена</div>',
        '<p>',
        '<span class="add_later delete cursor-pointer">Удалить</span>',
        '</p>',
        '</div>',
        '</li>'
    ].join("\n"));

    return $template;
}