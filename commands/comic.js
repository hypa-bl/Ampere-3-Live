const
  { MessageEmbed } = require("discord.js"),
  { colors } = require("../config.json");

module.exports = {
  name: "comic",
  aliases: "secondsky",
  description: "Read hypa's comic 😳",
  category: "utility",

  slash: "both",
  testOnly: false,

  callback: ({ interaction: i, message: m }) => {
    
    const embed = new MessageEmbed()
      .setColor(colors.accent)
      .setTitle('Comic | Project Second Sky')
			.setURL(
					'https://www.webtoons.com/en/challenge/project-second-sky/list?title_no=410260'
				)
			.setAuthor('Line Webtoon')
			.setDescription('Read the comic on Webtoon Canvas!')
			.setThumbnail('https://i.imgur.com/fHELRy7.png')
			.setFooter('Click or tap on this embed to view.');
    
    if (i) {
      i.reply({
        embeds: [embed]
      })
    }
    if (m) {
      m.channel.send({
        embeds: [embed]
      })
    }
  }
}