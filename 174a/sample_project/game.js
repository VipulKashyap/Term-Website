// Materials: Declare new ones as needed in every function.
// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
		greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ),
		shinyYellowPlastic = new Material( vec4( 1, 1, 0, 1 ), 0.7, 0.7, 0.9, 100 ),
		ottoMaterial = new Material( vec4( 0.98039215686, 0.98039215686, 0.21568627451, 1 ), 0.7, 0.7, 0.9, 100 ),
		sky = new Material(vec4( .5,.5,.5,1 ), 0.7, 0.9, 0.9, 20, "sky.png" ),
    kokoMaterial = new Material(vec4( 0.7, 0.1, 0.1, 1 ), 0.4, 0.3, 0.3, 40, "koko.png" ),
    kokoBodyMaterial = new Material(vec4( 0.5, 0.2, 0.2, 1 ), 0.4, 0.3, 0.3, 40, "kokoBody.png" ),
		heartMaterial = new Material( vec4( 1, 0, 0,1 ), .5, 1, .5, 40 ),
		starMaterial = new Material(vec4( .5,.5,.5,1 ), 0.6, 0.3, 0.7, 20, "star2.png" ),
		notJumpedBlockPlastic = new Material( vec4( 0.8, 0.4, 0.8, 1 ), 0.8, 2.5, 4,  20 ),
		jumpedBlockPlastic = new Material( vec4( 0.2, 0.9, 0.4, 1 ), 0.8, 2.5, 4,  20 ),
		blackPlastic = new Material( vec4( 0, 0, 0, 1 ), 0.3, 1, 40,  20 );

var Direction = {up: 0, down: 180, right: 270, left: 90};

var Game = function (anim) {
  this.anim = anim;
  this.levelList = [];
  this.currentLevel = 0;

  this.currLevelData = undefined;

  this.currentOttoLocation = [0, 0];

  this.currentOttoDirection = Direction.up;
  this.nextOttoDirection = Direction.up;

  this.score = 0;

  this.state = "playing";
  this.playing = false;

  this.bigMessage = "";
};

Game.prototype.startPlaying = function() {
	this.playing = true;
	this.anim.sfx.stopAll();
	this.state = "playing";
	this.anim.sfx.play("level_theme");
	this.anim.sceneManager.requestPlay("move_otto");
}

Game.prototype.reportWin = function(){
	this.state = "win";
	this.currLevelData = undefined;

	this.currentOttoDirection = Direction.up;
	this.nextOttoDirection = Direction.up;

	if(this.levelList.length == this.currentLevel + 1)
	{
		this.bigMessage = "You Won!!!"
	}else{
		this.currentLevel++;
		this.bigMessage = "Level " + (this.currentLevel + 1);
		var that = this;
		this.anim.sfx.stopAll();
		this.anim.sfx.play("won");
		this.anim.sceneManager.requestPlay("start_game");
		setTimeout(function(){
			that.bigMessage = "";
			that.startPlaying();
		}, 4000);
	}
};

Game.prototype.reportLoss = function(){
	this.state = "lost";

	this.currentOttoDirection = Direction.up;
	this.nextOttoDirection = Direction.up;

	this.bigMessage = "Game Over!"
	this.anim.introstring = "'P' to play again!";

	this.anim.sfx.stopAll();
	this.anim.sfx.play("lost");
};

Game.prototype.resetGame = function(){
	this.currLevelData = undefined;
	this.currentLevel = 0;
	this.bigMessage = "";
	this.currentOttoLocation = [0, 0];

	this.currentOttoDirection = Direction.up;
	this.nextOttoDirection = Direction.up;

	this.score = 0;

	this.startPlaying();
}

String.prototype.replaceAt = function(index, char) {
    return this.substr(0, index) + char + this.substr(index + char.length);
};

Game.prototype.getOttoSpeed = function () {
	var speed = 210 - this.currentLevel * 10;
	if(speed < 50)
		return 50;
	return speed;
};

Game.prototype.moveOtto = function (locX, locY) {
  if(locY < 0 || this.currLevelData.blockMap.length <= locY
      || locX < 0 || this.currLevelData.blockMap[0].length <= locX)
  {
    return -1;
  }

	var temp = this.currLevelData.objIndex[getGridLocationKey(locX, locY)];
	if(temp){
		switch (temp) {
			case "S":
				this.score += 100;
				this.currLevelData.objIndex[getGridLocationKey(locX, locY)] = " ";
				this.anim.sfx.play("powerup");
				break;
			case "K":
				return -1;
				break;
			case " ":
				break;
			default:
				console.log("idk what is just encountered: " + this.currLevelData.objIndex[getGridLocationKey(locX, locY)]);
				break;
		}
	}

	this.currentOttoLocation = [locX, locY];
  switch(this.currLevelData.blockMap[locY][locX])
  {
		case "B":
    	this.score += 10;
    	this.currLevelData.blockMap[locY] = this.currLevelData.blockMap[locY].replaceAt(locX, "J");
			this.currLevelData.blocksToJump--;
			if(this.currLevelData.blocksToJump == 0)
				return 1;
			break
    case " ":
      return -1;
  }

	this.anim.sfx.play("jump");
  return 0;
};

Game.prototype.kokoMoveAllowed = function (oldX, oldY, dir)
{
	var newCoords = getCoordInDir(oldX, oldY, dir);
	locX = newCoords[0];
	locY = newCoords[1];

	if(locY < 0 || this.currLevelData.blockMap.length <= locY
			|| locX < 0 || this.currLevelData.blockMap[0].length <= locX)
	{
		return false;
	}

	var temp = this.currLevelData.objIndex[getGridLocationKey(locX, locY)];
	if(temp){
		switch (temp) {
			case "K":
				return false;
				break;
		}
	}

	if(this.currLevelData.blockMap[locY][locX] == " ")
		return false;

	return true;
}

function getCoordInDir(oldX, oldY, dir)
{
	var locX = oldX, locY = oldY;
	switch (dir) {
		case Direction.up:
			locY++;
			break;
		case Direction.down:
			locY--;
			break;
		case Direction.left:
			locX++;
			break;
		case Direction.right:
			locX--;
			break;
	}
	return [locX, locY];
}

Game.prototype.moveKoko = function (oldX, oldY, dir)
{
	var newCoords = getCoordInDir(oldX, oldY, dir);
	locX = newCoords[0];
	locY = newCoords[1];

	if(this.currentOttoLocation[0] == locX && this.currentOttoLocation[1] == locY)
		return 1;

	for(var ind in this.currLevelData.kokoData)
	{
			if(this.currLevelData.kokoData[ind].coord[0] == oldX && this.currLevelData.kokoData[ind].coord[1] == oldY)
			{
				if(!this.kokoMoveAllowed(oldX, oldY, dir))
				{
					this.currLevelData.kokoData[ind].dir = (dir + 90) % 360;
					return 0;
				}

				this.currLevelData.kokoData[ind].coord = [locX, locY];

				this.currLevelData.objIndex[getGridLocationKey(locX, locY)] = "K";

				if(!(delete this.currLevelData.objIndex[getGridLocationKey(oldX, oldY)]))
						this.currLevelData.objIndex[getGridLocationKey(oldX, oldY)] = " ";


				var nextDir = this.currLevelData.kokoData[ind].dir;
				if(getRandomDirection() == 90)
					nextDir = getRandomDirection();

				var foundValidDir = false;
				for(var i = 0; i < 8; i++){
		      if(this.kokoMoveAllowed(locX, locY, nextDir)){
						foundValidDir = true;
						break;
					}
					nextDir = (nextDir + 90) % 360;
		    }

				if(foundValidDir)
				{
					this.currLevelData.kokoData[ind].dir = nextDir;
				}

				return 0;
			}
	}

	return -1;
}

Game.prototype.addLevel = function (lev) {
  this.levelList[this.levelList.length] = lev;
};

Game.prototype.initializeCurrentLevelData = function(anim){
	this.currLevelData = {};
  this.currLevelData.blockMap = this.levelList[this.currentLevel].blockMap.slice();
  this.currLevelData.objIndex = JSON.parse(JSON.stringify(this.levelList[this.currentLevel].objIndex));
	this.currentOttoLocation = this.levelList[this.currentLevel].startLoc.slice();
	this.currLevelData.blocksToJump = this.levelList[this.currentLevel].blocksToJump;
	this.currLevelData.kokoData = [];
	for(var key in this.currLevelData.objIndex)
	{
		if(this.currLevelData.objIndex[key] == "K")
		{
			var coord = key.split("-");
			this.currLevelData.kokoData[this.currLevelData.kokoData.length] = {"coord": [parseInt(coord[0]), parseInt(coord[1])], "dir": getRandomDirection()};
		}
	}

	for(var key in this.currLevelData.kokoData )
	{
		initializeMoveKokoScene(anim, key);
	}

	this.currentOttoDirection = Direction.up;
	this.nextOttoDirection = Direction.up;
}

Game.prototype.render = function (anim, model_transform){
  if(!this.currLevelData)	// First time rendering this level
  {
	this.initializeCurrentLevelData(anim);
  }
  this.levelList[this.currentLevel].renderLevel(this.currLevelData, anim, this, model_transform);
};

function getGridLocationKey (x, y) {
	return x + "-" + y;
}

function getRandomDirection () {
	return Math.floor((Math.random() * 4)) * 90;
}

var Level = function (blockMap) {
	this.objIndex = {};
	this.kokoIndex = {};
	this.startLoc = [0, 0];
	this.blocksToJump = 0;

  var newBlockMap = [];
	// var buff = "";
	// for(var i = 0; i < blockMap[0].length + 2; i++)
	// {
	// 	buff += " ";
	// }
	// newBlockMap[0] = buff;
  // for(var y = 0; y < blockMap.length; y++)
  // {
	// 	newBlockMap[newBlockMap.length] = " " + blockMap[y] + " ";
	// }
	// newBlockMap[newBlockMap.length] = buff;
	// blockMap = newBlockMap;
	// newBlockMap = [];

  for(var y = 0; y < blockMap.length; y++)
  {
		newBlockMap[y] = "";
    for(var x = 0; x < blockMap[y].length; x++)
		{
			switch (blockMap[y][x]) {
				case " ":
					newBlockMap[y] += " ";
					break;
				case "O":
					this.startLoc = [x, y];
					newBlockMap[y] += "B";
					this.blocksToJump++;
					break;
				case "S":
				case "K":
					this.objIndex[getGridLocationKey(x, y)] = blockMap[y][x];
					newBlockMap[y] += "B";
					this.blocksToJump++;
					break;
				case "B":
				case "J":
					newBlockMap[y] += "B";
					this.blocksToJump++;
					break;
				default:
					newBlockMap[y] += "B";
					this.blocksToJump++;
					break;
			}
		}
	}

	this.blockMap = newBlockMap;
};

Level.prototype.renderLevel = function (currLevelData, anim, game, model_transform) {
  var stack = [];

  // Center level map
  stack.push(model_transform);
  model_transform = mult( model_transform, translation( -(this.blockMap.length)/2, 0, -(this.blockMap[0].length)/2 ) );

	// Draw out level
  var otto_loc, cam_loc;
  for(var y = 0; y < this.blockMap.length; y++)
  {
    stack.push(model_transform);
    for(var x = 0; x < this.blockMap[y].length; x++)
    {
      if(game.currentOttoLocation[0] == x && game.currentOttoLocation[1] == y && game.state != "lost")
      {
        anim.otto_model_transform = mult( model_transform, translation( 0, 1, 0 ) );
        if(game.playing)
          anim.sceneManager.tickScene("move_otto");
        anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/2, 1/2, 1/2 ) );
        otto_loc = vec3(anim.otto_model_transform[0][3], anim.otto_model_transform[1][3], anim.otto_model_transform[2][3]);
        cam_loc = vec3(anim.otto_model_transform[0][3], anim.otto_model_transform[1][3] + 6, anim.otto_model_transform[2][3] - 8);
      }

      switch (currLevelData.blockMap[y][x]) {
        case "J":
          anim.m_cube.draw( anim.graphicsState, model_transform, jumpedBlockPlastic );
          break
        case "B":
          anim.m_cube.draw( anim.graphicsState, model_transform, notJumpedBlockPlastic );
          break;
        default:
      }

			var temp = currLevelData.objIndex[getGridLocationKey(x, y)];
			if(temp){
				switch (temp) {
					case "S":
						stack.push(model_transform);
						model_transform = mult( model_transform, translation( 0, 1, 0 ) );
						model_transform = mult( model_transform, rotation(Date.now()/20 , 0, 1, 0 ) );
						anim.m_star.draw( anim.graphicsState, model_transform, starMaterial );
						model_transform = stack.pop();
						break;
					case "K":
						stack.push(model_transform);
						for(var key in currLevelData.kokoData)
						{
							if(currLevelData.kokoData[key].coord[0] == x && currLevelData.kokoData[key].coord[1] == y)
							{
								anim.tempKokoData = currLevelData.kokoData[key];
								anim.tempKokoMT = model_transform;
			         	if(game.playing)
			          	anim.sceneManager.tickScene("move_koko" + key);
								model_transform = anim.tempKokoMT;
								model_transform = mult(model_transform, rotation( currLevelData.kokoData[key].dir, 0, 1, 0));
								model_transform = mult( model_transform, translation( 0, 1, 0 ) );
								game.drawKoko(anim, 0.08 * Math.sin(Date.now()/80), model_transform);
								break;
							}
						}
						model_transform = stack.pop();
						break;
					case " ":
						break;
					default:
						console.log("idk what is just encountered: " + currLevelData.objIndex[getGridLocationKey(x, y)]);
						break;
				}
			}

      model_transform = mult( model_transform, translation( 1.05, 0, 0 ) );
    }
    model_transform = stack.pop();
    model_transform = mult( model_transform, translation( 0, 0, 1.05 ) );
  }
  model_transform = stack.pop();

  if(game.state == "lost")
  {
    anim.otto_model_transform = mult( anim.otto_model_transform, translation( 0, -1, 0 ) );
    otto_loc = vec3(anim.otto_model_transform[0][3], anim.otto_model_transform[1][3], anim.otto_model_transform[2][3]);
    cam_loc = vec3(anim.otto_model_transform[0][3], anim.otto_model_transform[1][3] + 6, anim.otto_model_transform[2][3] - 8);
  }

  if(game.playing)
  {
    anim.graphicsState.camera_transform = lookAt( cam_loc, otto_loc, vec3(0, 1, 0) );
  }

  if(anim.otto_model_transform)
  {
		game.drawOtto(anim);
  }else{
    console.error("You didn't draw an Otto :(");
  }
};

Game.prototype.drawOtto = function (anim) {
	var stack = [];
	anim.otto_model_transform = mult(anim.otto_model_transform, rotation( this.currentOttoDirection, 0, 1, 0));
	anim.m_otto.draw( anim.graphicsState, anim.otto_model_transform, ottoMaterial );

	stack.push(anim.otto_model_transform);
	anim.otto_model_transform = mult( anim.otto_model_transform, translation( 0.4, 0.4, 0.5 ) );
	anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/6, 1/4, 1/6 ) );
	anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, blackPlastic );
	anim.otto_model_transform = stack.pop();

	stack.push(anim.otto_model_transform);
	anim.otto_model_transform = mult( anim.otto_model_transform, translation( -0.4, 0.4, 0.5 ) );
	anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/6, 1/4, 1/6 ) );
	anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, blackPlastic );
	anim.otto_model_transform = stack.pop();

	// if(game.currentOttoDirection == "up" || game.currentOttoDirection == "down")
	if(this.currentOttoDirection % 180 == 0)
	{
		stack.push(anim.otto_model_transform);
		anim.otto_model_transform = mult( anim.otto_model_transform, translation( -0.5, -0.9, 0.5 ) );
		anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/4, 1/6, 1/6 ) );
		anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, shinyYellowPlastic );
		anim.otto_model_transform = stack.pop();

		stack.push(anim.otto_model_transform);
		anim.otto_model_transform = mult( anim.otto_model_transform, translation( 0.5, -0.9, 0.5 ) );
		anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/4, 1/6, 1/6 ) );
		anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, shinyYellowPlastic );
		anim.otto_model_transform = stack.pop();
	}else{
		stack.push(anim.otto_model_transform);
		anim.otto_model_transform = mult( anim.otto_model_transform, translation( -0.5, -1, 0.2 ) );
		anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/4, 1/6, 1/6 ) );
		anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, shinyYellowPlastic );
		anim.otto_model_transform = stack.pop();

		stack.push(anim.otto_model_transform);
		anim.otto_model_transform = mult( anim.otto_model_transform, translation( 0.5, -1, 0.2 ) );
		anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/4, 1/6, 1/6 ) );
		anim.m_sphere.draw( anim.graphicsState, anim.otto_model_transform, shinyYellowPlastic );
		anim.otto_model_transform = stack.pop();
	}

	var tempAngle = 8 * Math.sin(Date.now()/1000);
	anim.otto_model_transform = mult( anim.otto_model_transform, translation( 0, 1, 0 ) );
	anim.otto_model_transform = mult( anim.otto_model_transform, scale( 1/15, 1/10, 1/15 ) );
	for (var i = 0; i < 8; i++) {
		anim.otto_model_transform = mult(anim.otto_model_transform, translation(0, 0.5, 0));
		anim.otto_model_transform = mult(anim.otto_model_transform, rotation(tempAngle, 1, 0, 1));
		anim.otto_model_transform = mult(anim.otto_model_transform, translation(0, 0.5, 0));

		stack.push(anim.otto_model_transform);
		anim.otto_model_transform = mult( anim.otto_model_transform, rotation( 90, 1, 0, 0 ) );
		anim.m_cylinder.draw( anim.graphicsState, anim.otto_model_transform, blackPlastic );
		anim.otto_model_transform = stack.pop();
	}
	anim.otto_model_transform = mult( anim.otto_model_transform, rotation( 90, 0, 1, 0 ) );
	anim.otto_model_transform = mult( anim.otto_model_transform, scale( 6, 4, 6 ) );
	anim.m_heart.draw( anim.graphicsState, anim.otto_model_transform, heartMaterial );
}

Game.prototype.drawKoko = function (anim, stretch, model_transform)
{
	var stack = [];

	stack.push(model_transform);
	model_transform = mult( model_transform, translation( 0, -0.1 + stretch/2, 0 ) );

	// Draw koko body
	stack.push(model_transform);
	model_transform = mult( model_transform, scale( .2, 0.7 + stretch, .2 ) );
	model_transform = mult( model_transform, rotation( 90, 1, 0, 0 ) );
	anim.m_cylinder.draw( anim.graphicsState, model_transform, kokoBodyMaterial );
	model_transform = stack.pop();

	// Draw koko head
	model_transform = mult( model_transform, translation( 0, 0.2 + stretch, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( .6, .7, .6 ) );
	anim.m_pyramid.draw( anim.graphicsState, model_transform, kokoMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, 0.7, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.3, 0.3, 0.3 ) );
	model_transform = mult( model_transform, rotation( 180, 0, 0, 1 ) );
	anim.m_pyramid.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, -1 - stretch/2, 0 ));

	// Draw hands
	stack.push(model_transform);

	model_transform = mult( model_transform, translation( 0.18, 0, 0.05 ) );
	model_transform = mult( model_transform, rotation( 95 + 6 * Math.sin(Date.now()/100), 0, 0, 1 ) );
	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.05, 0.3, 0.05 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );
	model_transform = mult( model_transform, rotation( 60 + 6 * Math.sin(Date.now()/100), 0, 0, 1 ) );
	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.05, 0.3, 0.05 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, -0.13, 0 ) );
	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.08, 0.05, 0.08 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = stack.pop();
	stack.push(model_transform);

	model_transform = mult( model_transform, translation( -0.18, 0, 0.05 ) );
	model_transform = mult( model_transform, rotation( -(95 + 6 * Math.sin(Date.now()/100)), 0, 0, 1 ) );
	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.05, 0.3, 0.05 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );
	model_transform = mult( model_transform, rotation( -(60 + 6 * Math.sin(Date.now()/100)), 0, 0, 1 ) );
	model_transform = mult( model_transform, translation( 0, -0.15, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.05, 0.3, 0.05 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = mult( model_transform, translation( 0, -0.13, 0 ) );

	stack.push(model_transform);
	model_transform = mult( model_transform, scale( 0.08, 0.05, 0.08 ) );
	anim.m_cube.draw( anim.graphicsState, model_transform, heartMaterial );
	model_transform = stack.pop();

	model_transform = stack.pop();

	model_transform = stack.pop();
}
