import { SlashCommandBuilder } from 'discord.js';
import { getUser, extractUserData } from '../notion/database.js';
import { isAdmin, isBotOwner, createErrorEmbed, createSuccessEmbed } from '../utils/discord.js';
import { formatCurrency } from '../utils/validation.js';
import { CURRENCY } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Check your balance or another user\'s balance (Admin only)')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to check balance for (Admin only)')
      .setRequired(false));

export async function execute(interaction) {
  try {
    const targetUser = interaction.options.getUser('user');
    const isAdminUser = interaction.guild ? isAdmin(interaction.member) : isBotOwner(interaction.user.id);

    if (targetUser && !isAdminUser) {
      const embed = createErrorEmbed('You do not have permission to check other users\' balances.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const userId = targetUser ? targetUser.id : interaction.user.id;
    const userPage = await getUser(userId);

    if (!userPage) {
      const embed = createErrorEmbed('User not found. They need to register first using `/setup`.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const userData = extractUserData(userPage);
    const displayName = targetUser ? targetUser.username : interaction.user.username;
    
    const embed = createSuccessEmbed(
      `**${displayName}'s Balance**\n` +
      `Account: ${userData.account}\n` +
      `Balance: ${formatCurrency(userData.balance, CURRENCY)}`
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Balance command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while checking balance. Please try again.');
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
