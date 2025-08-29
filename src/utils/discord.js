import { EmbedBuilder } from 'discord.js';
import { BOT_OWNER_ID, ADMINS } from '../config/index.js';

export async function sendDirectMessage(user, content) {
  try {
    await user.send(content);
    return true;
  } catch (error) {
    console.error('Failed to send DM:', error);
    return false;
  }
}

export function isAdmin(member) {
  if (!member) return false;
  return member.permissions.has('Administrator') || member.id === BOT_OWNER_ID || ADMINS.includes(member.id);
}

export function isBotOwner(userId) {
  return userId === BOT_OWNER_ID;
}

export function createEmbed(title, description, color = '#0099ff') {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

export function createErrorEmbed(message) {
  return createEmbed('Error', message, '#ff0000');
}

export function createSuccessEmbed(message) {
  return createEmbed('Success', message, '#00ff00');
}
