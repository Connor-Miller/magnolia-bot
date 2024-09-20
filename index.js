const fs = require('node:fs');
const path = require('node:path');
const { Client, IntentsBitField, Collection, Events } = require('discord.js');
const Neo4jHandler = require('./neo4j/neo4jHandler');
require('dotenv').config();

const client = new Client({
  intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
  ],
})

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const neo4jHandler = new Neo4jHandler(process.env.NEO4J_URI, process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD);

client.once('ready', async () => {
	console.log('Ready!');
	await neo4jHandler.connect();
});

// client.on('messageCreate', (message) => {
//   if(message.author.bot) {
//     return;
//   }

//   if(message.content.toLowerCase().includes('pizza time')) {
//     message.reply('no');
//     return;
//   }

// });

client.on(Events.InteractionCreate, async interaction => { // This is for handling slash commands
  if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName); // Figures out if a given interaction is a command

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(process.env.TOKEN);

process.on('SIGINT', async () => {
	console.log('Closing Neo4j connection...');
	await neo4jHandler.close();
	process.exit(0);
});
