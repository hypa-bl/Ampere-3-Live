const 
  { MessageEmbed } = require("discord.js"),
  { colors, currencyIco } = require("../../config"),
  fs = require("fs")

module.exports = {
  description: "a helpful overview of the economy system",
  category: "fun",

  globalCooldown: "1m",
  callback: async ({ message, client }) => {
    let commandsArr = [];
    let pages = [];
    let page = 0;
    let commandsDir = fs.readdirSync(__dirname);

    async function populateArray(dir) {
      for (const file of dir) {
        command = require(`./${file}`);

        if (command.category != "economy") {
          continue;
        }

        examples = (command.examples) ? `\n• Examples \n${command.examples}` : "";
        aliases = (command.aliases) ? `\n• Aliases \n\`\`\`${command.aliases.slice(1).join(", ")}\`\`\`` : "";
        
        commandsArr.push({
          name: `■ ${file.charAt(0).toUpperCase() + file.slice(1, -3)}`,
          value: `> ${command.description}${aliases}${examples}`,
          inline: false
        })
      }
    }

    await populateArray(commandsDir);

    const filter = (reaction, user) => {
    	return reaction.emoji.name === '➡️' && user.id != client.user.id;
    };

    for (let i = 0; i < commandsArr.length; i += 3) {
      let pageDiv = commandsArr.slice(i, i + 3)
      pages.push(pageDiv)
    }
    try {
      let embed = new MessageEmbed()
        .setTitle(`${currencyIco} Economy system`)
        .setDescription("Help page for all economy commands! As of now no economy commands have slash command variants, so all of them are run using the `amp` prefix")
        .setColor(colors.accent)
        .addFields(pages[0])
        .setFooter("page 1")

      message.channel.send({
        embeds: [embed]
      }).then(async (msg) => {
        msg.react('➡️');
        const collector = msg.createReactionCollector({ filter, time: 45000, dispose: true });

        collector.on('collect', () => {
          changePages();
        });

        collector.on("remove", () => {
          changePages();
        });

        function changePages() {
          page++;

          if (page >= pages.length) {
            page = 0;
          }
          
          let editedEmbed = new MessageEmbed()
            .setTitle(`${currencyIco} Economy system`)
            .setDescription("Help page for all economy commands! As for now no economy commands have slash command variants, so all of them are run using the `amp` prefix")
            .setColor(colors.accent)
            .addFields(pages[page])
            .setFooter(`page ${page + 1}`)

          msg.edit({
            embeds: [editedEmbed]
          })
        }

        collector.on('end', collected => {
          msg.reactions.removeAll()
        });
      })
    } catch (err) {
      console.error(err)
    }
  }
}