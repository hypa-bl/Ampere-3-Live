const { MessageEmbed } = require("discord.js"),
  playerSchema = require("../../utils/schemas/playerSchema"),
  { colors, currencyIco } = require("../../config.json"),
  lines = require("../../storage/economyLines.json"),
  { createProfile } = require("../../utils/newPlayer"),
  { Roll, RollFloat } = require("../../utils/roll"),
  { addMoney, reduceMoney } = require("../../utils/money"),
  images = require("../../storage/image-links.json"),
  { addToCooldown } = require("../../utils/cooldowns"),
  cd = new Set(),
  monemote = "<a:monee:911278299240628264>";

module.exports = {
  description: "Gambling",
  category: "economy",

  slash: false,

  minArgs: 1,
  maxArgs: 1,
  expectedArgs: "<amount>",

  callback: async ({ message, user, args }) => {
    if (!args[0]) {
      message.reply("specify an amount!");
      return;
    } else {
      if (isNaN(args[0]) && args[0] != "all") {
        message.reply("make sure you bet a proper value");
        return;
      }
      if (await playerSchema.exists({ _id: user.id })) {
        // get balance
        try {
          await playerSchema
            .findOne({
              _id: user.id,
            })
            .exec(async (err, player) => {
              if (err) {
                console.error(err);
              } else {
                try {
                  // initialize amounts
                  let balance = await player.economy.balance;
                  let multiplier = await player.economy.multiplier;
                  let amount = args[0] == "all" ? balance : args[0];

                  // check if player can gamble
                  if (balance < 500) {
                    message.reply(
                      `you have less than 500 ${currencyIco} in your pocket which ain't enough!`
                    );
                    return;
                  } else if (amount < 500) {
                    message.reply(
                      `bet higher! (500+ ${currencyIco} to be exact)`
                    );
                    return;
                  } else if (balance < amount) {
                    message.reply("you aint even that rich smh");
                    return;
                  }

                  // cooldowns...
                  if (cd.has(user.id)) {
                    message.reply("command in cooldown...");
                    return;
                  } else {
                    addToCooldown(user.id, 8000, false, cd);
                  }

                  // go ahead and gamble
                  let lucky = Roll(0, 4) == 2 || Roll(1, 4 == 3);

                  if (lucky) {
                    let wonAmount = parseInt(
                      (amount / 1.5) * RollFloat(1, 3) * multiplier
                    );
                    await addMoney(wonAmount, user.id, "pocket");

                    let embed = new MessageEmbed()
                      .setTitle(`Won gamble!`)
                      .setColor(colors.yes)
                      .setThumbnail(
                        images.gambling.won[Roll(0, images.gambling.won.length)]
                      )
                      .setDescription(
                        `${user.username} walked out with ${wonAmount} ${currencyIco}!!`
                      )
                      .addFields(
                        {
                          name: `Old balance`,
                          value: `${balance} ${currencyIco}`,
                          inline: true,
                        },
                        {
                          name: `New balance`,
                          value: `${balance + wonAmount} ${currencyIco}\n**${(
                            (wonAmount / amount) *
                            100
                          ).toFixed(1)}%** won\n${monemote}`,
                          inline: true,
                        }
                      )
                      .setFooter(`${multiplier}x multiplier`);

                    message.reply({
                      embeds: [embed],
                    });
                  } else {
                    await reduceMoney(amount, user.id, "pocket");

                    let embed = new MessageEmbed()
                      .setTitle(`Lost gamble!`)
                      .setColor(colors.no)
                      .setThumbnail(
                        images.gambling.lost[
                          Roll(0, images.gambling.lost.length)
                        ]
                      )
                      .setDescription(
                        `${user.username} forfeited ${amount} ${currencyIco} with their terrible luck!`
                      )
                      .addFields(
                        {
                          name: `Old balance`,
                          value: `${balance} ${currencyIco}`,
                          inline: true,
                        },
                        {
                          name: `New balance`,
                          value: `${balance - amount} ${currencyIco}`,
                          inline: true,
                        }
                      );

                    message.reply({
                      embeds: [embed],
                    });
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            });
        } catch (err) {
          console.error(err);
        }
      } else {
        // make a new profile
        createProfile(message);
      }
    }
  },
};
