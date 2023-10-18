"use strict";

/**@implements {Colourable} */
class Wizard extends Entity {

  constructor(level, x,y, colour = 0) {
    super(level, x,y,10);

    
    /**@type {Vector2} Wizard movement speed */
    this.movement = new Vector2(0,0);
    /**@type {Vector2} Wizard acceleration speed */
    this.acceleration = new Vector2(0,0);

    /**@type {number} Wizard acceleration speed */
    this.movespeed = 0.20;
    /**@type {number} Wizard speed loss */
    this.drag = 0.04;
    //max speed = this.movespeed / this.drag; //heigher speeds cannot be reached by accelerating normally.

    /** Secondary radius used for drawing. We do this so that the wizard's collision radius isn't abnormally large.
     * Might add this to all entities later.
     * @type {number} */
    this.drawRadius = 32;

    /**@type {number} */
    this.colour = 0;
    this.setColour(colour);
    /** True when this wizard wants to shoot magic
     * @type {boolean} */
    this.shooting = false;
    /** Angle this wizard is shooting at (in radians)
     * @type {number} */
    this.shootingAngle = this.rotation;

    /**@type {typeof Magic} */
    this.spell = this.constructor.getSpell();

    this.cooldown = 0;

    /**@type {number} */
    this.maxHealth = 100;
    /**@type {number} */
    this.health = 100;
    /**@type {number} */
    this.maxMana = 100;
    /**@type {number} */
    this.mana = 100;

    /** time since this wizard was last damaged
     * @type {number} */
    this.damageTimer = 0;
    /** time since this wizard was last healed. Used to show the healthbar
     * @type {number}
     */
    this.healTimer = 0;

    /** Current target. Used by subclasses for their AI
     * @type {Wizard}  */
    this.target = null;
    /** Turns false after this wizard is destroyed. We want to remove all references to this object.
     * @type {boolean}
     */
    this.inWorld = false;

    /**@type {Wizard} The wizard that defeated this wizard */
    this.defeatedBy = null;
  }

  addToLevel(level) {
    this.updateGridPos(level);
    this.inWorld = true;
  }
  /**
   * @param {WizardGameLevel} level 
   */
  destroy(level) {
    level.grid.removeWizard(this, this.gridCell);
    this.inWorld = false;
  }

  getXMove() {
    return this.movement.x;
  }
  getYMove() {
    return this.movement.y;
  }

  
  
  /**
   * @param {number} colour
   */
  setColour(colour) {
    this.colour = colour;
    this.sprite = this.constructor.SPRITES[colour];
  }
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  act(level) {
    this.tick(level);
    this.control(level);
    this.move(level);
    this.castMagic(level);
  }
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  tick(level) {
    this.damageTimer++;
    this.healTimer++;
    this.cooldown--;
    this.mana++;
    if (this.health<this.maxHealth && this.damageTimer>=60 && this.mana>=this.maxMana*0.9) {
      this.health++;
      this.mana-=4;
      this.healTimer = 0;
    }
    if (this.mana>this.maxMana) {
      this.mana = this.maxMana;
    }
  }
  /**
   * @param {WizardGameLevel} level 
   */
  updateGridPos(level) { //I would really love to have entities have no reference to the grid...
    let c = level.grid.getCell(this.x,this.y);
    if (this.gridCell!=c) {
      if (this.gridCell!=undefined) {
        level.grid.removeWizard(this, this.gridCell);
      }
        level.grid.addWizard(this, c);
        this.gridCell = c;
    }
  }
  /**
   * @param {WizardGameLevel} level 
   */
  collision(level) {
    //enemy wizards keep stacking and I don't like it
    let collidingWizards = level.getWizardsInRadius(this,this.radius);
    for (let i=0;i<collidingWizards.length;++i) {
      if (collidingWizards[i]!=this) {
        let vector = this.vectorCopy().subtract(collidingWizards[i]).normalize();
        if (vector.isZero()) {
          let angle = Math.random()*Math.PI * 2;
          vector.set(Math.cos(angle),Math.sin(angle))
        }
        this.movement.add(vector);
      }
    }
    let collidingMagic = level.getMagicInRadius(this,this.radius);
    for (let i=0;i<collidingMagic.length;++i) {
      collidingMagic[i].hitWizard(this);
    }
  }
  /**
   * @param {WizardGameLevel} level 
   * @returns {number}
   */
  after(level) {
    if (this.health<=0) {
      return AFTER_CODE.DESTROY;
    }
    return AFTER_CODE.NORMAL;
  } 
  /**
   * @param {WizardGameLevel} level 
   */
  move(level) {
    if (this.acceleration.sqMagnitude()>(this.movespeed*this.movespeed)) {
      this.acceleration.normalize().scale(this.movespeed);
    }
    this.movement.add(this.acceleration);
    if (this.movement.x!=0||this.movement.y!=0) {
      this.add(this.movement);
      this.updateGridPos(level);
    }
    //drag removes a percentage of our speed every frame.
    this.movement.scale(1-this.drag);

    //Garbage and not needed anymore since I fixed the core issue.
    /*if (this.movement.sqMagnitude()<this.movespeed*this.drag) {
      this.movement.zero();
    }*/

    if (this.sqDistance(new Vector2(0,0))>level.radius*level.radius) {
      let v = this.copy();
      this.normalize().scale(level.radius);
      v.subtract(this).invert().scale(4);
      //we use Math.ceil here to avoid giving the player 0 damage. This way there can't be an infinite invincibility exploit.
      this.damage(Math.ceil(v.magnitude()));
      this.movement.setVector(v);
    }
  }

  /**
   * override this function
   * @param {WizardGameLevel} level 
   */
  control(level) {
    this.acceleration.zero();
  }
  stopMoving() {
    this.acceleration.add(this.movement.vectorCopy().invert());
  }

  /**
   * @param {WizardGameLevel} level
   */
  castMagic(level) {
    //TEMP. Needs proper spellcasting class
    if (this.cooldown <=0 && this.shooting && this.mana>=this.spell.cost) {
      let magic = new this.spell(level, this);
      magic.addToLevel(level);
      this.mana-=magic.constructor.cost;
      this.cooldown = magic.constructor.cooldown;
    }
    
  }

  /**
   * @param {number} amount
   * @param {Magic} source
   */
  damage(amount, source = null) {
    this.damageTimer = 0;
    this.health-=amount;

    if (this.health<=0) {
      //it is technically possible for an enemy to be defeated and the healed before the frame ends.
      //This We want to reset defeatedBy to null if we can in these scenarios
      this.defeatedBy = (source) ? source.caster : null;
    }
  }
  /**
   * @param {number} amount
   * @param {Magic} source
   */
  heal(amount, source = null) {
    this.health+=amount;
    this.healTimer = 0;
    if (this.health>this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  /**
   * @param {number} amount
   * @param {Magic} source
   */
  manaHeal(amount, source = null) {
    this.mana+=amount;
    if (this.mana>this.maxMana) {
      this.mana = this.maxMana;
    }
  }

  /**
   * 
   * @param {WizardGameLevel} level 
   */
  draw(level) {
    level.camera.drawRotatedImage(
      level.getContext(),
      this.sprite,
      this.x,
      this.y,
      this.drawRadius,
      this.drawRadius,
      this.rotation
    );
  }

  /**
   * 
   * @param {WizardGameLevel} level 
   */
  drawHealthbar(level) {
    level.getContext().fillStyle = "#FF0000";
    let x = level.camera.WtPX(this.x);
    let y = level.camera.WtPY(this.y + this.drawRadius/2);
    level.getContext().fillRect(
      x-12,
      y,
      24,
      4
    );
    level.getContext().fillStyle = "#00FF00";
    level.getContext().fillRect(
      x-12,
      y,
      24 * (this.health/this.maxHealth),
      4
    );
  }
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  drawManabar(level) {
    level.getContext().fillStyle = "#808080";
    let x = level.camera.WtPX(this.x);
    let y = level.camera.WtPY(this.y + this.drawRadius/2);
    level.getContext().fillRect(
      x-12,
      y+4,
      24,
      4
    );
    level.getContext().fillStyle = "#0000FF";
    level.getContext().fillRect(
      x-12,
      y+4,
      24 * (this.mana/this.maxMana),
      4
    );
  }

  //ai functions used in subclasses
  aimForTarget() { //This one is pretty tough. I'm going to have to rethink my math a bit here...

    let v = this.target.vectorCopy().subtract(this); //set wizard rotation to face the target
    if (v.x||v.y) {
      this.rotation = v.getAngle();
    }

    //so far this is the best formula I've got. I need to find the proper formula for this
    //BUT NOT ANYMORE. I have something slightly better now
    // time = this.distance(this.target);
    // console.log(time);

    let time = this.distance(this.target) / this.spell.speed;
    let time2 = this.distance(this.target.vectorCopy().add(this.target.movement.vectorCopy().scale(time))) - this.distance(this.target);
    time += time2*3/4 / this.spell.speed;

    v = this.target.vectorCopy().add(this.target.movement.vectorCopy().scale(time)).subtract(this);
    if (v.x||v.y) {
      this.shootingAngle = v.getAngle();
    }
  }




  //static shortcut methods

  /**
   * Returns the nearest enemy wizard out of an array of wizards
   * @param {Wizard[]} wizards 
   * @param {Vector2} vector 
   * @param {number} colour 
   * @returns {Wizard} //Can return null
   */
  static nearestEnemyWizard(wizards, vector, colour) {
    let closest = null;
    if (wizards.length>0) {
      let i=0;
      for (;i<wizards.length;++i) { //this first loop is to get a valid closest target
        if (wizards[i].colour!=colour) {
          closest = wizards[i];
          break;
        }
      } //else {} damn this could've been convenient. Actually no nevermind 
      for (;i<wizards.length;++i) { //now that we've found our first valid target, 
        //we can compare other valid targets to see if they are closer than this one.
        if (wizards[i].sqDistance(vector)<closest.sqDistance(vector) && wizards[i].colour!=colour) {
          closest = wizards[i];
        }
      }
    }
    return closest;
  }
  /**
   * Returns the nearest friendly wizard out of an array of wizards
   * @param {Wizard[]} wizards 
   * @param {Vector2} vector 
   * @param {number} colour 
   * @param {Wizard} self 
   * @returns {Wizard} //Can return null
   */
  static nearestFriendlyWizard(wizards, vector, colour, self = null) {
    if (!self) {self = vector;}
    let nearest = null;
    if (wizards.length>0) {
      let i=0;
      for (;i<wizards.length;++i) { //this first loop is to get a valid closest target
        if (wizards[i]!=self && wizards[i].colour==colour) {
          nearest = wizards[i];
          break;
        }
      }
      for (;i<wizards.length;++i) { //now that we've found our first valid target, 
        //we can compare other valid targets to see if they are closer than this one.
        if (wizards[i].sqDistance(vector)<nearest.sqDistance(vector) &&
         wizards[i]!=self && wizards[i].colour==colour) {
          nearest = wizards[i];
        }
      }
    }
    return nearest;
  }
  /**
   * Returns the nearest wizard out of an array of wizards
   * @param {Wizard[]} wizards 
   * @param {Vector2} vector
   * @param {Wizard} self 
   * @returns {Wizard} //Can return null
   */
  static nearestWizard(wizards, vector, self = null) {
    if (!self) {self = vector;}
    let nearest = null;
    if (wizards.length>0) {
      let i=0;
      for (;i<wizards.length;++i) { //this first loop is to get a valid closest target
        if (wizards[i]!=self) {
          nearest = wizards[i];
          break;
        }
      }
      for (;i<wizards.length;++i) { //now that we've found our first valid target, 
        //we can compare other valid targets to see if they are closer than this one.
        if (wizards[i].sqDistance(vector)<nearest.sqDistance(vector) &&
         wizards[i]!=self) {
          nearest = wizards[i];
        }
      }
    }
    return nearest;
  }


  /**
   * Gives a wizard a random spell
   * @param {number} id Give the wizard the spell with this id instead of giving a random spell.
   * @returns {Magic.constructor}
   */
  static getSpell(id) {
    id = id || Math.floor(Math.random()*8);
    switch (id) {
      case 0: default: return Magic;
      case 1: return MagicPiercingOrb;
      case 2: return MagicBigOrb;
      case 3: return MagicBreath;
      case 4: return MagicHoming;
      case 5: return MagicFollow;
      case 6: return MagicHealing;
      case 7: return MagicHealPlus;
    }
  }
}










class Player extends Wizard {
  constructor(level, x,y) {
    super(level, x,y, COLOURS.BLUE);
  }
  /**
   * Player control
   * @param {WizardGameLevel} level 
   */
  control(level) {
    //control based on WASD or ARROW keys.
    super.control(level);
    this.shooting=false;
    if (level.getInput().key(65)>=Input.HELD||level.getInput().key(37)>=Input.HELD) {
      this.acceleration.x-=this.movespeed;
    } 
    if (level.getInput().key(68)>=Input.HELD||level.getInput().key(39)>=Input.HELD) {
      this.acceleration.x+=this.movespeed;
    } 
    if (level.getInput().key(87)>=Input.HELD||level.getInput().key(38)>=Input.HELD) {
      this.acceleration.y-=this.movespeed;
    } 
    if (level.getInput().key(83)>=Input.HELD||level.getInput().key(40)>=Input.HELD) {
      this.acceleration.y+=this.movespeed;
    }
    //Limit movement speed since diagonal movement should not move faster than orthogonally
    if (this.acceleration.x!=0||this.acceleration.y!=0) {
      this.acceleration.normalize().scale(this.movespeed);
    }
    //Moving nowhere. Remove speed to prevent sliding around.
    if (this.acceleration.x===0&&this.acceleration.y===0) {
      this.stopMoving();
    }

    //z key, remove target
    if (level.getInput().key(90)===Input.PRESSED || level.getInput().mouseClicked[2]===Input.PRESSED) {
      this.target = null;
    }
    //x key, set target to nearest to mouse
    if (level.getInput().key(88)===Input.PRESSED || level.getInput().mouseClicked[0]===Input.PRESSED) {
      if (level.getInput().mouseX && level.getInput().mouseY) {
        let v = new Vector2(
          level.camera.PtWX(level.getInput().mouseX*level.instance.canvas.width/level.instance.canvas.offsetWidth),
          level.camera.PtWY(level.getInput().mouseY*level.instance.canvas.height/level.instance.canvas.offsetHeight)
        );
        this.target = level.getNearestWizard(v,64,this);
      }
      
    }
    
    if (this.target && !(level.getInput().key(16)>=Input.HELD)) { //why does bitwise inversion have priority here?
      if (!this.target.inWorld) {
        this.target = level.getNearestEnemyWizard(this, this.colour, 512);
      } else {
        this.aimForTarget();
      }
    } else {
      //Face towards the mouse.
      if (level.getInput().mouseX && level.getInput().mouseY) {
        let v = new Vector2(
          level.camera.PtWX(level.getInput().mouseX*level.instance.canvas.width/level.instance.canvas.offsetWidth),
          level.camera.PtWY(level.getInput().mouseY*level.instance.canvas.height/level.instance.canvas.offsetHeight)
        ).subtract(this);
        if (v.x||v.y) {
          this.rotation = v.getAngle();
          this.shootingAngle = this.rotation;
        }
      }
    }

    if (level.getInput().key(32)>=Input.HELD || level.getInput().mouseClicked[0]>=Input.HELD) {
      this.shooting=true;
    }
  }

  drawHealthbar(level) {
    super.drawHealthbar(level);
    super.drawManabar(level);
  }


}





















class Enemy extends Wizard {
  constructor(level, x,y, colour = Math.floor(Math.random()*8)) {
    super(level, x,y, colour);
  }

  /**
   * Enemy AI
   * @param {WizardGameLevel} level 
   */
  control(level) {
    this.acceleration.zero();
    this.shooting = false;
    if (!this.target || !this.target.inWorld) {
      this.target = level.getNearestEnemyWizard(this,this.colour);
    }
    
    //Face targed
    if (this.target && this.target.inWorld) {
      this.aimForTarget();
      this.shooting = true;


      if (this.target.sqDistance(this)>150*150) {
        this.acceleration.setVector(this.target).subtract(this);
      }

      if (this.acceleration.sqMagnitude()>64*64) {
        this.acceleration.normalize().scale(64);
      }
    }
    {
      let magic = level.getMagicInRadius(this,64);
      for (let i=0;i<magic.length;++i) {
        if (magic[i].colour!=this.colour) {
          let v = this.vectorCopy().subtract(magic[i]);
          let scale = 64 - v.magnitude();
          if (scale>16) {
            this.acceleration.add(v.add(magic[i].movement.vectorCopy().scale(4)).normalize().scale(scale));
          } else {
            this.acceleration.add(v.normalize().scale(scale));
          }
        }
      }
    }


    if (!this.acceleration.x||!this.acceleration.y) {
      this.stopMoving();
    }
  }
  
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  drawHealthbar(level) {
    let opacity = Math.max(0, Math.min(2.5 - Math.min(this.damageTimer,this.healTimer)/25, 1));
    level.getContext().globalAlpha = opacity;
    super.drawHealthbar(level);
    level.getContext().globalAlpha = 1;
  }
}