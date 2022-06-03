import { CodeLineElement, MyEditor } from '@decipad/editor-types';
import React from 'react';

export const onDragStartCodeLine =
  (editor: MyEditor, { element }: { element: CodeLineElement }) =>
  (e: React.DragEvent) => {
    // eslint-disable-next-line no-param-reassign
    editor.dragging = true;

    const string = JSON.stringify([element]);
    const encoded = window.btoa(encodeURIComponent(string));
    e.dataTransfer.setData('application/x-slate-fragment', encoded);
    e.dataTransfer.effectAllowed = 'copy';

    editor.setFragmentData(e.dataTransfer, 'drag');
  };
