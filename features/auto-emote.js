const 
  emoteSchema = require("../utils/schemas/emoteSchema"),
  { addToCooldown } = require("../utils/cooldowns"),
  emoteCD = new Set();
  
module.exports = (client, instance) => {
  client.on("messageCreate", async (message) => {
    
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;

    // Emotes
    // limit our message checking so that bot doesnt go on reading big ass paragraphs which obv arent emote triggers
    if (message.content.length < 20) {
      // return if any unnecessary characters are in the message
      if (!/^([A-Z])+/i.test(message.content)) return;
      if (
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g.test(
          message.content
        )
      )
        return;

      let resultingID;
      let animated;

      try {
        // here's where we work with sending the emote if you were looking for it
        if (
          await emoteSchema.findOne({ name: message.content.toLowerCase() })
        ) {
          let formattedEmoteReadyToSend;

          // grab our emote data from db and do the stuff right there
          emoteSchema
            .findOne({ name: message.content.toLowerCase() })
            .exec(async function (err, doc) {
              if (err) {
                console.error("trouble getting emote: " + err);
              }

              resultingID = await doc._id;
              animated = await doc.animated;

              // some decor
              const emoteName = message.content,
                emoteID = resultingID;

              formattedEmoteReadyToSend = animated
                ? `<a:${emoteName}:${emoteID}>`
                : `<:${emoteName}:${emoteID}>`;
            });

          // firstly, cooldowns
          if (emoteCD.has(message.author.id)) {
            return;
          } else {
            addToCooldown(message.author.id, 7000, false, emoteCD);
          }

          // checking if we have perms to delete, or if we're in dms where we obv cant delete stuff
          const permsCheck =
            message.channel.type !== "dm" &&
            message.channel
              .permissionsFor(message.guild.me.user)
              .has("MANAGE_MESSAGES");

          if (permsCheck) {
            const nameOfSender = message.member.nickname
              ? message.member.nickname
              : message.author.username;

            // send emote as webhook
            const trigger = message.id;

            try {

              //clear created webhooks so that we can keep posting
              message.channel.fetchWebhooks().then((webhooks) => {
                webhooks.forEach((wh) => wh.delete());
              });

              const webhook = await message.channel.createWebhook(
                nameOfSender,
                {
                  avatar: message.author.avatarURL(),
                  reason: "emote"
                }
              );

              if (formattedEmoteReadyToSend !== undefined) {
                try {
                  webhook.send(formattedEmoteReadyToSend);
                  // delete author message
                  message.channel.messages.fetch(trigger).then((original) => {
                    original.delete();
                  });
                }
                catch (err) {
                  console.error(err)
                }
              } else {
                console.log("emote is empty!")
              }
            } catch (err) {
              console.error("webhook sending err: " + err);
            }
          }

          // if that formality can't be had, just drop the emote as bot
          else {
            message.channel.send(`<:${emoteName}:${emoteID}>`);
          }
        }
      } catch (err) {
        console.log(`auto emote epic fail: ${message.content} - ${err}`);
      }
    }
  })
}

module.exports.config = {
  displayName: "Auto emote"
}