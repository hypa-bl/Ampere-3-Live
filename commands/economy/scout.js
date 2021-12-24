const { MessageEmbed } = require("discord.js"),
  playerSchema = require("../../utils/schemas/playerSchema"),
  { Roll } = require("../../utils/roll"),
  { createProfile } = require("../../utils/newPlayer"),
  { colors, currencyIco } = require("../../config.json"),
  lines = require("../../storage/economyLines"),
  { addToCooldown } = require("../../utils/cooldowns"),
  cd = new Set();

module.exports = {
  name: "scout",
  aliases: ["scour", "search", "money"],
  description: "Most basic way to get money.",
  category: "economy",

  slash: false,

  callback: async ({ message: m, user: u }) => {
    if (cd.has(u.id)) {
      m.reply("command in cooldown...");

      return;
    } else {
      addToCooldown(u.id, 8000, false, cd);
    }

    if (await playerSchema.exists({ _id: u.id })) {
      let successfulFind = Roll(0, 10) != 5;
      let amount = Roll(100, 2000);

      if (successfulFind) {
        try {
          await playerSchema.findOne(
            {
              _id: u.id,
            },
            (err, player) => {
              if (err) {
                console.error("error adding scouted money: ", err);
              } else {
                let multiplier = player.economy.multiplier;
                playerSchema
                  .updateOne(
                    {
                      _id: u.id,
                    },
                    {
                      $inc: {
                        "economy.balance": amount * multiplier,
                      },
                    },
                    {
                      new: true,
                    },
                    (err, player) => {
                      if (err) {
                        console.error(err);
                      } else {
                        let d = lines.success[Roll(0, lines.success.length)];
                        let d1 = d.replace(/Player/g, u.username);
                        let description = d1.replace(
                          /Amount/g,
                          `${amount * multiplier} ${currencyIco}`
                        );

                        let SuccessEmbed = new MessageEmbed()
                          .setTitle(
                            `**${amount * multiplier}** ${currencyIco} earned`
                          )
                          .setThumbnail(u.avatarURL())
                          .setColor(colors.yes)
                          .setDescription(description)
                          .setFooter(multiplier + "x multiplier");

                        m.channel.send({
                          embeds: [SuccessEmbed],
                        });
                      }
                    }
                  )
                  .clone();
              }
            }
          ).clone();
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          await playerSchema.findOne(
            {
              _id: u.id,
            },
            async (err, player) => {
              if (err) {
                console.error(err);
              } 
              else {
                try {
                  let oldBal = player.economy.bal;
                  await playerSchema
                    .updateOne(
                      {
                        _id: u.id,
                      },
                      {
                        $inc: {
                          "economy.balance": -amount,
                        },
                      },
                      {
                        new: true,
                      },
                      async (err, player) => {
                        if (err) {
                          console.error(err);
                        } 
                        else {
                          try {
                            let d = lines.fail[0];
                            let d1 = d.replace(/Player/g, u.username);
                            let description = d1.replace(
                              /Amount/g,
                              `${amount} ${currencyIco}`
                            );

                            let failEmbed = new MessageEmbed()
                              .setTitle(`${amount} ${currencyIco} lost!`)
                              .setColor(colors.no)
                              .setThumbnail(u.avatarURL())
                              .setDescription(description)
                              .setFooter("10% chance btw");

                            m.channel.send({
                              embeds: [failEmbed],
                            });
                          } catch (err) {
                            console.error(err)
                          }
                        }
                      }
                    )
                  .clone();
                } catch (err) {
                  console.error(err)
                }
              }
            }
          ).clone();
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      createProfile(m);
    }
  },
};