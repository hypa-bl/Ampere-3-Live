const
  fs = require("fs"),
  path = require("path"),
  autoTrigFolder = path.join(__dirname, "..", "auto-responses");

module.exports = (client, instance) => {
  client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;
    
    // Auto-triggers
    const autoTrigFiles = fs
      .readdirSync(autoTrigFolder)
      .filter((file) => file.endsWith(".js"));

    for (const file of autoTrigFiles) {
      const autoTrig = require(`${autoTrigFolder}/${file}`);
      if (autoTrig.patterns.test(message.content)) {
        autoTrig.execute(message);
      }
    }
  })
}

module.exports.config = {
  displayName: "Auto responses"
}