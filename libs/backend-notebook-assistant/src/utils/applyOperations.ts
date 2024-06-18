import { type TOperation, withoutNormalizing } from '@udecode/plate-common';
import { createMyPlateEditor, type Document } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import cloneDeep from 'lodash/cloneDeep';

export const applyOperations = (doc: Document, ops: TOperation[]) => {
  const editor = createMyPlateEditor();
  editor.children = cloneDeep(doc.children);
  editor.normalize = noop; // prevent normalisation

  withoutNormalizing(editor, () => {
    for (const op of ops) {
      editor.apply(op);
    }
  });

  return editor.children;
};
