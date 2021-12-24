const { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../../config"),
  playerSchema = require("../../utils/schemas/playerSchema"),
  { addMoney, reduceMoney } = require("../../utils/money");

module.exports = {
  aliases: ["gift", "transfer"],
  description: "Send money you have to other players",
  examples: "```amp gift @Sardar 12345```",
  category: "economy",

  maxArgs: 2,
  minArgs: 2,
  expectedArgs: "<target><amount>",

  callback: async ({ message, args, user }) => {
    const targetMention = message.mentions.members.first();
    if (!targetMention) {
      message.reply("select a valid target!");
      return;
    }

    if (targetMention.user.id == user.id) {
      message.reply("no");
      return;
    }

    if (isNaN(args[0]) && isNaN(args[1])) {
      message.reply("cant see a proper amount specified");
      return;
    }

    const amount = isNaN(args[1]) ? parseInt(args[0]) : parseInt(args[1]);

    if (amount < 1) {
      message.channel.send("<:mike:883402845943115887>");
      return;
    }

    if (
      (await playerSchema.exists({ _id: targetMention.user.id })) &&
      (await playerSchema.exists({ _id: user.id }))
    ) {
      await playerSchema.findOne(
        {
          _id: user.id,
        },
        async (err, player) => {
          if (err) {
            console.error(err);
          } else {
            try {
              const balance = await player.economy.balance;
              const bank = await player.economy.bank;
              let newBal;

              if (balance < 1 && bank < 1) {
                message.reply("bruh you broke");
                return;
              }

              if (balance < amount && bank < amount) {
                message.reply(`you don't even have that much ${currencyIco}!`);
                return;
              }

              await addMoney(amount, targetMention.user.id, "pocket");

              if (balance < amount) {
                await reduceMoney(amount, user.id, "bank");
                newBal = `Pocket: **${balance}** ${currencyIco}\nBank: **${
                  bank - amount
                }** ${currencyIco}`;
              } else {
                await reduceMoney(amount, user.id, "pocket");
                newBal = `Pocket: **${
                  balance - amount
                }** ${currencyIco}\nBank: **${bank}** ${currencyIco}`;
              }

              let embed = new MessageEmbed()
                .setTitle(
                  `**${amount}** ${currencyIco} sent to **${targetMention.user.username}**!`
                )
                .setThumbnail(targetMention.user.avatarURL())
                .setDescription(
                  `> **${user.username}'s** new balance:\n${newBal}`
                )
                .setColor(colors.yes);

              message.reply({
                embeds: [embed],
              });
            } catch (err) {
              console.error(err)
            }
          }
        }
      ).clone();
    } else {
      message.channel.send(
        "one of you doesn't play this game, become a player by checking balance using `amp bal`"
      );
      return;
    }
  },
};