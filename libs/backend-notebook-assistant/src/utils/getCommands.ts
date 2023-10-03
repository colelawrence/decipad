/* eslint-disable complexity */
import { isElement } from '@udecode/plate';
import type { Command } from './applyCommands';
import { parseJSONResponse } from './parseJSONResponse';

export const getCommands = (commandString: string): Command[] => {
  let commands = parseJSONResponse(commandString);
  if (commands && typeof commands === 'object' && 'commands' in commands) {
    commands = commands.commands;
  }
  if (!Array.isArray(commands)) {
    throw new TypeError('The list of commands needs to be an array.');
  }
  for (const command of commands) {
    if (!command || typeof command !== 'object') {
      throw new TypeError(
        'Each command needs to be an object. Please reply with a valid list of Command objects.'
      );
    }
    if (!('action' in command)) {
      throw new TypeError(
        'Invalid command. Please reply with a list of valid Command objects in JSON.'
      );
    }
    if (command.action === 'change' || command.action === 'add') {
      if (!('newBlock' in command)) {
        throw new TypeError(
          'expected change command to have newBlock. Please reply with a list of valid Command objects in JSON.'
        );
      }
      if (
        command.newBlock &&
        typeof command.newBlock === 'object' &&
        'children' in command.newBlock &&
        Array.isArray(command.children) &&
        command.children.length === 1
      ) {
        [command.newBlock] = command.newBlock.children;
      }
      if (!isElement(command.newBlock)) {
        throw new TypeError(
          'Blocks contains invalid element. Please follow the given JSON schema.'
        );
      }
    } else if (command.action === 'remove') {
      if (!('blockId' in command)) {
        throw new TypeError(
          'expected command blockId in remove command. Please reply with a list of valid Command objects in JSON.'
        );
      }
      if (typeof command.blockId !== 'string') {
        throw new TypeError(
          'expected command blockId to be a string. Please reply with a list of valid Command objects in JSON.'
        );
      }
    } else {
      throw new TypeError(
        'Invalid action. Please reply with a list of valid Command objects in JSON.'
      );
    }
  }
  return commands as Command[];
};
