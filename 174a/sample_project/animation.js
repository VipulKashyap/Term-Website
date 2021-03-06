// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "star2.png", "text.png", "sky.png", "koko.png", "kokoBody.png" ];

// *******************************************************
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self)
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );

		gl.clearColor( 0, 0, 0, 1 );			// Background color

		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );

		self.m_cube = new cube();
		self.m_star = new star();
		self.m_heart = new shape_from_file( "heart.obj" )
		// self.m_obj = new shape_from_file( "teapot.obj" )
		// self.m_rcube = new shape_from_file( "rounded_cube.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );
		self.m_pyramid = new pyramid();
		self.m_otto = new otto();
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );

		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, -4,-40), perspective(45, canvas.width/canvas.height, 0.1, 1000), 0 );
		self.graphicsState.camera_transform = mult( translation( 13, 0, 3 ), self.graphicsState.camera_transform );
		self.graphicsState.camera_transform = mult( rotation( 20, 0, 1, 0 ), self.graphicsState.camera_transform );

		// Create sfx manager
		self.sfx = new SFXManager();
		self.sfx.play("title_theme");

		// Create scene manager
		self.sceneManager = new SceneManager(self);
		initializeScenes(self);

		// Start new game
		self.ottoGame = new Game(self);

		self.ottoGame.addLevel(
			new Level([
				"OBBBBB",
				"BBBBBB",
				"BBSBBB",
				"BBBBKB",
				"BBBBBB",
			])
		);

		self.ottoGame.addLevel(
			new Level([
				"OBBB         BBBB",
				"BBBBBBBBBBBBBBBSB",
				"BBBBBBBBBBBBBBBBB",
				"BBBB    B    BBBB",
				" BB     B     BB ",
				" BB     B     BB ",
				" BB    BBB    BB ",
				" BBBBBBBKBBBBBBB ",
				" BB    BBB    BB ",
				" BB     B     BB ",
				" BB     B     BB ",
				"BBBB    B    BBBB",
				"BBBBBBBBKBBBBBBBB",
				"BKBBBBBBBBBBBBBKB",
				"BBBB         BBBB",
			])
		);

		self.introstring = "Press 'P' to play!";
		self.ottoGame.playing = false;

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);

		self.context.render();

	} ) ( this );

	canvas.addEventListener('mousemoves', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	var that = this;
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );

	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );

	shortcut.add("up",	function(){ that.ottoGame.nextOttoDirection = Direction.up; });
	shortcut.add("down",	function(){ that.ottoGame.nextOttoDirection = Direction.down; });
	shortcut.add("left",	function(){ that.ottoGame.nextOttoDirection = Direction.left; });
	shortcut.add("right",	function(){ that.ottoGame.nextOttoDirection = Direction.right; });
	shortcut.add( "p",     function() {
		that.ottoGame.playing = !that.ottoGame.playing;
		that.sceneManager.stopPlay("start_game");
		that.sfx.stop("title_theme");
		that.introstring = "";
		if(that.ottoGame.state == "lost") {
			 that.ottoGame.resetGame();
			 return;
		}
		if(that.ottoGame.playing){
			 that.ottoGame.startPlaying();
		}
	});

}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;

		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

//
// // Materials: Declare new ones as needed in every function.
// // 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
// var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
// 		greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ),
// 		shinyYellowPlastic = new Material( vec4( 1, 1, 0, 1 ), 0.7, 0.7, 0.9, 100 ),
// 		sky = new Material(vec4( .5,.5,.5,1 ), 0.7, 0.9, 0.9, 20, "sky.gif" ),
// 		notJumpedBlockPlastic = new Material( vec4( 0.8, 0.4, 0.8, 1 ), 0.3, 1, 40,  20 );

// *******************************************************
// display(): called once per frame, whenever OpenGL decides it's time to redraw.
var lastFrameCalcTime = Date.now();
var frameCount = 0;

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;

		update_camera( this, this.animation_delta_time );

		this.sceneManager.tickScene("start_game");

		this.basis_id = 0;

		var model_transform = mat4();

		/**********************************
		Start coding here!!!!
		**********************************/

		this.ottoGame.render(this, model_transform);

		// Draw skybox
		model_transform = mult( model_transform, scale( 40, 40, 40 ) );
		this.m_sphere.draw( this.graphicsState, model_transform, sky );

		// FPS calculation code
		frameCount++;
		if(Date.now() - lastFrameCalcTime > 1000)
		{
	    	this.graphicsState.fps = frameCount;
				frameCount = 0;
		  	lastFrameCalcTime = Date.now();
		}
	}


Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	// debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	// debug_screen_strings.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	// debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	// debug_screen_strings.string_map["thrust"] = "Thrust: " + thrust;
	debug_screen_strings.string_map["intro"] = this.introstring;
	debug_screen_strings.string_map["fps"] = "FPS: " + this.graphicsState.fps;
	debug_screen_strings.string_map["level"] = "Level: " + (this.ottoGame.currentLevel + 1);
	debug_screen_strings.string_map["score"] = "Score: " + this.ottoGame.score;
	debug_screen_strings.string_map["bigMessage"] = this.ottoGame.bigMessage;
}
