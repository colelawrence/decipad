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
        setWriteLockCount((prevCount) => {
          const newCount = prevCount - 1;
          if (newCount === 0) {
            // Slightly risky hack to re-focus the editor after it lost focus because it was temporarily readonly
            setTimeout(() => ReactEditor.focus(editor), 0);
          }
          return newCount;
        });
      }
    };
  }, [editor]);
  return { isWritingLocked: writeLockCount > 0, lockWriting };
};
