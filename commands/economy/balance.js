const playerSchema = require("../../utils/schemas/playerSchema"),
  { createProfile, addServer } = require("../../utils/newPlayer"),
  { colors, currencyIco } = require("../../config.json"),
  { MessageEmbed } = require("discord.js");

module.exports = {
  description: "Check balances on your wallet and bank. Also makes you visible in the leaderboard.",
  aliases: ["bal", "bank"],
  category: "economy",

  slash: false,

  callback: async ({ message }) => {
    async function grabInfo() {
      let embed;

      if (await playerSchema.exists({ _id: message.author.id })) {
        playerSchema
          .findOne({ _id: message.author.id })
          .exec(async function (err, player) {
            if (err) {
              console.error("ayo error finding player id: ", err);
            }
            let balance = await player.economy.balance;

            embed = new MessageEmbed()
              .setColor(colors.accent)
              .setThumbnail(message.author.avatarURL())
              .setTitle(`Balance for **${message.author.username}**`)
              .setDescription(
                `**${balance}** ${currencyIco} in your pocket.\n**${player.economy.bank}** ${currencyIco} in bank safe.`
              )
              .setFooter("Confused on what to do next? run amp economy to see all available commands!")
            message.channel.send({
              embeds: [embed]
            });
          });
        addServer(message)
      } else {
        createProfile(message)
      }

      return await embed
    }
    grabInfo()
  },
};