import {
  AnyElement,
  ELEMENT_TAB,
  RootDocument,
  TabElement,
} from '@decipad/editor-types';
import cloneDeep from 'lodash.clonedeep';
import { getCommands } from './getCommands';
import { findPath } from './findPath';
import set from 'lodash.set';
import { removePath } from './removePath';
import get from 'lodash.get';
import { debug } from '../debug';
import { isElement, mergeProps } from '@udecode/plate';
import { nanoid } from 'nanoid';

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

const newTab = (): TabElement => ({
  type: ELEMENT_TAB,
  id: nanoid(),
  name: 'New tab',
  children: [],
});

export const applyCommands = (
  doc: RootDocument,
  commandsString: string
): RootDocument => {
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
          let firstTab = newDocument.children.find(
            (el) => isElement(el) && el.type === ELEMENT_TAB
          ) as undefined | TabElement;
          if (!firstTab) {
            firstTab = newTab();
            newDocument.children = [
              newDocument.children[0],
              newTab(),
              ...(newDocument.children.slice(1) as TabElement[]),
            ];
          }
          firstTab.children.push(
            command.newBlock as TabElement['children'][number]
          );
        }
        break;
      }
    }
    previousDoc = cloneDeep(newDocument);
  }
  return newDocument;
};
