const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BadgeAwardsAPI = require('../../neo4j/badgeAwardsAPI');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbadge')
        .setDescription('Award a badge to a trainer')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of badge')
                .setRequired(true))

        .addUserOption(option => 
            option.setName('user')
                .setDescription('The discord user to award the badge to')
                .setRequired(true))

        .addStringOption(option =>
            option.setName('location')
                .setDescription('The location of the tournament')
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

        const badgeType = interaction.options.getString('type');
        const mentionedUser = interaction.options.getUser('user'); // Getting the user object
        const location = interaction.options.getString('location');

        const badgeAwardsAPI = new BadgeAwardsAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        const newBadgeAward = {
            type: badgeType,
            location: location,
            timestamp: new Date(),
            awardedBy: {
                discordId: interaction.user.id,  // The Discord ID of the user running the command
                discordMention: interaction.user.tag,  // Their tag (e.g. Username#1234)
                serverName: interaction.guild.name,  // Server name from the current interaction
            },
            awardedTo: {
                discordId: mentionedUser.id,  // Mentioned user's Discord ID
                discordMention: mentionedUser.tag,  // Mentioned user's tag (e.g. Username#1234)
                serverName: '',  // Need to get the server name of the mentioned user
            },
        };

        try {
            await badgeAwardsAPI.addBadgeAward(newBadgeAward);
            await interaction.reply(`Congratulations ${mentionedUser.tag}! You have been awarded the ${badgeType} badge from ${location}!`);
        } catch (error) {
            console.error('Error adding badge:', error);

            await interaction.reply('An error occurred while adding the badge. Please try again later.');
        } finally {
            await badgeAwardsAPI.close();
        }
    },
};