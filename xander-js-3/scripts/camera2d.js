"use strict";
//Ehren Strifling

/**
 * Creates a 2d camera object.
 * 
 * DO NOT USE MEMBER VARIABLES
 * @returns {Camera2d}
 */
function Camera2d() {
  this.x = 0;
  this.y = 0;

  this._hw = 0; //half width
  this._hh = 0; //half height

  this._scale = 1;
}
Object.setPrototypeOf(Camera2d.prototype, Vector2.prototype);

/* - - - - - - - - - -
  Getters and Setters
 - - - - - - - - - - */
/**
 * Sets this camera's x position.
 * @param {number} x
 */
Camera2d.prototype.setX = function (x) {
  this.x = x;
};
/**
 * Sets this camera's y position.
 * @param {number} x
 */
Camera2d.prototype.setY = function (y) {
  this.y = y;
};
/**
 * Gets this camera's x position.
 * @returns {number}
 */
Camera2d.prototype.getX = function () {
  return this.x;
};
/**
 * Gets this camera's y position.
 * @returns {number}
 */
Camera2d.prototype.getY = function () {
  return this.y;
};

/**
 * Sets this camera's scale factor.
 * Higher = zoom in. Lower = zoom out.
 * @param {number} z
 */
Camera2d.prototype.setScale = function (z) {
  this._scale = z;
};
/**
 * Gets this camera's scale factor.
 * Higher = zoom in. Lower = zoom out.
 * @returns {number}
 */
Camera2d.prototype.getScale = function () {
  return this._scale;
};

/**
 * Sets this camera's width. Should be set to the width of the canvas.
 * @param {number} w 
 */
Camera2d.prototype.setWidth = function (w) {
  this._hw = w/2;
};
/**
 * Gets this camera's width.
 * @returns {number}
 */
Camera2d.prototype.getWidth = function () {
  return this._hw * 2;
};
/**
 * Sets this camera's height. Should be set to the height of the canvas.
 * @param {number} w 
 */
Camera2d.prototype.setHeight = function (h) {
  this._hh = h/2;
};
/**
 * Gets this camera's height.
 * @returns {number}
 */
Camera2d.prototype.getHeight= function () {
  return this._hh * 2;
};

/* - - - - - - - - - -
  Coordinate conversion functions
 - - - - - - - - - - */

/**
 * World to Point X.
 * 
 * takes an x value in world coordinates and converts it into a point to draw on the canvas based on scale and camera x.
 * @param {number} x
 * @returns {number}
 */
Camera2d.prototype.WtPX = function (x) {
  return (x - this.x) * this._scale + this._hw;
};
/**
 * World to Point Y.
 * 
 * takes a y value in world coordinates and converts it into a point to draw on the canvas based on scale and camera y.
 * @param {number} y
 * @returns {number}
 */
Camera2d.prototype.WtPY = function (y) {
  return (y - this.y) * this._scale + this._hh;
};
/**
 * Multiplies a number by this camera's scale value.
 * @param {number} number 
 * @returns {number}
 */
Camera2d.prototype.scale = function (number) {
  return number * this._scale;
};

/**
 * Point to World X.
 * 
 * takes an x coordinate as a point on the camera and converts it into world coordinates.
 * useful for checking if the mouse is clicking on something.
 * @param {number} x
 * @returns {number}
 */
Camera2d.prototype.PtWX = function (x) {
  return (x - this._hw) / this._scale + this.x;
};
/**
 * Point to World Y.
 * 
 * takes a y coordinate as a point on the camera and converts it into world coordinates.
 * useful for checking if the mouse is clicking on something.
 * @param {number} y
 * @returns {number}
 */
Camera2d.prototype.PtWY = function (y) {
  return (y - this._hh) / this._scale + this.y;
};

 /* - - - - - - - - - -
  Drawing Functions
 - - - - - - - - - - */

/**
 * Creates a filled rectangle on a canvas context using world values, adjusting values based on camera coordinates.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
*/
Camera2d.prototype.fillRect = function (ctx, x, y, width, height) {
  ctx.fillRect(
    (x - this.x) * this._scale + this._hw,
    (y - this.y) * this._scale + this._hh,
    width * this._scale,
    height * this._scale
  );
};
/**
 * Creates a rectangle outline on a canvas context using world values, adjusting values based on camera coordinates.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
*/
Camera2d.prototype.strokeRect = function (ctx, x, y, width, height) {
  ctx.strokeRect(
    (x - this.x) * this._scale + this._hw,
    (y - this.y) * this._scale + this._hh,
    width * this._scale,
    height * this._scale
  );
};

/**
 * creates a circle (or arc) on the context using world values, adjusting values to the camera coordinates.
 * @param {CanvasRenderingContext2D} ctx canvas to draw on
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} start
 * @param {number} end
*/
Camera2d.prototype.circle = function (ctx, x, y, radius, start = 0, end = Math.PI * 2) {
  ctx.arc( //inlined code because I don't think browsers do that. Some scripts might call draw code every frame so decent performance is important.
    (x - this.x) * this._scale + this._hw,
    (y - this.y) * this._scale + this._hh,
    radius * this._scale,
    start,
    end
  );
};

/**
 * Clears a canvas.
 * @param {CanvasRenderingContext2D} ctx
 */
Camera2d.prototype.clear = function (ctx) {
  ctx.clearRect(0, 0, this._hw*2, this._hh*2);
};

/**
 * Puts text on a canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {String} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
*/
Camera2d.prototype.fillText = function (ctx, text, x, y, maxWidth = undefined) {
  ctx.fillText(
    text,
    (x - this.x) * this._scale + this._hw,
    (y - this.y) * this._scale + this._hh,
    maxWidth
  );
};