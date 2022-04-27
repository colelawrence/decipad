import {
  ELEMENT_CALLOUT,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_BLOCKQUOTE,
} from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { TEditor } from '@udecode/plate';
import { ComponentProps } from 'react';
import { Path, Transforms } from 'slate';
import {
  insertBlockOfTypeBelow,
  requireBlockParentPath,
  insertCodeLineBelow,
  insertDividerBelow,
} from '@decipad/editor-utils';
import { insertInputBelow } from './input';
import { insertPlotBelow } from './plot';
import { insertTableBelow } from './table';

type SlashCommandHandler = Exclude<
  ComponentProps<typeof organisms.SlashCommandsMenu>['onExecute'],
  undefined
>;
export type SlashCommand = Parameters<SlashCommandHandler>[0];

export type GetAvailableIdentifier = (prefix: string, start: number) => string;
export interface ExecuteProps {
  editor: TEditor;
  path: Path;
  command: SlashCommand;
  getAvailableIdentifier: GetAvailableIdentifier;
}

export const execute = ({
  command,
  editor,
  path,
  getAvailableIdentifier,
}: ExecuteProps): void => {
  switch (command) {
    case 'calculation-block':
      insertCodeLineBelow(editor, path);
      break;
    case 'input':
      insertInputBelow(editor, path);
      break;
    case 'table':
      insertTableBelow(editor, path, getAvailableIdentifier);
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
    case 'divider':
      insertDividerBelow(editor, path, ELEMENT_HR);
      break;
    case 'callout':
      insertBlockOfTypeBelow(editor, path, ELEMENT_CALLOUT);
      break;
    case 'blockquote':
      insertBlockOfTypeBelow(editor, path, ELEMENT_BLOCKQUOTE);
      break;
  }
  Transforms.delete(editor, { at: requireBlockParentPath(editor, path) });
};
