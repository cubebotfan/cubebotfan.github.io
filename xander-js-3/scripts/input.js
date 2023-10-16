"use strict";
//Ehren Strifling

function Input(element) {
  this.mouseX = 0;
  this.mouseY = 0;
  this.MouseDragX = 0;
  this.MouseDragY = 0;
  this.mouseClicked = [5]; //mouse buttons pressed or held. 3 = pressed, 2 = held, 1 = released, 0 = none
  //I would like to get this next one working using an object but I need to be able to iterate through it easily.
  //iterating through 223 keys per input object annoys me a lot.
  this.keyMap = [223];//[223]; //keys pressed or held. 3 = pressed, 2 = held, 1 = released, 0 = none
  this.mouseWheel = [0, 0, 0]; //nice 3d mouse bro.

  this.addListeners(element);
};
Input.PRESSED = 3;
Input.HELD = 2;
Input.RELEASED = 1;

Object.defineProperty(Input.prototype, "mouseWheelY", {
  /**
   * @returns {number}
  */
  get: function () {
    return this.mouseWheel[1];
  }
});

Input.prototype.key = function (keyCode) {
  return this.keyMap[keyCode];
}
/**
 * Should be called after every frame finishes to properly reset inputs
 */
Input.prototype.reset = function () {
  this.mouseDragX = 0;
  this.mouseDragY = 0;
  this.mouseClicked.forEach((n,i,a)=>{a[i] = n&2});
  this.mouseWheel = [0,0,0];
  this.keyMap.forEach((n,i,a)=>{a[i] = n&2});
};

Input.prototype.trackMousePosition = function (e) {
  //e = e || event; //if e is invalid then e = event (ie)
  //We need to use += here since mouseMove events can be called more than once per frame.
  this.mouseDragX += this.mouseX - e.offsetX;
  this.mouseDragY += this.mouseY - e.offsetY;
  this.mouseX = e.offsetX;
  this.mouseY = e.offsetY;
};

Input.prototype.onMouseDown = function (e) {
  //e = e || event;
  this.mouseClicked[e.button] = 3;
};
Input.prototype.onMouseUp = function (e) {
  //e = e || event;
  this.mouseClicked[e.button] = 1;
};
Input.prototype.onMouseWheel = function (e) {
  //e = e || event;
  this.mouseWheel[0] = e.deltaX;
  this.mouseWheel[1] = e.deltaY;
  this.mouseWheel[2] = e.deltaZ;
};
Input.prototype.onKeyDown = function (e) {
  //e = e || event;
  this.keyMap[e.keyCode] = 3;
};
Input.prototype.onKeyUp = function (e) {
  //e = e || event;
  this.keyMap[e.keyCode] = 1;
};

Input.prototype.addListeners = function (element) {
  element.addEventListener('mousemove', (e) => this.trackMousePosition(e));
  element.addEventListener('mousedown', (e) => this.onMouseDown(e));
  element.addEventListener('mouseup', (e) => this.onMouseUp(e));
  element.addEventListener('wheel', (e) => this.onMouseWheel(e), {passive: true});
  
  //disables the context menu upon left clicking, we want to use the left mouse button as an input.
  element.addEventListener('contextmenu', (e) => { e.preventDefault();},false);
  
  //these functions need to be attached to the window... I think.
  window.addEventListener('keydown', (e) => this.onKeyDown(e));
  window.addEventListener('keyup', (e) => this.onKeyUp(e));
}


