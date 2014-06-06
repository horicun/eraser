'use strict';
enchant();


var FING_WIDTH = 10;
var FING_DENSITY = 3;
var ERASER_WIDTH = 78;
var ERASER_HEIGHT = 39;
var ERASER_DENSITY = 0.25;
var RULER_WIDTH = 266;
var RULER_HEIGHT = 43;
var RULER_DENSITY = 0.1;
var PENCASE_WIDTH = 280;
var PENCASE_HEIGHT = 109;
var PENCASE_DENSITY = 10;
var NOTEBOOK_WIDTH = 230;
var NOTEBOOK_HEIGHT = 166;
var NOTEBOOK_DENSITY = 10;

var FRICTION = 2.0;
var RESTRICTION = 0.5;

var SCREEN_WIDTH = 850;
var SCREEN_HEIGHT = 650;
var OUT_WIDTH = 50;
var LINE_WIDTH = 1;
var VECTER_VALUE = 10;
var FRICTION_VALUE = 0.97;
var STOP_VALUE = 50;
var ROUND_FRICTION_VALUE = 0.97;
var REGULAR_ROUND_FRICTION_VALUE = 0.98;

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
	game.preload("img/ruler.png");
	game.preload("img/pencase.png");
	game.preload("img/notebook.png");
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
				this.opacity = 0;
			}
		});
		
		//定規
		var Ruler = Class.create(PhyBoxSprite, {
			initialize: function(){
				PhyBoxSprite.call(this, RULER_WIDTH, RULER_HEIGHT, 
				enchant.box2d.DYNAMIC_SPRITE, RULER_DENSITY, FRICTION, RESTRICTION, true);
				this.image = game.assets["img/ruler.png"];
				this.centerX = SCREEN_WIDTH / 2;
				this.centerY = SCREEN_HEIGHT / 2;
				game.rootScene.addChild(this);
				
				this.addEventListener(Event.ENTER_FRAME, function(){
					this.centerX = SCREEN_WIDTH / 2;
					this.centerY = SCREEN_HEIGHT / 2;
					this.angularVelocity = this.angularVelocity * REGULAR_ROUND_FRICTION_VALUE;
				});
			}
			
			
		});
		
		//固定物質
		var Obj = Class.create(PhyBoxSprite, {
			initialize: function(width, height, x, y, d, img){
				PhyBoxSprite.call(this, width, height, 
				enchant.box2d.DYNAMIC_SPRITE, d, FRICTION, RESTRICTION, true);
				this.image = game.assets[img];
				game.rootScene.addChild(this);
				this.addEventListener(Event.ENTER_FRAME, function(){
					this.x = x;
					this.y = y;
					this.angle = 0;
				});
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
				this.can = false;
				this.movestart = false;
				game.rootScene.addChild(this);
			
					//クリック
					var firstflag;
					var touchx;
					var touchy;
					var fixedx;
					var fixedy;
					var fixedangle;
					this.addEventListener('touchstart', function(e){
						if(this.can){
							fixedx = this.x;
							fixedy = this.y;
							fixedangle = this.angle;
							touchx = e.localX;
							touchy = e.localY;
							firstflag = true;
							this.release = false;
						}
					});
					
					//ドラッグ
					this.addEventListener('touchmove', function(e){
						if(this.can){
							this.x = fixedx;
							this.y = fixedy;
							this.angle = fixedangle;
							this.fing.angularVelocity = 0;
							this.fing.vx = 0;
							this.fing.vy = 0;
							this.fing.x = this.x + e.localX;
							this.fing.y = this.y + e.localY;
							if(firstflag){
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
						}
					});
					
					//ドラッグ解除
					this.addEventListener('touchend', function(e){
							this.release = true;
							surface.clear();			
							var vecterx = (touchx - e.localX) / VECTER_VALUE;
							var vectery = (touchy - e.localY) / VECTER_VALUE; 
							var vecter = new b2Vec2(vecterx, vectery);
							this.fing.applyImpulse(vecter);
					});
				
				//衝突判定・摩擦
				this.addEventListener(Event.ENTER_FRAME, function(){
				
					//指と消しゴムの衝突
					if(this.vx * this.vx + this.vy * this.vy > 0 && this.release){
						game.rootScene.removeChild(this.fing);
						this.movestart = true;
						this.can = false;
						this.release = false;
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
	 	
	 	var ruler = new Ruler();
	 	var pencace = new Obj(PENCASE_WIDTH, PENCASE_HEIGHT, OUT_WIDTH, DOWNER_EDGE - PENCASE_HEIGHT, PENCASE_DENSITY, "img/pencase.png");
	 	var notebook = new Obj(NOTEBOOK_WIDTH, NOTEBOOK_HEIGHT, RIGHT_EDGE - NOTEBOOK_WIDTH, OUT_WIDTH, NOTEBOOK_DENSITY, "img/notebook.png");
	 	
	 	//ターン制
	 	var turn = 1;
	 	var fixedx;
		var fixedy;
		var eraser_fixedangle;
		var ruler_fixedangle;
		var initflag = true;
		game.addEventListener(Event.ENTER_FRAME, function(){
			console.log("turn", turn, "initflag", initflag)
		 	if(turn == 1){
		 		if(initflag){
		 			eraser1.can = true;
		 			eraser1.movestart = false;
		 			initflag = false;
		 			fixedx = eraser2.x;
					fixedy = eraser2.y;
					eraser_fixedangle = eraser2.angle;
					ruler_fixedangle = ruler.angle;
		 		}
				if(!eraser1.movestart){
					eraser2.x = fixedx;
					eraser2.y = fixedy;
					eraser2.angle = eraser_fixedangle;
					ruler.angle = ruler_fixedangle;
				}
				if(eraser1.can == false && eraser1.vx ==  0 && eraser1.vy == 0){
					turn = 2;
					initflag = true;
					eraser1.movestart = true;
				}
		 	}
		 	if(turn == 2){
		 		if(initflag){
		 			eraser2.can = true;
		 			eraser2.movestart = false;
		 			initflag = false;
		 			fixedx = eraser1.x;
					fixedy = eraser1.y;
					eraser_fixedangle = eraser1.angle;
					ruler_fixedangle = ruler.angle;
		 		}
				if(!eraser2.movestart){
					eraser1.x = fixedx;
					eraser1.y = fixedy;
					eraser1.angle = eraser_fixedangle;
					ruler.angle = ruler_fixedangle;
				}
				if(eraser2.can == false && eraser2.vx ==  0 && eraser2.vy == 0){
					turn = 1;
					initflag = true;
					eraser2.movestart = true;
				}
		 	}
		 });
	 	
		
    }
    game.start();
    window.scrollTo(0, 0);
}