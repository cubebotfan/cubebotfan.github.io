"use strict";


//Magic class example. Stats are modifiable by creating a class with new static properties. 
//Some magic types have additional static properties that can be changed.
/* 
class MagicNew extends Magic {
  static cost = 8;
  static cooldown = 6;
  static damage = 4;
  static knockback = 0;
  static speed = 7;
  static iFrames = 4;

  static pierce = 0;
  static radius = 12;
  static lifeSpan = 900;
} */

/**  Base class for all magic. 
 * @implements {Colourable} */
class Magic extends Entity {
  /** Mana cost
     * @type {number} */
  static cost = 8;
  /** Casting cooldown
     * @type {number} */
  static cooldown = 6;
  /** Damage dealt to wizards hit by this spell
     * @type {number} */
  static damage = 4;
  /** Knockback dealt to wizards hit by this spell
     * @type {number} */
  static knockback = 0;
  /** Speed which this magic moves per frame
     * @type {number} */
  static speed = 7;
  /** Amount of frames that have to have pass since a wizard was last hit in order for this spell to hit them.
     * Spells with less iFrames will get priority when hiting a wizard that recently got hurt
     * @type {number} */
  static iFrames = 4;

  //these last 2 do not benefit as much from being static properties. They make creating new magic in code easier.
  //I will only put them in sub classes if they are changed.
  /** How many wizards this magic can hit before being destroyed
   * @type {number}
   */
  static pierce = 0;
  /** base radius of magic created by this spell.
   * @type {number}
   */
  static radius = 12;
  /** How many frames this magic can last before being destroyed
   * @type {number}
   */
  static lifeSpan = 900;

/** @type {string} name if this spell using in display and writing */
  static name = "Fireball"; //extremely creative name
  /**
   * 
   * @param {WizardGameLevel} level 
   * @param {Wizard} wizard 
   */
  constructor(level, wizard) {
    super(level, wizard.x,wizard.y,0);
    this.radius = this.constructor.radius;

    this.sprite = this.constructor.SPRITES[wizard.colour];

    /** How many frames this magic will last before being destroyed
     * @type {number} */
    this.lifeSpan = this.constructor.lifeSpan;

    /** The colour of this magic.
     * @type {number} */
    this.colour = wizard.colour;

    /** how many entities this magic can hit without being destroyed
     * @type {number} */
    this.pierce = this.constructor.pierce;


    /** The caster of this magic
     * @type {Wizard} */
    this.caster = wizard;
    
    /* Super */
    this.rotation = wizard.shootingAngle;

    /** This magic's movement vector
     * @type {Vector2} */
    this.movement = new Vector2();

    this.movement.set(Math.cos(this.rotation), Math.sin(this.rotation)).scale(this.constructor.speed);
  }
  
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  addToLevel(level) {
    level.magic.push(this);
    this.updateGridPos(level);
  }
  /**
   * @param {WizardGameLevel} level 
   */
  destroy(level) {
    level.grid.removeMagic(this, this.gridCell);
  }

    /**
   * @param {number} colour
   */
    setColour(colour) {
      this.colour = colour;
      this.sprite = MAGIC_SPRITES[colour];
    }

  /**
   * 
   * @param {WizardGameLevel} level 
   */
  act(level) {
    this.lifeSpan--;
    this.move(level);
    this.updateGridPos(level);
  }
  /**
   * @param {WizardGameLevel} level
   */
  move(level) {
    this.add(this.movement);

    if (this.sqDistance(new Vector2(0,0))>level.radius*level.radius) {
      
      this.pierce = -1;
    }
  }
  /**
   * @param {WizardGameLevel} level 
   */
  updateGridPos(level) {
    let c = level.grid.getCell(this.x,this.y);
    if (this.gridCell!=c) {
      if (this.gridCell!=undefined) {
        level.grid.removeMagic(this, this.gridCell);
      }
      level.grid.addMagic(this, c);
      this.gridCell = c;
    }
  }
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  after(level) {
    if (this.pierce<0 || this.lifeSpan<0) {
      return AFTER_CODE.DESTROY;
    }
    return AFTER_CODE.NORMAL;
  }

  /**
   * 
   * @param {Wizard} wizard 
   */
  hitWizard(wizard) {
    if (wizard.colour!=this.colour && this.pierce>=0) {
      if (wizard.damageTimer>=this.constructor.iFrames) {
        this.pierce--;
        wizard.damage(this.constructor.damage, this);
        wizard.movement.add(this.movement.vectorCopy().normalize().scale(this.constructor.knockback));
      }
    }
  }
  /**
   * 
   * @param {WizardGameLevel} level 
   */
  draw(level) {
    super.draw(level);
  }
}


// class MagicOrb extends Magic {
//   static cost = 8;
//   static cooldown = 6;
//   static damage = 4;
//   static knockback = 0;
//   static speed = 7;
//   static iFrames = 4;
// }

class MagicPiercingOrb extends Magic {
  static cost = 14;
  static cooldown = 9;
  static damage = 6;
  static knockback = 0;
  static speed = 6;
  static iFrames = 8;

  static pierce = 1;

  static name = "Piercing Fireball";
}

class MagicBigOrb extends Magic {
  static cost = 32;
  static cooldown = 24;
  static damage = 16;
  static knockback = 4;
  static speed = 4;
  static iFrames = 16;

  static pierce = 3;
  static radius = 24;

  static name = "Meteor";
}

class MagicBreath extends Magic {
  //this spell's stats are incredible, most likely the best spell in the game for 1v1.
  //But it can't do anything against groups.
  static cost = 14;
  static cooldown = 3;
  static damage = 10;
  static knockback = 1;
  static speed = 10;
  static iFrames = 3;

  static pierce = 2;
  static radius = 16;
  static lifeSpan = 32;

  static name = "Dragon Breath";

  /**
   * 
   * @param {WizardGameLevel} level 
   */
  move(level) {
    super.move(level);

    this.pierce-=0.125;
    this.radius+=2;

    {
      let magic = level.getMagicInRadius(this,this.radius);
      for (let i=0;i<magic.length;++i) {
        if (magic[i].colour!=this.colour) {
          magic[i].pierce--;
          this.pierce--;
        }
      }
    }
  }
}

class MagicHoming extends Magic { //base class for homing magic
  //this spell is also pretty cracked. If you're trying to run away then it'll always hit you.
  static cost = 8;
  static cooldown = 6;
  static damage = 3;
  static knockback = 0;
  static speed = 5.5;
  static iFrames = 1;

  static radius = 12;
  static lifeSpan = 256;

  /** How far away this homing magic will try to search for a target
   * @type {number} */
  static targetRadius = 128;
  /** How fast this homing magic will adjust to its target (in radians)
   * @type {number} */
  static homingSpeed = Math.PI/64;

  static name = "Magic Missile";
  /**
   * 
   * @param {WizardGameLevel} level 
   * @param {Wizard} wizard 
   */
  constructor(level, wizard) {
    super(level,wizard);


    /** Wizard that this magic is currently targeting.
     * @type {wizard} */
    this.target = wizard.target || null;
  }

  /**
   * @param {WizardGameLevel} level
   */
  move(level) {
    if (!this.target) {
      this.findTarget(level);
    } else { //this magic already has a target. 
      if (!this.target.inWorld || 
        this.target.sqDistance(this)>this.constructor.targetRadius*this.constructor.targetRadius || //target too far
        this.target.colour === this.colour) { 
        this.target = null;
      } else { //target still close
        this.homeInOnTarget(this.target);
      }
    }

    super.move(level);
  }

  /**
   * 
   * @param {WizardGameLevel} level 
   */
  findTarget(level) {
    //Something was seriously wrong with the old code. I don't even know where it came from.
    //It worked but I had no idea what the hell it was doing
    this.target = level.getNearestEnemyWizard(this,this.colour,this.constructor.targetRadius);
  }

  //What the fuck is this?
  // findTarget(level) {
  //   //copied from enemy targetting
  //   let wizards = level.getCollidingWizards(this,this.constructor.targetRadius);
  //   for (let i=0;i<wizards.length;++i) {
  //     if (wizards[i].colour!=this.colour) {
  //       let closest = -1;
  //       if (wizards.length>0) {
  //         let i=0;
  //         for (;i<wizards.length;++i) {
  //           if (wizards[i].colour!=this.colour) {
  //             closest = i;
  //             break;
  //           }
  //         }
  //         for (;i<wizards.length;++i) {
  //           if ((wizards[i].sqDistance(this)<wizards[closest].sqDistance(this) && wizards[i].colour!=this.colour)) {
  //             closest = i;
  //           }
  //         }
  //         if (closest>=0) {
  //           this.target = wizards[closest];
  //         }
  //       }
  //     }
  //   }
  // }
  homeInOnTarget(target) {
    let angle = this.movement.getAngle();
    let targetAngle = target.vectorCopy().subtract(this).getAngle();
    //angles are wierd
    if (targetAngle > angle+Math.PI) {
      targetAngle-=Math.PI*2;
    } else if (angle > targetAngle+Math.PI) {
      targetAngle+=Math.PI*2;
    }

    if (targetAngle>angle) {
      angle += this.constructor.homingSpeed;
    } else if (targetAngle<angle) {
      angle-= this.constructor.homingSpeed;
    }

    this.movement.set(Math.cos(angle),Math.sin(angle)).scale(this.constructor.speed);
    return 0;
  }
}

class MagicFollow extends Magic {
  static cost = 16;
  static cooldown = 7;
  static damage = 6;
  static knockback = 0;
  static speed = 2;
  static iFrames = 8;

  static pierce = 1;
  static radius = 16;
  static lifeSpan = 240;

  static targetRadius = 512;
  static acceleration = 0.1;
  static maxSpeed = 8;

  static name = "Dragon Spirit";

  /**
   * 
   * @param {WizardGameLevel} level 
   * @param {Wizard} wizard 
   */
  constructor(level, wizard) {
    super(level,wizard);

    this.target = wizard.target || null;
  }

  /**
   * @param {WizardGameLevel} level
   */
  move(level) {
    if (!this.target) {
      this.findTarget(level);
    } else {
      if (!this.target.inWorld || this.target.sqDistance(this)>this.constructor.targetRadius*this.constructor.targetRadius || this.target.colour === this.colour) {
        this.target = null;
      } else {
        this.movement.add(this.target.vectorCopy().subtract(this).normalize().scale(this.constructor.acceleration));

        
        if (this.movement.magnitude()>this.constructor.maxSpeed) {
          this.movement.normalize().scale(this.constructor.maxSpeed);
        }
      }
    }

    this.rotation = this.movement.getAngle();
    super.move(level);
  }

  // findTarget(level) {} //nevermind we can just copy the other function
}
//we are just going to yoink that.
MagicFollow.prototype.findTarget = MagicHoming.prototype.findTarget;

class MagicHealing extends Magic {
  static cost = 12;
  static cooldown = 8;
  static damage = 4;
  static knockback = 0;
  static speed = 4;
  static iFrames = 5;

  static radius = 12;

  //new properties to this class
  /** Damage healed when a friendly wizard is hit by this spell
   * @type {number} */
  static healthHeal = 12;
   /** Mana restored when a friendly wizard is hit by this spell
   * @type {number} */
  static manaHeal = 8;

  static name = "Restore";

  constructor(level, wizard) {
    super(level,wizard);

    this.target = wizard.target || null;
  }

  hitWizard(wizard) {
    
    if (wizard!=this.caster && this.pierce>=0) {  
      if (wizard.colour===this.colour) { //same colour wizard
        if ((this.constructor.healthHeal>0 && wizard.health<wizard.maxHealth) ||
          (this.constructor.manaHeal>0 && wizard.mana<wizard.maxMana)
        ) {
          this.pierce--;
          wizard.heal(this.constructor.healthHeal, this);
          wizard.manaHeal(this.constructor.manaHeal, this);
        }
      } else { //different colour wizard
        if (wizard.damageTimer>=this.constructor.iFrames) {
          this.pierce--;
          wizard.damage(this.constructor.damage, this);
          wizard.movement.add(this.movement.vectorCopy().normalize().scale(this.constructor.knockback));
        }
      }
    }
  }
}


class MagicHealPlus extends MagicHealing { //this is also based on MagicFollow but all functions are overriden
  //this spell's stats are complete garbage but it's nearly impossible to dodge.
  static cost = 10;
  static cooldown = 8;
  static damage = 1;
  static knockback = 0;
  static speed = 5;
  static iFrames = 2;

  static pierce = 0;
  static radius = 10;
  static lifeSpan = 120;

  static targetRadius = 512;
  static acceleration = 0.5;
  static maxSpeed = 6;

  static name = "Heal Plus";


  /** Damage healed when a friendly wizard is hit by this spell
   * @type {number} */
  static healthHeal = 4;
   /** Mana restored when a friendly wizard is hit by this spell
   * @type {number} */
  static manaHeal = 0;

  move(level) {
    if (!this.target) {
      this.findTarget(level);
    } else {
      if (!this.target.inWorld ||
        this.target.sqDistance(this)>this.constructor.targetRadius*this.constructor.targetRadius ||
        (this.target.colour===this.colour && this.target.health>=this.target.maxHealth)) {
        this.target = null;
      } else {
        this.movement.add(this.target.vectorCopy().subtract(this).normalize().scale(this.constructor.acceleration));
        if (this.movement.magnitude()>this.constructor.maxSpeed) {
          this.movement.normalize().scale(this.constructor.maxSpeed);
        }
      }
    }

    this.rotation = this.movement.getAngle();
    super.move(level);
  }

  findTarget(level) {
    let wizards = level.getWizardsInRadius(this, this.constructor.targetRadius);

    this.target = Wizard.nearestFriendlyWizard(wizards,this,this.colour,this.caster);
    if (!this.target) { //There were no nearby friendly wizards.
      this.target = Wizard.nearestEnemyWizard(wizards, this, this.colour);
    }
  }
}