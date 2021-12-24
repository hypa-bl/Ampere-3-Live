const 
  { snipes } = require("../utils/snipe"),
  { colors } = require("../config.json"),
  { MessageEmbed } = require("discord.js");

module.exports = {
  description: "did someone delete their message just now?",
  category: "fun",
  
  slash: false,
  testOnly: false,

  callback: ({ message, channel }) => {
    const foundSnipe = snipes[channel.id];
    if (!foundSnipe) { 
      message.channel.send("there's either nothing or you were too late!");
      return
    }
    const embed = new MessageEmbed()
			.setAuthor(foundSnipe.author.tag)
      .setColor(colors.accent)
      .setThumbnail(foundSnipe.author.avatarURL())
			.setFooter("freshly deleted off the face of earth")
    
		foundSnipe.content ? embed.setDescription(foundSnipe.content) : null;
		foundSnipe.image ? embed.setImage(foundSnipe.image) : null;
    
    (!foundSnipe.content && foundSnipe.image) ?
      embed.setDescription(
      "```\n(deleted with no message text)\n```"
      ) : null;

    message.channel.send({embeds: [embed]});
  }
}