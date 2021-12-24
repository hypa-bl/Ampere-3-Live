const
  playerSchema = require("../../utils/schemas/playerSchema"),
  { MessageEmbed } = require("discord.js"),
  { currencyIco, dmgIco, colors } = require("../../config"),
  { createProfile } = require("../../utils/newPlayer"),
  shopItems = require("../../storage/shopItems")

function createPreviewEmbed(item, player, user) {
  let details = "";
  if (item.category === "weapons") {
    details = `\n${dmgIco} ${item.damage}`; 
  }
  
  if (item.category === "materials") {
    details = `\nUsed to craft ${item.recipes.join(", ")}`;
  }

  return new MessageEmbed()
    .setTitle(`**${item.name}**`)
    .setFooter(`Confirm buy?`)
    .setDescription(`${item.description}\n> ${item.use}`)
    .setColor(colors.accent)
    .setThumbnail(`https://cdn.discordapp.com/emojis/${item.emoji.match(/(\d+)(?!(.*):)/g)}.png`)
    //.setImage((item.image) ? (item.image) : "https://media.discordapp.net/attachments/913483149219074092/913862008502366208/default.jpg")
    .addFields([
      {
        name: "Info",
        value: `\nTier ${item.tier}${details}\n${item.buyPrice} ${currencyIco} << Buy`,
        inline: true
      },
      {
        name: `Your balance`,
        value: `${player.economy.balance} ${currencyIco} in pocket\n${player.economy.bank} ${currencyIco} in bank\n`,
        inline: true
      }
    ])
}

module.exports = {
  description: "Buy an item you want from the shop!",
  examples: "```amp buy Mauser C96```",
  category: "economy",
  minArgs: 1,
  expectedArgs: "<item>",
  callback: async ({ message, args, user }) => {
    if (await !playerSchema.exists({ _id: user.id })) {
      createProfile(message);
      return;
    }

    async function search() {
      for (const index in shopItems) {
        let item = shopItems[index];
        try {
          if (args.join(" ").toLowerCase() === item.name.toLowerCase()) {
            return item;
          } 
          else if (item.aliases) {
            if (item.aliases.includes(args.join(" ").toLowerCase())) {
              return item;
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
    }

    let foundItem = await search();

    if (!foundItem) {
      message.reply("item not found in shop!");
      return;
    }
    
    await playerSchema
      .findOne({ _id: user.id })
      .exec(async (err, player) => {
        let pocket = player.economy.balance;
        let bank = player.economy.bank;

        const embed = await createPreviewEmbed(foundItem, player, user);
        
        message.channel.send({
          embeds: [embed]
        }).then(async (msg) => {
          msg.react("✅");
          msg.react("❌");

          const acceptedEmojis = ["✅", "❌"]
          const filter = (reaction, user) => {
          	return acceptedEmojis.includes(reaction.emoji.name) && user.id === message.author.id;
          };
          const collector = msg.createReactionCollector({ filter, time: 20000, max: 1 });
         
          collector.on('collect', async (rxn, user) => {
            if (rxn.emoji.name === "✅") {
              if (foundItem.sellPrice > pocket + bank) {
                message.reply(`you aint even that rich smh`)
                return
              }
              await buy(foundItem, user.id, msg, pocket, bank);
            } else if (rxn.emoji.name === "❌") {
              msg.reply(`canceled buying **${foundItem.name}** for **${user.username}**`)
            }
          });

          collector.on("end", () => {
            msg.reactions.removeAll()
          })
        })
      })
  }
}

async function buy(item, playerId, message, pocket, bank) {
  let query = await playerSchema
    .find({
    _id: playerId
  }).elemMatch("inventory", { name: item.name })

  let itemExists = query.length != 0;
  
  // So weapons cannot be bought if you have em already
  if (item.category === "weapons" && itemExists) {
    message.channel.send(`You alr own a copy of ${item.name}!`);
    return
  }

  // if a player buys without withdrawing, we gotta accomodate a bit by calling the bank
  let pocketAmount = item.buyPrice;
  let bankAmount = 0;
  
  if (item.buyPrice > pocket) {
    pocketAmount = pocket;
    bankAmount = item.buyPrice - pocket;
  }

  // simply add the item if player doesnt own it alr
  if (!itemExists) {
    await playerSchema.findOneAndUpdate({
      _id: playerId
    }, {
      $addToSet: {
        inventory: {
          name: item.name,
          aliases: item.aliases,
          use: item.use,
          emoji: item.emoji,
          description: item.description,
          quantity: item.shopQuantity,
          category: item.category,
          buyPrice: item.buyPrice,
          sellPrice: item.sellPrice,
          tier: item.tier,
          damage: (item.damage) ? item.damage : 0,
          recipes: (item.recipes) ? item.recipes : []
        }
      },
      $inc: {
        "economy.balance": -pocketAmount,
        "economy.bank": -bankAmount
      }
    }, {
      upsert: true
    }).clone();
    message.channel.send(`bought ${item.name}...`)
  }
    
  // Increase inventory quantity of items if they exist
  else {
    await playerSchema.findOneAndUpdate({
      _id: playerId,
      "inventory.name" : item.name 
    }, {
      $inc : {
        "inventory.$.quantity": item.shopQuantity,
        "economy.balance": -pocketAmount,
        "economy.bank": -bankAmount
      }
    }, {}).clone();
    message.channel.send(`you now have **${item.shopQuantity}** more **${item.name}** than before`)
  }
}