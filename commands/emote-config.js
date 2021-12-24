const {
  colors,
} = require('../config.json');
const {
  MessageEmbed,
} = require('discord.js');
const mongo = require('../utils/mongo');
const emoteSchema = require('../utils/schemas/emoteSchema');

module.exports = {
  description: 'Mod-Only: Add or Remove global emotes from auto emote triggers',
  category: 'utility',

  slash: true,
  testOnly: true,
  permissions: ['MANAGE_MESSAGES', 'MANAGE_EMOJIS'],
  hidden: true,

  options: [{
    name: 'action',
    description: 'are we adding or removing today?',
    required: true,
    type: 3,
  }, {
    name: 'emote_name',
    description: 'name of the emote to work with',
    required: true,
    type: 3,
  }, {
    name: 'emote_id',
    description: 'id value of emote',
    required: false,
    type: 3,
  }, {
    name: 'animated_property',
    description: 'whether the emote is animated or not',
    required: false,
    type: 5,
  }],

  callback: async ({
    interaction: i,
  }) => {
    await i.deferReply();
    
    let action;
    switch (i.options.getString('action')) {
      case 'add':
      case 'adding':
      case 'insert':
      case 'upsert':
      case 'update':
        action = 'add';
        break;
      case 'remove':
      case 'removing':
      case 'delete':
        action = 'delete';
        break;
      default:
        action = 'error';
    }
    const
      eName = i.options.getString('emote_name');
    const eId = i.options.getString('emote_id');
    const eAnim = i.options.getBoolean('animated_property');

    const emote = (eAnim) ? `<a:${eName}:${eId}>` : `<:${eName}:${eId}>`;

    const embedDefault = new MessageEmbed()
      .setTitle('action taken on auto-emote')
      .setDescription(emote);

    const embedToSend = (action === 'add')
      ? new MessageEmbed(embedDefault)
        .setColor(colors.yes)
        .addFields([{
          name: `added ${eName}`,
          value: `should add this emote with id ${eId} with the animated property ${eAnim}`,
          inline: false,
        }])
        .setFooter("If the preview isn't right, remove this entry and try again")
      : new MessageEmbed(embedDefault)
        .setColor(colors.no)
        .addFields([{
          name: `removed ${eName}`,
          value: `should remove this emote with id ${eId} with the animated property ${eAnim}`,
          inline: false,
        }]);

    let commandSuccess;

    await mongo().then(async () => {
      if (action === 'error') {
        i.editReply({
          content: "error deciphering what action to do..."
        })
      };
      if (action === 'add') {
        try {
          if (!eId) {
            i.editReply({
              content: "if you're adding you need to fill on all the otherwise optional fields!"
            })
            return;
          }
          await emoteSchema.findOneAndUpdate({
            _id: eId,
          }, {
            _id: eId,
            name: eName,
            animated: eAnim,
          }, {
            upsert: true,
          });
          commandSuccess = true;
        } catch (err) {
          i.reply({
            content: `failed upsert : \n\`\`\`\n${err}\n\`\`\``,
            ephemeral: true,
          });
          commandSuccess = false;
        }
      } else if (action === 'delete') {
        try {
          emoteSchema.deleteOne({
            name: eName,
          }, (err) => {
            if (err) {
              console.error(err);
            }
          });
        } catch (err) {
          i.reply({
            content: `failed delete : \n\`\`\`\n${err}\n\`\`\``,
            ephemeral: true,
          });
          commandSuccess = false;
        }
      }
    });

    if (commandSuccess) {
      i.editReply({
        embeds: [embedToSend],
      });
    }
  },
};
