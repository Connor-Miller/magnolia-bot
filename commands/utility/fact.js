const { SlashCommandBuilder } = require('discord.js');
const { getRandomFact } = require('../../misc/getNewFacts.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fact')
		.setDescription('Provides a random fact.'),
	async execute(interaction) {
		const fact = getRandomFact();
		await interaction.reply(`${fact}`);
	},
};