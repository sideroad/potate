

(function($){
	
	$.fn.joypad = function( settings ){
		
		
		return this.each(function(){
			var elem = $(this),
				ck = {},
				event = {};
			
			//cross-key
			(function(){
                var keyElem = elem.find("#ck"),
                    w = keyElem.width(),
                    h = keyElem.height(),
                   pos = keyElem.position() ||{},
                   top = pos.top,
                   left = pos.left,
                   centerX = left + (w/2),
                   centerY = top + (h/2),
				   id = keyElem.attr("id");

                ck = {
                    width : w,
                    height : h,
                    top : top,
                    left : left,
                    bottom: top + h,
                    right: left+w,
                    centerX : centerX,
                    centerY : centerY
                };
				event[id] = 0;
				
				keyElem.bind("touchstart touchmove", function( e ){
                    var t = e.originalEvent.touches[0],
	                    pageX = t.pageX,
	                    pageY = t.pageY,
						x,
						y,
						angle,
						range;
					
					x = Math.round( ( pageX - ck.centerX ) / ( ck.width /2 ) * 100 );
                    y = Math.round( ( pageY - ck.centerY ) / ( ck.height / 2 ) * -100 );
            
                    angle = (Math.atan2( y, x )/Math.PI)*180;
                    angle = Math.floor( ( ( ( angle < 0 ) ? angle + 360 : angle ) + 22.5 ) / 45  );
                    
                    range = Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) );
                    range = Math.round( ( range > 100) ? 100 : range );
                    
                    event[id] = {
                        ang : ( angle == 8 ) ? 0 : angle ,
                        ran : range
                    };
                    elem.trigger("joypad", event );
					
				});
				
				keyElem.bind("touchend touchcancel", function(e){
					event[id] = 0;
                    elem.trigger("joypad", event );
				});
				
				
				
			})();
			
			//buttons
			 elem.find(".button").each(function(){
			 	var id = this.id;
				event[id] = 0;
				$(this).bind("touchstart", function( e ){
					event[id] = 1;
                    elem.trigger("joypad", event );
				}).bind("touchmove", function( e ){
                    event[id] = 1;
                    elem.trigger("joypad", event );
                });
				
				$(this).bind("touchend touchcancel", function(e){
					event[id] = 0;
                    elem.trigger("joypad", event );
 				});
			});
			
			
            $(document).bind("touchstart touchmove touchend", function( e ){
                e.preventDefault();
			});
			
			$(window).bind("keyup keypress", function(e){
				var code = e.keyCode,
				    keyMap = {
						100 : 0,
						119 : 2,
						97 : 4,
						122 : 6
					};
					
				
				elem.trigger("joypad", {
					ang : keyMap[ code ],
					a : (code == 102 ? 1: 0 ),
					b : (code == 103 ? 1: 0 )
				});
				
			});
			
			
			
		});
	};
	
})(jQuery);
