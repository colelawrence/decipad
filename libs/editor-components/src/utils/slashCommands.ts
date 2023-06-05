import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
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
  insertDataMapping,
  insertJavascriptBlockBelow,
} from '@decipad/editor-utils';
import { SlashCommandsMenu } from '@decipad/ui';
import { deleteText } from '@udecode/plate';
import { ComponentProps } from 'react';
import { BaseEditor, Location, Path, Transforms } from 'slate';
import { useConnectionStore } from '@decipad/react-contexts';
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
import { insertLiveQueryBelow } from './live-query';

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
  select?: boolean;
}

export const execute = ({
  command,
  editor,
  path,
  getAvailableIdentifier,
  deleteFragment,
  select = true,
}: ExecuteProps): void => {
  const { changeOpen } = useConnectionStore.getState();

  switch (command) {
    case 'javascript-block':
      insertJavascriptBlockBelow(editor, path, getAvailableIdentifier);
      break;
    case 'structured-input':
      insertStructuredCodeLineBelow({
        editor,
        path,
        code: '100$',
        getAvailableIdentifier,
      });
      break;
    case 'structured-code-line':
      insertStructuredCodeLineBelow({
        editor,
        path,
        code: '14 * 3',
        getAvailableIdentifier,
      });
      break;
    case 'calculation-block':
      insertCodeLineBelow(editor, path, false);
      break;
    case 'input':
      insertInputBelow(editor, path, 'number', getAvailableIdentifier);
      break;
    case 'toggle':
      insertInputBelow(editor, path, 'boolean', getAvailableIdentifier);
      break;
    case 'datepicker':
      insertInputBelow(editor, path, 'date', getAvailableIdentifier);
      break;
    case 'slider':
      insertSliderInputBelow(editor, path, getAvailableIdentifier);
      break;
    case 'display':
      insertDisplayBelow(editor, path);
      break;
    case 'dropdown':
      insertDropdownBelow(editor, path, getAvailableIdentifier);
      break;
    case 'table':
      insertTableBelow(editor, path, getAvailableIdentifier);
      break;
    case 'data-view':
      insertDataViewBelow(editor, path);
      break;
    case 'open-integration':
      changeOpen(true);
      break;
    case 'live-query':
      insertLiveQueryBelow(editor, path, getAvailableIdentifier);
      break;
    case 'pie-chart':
      insertPlotBelow(editor, path, 'arc');
      break;
    case 'line-chart':
      insertPlotBelow(editor, path, 'line');
      break;
    case 'bar-chart':
      insertPlotBelow(editor, path, 'bar');
      break;
    case 'area-chart':
      insertPlotBelow(editor, path, 'area');
      break;
    case 'scatter-plot':
      insertPlotBelow(editor, path, 'point');
      break;
    case 'data-mapping':
      insertDataMapping(editor, path, getAvailableIdentifier);
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
    case 'sketch':
      insertDrawBelow(editor, path);
      break;
  }

  let newElementPath: Path;
  if (deleteFragment) {
    newElementPath = [path[0] + 1];
    deleteText(editor, { at: deleteFragment });
  } else {
    newElementPath = requireBlockParentPath(editor, path);
    deleteText(editor, { at: newElementPath });
  }

  if (select) {
    if (command === 'structured-input' || command === 'structured-code-line') {
      Transforms.select(editor as BaseEditor, [...newElementPath, 1]);
    } else {
      focusAndSetSelection(editor, newElementPath);
    }
  }
};
