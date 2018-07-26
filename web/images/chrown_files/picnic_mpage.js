(function($) {
	$.fn.picnic = function(e,t,n) {
		var opt, bl, wrap, next_btn, prev_btn;
		
		opt = {
			responsive: true,
			play: false,
			playOpt: {
				interval: 3000,
				pauseOnHover: true,
				restartDelay: 2500
			},
			navigation:true,
			responsiveOpt: {
				phoneWidth: 768,
				padWidth: 992,
				padNum: 2,
				phoneNum: 1,
				desctopNum: 4
			},
			animationSpeed: 1000,
			// direction: 'vertical'
		}
		
		bl = this;
		
		if(opt.direction == 'vertical') {
			bl.children().addClass('picnic-item');
			bl.wrapInner('<div class="picnic-wrapper" style="max-width:100%; overflow:auto;"><div class="picnic-items clearfix" style="position:relative; overflow:hidden;">');
		} else {
			bl.children().addClass('picnic-item').css({'float':'left'});
			bl.wrapInner('<div class="picnic-wrapper" style="max-width:100%; overflow:hidden;"><div class="picnic-items clearfix" style="position:relative; overflow:hidden; width:20000px;">');
		}
		wrap = bl.find('.picnic_wrapper');
		bl.append('<div class="picnic-navigation"></div>');
		bl.find('.picnic-navigation').append('<span class="nav-prev icon-angle-left"></span><span class="nav-next icon-angle-right"></span>');
		
		next_btn = bl.find('.nav-next');
		prev_btn = bl.find('.nav-prev');
		
		next_btn.bind('click', function(){
			if (bl.find('.picnic-item').hasClass("active")){
				var active_bl = bl.find('.picnic-item.active');
			}
			if(!bl.find('.picnic-items').hasClass('animation_on')) {
				bl.find('.picnic-items').addClass('animation_on');
				
				
				if(opt.direction == 'vertical') {
					var it_h = bl.find('.picnic-item:eq(0)').outerHeight() + parseInt(bl.find('.picnic-item:eq(0)').css('margin-top')) + parseInt(bl.find('.picnic-item:eq(0)').css('margin-bottom'));
					bl.find(".picnic-items").stop().animate({top: "-"+ it_h +"px"}, opt.animationSpeed, function(){
						bl.find(".picnic-items .picnic-item").eq(0).clone().appendTo(bl.find(".picnic-items")); 
						bl.find(".picnic-items .picnic-item").eq(0).remove(); 
						bl.find(".picnic-items").css({"top":"0px"}).removeClass('animation_on'); 
					});
				} else {
					var it_w = bl.find('.picnic-item:eq(0)').outerWidth() + parseInt(bl.find('.picnic-item:eq(0)').css('margin-right')) + parseInt(bl.find('.picnic-item:eq(0)').css('margin-left'));
					bl.find(".picnic-items").stop().animate({left: "-"+ it_w +"px"}, opt.animationSpeed, function(){
						bl.find(".picnic-items .picnic-item").eq(0).clone().appendTo(bl.find(".picnic-items")); 
						bl.find(".picnic-items .picnic-item").eq(0).remove(); 
						bl.find(".picnic-items").css({"left":"0px"}).removeClass('animation_on'); 
					});
				}
			}
			bl.find('.picnic-item').removeClass("active");
			active_bl.next().addClass("active");
			var need_h = bl.find('.picnic-item.active').outerHeight();
			bl.find('.picnic-wrapper').animate({height:need_h},400);
		});
		
		prev_btn.bind('click', function(){
			if (bl.find('.picnic-item').hasClass("active")){
				var active_bl = bl.find('.picnic-item.active');
			}
			if(!bl.find('.picnic-items').hasClass('animation_on')) {
				bl.find('.picnic-items').addClass('animation_on');
				
				if(opt.direction == 'vertical') {
					var it_h = bl.find('.picnic-item:eq(0)').outerHeight() + parseInt(bl.find('.picnic-item:eq(0)').css('margin-top')) + parseInt(bl.find('.picnic-item:eq(0)').css('margin-bottom'));
					
					bl.find('.picnic-item').eq(-1).clone().prependTo(bl.find('.picnic-items'));
					bl.find('.picnic-items').css({'top':'-'+it_h+'px'});
					bl.find('.picnic-item').eq(-1).remove();
					bl.find(".picnic-items").stop().animate({top: "0px"}, opt.animationSpeed, function(){
						bl.find('.picnic-items').removeClass('animation_on');
					});
				} else {
					var it_w = bl.find('.picnic-item:eq(0)').outerWidth() + parseInt(bl.find('.picnic-item:eq(0)').css('margin-right')) + parseInt(bl.find('.picnic-item:eq(0)').css('margin-left'));
					
					bl.find('.picnic-item').eq(-1).clone().prependTo(bl.find('.picnic-items'));
					bl.find('.picnic-items').css({'left':'-'+it_w+'px'});
					bl.find('.picnic-item').eq(-1).remove();
					bl.find(".picnic-items").stop().animate({left: "0px"}, opt.animationSpeed, function(){
						bl.find('.picnic-items').removeClass('animation_on');
					});
				}
			}
			bl.find('.picnic-item').removeClass("active");
			active_bl.prev().addClass("active");
			var need_h = bl.find('.picnic-item.active').outerHeight();
			bl.find('.picnic-wrapper').animate({height:need_h},400);
		});
		
		bl.hover(function(){
			$(this).addClass('hover')
		}, function(){
			$(this).removeClass('hover')
		});
		
		if(opt.play == true) {
			setInterval(function(){
				if(opt.playOpt.pauseOnHover == true) {
					if(!bl.hasClass('hover')) {
						next_btn.click();
					}
				} else {
					next_btn.click();
				}
			}, opt.playOpt.interval);
		}
		
		// $(window).resize();
		var TimeOut;
		if(opt.direction != 'vertical') {
			$(window).bind('resize', function(){
				clearTimeout(TimeOut);
				TimeOut = setTimeout(function(){
					var type = "data-desctop-num", 
						ww = $(window).width(); 	 	
					if (ww > opt.responsiveOpt.padWidth){
							type = "data-desctop-num";
					} 	else if  ( ww >= opt.responsiveOpt.phoneWidth && ww <= opt.responsiveOpt.padWidth) {
							type = "data-pad-num";
					} 	else if (ww < opt.responsiveOpt.phoneWidth) {
							type = "data-phone-num";
					}
					
					bl.find(".picnic-wrapper").each(function(){
						if (bl.is(':visible')) {
							var width_parent = bl.outerWidth(),
								mr = parseInt(bl.find('.picnic-item:eq(0)').css('margin-right')),
								pad_num = bl.attr(type);
								
								//alert(pad_num)
								if (typeof pad_num !== typeof undefined && pad_num !== false) {
									pad_num = pad_num;
								} else {
									if(type == 'data-desctop-num') {
										pad_num = opt.responsiveOpt.desctopNum;
									} else if(type == 'data-pad-num') {
										pad_num = opt.responsiveOpt.padNum;
									} else if(type == 'data-phone-num') {
										pad_num = opt.responsiveOpt.phoneNum;
									}
								}
								
								
								
							var	pad_width = width_parent/pad_num,
								margin_num = pad_num - 1,
								w_minus = (mr*margin_num)/pad_num,
								pad_width = pad_width - w_minus;

							//alert(pad_width)
								
							bl.find(" .picnic-item ").css("width" , pad_width+'px' );
						}
					});
					var need_h = bl.find('.picnic-item.active').outerHeight();
					bl.find('.picnic-wrapper').animate({height:need_h},400);
				}, 200);
			});
			

			$(function(){
				var type = "data-desctop-num", 
					ww = $(window).width(); 	 	
				if (ww > opt.responsiveOpt.padWidth){
						type = "data-desctop-num";
				} 	else if  ( ww >= opt.responsiveOpt.phoneWidth && ww <= opt.responsiveOpt.padWidth) {
						type = "data-pad-num";
				} 	else if (ww < opt.responsiveOpt.phoneWidth) {
						type = "data-phone-num";
				}
				
				bl.find(".picnic-wrapper").each(function(){
					if (bl.is(':visible')) {
						var width_parent = bl.outerWidth(),
							mr = parseInt(bl.find('.picnic-item:eq(0)').css('margin-right')),
							pad_num = bl.attr(type);
							
							//alert(pad_num)
							if (typeof pad_num !== typeof undefined && pad_num !== false) {
								pad_num = pad_num;
							} else {
								if(type == 'data-desctop-num') {
									pad_num = opt.responsiveOpt.desctopNum;
								} else if(type == 'data-pad-num') {
									pad_num = opt.responsiveOpt.padNum;
								} else if(type == 'data-phone-num') {
									pad_num = opt.responsiveOpt.phoneNum;
								}
							}
							
							
							
						var	pad_width = width_parent/pad_num,
							margin_num = pad_num - 1,
							w_minus = (mr*margin_num)/pad_num,
							pad_width = pad_width - w_minus;

						//alert(pad_width)
							
						bl.find(" .picnic-item ").css("width" , pad_width+'px' );
					}
				});
			})
		}
		
		var txs, txe, tys, tye;
		
		document.addEventListener('touchend', function(e) {
			var touch = e.touches[0];
			var target = e.target;
			//alert(touch.pageX + " - " + touch.pageY);
			if($(target).closest(bl).length > 0) {
				//alert(touch.data.touchstartx)
				var delX = txs - txe;
				var delY = tys - tye;
				var deltaX = parseInt(Math.abs(delX));
				var deltaY = parseInt(Math.abs(delY));
				
				if(deltaX > deltaY && deltaX > 80) {
					if(delX > 0) {
						next_btn.click();
					} else {
						prev_btn.click();
					}
				}
			}
		}, false);
		
		document.addEventListener('touchmove', function(e) {
			var touch = e.touches[0];
			var target = e.target;
			//alert(touch.pageX + " - " + touch.pageY);
			if($(target).closest(bl).length > 0) {
				//alert(touch.data.touchstartx)
				txe = touch.pageX;
				tye = touch.pageY;
				
				//alert(ts +" || "+ tm)
			}
		}, false);
		
		document.addEventListener('touchstart', function(e) {
			var touch = e.touches[0];
			var target = e.target;
			//alert(touch.pageX + " - " + touch.pageY);
			if($(target).closest(bl).length > 0) {
				//alert(touch.data.touchstartx)
				
				txs = touch.pageX
				tys = touch.pageY
				
			}
		}, false);
	}
})(jQuery)