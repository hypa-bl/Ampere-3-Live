const { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../../config.json"),
  playerSchema = require("../../utils/schemas/playerSchema");

module.exports = {
  name: "top",
  category: "economy",
  aliases: ["leaderboard", "lb", "lead", "rich"],
  description: "Most rich",

  globalCooldown: "1m",
  callback: async ({ message, client, guild }) => {
    const sort_by = (field, reverse, primer) => {
      const key = primer
        ? function (x) {
            return primer(x[field]);
          }
        : function (x) {
            return x[field];
          };

      reverse = !reverse ? -1 : 1;

      return function (a, b) {
        return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
      };
    };

    try {
      const players = await playerSchema.find({
        servers: 
        {
          $in:
          [ 
            { _id : message.guildId }
          ]
        },
      });
      let playerInfo = [];
      let leaderBoardString = "";

      async function populatePlayers() {
        for (let player of players) {
          let user = await client.users.fetch(player._id);

          playerInfo.push({
            name: user.username,
            total: player.economy.balance + player.economy.bank,
            bank: player.economy.bank
          });
        }
        playerInfo.sort(sort_by("total"), true, parseInt);
      }

      async function getLeaderBoard() {
        try {
          await populatePlayers();
          for (let player of playerInfo) {
            leaderBoardString += `**${player.name}** - ${player.total} [**${((player.bank/player.total) * 100).toFixed(1)}%** in bank]\n`;
          }
        } catch (err) {
          console.error(err);
        }
      }
      await getLeaderBoard();

      let embed = new MessageEmbed()
        .setTitle(`${currencyIco} Leaderboard for ${guild.name}`)
        .setDescription(leaderBoardString)
        .setColor(colors.accent)
        .setThumbnail(guild.iconURL())
        .setFooter("not even I saved this much for hu tao");

      message.channel.send({
        embeds: [embed],
      });
    } catch (err) {
      console.error(err);
    }
  },
};