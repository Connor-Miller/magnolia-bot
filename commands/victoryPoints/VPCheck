const { SlashCommandBuilder } = require('discord.js');
const TrainerAPI = require('../../neo4j/trainerAPI');
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('vpcheck')
        .setDescription('Check a trainer\'s victory points')
        .addUserOption(option => 


            option.setName('user')
                .setDescription('The discord user to add victory points to')
                .setRequired(true))
        .addNumberOption(option =>

            option.setName('vp')
                .setDescription('The number of victory points to add')
                .setRequired(true)),

    async execute(interaction) {

        const mentionedUser = interaction.options.getUser('user'); // Getting the user object

        const trainerAPI = new TrainerAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {

            const trainer = await trainerAPI.getTrainerByDiscordId(mentionedUser.id);

            const badgeCount = trainer.length;

            const badgeTypes = [...new Set(badgeAwards.map(award => award.type))];

            let replyMessage = `${mentionedUser.tag} has earned ${badgeCount} badge${badgeCount !== 1 ? 's' : ''}!`;

            if (badgeCount > 0) {
                replyMessage += ` They have the following badge types: ${badgeTypes.join(', ')}.`;
            } else {
                replyMessage += ` ...They haven't earned any badges yet.`;
            }

            await interaction.reply(replyMessage);
        } catch (error) {
            console.error('Error adding badge:', error);

            await interaction.reply('An error occurred while adding the badge. Please try again later.');
        } finally {
            await badgeAwardsAPI.close();
        }
    },
};