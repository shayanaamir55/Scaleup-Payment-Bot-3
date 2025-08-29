import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllPendingWithdrawals, extractPendingWithdrawalData } from '../notion/database.js';
import { createErrorEmbed, createSuccessEmbed, isAdmin, isBotOwner } from '../utils/discord.js';
import { formatCurrency } from '../utils/validation.js';
import { CURRENCY } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('pending')
  .setDescription('View all pending withdrawal requests (Admin only)');

export async function execute(interaction) {
  try {
    // Check if this is a DM or if user has admin permissions
    if (interaction.guild && !isAdmin(interaction.member)) {
      const embed = createErrorEmbed('You do not have permission to use this command.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    
    // In DMs, only bot owner can use pending command
    if (!interaction.guild && !isBotOwner(interaction.user.id)) {
      const embed = createErrorEmbed('Only the bot owner can use this command in DMs.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const pendingRequests = await getAllPendingWithdrawals();

    if (pendingRequests.length === 0) {
      const embed = createSuccessEmbed('No pending withdrawal requests found.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Pending Withdrawal Requests')
      .setColor('#ffa500')
      .setTimestamp();

    let description = '';
    pendingRequests.forEach((request, index) => {
      const requestData = extractPendingWithdrawalData(request);
      const requestDate = new Date(requestData.requestedAt).toLocaleString();
      
      description += `**${index + 1}. Request ID:** \`${requestData.id}\`\n`;
      description += `**User:** ${requestData.username} (<@${requestData.discordId}>)\n`;
      description += `**Amount:** ${formatCurrency(requestData.amount, CURRENCY)}\n`;
      description += `**Account:** ${requestData.account} | **Bank:** ${requestData.bank}\n`;
      description += `**Requested:** ${requestDate}\n\n`;
    });

    embed.setDescription(description);

    // Add footer with usage instructions
    embed.setFooter({ 
      text: 'Use /approve <request_id> <action> to approve or reject requests' 
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Pending command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while fetching pending requests. Please try again.');
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
