const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TrainerAPI = require('../../neo4j/trainerAPI');
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('addvp')
        .setDescription('Add victory points to a trainer')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The discord user to add victory points to')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('vp')
                .setDescription('The number of victory points to add')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),


    async execute(interaction) {
        // Check if the user has the 'moderator' or 'organizer' role
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const hasRequiredRole = member.roles.cache.some(role => 
            role.name.toLowerCase() === 'moderator' || role.name.toLowerCase() === 'organizer'
        );

        if (!hasRequiredRole) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const mentionedUser = interaction.options.getUser('user'); // Getting the user object
        const vpToAdd = interaction.options.getNumber('vp');

        const trainerAPI = new TrainerAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {
            const vpTotal = await trainerAPI.updateVPTotal(mentionedUser.tag, vpToAdd);

            let replyMessage = `<@${mentionedUser.id}> has earned ${vpTotal} victory points!`;
            await interaction.reply(replyMessage);
        } catch (error) {   
            console.error('Error adding VP:', error);
            await interaction.reply('An error occurred while adding the VP. Please try again later.');
        } finally {
            await trainerAPI.close();
        }
    },

};