'use strict';
enchant();

var ERASER_DENSITY = 0.5;
var FING_DENSITY = 3;
var FRICTION = 2.0;
var RESTRICTION = 2;
var SCREEN_WIDTH = 850;
var SCREEN_HEIGHT = 650;
var ERASER_WIDTH = 78;
var ERASER_HEIGHT = 39;
var OUT_WIDTH = 50;
var FING_WIDTH = 10;
var LINE_WIDTH = 1;
var VECTER_VALUE = 10;

var FRICTION_VALUE = 0.97;
var STOP_VALUE = 50;
var ROUND_FRICTION_VALUE = 0.97;

var INITX = 100;
var INITY = 100;
var LEFT_EDGE = OUT_WIDTH;
var RIGHT_EDGE = SCREEN_WIDTH - OUT_WIDTH;
var UPPER_EDGE = OUT_WIDTH;
var DOWNER_EDGE = SCREEN_HEIGHT - OUT_WIDTH;

window.onload = function(){
	var game = new Core(SCREEN_WIDTH, SCREEN_HEIGHT);
	game.preload("img/mono1.png");
	game.preload("img/mono2.png");
	game.preload("img/desktexture.png");
	game.fps = 100;
	
	game.onload = function(){
		var bg1 = new Sprite(SCREEN_WIDTH - OUT_WIDTH, SCREEN_HEIGHT - OUT_WIDTH);
		bg1.image = game.assets["img/desktexture.png"];
		game.rootScene.addChild(bg1);
		
		//アウト
		var out = Class.create(Sprite, {
			initialize: function(width, height, x, y){
				Sprite.call(this, width, height);
				this.backgroundColor = "black";
				this.x = x;
				this.y = y;
				game.rootScene.addChild(this);
			}
		});

		//指
		var Finger = Class.create(PhyBoxSprite, {
			initialize: function(){
				PhyBoxSprite.call(this, FING_WIDTH, FING_WIDTH, 
				enchant.box2d.DYNAMIC_SPRITE, FING_DENSITY, FRICTION, RESTRICTION, true);
			}
		});


		//消しゴム
		var Eraser = Class.create(PhyBoxSprite, {
			initialize: function(x, y, img){
				PhyBoxSprite.call(this, ERASER_WIDTH, ERASER_HEIGHT, 
				enchant.box2d.DYNAMIC_SPRITE, ERASER_DENSITY, FRICTION, RESTRICTION, true);
				this.x = x;
				this.y = y;
				this.image = game.assets[img];
				this.fing = new Finger();
				game.rootScene.addChild(this);
			
				//クリック
				var firstflag;
				var touchx;
				var touchy;
				var fixedx;
				var fixedy;
				var fixedangle;
				this.addEventListener('touchstart', function(e){
					fixedx = this.x;
					fixedy = this.y;
					fixedangle = this.angle;
					touchx = e.localX;
					touchy = e.localY;
					firstflag = true;
				});
				
				//ドラッグ
				this.addEventListener('touchmove', function(e){
						this.x = fixedx;
						this.y = fixedy;
						this.angle = fixedangle;
						this.fing.angularVelocity = 0;
						this.fing.vx = 0;
						this.fing.vy = 0;
						this.fing.x = this.x + e.localX;
						this.fing.y = this.y + e.localY;
						if(firstflag){
							console.log("called");
							game.rootScene.addChild(this.fing);
							firstflag = false;
						}
						surface.clear();
						context.beginPath();
						context.moveTo(this.x + touchx, this.y + touchy);
						context.lineTo(this.x + e.localX, this.y + e.localY);
						context.closePath();
						context.lineWidth = LINE_WIDTH;
						context.stroke();
				});
				
				//ドラッグ解除
				this.addEventListener('touchend', function(e){
					this.fing.opacity = 0;
					surface.clear();			
					var vecterx = (touchx - e.localX) / VECTER_VALUE;
					var vectery = (touchy - e.localY) / VECTER_VALUE; 
					var vecter = new b2Vec2(vecterx, vectery);
					this.fing.applyImpulse(vecter);
				});
				
				//衝突判定・摩擦
				this.addEventListener(Event.ENTER_FRAME, function(){
				
					//指と消しゴムの衝突
					if(this.vx * this.vx + this.vy * this.vy > 0){
						game.rootScene.removeChild(this.fing);
					}
					
					//落下
					if(this.centerX < LEFT_EDGE || this.centerX > RIGHT_EDGE || 
					   this.centerY < UPPER_EDGE || this.centerY > DOWNER_EDGE){
					   game.rootScene.removeChild(this);
					}
					
					//摩擦
					if(this.vx * this.vx + this.vy * this.vy >= STOP_VALUE){
						this.vx = this.vx *  FRICTION_VALUE;
						this.vy = this.vy *  FRICTION_VALUE;
					}
					else{
						this.vx = 0;
						this.vy = 0;
					}
					this.angularVelocity = this.angularVelocity * ROUND_FRICTION_VALUE;
				
				});
			}
		});

		var sprite = new Sprite( SCREEN_WIDTH, SCREEN_HEIGHT );
		var surface = new Surface( SCREEN_WIDTH, SCREEN_HEIGHT );
		sprite.image = surface;
		var context = surface.context;
		game.rootScene.addChild(sprite);
		var world = new PhysicsWorld( 0, 0 );
		game.rootScene.onenterframe = function(){
			world.step(game.fps);
		}
		
		var outleft = new out(OUT_WIDTH, SCREEN_HEIGHT, 0, 0);
		var outright = new out(OUT_WIDTH, SCREEN_HEIGHT, RIGHT_EDGE, 0);
		var outupper = new out(SCREEN_WIDTH, OUT_WIDTH, 0, 0);
		var outdowner = new out(SCREEN_WIDTH, OUT_WIDTH, 0, DOWNER_EDGE);
		
	 	var eraser1 = new Eraser(RIGHT_EDGE - ERASER_WIDTH - INITX, DOWNER_EDGE - ERASER_HEIGHT - INITY, "img/mono1.png");
	 	var eraser2 = new Eraser(LEFT_EDGE + INITX, UPPER_EDGE + INITY, "img/mono2.png");
		
    }
    game.start();
    window.scrollTo(0, 0);
}