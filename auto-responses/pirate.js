const
  { addToCooldown } = require("../utils/cooldowns"),
  localcd = new Set();

module.exports = {
  patterns: /\bpirate\b|\bpiracy\b/i,
  async execute (message) {
    try {
    if (localcd.has(message.author.id)) return
    else { addToCooldown(message.author.id, 7000, false, localcd); }
      message.channel.send("arr");
    }
    catch (err){
      console.log(`failed pirate reply: ${err}`)
    }
  }
}