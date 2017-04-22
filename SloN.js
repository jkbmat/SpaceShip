//***************************************************
//*                                                 *
//*             SloN engine v. 0.9                 *
//*                                                 *
//*       by Jakub Matuska, kexo007@gmail.com       *
//*                                                 *
//*                                                 *
//*        using BSD license (./license.txt)        *
//*                                                 *
//*                     (c)2011                     *
//*                                                 *
//***************************************************
// TESTOVACIA VERZIA: BUFFEROVE VYKRESLOVANIE

_Key = new Array;
_Key['code'] = new Array; // keycodes of keys currently pressed
_Key['up'] = new Array; // keycode of keys released since last loop run
_Key['last'] = 0; // keycode of last pressed key
_mouseUp = false;
_mouseDown = false;
_Mouse = new Array;
_allObjects = new Array;
_allSounds = new Array;
_plocha_left = _plocha_top = 0;
_cursor = '';
_oldscale = 1;
_objectsByClass = new Array;
_looprun = 0;
_fps = [];
_posfps = [];
_drawOrder = []; // order in which to draw objects ("all" string for the _allObjects array) 

// preload

var loadedImages = 0;
var loadedSounds = 0;
var loadedPercent = 0;
var Images = new Array;

function preloadF()
{
	_cursor = document.getElementById('plocha').style.cursor;
	
	if(preload_images.length == 0)
	{
		init();
		return 0;
	}
	
	for(var i = 0; i < preload_fonts.length; i++)
	{
		var node = document.createElement('span');
		node.style.fontFamily = preload_fonts[i];
		node.innerHTML = preload_fonts[i];
		node.style.position = 'absolute';
		node.style.visibility = 'hidden';
		document.body.insertBefore(node, document.getElementsByTagName('h1')[0].nextSibling);
	}
	
	var loadstatus = document.createElement('h2');
	loadstatus.id = "loadstatus";
	loadstatus.innerHTML = "0%";
	document.body.insertBefore(loadstatus, document.getElementsByTagName('h1')[0].nextSibling);
	for(i = 0; i < preload_images.length; i++)
	{
		Images[Images.length] = {'obj': '', 'name': preload_images[i][0]};
		Images[Images.length - 1]['obj'] = new Image();
		Images[Images.length - 1]['obj'].src = preload_images[i][1];
		Images[Images.length - 1]['obj'].id = preload_images[i][0];
		Images[Images.length - 1]['obj'].addEventListener("load", function(){increasePreloadImg(this);}, false);
	}
}

function increasePreloadImg(imgobj)
{
	createPreloadCanvas(imgobj);
	
	var loadstatus = document.getElementById('loadstatus');
	loadedPercent = Math.min(loadedPercent + Math.floor(100 * preload_images[loadedImages][2] / preload_images_loadtotal), 100);
	
	loadstatus.innerHTML = loadedPercent + "%";

	loadedImages ++;
	if(loadedImages == preload_images.length)
	{
		loadstatus.innerHTML = "100%";
		setTimeout("document.getElementById('loadstatus').parentNode.removeChild(document.getElementById('loadstatus')); init();", 500);
	}
}

function createPreloadCanvas(imgobj)
{
	var canvas = document.createElement('canvas'); // create hidden canvas with image (for later to copy from)
	canvas.style.display = "none";
	canvas.width = imgobj.width;
	canvas.height = imgobj.height;
	canvas.id = imgobj.id;
	document.body.appendChild(canvas);
	
	canvas.getContext('2d').drawImage(imgobj, 0, 0, imgobj.width, imgobj.height); // draw the actual image to said canvas
}

document.onkeydown = KeyDown;
document.onkeyup = KeyUp;
document.onmousedown = MouseDown;
document.onmouseup = MouseUp;
document.onmousemove = SaveMouse; 

function KeyUp(e)
{
	if(typeof(_pauseKey) != 'undefined')
	{
		if(e.keyCode == _pauseKey && _paused == false)
		{
			pause(true);
		}
		else if(e.keyCode == _pauseKey)
		{
			pause(false);
		}
	}

	while(_Key['code'].indexOf(e.keyCode) >= 0)
		_Key['code'].splice(_Key['code'].indexOf(e.keyCode), 1);
		
	_Key['up'].push(e.keyCode);
}

function KeyDown(e)
{
	if(_Key['code'].indexOf(e.keyCode) == -1)
	{
		_Key['code'].push(e.keyCode);
		_Key['last'] = e.keyCode;
	}
	if(e.keyCode==32)
		e.preventDefault();
}

function MouseUp()
{
	_mouseUp = true;

	if(_Key['code'].indexOf(1000) >= 0)
		_Key['code'].splice(_Key['code'].indexOf(1000), 1);
				
	_Key['up'].push(1000);
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].mouseInside())
		{
			_allObjects[i].mouseUp();
		}
	}
	console.log(_Key['code']);
}

function MouseDown()
{
	_mouseDown = true;
	
	if(_Key['code'].indexOf(1000) == -1)
	{
		_Key['code'].push(1000);
		_Key['last'] = 1000;
	}
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].mouseInside())
		{
			_allObjects[i].mouseDown();
		}
	}
	event.preventDefault();
}
function SaveMouse(e)
{
	if(typeof(_plocha_left) != 'undefined')
	{
		_Mouse.x = Math.floor((e.pageX - _plocha_left) / _oldscale);
		_Mouse.y = Math.floor((e.pageY - _plocha_top) / _oldscale);
	}
}

function isDown(key)
{
	return _Key['code'].indexOf(key) + 1;
}

var object = Base.extend
({
	constructor: function(id)
	{
		this.id = id; // id
	
		this.x_speed = 0.0; // rychlosti
		this.y_speed = 0.0;
		this.x_speed_helper = 0.0;
		this.y_speed_helper = 0.0;

		this.boundsAction = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0, 'run': ''}; // co sa stane pri prechode za okraj
					//		0: nic, chod aj za okraj
					//		1: prechod na druhu stranu obrazovky
					//		2: die()
					//		3: odrazenie
					//		4: nic, prjedi iba po okraj a ostan stat
		
		this.frame = "";
		this.oldframe = "";
		
		this.centerPoint = [0, 0]; // center point used for animations; [0]: 0 - left, 1 - center, 2 - right [1]: 0 - top, 1 - center, 2 - bottom.
		this.rotCenter = [0, 0]; // center of rotation relative to the center of the object
		
		this.x = 0; // poloha
		this.y = 0;
	
		this.max_x = _okno_px_width; // okraje plochy
		this.max_y = _okno_px_height;
		this.min_x = 0;
		this.min_y = 0;
	
		this.scale_x = 1;
		this.scale_y = 1;
		
		this.visibility = 1; // 0 - neviditelny, 1 - normalny (posuva sa s kamerou), 2 - pripnuty (pinned)
		this.zindex = 1;
		
		this.alpha = 1;
		this.rotation = 0; // v stupnoch
		this.flip = 0; // 0 - do not flip, 1 - flip vertically, 2 - flip horizontally, 3 - flip both axes
		
		this.overlay = ['#000000', 0];
		
		this.sliced = false; // Whether to draw only a slice of image. This is false when the image shouldn't be cut and [sx, sy, sWidth, sHeight] as in "slicing" part of https://developer.mozilla.org/en/Canvas_tutorial/Using_images if it should be cut
		
		this.cursor = 'default';

		this.pinned = false;
		
		this.pinnedTo = [];
		this.pinners = [];
		
		this.events = new Array;
		this.frames = new Array;
		this.classes = new Array;
		this.sounds = new Array;
		this.animations = new Array;
		this.runningAnim = "";

		_allObjects.push(this);	// zaregistruj objekt do pola vsetkych objektov
		sortAllObj();
	},
	registerSound: function(name, autoload, opts)
	{
		autoload = typeof(autoload) == 'undefined' ? true : autoload;
		
		var date = new Date;
		do
		{
			objid = date.getTime() + "-" + random(0, 10000);
		} while (soundManager.getSoundById(objid))
		
		var id = this.getId();
		
		var opts_use = {
			id: objid,
			url: preload_sounds[name],
			volume: 100,
			autoload: autoload,
			onfinish: function(){
				var thisobj = id == 'Background' ? _Background : getObjectById(id);
				
				for(var i = 0; i < thisobj.sounds.length; i ++)
				{
					if(thisobj.sounds[i].name == name)
					{
						thisobj.sounds[i].playStart = 0;
					}
				}
			},
		}
		
		for(i in opts)
		{
			opts_use[i] = opts[i];
		}
		
		var soundObj = soundManager.createSound(opts_use);
		
		var newSound = {
			'playStart': 0,
			'sound': soundObj,
			'name': name,
		};
		
		this.sounds.push(newSound);

	},
	playSound: function(name)
	{
		if(_PovoleneEfekty['sound'])
		{
			for(var i = 0; i < this.sounds.length; i ++)
			{
				if(this.sounds[i].name == name)
				{
					this.sounds[i].sound.play();
					var date = new Date;
					this.sounds[i].playStart = date.getTime();
				}
			}
		}
	},
	deleteSounds: function()
	{
		for(i in this.sounds)
		{
			this.sounds[i].sound.destruct();
		}
		this.sounds = new Array();
	},
	pinTo: function(obj, x, y)
	{
		this.unpin();
		this.pinnedTo[0] = obj;
		this.pinnedTo[1] = [x, y];
		obj.addPinned(this);
	},
	unpin: function()
	{
		if(this.pinnedTo[0])
		{
			this.pinnedTo[0].removePinned(this);
			this.pinnedTo = [];
		}
	},
	addPinned: function(obj)
	{
		if(this.pinners.indexOf(obj) == -1)
			this.pinners.push(obj);
	},
	removePinned: function(obj)
	{
		if(this.pinners.indexOf(obj) != -1)
			this.pinners.splice(this.pinners.indexOf(obj), 1);
	},
	updatePinned: function(obj)
	{
		for(i in this.pinners)
		{
			this.pinners[i].setX(this.getX() + this.pinners[i].pinnedTo[1][0]);
			this.pinners[i].setY(this.getY() + this.pinners[i].pinnedTo[1][1]);
		}
	},
	getMovedPoints: function(area)
	{
		
		var points = [];
		if(typeof(this.frames[this.getFrame()].area) == 'undefined' || area != true)
		{
			if(this.getAreaType() == 'polygon')
				points = this.frames[this.getFrame()].points;
			else
				points = [[0, 0], [this.getWidth(), 0], [this.getWidth(), this.getHeight()], [0, this.getHeight()]];
		}
		else
		{
			if(this.getAreaType() == 'polygon')
				points = this.frames[this.getFrame()].area.points;
			else
			{
				var area = this.frames[this.getFrame()].area;
				points = [[area.x, area.y], [area.width + area.x, area.y], [area.x + area.width, area.y + area.height], [area.x, area.y + area.height]];
			}
		}
		var toreturn = [];
		for(iter in points)
		{
			toreturn[iter] = [points[iter][0] + this.getX(), points[iter][1] + this.getY()];
		}
		return toreturn;
	},
	setFrame: function(frame)
	{
		this.frame = frame;
		this.oldframe = frame;
		this.onFrameChange();
	},
	getFrame: function()
	{
		return this.frame;
	},
	onFrameChange: function()
	{
		
	},
	setZindex: function(na)
	{
		this.zindex = na;
		sortAllObj();
	},
	addClass: function(what)
	{
		if(!this.hasClass(what))
		{
			this.classes.push(what);
			if(typeof(_objectsByClass[what]) != 'undefined')
			{
				_objectsByClass[what].push(this);
			}
		}
	},
	removeClass: function(what)
	{
		var i = this.hasClass(what);
		if(i > 0)
		{
			this.classes.splice(i - 1, 1);
		}
		if(typeof(_objectsByClass[what]) != 'undefined')
		{
			_objectsByClass[what].splice(_objectsByClass[what].indexOf(this), 1);
		}
	},
	hasClass: function(what)
	{
		return this.classes.indexOf(what) + 1;
	},
	getRunningAnim: function()
	{
		return this.runningAnim;
	},
	getAnimLength: function(anim)
	{
		var vrat = 0;
		for(var i = 0; i < this.animations[anim].length; i++)
		{
			vrat += this.animations[anim][i][1];
		}
		return vrat;
	},
	runAnim: function(co, times, callback)
	{
		if(!this.animations[co] && co)
		{
			addDebug("There is no such animation '"+co+"'");
			return 0;
		}
		
		if(!times)
			times = 0;
		
		if(co || this.animations[co])
		{
			this.runningAnim = co;
			this.animFrame = -1;
			this.animRunTimes = [0, times];
			this.animNextFrame = 0;
			this.animCallback = callback;
		}
		else
			this.runningAnim = "";
	},
	mouseDown: function()
	{
	},
	mouseUp: function()
	{
	},
	mouseInside: function(calcZ, inBounds)
	{
		var Mx = _Mouse.x - 1;
		var My = _Mouse.y - 1;
		
		if(inBounds && (Mx < 0 || Mx > _plocha_px_width || My < 0 || My > _plocha_px_height))
		{	return false;
		}
		
		
		if(!calcZ)
			return objectsInRect(Mx + _kamera_x, My + _kamera_y, 1, 1).indexOf(this) >= 0;
		else
		{
			var objects = objectsInRect(Mx + _kamera_x, My + _kamera_y, 1, 1);
			if(objects.length)
			{
				var toreturn = objects[0];
				for(var i = 0; i < objects.length; i++)
				{
					if(objects[i].zindex > toreturn.zindex || objects[i].zindex == toreturn.zindex && objects[i] == this)
						toreturn = objects[i];
				}
				return toreturn == this;
			}
			else
				return false;
		}
	},
	registerEvent: function(oMs, co, opakuj, keyword)
	{
		var date = new Date;
		if(opakuj)
			this.events.push({'registered': date.getTime(), 'spust': oMs, 'keyword': keyword, 'function': co + 'this.registerEvent('+oMs+', \''+co+'\', '+opakuj+', \''+keyword+'\');'});
		else
			this.events.push({'registered': date.getTime(), 'spust': oMs, 'function': co, 'keyword': keyword});
	},
	removeEvents: function(keyword, withkeyword)
	{
		if(keyword && withkeyword)
		{
			for(var i = this.events.length - 1; i > 0; i --)
			{
				if(this.events[i]['keyword'] == keyword)
					this.events.splice(i, 1);
			}
		}
		else if(keyword && !withkeyword)
		{
			for(var i = this.events.length - 1; i > 0; i --)
			{
				if(this.events[i]['keyword'] != keyword)
					this.events.splice(i, 1);
			}
		}
		else
			this.events = new Array;
	},
	getNumEvents: function(keyword)
	{
		if(keyword)
		{
			var counter = 0;
			
			for(var i = 0; i > this.events.length; i --)
			{
				if(this.events[i]['keyword'] == keyword)
					counter ++;
			}
			
			return counter;
		}
		else
			return this.events.length;
	},
	inRect: function(x, y, width, height)
	{
		if(typeof(this.frames[this.getFrame()].area) == 'undefined')
		{
			oX = this.getX();
			oW = this.getWidth();
			oY = this.getY();
			oH = this.getHeight();
		}
		else
		{
			oX = this.getX() + this.frames[this.getFrame()].area.x;
			oW = this.frames[this.getFrame()].area.width;
			oY = this.getY() + this.frames[this.getFrame()].area.y;
			oH = this.frames[this.getFrame()].area.height;
		}
		if(Math.abs((oX + oW / 2) - (x + width / 2)) <= oW / 2 + width / 2 && Math.abs((oY + oH / 2) - (y + height / 2)) <= oH / 2 + height / 2)
			return true;
		else
			return false;
	},
	pohyb: function()
	{
		// animacie
			
		if(this.getRunningAnim())
		{
			if(this.animRunTimes[0] == this.animRunTimes[1] && this.animRunTimes[1] > 0)
			{
				this.runAnim();
				eval(this.animCallback);
			}
			else
			{
				var date = new Date;
				if(this.animNextFrame == 0)
				{
					this.animNextFrame = date.getTime();
				}
				if(this.animNextFrame <= date.getTime()) // preskoc na dalsi snimok
				{
					this.animFrame ++;
										
					if(this.animFrame == this.animations[this.getRunningAnim()].length)
					{
						this.animFrame = 0;
						this.animRunTimes[0] ++;
					}
					
					var x = 0;
					var y = 0;
					
					if(this.centerPoint[0] == 1)
						x = this.getCenX();
					if(this.centerPoint[0] == 2)
						x = this.getX() + this.getWidth();
						
					if(this.centerPoint[1] == 1)
						y = this.getCenY();
					if(this.centerPoint[1] == 2)
						y = this.getY() + this.getHeight();
					
					this.setFrame(this.animations[this.getRunningAnim()][this.animFrame][0]);
					
					if(this.centerPoint[0] == 1)
						this.setCenX(x);
					if(this.centerPoint[0] == 2)
						this.setX(x - this.getWidth());
						
					if(this.centerPoint[1] == 1)
						this.setCenY(y);
					if(this.centerPoint[1] == 2)
						this.setY(y - this.getHeight());
					
					this.animNextFrame = date.getTime() + this.animations[this.getRunningAnim()][this.animFrame][1];
				}
			}
		}

		
		// eventy
			
		var date = new Date;
		for(var i = 0; i < this.events.length; i++)
		{
			if(date.getTime() >= (this.events[i]['spust'] + this.events[i]['registered']))
			{
				eval(this.events[i]['function']);
				this.events.splice(i, 1);
			}
		}
		
		// boundsActions:
			
		var triggered = new Array;
		if((this.getX() + this.getSpeedX()) > this.max_x - this.getWidth())
		{
			triggered.push("right");
		}
		if((this.getX() + this.getSpeedX()) < this.min_x)
		{
			triggered.push("left");
		}
		if((this.getY() + this.getSpeedY()) > this.max_y - this.getHeight())
		{
			triggered.push("bottom");
		}
		if((this.getY() + this.getSpeedY()) < this.min_y)
		{
			triggered.push("top");
		}
		
		for(var i = 0; i < triggered.length; i++)
		{
			if(this.boundsAction[triggered[i]] === 0) // nic, chod aj za okraj
			{
			}
			
			else if(this.boundsAction[triggered[i]] === 1) // prechod na druhu stranu obrazovky
			{
				switch(triggered[i])
				{
					case "top":
						this.setY(this.max_y - this.getHeight());
						break;
					case "right":
						this.setX(this.min_x);
						break;
					case "bottom":
						this.setY(this.min_y);
						break;
					case "left":
						this.setX(this.max_x - this.getWidth());
						break;
				}
			}
			
			else if(this.boundsAction[triggered[i]] === 2) // die()
			{
				this.die();
			}
			
			else if(this.boundsAction[triggered[i]] === 3) // bounce
			{
				switch(triggered[i])
				{
				case "bottom":
						this.setY(this.max_y - this.getHeight());
						this.setSpeedY(this.getSpeedY() * -1);
						break;
					case "top":
						this.setY(this.min_y);
						this.setSpeedY(this.getSpeedY() * -1);
						break;
					case "left":
						this.setX(this.min_x);
						this.setSpeedX(this.getSpeedX() * -1);
						break;
					case "right":
						this.setX(this.max_x - this.getWidth());
						this.setSpeedX(this.getSpeedX() * -1);
						break;
				}
			}
			
			if(this.boundsAction[triggered[i]] === 4) // prejdi iba po okraj a ostan stat
			{
				switch(triggered[i])
				{
					case "top":
						this.setY(this.min_y);
						this.setSpeedY(0);
						break;
					case "right":
						this.setX(this.max_x - this.getWidth());
						this.setSpeedX(0);
						break;
					case "bottom":
						this.setY(this.max_y - this.getHeight());
						this.setSpeedY(0);
						break;
					case "left":
						this.setX(this.min_x);
						this.setSpeedX(0);
						break;
				}
			}

			eval(this.boundsAction['run']);
		}
		
		if(!this.pinned)
		{
			this.x_speed_helper += this.x_speed % _posun;
			this.y_speed_helper += this.y_speed % _posun;
			
			this.x = this.getSpeedX() - (this.getSpeedX() % _posun) + (this.x_speed_helper - this.x_speed_helper % _posun) + this.getX();
			this.y = this.getSpeedY() - (this.getSpeedY() % _posun) + (this.y_speed_helper - this.y_speed_helper % _posun) + this.getY();
			
			if(Math.abs(this.x_speed_helper / _posun) > 0 && Math.abs(this.x_speed_helper) > Math.abs(this.x_speed_helper % _posun))
			{
				this.x_speed_helper %= _posun;
			}
			if(Math.abs(this.y_speed_helper / _posun) > 0 && Math.abs(this.y_speed_helper) > Math.abs(this.y_speed_helper % _posun))
			{
				this.y_speed_helper %= _posun;
			}
		}
		
		if(this.getFrame() != this.oldframe)
		{
			this.oldframe = this.getFrame();
			this.onFrameChange();
		}
		this.updatePinned();
		this.rotation = this.rotation < 0 ? (360 - Math.abs(this.rotation % 360)) : this.rotation % 360;
	},
	die: function()
	{
		this.removeEvents()
		
		
		for(var i = 0; i < this.sounds.length; i++)
		{
			this.sounds[i].sound.destruct();
		}
		
		this.sounds = [];
		
		for(var i = 0; i < _allObjects.length; i++)
		{
			if(_allObjects[i] == this)
			{
				inarray = i;
				break;
			}
		}
		_allObjects.splice(inarray, 1);
	},
	getId: function()
	{
		return this.id;
	},
	getWidth: function()
	{
		if(this.getAreaType() == 'circle' || this.getAreaType() == 'rect' || this.getAreaType() == 'blank')
			return (typeof(this.frames[this.getFrame()].area) == 'undefined' && this.frames[this.getFrame()].type == 'text' ? measureText('', '', this.frames[this.getFrame()]) : this.frames[this.getFrame()].width * this.scale_x) * 1;
		else
			return this.frames[this.getFrame()].width * this.scale_x;
	},
	setWidth: function(width)
	{
		this.frames[this.getFrame()].width = width;
	},
	getHeight: function()
	{
		if(this.getAreaType() == 'circle' || this.getAreaType() == 'rect' || this.getAreaType() == 'blank')
			return (typeof(this.frames[this.getFrame()].area) == 'undefined' && this.frames[this.getFrame()].type == 'text' ? this.frames[this.getFrame()].font.substr(0, this.frames[this.getFrame()].font.indexOf('pt')) : this.frames[this.getFrame()].height * this.scale_y) * 1;
		else
			return this.frames[this.getFrame()].height * this.scale_y;
	},
	setHeight: function(height)
	{
		this.frames[this.getFrame()].height = height;
	},
	getAreaType: function()
	{
		if(typeof(this.frames[this.getFrame()].area) == 'undefined')
			return this.frames[this.getFrame()].type == 'image' || this.frames[this.getFrame()].type == 'text' ? 'rect' : this.frames[this.getFrame()].type;
		else
			return this.frames[this.getFrame()].area.type;
	},
	setX: function(x)
	{
		this.x = x;
	},
	setY: function(y)
	{
		this.y = y;
	},
	getX: function()
	{
		return this.x;
	},
	getY: function()
	{
		return this.y;
	},
	setCenX: function(x)
	{
		this.x = x - this.getWidth() / 2;
	},
	setCenY: function(y)
	{
		this.y = y - this.getHeight() / 2;
	},
	getCenX: function()
	{
		return this.x + this.getWidth() / 2;
	},
	getCenY: function()
	{
		return this.y + this.getHeight() / 2;
	},
	setSpeedX: function(speed)
	{
		this.x_speed = speed;
		this.x_speed_helper = 0;
	},
	setSpeedY: function(speed)
	{
		this.y_speed = speed;
		this.y_speed_helper = 0;
	},
	getSpeedX: function()
	{
		return this.x_speed;
	},
	getSpeedY: function()
	{
		return this.y_speed;
	},
});

var fpsdisplay_obj = object.extend({
	constructor: function()
	{
		this.base('_fpsdisplay');
		_allObjects.splice(_allObjects.indexOf(this), 1);
				
		this.frames = {
			'default': {'type': 'text', 'text': 'fps: 0','color': 'ffffff', 'font': '20pt Arial', 'width': measureText('fps: 0'), 'height': '20'},
		};
		
		this.alpha = 1;
				
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.setX(0);
		this.setY(0);
	}
});


function deleteSounds(classes, withclass)
{
	if(typeof(classes) == 'object') // if an object is passed to delete its sounds. It's better to use object's function deleteSounds in this case !!
	{
		for(i in classes.sounds)
		{
			classes.sounds[i].sound.destruct();
		}
		classes.sounds = new Array();
	}
	for(i in _allObjects) // else it loops all the objects
	{
		var deleteInThis = typeof(classes) == 'undefined' ? true : false;
		withclass = typeof(withclass) == 'undefined' ? true : withclass;
		if(!deleteInThis)
		{
			for(j in classes)
			{
				if(_allObjects[i].hasClass(j) && withclass == true || !_allObjects[i].hasClass(j) && withclass == false)
					deleteInThis = true;
			}
		}
		if(deleteInThis)
		{
			for(j in _allObjects[i].sounds)
			{
				_allObjects[i].sounds[j].sound.destruct();
			}
			_allObjects[i].sounds = new Array();
		}
	}
}

function setCursor(what)
{
	_cursor = what;
}

function getCursor(what)
{
	return _cursor;
}

function trigon(kolko, co)
{
	if(typeof(co) == 'undefined')
		return false;
	if(co[0] == 'a')
		return eval('Math.'+co+'('+kolko+') * 180 / Math.PI');
	else
		return eval('Math.'+co+'('+kolko+' * Math.PI / 180)');
}

function pointInRay(ray, point)
{
	/* array structure:
					 0            1            2         3
			ray: [beggining x, beggining y, ending x, ending y]
					 0  1
			point:  [x, y]
	*/
	
	var dX = ray[2] - ray[0];
	var dY = ray[1] - ray[3];
	var angle = Math.round(trigon(dY / dX, 'atan'));
	
	dX = point[0] - ray[0];
	dY = ray[1] - point[1];
	if(angle == Math.round(trigon(dY / dX, 'atan')))
		return true;
	return false;
}

function getLineEq2p(p1, p2)
{
	var m = p1[0] == p2[0] ? null : (p1[1] - p2[1]) / (p1[0] - p2[0]);
	var b = m == null ? null : p1[1] - m*p1[0];
	return[m, b];
}

function distFromLine(line, point)
{
	var eq = getLineEq2p([line[0], line[1]], [line[2], line[3]]);
	if(eq[0] == null)
	{
		return line[0] - point[0];
	}
	var a = eq[0];
	var b = -1;
	var c = eq[1];

	return (a*point[0] + b*point[1] + c) / Math.sqrt(a*a + b*b);
}

function intersecting(a, b, c, d)
{
	a = a*1;
	b = b*1;
	c = c*1;
	d = d*1;
	
	if(a > b)
	{
		var x = a;
		a = b;
		b = x;
	}
	if(c > d)
	{
		var x = c;
		c = d;
		d = x;
	}
	if(a <= d && b >= c)
		return true;
	return false;
}

function checkSidesIntersect(poly, second)
{
	for(j in poly)
	{
		j = j*1;
		var zeroPoint = poly[j];
		var nextPoint = j == poly.length - 1 ? poly[0] : poly[j + 1];
		
		var lmf = distFromLine([zeroPoint[0], zeroPoint[1], nextPoint[0], nextPoint[1]], poly[0]);
		var rmf = lmf;
		for (k in poly)
		{
			var dist = distFromLine([zeroPoint[0], zeroPoint[1], nextPoint[0], nextPoint[1]], poly[k]);
			if(dist > rmf)
				rmf = dist;
			if(dist < lmf)
				lmf = dist;
		}
		var lms = distFromLine([zeroPoint[0], zeroPoint[1], nextPoint[0], nextPoint[1]], second[0]);
		var rms = lms;
		for (k in second)
		{
			var dist = distFromLine([zeroPoint[0], zeroPoint[1], nextPoint[0], nextPoint[1]], second[k]);
			if(dist > rms)
				rms = dist;
			if(dist < lms)
				lms = dist;
		}

		if(!intersecting(lmf, rmf, lms, rms))
		{
			inters = false;
			return false;
		}
	}
	return true;
}

function getPolyBoundingRect(poly)
{
	var l = r = poly[0][0];
	var t = b = poly[0][1];
	for(i in poly)
	{
		if(poly[i][0] > r)
			r = poly[i][0];
		if(poly[i][0] < l)
			l = poly[i][0];
		if(poly[i][1] > b)
			b = poly[i][1];
		if(poly[i][1] < t)
			t = poly[i][1];
	}
	return {'left': l, 'right': r, 'top': t, 'bottom': b, 'width': r - l, 'height': b - t};
}

function getPolyBoundingCircle(poly)
{
	var l = r = poly[0][0];
	var t = b = poly[0][1];
	for(i in poly)
	{
		if(poly[i][0] > r)
			r = poly[i][0];
		if(poly[i][0] < l)
			l = poly[i][0];
		if(poly[i][1] > b)
			b = poly[i][1];
		if(poly[i][1] < t)
			t = poly[i][1];
	}
	var r = r - l > b - t ? r - l : b - t;

	return {'center': [(r - l) / 2, (b - t) / 2], 'r': r, 'd': 2*r};
}

function bbcolide(first, second)
{
	return Math.abs((first.left + first.width / 2) - (second.left + second.width / 2)) <= first.width / 2 + second.width / 2 && Math.abs((first.top + first.height / 2) - (second.top + second.height / 2)) <= first.height / 2 + second.height / 2;
}

function pointDist(first, second)
{
	return Math.sqrt((second[0] - first[0]) * (second[0] - first[0]) + (second[1] - first[1]) * (second[1] - first[1]));
}

function cccolide(first, second)
{
	return pointDist(first.center, second.center) <= first.r  + second.r;
}

function objectsInPolygon(poly)
{
	vrat = new Array;
	for(var i = 0; i < _allObjects.length; i++)
	{
		obj = _allObjects[i];
		var second = obj.getMovedPoints(true);
		
		var fbox = getPolyBoundingCircle(poly);
		var sbox = getPolyBoundingCircle(second);
		if(!cccolide(fbox, sbox))
			continue;
		
		if(checkSidesIntersect(poly, second) == true)
		{
			if(checkSidesIntersect(second, poly) == true)
				vrat.push(_allObjects[i]);
		}
	}
	
	return vrat;
}

function numClass(what)
{
	var num = 0;
	for(var i = 0; i < _allObjects.length; i ++)
	{
		if(_allObjects[i].hasClass(what))
			num ++;
	}
	
	return num;
}

function addDebug(co)
{
	if(enableDebug)
		debug.innerHTML = debug.innerHTML + "<br />\n" + co;
}

function random(min, max, zakazaneCisla)
{
	do
	{
		var randomNum = (Math.random()*10000);
		randomNum = Math.floor(randomNum);
	    randomNum = min + (randomNum % ((max + 1) - min));
	} while (zakazaneCisla && zakazaneCisla.indexOf(randomNum) >= 0)
	
	return randomNum;
}

function main()
{
	//	var date = new Date;
	//var zacalo = date.getTime();

	setCursor('default');
	
	if(_scale != _oldscale)
	{
		document.getElementById('plocha').style.width = _plocha_px_width * _scale + "px";
		document.getElementById('plocha').style.height = _plocha_px_height * _scale + "px";
		
		document.getElementById('okno').style.width = _plocha_px_width * _scale + "px";
		document.getElementById('okno').style.height = _plocha_px_height * _scale + "px";

		_oldscale = _scale;
	}
	
	var length = _drawOrder.length;
	for(var j = 0; j < length; j++)
	{
		if(_drawOrder[j] == "all")
		{
			for(var i = 0; i < _allObjects.length; i++)
			{
				if(_allObjects[i].mouseInside(true))
					setCursor(_allObjects[i].cursor);
					
				_allObjects[i].pohyb();
			}
		}
		else
			_drawOrder[j].pohyb();
	}
	
	document.getElementById('plocha').style.cursor = getCursor();
	_mouseDown = false;
	_mouseUp = false;
	_Key['up'] = new Array;
	date = new Date;
	var skoncilo = date.getTime();

		//var zakolko = 1000 / _fpsLimit - (skoncilo - zacalo);
	//if(zakolko < 0)
		//zakolko = 0;
	
	//document.getElementsByTagName('h1')[0].innerHTML = Math.round((1000 / (zakolko + (skoncilo - zacalo)))) + " fps ("+Math.round(zakolko) + " ms), min "+(skoncilo - zacalo)+" ms";

}

function draw(obj, context, tempdraw, source) // obj - object object to draw, context - context to draw on, tempdraw - draw on temp canvas, source - canvas to copy data from
{
	if(obj.getX() > (_kamera_x - obj.getWidth()) && obj.getX() < _kamera_x + _plocha_px_width && obj.getY() > (_kamera_y - obj.getHeight()) && obj.getY() < _kamera_y + _plocha_px_height)
	{	
		if(tempdraw)
		{
			var x = 0;
			var y = 0;
		}
		else
		{
			var x = obj.getX() - _kamera_x;
			var y = obj.getY() - _kamera_y;
		}
		
		context.save();
		context.globalAlpha = obj.alpha;

		if(obj.flip)
		{
			if(obj.flip == 1)
				context.setTransform(-1, 0, 0, 1, (obj.getCenX() - _kamera_x)*2, 0);
			if(obj.flip == 2)
				context.setTransform(1, 0, 0, -1, 0, (obj.getCenY() - _kamera_y)*2);
			
			if(obj.flip == 3)
			{
				context.setTransform(-1, 0, 0, 1, (obj.getCenX() - _kamera_x)*2, 0);
				context.transform(1, 0, 0, -1, 0, (obj.getCenY() - _kamera_y)*2);
			}
		}

		if(obj.rotation)
		{
			context.translate(x + obj.getWidth() / 2 + obj.rotCenter[0], y + obj.getHeight() / 2 + obj.rotCenter[1]);
			context.rotate((obj.flip == 0 ? obj.rotation : obj.rotation * -1) * (Math.PI / 180));
			context.translate(-1 *(x + obj.getWidth() / 2 + obj.rotCenter[0]), -1 *(y + obj.getHeight() / 2 + obj.rotCenter[1]));
		}

		if(obj.frames[obj.getFrame()]['type'] == 'image' || source)
		{
			if(source)
			{
				if(obj.sliced !== false)
					context.drawImage(source, obj.sliced[0], obj.sliced[1], obj.sliced[2] == 0 ? 1 : obj.sliced[2], obj.sliced[3] == 0 ? 1 : obj.sliced[3], x + obj.sliced[0], y + obj.sliced[1], obj.sliced[2], obj.sliced[3])
				else
					context.drawImage(source, x, y, obj.getWidth(), obj.getHeight());
			}
			else
			{
				/*var preCo = new Array();
				if(typeof(obj.frames[obj.getFrame()]['name']) == "string")
					preCo.push(obj.frames[obj.getFrame()]['name']);
				else
				{
					for(co in obj.frames[obj.getFrame()]['name'])
					{
						preCo.push(obj.frames[obj.getFrame()]['name'][co]);
					}
				}
				for(co in preCo)
				{*/
					if(obj.sliced !== false)
						context.drawImage(getImage(obj.frames[obj.getFrame()].name), obj.sliced[0], obj.sliced[1], obj.sliced[2] == 0 ? 1 : obj.sliced[2], obj.sliced[3] == 0 ? 1 : obj.sliced[3], x + obj.sliced[0], y + obj.sliced[1], obj.sliced[2], obj.sliced[3]);
						//context.drawImage(getImage(preCo[co]), obj.sliced[0], obj.sliced[1], obj.sliced[2] == 0 ? 1 : obj.sliced[2], obj.sliced[3] == 0 ? 1 : obj.sliced[3], x + obj.sliced[0], y + obj.sliced[1], obj.sliced[2], obj.sliced[3]);
					else
						context.drawImage(document.getElementById(obj.frames[obj.getFrame()].name), x, y, obj.getWidth(), obj.getHeight());
						//context.drawImage(getImage(preCo[co]), x, y, obj.getWidth(), obj.getHeight());
				//}
			}
		}
		
		else if(obj.frames[obj.getFrame()]['type'] == 'circle')
		{
			context.fillStyle = "#" + obj.frames[obj.getFrame()]['color'];
			context.beginPath();
			context.arc(x + (obj.getWidth() / 2), y + (obj.getHeight() / 2), obj.getWidth() / 2, 0, 2*Math.PI, true);
			context.fill();
			context.closePath();
		}
			
		else if(obj.frames[obj.getFrame()]['type'] == 'rect')
		{
			context.fillStyle = "#" + obj.frames[obj.getFrame()]['color'];
			context.fillRect(x, y, obj.getWidth(), obj.getHeight());
		}
			
		else if(obj.frames[obj.getFrame()]['type'] == 'text')
		{
			context.fillStyle = "#" + obj.frames[obj.getFrame()]['color'];
			context.font = obj.frames[obj.getFrame()]['font'];
			context.fillText(obj.frames[obj.getFrame()]['text'], x, y + obj.getHeight());
		}
			
		else if(obj.frames[obj.getFrame()]['type'] == 'blank')
		{
		}
		
		else if(obj.frames[obj.getFrame()]['type'] == 'polygon')
		{
			context.fillStyle = "#" + obj.frames[obj.getFrame()]['color'];
			context.beginPath();
			context.moveTo(obj.getX() + obj.frames[obj.getFrame()].points[0][0] * obj.scale_x, obj.getY() + obj.frames[obj.getFrame()].points[0][1] * obj.scale_y);
			for(var i = 1; i < obj.frames[obj.getFrame()].points.length; i++)
			{
				context.lineTo(obj.getX() + obj.frames[obj.getFrame()].points[i][0] * obj.scale_x, obj.getY() + obj.frames[obj.getFrame()].points[i][1] * obj.scale_y);
			}
			context.closePath();
			context.fill();
		}
		else
			alert(obj.frames[obj.getFrame()]['type']);
			
		
		if(tempdraw)
		{
			context.globalCompositeOperation = 'source-atop';
			context.globalAlpha = obj.overlay[1];
			
			context.fillStyle = "#" + obj.overlay[0];
			context.fillRect(0, 0, obj.getWidth(), obj.getHeight());
		}
			
		context.restore();
	}
}

function decideoverlay(obj)
{
	if(obj.overlay[1] > 0 && obj.frames[obj.getFrame()].type != 'blank' && obj.alpha > 0 && _PovoleneEfekty['overlay']) // needs to draw overlaying color?
	{
		var overlayer = document.getElementById('overlayer');
		if(overlayer.width != obj.getWidth())
			overlayer.width = obj.getWidth();
		if(overlayer.height != obj.getHeight())
			overlayer.height = obj.getHeight();
		octx.clearRect(0, 0, obj.getWidth, obj.getHeight());
		
		draw(obj, octx, true); // prepare the object on the temporary canvas
		draw(obj, ctx, false, overlayer); // paste it back on main canvas
	}
	else
	{
		draw(obj, ctx);
	}
}

function drawloop()
{
	_looprun ++;
	var date = new Date;
	var zacalo = date.getTime();
	
	if(_cleanDraw)
		ctx.clearRect(0, 0, _plocha_px_width, _plocha_px_height);
	var ky = _kamera_y;
	var kx = _kamera_x;
	_kamera_x = 0;
	_kamera_y = 0;

	decideoverlay(_Background);

	_kamera_x = kx;
	_kamera_y = ky;

	for(var i = 0; i < _allObjects.length; i++)
	{
		decideoverlay(_allObjects[i]);
	}
	var ky = _kamera_y;
	var kx = _kamera_x;
	_kamera_x = 0;
	_kamera_y = 0;
	decideoverlay(_Flash);
	decideoverlay(_Overlayer);
	decideoverlay(_tvinner);
	_kamera_x = kx;
	_kamera_y = ky;
		
	date = new Date;
	var skoncilo = date.getTime();
	
	var maxms = 1000 / _drawFps - (skoncilo - zacalo); // ms until new loop run at max fps
		//alert(maxms+"\n"+(skoncilo - zacalo));
	var zakolko = 0;
	if(maxms > 0) // if possible fps is above the max, regulate it
		zakolko = 1000 / _drawFps - (skoncilo - zacalo);
	
	_fps.push(1000 / (zakolko + (skoncilo - zacalo)));
	_posfps.push(1000 / (skoncilo - zacalo));
	//alert((1000 / (zakolko + (skoncilo - zacalo))));
	if(_looprun == 20)
	{
		//alert(_fps);
		_looprun = 0;
		var sumfps = 0;
		for(var i = 0; i < _fps.length; i ++)
		{
			sumfps += _fps[i];
		}
		var avgfps = Math.round(sumfps / _fps.length);
		sumfps = 0;
		for(var i = 0; i < _posfps.length; i ++)
		{
			sumfps += _posfps[i];
		}
		var avgposfps = Math.round(sumfps / _posfps.length);
		_fps = [];
		_posfps = [];
		//document.getElementsByTagName('h1')[0].innerHTML = "fps: "+avgfps+" limit: "+_drawFps+' max: '+avgposfps;
	}
	setTimeout('drawloop()', zakolko);
}

function getIntervalPercent(min, max, percent)
{
	if(min > max)
	{
		var a = max;
		max = min;
		min = a;
	}
	var length = max - min;
	
	return (length * percent) + min;
}

function earthquake(snimkov, delay, minShake, maxShake)
{
	if(_PovoleneEfekty['earthquake'])
	{
		var delayed = 0;
		
		for(var i = 0; i < snimkov; i++)
		{
			var direction = ((i+1) % 2) == 1 ? 1 : -1;
			shake = getIntervalPercent(minShake, maxShake, i / snimkov) * direction;
			
			
//			if(i % 2) // shake X
//			{
				_Background.registerEvent(delay + delayed, "_kamera_x = "+(shake * -1), false, "earthquake");
				delayed += delay;
//			}
//			else // shake Y
//			{
				_Background.registerEvent(delay + delayed, "_kamera_y = "+shake, false, "earthquake");
				delayed += delay;
//			}
		}
		_Background.registerEvent(delay + delayed, "_kamera_x = 0; _kamera_y = 0;", false, "earthquake");
	}
}

function flash(snimkov, delay, farby, override)
{
	_Flash.max = 0;
	_Flash.alpha = 1;
	
	var colors = {
		'black': '000000',
		'aqua': '00ffff',
		'fuchsia': 'ff00ff',
		'gray': '808080',
		'white': 'ffffff',
		'red': 'ff0000',
		'lime': '00ff00',
		'yellow': 'ffff00',
		'teal': '008080',
		'silver': 'c0c0c0',
		'purple': '800080',
		'olive': '808000',
		'navy': '000080',
		'maroon': '800000',
		'green': '008000',
		'blue': '0000ff',
	}
	if(_PovoleneEfekty['flash'] && _paused !== true || _PovoleneEfekty['flash'] && override === true)
	{
		var delayed = 0;
		var poradie = 0;
		_Flash.removeEvents();
		
		for(var i = 0; i < snimkov; i++)
		{
			var farba = typeof(colors[farby[poradie]]) != 'undefined' ? colors[farby[poradie]] : farby[poradie];
			if(typeof(colors[farby[poradie]]) == 'undefined' && farby[poradie].length != 6 && farby[poradie] != 'blank')
				alert('neznama farba: '+ farby[poradie]);
		
			if(farby[poradie] == 'blank')
				_Flash.registerEvent(delay + delayed, "this.frames['default'].type = 'blank';", false, 'flash');
			else
				_Flash.registerEvent(delay + delayed, "this.frames['default'] = {'type': 'rect', 'color': '"+farba+"', 'width': _plocha_px_width, 'height': _plocha_px_height};", false, 'flash');
			poradie = poradie == farby.length - 1 ? 0 : poradie + 1; delayed += delay;
		}
		_Flash.registerEvent(delay + delayed, "this.frames['default'].type = 'blank';", false, 'flash');
		
	}
}

function znictext()
{
	var text = getObjectsByClass('_text');
	for(var i = 0; i < text.length; i++)
	{
		text[i].die();
	}
}

function measureText(co, font, frame)
{
	if(frame)
	{
		font = frame.font;
		co = frame.text;
	}
	ctx.save();
	ctx.font = font;
	var width = ctx.measureText(co).width;
	ctx.restore();
	
	return width;
}

function vypisFontom(co, x, y, font, farba, zIndex)
{
	co = co + "";
	
	var height = font.substr(0, font.indexOf('px')) * 1;
	
	var nove = new object('text'+numClass('_text'));
	nove.addClass('_text');
	
	nove.frames = [{'type': 'text', 'text': co, 'font': font, 'color': farba, 'width': measureText(co, font), 'height': height}];
	nove.setFrame(0);

	nove.changeText = function(text)
	{
		this.frames[this.getFrame()].text = text;
		this.setWidth(measureText(text, this.frames[this.getFrame()].font));
	}

	switch(x)
	{
		case 'center': x = (_plocha_px_width - nove.getWidth()) / 2; break;
		case 'left': x = 0; break;
		case 'right': x = _plocha_px_width - nove.getWidth(); break;
	}
	switch(y)
	{
		case 'center': y = (_plocha_px_height - height) / 2; break;
		case 'top': y = 0; break;
		case 'bottom': y = _plocha_px_height - height; break;
	}
	
	nove.setX(x);
	nove.setY(y);
	if(zIndex)
		nove.setZindex(zIndex);
		
	return nove;
}

function objectsInRect(x, y, width, height, onlyclass)
{
	width -= 2;
	height -= 2;
	x++;
	y++;
	
	vrat = new Array;
	
	if(typeof(onlyclass) != 'undefined')
	{
		if(typeof(_objectsByClass[onlyclass]) == 'undefined')
		{
			_objectsByClass[onlyclass] = getObjectsByClass(onlyclass);
		}
		for(var i = 0; i < _objectsByClass[onlyclass].length; i++)
		{
			obj = _objectsByClass[onlyclass][i];
			if(typeof(obj.frames[obj.getFrame()].area) == 'undefined')
			{
				oX = obj.getX();
				oW = obj.getWidth();
				oY = obj.getY();
				oH = obj.getHeight();
			}
			else
			{
				oX = obj.getX() + obj.frames[obj.getFrame()].area.x;
				oW = obj.frames[obj.getFrame()].area.width;
				oY = obj.getY() + obj.frames[obj.getFrame()].area.y;
				oH = obj.frames[obj.getFrame()].area.height;
			}
			if(Math.abs((oX + oW / 2) - (x + width / 2)) <= oW / 2 + width / 2 && Math.abs((oY + oH / 2) - (y + height / 2)) <= oH / 2 + height / 2)
				vrat.push(_objectsByClass[onlyclass][i]);
		}
	}
	
	else
	{
		for(var i = 0; i < _allObjects.length; i++)
		{
			obj = _allObjects[i];
			if(typeof(obj.frames[obj.getFrame()].area) == 'undefined')
			{
				oX = obj.getX();
				oW = obj.getWidth();
				oY = obj.getY();
				oH = obj.getHeight();
			}
			else
			{
				oX = obj.getX() + obj.frames[obj.getFrame()].area.x;
				oW = obj.frames[obj.getFrame()].area.width;
				oY = obj.getY() + obj.frames[obj.getFrame()].area.y;
				oH = obj.frames[obj.getFrame()].area.height;
			}
			if(Math.abs((oX + oW / 2) - (x + width / 2)) <= oW / 2 + width / 2 && Math.abs((oY + oH / 2) - (y + height / 2)) <= oH / 2 + height / 2)
				vrat.push(_allObjects[i]);
		}
	}
	
	return vrat;
}


function getObjectById(id)
{
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].id == id)
			return _allObjects[i];
	}
	
	return false;
}

function getObjectsByClass(what)
{
	if(typeof(_objectsByClass[what]) != 'undefined')
		return _objectsByClass[what];
		
	var vrat = new Array;
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].hasClass(what))
			vrat.push(_allObjects[i]);
	}
	
	return vrat;
}


function getImage(what)
{
	for(var i = 0; i < Images.length; i++)
	{
		if(Images[i]['name'] == what)
			return Images[i]['obj'];
	}
	alert('Unknown Image: '+ what);
	return false;
}

function _zindexSortFunction(a, b)
{
	return a.zindex > b.zindex;
}

function sortAllObj()
{
	var save = Object.prototype.toString;
	Object.prototype.toString = function () { return this.zindex; };
	
	_allObjects.sort();
	
	Object.prototype.toString = save;	
}