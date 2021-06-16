import React, { ReactNode, useCallback } from 'react';
import { ReactEditor } from 'slate-react';

interface DropFileProps {
  editor: ReactEditor,
  children: ReactNode,
}

export function DropFile({editor, children}: DropFileProps) {
  const importFile = useCallback((file: File) => {
    console.log('... file.name = ' + file.name);
    const dataUrl = await fileToDataURL(file);
  }, [editor]);

  const dropHandler = useCallback((ev) => {
    ev.preventDefault();
    if (ev.dataTransfer && ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        const item = ev.dataTransfer.items[i];
        if (item.kind === 'file') {
          var file = item.getAsFile();
          if (file) {
            importFile(file);

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

function fileToDataURL(file: File): Promise<string> {

}