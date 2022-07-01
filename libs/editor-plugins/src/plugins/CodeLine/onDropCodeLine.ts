import { Computer } from '@decipad/computer';
import { MyEditor } from '@decipad/editor-types';
import React from 'react';
import { onDropInlineResult } from './onDropInlineResult';
import { onDropTableCellResult } from './onDropTableCellResult';

export const onDropCodeLine =
  (computer: Computer) => (editor: MyEditor) => (event: React.DragEvent) => {
    onDropInlineResult(computer, editor)(event);
    onDropTableCellResult(editor)(event);
  };
