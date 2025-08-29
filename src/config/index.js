import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, '../../config.json');

let config = {};

try {
  const configFile = readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);
} catch (error) {
  console.warn('Config file not found, using default values');
  config = {
    currency: "PKR",
    defaultBalance: 0,
    messages: {
      creditDm: "Your account has been credited with {amount} PKR",
      withdrawRequest: "User {username} ({id}) requested withdrawal of {amount} PKR. Account: {account}"
    }
  };
}

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const CLIENT_ID = process.env.CLIENT_ID;
export const NOTION_TOKEN = process.env.NOTION_TOKEN;
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
export const NOTION_PENDING_DATABASE_ID = process.env.NOTION_PENDING_DATABASE_ID;
export const BOT_OWNER_ID = process.env.BOT_OWNER_ID;
export const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

export const CURRENCY = config.currency;
export const DEFAULT_BALANCE = config.defaultBalance;
export const MESSAGES = config.messages;
export const ADMINS = config.admins || [];

export function validateConfig() {
  const required = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'NOTION_TOKEN', 
    'NOTION_DATABASE_ID',
    'NOTION_PENDING_DATABASE_ID',
    'BOT_OWNER_ID',
    'LOG_CHANNEL_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
