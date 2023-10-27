import React from 'react';
import { PlateEditor, Value, findEventRange, select } from '@udecode/plate';
import { MyValue } from '@decipad/editor-types';

/**
 * Find the range where the drop happened and select it if defined.
 */
export const selectEventRange =
  <TV extends Value = MyValue, TE extends PlateEditor<TV> = PlateEditor<TV>>(
    editor: TE
  ) =>
  (event: React.DragEvent) => {
    // Find the range where the drop happened
    const range = findEventRange(editor, event);
    if (!range) return;

    select(editor, range);
  };
