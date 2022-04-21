import { useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Element } from '@decipad/editor-types';

export const useElementMutatorCallback = <E extends Element>(
  editor: ReactEditor,
  element: E,
  propName: keyof E
): ((newValue: E[typeof propName]) => void) => {
  return useCallback(
    (newValue: E[typeof propName]) => {
      const at = ReactEditor.findPath(editor, element);
      const mutation = {
        [propName]: newValue,
      } as unknown as Partial<E>;
      Transforms.setNodes(editor, mutation, { at });
    },
    [editor, element, propName]
  );
};
