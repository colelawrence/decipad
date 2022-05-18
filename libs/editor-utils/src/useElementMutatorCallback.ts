import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { useCallback } from 'react';
import { findNodePath, setNodes } from '@udecode/plate';

export const useElementMutatorCallback = <E extends MyElement>(
  editor: MyReactEditor,
  element: E,
  propName: keyof E
): ((newValue: E[typeof propName]) => void) => {
  return useCallback(
    (newValue: E[typeof propName]) => {
      const at = findNodePath(editor, element);
      const mutation = {
        [propName]: newValue,
      } as unknown as Partial<E>;
      setNodes(editor, mutation, { at });
    },
    [editor, element, propName]
  );
};
