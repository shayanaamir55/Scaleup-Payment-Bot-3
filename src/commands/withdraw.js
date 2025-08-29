import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, createPendingWithdrawal, extractUserData } from '../notion/database.js';
import { isValidAmount } from '../utils/validation.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/discord.js';
import { formatMessage, formatCurrency } from '../utils/validation.js';
import { MESSAGES, CURRENCY, LOG_CHANNEL_ID } from '../config/index.js';

export const data = new SlashCommandBuilder()
  .setName('withdraw')
  .setDescription('Request a withdrawal from your balance')
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Amount to withdraw (in PKR)')
      .setRequired(true)
      .setMinValue(1));

export async function execute(interaction) {
  try {
    const amount = interaction.options.getInteger('amount');
    const discordId = interaction.user.id;

    if (!isValidAmount(amount)) {
      const embed = createErrorEmbed('Please provide a valid positive amount.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const userPage = await getUser(discordId);

    if (!userPage) {
      const embed = createErrorEmbed('You need to register first using `/setup`.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const userData = extractUserData(userPage);

    if (userData.balance < amount) {
      const embed = createErrorEmbed(
        `Insufficient balance. Your current balance is ${formatCurrency(userData.balance, CURRENCY)}.`
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Create pending withdrawal request
    const pendingRequest = await createPendingWithdrawal(
      discordId,
      amount,
      userData.account,
      userData.bank,
      interaction.user.username
    );

    const embed = createSuccessEmbed(
      `Withdrawal request submitted successfully!\n` +
      `Amount: ${formatCurrency(amount, CURRENCY)}\n` +
      `Your request is now pending approval. You will be notified once it's processed.`
    );
    
    await interaction.editReply({ embeds: [embed] });

    if (interaction.guild) {
      const logChannel = interaction.client.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const withdrawMessage = formatMessage(MESSAGES.withdrawRequest, {
          username: interaction.user.username,
          user: `<@${interaction.user.id}>`,
          amount: formatCurrency(amount),
          account: userData.account,
          bank: userData.bank
        });

        const logEmbed = createEmbed('Withdrawal Request', withdrawMessage, '#ffa500');
        logEmbed.addFields({ 
          name: 'Request ID', 
          value: `\`${pendingRequest.id}\``, 
          inline: true 
        });
        await logChannel.send({ embeds: [logEmbed] });
      }
    } else {
      const botOwner = interaction.client.users.cache.get(process.env.BOT_OWNER_ID);
      if (botOwner) {
        const withdrawMessage = formatMessage(MESSAGES.withdrawRequest, {
          username: interaction.user.username,
          user: `<@${interaction.user.id}>`,
          amount: formatCurrency(amount),
          account: userData.account,
          bank: userData.bank
        });

        const logEmbed = createEmbed('Withdrawal Request (DM)', withdrawMessage, '#ffa500');
        logEmbed.addFields({ 
          name: 'Request ID', 
          value: `\`${pendingRequest.id}\``, 
          inline: true 
        });
        await botOwner.send({ embeds: [logEmbed] });
      }
    }
  } catch (error) {
    console.error('Withdraw command error:', error);
    
    try {
      const embed = createErrorEmbed('An error occurred while processing withdrawal. Please try again.');
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

function createEmbed(title, description, color = '#0099ff') {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}
