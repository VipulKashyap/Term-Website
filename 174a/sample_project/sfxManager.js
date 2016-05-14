var SFXManager = function()
{
  var soundLoc = ["jump", "level_theme", "title_theme", "won", "lost", "powerup"];
  this.sounds = {};
  for(var key in soundLoc)
  {
    this.sounds[soundLoc[key]] = new Audio("./sfx/" + soundLoc[key] + ".mp3");
  }
debugger;
  this.sounds["level_theme"].addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);

  this.sounds["title_theme"].addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
}

SFXManager.prototype.play = function(name)
{
  this.sounds[name].currentTime = 0;
  this.sounds[name].play();
}

SFXManager.prototype.stop = function(name)
{
  this.sounds[name].pause();
  this.sounds[name].currentTime = 0;
}

SFXManager.prototype.stopAll = function()
{
  var keys = Object.keys(this.sounds);
  for(var key in keys)
  {
    this.stop(keys[key]);
  }
}
