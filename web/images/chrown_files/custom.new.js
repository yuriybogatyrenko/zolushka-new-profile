$(document).ready(function(){
	
	$('.calls_toggle_settings .slider_calls').click(function(e){
		var bl = $(this).closest('.calls_toggle_settings');
		if(bl.hasClass('on')) {
			bl.removeClass('on').addClass('off');
			bl.find('.calls_slider_text').text('Звонки отключены');
		} else {
			bl.removeClass('off').addClass('on');
			bl.find('.calls_slider_text').text('Зконки подключены');
		}
		e.preventDefault();
	});

	// Open edit chats
	$('body').on('click', '.open_edit_chats', function () {
		$('body .dd_menu_chats_action').show();
	});

	$('.edit_params_msg_folder .main_red_btn').click(function(e){
		$('.add_folder_btn_wrap').addClass('active_btn');
		$('.add_folder_btn_wrap .add_folder_form').hide();
		$('.edit_params_msg_folder > .item').hide();
		$('.messages_folders .has_del_btn').removeClass('active_btn');
		$('.add_folder_btn_wrap').removeClass('active_btn');
		$('.open_edit_chats').show();
		$('.sidebar_msg_contacts').removeClass('editing_process');
		e.preventDefault();
	});
	
	$('.add_folder_btn_wrap .add_folder_btn').click(function(e){
		$(this).closest('.add_folder_btn_wrap').removeClass('active_btn');
		$(this).siblings('.add_folder_form').show();
		
		e.preventDefault();
	});
	
	/*$('.add_folder_form').submit(function(e){
		var folder_name = $(this).find('input[type=text]').val();
		if(folder_name != '') {
			$('.add_folder_btn_wrap').before('\
							<li class="dib vam has_del_btn active_btn drop_hover clickable allways_hover">\
								<a class="dib vam" href="#">'+folder_name+'</a>\
								<span class="delete_folder dib vam trans icon-cancel drop_btn"></span>\
								<div class="drop_block tac">\
									<div class="drop_descr">\
										<p>Удалить папку и '+folder_name+'?</p>\
									</div>\
									<div class="main_red_btn drop_close dib cursor-pointer">Отмена</div>\
									<p>\
										<span class="add_later delete cursor-pointer">Удалить</span>\
									</p>\
								</div>\
							</li>\
			');
		}
		
		$(this).find('input[type=text]').val('');
		
		$(this).hide().closest('.add_folder_btn_wrap').addClass('active_btn');
		
		e.preventDefault();
	});*/
	
	$(document).on('click', '.drop_hover .delete', function(e){
		$(this).closest('.drop_hover').remove();
		
		e.preventDefault();
	});
	
	$('.prof_link').hover(function(){
		$('.drop_menu').slideUp(200);
	});
});


function get_crop_size() {
	$('#avatar-resize-image').one('load',function(){
		var w = $('#avatar-resize-image').width();
		var h = $('#avatar-resize-image').height();
		var s = 0;
		
		if(w >= h) {
			s = h;
			l = w/2-h/2;
			$('.overlay_crop').css({top:0, left:l});
		} else {
			s = w;
            //FRONT-1211
			//t = h/2-w/2;
            t = 0;
			$('.overlay_crop').css({top:t, left:0});
		}
		
		$('.overlay_crop').css({width:s, height:s});
	})
}