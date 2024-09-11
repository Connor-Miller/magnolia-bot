const { SlashCommandBuilder } = require('discord.js');
const GamesAPI = require('../../neo4j/gamesAPI');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addgame')
        .setDescription('Add a new game to the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the game')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('The platform of the game')
                .setRequired(true)),
    async execute(interaction) {
        const gameName = interaction.options.getString('name');
        const gamePlatform = interaction.options.getString('platform');

        const gamesAPI = new GamesAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        const newGame = {
            name: gameName,
            addDate: new Date(),
            addBy: interaction.user.username,
            lastPlayed: new Date(),
            platform: gamePlatform
        };

        try {
            await gamesAPI.addGame(newGame);
            await interaction.reply(`Successfully added ${gameName} for ${gamePlatform} to the database!`);
        } catch (error) {
            console.error('Error adding game:', error);
            await interaction.reply('An error occurred while adding the game. Please try again later.');
        } finally {
            await gamesAPI.close();
        }
    },
};
