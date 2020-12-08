const config = require('./config.json');
const Client = require('./src/Client.js');
const { Intents } = require('discord.js');

global.__basedir = __dirname;

const intents = new Intents();
intents.add(
  'GUILD_PRESENCES',
  'GUILD_MEMBERS',
  'GUILDS',
  'GUILD_VOICE_STATES',
  'GUILD_MESSAGES',
  'GUILD_MESSAGE_REACTIONS'
);
const client = new Client(config, { ws: { intents: intents } });

function init() {
  client.loadEvents('./src/events');
  client.loadCommands('./src/commands');
  client.login(client.config.token);
}

init();


const DBL = require("dblapi.js");
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3NDY1MjI0Mjc4NzA0MTMxMCIsImJvdCI6dHJ1ZSwiaWF0IjoxNjA1OTAyMTQ1fQ.C1f7HOHLuMJQTzO4Ch0uMyvFujqSL36JtnrYPa4lhaE', client);

dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})

process.on('unhandledRejection', err => client.logger.error(err));
