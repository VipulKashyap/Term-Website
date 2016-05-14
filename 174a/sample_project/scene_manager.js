var Scene = function (name, tickCount, pcamera, runner, timeDependant) {
  this.name = name;
  this.tickCount = tickCount;
  this.prescene_camera = pcamera;
  this.runner = runner;
  this.timeDependant = timeDependant;

  this.tickTimer = 0;
};

Scene.prototype.runScene = function (animation, tickImpact = 1) {
  if(this.timeDependant)
  {
    if(this.tickTimer < tickImpact && this.tickTimer != 0)
    {
      this.tickTimer = 0;
      this.runner(animation, this.tickCount - this.tickTimer);
      return true;
    }

    if(this.tickTimer >= tickImpact){
      this.tickTimer -= tickImpact;
      this.runner(animation, this.tickCount - this.tickTimer);
      return true;
    }
    return false;
  }else{
    for(var i = 0; i < tickImpact; i++)
    {
      if(this.tickTimer > 0){
        this.tickTimer--;
        this.runner(animation, this.tickCount - this.tickTimer);
        return true;
      }
    }
  }
  return false;
};

var SceneManager = function (animation) {
  this.sceneList = {};
  this.animation = animation;
};

SceneManager.prototype.addScene = function (name, tickCount, pcamera, runner, timeDependant = true)   {
  this.sceneList[name] = new Scene(name, tickCount, pcamera, runner, timeDependant) ;
};

SceneManager.prototype.forcePlay = function (name) {
  this.sceneList[name].tickTimer = this.sceneList[name].tickCount;

  if(this.sceneList[name].prescene_camera)
    this.animation.graphicsState.camera_transform = this.sceneList[name].prescene_camera;
}

SceneManager.prototype.requestPlay = function (name) {
  if(this.sceneList[name].tickTimer > 0) // Scene already playing
    return;

  this.forcePlay(name);
};

SceneManager.prototype.stopPlay = function (name) {
  if(this.sceneList[name].tickTimer > 0) // Scene already playing
  {
	 this.sceneList[name].tickTimer = 0; 
  }
};

SceneManager.prototype.playAllRequested = function () {
  for(i in this.sceneList)
    this.sceneList[i].runScene(this.animation);
};

SceneManager.prototype.tickScene = function (name) {
  var timesToTick = (this.animation.animation_delta_time * 60/1000);
  return this.sceneList[name].runScene(this.animation, timesToTick);
};

SceneManager.prototype.getScene = function (name) {
  return this.sceneList[name];
};
