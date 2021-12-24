const { colors } = require("../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
  description: "hypa only: deletes commands",
  category: "utility",
  slash: true,
  hidden: true,
  permissions: ["ADMINISTRATOR"],

  options: [{
    name: "command_id",
    description: "command to remove",
    required: true,
    type: 3
  }],

  callback: ({ interaction: i, client }) => {
    const commandId = i.options.getString("command_id");

    let embed;
    try {

      client.application.commands.fetch(commandId)
        .then((command) => {
          command.delete();
        })      
      //i.guild.commands.delete(commandId);

      embed = new MessageEmbed()
        .setTitle("probably a succesful removal")
        .setColor(colors.yes)
        .setDescription(`the command with the id **${commandId}** should have gone poof by now`)
    } catch (err) {
      embed = new MessageEmbed()
        .setTitle("epic fail")
        .setColor(colors.no)
        .setDescription(`somethin went wrong: \`\`\`\n${err}\n\`\`\``)
    }
    
    i.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}