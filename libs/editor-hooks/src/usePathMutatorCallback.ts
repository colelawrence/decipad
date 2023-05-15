import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { useCallback, useEffect, useRef } from 'react';
import { setNodes } from '@udecode/plate';
import { Path } from 'slate';

export const usePathMutatorCallback = <
  E extends MyElement,
  PropName extends keyof E
>(
  editor: MyReactEditor,
  path: Path | null | undefined,
  propName: PropName,
  sideEffects?: () => void
): ((newValue: E[PropName]) => void) => {
  const pathRef = useRef(path);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  return useCallback(
    (newValue: E[PropName]) => {
      if (!pathRef.current) {
        return;
      }
      const mutation = {
        [propName]: newValue,
      };
      try {
        setNodes(editor, mutation, { at: pathRef.current });
        sideEffects?.();
      } catch (err) {
        console.error(err);
      }
    },
    [editor, propName, sideEffects]
  );
};
