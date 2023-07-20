import { MyEditor } from '@decipad/editor-types';
import React from 'react';
import { onDropTableCellResult } from './onDropTableCellResult';
import { onDropSmartCell } from './onDropSmartCell';

export const onDropCodeLine =
  (editor: MyEditor) => (event: React.DragEvent) => {
    onDropSmartCell(editor)(event);
    onDropTableCellResult(editor)(event);
  };
