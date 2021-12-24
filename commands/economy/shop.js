const 
  { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js"),
  { colors, currencyIco, dmgIco } = require("../../config"),
  playerSchema = require("../../utils/schemas/playerSchema"),
  shopItems = require("../../storage/shopItems")

// Embed with all buyable materials
// First, formatting
const shopEmbed = new MessageEmbed()
  .setTitle(`${currencyIco} Currency Shop`)
  .setDescription("Use your (probably) hard earned money to buy consumables, weapons, or crafting materials.\n**Buy using `amp buy <name or alias>`**\n——————————")
  .setColor(colors.accent)

// Then, adding actual materials to the embed with materials

let showMaterials = new MessageEmbed(shopEmbed);
let showWeapons = new MessageEmbed(shopEmbed);
let showConsumables = new MessageEmbed(shopEmbed);

async function populateOptions(matsEmbed, weapsEmbed, consEmbed) {
  for (const itemID in shopItems) {
    let item = shopItems[itemID];
    let aliases = item.aliases ? `\`\nAKA: ${item.aliases.join(", ")}\`` : "";
    let tierIco = getTierIco(item.tier)

    switch (item.category) {
      case "materials": {
        matsEmbed
        .addFields({
          name: `${item.emoji} ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
          value: `> ${item.use}\n${tierIco} Tier ${item.tier}\n\`Buy: ${item.buyPrice}\` ${currencyIco}\n\`Sell: ${item.sellPrice}\` ${currencyIco}${aliases}\n——————————`
        })
        break;
      }
      case "weapons": {
        weapsEmbed
        .addFields({
          name: `${item.emoji} ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
          value: `> ${item.use}\n${tierIco} Tier ${item.tier} | ${dmgIco} ${item.damage} DMG\n\`Buy: ${item.buyPrice}\` ${currencyIco}\n\`Sell: ${item.sellPrice}\` ${currencyIco}${aliases}\n——————————`
        })
        break;
      }
      case "consumables": {
        consEmbed
        .addFields({
          name: `${item.emoji} ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
          value: `> ${item.use}\n${tierIco} Tier ${item.tier} | ${dmgIco} ${item.damage} DMG\n\`Buy: ${item.buyPrice}\` ${currencyIco}\n\`Sell: ${item.sellPrice}\` ${currencyIco}${aliases}\n——————————`
        })
      }
    }
  }
}

populateOptions(showMaterials, showWeapons, showConsumables);

// Here's where we define the list that appears when we first run the shop command
// Its options list the categories of items you can buy
const initialShopList = new MessageActionRow()
  .addComponents(
    new MessageSelectMenu()
      .setCustomId("selectType")
      .setPlaceholder("What kind of items are we buying?")
      .addOptions([
        {
          label: "Materials",
          description: "Get items you can use to craft your own usables 😳",
          value: "showMaterials"
        }, {
          label: "Weapons",
          description: "Does damage. One time buys.",
          value: "showWeapons"
        }, {
          label: "Consumables",
          description: "Items that give stat bonuses on use.",
          value: "showConsumables"
        }, {
          label: "Tools",
          descripton: "idk I'll add shit like fishing rods here someday maybe",
          value: "showTools"
        }
      ])
  )

// Define command
module.exports = {
  description: "Use your (probably) hard earned money to buy consumables, weapons, or crafting materials.",
  examples: "Note: this is a slash command\n```/shop```",
  category: "economy",
  slash: "both",
  callback: async ({ interaction, user, channel, message }) => {
    // thing to do when someone runs amp shop instead
    if (message) {
      message.reply("This one's a slash command, since only slash commands allow organized lists. Do `/shop`")
      return;
    }
    await interaction.deferReply()
    
    if (await !playerSchema.exists({ _id: user.id })) {
      interaction.reply({
        content: "you don't seem to be an existing player. Become one by running `amp bal`",
        ephemeral: true
      })
      return;
    }

    // show our shop intro
    await interaction.editReply({
      embeds: [shopEmbed],
      components: [initialShopList]
    })
    try {
      let embedToShow;
      const collector = channel.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 20000 })

      collector.on("collect", async clicked => {
        if (clicked.user.id === interaction.user.id) {
          
          switch (clicked.values[0]) {
            case "showMaterials": {
              embedToShow = showMaterials;
              break;
            }
            case "showWeapons": {
              embedToShow = showWeapons;
              break;
            }
            case "showConsumables": {
              embedToShow = showConsumables;
              break;
            }
            default: {
              embedToShow = new MessageEmbed()
                .setTitle("WIP")
                .setDescription("this category of shop is not yet designed...");
              break;
            }
          }
          
          interaction.editReply({
            embeds: [embedToShow],
            components: [initialShopList]
          })
        }
      });

      collector.on("end", clicked => {
       interaction.editReply({
         components: []
       }) 
      })
    } catch (err) {
      console.error(err)
    }
  }
}

function getTierIco(itemTier) {
  switch(itemTier) {
    case 1: {
      return "◇";
      break;
    }
    case 2: {
      return "◈";
      break;
    }
    case 3: {
      return "◆";
      break;
    }
    case 4: {
      return "⦿";
      break;
    }
    default: {
      return "?";
      break;
    }
  }
}