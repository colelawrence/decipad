import camelcase from 'camelcase';
import React, { ReactNode, useCallback, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Editor, Transforms } from 'slate';
import slug from 'slug';

interface DropFileProps {
  editor: Editor;
  children: ReactNode;
}

const acceptableFileTypes = ['text/csv'];
const maxFileSizeBytes = 100000;

export function DropFile({ editor, children }: DropFileProps) {
  const [dragIsHovering, setDragIsHovering] = useState(false);
  const { addToast } = useToasts();

  const importFile = useCallback(
    (file: File) => {
      if (!isFileAcceptable(file)) {
        return;
      }
      (async () => {
        const dataUrl = await fileToDataURL(file);
        const varName = varNamify(file.name);
        const code = {
          type: 'code_block',
          children: [{ text: `${varName} = import_data "${dataUrl}"` }],
        };
        Transforms.insertNodes(editor, code);
        Transforms.move(editor);
        addToast(`File ${file.name} successfully imported`, {
          appearance: 'success',
        });
      })();
    },
    [editor, addToast]
  );

  const dropHandler = useCallback(
    (ev) => {
      ev.preventDefault();
      if (dragIsHovering) {
        setDragIsHovering(false);
      }
      for (const file of getFilesFromEvent(ev)) {
        importFile(file);
      }
    },
    [importFile, dragIsHovering, setDragIsHovering]
  );

  const dragEnterHandler = useCallback(
    (ev) => {
      ev.preventDefault();
      if (!dragIsHovering) {
        setDragIsHovering(true);
      }
    },
    [dragIsHovering, setDragIsHovering]
  );

  const dragOverHandler = dragEnterHandler; // lazy

  const dragLeaveHandler = useCallback(
    (ev) => {
      ev.preventDefault();
      if (dragIsHovering) {
        setDragIsHovering(false);
      }
    },
    [dragIsHovering, setDragIsHovering]
  );

  return (
    <div
      onDrop={dropHandler}
      onDragEnter={dragEnterHandler}
      onDragLeave={dragLeaveHandler}
      onDragOver={dragOverHandler}
    >
      {children}
    </div>
  );
}

async function fileToDataURL(file: File): Promise<string> {
  const data = Buffer.from(await file.arrayBuffer()).toString('base64');
  return `data:${file.type};base64,${data}`;
}

function isFileAcceptable(file: File): boolean {
  if (acceptableFileTypes.indexOf(file.type) < 0) {
    // TODO: show the user the following error:
    console.error('Cannot not import file of type ' + file.type);
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

function getFilesFromEvent(ev: DragEvent): File[] {
  const files = [];
  if (ev.dataTransfer && ev.dataTransfer.items) {
    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
      const item = ev.dataTransfer.items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  } else if (ev.dataTransfer) {
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      const file = ev.dataTransfer.files[i];
      files.push(file);
    }
  } else {
    throw new Error('Data transfer not suported!');
  }

  return files;
}

function varNamify(fileName: string): string {
  return camelcase(slug(fileName), {
    pascalCase: true,
    preserveConsecutiveUppercase: true,
  });
}
