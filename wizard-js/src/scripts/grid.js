"use strict";

//A major problem with the original wizard game as well as the unity remake was how collision was not very optimized.
//There were things that I couldn't do because of how laggy entity detection would be.
//Here, I'm going to use a grid-cell based collision approach which should lighten collision detection
//at the cost of a ton of RAM.

//after some testing it seems like most of the processing saved is from rendering / large projectile counts.
//I'm still happy with this though. I does lag noticibly less when you try checking for magic collisions between eachother.
class GridCell {
  constructor() {
    /**@type {Wizard[]} */
    this.w = [];
    /**@type {Magic[]} */
    this.m = [];
  }

  addWizard(wizard) {
    this.w.push(wizard);
  }
  removeWizard(wizard) {
    for (let i=0;i<this.w.length;++i) {
      if (this.w[i]===wizard) {
        this.w.splice(i,1);
        return;
      }
    }
  }
  addMagic(magic) {
    this.m.push(magic);
  }
  removeMagic(magic) {
    for (let i=0;i<this.m.length;++i) {
      if (this.m[i]===magic) {
        this.m.splice(i,1);
        return;
      }
    }
  }
}
class Grid {
  /**
   * 
  constructor(columns,rows,wigth,height) { //1d array instead of 2d array might be faster here...
   * @param {number} columns
   * @param {number} rows
   * @param {number} width
   * @param {number} height
   */
  constructor(columns,rows,width,height) { //1d array instead of 2d array might be faster here...
    /**@type {number} */
    this.startX = -width/2;
    /**@type {number} */
    this.startY = -height/2;
    /**@type {number} */
    this.columns = columns;
    /**@type {number} */
    this.rows = rows;
    /**@type {number} */
    this.cellWidth = width/columns;
    /**@type {number} */
    this.cellHeight = height/columns;

    /**@type {GridCell} */
    this.cells = [];
    for (let i=0;i<columns*rows;++i) {
      this.cells.push(new GridCell());
    }
  }
  /**
   * returns a cell id from an x and y value
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getCell(x,y) {
    x = Math.floor((x-this.startX)/this.cellWidth);
    y = Math.floor((y-this.startY)/this.cellHeight);
    x = Math.min(Math.max(0,x),this.columns-1);
    y = Math.min(Math.max(0,y),this.rows-1);

    return x + y*this.columns;
  }

  addWizard(wizard, cellId) {
    this.cells[cellId].addWizard(wizard);
  }
  removeWizard(wizard, cellId) {
    this.cells[cellId].removeWizard(wizard);
  }
  addMagic(magic, cellId) {
    this.cells[cellId].addMagic(magic);
  }
  removeMagic(magic, cellId) {
    this.cells[cellId].removeMagic(magic);
  }

  /**
   * 
   * @param {Vector2} vector 
   * @param {number} radius 
   * @returns {Wizard[]}
   */
  getWizardsInRadius(vector,radius) {
    let range = Math.ceil(radius / Math.max(this.cellWidth, this.cellHeight));
    let colliding = [];
    let minX = Math.floor((vector.x-this.startX)/this.cellWidth-range);
    let maxX = minX+range*2;
    let minY = Math.floor((vector.y-this.startY)/this.cellHeight-range);
    let maxY = minY+range*2;
    minX = Math.min(Math.max(0,minX),this.columns-1);
    maxX = Math.min(Math.max(0,maxX),this.columns-1);
    minY = Math.min(Math.max(0,minY),this.rows-1);
    maxY = Math.min(Math.max(0,maxY),this.rows-1);

    for (let i=minY;i<=maxY;++i) {
      for (let j=minX;j<=maxX;++j) {
        for (let k=0;k<this.cells[j+i*this.columns].w.length;++k) {
          let wizard = this.cells[j+i*this.columns].w[k];
          if (vector.sqDistance(wizard)<(radius+wizard.radius)*(radius+wizard.radius)/4) {
            colliding.push(wizard);
          }
        }
      }
    }
    return colliding;
  }
  /**
   * 
   * @param {Vector2} vector 
   * @param {number} radius 
   * @returns {Magic[]}
   */
  getMagicInRadius(vector,radius) {
    let range = Math.ceil(radius / Math.max(this.cellWidth, this.cellHeight));
    let colliding = [];
    let minX = Math.floor((vector.x-this.startX)/this.cellWidth-range);
    let maxX = minX+range*2;
    let minY = Math.floor((vector.y-this.startY)/this.cellHeight-range);
    let maxY = minY+range*2;
    minX = Math.min(Math.max(0,minX),this.columns-1);
    maxX = Math.min(Math.max(0,maxX),this.columns-1);
    minY = Math.min(Math.max(0,minY),this.rows-1);
    maxY = Math.min(Math.max(0,maxY),this.rows-1);
    // console.log(minX+" "+maxX+"   "+minY+" "+maxY);
    for (let i=minY;i<=maxY;++i) {
      for (let j=minX;j<=maxX;++j) {
        for (let k=0;k<this.cells[j+i*this.columns].m.length;++k) {
          let magic = this.cells[j+i*this.columns].m[k];
          if (vector.sqDistance(magic)<(radius+magic.radius)*(radius+magic.radius)/4) {
            colliding.push(magic);
          }
        }
      }
    }
    return colliding;
  }

  drawWizardsIn(level, x,y,x2,y2, f = "draw") {
    let minX = Math.floor((x-this.startX)/this.cellWidth-1);
    let maxX = Math.ceil((x2-this.startX)/this.cellWidth+1);
    let minY = Math.floor((y-this.startY)/this.cellHeight-1);
    let maxY = Math.ceil((y2-this.startY)/this.cellHeight+1);
    minX = Math.min(Math.max(0,minX),this.columns-1);
    maxX = Math.min(Math.max(0,maxX),this.columns-1);
    minY = Math.min(Math.max(0,minY),this.rows-1);
    maxY = Math.min(Math.max(0,maxY),this.rows-1);
    // console.log(minX+" "+maxX+"   "+minY+" "+maxY);
    for (let i=minY;i<=maxY;++i) {
      for (let j=minX;j<=maxX;++j) {
        for (let k=0;k<this.cells[j+i*this.columns].w.length;++k) {
          // [f] is the functionName here
          this.cells[j+i*this.columns].w[k][f](level);
        }
      }
    }
  }
  drawMagicIn(level, x,y,x2,y2, f = "draw") {
    let minX = Math.floor((x-this.startX)/this.cellWidth-1);
    let maxX = Math.ceil((x2-this.startX)/this.cellWidth+1);
    let minY = Math.floor((y-this.startY)/this.cellHeight-1);
    let maxY = Math.ceil((y2-this.startY)/this.cellHeight+1);
    minX = Math.min(Math.max(0,minX),this.columns-1);
    maxX = Math.min(Math.max(0,maxX),this.columns-1);
    minY = Math.min(Math.max(0,minY),this.rows-1);
    maxY = Math.min(Math.max(0,maxY),this.rows-1);
    // console.log(minX+" "+maxX+"   "+minY+" "+maxY);
    for (let i=minY;i<=maxY;++i) {
      for (let j=minX;j<=maxX;++j) {
        for (let k=0;k<this.cells[j+i*this.columns].m.length;++k) {
          this.cells[j+i*this.columns].m[k][f](level);
        }
      }
    }
  }
}