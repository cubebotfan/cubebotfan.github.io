"use strict";

class WizardGameLevel {
  constructor(instance) {
    /**@type {WizardGameInstance} */
    this.instance = instance;

    /**@type {Camera2d} */
    this.camera = new Camera2d();

    /**@type {Wizard[]} */
    this.wizards = [];
    /**@type {Magic[]} */
    this.magic = [];

    //Grid cell size = width / cell count. MAKE SURE THE CELLS ARE NOT TOO TINY.
    /**@type {Grid} */
    this.grid = new Grid(32,32,1600,1600);
    
    
    /** level area. Magic outside this area is destroyed. Wizards outside this area are bounced back in.
     * @type {number}
    */
    this.radius = 1600;

    /** @type {Player} */
    this.player = new Player(this, 0, 0);
    /** @type {Wizard} */
    this.cameraTarget = this.player;
    this.addWizard(this.player);
    //this.player.spell = MagicBreath; //testing

    for (let i=0;i<32;++i) {
      this.addWizard(new Enemy(this, Math.random()*this.radius-this.radius/2, Math.random()*this.radius-this.radius/2));
    }

    //65,536 magic projectiles to test the grid.
    //Uses about a quarter of my cpu which is great since we won't be reaching anywhere close to 65,536 projectiles.

    // for(let i=0;i<16**4;++i) {
    // this.magic.push(new Magic(this, Math.random()*10000-5000,Math.random()*10000-5000));
    // }
  }

  /**
   * Minimizes the damage done if I ever have to change the instance structure
   * @returns {Input}
   */
  getInput() {
    return this.instance.input;
  }
  /**
   * Minimizes the damage done if I ever have to change the instance structure
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.instance.context2d;
  }

  /**
   * Adds a wizard to this level
   * @param {Wizard} wizard 
   */
  addWizard(wizard) {
    this.wizards.push(wizard);
    wizard.addToLevel(this);
  }
  /**
   * Main loop called every frame
   */
  act() {
    for (let i=0;i<this.wizards.length;++i) {
      this.wizards[i].act(this);
    }
    for (let i=0;i<this.magic.length;++i) {
      this.magic[i].act(this);
    }
    this.collision();
    this.after();

  }
  /**
   * Checks entity collisions
   */
  collision() {
    for (let i=0;i<this.wizards.length;++i) {
      this.wizards[i].collision(this);
    }
    //Most magic has no collision, some do however.
    for (let i=0;i<this.magic.length;++i) {
      this.magic[i].collision(this);
    }
  }
  /**
   * Called after entity collisions. Cleans up entities that need to be removed.
   */
  after() { //after the act loop. We delete objects in here so we go over objects in reverse order
    for (let i=this.wizards.length-1;i>=0;--i) {
      let returnval = this.wizards[i].after(this);
      switch (returnval) {
        case AFTER_CODE.DESTROY:
          this.wizards[i].destroy(this);
          this.wizards.splice(i,1);
          break;
        default:
      }
    }

    for (let i=this.magic.length-1;i>=0;--i) {
      let returnval = this.magic[i].after(this);
      switch (returnval) {
        case AFTER_CODE.DESTROY:
          this.magic[i].destroy(this);
          this.magic.splice(i,1)[0].GridCell
          break;
        default:
      }
    }

    if (this.player && !this.player.inWorld) {
      this.player = null;
    }
    if (this.cameraTarget && !this.cameraTarget.inWorld) {
      if (this.wizards.length>0) {
        this.cameraTarget = this.wizards[0];
      } else {
        this.cameraTarget = null;
      }
    }
  }


  /**
   * Renders the level
   */
  draw() {
    if (this.cameraTarget!=null) {
      this.camera.setVector(this.cameraTarget);
    }
    this.camera.clear(this.getContext());
    this.getContext().beginPath();
    this.getContext().lineWidth = 5;
    this.getContext().strokeStyle = "#000000";
    this.camera.circle(this.getContext(), 0, 0, this.radius);
    this.getContext().stroke();

    //draw magic before wizards
    this.grid.drawMagicIn(
      this,
      this.camera.PtWX(0),
      this.camera.PtWY(0),
      this.camera.PtWX(this.instance.canvas.width),
      this.camera.PtWY(this.instance.canvas.height)
    );
    this.grid.drawWizardsIn(
      this,
      this.camera.PtWX(0),
      this.camera.PtWY(0),
      this.camera.PtWX(this.instance.canvas.width),
      this.camera.PtWY(this.instance.canvas.height)
    );

    // if (this.player) {
    //   this.player.drawHealthbar(this);
    // }
    this.grid.drawWizardsIn(
      this,
      this.camera.PtWX(0),
      this.camera.PtWY(0),
      this.camera.PtWX(this.instance.canvas.width),
      this.camera.PtWY(this.instance.canvas.height),
      "drawHealthbar"
    );

    this.getInput().reset();
  }

  //These next 2 functions are a way for entities to get collision info.
  //I eventually want to make entities have no reference to the grid and this helps with that.
  /**
   * 
   * @param {Vector2} vector 
   * @param {number} radius 
   * @returns {Wizard[]}
   */
  getWizardsInRadius(vector,radius) {
    return this.grid.getWizardsInRadius(vector, radius);
  }
  /**
   * 
   * @param {Vector2} vector 
   * @param {number} radius 
   * @returns {Magic[]}
   */
  getMagicInRadius(vector,radius) {
    return this.grid.getMagicInRadius(vector, radius);
  }

  //shortcut methods
  /** 
   * @param {Vector2} vector position to center the search around
   * @param {number} colour colour of wizard we want to avoid (friendly wizards)
   * @param {number} radius maximum distance to search, 0 means that every wizard will be searched.
   * @returns {Wizard} Can return null
   */
  getNearestEnemyWizard(vector, colour, radius = 0) {
    let wizards;
    if (radius) {
      wizards = this.getWizardsInRadius(vector, radius);
    } else {
      wizards = this.wizards;
    }
    return Wizard.nearestEnemyWizard(wizards, vector, colour);
  }
  /** 
   * @param {Vector2} vector position to center the search around
   * @param {number} colour colour of wizard we want to search for (friendly wizards)
   * @param {number} radius maximum distance to search, 0 means that every wizard will be searched.
   * @param {Wizard} self avoid this wizard when searching.
   * @returns {Wizard} Can return null
   */
  getNearestFriendlyWizard(vector, colour, radius = 0, self = null) {
    //if (!self) {self = vector;} //not needed yet
    let wizards;
    if (radius) {
      wizards = this.getWizardsInRadius(vector, radius);
    } else {
      wizards = this.wizards;
    }
    
    return Wizard.nearestFriendlyWizard(wizards, vector, colour, self);
  }
  /** 
   * @param {Vector2} vector position to center the search around
   * @param {number} radius maximum distance to search, 0 means that every wizard will be searched.
   * @param {Wizard} self avoid this wizard when searching.
   * @returns {Wizard} Can return null
   */
  getNearestWizard(vector, radius = 0, self = null) {
    let wizards;
    if (radius) {
      wizards = this.getWizardsInRadius(vector, radius);
    } else {
      wizards = this.wizards;
    }
    return Wizard.nearestWizard(wizards,vector,self);
  }
}