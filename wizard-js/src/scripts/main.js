"use strict"; //Wizard game setup file.
//Should allow for multiple game instances on one page even though it isn't practical
const FRAME_RATE = 1000/60;
var fps = 0;
var framesSinceLastSecond = 0;
var nextSecond;

var frameStart = 0;

function WizardGameInstance(canvas) {
  /**@type {HTMLCanvasElement} */
  this.canvas = canvas;
  /**@type {CanvasRenderingContext2D} */
  this.context2d = this.canvas.getContext("2d");

  /**@type {WizardGameLevel} */
  this.level = null;

  /**@type {Input} */
  this.input = new Input(canvas);

  this.paused = false;
  this.startup();
  

  //apparently, Firefox is allowed to just add a 10ms delay between intervals which bumps the framerate down from 60 to 40.
  //Firefox also seems to take longer to take longer to process each frame. Not sure why.
  if (navigator.userAgent.indexOf("Firefox") > -1) {
    setInterval((e)=>{this.main(e)}, FRAME_RATE-10);
  } else {
    //we need to create a new function here for some reason... Otherwise it executes main with the Window as "this".
    setInterval((e)=>{this.main(e)}, FRAME_RATE);
  }
}

WizardGameInstance.prototype.startup = function() {
  //canvas.width = canvas.offsetWidth;
  //canvas.height = canvas.offsetHeight;
  this.canvas.width = 600;
  this.canvas.height = 400;

  //TEMP
  this.level = new EndlessLevel(this);
  this.level.camera.setWidth(this.canvas.width);
  this.level.camera.setHeight(this.canvas.height);

  nextSecond = Date.now()+1000;
};
WizardGameInstance.prototype.main = function(e) {
  if (this.input.key(27)===Input.PRESSED) {
    this.paused = !this.paused;
  }
  //frameStart = Date.now();
  if (this.level!=null) {
    if (!this.paused) {
      this.level.act(); 
      this.level.draw();
      this.drawFrameRate();
    } else {
      this.level.draw();
      this.drawFrameRate();
      this.drawPauseScreen();
    }  
    
  }
  //console.log("FrameTime: " + (Date.now()-frameStart));
  framesSinceLastSecond++;
  if (Date.now()>=nextSecond) {
    fps = framesSinceLastSecond;
    framesSinceLastSecond = 0;
    nextSecond+=1000;
  }
};
WizardGameInstance.prototype.drawPauseScreen = function () {
  this.context2d.fillStyle = "#00000040"
  this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
  

  this.context2d.fillStyle = "#000000";
  this.context2d.textAlign = "center";
  this.context2d.font = "24px sans-serif"
  this.context2d.fillText("Paused",this.canvas.width/2,this.canvas.height/2+12);
};

WizardGameInstance.prototype.drawFrameRate = function () {
  this.context2d.fillStyle = "#000000";
  this.context2d.textAlign = "right";
  this.context2d.font = "8px sans-serif"
  this.context2d.fillText("Frame Rate: " + fps,this.canvas.width,this.canvas.height);
};

window.addEventListener("load", onLoad); 
function onLoad(e) {
  let canvases = document.getElementsByClassName("game-canvas");
  for (let i=0;i<canvases.length;++i) {
    new WizardGameInstance(canvases.item(i));
  }
  window.removeEventListener("load", onLoad);
}