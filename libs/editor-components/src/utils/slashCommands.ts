import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_EVAL,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  MyEditor,
} from '@decipad/editor-types';
import {
  focusAndSetSelection,
  insertBlockOfTypeBelow,
  insertStructuredCodeLineBelow,
  insertCodeLineBelow,
  insertDividerBelow,
  requireBlockParentPath,
} from '@decipad/editor-utils';
import { SlashCommandsMenu } from '@decipad/ui';
import { deleteText } from '@udecode/plate';
import { ComponentProps } from 'react';
import { Location, Path } from 'slate';
import { insertDataViewBelow } from './data-view';
import { insertDrawBelow } from './draw';
import {
  insertDisplayBelow,
  insertDropdownBelow,
  insertInputBelow,
  insertSliderInputBelow,
} from './input';
import { insertPlotBelow } from './plot';
import { insertTableBelow } from './table';

type SlashCommandHandler = Exclude<
  ComponentProps<typeof SlashCommandsMenu>['onExecute'],
  undefined
>;
export type SlashCommand = Parameters<SlashCommandHandler>[0];

export type GetAvailableIdentifier = (prefix: string, start: number) => string;
export interface ExecuteProps {
  editor: MyEditor;
  path: Path;
  deleteFragment?: Location;
  command: SlashCommand;
  getAvailableIdentifier: GetAvailableIdentifier;
}

export const execute = ({
  command,
  editor,
  path,
  getAvailableIdentifier,
  deleteFragment,
}: ExecuteProps): void => {
  switch (command) {
    case 'structured-code-line':
      insertStructuredCodeLineBelow(
        editor,
        path,
        false,
        getAvailableIdentifier
      );
      break;
    case 'calculation-block':
      insertCodeLineBelow(editor, path, false);
      break;
    case 'input':
      insertInputBelow(editor, path);
      break;
    case 'toggle':
      insertInputBelow(editor, path, 'boolean');
      break;
    case 'datepicker':
      insertInputBelow(editor, path, 'date');
      break;
    case 'slider':
      insertSliderInputBelow(editor, path);
      break;
    case 'display':
      insertDisplayBelow(editor, path);
      break;
    case 'dropdown':
      insertDropdownBelow(editor, path);
      break;
    case 'table':
      insertTableBelow(editor, path, getAvailableIdentifier);
      break;
    case 'data-view':
      insertDataViewBelow(editor, path);
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
    case 'eval':
      insertBlockOfTypeBelow(editor, path, ELEMENT_EVAL);
      break;
    case 'sketch':
      insertDrawBelow(editor, path);
      break;
  }

  if (deleteFragment) {
    const nextBlock = [path[0] + 1, 0];
    focusAndSetSelection(editor, nextBlock);
    deleteText(editor, { at: deleteFragment });
  } else {
    deleteText(editor, { at: requireBlockParentPath(editor, path) });
  }
};
