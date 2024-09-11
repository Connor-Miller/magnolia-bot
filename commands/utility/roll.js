const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls dice with a given number of sides.')
    .addIntegerOption(option =>
      option.setName('dice')
        .setDescription('The number of dice to roll.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('The number of sides each die has.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Roll with advantage, disadvantage, or normal.')
        .addChoices(
          { name: 'Normal', value: 'normal' },
          { name: 'Advantage', value: 'advantage' },
          { name: 'Disadvantage', value: 'disadvantage' }
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const numDice = interaction.options.getInteger('dice');
    const numSides = interaction.options.getInteger('sides');
    const mode = interaction.options.getString('mode') || 'normal';

    const rollDie = () => Math.floor(Math.random() * numSides) + 1;
    let results = [];

    for (let i = 0; i < numDice; i++) {
      if (mode === 'advantage' || mode === 'disadvantage') {
        const roll1 = rollDie();
        const roll2 = rollDie();
        results.push(mode === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2));
      } else {
        results.push(rollDie());
      }
    }

    const total = results.reduce((sum, roll) => sum + roll, 0);
    const rollsString = results.join(',  ');

    const maxRoll = numDice * numSides;
    const rollMessage = `You rolled ${numDice}d${numSides} ${mode !== 'normal' ? `with ${mode}` : ''}.
        Results: [${rollsString}]
        Total: ${total === maxRoll ? `**[${total}]**` : total}`;
    await interaction.reply(rollMessage);
  }
};