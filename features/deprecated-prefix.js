const
  { MessageEmbed } = require("discord.js"),
  { colors } = require("../config.json");

module.exports = (client, instance) => {
  client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;

    if (/^~(?!~)/.test(message.content)) {
      const deprecationEmbed = new MessageEmbed()
        .setTitle("ayo wait")
        .setColor(colors.no)
        .setDescription(
          "The prefix is now ```amp ``` (with a space). Well regardless, I want you to use slash commands from now on instead, thats where most commands were moved to <:agre:862045710793572352>"
        );
      message.reply({
        embeds: [deprecationEmbed],
      });
    }
  })
}

module.exports.config = {
  displayName: "Deprecated Prefix Warning"
}