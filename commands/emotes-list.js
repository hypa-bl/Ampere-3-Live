const { MessageEmbed } = require("discord.js");
const { colors } = require("../config.json");
const mongo = require("../utils/mongo");
const emoteSchema = require("../utils/schemas/emoteSchema");

const initEmbed = new MessageEmbed()
  .setTitle("Poor mans nitro")
  .setColor(colors.accent);

module.exports = {
  description: "All emotes. You're probably looking for this.",
  category: "fun",
  aliases: ["emoji", "emojis", "emotes"],
  slash: "both",

  testOnly: false,

  callback: async ({ interaction: i, message: m }) => {
    let emotesList = [];
    const sectionDivision = 5;

    await mongo().then(async () => {
      try {
        for await (const emote of emoteSchema.find()) {
          let entry = emote.animated
            ? `<a:${emote.name}:${emote._id}>`
            : `<:${emote.name}:${emote._id}>`;
          emotesList.push(`${entry} - ${emote.name}`);
        }
      } catch (err) {
        console.log("error grabbing emotes");
        console.error(err);
      }
    });

    const updatedEmbed = new MessageEmbed(initEmbed).setDescription(
      `These will automatically come and replace your messages with emotes, formatted with a bot instance that does its best to look as if you sent the message!\n**${emotesList.length}** emotes available at the moment.`
    );
    emotesList.sort();

    let k, j, temporary;
    for (k = 0, j = emotesList.length; k < j; k += sectionDivision) {
      temporary = emotesList.slice(k, k + sectionDivision);
      updatedEmbed.addField("\u200b", temporary.join("\n"), true);
    }

    if (i) {
      i.reply({
        embeds: [updatedEmbed],
        ephemeral: true,
      });
    }
    if (m) {
      m.channel.send({
        content:
          "tip: you can do /emotes-list instead to get a message that doesn't hog most of the chat for everyone!",
        embeds: [updatedEmbed],
      });
    }
  },
};
