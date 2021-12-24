const { colors } = require("../config.json");
const { hugs } = require("../storage/image-links.json")
const { Roll } = require("../utils/roll.js");
const { MessageEmbed } = require("discord.js");

const embed = new MessageEmbed()
    .setColor(colors.accent)
    .setTitle("huggies <3");

module.exports = {
  description: "send hugs!",
  category: "fun",

  slash: true,
  testOnly: false,

  options: [{
    name: "target",
    description: "who are we sending hugs to?",
    required: false,
    type: 6
  }],

  callback: ({ interaction: i }) => {

    const hugger = i.member.user.id;
    const hugged = (i.options.getUser("target")) ? `<@${i.options.getUser("target").id}>` : "everyone";
    const gifToSend = hugs[Roll(0, hugs.length)]

    const hugEmbed = new MessageEmbed(embed)
      .setDescription(`<@${hugger}> sends a sweet hug to ${hugged}!!`)
      .setImage(gifToSend);
    
    i.reply({
      embeds: [hugEmbed]
    })
  }
}