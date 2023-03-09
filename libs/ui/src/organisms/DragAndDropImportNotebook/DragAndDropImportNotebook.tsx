import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { GenericTable } from '../../icons';
import { emptywRapperStyles } from '../../templates/NotebookList/NotebookList';
import { DashboardDialogCTA } from '../DashboardDialogCTA/DashboardDialogCTA';

const acceptableFileTypes = ['application/json', 'application/zip'];
const maxFileSizeBytes = 10_000_000;

const validateItemAndGetFile = (item: DataTransferItem): File | undefined => {
  const file = item.getAsFile();
  if (!file) {
    console.warn('Expected item to be a file but received item', item);
    return;
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
    return;
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
    return;
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
        const file = validateItemAndGetFile(item);
        if (file) {
          const contents = Buffer.from(await file.arrayBuffer());
          onImport(contents.toString('base64'));
        }
      });
    },
    canDrop: (data: DataTransfer) => {
      const items = data?.items || [];
      return Array.from(items).some(
        (item) => validateItemAndGetFile(item) != null
      );
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
