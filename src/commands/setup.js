import { SlashCommandBuilder } from 'discord.js';
import { getUser, createUser, updateAccountNumber, extractUserData } from '../notion/database.js';
import { isValidAccountNumber } from '../utils/validation.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/discord.js';

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Register or update your account number')
  .addStringOption(option =>
    option.setName('account')
      .setDescription('Your account number')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('bank')
      .setDescription('Your bank name')
      .setRequired(true));

export async function execute(interaction) {
  try {
    const accountNumber = interaction.options.getString('account');
    const bankName = interaction.options.getString('bank');
    const discordId = interaction.user.id;
    const username = interaction.user.username;

    if (!isValidAccountNumber(accountNumber)) {
      const embed = createErrorEmbed('Please provide a valid account number.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let userPage = await getUser(discordId);

    if (!userPage) {
      await createUser(discordId, accountNumber, username, bankName);
      const embed = createSuccessEmbed(`Account registered successfully! Your account number is: ${accountNumber} and bank: ${bankName}`);
      await interaction.editReply({ embeds: [embed] });
    } else {
      await updateAccountNumber(userPage.id, accountNumber, bankName);
      const embed = createSuccessEmbed(`Account number updated successfully! Your new account number is: ${accountNumber} and bank: ${bankName}`);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Setup command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while setting up your account. Please try again.');
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (replyError) {
      console.error('Failed to send error response:', replyError);
    }
  }
}
