const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GamesAPI = require('../../neo4j/gamesAPI');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pickgame')
        .setDescription('Randomly pick a game from the database and display its details'),
    async execute(interaction) {
        const gamesAPI = new GamesAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {
            await this.pickAndDisplayGame(interaction, gamesAPI);
        } catch (error) {
            console.error('Error picking random game:', error);
            await interaction.reply('An error occurred while picking a random game. Please try again later.');
        } finally {
            await gamesAPI.close();
        }
    },

    async pickAndDisplayGame(interaction, gamesAPI) {
        const randomGame = await gamesAPI.getRandomGame();
        
        const gameDetails = `
Name: ${randomGame.name}
Platform: ${randomGame.platform}
Added By: ${randomGame.addBy}
Add Date: ${randomGame.addDate}
Last Played: ${randomGame.lastPlayed}
        `.trim();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('choose_game')
                    .setLabel('Choose Game')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('try_again')
                    .setLabel('Try Again')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({
            content: `Randomly picked game:\n${gameDetails}\n\nWhat do you think?`,
            components: [row]
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'choose_game') {
                await gamesAPI.playGame(randomGame);
                await i.update({ content: `You've chosen to play ${randomGame.name}!`, components: [] });
            } else if (i.customId === 'try_again') {
                await this.pickAndDisplayGame(interaction, gamesAPI);
            } else if (i.customId === 'cancel') {
                await i.update({ content: 'Game selection cancelled.', components: [] });
            }
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Game selection timed out.', components: [] });
            }
        });
    },
};
