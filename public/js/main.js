if(UA.isMobile()){
	location.href="controller.html";
}

window.onload = function() {
	var keyMap = {
	        0: { right: 1, up:0, left: 0, down: 0 },
	        1: { right: 1, up:1, left: 0, down: 0 },
	        2: { right: 0, up:1, left: 0, down: 0 },
	        3: { right: 0, up:1, left: 1, down: 0 },
	        4: { right: 0, up:0, left: 1, down: 0 },
	        5: { right: 0, up:0, left: 1, down: 1 },
	        6: { right: 0, up:0, left: 0, down: 1 },
	        7: { right: 1, up:0, left: 0, down: 1 }
		},
		players = {};
	
	
    (function(){
		var ws = window.WebSocket || window.MozWebsocket;
		if(!ws) {
			console.log("WebSocket is not defined");
			return;
		}
        s = new ws("ws://"+location.host);
		
		var act = {
			init : function( data ){
				$("#stageId").text(data.stage);
				$("#overlay").css({
                    width : $(window).width(),
                    height : $(window).height(),
					display : "block"
				});
				$("#qrcode").qrcode(location.href+"controller.html#"+data.stage);
			},
			attend : function( data ){
				var player = new Player({
					id: data.player,
					character: 'potate',
					stage: stage,
					scene: scene
				});

				player.sprite.setX(game_width / 2);
				player.sprite.setY(game_height / 2);
				
				players[ player.id ] = player;
                $("#overlay").remove();
			},
			//joypad
			jp : function( data ){
                var input = keyMap[data.ang] || {right:0,up:0,left:0,down:0};
				
				input.a = data.a;
				input.b = data.b;	
                players[data.id].input = input;
			}
		};
		
	    s.onopen =  function(  ){
            console.log("connected!");
			s.onmessage = function( msg ){
                var data = JSON.parse(msg.data);
				act[data.act](data);
	        };
			
			s.send(JSON.stringify({act:"init"}));
			
        };
		
        s.onclose = function(){
            console.log(arguments);
        }
	})();
	
    var game_height = window.innerHeight;
    var game_width = window.innerWidth;
    var scene = sjs.Scene({w:game_width, h:game_height, autoPause : false });

    var plates = [];
	
	var stage = scene.Layer("stage", {
		useCanvas : true
		// useWebGL : true
	});

    var ground = stage.Sprite('img/ground.png');
    ground.move( game_width / 6 , game_height - 40);
    ground.setW( game_width - ( game_width / 3 ) );
    plates.push(ground);

    var floating;
    floating = stage.Sprite('img/ground.png');
    floating.move( game_width / 4, game_height - 250);
    floating.setW( game_width - ( game_width / 2));
    plates.push(floating);
	
	function render( player ){
        var sprite = player.sprite;
        var input = player.input;
        var cycle = player.cycle;
        var xv = player.xv;
		var yv = player.yv;
		var property = player.property;
		
        var contactX = sprite.x + sprite.w/2;
        var contactY = sprite.y + sprite.h;
        var has_contact;
        var plate;
        var i;
        var platesLength = plates.length;

 
        // Plate collision
        for(i=0; i < platesLength; i++) {
            plate = plates[i];
            has_contact = plate.isPointIn(contactX, contactY);
            if(has_contact) {
                sprite.setY(plate.y - sprite.h);
				yv = 0;
                break;
            }
        }


        // Jump 
        if(input.up) {
            if(has_contact) {
                yv = -property.JUMP;
			} else {
				yv -= property.JUMP/60;
			}
        } else if( input.down ){
            yv += property.JUMP/60;
        }
        yv = yv + property.JUMP/25;
        if(yv>=0 && has_contact){
            yv = 0;	
		}

        // Horizontal process
        if(input.left) {
            xv += -property.SPEED;
            if (-xv > property.MAX_SPEED ){
            	xv = -property.MAX_SPEED;
            }
            sprite.scale(1, 1);
        } else if(input.right) {
            xv += property.SPEED;
            if (xv > property.MAX_SPEED ){
            	xv = property.MAX_SPEED;
            }
            sprite.scale(-1, 1);
        } else {
            xv = xv / 2;
		}


        sprite.move(xv, yv);
		
        player.xv = xv;
        player.yv = yv;
		
        sprite.update();
		
		var key = ""+input.right+input.up+input.left+input.down+input.a+input.b;
		if(player.before == key ) {
            cycle.next();
		} else {
			cycle = scene.Cycle(property.triplets[key] || property.triplets["000000"]);
            player.cycle = cycle;
            cycle.addSprite(sprite);
		}
		
		player.before = key;
		
	}

    function paint() {
        var i, id, plate, platesLength = plates.length;
		
		for(id in players){
			render( players[id]);
		}

        for(var i=0; i < platesLength; i++) {
            plate = plates[i];
            plate.update();
        }
    };

    var ticker = scene.Ticker( paint, {useAnimationFrame:true});
    ticker.run();
	
	

};