import { MyEditor } from '@decipad/editor-types';
import React from 'react';
import { onDropInlineResult } from './onDropInlineResult';
import { onDropTableCellResult } from './onDropTableCellResult';

export const onDropCodeLine =
  (editor: MyEditor) => (event: React.DragEvent) => {
    onDropInlineResult(editor)(event);
    onDropTableCellResult(editor)(event);
  };
