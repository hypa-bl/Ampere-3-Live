const { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../../config.json"),
  { createProfile } = require("../../utils/newPlayer"),
  playerSchema = require("../../utils/schemas/playerSchema"),
  moment = require("moment");

module.exports = {
  description: "Get your daily virtual money",
  category: "economy",

  slash: false,
  callback: async ({ message }) => {
    const dailyAmount = 10000;
    const rn = moment().toISOString();
    let eligibleForDaily;

    // converter I yoinked off internet
    function msToTime(ms) {
      let seconds = (ms / 1000).toFixed(1);
      let minutes = (ms / (1000 * 60)).toFixed(1);
      let hours = (ms / (1000 * 60 * 60)).toFixed(1);
      let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

      if (seconds < 60) return seconds + " Sec";
      else if (minutes < 60) return minutes + " Min";
      else if (hours < 24) return hours + " Hrs";
      else return days + " Days";
    }

    // func to give daily
    async function giveDaily(oldBal, amount, oldDailyTime) {
      playerSchema
        .updateOne(
          {
            _id: message.author.id,
          },
          {/*
            $inc: 
            {
              "economy.balance": amount
            },*/
            $set: 
            {
              "economy.balance": oldBal + amount,
              "economy.dailyReset": moment().add(1, "days").toISOString()
            }
          },
          {
            upsert: true,
          },
          (err, player) => {
            if (err) {
              console.error(err);
            } else {
              let yesDailyEmbed = new MessageEmbed()
                .setTitle("Daily got!")
                .setColor(colors.yes)
                .setThumbnail(message.author.avatarURL())
                .setDescription(
                  `this should add **${dailyAmount}** ${currencyIco} to your wallet!`
                );

              message.channel.send({
                embeds: [yesDailyEmbed],
              });
            }
          }
        )
        .clone()
        .catch((err) => {
          console.error("caught error: ", err)
        })
    }

    // func to no daily
    async function denyDaily() {
      playerSchema
        .findOne({
          _id: message.author.id,
        })
        .exec((err, player) => {
          if (err) {
            console.error(
              "error when sending not eligible for daily message! ",
              err
            );
          } else {
            //let timeRemaining = moment(rn).diff(moment(player.economy.dailyReset))
            let timeRemaining = moment(player.economy.dailyReset).diff(moment(rn))

            let noDailyEmbed = new MessageEmbed()
              .setTitle("Too soon!")
              .setThumbnail(message.author.avatarURL())
              .setColor(colors.no)
              .setDescription(
                `Could not retrieve daily credits. **${msToTime(timeRemaining)}** left`
              );
            message.channel.send({
              embeds: [noDailyEmbed]
            })
          }
        });
    }

    // check if player exists and act accordingly
    if (await playerSchema.exists({ _id: message.author.id })) {
      playerSchema
        .findOne({
          _id: message.author.id,
        })
        .exec(async (err, player) => {
          if (err) {
            console.error(err);
          } else {
            let oldBalance = player.economy.balance;
            let oldDailyTime = (player.economy.dailyReset) ? player.economy.dailyReset : rn;

            eligibleForDaily = (moment(rn).diff(moment(oldDailyTime)) >= 0)

            if (eligibleForDaily) {
              giveDaily(oldBalance, dailyAmount, oldDailyTime);
            } 
            else {
              denyDaily();
            }
          }
        });
    } else {
      createProfile(message);
    }
  },
};