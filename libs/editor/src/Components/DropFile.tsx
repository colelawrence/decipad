import React, { ReactNode, useCallback } from 'react';
import { autoformatBlock, unwrapList } from '@udecode/slate-plugins';
import { Editor, Location } from 'slate';
import { ReactEditor } from 'slate-react';

interface DropFileProps {
  editor: ReactEditor,
  children: ReactNode,
}

export function DropFile({editor, children}: DropFileProps) {
  const importFile = useCallback((file: File, loc: Location) => {
    (async () => {
      console.log('... file.name = ' + file.name);
      const dataUrl = await fileToDataURL(file);
      console.log('data:', dataUrl);
      insertNode(editor, 'code_block', loc);
    })();
  }, [editor]);

  const dropHandler = useCallback((ev) => {
    ev.preventDefault();
    if (ev.dataTransfer && ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        const item = ev.dataTransfer.items[i];
        if (item.kind === 'file') {
          var file = item.getAsFile();
          if (file) {
            importFile(file, {x: ev.offsetX, y: offsetY });

          }

        }
      }
    } else if(ev.dataTransfer) {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        const file = ev.dataTransfer.files[i];
        importFile(file);
      }
    } else {
      throw new Error('Data transfer not suported!');
    }
  }, [importFile]);

  return (
    <div onDrop={dropHandler} style={{border: '1px solid red'}}>
      {children}
    </div>
  );
}

async function fileToDataURL(file: File): Promise<string> {
  const data = Buffer.from(await file.arrayBuffer()).toString('base64')
  return `data:${file.type};base64,${data}`;
}


export const insertNode = (
  editor: Editor,
  type: string,
  target: Location
): void => {
  autoformatBlock(editor, type, target, {
    preFormat: (editor: Editor) => unwrapList(editor)
  });
};
