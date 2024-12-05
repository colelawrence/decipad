import type { Computer } from '@decipad/computer-interfaces';
import type { FileType, MyEditor, SlashCommand } from '@decipad/editor-types';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
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
  insertLayoutBelow,
  insertStructuredCodeLineBelow,
  withoutNormalizingAsync,
} from '@decipad/editor-utils';
import {
  useFileUploadStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { deleteText, removeNodes } from '@udecode/plate-common';
import type { Location, Path } from 'slate';
import { insertDataViewBelow } from './data-view';
import { insertTimeSeriesBelow } from './time-series';
import { insertDrawBelow } from './draw';
import {
  insertDisplayBelow,
  insertDropdownBelow,
  insertInputBelow,
  insertSliderInputBelow,
  insertMetricBelow,
} from './input';
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
  const { setDialogOpen, setFileType } = useFileUploadStore.getState();
  const { pushSidebar } = useNotebookMetaData.getState();

  // eslint-disable-next-line complexity
  await withoutNormalizingAsync(editor, async () => {
    switch (command) {
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
        insertInputBelow(
          editor,
          path,
          'boolean',
          getAvailableIdentifier,
          'Toggle'
        );
        break;
      case 'datepicker':
        insertInputBelow(editor, path, 'date', getAvailableIdentifier, 'Date');
        break;
      case 'slider':
        insertSliderInputBelow(editor, path, getAvailableIdentifier);
        break;
      case 'display':
        insertDisplayBelow(editor, path);
        break;
      case 'metric':
        insertMetricBelow(editor, path);
        break;
      case 'dropdown':
        insertDropdownBelow(editor, path, getAvailableIdentifier);
        break;
      case 'table':
        insertTableBelow(editor, path, getAvailableIdentifier);
        break;
      case 'data-view':
        await insertDataViewBelow(editor, path, computer);
        break;
      case 'time-series':
        await insertTimeSeriesBelow(editor, path, computer);
        break;
      case 'open-integration':
        pushSidebar({ type: 'integrations' });
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
      case 'radar-plot':
        insertPlotBelow(editor, path, 'radar');
        break;
      case 'funnel-plot':
        insertPlotBelow(editor, path, 'funnel');
        break;
      case 'combo-chart':
        insertPlotBelow(editor, path, 'combo');
        break;
      case 'submit-form':
        insertBlockOfTypeBelow(editor, path, ELEMENT_SUBMIT_FORM);
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
      case 'layout':
        insertLayoutBelow(editor, path);
        break;
      case 'upload-image':
        setFileType('image' as FileType);
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
