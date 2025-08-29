import { REST, Routes } from 'discord.js';
import { DISCORD_TOKEN } from './config/index.js';
import { getCommands } from './commands/index.js';

const commands = getCommands().map(command => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    const clientId = process.env.CLIENT_ID;
    
    if (!clientId) {
      console.error('CLIENT_ID environment variable is required for deploying commands.');
      console.error('Please add CLIENT_ID to your .env file.');
      console.error('You can find your Client ID in the Discord Developer Portal under your application.');
      process.exit(1);
    }

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
    process.exit(1);
  }
})();
