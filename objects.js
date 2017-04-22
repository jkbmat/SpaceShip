// objekty

var bg_obj = object.extend({
	constructor: function()
	{
		this.base('Background');
				
		this.frames = {
			//'default': {'type': 'rect', 'color': '000000', 'width': _plocha_px_width, 'height': _plocha_px_height},
			'default': {'type': 'image', 'name': 'bg.png', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		
		this.alpha = 1;//0.8;
		
		_allObjects.splice(_allObjects.indexOf(this), 1);
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = _plocha_px_width;
		this.height =  _plocha_px_height;
		
		this.morphFrom = 0xffffff;
		this.morphTo = 0x0000ff;
		this.morphCurrent = this.morphFrom.toString(16);
		this.morphing = false;
		this.setX(0);
		this.setY(0);
		
		this.shipHP = 3;
	},
	morph: function(color)
	{
		if(typeof(color) == 'string')
			color = ('0x'+color) * 1
		this.morphFrom = parseInt(this.morphCurrent, 16);
		this.morphTo = color;
		this.morphing = 0;
	},
	pohyb: function()
	{
		if(isDown(49) && !_allObjects[1].pinned) // Pauza 1 a 2
		{
			for(i = 0; i < _allObjects.length; i++)
			{
				_allObjects[i].pinned = true;
			}
		}
		if(isDown(50) && _allObjects[1].pinned)
		{
			for(i = 0; i < _allObjects.length; i++)
			{
				_allObjects[i].pinned = false;
			}
		}
		

		if(typeof(this.morphing) != 'boolean')
		{
			this.morphCurrent = this.colorInGradient(this.morphFrom, this.morphTo, this.morphing / 100).toString(16);
			this.morphing += 5;
			
			if(this.morphing == 100)
				this.morphing = false;
		}
		
		this.base();
	},
	colorInGradient: function(b, a, factor)
	{
		if(factor >= 1)
			return a;

		if(factor <= 0)
			return b;

		var fb = 1 - factor;

		return ((((a & 0xFF0000)*factor)+((b & 0xFF0000)*fb)) & 0xFF0000) + ((((a & 0x00FF00)*factor)+((b & 0x00FF00)*fb)) & 0x00FF00) + ((((a & 0x0000FF)*factor)+((b & 0x0000FF)*fb)) & 0x0000FF);
	}
});

var tvinner_obj = object.extend({
	constructor: function()
	{
		this.base('tvinner');
		_allObjects.splice(_allObjects.indexOf(this), 1);
				
		this.frames = {
			'default': {'type': 'image', 'name': 'tv-inner.png', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		
		this.alpha = 1;
				
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = _plocha_px_width;
		this.height =  _plocha_px_height;
		
		this.setX(0);
		this.setY(0);
	},
	recalibrate: function()
	{
		plocha = document.getElementById('plocha');
		_plocha_left = _plocha_top = 0;
		do {
			_plocha_left += plocha.offsetLeft;
			_plocha_top += plocha.offsetTop;
		} while (plocha = plocha.offsetParent)
		plocha = document.getElementById('plocha');

		tv = document.body.style;
		tv.backgroundPosition = (_plocha_left - 16 + "px " + (_plocha_top - 16)) + "px";
	}
});

var overlayer_obj = object.extend({
	constructor: function()
	{
		this.base('_Overlayer');
		_allObjects.splice(_allObjects.indexOf(this), 1);
				
		this.frames = {
			'default': {'type': 'rect', 'color': '000000', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		
		this.alpha = 0;
				
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = _plocha_px_width;
		this.height =  _plocha_px_height;
		
		this.setX(0);
		this.setY(0);
		
		this.locked = false;
	},
	resetmorph: function(toblack)
	{
		if(toblack == true)
			this.alpha = 1;
		else
			this.alpha = 0;

		this.speed = 0;
		this.completed = true;
	},
	pohyb: function()
	{
		if(this.speed < 0) // c->v
		{
			if(this.alpha > 1 - this.max)
				this.alpha += this.speed;
			if(this.alpha < 1 - this.max)
				this.alpha = 1 - this.max;
		}
		if(this.speed > 0)
		{
			if(this.alpha < this.max)
				this.alpha += this.speed;
			if(this.alpha > this.max)
				this.alpha = this.max;
		}
		
		if(!this.locked && !this.completed && ((this.alpha == this.max && this.speed > 0) || (this.alpha == 1 - this.max && this.speed < 0)))
		{
			this.completed = true;
		}
		
		/*if(this.completed && (random(0, 100) == 0 || this.max != 1))
		{
			if(this.max == 1)
			{
				this.max = random(10, 50) * 0.01;
				this.speed = this.max / 3;
			}
			else
			{
				this.max = 1;
				this.speed = -this.speed;
			}
			this.completed = false;
		}*/
		this.base();
				//document.getElementsByTagName('h1')[0].innerHTML = "speed: "+this.speed+", max: "+this.max+", alpha: "+Math.round(this.alpha*Math.pow(10,2))/Math.pow(10,2);;

	}

});

var flash_obj = object.extend({
	constructor: function()
	{
		this.base('_Flash');
		_allObjects.splice(_allObjects.indexOf(this), 1);
				
		this.frames = {
			'default': {'type': 'blank', 'color': 'ffffff', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		
		this.alpha = 1;
				
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = _plocha_px_width;
		this.height =  _plocha_px_height;
		
		this.setX(0);
		this.setY(0);
		
	},

})

var _Flash = new flash_obj;
var _Background = new bg_obj();
var _tvinner = new tvinner_obj();
var _Overlayer = new overlayer_obj();

_drawOrder = [_Background, 'all', _Overlayer, _tvinner];

var button_obj = object.extend({
	constructor: function(text, spusti)
	{
		this.base('button'+numClass('button'));
		this.addClass('button');
		this.frames = {
			'default': {'type': 'text', 'color': 'ffffff', 'font': '30pt Arial', 'text': text, 'width': measureText(text, '30pt Arial'), 'height': 30},
			//'default': {'type': 'image', 'name': 'spaceship.png', 'width': 31, 'height': 30},
			//'accelerating': {'type': 'image', 'name': 'spaceship-accel.png', 'width': 31, 'height': 30},
		};
		this.frame = 'default';
		this.width = measureText(text, '30pt Arial');
		this.height = 30;
		this.cursor = 'pointer';
		this.pressed = false;
		this.spusti = spusti;
	},
	pohyb: function()
	{
		if(_mouseUp && !this.mouseInside(false, true) && this.pressed)
			this.pressed = false;
		if(this.mouseInside(false, true) && this.frames[this.frame].color != 'dadada')
		{
			this.frames[this.frame].color = '67ede8';
		}
		else if(!this.mouseInside(false, true))
			this.frames[this.frame].color = 'ffffff';
						
		this.base();
	},
	mouseDown: function()
	{
		this.frames[this.frame].color = 'dadada';
		this.pressed = true;
	},
	mouseUp: function()
	{
		this.frames[this.frame].color = '67ede8';
		eval(this.spusti);
		this.pressed = false;
	}
});

var healthdisplay_obj = object.extend({
	constructor: function()
	{
		this.base('healthdisplay'+(2 - numClass('health')));
		this.addClass('health');
		
		this.frames = {
			'default': {'type': 'polygon', 'color': '666666', 'points': [[0, 30], [0, 15], [15, 0], [30, 15], [30, 30], [15, 15]], 'colType': ['circle', 30, 30], 'width': 30, 'height': 30},
		};
		this.frame = 'default';
		
		this.width = 30;
		this.height = 30;
		
		this.setZindex = 30;

		this.setY(550);
		this.setX(570 + numClass('health') * 40);
	}
});

var spaceship_obj = object.extend({
	constructor: function()
	{
		this.base('spaceship');
		this.addClass('spaceship');
				
		this.frames = {
			'default': {'type': 'polygon', 'color': 'ffffff', 'points': [[0, 30], [0, 15], [15, 0], [30, 15], [30, 30], [15, 15]], 'colType': ['circle', 30, 30], 'width': 30, 'height': 30},
			//'default': {'type': 'image', 'name': 'spaceship.png', 'width': 31, 'height': 30},
			//'accelerating': {'type': 'image', 'name': 'spaceship-accel.png', 'width': 31, 'height': 30},
		};
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = 30;
		this.height = 30;
		
		this.min_x = -this.width;
		this.max_x = _okno_px_width + this.width;
		this.min_y = -this.height;
		this.max_y = _okno_px_height + this.height;	
		
		this.speed = 0.3;
		this.powerups = [];
		
		this.shotPause = 250;
		this.lastShot = 0;
		
		this.setX((_plocha_px_width - this.width) / 2);
		this.setY((_plocha_px_height - this.width) / 2);
		
		this.setZindex(10);
		
		this.boundsAction = {'top': 1, 'right': 1, 'bottom': 1, 'left': 1, 'run': ''};
		
		this.maxexplode = 50;
		this.explodespeed = 1.3;
		
		this.invincible = false;
	},
	godmodeOn: function(duration)
	{
		this.invincible = true;
		this.alpha = 0.3;
		this.registerEvent(duration, "this.invincible = false;");
	},
	explode: function()
	{
		if(!this.hasClass('spaceship'))
			return 0;
			
		_Background.morph('ffffff');
		this.frames['default'].color = 'ff0000';
		flash(5, 100, ['blank', 'red'], true);
		earthquake(40, 20, 15, 20);
		this.exploding = 0;
		this.removeClass('spaceship');
		this.setSpeedX(0);
		this.setSpeedY(0);
		this.boundsAction = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0, 'run': ''};
		
		if(_Background.shipHP)
		{
			_Background.shipHP --;
			getObjectById('healthdisplay'+_Background.shipHP).die();
			
			_Overlayer.registerEvent(2500, "respawnShip();", false, "respawnship");
		}
		else
		{
			_Overlayer.resetmorph();
			_Overlayer.max = 1;
			_Overlayer.speed = 0.03;
			_Overlayer.locked = true;
			_Overlayer.registerEvent(1500, "this.locked = false;menuInit();", false, "resetmorphcallmenu");
			return 0;
		}
		
		_Overlayer.resetmorph();
		_Overlayer.max = 1;
		_Overlayer.speed = 0.03;
		_Overlayer.locked = true;
		_Overlayer.registerEvent(1500, "this.resetmorph(1);this.speed = -0.03;", false, "resumegame");
		_Overlayer.registerEvent(2500, "this.resetmorph(0);this.locked = false;", false, "resetmorph");
	},
	pohyb: function()
	{	
		if(this.alpha < 1 && !this.invincible)
		{
			this.alpha += 0.1;
		}
		
		if(typeof(this.exploding) != 'undefined')
		{
			if(this.exploding == this.maxexplode)
				this.die();
			this.setX(this.getX() - (this.explodespeed * 15));
			this.setY(this.getY() - (this.explodespeed * 15));
			this.scale_x = this.scale_x + this.explodespeed;
			this.scale_y = this.scale_y + this.explodespeed;
			this.alpha -= 1 / this.maxexplode;
			this.exploding ++;
		
		
			this.base();
			return false;
		}
		else
			this.frames[this.frame].color = _Background.morphCurrent;
				
		var a = (this.getX() + this.width / 2) > _Mouse.x ? ((this.getX() + this.width / 2) - _Mouse.x) : (_Mouse.x - (this.getX() + this.width / 2));
		var b = (this.getY() + this.height / 2) > _Mouse.y ? ((this.getY() + this.height / 2) - _Mouse.y) : (_Mouse.y - (this.getY() + this.height / 2))
		
		// natocenie lode
		
		/*if((this.getX() + this.width / 2) > _Mouse.x)
			this.rotation = trigon(a / b, 'atan') * -1;
		if((this.getX() + this.width / 2) <= _Mouse.x)
			this.rotation = trigon(a / b, 'atan');*/

		this.rotation = (this.getX() + this.width / 2) > _Mouse.x ? trigon(a / b, 'atan') * -1 : trigon(a / b, 'atan');
		//trigon(((this.getX() + this.width / 2) - _Mouse.x) / (this.getY() - _Mouse.y), 'atan') * -1;
		if(_Mouse.y > this.getY())
			this.rotation = (this.rotation + 180) * -1;
			
		if(this.rotation < 0)
			this.rotation = 360 + this.rotation;
			
		// pohyb
//		document.getElementsByTagName('h1')[0].innerHTML = _Key['code'];//this.getSpeedX();
		
		if(isDown(1000) && _Mouse.x != (this.getX() + this.width / 2) && _Mouse.y != this.getY())
		{
			//this.frame = 'accelerating';
			//this.spawnTrails();
			
			var sx = this.speed * trigon(trigon(a / b, 'atan'), 'sin');
			var sy = this.speed * trigon(trigon(a / b, 'atan'), 'cos');

			if((this.getX() + this.width / 2) > _Mouse.x)
				sx = sx * -1;
			if(this.getY() > _Mouse.y)
				sy = sy * -1;
			
			this.setSpeedX(this.getSpeedX() * 0.97 + sx);
			this.setSpeedY(this.getSpeedY() * 0.97 + sy);

			
			
			if(this.speed < 1.5)
			this.speed = this.speed * 1.1;
		}
		else
		{
			if(this.speed > 0.3)
				this.speed = 0.3;
		}
		
		if(isDown(32))
		{
			this.shoot();
		}
		
		if(_Background.morphCurrent != "ffffff")
		{
			if(_Background.morphCurrent == "67ede8" && this.powerups.indexOf('speed') == -1)
			{
				if(this.powerups.length)
					_Background.morph("666666")
			}
			if(_Background.morphCurrent == "666666" && this.powerups.indexOf('pause') == -1)
			{
				if(this.powerups.length)
					_Background.morph("67ede8")
			}
			if(this.powerups == false && _Background.morphCurrent != "ffffff" && _Background.morphing == false)
				_Background.morph("ffffff")
		}
		
		var hitTest = objectsInRect(this.getX(), this.getY(), this.width, this.height);
		for(i in hitTest)
		{
			if(hitTest[i].hasClass('asteroid') && !this.invincible)
			{
				this.explode();
			}
			if(hitTest[i].hasClass('powerup'))
			{
				var puType = hitTest[i].types[hitTest[i].type];
				
				_Background.morph(puType[1])
				
				this.removeEvents('powerup-'+puType[0]);
				this.registerEvent(puType[4], puType[3]+"if(this.powerups.indexOf('"+puType[0]+"') >= 0)this.powerups.splice(this.powerups.indexOf('"+puType[0]+"', 1))", false, 'powerup-'+puType[0]);
				if(this.powerups.indexOf(puType[0]) == -1)
					this.powerups.push(puType[0]);
				
				eval(puType[2]);
				
				
				hitTest[i].explode();
			}
		}
		this.base();
	},
	shoot: function()
	{
		var date = new Date;
		if(date.getTime() - this.shotPause > this.lastShot)
		{
			this.lastShot = date.getTime();
			var bullet = new bullet_obj(this);
		}
	}
})

var powerup_obj = object.extend({
	constructor: function(type)
	{
		this.types = [
			['speed', '67ede8', 'this.shotPause = 150;', 'this.shotPause = 250;', 5000],
			['pause', '666666', 'var ast = getObjectsByClass("asteroid");for(j in ast)ast[j].pinned = true;', 'var ast = getObjectsByClass("asteroid");for(j in ast)ast[j].pinned = false;', 5000]//'', '', 5000],//'
		]
		
		if(typeof(type) == 'number')
		{
			if(typeof(this.types[this.type]) == 'undefined')
			{
				alert('There is no powerup type "'+type+'"!');
				return false;
			}
		}
		if(typeof(type) == 'undefined')
		{
			type = random(0, this.types.length - 1);
		}
		if(typeof(type) == 'string')
		{
			for(var i = 0; i < this.types.length; i++)
			{
				if(this.types[i][0] == type)
				{
					type = i * 1;
					break;
				}
			}
			if(typeof(type) == 'string')
			{
				alert('There is no powerup type "'+type+'"!');
				return false;
			}
		}
		
		this.type = type;
		this.typestr = this.types[this.type][0];
		
		this.base('powerup'+numClass('powerup'));
		this.addClass('powerup');

		this.frames = {
			'default': {'type': 'image', 'name': this.typestr+'.png', 'width': 20, 'height': 20},
		};
		
		this.frame = 'default';
		
		this.width = 20;
		this.height = 20;
		
		this.minSize = 18;
		this.maxSize = 22;
		
		this.resM = 0.3;
	},
	pohyb: function()
	{
		if(typeof(this.exploding) != 'undefined')
		{
			if(this.exploding == 10)
				this.die();
			this.setX(this.getX() - (0.7 * 10));
			this.setY(this.getY() - (0.7 * 10));
			this.scale_x = this.scale_x + 0.7;
			this.scale_y = this.scale_y + 0.7;
			this.alpha -= 1 / 10;
			this.exploding ++;
		
		
			this.base();
			return false;
		}
		
		if(this.width >= this.minSize - 1 && this.width <= this.maxSize + 1)
		{
			this.width += this.resM;
			this.height += this.resM;
			this.setX(this.getX() + this.resM * -0.5);
			this.setY(this.getY() + this.resM * -0.5);
		}
		if(this.width <= this.minSize || this.width >= this.maxSize)
		{
			this.resM = this.resM * -1;
		}
		
		this.base();
	},
	explode: function()
	{
		this.exploding = 0;
		this.removeClass('powerup');
	},
})

var bullet_obj = object.extend({
	constructor: function(parent)
	{
		this.base('bullet'+numClass('bullet'));
		this.addClass('bullet');
				
		this.frames = {
			'default': {'type': 'rect', 'color': _Background.morphCurrent, 'width': 2, 'height': 2},
		};
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = 2;
		this.height =  2;
		
		this.speed = 10;
		
		this.min_x = -100;
		this.max_x = _okno_px_width + 100;
		this.min_y = -100;
		this.max_y = _okno_px_height + 100;		
		
		this.setX(parent.getX() + parent.width / 2);
		this.setY(parent.getY());
		
		var x = 0;
		var y = parent.height / 2 * -1;
		
		this.setX(this.getX() + (trigon(parent.rotation, 'cos') * x - trigon(parent.rotation, 'sin') * y));
		this.setY(this.getY() + (trigon(parent.rotation, 'cos') * y + trigon(parent.rotation, 'sin') * x));
		this.setY(this.getY() + parent.height / 2);
		
		var a = this.getX() - (parent.getX() + parent.width / 2);
		var b = this.getY() - (parent.getY() + parent.height / 2)
		var c = parent.height / 2;//Math.sqrt(a*a + b*b);
		//document.getElementsByTagName('h1')[0].innerHTML = a;
		this.setSpeedX((a*this.speed) / c);
		this.setSpeedY((b*this.speed) / c);
		this.boundsAction = {'top': 2, 'right': 2, 'bottom': 2, 'left': 2, 'run': ''};
	},
	pohyb: function()
	{
		this.frames[this.frame].color = _Background.morphCurrent;

		var hitTest = objectsInRect(this.getX(), this.getY(), this.width, this.height, 'asteroid');
		for(i in hitTest)
		{
			//if(hitTest[i].hasClass('asteroid'))
			//{
				if(hitTest[i].width > 33)
				{
					for(var j = 0; j < 3; j++)
					{
						var newAs = new asteroid_obj();
						newAs.frames[newAs.frame].width = hitTest[i].width - 33;
						newAs.frames[newAs.frame].height = hitTest[i].height - 33;
						newAs.width = hitTest[i].width - 33;
						newAs.height = hitTest[i].height - 33;
						newAs.setX(hitTest[i].getX() + hitTest[i].width / 2 - newAs.width / 2);
						newAs.setY(hitTest[i].getY() + hitTest[i].height / 2 - newAs.height / 2)

						newAs.max_x = _okno_px_width + newAs.width;
						newAs.min_x = -1 * newAs.width;
						newAs.max_y = _okno_px_height + newAs.height;
						newAs.min_y = -1 * newAs.height;
					}
				}
				hitTest[i].explode();
				this.die();
			//}
		}
		
		this.base();
	},
})

var asteroid_obj = object.extend({
	constructor: function()
	{
		this.base('asteroid'+numClass('asteroid'));//random(0, 32000));
		this.addClass('asteroid');
				
		this.frames = {
			'default': {'type': 'circle', 'color': 'ffffff', 'width': 99, 'height': 99},
		};
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = 99;
		this.height =  99;
		
		this.max_x = this.max_x + this.width;
		this.min_x = -1 * this.width;
		this.max_y = this.max_y + this.height;
		this.min_y = -1 * this.height;
		
		this.max_speed = 4;
		this.min_speed = 2;
		
		var c = random(this.min_speed, this.max_speed);
		var x = random(1, c);
		var y = Math.sqrt(c*c - x*x);
		x = random(-1, 1, [0]) * x;
		y = random(-1, 1, [0]) * y;		
		
		this.setX(-this.width);
		this.setY(random(0, _plocha_px_height - 50));
		this.setSpeedX(x);
		this.setSpeedY(y);
		
		this.setZindex(5);
		this.boundsAction = {'top': 1, 'right': 1, 'bottom': 1, 'left': 1, 'run': ''};
		
		this.maxexplode = 15;
	},
	explode: function()
	{
		this.setZindex(1);
		this.frames['default'].color = 'ff0000';
		if(random(0, 5) == 0)
		{
			var p = new powerup_obj();
			p.setX(this.getX() + this.width / 2 - p.width / 2);
			p.setY(this.getY() + this.height / 2 - p.height / 2);
		}
		earthquake(5, 20, this.getWidth() * 0.1, this.getWidth() * 0.1);
		this.exploding = 0;
		this.removeClass('asteroid');
		this.setSpeedX(0);
		this.setSpeedY(0);
		this.boundsAction = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0, 'run': ''};
		
		if(numClass('asteroid') == 0)
		{
			vypisFontom("You truly are one heroic spaceship!", "center", "center", "40px Arial", "aaaaaa", 10);
			vypisFontom("Congratulations!", "center", 570, "20px Arial", "FF6ED8", 10);
		}
	},
	pohyb: function()
	{
		if(typeof(this.exploding) != 'undefined')
		{
			if(this.exploding == this.maxexplode)
				this.die();
			this.setX(this.getX() - (0.1 * this.width /2));
			this.setY(this.getY() - (0.1 * this.height /2));
			this.scale_x += 0.1;
			this.scale_y += 0.1;
			this.alpha -= 1 / this.maxexplode;
			this.exploding ++;
		}
		else
			this.frames[this.frame].color = _Background.morphCurrent;
		
		this.base();
	},
})

/*var cur_obj = object.extend({
	constructor: function()
	{
		this.base('cur');
				
		this.frames = {
			'default': {'type': 'rect', 'color': '0000ff', 'width': 1, 'height': 1},
		};
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.width = 1;
		this.height =  1;
		
		this.setX(_Mouse.x);
		this.setY(_Mouse.y);
	},
	pohyb: function()
	{
		this.setX(_Mouse.x);
		this.setY(_Mouse.y);
		this.base();
	},
})*/