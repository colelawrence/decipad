import { MyEditor } from '@decipad/editor-types';
import React from 'react';
import { findEventRange, select } from '@udecode/plate';

/**
 * Find the range where the drop happened and select it if defined.
 */
export const selectEventRange =
  (editor: MyEditor) => (event: React.DragEvent) => {
    // Find the range where the drop happened
    const range = findEventRange(editor, event);
    if (!range) return;

    select(editor, range);
  };
