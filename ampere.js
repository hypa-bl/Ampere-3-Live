// All the imports
const 
  { Client, Intents, Collection } = require("discord.js"),
  { defaultPrefix, updateGuilds, hypa, colors, currencyIco } = require("./config.json"),
  WOKCommands = require("wokcommands"),
  mongo = require("./utils/mongo"),
  fs = require("fs"),
  path = require("path"),
  mongoose = require('mongoose');

// Perms for discord 13
const ampere = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
	partials: ["MESSAGE", "REACTION", "USER"]
});

// Online keeper
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => console.log(`listening at http://localhost:${port}`));

// Events
ampere.on('ready', async () => {
  
  ampere.user.setStatus("idle");
  ampere.user.setActivity({
    name: "slash commands!",
    type: "LISTENING",
  });

  new WOKCommands(ampere, {
    commandsDir: path.join(__dirname, 'commands'),
    featuresDir: path.join(__dirname, 'features'),
    testServers: updateGuilds,
    botOwners: [hypa],
    disabledDefaultCommands: [
      // 'help',
      'command',
      'language',
      // 'prefix',
      'requiredrole',
      'channelonly'
    ],
    mongoUri: `mongodb+srv://hypa1:${process.env.MDBPASS}@amperedb.8y2am.mongodb.net/AmpereDB?retryWrites=true&w=majority`,
  })
    .setCategorySettings([
      {
        name: "fun",
        emoji: "<a:jammin:854954156631916574>",
      },
      {
        name: "utility",
        emoji: "<a:pepegacredit:867148159335137290>",
      },
      {
        name: "testing",
        emoji: "<a:modcheck:867145732368367647>",
      },
      {
        name: "economy",
        emoji: currencyIco
      }
    ])
    .setColor(colors.accent)
    .setDefaultPrefix(defaultPrefix);

  try {
    await mongo()
  } catch (err) { console.error("ayo failed to connect to MongoDB on boot", err)}
})

// Define mongoDB connection events
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

ampere.login(process.env.TOKEN);