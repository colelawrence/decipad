import { ELEMENT_FETCH, ELEMENT_H2, ELEMENT_H3 } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { SPEditor } from '@udecode/plate';
import { ComponentProps } from 'react';
import { Path, Transforms } from 'slate';
import { insertBlockOfTypeBelow } from './block';
import { insertCodeBlockBelow } from './codeBlock';
import { insertInputBelow } from './input';
import { requireBlockParentPath } from './path';
import { insertPlotBelow } from './plot';
import { insertTableBelow } from './table';

type SlashCommandHandler = Exclude<
  ComponentProps<typeof organisms.SlashCommandsMenu>['onExecute'],
  undefined
>;
export type SlashCommand = Parameters<SlashCommandHandler>[0];

export const execute = (
  editor: SPEditor,
  path: Path,
  command: SlashCommand
): void => {
  switch (command) {
    case 'calculation-block':
      insertCodeBlockBelow(editor, path);
      break;
    case 'input':
      insertInputBelow(editor, path);
      break;
    case 'table':
      insertTableBelow(editor, path);
      break;
    case 'plot':
      insertPlotBelow(editor, path);
      break;
    case 'import':
      insertBlockOfTypeBelow(editor, path, ELEMENT_FETCH);
      break;
    case 'heading1':
      insertBlockOfTypeBelow(editor, path, ELEMENT_H2);
      break;
    case 'heading2':
      insertBlockOfTypeBelow(editor, path, ELEMENT_H3);
      break;
  }
  Transforms.delete(editor, { at: requireBlockParentPath(editor, path) });
};
