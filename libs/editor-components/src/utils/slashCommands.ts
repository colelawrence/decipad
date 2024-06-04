import { deleteText, removeNodes } from '@udecode/plate-common';
import type { Location, Path } from 'slate';
import type { Computer } from '@decipad/computer-interfaces';
import type { FileType, MyEditor, SlashCommand } from '@decipad/editor-types';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_SUBMIT_FORM,
} from '@decipad/editor-types';
import type { GetAvailableIdentifier } from '@decipad/editor-utils';
import {
  insertBlockOfTypeBelow,
  insertCodeLineBelow,
  insertDividerBelow,
  insertStructuredCodeLineBelow,
  withoutNormalizingAsync,
} from '@decipad/editor-utils';
import {
  useConnectionStore,
  useFileUploadStore,
} from '@decipad/react-contexts';
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

export interface ExecuteProps {
  editor: MyEditor;
  computer: Computer;
  path: Path;
  deleteFragment?: Location;
  deleteBlock?: boolean;
  command: SlashCommand;
  getAvailableIdentifier: GetAvailableIdentifier;
}

export const execute = async ({
  command,
  computer,
  editor,
  path,
  getAvailableIdentifier,
  deleteFragment,
  deleteBlock = true,
}: ExecuteProps): Promise<void> => {
  const { changeOpen } = useConnectionStore.getState();
  const { setDialogOpen, setFileType } = useFileUploadStore.getState();

  // eslint-disable-next-line complexity
  await withoutNormalizingAsync(editor, async () => {
    switch (command) {
      case 'structured-input':
        await insertStructuredCodeLineBelow({
          editor,
          path,
          code: '100$',
          getAvailableIdentifier,
        });
        break;
      case 'structured-code-line':
        await insertStructuredCodeLineBelow({
          editor,
          path,
          code: '14 * 3',
          getAvailableIdentifier,
        });
        break;
      case 'calculation-block':
        await insertCodeLineBelow(editor, path, false);
        break;
      case 'input':
        await insertInputBelow(editor, path, 'number', getAvailableIdentifier);
        break;
      case 'toggle':
        await insertInputBelow(editor, path, 'boolean', getAvailableIdentifier);
        break;
      case 'datepicker':
        await insertInputBelow(editor, path, 'date', getAvailableIdentifier);
        break;
      case 'slider':
        await insertSliderInputBelow(editor, path, getAvailableIdentifier);
        break;
      case 'display':
        await insertDisplayBelow(editor, path);
        break;
      case 'dropdown':
        await insertDropdownBelow(editor, path, getAvailableIdentifier);
        break;
      case 'table':
        await insertTableBelow(editor, path, getAvailableIdentifier);
        break;
      case 'data-view':
        await insertDataViewBelow(editor, path, computer);
        break;
      case 'open-integration':
        changeOpen(true);
        break;
      case 'live-query':
        await insertLiveQueryBelow(editor, path, getAvailableIdentifier);
        break;
      case 'pie-chart':
        await insertPlotBelow(editor, path, 'arc');
        break;
      case 'line-chart':
        await insertPlotBelow(editor, path, 'line');
        break;
      case 'bar-chart':
        await insertPlotBelow(editor, path, 'bar');
        break;
      case 'area-chart':
        await insertPlotBelow(editor, path, 'area');
        break;
      case 'scatter-plot':
        await insertPlotBelow(editor, path, 'point');
        break;
      case 'import':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_FETCH);
        break;
      case 'submit-form':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_SUBMIT_FORM);
        break;
      case 'heading1':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_H2);
        break;
      case 'heading2':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_H3);
        break;
      case 'divider':
        await insertDividerBelow(editor, path, ELEMENT_HR);
        break;
      case 'callout':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_CALLOUT);
        break;
      case 'blockquote':
        await insertBlockOfTypeBelow(editor, path, ELEMENT_BLOCKQUOTE);
        break;
      case 'sketch':
        await insertDrawBelow(editor, path);
        break;
      case 'upload-image':
        setFileType('image' as FileType);
        setDialogOpen(true);
        break;
      case 'upload-csv':
        setFileType('data' as FileType);
        setDialogOpen(true);
        break;
      case 'upload-embed':
        setFileType('embed' as FileType);
        setDialogOpen(true);
        break;
    }

    if (deleteBlock) {
      if (deleteFragment) {
        deleteText(editor, { at: deleteFragment });
      } else {
        removeNodes(editor, { at: path });
      }
    }
  });
};
