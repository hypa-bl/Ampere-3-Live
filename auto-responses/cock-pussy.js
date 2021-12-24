const
  { addToCooldown } = require("../utils/cooldowns"),
  localCD = new Set();

module.exports = {
  patterns: /^(\bcock|pussy)$/i,
  async execute (message) {
    if (/cock/i.test(message.content)) {
      
      if (localCD.has(message.author.id)) return
      else { addToCooldown(message.author.id, 10000, false, localCD); }
    
      try {
        message.react("🅱️")
        message.react("🇪")
        message.react("🇳")
        message.react("🇮")
        message.react("🇸")
      } catch (err) {
        console.log("react fail: " + err);
      }
    }
    else if (/pussy/i.test(message.content)) {
      try {
        message.react("🅱️")
        message.react("🇦")
        message.react("🇬")
        message.react("🇮")
        message.react("🇳")
      } catch (err) {
        console.log("react fail: " + err)
      }
    }
  }
}