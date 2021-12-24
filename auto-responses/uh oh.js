const 
  { addToCooldown } = require("../utils/cooldowns"),
  localCD = new Set();

module.exports = {
  patterns: /\b(uh oh)$/i,
  async execute (message) {
    
    if (localCD.has(message.author.id)) return
    else { addToCooldown(message.author.id, 7000, false, localCD); }
    
    try {
      message.react("🇸")
      message.react("🇹")
      message.react("🇮")
      message.react("🇳")
      message.react("🇰")
      message.react("🇾")
    } catch (err) {
      console.log(`failed stinky react: ${err}`)
    }
  }
}