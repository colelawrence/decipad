import camelcase from 'camelcase';
import { FC, ReactNode } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useToasts } from 'react-toast-notifications';
import { Editor, Transforms } from 'slate';
import slug from 'slug';
import { nanoid } from 'nanoid';
import { ELEMENT_IMPORT_DATA } from '@decipad/ui';
import { DropHint } from './DropHint';

interface DropFileProps {
  editor?: Editor;
  children: ReactNode;
}

type Item = { files: File[] } | undefined;

const acceptableFileTypes = ['text/csv'];
const maxFileSizeBytes = 100000;

const baseStyle = { position: 'relative' };

export function DropFile({ editor, children }: DropFileProps): ReturnType<FC> {
  const { addToast } = useToasts();
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: async (item: Item) => {
      if (!item?.files.length || !editor) {
        return;
      }
      for (const file of item.files) {
        if (isFileAcceptable(file)) {
          const block = {
            id: nanoid(),
            type: ELEMENT_IMPORT_DATA,
            'data-varname': varNamify(file.name),
            // eslint-disable-next-line no-await-in-loop
            'data-href': await fileToDataURL(file),
            'data-contenttype': file.type,
            children: [
              {
                text: '', // empty text node
              },
            ],
          };
          Transforms.insertNodes(editor, [block], { voids: true });
          Transforms.move(editor);
          addToast(`File ${file.name} successfully imported`, {
            appearance: 'success',
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

async function fileToDataURL(file: File): Promise<string> {
  const data = Buffer.from(await file.arrayBuffer()).toString('base64');
  return `data:${file.type};base64,${data}`;
}

function isFileAcceptable(file: File): boolean {
  if (acceptableFileTypes.indexOf(file.type) < 0) {
    // eslint-disable-next-line no-console
    console.error(`Cannot not import file of type ${file.type}`);
    return false;
  }

  if (file.size > maxFileSizeBytes) {
    // TODO: show the user the following error:
    // eslint-disable-next-line no-console
    console.error(
      `File too big (${file.size}). Will only accept files smaller than ${maxFileSizeBytes} bytes`
    );
    return false;
  }

  return true;
}

function varNamify(fileName: string): string {
  return camelcase(slug(fileName), {
    pascalCase: true,
    preserveConsecutiveUppercase: true,
  });
}
