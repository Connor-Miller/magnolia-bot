const { SlashCommandBuilder } = require('discord.js');
const BadgeAwardsAPI = require('../../neo4j/badgeAwardsAPI');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('badgecheck')
        .setDescription('Check a trainer for badges')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The discord user to check for badges')
                .setRequired(true)),

    async execute(interaction) {
        const mentionedUser = interaction.options.getUser('user'); // Getting the user object
        const badgeAwardsAPI = new BadgeAwardsAPI(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD);

        try {
            const badgeAwards = await badgeAwardsAPI.getBadgeAwardsByTrainer(mentionedUser.tag);

            const badgeCount = badgeAwards.length;
            const badgeTypes = badgeAwards.map(award => award.type).filter(Boolean);

            let replyMessage = `<@${mentionedUser.id}> has earned ${badgeCount} badge${badgeCount !== 1 ? 's' : ''}!`;
            if (badgeCount > 0) {
                replyMessage += ` They have the following badge types: ${badgeTypes.join(', ')}.`;

            } else {
                replyMessage += ` ...Well, that's disappointing.`;
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