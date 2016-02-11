$(function() {
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
        characters = {},
        ids = [],
        triplets = {
                //Nautral
                "000000":[[0,0,2]],
                
                //Cursurs
                "100000":[
                    [0, 60,2],
                    [45, 60,2],
                    [90, 60,2],
                    [135, 60,2],
                    [45, 60,2]
                ],
                "110000":[[0, 60,2]],
                "010000":[[0, 60,2]],
                "011000":[[0, 60,2]],
                "001000":[
                    [0, 60,2],
                    [45, 60,2],
                    [90, 60,2],
                    [135, 60,2],
                    [45, 60,2]
                ],
                "001100":[[90, 0,2]],
                "000100":[[90, 0,2]],
                "100100":[[90, 0,2]],
                
                //Punch
                "000010":[[0,120,2]],
                
                //Gurd
                "000001":[[45, 0,2]],
                "000101":[[135, 0,2]]
        },
        adjust = {
            "000010":3
        };
    
    
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
                $("#qrcode").qrcode(data.stage);
            },
            attend : function( data ){
                var player = stage.Sprite('img/SweetPotate.png');
                player.move(60, 195);
                player.size(45, 60);
                player.setYOffset(0);
            
                var cycle = scene.Cycle([[0, 0, 0]]);
                cycle.addSprite(player);
                
                var id = data.player;
                ids.push( id );
                characters[ id ] = {
                    player : player,
                    cycle : cycle,
                    input : {right:0,up:0,left:0,down:0,a:0,b:0},
                    xv : 0, 
                    yv : 0
                };
                console.log( characters );

                $("#overlay").remove();
            },
            jp : function( data ){
                var input = keyMap[data.ang] || {right:0,up:0,left:0,down:0};
                
                input.a = data.a;
                input.b = data.b;   
                characters[data.id].input = input;
            }
        };
        
        s.onopen =  function(  ){
            console.log("connected!");
            s.onmessage = function( msg ){
                var data = JSON.parse(msg.data);
                act[data.act](data);
                console.log(data);
            };
            
            s.send(JSON.stringify({act:"init"}));
            
        };
        
        s.onclose = function(){
            console.log(arguments);
        }
    })();
    
    var game_height = 600;
    var game_width = 1000;
    var scene = sjs.Scene({w:game_width, h:game_height, autoPause : false });

    var plateforms = [];
    
    var stage = scene.Layer("stage", {
        useCanvas : true
    });

    var bottom = stage.Sprite('img/ground.png');
    bottom.move(0, game_height - 20);
    bottom.setW(game_width);
    plateforms.push(bottom);

    var floating = stage.Sprite('img/ground.png');
    floating.move(150, 450);
    floating.setW(400);
    plateforms.push(floating);
    
    function render( character ){
        var player = character.player;
        var input = character.input;
        var cycle = character.cycle;
        var xv = character.xv;
        var yv = character.yv;
        var x = character.x;
        var y = character.y;
        var isLeft = character.isLeft;
        
        var contactX = player.x + player.w/2;
        var contactY = player.y + player.h;
        var has_contact = y > window.innerHeight;
        if(!has_contact) {
            for(var i=0; i < plateforms.length; i++) {
                var p = plateforms[i];
                has_contact = p.isPointIn(contactX, contactY);
                if(has_contact) {
                    player.setX(player.x + p.xv);
                    player.setY(p.y - player.h);
                    yv = 0;
                    break;
                }
            }
        }


        if(input.up) {
            if(has_contact) {
                yv = -12;
            } else {
                yv -= 0.1;
            }
        } else if( input.down ){
            yv += 0.5;
        }
        yv = yv + 0.4;


        if(input.left) {
            xv = -10;
            player.scale(1, 1);
            isLeft = true;
        } else if(input.right) {
            xv = 10;
            player.scale(-1, 1);
            isLeft = false;
        } else {
            xv = 0;
        }
        character.isLeft = isLeft;
        
        

        if(yv>=0 && has_contact){
            yv = 0; 
        }

        player.move(xv, yv);
        if(player.x < 0) {
            player.setX(0);
        }
        if(player.x > game_width - player.w){
            player.setX(game_width - player.w);
        }
        
        character.xv = xv;
        character.yv = yv;
        
        player.update();
        
        var key = ""+input.right+input.up+input.left+input.down+input.a+input.b;
        if(character.before == key ) {
            cycle.next();
        } else {
            if(adjust[key]) {
                player.move((isLeft ? -1 : 1 ) * adjust[key], yv);
            }
            cycle = scene.Cycle(triplets[key]||[[0,0,2]]);
            character.cycle = cycle;
            cycle.addSprite(player);
        }
        
        character.before = key;
        
    }

    function paint() {
        var i, id;
        
        for(i=0;i<ids.length;i++){
            id = ids[i];
            render( characters[ id ] );
        }

        bottom.update();
        floating.update();
    };

    var ticker = scene.Ticker( paint, {useAnimationFrame:true});
    ticker.run();
    
    

});
