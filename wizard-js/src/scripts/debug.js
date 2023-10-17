"use strict";

//Debugging script
//gives statistics on all magic damage per second and healing per second so that
//I can compare and see which magic is overpowered and which magic is garbage.
{
  /**@type {typeof Magic[]} */
  let allMagic = [
    Magic,
    MagicPiercingOrb,
    MagicBigOrb,
    MagicBreath,
    MagicHoming,
    MagicFollow,
    MagicHealing,
    MagicHealPlus
  ];
  /**@type {typeof MagicHealing[]} */
  let healingMagic = [
    MagicHealing,
    MagicHealPlus
  ]
  allMagic.forEach((m)=>{
    console.log(m);
    let maxDps = m.damage / m.cooldown;
    let trueDps = m.damage / Math.max(m.cooldown, m.cost);
    console.log("Max DPS: "+maxDps);
    console.log("Average DPS: "+trueDps);
    let manaDrain = (m.cost - m.cooldown) / m.cooldown;
    console.log("Mana drain per frame: "+manaDrain);
    if (m.pierce>0) {
      maxDps*=m.pierce+1;
      trueDps*=m.pierce+1;
      console.log("Piercing max DPS: "+maxDps);
      console.log("Piercing average DPS: "+trueDps);
    }
    console.log("");
  });

  healingMagic.forEach((m)=>{
    console.log(m);
    let maxHps = m.healthHeal / m.cooldown;
    let trueHps = m.healthHeal / Math.max(m.cooldown, m.cost);
    let maxMps = m.manaHeal / m.cooldown;
    let trueMps = m.manaHeal / Math.max(m.cooldown, m.cost);
    console.log("Max HPS: "+maxHps);
    console.log("Average HPS: "+trueHps);
    console.log("Max MPS: "+maxMps);
    console.log("Average MPS: "+trueMps);
    let manaDrain = (m.cost - m.cooldown) / m.cooldown;
    console.log("Mana drain per frame: "+manaDrain);
    if (m.pierce>0) {
      maxHps*=m.pierce+1;
      trueHps*=m.pierce+1;
      maxMps*=m.pierce+1;
      trueMps*=m.pierce+1;
      console.log("Piercing max HPS: "+maxHps);
      console.log("Piercing average HPS: "+trueHps);
      console.log("Piercing max MPS: "+maxMps);
      console.log("Piercing average MPS: "+trueMps);
    }
    console.log("");
  });
}

/**
 * 
 * @param {number} id Give the wizard the spell with this id instead of giving a random spell.
 * @returns {Magic}
 */
Player.getSpell = function (id) { //TEMP for debugging
  if (!id && id!=0) {
    id = parseInt(prompt("Please input spell id.", Math.floor(Math.random()*8)));
  }
  //id = id || prompt("Please input spell id."); //does not work because 0 is falsy
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



Player.prototype.control2 = Player.prototype.control;
Player.prototype.control = function (level) {
  this.control2(level);
  for (let i=0;i<8;++i) {
    if (level.getInput().key(96+i)) {
      this.spell = this.constructor.getSpell(i);
    }
  }
}