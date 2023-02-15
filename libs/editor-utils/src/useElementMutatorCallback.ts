import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { useCallback } from 'react';
import { findNodePath, setNodes } from '@udecode/plate';

export const useElementMutatorCallback = <
  E extends MyElement,
  PropName extends keyof E
>(
  editor: MyReactEditor,
  element: E,
  propName: PropName,
  sideEffects?: () => void
): ((newValue: E[PropName]) => void) => {
  return useCallback(
    (newValue: E[PropName]) => {
      const at = findNodePath(editor, element);
      const mutation = {
        [propName]: newValue,
      };
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
