const 
  { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../../config.json"),
  { createProfile } = require("../../utils/newPlayer"),
  playerSchema = require("../../utils/schemas/playerSchema");

module.exports = {
  aliases: ["with"],
  description: "Move the money from your big ass safe to your pocket",
  examples: "```amp withdraw 5000\namp with all```",
  category: "economy",

  minArgs: 0,
  maxArgs: 1,

  expectedArgs: "[amount]",
  syntaxError: `make sure you provide a valid amount!`,

  cooldown: "7s",

  slash: false,
  callback: async ({ message, args }) => {
    // extensive testing for valid input
    if (args[0] && isNaN(args[0]) && args[0] != "all" && !/k\b/i.test(args[0])) {
      message.channel.send("make sure you provide a valid amount!");
      return;
    } else if (args[0] == "all") {
      args[0] = false
    } else if (/k\b/i.test(args[0])) {
      args[0] = args[0].slice(0,-1) * 1000
    }

    const filter = { _id: message.author.id };
    const settings = { upsert: true, new: true };
    let thingsToUpdate, oldBal, oldBank

    // interrupt action if new player
    if (await !playerSchema.exists({ _id: message.author.id })) {
      createProfile(message)
      return;
    }

    // get old balances
    const oldInfo = await playerSchema.findOne(filter).exec()
    oldBal = oldInfo.economy.balance;
    oldBank = oldInfo.economy.bank;

    // did our guy tell how much to put in?
    if (args[0]) {
      if (args[0] > oldBank) {
        message.channel.send("you aint got that much on ya");
        return
      } 
      thingsToUpdate = {
        $inc: { 
          "economy.balance": parseInt(args[0]),
          "economy.bank": -parseInt(args[0]) 
        }
      }
    } else {
      thingsToUpdate = {
        $inc: {
          "economy.balance": oldBank,
          "economy.bank": -oldBank
        }
      }
    }
    let withdrawnStuff = await playerSchema.findOneAndUpdate(filter, thingsToUpdate, settings).clone()

    newBal = (args[0]) ? (oldBal + parseInt(args[0])) : (parseInt(oldBank) + parseInt(oldBal));
    newBank = args[0] ? (oldBank - parseInt(args[0])) : 0;
    
    let resultEmbed = new MessageEmbed()
      .setTitle("Moved to pocket!")
      .setThumbnail(message.author.avatarURL())
      .setDescription(`Your new balances:\n**${newBal}** ${currencyIco} in pocket.\n**${newBank}** ${currencyIco} in bank.`)
      .setColor(colors.yes)

    message.channel.send({embeds:[resultEmbed]})
  }
}