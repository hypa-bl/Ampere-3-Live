const { colors } = require("../config.json"),
  { MessageEmbed } = require("discord.js"),
  fs = require("fs"),
  path = require("path"),
  { version } = require("../package.json"),
  embed = new MessageEmbed()
    .setTitle("Ampere bot")
    .setColor(colors.accent)
    .setDescription(
      `Version ${version}\nby hypa <a:goos:774020452959911956>\ndefault prefix is amp\n**NOTE:** if you're looking for help with economy commands use \`amp economy\``
    )
    .addFields(
      {
        name: "Info",
        value:
          "⦾ General purpose bot. Will probably do a thing or two depending on how much of the code the dev breaks every update.",
        inline: false,
      },
      {
        name: "Features",
        value:
          "⦾ Has a handy dandy auto-emote feature. Check it out using ```/emotes-list``` or ```amp emotes```\n⦾ Some auto-responses, and a snipe feature you can't opt out from. You're welcome.",
        inline: false,
      }
    );

const commandsListRaw = fs.readdirSync(__dirname),
  responseListRaw = fs.readdirSync(path.join(__dirname, "..", "auto-responses"));

let commandsList = [];
let responseList = [];

commandsListRaw.forEach(command => {
  let cleaned = command.slice(0, -3)
  commandsList.push(cleaned)
})

responseListRaw.forEach(response => {
  let cleaned = response.slice(0, -3)
  responseList.push(cleaned)
})

module.exports = {
  name: "help",
  description: "About Ampere",
  category: "utility",
  aliases: "info",

  slash: "both",
  testOnly: false,
  hidden: false,

  callback: ({ interaction: i, message: m, client }) => {
    const infoEmbed = new MessageEmbed(embed)
      .setThumbnail(client.user.avatarURL())
      .addFields(
        {
          name: "Commands",
          value: `${commandsList.join(", ")}\nSome of these are slash-only, admin-only or both`,
        },
        {
          name: "Auto-responses",
          value: responseList.join(", "),
        }
      );

    if (i) {
      i.reply({
        embeds: [infoEmbed],
        ephemeral: true,
      });
    }
    if (m) {
      m.channel.send({
        embeds: [infoEmbed],
      });
    }
  },
};
