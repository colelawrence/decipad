import {
  ELEMENT_CALLOUT,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { TEditor } from '@udecode/plate';
import { ComponentProps } from 'react';
import { Path, Transforms } from 'slate';
import {
  insertBlockOfTypeBelow,
  requireBlockParentPath,
  insertCodeLineBelow,
} from '@decipad/editor-utils';
import { insertInputBelow } from './input';
import { insertPlotBelow } from './plot';
import { insertTableBelow } from './table';

type SlashCommandHandler = Exclude<
  ComponentProps<typeof organisms.SlashCommandsMenu>['onExecute'],
  undefined
>;
export type SlashCommand = Parameters<SlashCommandHandler>[0];

export const execute = (
  editor: TEditor,
  path: Path,
  command: SlashCommand
): void => {
  switch (command) {
    case 'calculation-block':
      insertCodeLineBelow(editor, path);
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
    case 'callout':
      insertBlockOfTypeBelow(editor, path, ELEMENT_CALLOUT);
      break;
  }
  Transforms.delete(editor, { at: requireBlockParentPath(editor, path) });
};
