"use strict";

//extra canvas function for drawing rotated images. I don't feel that it belongs in the main library.
/**
 * Draws an image rotated at an angle
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {number} x
 * @param {number} y
 * @param {number} hw
 * @param {number} hh
 * @param {number} angle
*/
Camera2d.prototype.drawRotatedImage = function (ctx, img, x, y, w, h, angle) {
  x = this.WtPX(x);
  y = this.WtPY(y);
  w = this.scale(w);
  h = this.scale(h);
  //this is awkward, but I don't know of a better way.  
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.drawImage(img,-w/2,-h/2,w,h);
  ctx.resetTransform();
}

/** return values for entity.after() */
const AFTER_CODE = Object.freeze({
  PLAYER_DEFEAT: -2, //returned when the player is defeated
  DESTROY: -1, //returned when an object needs to be destroyed
  NORMAL: 0 //returned when everything is normal
});

/**Colour ids */
const COLOURS = Object.freeze({
  RED: 0,
  ORANGE: 1,
  YELLOW: 2,
  GREEN: 3,
  BLUE: 4,
  PURPLE: 5,
  PINK: 6,
  BROWN: 7
});

//base class for all entities
class Entity extends Vector2 {
  constructor(level, x, y, radius) {
    super(x,y);
    /** Radius of this entities hitbox
     * @type {number} */
    this.radius = radius;
    /** This entity's location in the grid
     * @type {number} */
    this.gridCell = undefined;
    /** This entity's rotation (in radians)
     * @type {number} */
    this.rotation = 0;
    /** This entity's sprite
     * @type {HTMLImageElement} */
    this.sprite = null;
  }
  /**
   * This function is to make sure that there aren't any memory leaks cause by destroying entities (especially from the grid)
   * @param {WizardGameLevel} level 
   */
  destroy(level) {}
  addToWorld(level) {
    
  }
  /**
   * @param {WizardGameLevel} level 
   */
  act(level) {}
  /**
   * @param {WizardGameLevel} level 
   */
  collision(level) {} //no collision by default
  after(level) { return AFTER_CODE.NORMAL; }
  draw(level) {
    level.camera.drawRotatedImage(
      level.instance.context2d,
      this.sprite,
      this.x,
      this.y,
      this.radius,
      this.radius,
      this.rotation
    );
  }
}


/**
 * @interface
 * 
 * @param {number} colour
 */
function Colourable(colour) {
  /**@type {number} */
  this.colour = colour;
}