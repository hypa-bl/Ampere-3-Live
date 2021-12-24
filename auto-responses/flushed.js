const { addToCooldown } = require('../utils/cooldowns');
const { Roll } = require("../utils/roll")
const cooldown_local = new Set()

module.exports = {
  patterns: /😳/,
  async execute (message) {
    let lucky = Roll(0,10) == 5;
    if (!lucky) return;
    else {
      if (cooldown_local.has(message.author.id)) return
      else { addToCooldown(message.author.id, 10000, false, cooldown_local); }
      try {
        message.react("🅰");
        message.react("🇾");
        message.react("🅾");
      }
      catch (err){
        console.log(`failed ayo react on flushed: ${err}`)
      }
    }
  }
}