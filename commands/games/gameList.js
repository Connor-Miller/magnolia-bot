const { SlashCommandBuilder } = require('discord.js');
const GamesAPI = require('../../neo4j/gamesAPI');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamelist')
        .setDescription('Get a list of all games in the database'),
    async execute(interaction) {
        const gamesAPI = new GamesAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {
            const games = await gamesAPI.getAllGames();
            const gameList = games.map(game => `${game.name} (${game.platform})`).join('\n');
           
            await interaction.reply(`List of all games:\n${gameList}`);
            
        } catch (error) {
            console.error('Error getting game list:', error);
            await interaction.reply('An error occurred while fetching the game list. Please try again later.');
        } finally {
            await gamesAPI.close();
        }
    },
};
