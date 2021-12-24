const { addToCooldown, cooldown_global} = require("../utils/cooldowns")
  
module.exports = {
  patterns: /\bfamily\b|\bvin\b/i,
  execute (message) {
    
    if (cooldown_global.has(message.author.id)) return
    else { addToCooldown(message.author.id, 30000, false, cooldown_global); }
      
    message.channel.send("family");
  }
}