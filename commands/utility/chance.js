const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chance')
        .setDescription('Calculate the probability of an event happening')
        .addNumberOption(option =>
            option.setName('probability')
                .setDescription('The probability of the event (1/n, where n is the input)')
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('occurrences')
                .setDescription('The number of times the event happened')
                .setRequired(true)
                .setMinValue(0)),
    async execute(interaction) {
        const n = interaction.options.getNumber('probability');
        const occurrences = interaction.options.getInteger('occurrences');

        const probability = 1 / n;
        const chance = probability ** occurrences * 100;

        await interaction.reply(`The chance of an event with 1/${n} (${(probability * 100).toFixed(2)}%) probability happening ${occurrences} time(s) is approximately ${chance.toFixed(4)}%`);
    },
};
