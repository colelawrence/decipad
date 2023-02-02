import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { useCallback } from 'react';
import { findNodePath, setNodes } from '@udecode/plate';

export const useElementMutatorCallback = <E extends MyElement>(
  editor: MyReactEditor,
  element: E,
  propName: keyof E,
  sideEffects?: () => void
): ((newValue: E[typeof propName]) => void) => {
  return useCallback(
    (newValue: E[typeof propName]) => {
      const at = findNodePath(editor, element);
      const mutation = {
        [propName]: newValue,
      } as unknown as Partial<E>;
      try {
        setNodes(editor, mutation, { at });
        sideEffects?.();
      } catch (err) {
        console.error(err);
        // WTF: preventing https://linear.app/decipad/issue/ENG-1841/typeerror-converting-circular-structure-to-json]
        if (
          !(err as Error).message.includes(
            'Converting circular structure to JSON'
          )
        ) {
          throw err;
        }
      }
    },
    [editor, element, propName, sideEffects]
  );
};
