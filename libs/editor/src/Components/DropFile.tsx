import React, { ReactNode, useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

interface DropFileProps {
  editor: ReactEditor;
  children: ReactNode;
}

export function DropFile({ editor, children }: DropFileProps) {
  const importFile = useCallback(
    (file: File) => {
      if (file.type !== 'text/csv') {
        console.error('Will not import file of type ' + file.type);
        return;
      }

      if (file.size > 102400) {
        console.error(
          `File too big (file.size). Will only accept files smaller than 100kB`
        );
        return;
      }

      (async () => {
        const dataUrl = await fileToDataURL(file);
        const code = {
          type: 'code_block',
          children: [{ text: `import_data "${dataUrl}"` }],
        };
        Transforms.insertNodes(editor, code);
        Transforms.move(editor);
      })();
    },
    [editor]
  );

  const dropHandler = useCallback(
    (ev) => {
      ev.preventDefault();
      if (ev.dataTransfer && ev.dataTransfer.items) {
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          const item = ev.dataTransfer.items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              importFile(file);
            }
          }
        }
      } else if (ev.dataTransfer) {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          const file = ev.dataTransfer.files[i];
          importFile(file);
        }
      } else {
        throw new Error('Data transfer not suported!');
      }
    },
    [importFile]
  );

  return <div onDrop={dropHandler}>{children}</div>;
}

async function fileToDataURL(file: File): Promise<string> {
  const data = Buffer.from(await file.arrayBuffer()).toString('base64');
  return `data:${file.type};base64,${data}`;
}
