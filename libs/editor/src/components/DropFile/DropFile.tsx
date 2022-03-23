import { Editor } from '@decipad/editor-types';
import { UploadDataOptions } from '@decipad/editor-plugins';
import { FC, ReactNode } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropHint } from './DropHint';

interface DropFileProps {
  editor?: Editor;
  notebookId: string;
  startUpload: (options: UploadDataOptions) => void;
  children: ReactNode;
}

type Item = { files: File[] } | undefined;

const acceptableFileTypes = ['text/csv'];
const maxFileSizeBytes = 100000;

const baseStyle = { position: 'relative' };

export function DropFile({
  editor,
  notebookId,
  children,
  startUpload,
}: DropFileProps): ReturnType<FC> {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: async (item: Item) => {
      if (!item?.files.length || !editor) {
        return;
      }
      for (const file of item.files) {
        if (isFileAcceptable(file)) {
          // eslint-disable-next-line no-await-in-loop
          startUpload({
            notebookId,
            file,
          });
        }
      }
    },
    canDrop: (item: Item) => {
      return item?.files.some(isFileAcceptable) || false;
    },
    collect: (monitor: DropTargetMonitor) => {
      const canDropFile = monitor.getItemType() === NativeTypes.FILE;
      return {
        isOver: monitor.isOver(),
        canDrop: canDropFile,
      };
    },
  });

  const isActive = canDrop && isOver;
  const style = isActive ? baseStyle : {};

  return (
    <div ref={drop} style={style}>
      <DropHint isActive={isActive}>{children}</DropHint>
    </div>
  );
}

function isFileAcceptable(file: File): boolean {
  if (acceptableFileTypes.indexOf(file.type) < 0) {
    // TODO: show the user the following error:
    console.error(`Cannot not import file of type ${file.type}`);
    return false;
  }

  if (file.size > maxFileSizeBytes) {
    // TODO: show the user the following error:
    console.error(
      `File too big (${file.size}). Will only accept files smaller than ${maxFileSizeBytes} bytes`
    );
    return false;
  }

  return true;
}
