import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { 
  getPendingWithdrawal, 
  updateWithdrawalStatus, 
  updateBalance, 
  getUser, 
  extractUserData, 
  extractPendingWithdrawalData 
} from '../notion/database.js';
import { createErrorEmbed, createSuccessEmbed, isAdmin, isBotOwner, sendDirectMessage } from '../utils/discord.js';
import { formatMessage, formatCurrency } from '../utils/validation.js';
import { MESSAGES, CURRENCY } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('approve')
  .setDescription('Approve or reject a withdrawal request (Admin only)')
  .addStringOption(option =>
    option.setName('request_id')
      .setDescription('The withdrawal request ID')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('action')
      .setDescription('Approve or reject the request')
      .setRequired(true)
      .addChoices(
        { name: 'Approve', value: 'approve' },
        { name: 'Reject', value: 'reject' }
      ));

export async function execute(interaction) {
  try {
    // Check if this is a DM or if user has admin permissions
    if (interaction.guild && !isAdmin(interaction.member)) {
      const embed = createErrorEmbed('You do not have permission to use this command.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    
    // In DMs, only bot owner can use approve command
    if (!interaction.guild && !isBotOwner(interaction.user.id)) {
      const embed = createErrorEmbed('Only the bot owner can use this command in DMs.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const requestId = interaction.options.getString('request_id');
    const action = interaction.options.getString('action');

    await interaction.deferReply({ ephemeral: true });

    // Get the pending withdrawal request
    const pendingRequest = await getPendingWithdrawal(requestId);
    if (!pendingRequest) {
      const embed = createErrorEmbed('Withdrawal request not found.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const requestData = extractPendingWithdrawalData(pendingRequest);
    
    // Check if request is still pending
    if (requestData.status !== 'Pending') {
      const embed = createErrorEmbed('This request has already been processed.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Update the request status
    await updateWithdrawalStatus(requestId, action === 'approve' ? 'Approved' : 'Rejected', interaction.user.username);

    if (action === 'approve') {
      // Get user data and update balance
      const userPage = await getUser(requestData.discordId);
      if (userPage) {
        const userData = extractUserData(userPage);
        const newBalance = userData.balance - requestData.amount;
        await updateBalance(userPage.id, newBalance);
      }

      // Send approval DM to user
      const approvalMessage = formatMessage(MESSAGES.withdrawApproved, { 
        amount: formatCurrency(requestData.amount, CURRENCY) 
      });
      await sendDirectMessage(interaction.client.users.cache.get(requestData.discordId), approvalMessage);

      const embed = createSuccessEmbed(
        `Withdrawal request approved!\n` +
        `User: ${requestData.username}\n` +
        `Amount: ${formatCurrency(requestData.amount, CURRENCY)}\n` +
        `Account: ${requestData.account} | Bank: ${requestData.bank}`
      );
      await interaction.editReply({ embeds: [embed] });
    } else {
      // Send rejection DM to user
      const rejectionMessage = formatMessage(MESSAGES.withdrawRejected, { 
        amount: formatCurrency(requestData.amount, CURRENCY) 
      });
      await sendDirectMessage(interaction.client.users.cache.get(requestData.discordId), rejectionMessage);

      const embed = createSuccessEmbed(
        `Withdrawal request rejected!\n` +
        `User: ${requestData.username}\n` +
        `Amount: ${formatCurrency(requestData.amount, CURRENCY)}\n` +
        `Account: ${requestData.account} | Bank: ${requestData.bank}`
      );
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Approve command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while processing the request. Please try again.');
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
