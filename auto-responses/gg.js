const 
  { Roll } = require("../utils/roll"),
  emoteSchema = require("../utils/schemas/emoteSchema")
  mongo = require("../utils/mongo"),

module.exports = {
  patterns: /^(gg)$/i,
  async execute (message) {
    
    const lucky = (Roll(0, 10) === 5);
    let 
      allEmotes = [],
      emoteRolled;
    
    await mongo().then(async () => {
      try {
        for await (const emote of emoteSchema.find()) {
          let entry = (emote.animated) ? `<a:${emote.name}:${emote._id}>` : `<:${emote.name}:${emote._id}>`;
          allEmotes.push(entry);
        }
      } catch (err) {
        console.error(err);
      }
    })

    emoteRolled = allEmotes[Roll(0, allEmotes.length)];
    
    if (lucky) {
      message.channel.send("<a:cuddleL:774035239605239840><a:cuddleR:774035310619131934>")
    }
    else message.channel.send(`gg ${emoteRolled}`)
  }
}