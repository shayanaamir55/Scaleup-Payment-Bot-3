import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, extractUserData } from '../notion/database.js';
import { isValidAmount } from '../utils/validation.js';
import { isAdmin, isBotOwner, createErrorEmbed, createSuccessEmbed, sendDirectMessage } from '../utils/discord.js';
import { formatMessage, formatCurrency } from '../utils/validation.js';
import { MESSAGES, CURRENCY } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('add')
  .setDescription('Add balance to a user (Admin only)')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to add balance to')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Amount to add (in PKR)')
      .setRequired(true)
      .setMinValue(1));

export async function execute(interaction) {
  try {
    if (interaction.guild && !isAdmin(interaction.member)) {
      const embed = createErrorEmbed('You do not have permission to use this command.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    
    if (!interaction.guild && !isBotOwner(interaction.user.id)) {
      const embed = createErrorEmbed('Only the bot owner can use this command in DMs.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!isValidAmount(amount)) {
      const embed = createErrorEmbed('Please provide a valid positive amount.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const userPage = await getUser(targetUser.id);

    if (!userPage) {
      const embed = createErrorEmbed('User not found. They need to register first using `/setup`.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const userData = extractUserData(userPage);
    const newBalance = userData.balance + amount;

    await updateBalance(userPage.id, newBalance);

    const dmMessage = formatMessage(MESSAGES.creditDm, { amount: formatCurrency(amount) });
    await sendDirectMessage(targetUser, dmMessage);

    const embed = createSuccessEmbed(
      `Successfully added ${formatCurrency(amount, CURRENCY)} to ${targetUser.username}'s balance. ` +
      `New balance: ${formatCurrency(newBalance, CURRENCY)}`
    );
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Add command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while adding balance. Please try again.');
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
