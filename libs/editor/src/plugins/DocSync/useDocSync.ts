import { DocSyncEditor, withDocSync } from '@decipad/docsync';
import { useMemo } from 'react';
import { Editor } from 'slate';

export type { DocSyncEditor };

interface IUseDocSync<E extends Editor> {
  notebookId: string;
  editor: E | undefined;
  authSecret?: string | undefined;
  onError?: (event: Error | Event) => void;
}

export const useDocSync = <E extends Editor>({
  notebookId,
  editor,
  authSecret,
  onError,
}: IUseDocSync<E>): DocSyncEditor<E> | undefined => {
  const docSync = useMemo<DocSyncEditor<E> | undefined>(
    () => editor && withDocSync(editor, notebookId, { authSecret, onError }),
    [notebookId, editor, authSecret, onError]
  );
  return docSync;
};
