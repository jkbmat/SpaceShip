// povinne premenne
var enableDebug = false;

var _posun = 1;
var _fpsLimit = 60;
var _drawFps = 100; // POUZIVANE AKO LIMIT
var _cleanDraw = false;
var _scale = 1;
var _showFps = true;

var _plocha_width = 800;
var _plocha_height = 600;

var _plocha_px_width = _plocha_width * _posun;
var _plocha_px_height = _plocha_height * _posun;

var _okno_width = _plocha_width + 40;
var _okno_height = _plocha_height + 40;

var _kamera_x = 0;
var _kamera_y = 0;

var _okno_px_width = _okno_width * _posun;
var _okno_px_height = _okno_height * _posun;

var _PovoleneEfekty = {'flash': true, 'earthquake': true, 'sound': true};

var _pauseKey = 27;
var _paused = 0;

var _Background;

// funkcie

function init()
{
	window.onresize = _tvinner.recalibrate;
	
	document.getElementsByTagName("h1")[0].innerHTML = "&nbsp;";
	
	plocha = document.getElementById('plocha');
	plocha.width = _plocha_px_width;
	plocha.height = _plocha_px_height;
	plocha.style.width = '100%';
	plocha.style.height = '100%';
	plocha.style.marginBottom = "-15px";
	plocha.style.margin = "auto";
	plocha.style.position = 'relative';
	document.body.style.background = "#141414 url(tv.png) no-repeat";
	
	ctx = plocha.getContext('2d');
	
	var okno = document.getElementById("okno");
	okno.style.position = 'relative';
	okno.style.width = _plocha_px_width + "px";
	okno.style.height = _plocha_px_height + "px";
	
	debug = document.createElement('div');
	debug.style.width = '500 px';
	debug.style.height = '200 px';
	debug.style.overflow = "auto";
	okno.appendChild(debug);
	
	plocha = document.getElementById('plocha');
	
	_plocha_left = _plocha_top = 0;
	
	do {
		_plocha_left += plocha.offsetLeft;
		_plocha_top += plocha.offsetTop;
	} while (plocha = plocha.offsetParent)

	plocha = document.getElementById('plocha');
	tv = document.body.style;
	tv.backgroundPosition = (_plocha_left - 16 + "px " + (_plocha_top - 16)) + "px";
	
	drawloop();
	menuInit();
	mainInterval = setInterval('main();', 1000/_fpsLimit);
	//novaHra();
}

function pause(bool)
{
	if(bool && _paused !== 0) // zapauzuj
	{
	}
	else if(_paused == true) // odpauzuj
	{
	}
}

function menuInit()
{
	_allObjects = new Array;
	var titleimg = new object('titleimg');
	titleimg.frame = 0;
	titleimg.frames = [{'type': 'image', 'name': 'logo.png', 'width': 650, 'height': 371}];
	titleimg.setCenX(_plocha_px_width / 2); titleimg.setY(60);
	_Overlayer.resetmorph(1);
	_Overlayer.speed = -0.05;
	_Overlayer.max = 1;
	
	var play = new button_obj('Play', 'alphaTransitToPlay()');
	play.setCenX(_plocha_px_width / 2);
	play.setY(460);

	vypisFontom("Controls: MOUSE - movement; SPACE - shoot", "center", 540, "20px Arial", "aaaaaa", 10);
}

function alphaTransitToPlay()
{
	_Overlayer.completed = true;
	_Overlayer.speed = 0.1;
	_Overlayer.alpha = 0;
	
	_Background.registerEvent(500, "novaHra()", false, 'newgame');
}

function respawnShip()
{
	var spaceship = new spaceship_obj();
	spaceship.godmodeOn(3000);
}

function novaHra()
{
	_Overlayer.completed = true;
	_Overlayer.speed = -0.1;
	_Overlayer.alpha = 1;
	
	if(_paused)
	{
		return 0;
	}
	_allObjects = new Array;
		
	_paused = false;
	
	_Key['code'] = new Array;
	_Key['up'] = new Array;
	_Key['last'] = 0;
	
	var spaceship = new spaceship_obj();
	var as = new asteroid_obj();
	var as = new asteroid_obj();
	var as = new asteroid_obj();
	
	ctx.save();
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, _plocha_px_width, _plocha_px_height);
	ctx.restore();

	_Background.shipHP = 3;

	for(var i = 0; i < _Background.shipHP; i++)
	{
		var hpobj = new healthdisplay_obj();
	}
}