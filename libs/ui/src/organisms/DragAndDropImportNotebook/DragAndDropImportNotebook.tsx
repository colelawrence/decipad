import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { GenericTable } from '../../icons';
import { emptywRapperStyles } from '../../templates/NotebookList/NotebookList';
import { DashboardDialogCTA } from '../DashboardDialogCTA/DashboardDialogCTA';

const acceptableFileTypes = ['application/json'];
const maxFileSizeBytes = 1_000_000;

const validateItemAndGetFile = (item: DataTransferItem) => {
  const file = item.getAsFile();
  if (!file) {
    console.warn('Expected item to be a file but received item', item);
    throw new Error('Received an item that is not a file');
  }

  if (!acceptableFileTypes.includes(file.type)) {
    console.warn(
      'Expected one of types',
      acceptableFileTypes,
      'but received file',
      file,
      'with type',
      file.type
    );
    throw new Error(`Cannot import file of type ${file.type}`);
  }

  if (file.size > maxFileSizeBytes) {
    console.warn(
      'Expected only files smaller than',
      maxFileSizeBytes,
      'bytes but received file',
      file,
      'with size',
      file.size
    );
    throw new Error(
      `File too big (${file.size} bytes). Will only accept files smaller than ${maxFileSizeBytes} bytes.`
    );
  }

  return file;
};

const dropStyles = css({
  zIndex: 2,
});

interface DragAndDropImportNotebookProps {
  readonly enabled?: boolean;
  readonly onImport?: (source: string) => void;
  readonly children?: ReactNode;
}

export const DragAndDropImportNotebook = ({
  onImport = noop,
  enabled = true,
  children,
}: DragAndDropImportNotebookProps): ReturnType<FC> => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: (data: DataTransfer) => {
      const items = data?.items || [];
      Array.from(items).forEach(async (item) => {
        // Async fire and forget
        try {
          const file = validateItemAndGetFile(item);
          onImport(await file.text());
        } catch (err) {
          console.warn('Did not import invalid item', item);
        }
      });
    },
    canDrop: (data: DataTransfer) => {
      const items = data?.items || [];
      return Array.from(items).some((item) => {
        try {
          validateItemAndGetFile(item);
          return true;
        } catch {
          return false;
        }
      });
    },
    collect: (monitor: DropTargetMonitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
  });
  return !enabled ? (
    <div>{children}</div>
  ) : (
    <div css={isOver && canDrop && dropStyles} ref={drop}>
      {isOver ? (
        <div css={emptywRapperStyles(false)}>
          <DashboardDialogCTA
            icon={<GenericTable />}
            primaryText={'Drag and drop your notebooks here'}
            secondaryText={
              'Quickly import decipad notebooks, csv, and other files...'
            }
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
};
