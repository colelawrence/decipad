/* eslint-disable no-console */
import { MyElement, MyReactEditor } from '@decipad/editor-types';
import { useCallback, useEffect, useRef } from 'react';
import { setNodes } from '@udecode/plate';
import { Path } from 'slate';

const isTesting = !!process.env.JEST_WORKER_ID;

export const usePathMutatorCallback = <
  E extends MyElement,
  PropName extends keyof E
>(
  editor: MyReactEditor,
  path: Path | null | undefined,
  propName: PropName,
  origin: string,
  sideEffects?: () => void
): ((newValue: E[PropName], reason?: string) => void) => {
  const pathRef = useRef(path);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  return useCallback(
    (newValue: E[PropName], reason?: string) => {
      if (!pathRef.current) {
        return;
      }
      const mutation = {
        [propName]: newValue,
      };
      try {
        if (!isTesting) {
          console.debug(
            `>>>>>>>>>> usePathMutatorCallback(${origin})${
              reason ? ` (${reason})` : ''
            }`
          );
        }
        setNodes(editor, mutation, { at: pathRef.current });
        sideEffects?.();
        if (!isTesting) {
          console.debug(
            `<<<<<<<<<< usePathMutatorCallback(${origin})${
              reason ? ` (${reason})` : ''
            }`
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
    [editor, origin, propName, sideEffects]
  );
};
