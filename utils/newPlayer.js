const playerSchema = require("./schemas/playerSchema"),
  { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../config.json"),
  moment = require("moment");

async function createProfile(message) {
  let amount = 500; 
  playerSchema.create({
    _id: message.author.id,
    economy: {
      balance: amount,
      bank: 0,
      multiplier: 1,
      dailyReset: moment().toISOString()
    },
  });

  let embed = new MessageEmbed()
    .setColor(colors.accent)
    .setThumbnail(message.author.avatarURL())
    .setTitle(`Message for ${message.author.username}`)
    .setDescription(
      `Since it looks like you're a new player(?), here's ${amount} ${currencyIco} to get started\n\nSometimes new players get this message while trying to run economy commands before starting off (ex. \`amp daily\`). In that case run the same command once again.`
    );

  message.channel.send({
    embeds: [embed],
  });
}

async function addServer(message) {
  if (await !playerSchema.exists({
    servers: [message.guildId]
  })) {
    return
  } else {
    await playerSchema.findOneAndUpdate({
      _id: message.author.id
    }, {
      $addToSet: {
        servers: message.guildId
      }
    }, {
      upsert: true
    }, async function(err) {
      if (err) {
        console.error(err)
      }
    }).clone()
  }
}

module.exports = { createProfile, addServer };