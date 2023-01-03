import { MyEditor } from '@decipad/editor-types';
import React from 'react';
import { onDropInlineResult } from './onDropInlineResult';
import { onDropTableCellResult } from './onDropTableCellResult';
import { onDropSmartCell } from './onDropSmartCell';

export const onDropCodeLine =
  (editor: MyEditor) => (event: React.DragEvent) => {
    onDropInlineResult(editor)(event);
    onDropSmartCell(editor)(event);
    onDropTableCellResult(editor)(event);
  };
