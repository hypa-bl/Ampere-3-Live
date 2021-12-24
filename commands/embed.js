const axios = require("axios");

module.exports = {
  description: "for some nicely decorated embeds",
  permissions: ["ADMINISTRATOR"],
  category: "utility",
  testOnly: true,
  slash: false,
  
  minArgs: 2,
  maxArgs: 2,
  expectedArgs: "<channelId><embedJSON>",
  
  callback: async ({ args, client }) => {
    const channel = client.channels.cache.get(args[0]);
        
    await axios.get(args[1]).then(async (json) => {
      channel.send({ embeds: [json.data.embed] })
    })
  }
}