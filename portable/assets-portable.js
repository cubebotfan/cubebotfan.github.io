"use strict";
//Ehren Strifling

//loads the game's sprites

//wizard sprites
/** @type {HTMLImageElement[]} */
Wizard.SPRITES = [];
{Wizard.SPRITES
  for (let i=0;i<8;++i) {
    Wizard.SPRITES.push(new Image());
    Wizard.SPRITES[i].src = "https://cdn.jsdelivr.net/gh/Ehren-Strifling/wizard-js-remake/src/sprites/wizard_"+i+".png";
  }
  Object.freeze(Wizard.SPRITES); //don't try editing this
}
//extremely strange how links are relative to the html file instead of the script file.

//Magic Sprites
/** @type {HTMLImageElement[]} */
Magic.SPRITES = [];
{
  for (let i=0;i<8;++i) {
    Magic.SPRITES.push(new Image());
    Magic.SPRITES[i].src = "https://cdn.jsdelivr.net/gh/Ehren-Strifling/wizard-js-remake/src/sprites/magic_"+i+".png";
  }
  Object.freeze(Magic.SPRITES); //don't change this
}

//Healing Magic
/** @type {HTMLImageElement[]} */
MagicHealing.SPRITES = [];
{
  for (let i=0;i<8;++i) {
    MagicHealing.SPRITES.push(new Image());
    MagicHealing.SPRITES[i].src = "https://cdn.jsdelivr.net/gh/Ehren-Strifling/wizard-js-remake/src/sprites/magic_healing_"+i+".png";
  }
  Object.freeze(MagicHealing.SPRITES); //don't change this
}