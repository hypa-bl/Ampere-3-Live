const playerSchema = require("../../utils/schemas/playerSchema"),
  { colors, currencyIco } = require("../../config.json"),
  { MessageEmbed } = require("discord.js"),
  { addMoney, reduceMoney } = require("../../utils/money"),
  { Roll } = require("../../utils/roll"),
  lines = require("../../storage/economyLines.json"),
  images = require("../../storage/image-links.json");

module.exports = {
  aliases: ["rob", "dakaiti"],
  description: "steal from (non passive) players!",
  examples: "```amp steal @Chickonnogget```",
  category: "economy",
  cooldown: "10s",

  minArgs: 1,
  maxArgs: 1,
  expectedArgs: "<player>",

  callback: async ({ message, user, args, client }) => {
    const targetMention = message.mentions.members.first();
    if (!targetMention) {
      message.channel.send("tag a valid target!");
      return;
    }

    if (targetMention.user.id == client.user.id) {
      message.channel.send("<:mike:883402845943115887>");
      return;
    }

    if (
      (await playerSchema.exists({ _id: user.id })) &&
      (await playerSchema.exists({ _id: targetMention.user.id }))
    ) {
      await playerSchema.findOne(
        {
          _id: targetMention.user.id,
        },
        async (err, target) => {
          if (err) {
            console.error(err);
          } else {
            try {
              if (target.passive) {
                message.reply(`${targetMention.user.username} is in passive mode!`);
                return;
              }

              let targetBal = await target.economy.balance;
              let targetBank = await target.economy.bank;
              if (targetBal < 500) {
                message.reply(
                  `your target **${targetMention.user.username}** has less than **500** ${currencyIco} on pocket!`
                );
                return;
              }

              let maxSteal = parseInt(targetBal / 2);
              let amount = ((Roll(1, 100) / 100) * maxSteal).toFixed(0);
              let unlucky = Roll(0, 3) == 2;

              if (!unlucky) {
                await addMoney(amount, user.id, "pocket");
                await reduceMoney(amount, targetMention.user.id, "pocket");

                let embed = new MessageEmbed()
                  .setTitle("Succesful theft!")
                  .setColor(colors.yes)
                  .setThumbnail(
                    images.gambling.won[Roll(0, images.gambling.won.length)]
                  )
                  .setDescription(
                    lines.stealSuccess[Roll(0, lines.stealSuccess.length)]
                      .replace(/Player/g, `**${user.username}**`)
                      .replace(/Target/g, `**${targetMention.user.username}**`)
                      .replace(/Amount/g, `**${amount}** ${currencyIco}`)
                  );
                message.reply({
                  embeds: [embed],
                });
              } else {
                await reduceMoney(amount, user.id, "pocket");
                await addMoney(amount, targetMention.user.id, "pocket");

                let embed = new MessageEmbed()
                  .setTitle("Failed theft 💀💀💀")
                  .setColor(colors.no)
                  .setThumbnail(
                    images.gambling.lost[Roll(0, images.gambling.lost.length)]
                  )
                  .setDescription(
                    lines.stealFail[Roll(0, lines.stealFail.length)]
                      .replace(/Player/gi, `**${user.username}**`)
                      .replace(/Target/gi, `**${targetMention.user.username}**`)
                      .replace(/Amount/gi, `**${amount}** ${currencyIco}`)
                  );
                message.reply({
                  embeds: [embed],
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      ).clone();
    } else {
      message.channel.send(
        "one of you doesn't play this game, become one by checking balance with `amp bal`"
      );
      return;
    }
  },
};