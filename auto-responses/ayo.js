const { addToCooldown } = require('../utils/cooldowns.js');
let cooldown_local = new Set();

module.exports = {
  patterns: /\bayo$/i,
  execute (message) {
    
    if (cooldown_local.has(message.author.id)) return
    else { addToCooldown(message.author.id, 10000, false, cooldown_local); }
    try {
      message.react("😳");
    }
    catch (err){
      console.log(`failed ayo react: ${err}`)
    }
  }
}