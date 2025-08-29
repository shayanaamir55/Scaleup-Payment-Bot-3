# Discord Balance Bot

A professional Discord bot for managing user balances with Notion integration. Built with Discord.js v14 and the official Notion SDK.

## Features

- **User Account Management**: Register and update account numbers
- **Balance Tracking**: Add funds and check balances
- **Withdrawal System**: Request withdrawals with admin notifications
- **Notion Integration**: All data stored in Notion database
- **Admin Controls**: Secure admin-only commands
- **Real-time Notifications**: DM notifications for balance changes
- **DM Support**: Works in both servers and private DMs
- **Bot Owner Controls**: Special permissions for bot owner in DMs

## Commands

- `/setup account <account_number>` - Register or update your account
- `/add <user> <amount>` - Add balance to a user (Server Admin / Bot Owner)
- `/balance [user?]` - Check your balance or another user's (Admin/Owner only)
- `/withdraw <amount>` - Request a withdrawal from your balance

**Works in both Discord servers and private DMs!**

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

3. **Set up Notion database**
   - Create a Notion integration
   - Create a database with the required properties
   - Share the database with your integration

4. **Deploy commands**
   ```bash
   npm run deploy-commands
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## Requirements

- Node.js 18.0.0 or higher
- Discord Bot Token
- Notion Integration Token
- Notion Database ID

## Documentation

- [Configuration Guide](CONFIG.md) - Environment variables and config setup
- [Deployment Guide](DEPLOY.md) - How to deploy on various platforms
- [Usage Guide](USAGE.md) - Command examples and responses
- [Code Documentation](CODE_DOCS.md) - Project structure and architecture# Scaleup-Payment-Bot-2
# Scaleup-Payment-Bot-2
# Scaleup-Payment-Bot-2
