import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  FileType,
  MyEditor,
} from '@decipad/editor-types';
import {
  insertBlockOfTypeBelow,
  insertCodeLineBelow,
  insertDataMapping,
  insertDividerBelow,
  insertJavascriptBlockBelow,
  insertStructuredCodeLineBelow,
  setSelection,
} from '@decipad/editor-utils';
import {
  useConnectionStore,
  useFileUploadStore,
} from '@decipad/react-contexts';
import { SlashCommandsMenu } from '@decipad/ui';
import { deleteText, removeNodes, withoutNormalizing } from '@udecode/plate';
import { ComponentProps } from 'react';
import { Location, Path, Range } from 'slate';
import { insertDataViewBelow } from './data-view';
import { insertDrawBelow } from './draw';
import {
  insertDisplayBelow,
  insertDropdownBelow,
  insertInputBelow,
  insertSliderInputBelow,
} from './input';
import { insertLiveQueryBelow } from './live-query';
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
  select?: boolean;
}

export const execute = ({
  command,
  editor,
  path,
  getAvailableIdentifier,
  deleteFragment,
  select = false,
}: ExecuteProps): void => {
  const { changeOpen } = useConnectionStore.getState();
  const { setDialogOpen, setFileType } = useFileUploadStore.getState();

  withoutNormalizing(editor, () => {
    setSelection(editor, null as unknown as Range);
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
      case 'upload-image':
        setFileType('image' as FileType);
        setDialogOpen(true);
        break;
      case 'upload-csv':
        setFileType('data' as FileType);
        setDialogOpen(true);
        break;
    }

    let newElementPath: Path;
    if (deleteFragment) {
      newElementPath = [path[0] + 1];
      deleteText(editor, { at: deleteFragment });
    } else {
      newElementPath = path;
      removeNodes(editor, { at: path });
    }

    if (select) {
      if (
        command === 'structured-input' ||
        command === 'structured-code-line'
      ) {
        newElementPath = [...newElementPath, 1];
      }
      const newSelectionPoint = {
        path: newElementPath,
        offset: 0,
      };
      setSelection(editor, {
        anchor: newSelectionPoint,
        focus: newSelectionPoint,
      });
    }
  });
};
