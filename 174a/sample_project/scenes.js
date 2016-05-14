function initializeScenes(anim)
{
  initializeStartGameScene(anim);
  initializeMoveOttoScene(anim);
}

function initializeStartGameScene(anim)
{
  anim.sceneManager.addScene("start_game", 200, anim.graphicsState.camera_transform, function (anim, currTime) {
    anim.graphicsState.camera_transform = this.prescene_camera;
    for(var i = 0; i < currTime; i++)
    {
      if(i < 110)
      {
        anim.graphicsState.camera_transform = mult( translation( 0, -0.15, 0.15 ), anim.graphicsState.camera_transform  );
        anim.graphicsState.camera_transform = mult( rotation( 0.3, 1, 0, 0 ), anim.graphicsState.camera_transform  );
      }else{
        anim.graphicsState.camera_transform = mult( translation( 0, 0.025, 0.0725 ), anim.graphicsState.camera_transform  );
      }
    }
  });
  anim.sceneManager.requestPlay("start_game");
}

var velocityX = 0, velocityY = 0.2;
var gravity = -0.02;
var timeRequired = -2 * velocityY/gravity;
function initializeMoveOttoScene(anim)
{
    anim.sceneManager.addScene("move_otto", timeRequired, undefined, function (anim, currTime) {
    var positionY = 0.5 * gravity * currTime * currTime + velocityY * currTime;

    var positionX = currTime/timeRequired;
    var positionZ = currTime/timeRequired;

    var x_mult_factor = 0;
    var z_mult_factor = 0;

    switch (anim.ottoGame.currentOttoDirection) {
      case Direction.up:
        z_mult_factor = 1.05;
        break;
      case Direction.down:
        z_mult_factor = -1.05;
        break;
      case Direction.left:
        x_mult_factor = 1.05;
        break;
        case Direction.right:
        x_mult_factor = -1.05;
        break;
      default:
        console.log("invalid direction: " + ottoDirection);
    }

    anim.otto_model_transform = mult(anim.otto_model_transform, translation( positionX * x_mult_factor, positionY, positionZ * z_mult_factor));

    if(currTime == timeRequired)
    {
      var result = anim.ottoGame.moveOtto(
        anim.ottoGame.currentOttoLocation[0] + (x_mult_factor | 0),
        anim.ottoGame.currentOttoLocation[1] + (z_mult_factor | 0)
      );

      if(result != 0)
      {
		if(result == 1)
		{
			// level up or win
			anim.ottoGame.reportWin();
		}else{
			// you lost screen
			anim.ottoGame.reportLoss();
		}
        anim.ottoGame.playing = false;
        return result;
      }

      setTimeout(function(){
        anim.ottoGame.currentOttoDirection = anim.ottoGame.nextOttoDirection;
        anim.sceneManager.forcePlay("move_otto");
      }, anim.ottoGame.getOttoSpeed());
    }
  });
  anim.sceneManager.requestPlay("move_otto");
  //anim.sfx.play("level_theme");
}


function initializeMoveKokoScene(anim, index)
{
    var name = "move_koko" + index;
    anim.sceneManager.addScene(name, timeRequired, undefined, function (anim, currTime) {
    var positionY = 0.5 * gravity * currTime * currTime + velocityY * currTime;

    var positionX = currTime/timeRequired;
    var positionZ = currTime/timeRequired;

    var x_mult_factor = 0;
    var z_mult_factor = 0;

    var nextDir = anim.tempKokoData.dir;

    switch (nextDir) {
      case Direction.up:
        z_mult_factor = 1.05;
        break;
      case Direction.down:
        z_mult_factor = -1.05;
        break;
      case Direction.left:
        x_mult_factor = 1.05;
        break;
        case Direction.right:
        x_mult_factor = -1.05;
        break;
      default:
        console.log("invalid direction: " + ottoDirection);
    }

    anim.tempKokoMT = mult(anim.tempKokoMT, translation( positionX * x_mult_factor, positionY, positionZ * z_mult_factor));

    if(currTime == timeRequired)
    {
      var result = anim.ottoGame.moveKoko(anim.tempKokoData.coord[0], anim.tempKokoData.coord[1], nextDir);

      if(result != 0)
      {
		if(result == -1)
		{
			// level up or win
			anim.ottoGame.reportWin();
		}else{
			// you lost screen
			anim.ottoGame.reportLoss();
		}
        anim.ottoGame.playing = false;
        return result;
      }

      setTimeout(function(){
        anim.sceneManager.forcePlay(name);
      }, anim.ottoGame.getOttoSpeed());
    }
  });
  anim.sceneManager.requestPlay(name);
}
