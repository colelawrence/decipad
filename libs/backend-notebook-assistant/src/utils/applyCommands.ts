import { AnyElement, Document, MyValue } from '@decipad/editor-types';
import cloneDeep from 'lodash.clonedeep';
import { getCommands } from './getCommands';
import { findPath } from './findPath';
import set from 'lodash.set';
import { removePath } from './removePath';
import get from 'lodash.get';
import { debug } from '../debug';
import { mergeProps } from '@udecode/plate';

export interface AddCommand {
  action: 'add';
  newBlock: AnyElement; // the block to add
}

export interface RemoveCommand {
  action: 'remove';
  blockId: string; // the id of the block to remove
}

export interface ChangeCommand {
  action: 'change';
  oldBlock: AnyElement; // the old version of the block
  newBlock: AnyElement; // the new version of the blocks
}

export type Command = AddCommand | RemoveCommand | ChangeCommand;

export const applyCommands = (
  doc: Document,
  commandsString: string
): Document => {
  const commands = getCommands(commandsString);
  const newDocument = cloneDeep(doc);
  let previousDoc = cloneDeep(doc);
  for (const command of commands) {
    switch (command.action) {
      case 'remove': {
        const path = findPath(previousDoc, command.blockId);
        if (path) {
          debug('removing path', path);
          removePath(newDocument, path);
        } else {
          throw new Error(`No such block with id ${command.blockId}`);
        }
        break;
      }
      case 'change':
      case 'add': {
        const path = findPath(previousDoc, command.newBlock.id);
        if (path) {
          const propPath = path.join('.');
          debug('setting', propPath, command.newBlock);
          const newBlock =
            command.action === 'change'
              ? mergeProps(
                  get(previousDoc, propPath) ?? command.oldBlock,
                  command.newBlock
                )
              : command.newBlock;
          set(newDocument, propPath, newBlock);
        } else if (command.action === 'add') {
          newDocument.children.push(command.newBlock as MyValue[number]);
        }
        break;
      }
    }
    previousDoc = cloneDeep(newDocument);
  }
  return newDocument;
};
