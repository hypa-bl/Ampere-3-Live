const
  { colors } = require("../config.json"),
  { MessageEmbed } = require("discord.js");

module.exports = { 
  description: "gets an emote ampere has access to",
  category: "utility",
  
  slash: true,
  testOnly: false,
  
  options: [{
    name: "name",
    description: "what's the emote called?",
    required: true,
    type: 3
  }],

  callback: ({ interaction: i, client }) => {

    const
      eName = i.options.getString("name"),
      emote = client.emojis.cache.find(emoji => emoji.name === eName);

    if (!emote) {
      i.reply({
        content: `couldn't find emote with name ${eName}!`,
        ephemeral: true
      });
      return
    }
    
    const
      formattedEmote = emote.animated ?
         `<a:${emote.name}:${emote.id}>` : 
         `<:${emote.name}:${emote.id}>`,

      animatedOrNo = emote.animated ? 
        "moves and grooves" : 
        "still image",

      embed = new MessageEmbed()
        .setColor(colors.accent)
        .setDescription(formattedEmote)
        .setFooter(emote.id, emote.guild.iconURL())
        .addFields([{
          name: emote.name,
          value: `${animatedOrNo}\nFrom ${emote.guild.name}`,
          inline: false
        }])

    i.reply({
      embeds: [embed]
    })
  }
}