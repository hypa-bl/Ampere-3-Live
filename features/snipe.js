const { snipe, snipes } = require("../utils/snipe"),
  emoteSchema = require("../utils/schemas/emoteSchema"),
  mongo = require("../utils/mongo");

module.exports = (client, instance) => {
  client.on("messageDelete", async (message) => {
    if (message.partial || (message.embeds.length && !message.content)) return; // ignore if content is null or deleted embed

    let emoteName;

    // exclude custom emotes?
    if (/^(<:)/.test(message.content) || /^(<a:)/.test(message.content)) return;

    // exclude nqn triggers
    if (/^(:)/.test(message.content)) return;

    // exclude our own custom emote triggers
    const result = await emoteSchema
      .findOne({ name: message.content })
      .select("name")
      .lean();
    if (result) {
      emoteName = true;
    }

    if (emoteName) return;

    snipe(
      message.channel.id,
      message.author,
      message.content,
      message.attachments.first() ? message.attachments.first().proxyURL : null
    );
  })
}

module.exports.config = {
  displayName: "Snipe Deleted Message"
}