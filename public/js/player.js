var Player = (function(){

	var propeties = {
		potate: {
			image: 'img/SweetPotate.png',
			JUMP : 12,
			SPEED : 2,
			MAX_SPEED: 5,
			triplets: {
				/**
				 * @key   : right + up + left + down + A button + B button
				 * @value : An array of triplets (xoffset, yoffset, ticks duration)
				 */

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
				
				//Gurd
				"000001":[[45, 0,2]],
                "000101":[[135, 0,2]]
			}
		}
	};


	var Player = function( options ){
		var property = propeties[options.character];
		var sprite = options.stage.Sprite(property.image);
	    sprite.move(60, 195);
	    sprite.size(45, 60);
	    sprite.setYOffset(0);

	    var cycle = options.scene.Cycle([[0, 0, 0]]);
	    cycle.addSprite(sprite);

	    return {
	    	id : options.id,
			sprite : sprite,
			cycle : cycle,
			input : {right:0,up:0,left:0,down:0,a:0,b:0},
			xv : 0, 
			yv : 0,
			property: property
		};
	};
	

	return Player;
})()