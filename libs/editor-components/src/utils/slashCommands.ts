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
import {
  insertBlockOfTypeBelow,
  insertCodeLineBelow,
  insertDividerBelow,
  insertStructuredCodeLineBelow,
} from '@decipad/editor-utils';
import {
  useConnectionStore,
  useFileUploadStore,
} from '@decipad/react-contexts';
import {
  deleteText,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import type { Location, Path } from 'slate';
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
import type { RemoteComputer } from '@decipad/remote-computer';

export type GetAvailableIdentifier = (prefix: string, start?: number) => string;
export interface ExecuteProps {
  editor: MyEditor;
  computer: RemoteComputer;
  path: Path;
  deleteFragment?: Location;
  deleteBlock?: boolean;
  command: SlashCommand;
  getAvailableIdentifier: GetAvailableIdentifier;
}

export const execute = ({
  command,
  computer,
  editor,
  path,
  getAvailableIdentifier,
  deleteFragment,
  deleteBlock = true,
}: ExecuteProps): void => {
  const { changeOpen } = useConnectionStore.getState();
  const { setDialogOpen, setFileType } = useFileUploadStore.getState();

  // eslint-disable-next-line complexity
  withoutNormalizing(editor, () => {
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
        insertDataViewBelow(editor, path, computer);
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
      case 'import':
        insertBlockOfTypeBelow(editor, path, ELEMENT_FETCH);
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
