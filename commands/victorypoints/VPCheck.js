const { SlashCommandBuilder } = require('discord.js');
const TrainerAPI = require('../../neo4j/trainerAPI');
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('vpcheck')
        .setDescription('Check a trainer\'s victory points')
        .addUserOption(option => 

            option.setName('user')
                .setDescription('The discord user to check the victory points of')
                .setRequired(true)),

    async execute(interaction) {

        const mentionedUser = interaction.options.getUser('user'); // Getting the user object

        const trainerAPI = new TrainerAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {

            const vpTotal = await trainerAPI.getVPTotal(mentionedUser.tag);

            let replyMessage = `<@${mentionedUser.id}> has a total of ${vpTotal} victory points!`;

            if (vpTotal <= 0) {
                replyMessage += ` ...I see... They're not very good at this game, are they?`;
            }

            await interaction.reply(replyMessage);
        } catch (error) {
            console.error('Error retrieving VP:', error);

            await interaction.reply('An error occurred while retrieving the VP. Please try again later.');

        } finally {
            await trainerAPI.close();
        }
    },

};