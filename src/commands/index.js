import { Collection } from 'discord.js';
import * as setup from './setup.js';
import * as add from './add.js';
import * as balance from './balance.js';
import * as withdraw from './withdraw.js';
import * as approve from './approve.js';
import * as pending from './pending.js';

const commands = [setup, add, balance, withdraw, approve, pending];

export function getCommands() {
  return commands;
}

export function createCommandCollection() {
  const commandCollection = new Collection();
  
  commands.forEach(command => {
    commandCollection.set(command.data.name, command);
  });
  
  return commandCollection;
}
