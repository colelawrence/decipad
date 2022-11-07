import { MyEditor } from '@decipad/editor-types';
import { focusEditor } from '@udecode/plate';
import { useState, useCallback } from 'react';
import { ReactEditor } from 'slate-react';

export const useWriteLock = (editor: ReactEditor) => {
  const [writeLockCount, setWriteLockCount] = useState(0);
  const lockWriting = useCallback(() => {
    setWriteLockCount((prevCount) => prevCount + 1);
    let locked = true;
    return () => {
      if (locked) {
        locked = false;
        const { selection } = editor;
        setWriteLockCount((prevCount) => {
          const newCount = prevCount - 1;
          if (newCount === 0) {
            // Slightly risky hack to re-focus the editor after it lost focus because it was temporarily readonly
            setTimeout(() => {
              if (selection) {
                focusEditor(editor as MyEditor, selection);
              }
            }, 0);
          }
          return newCount;
        });
      }
    };
  }, [editor]);
  return { isWritingLocked: writeLockCount > 0, lockWriting };
};
