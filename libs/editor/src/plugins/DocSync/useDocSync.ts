import { useMemo } from 'react';
import { Editor } from 'slate';
import { withDocSync, DocSyncEditor } from '@decipad/docsync';

export type { DocSyncEditor };

interface IUseDocSync<E extends Editor> {
  padId: string;
  editor: E | undefined;
  authSecret?: string | undefined;
  onError?: (event: Error | Event) => void;
}

export const useDocSync = <E extends Editor>({
  padId,
  editor,
  authSecret,
  onError,
}: IUseDocSync<E>): DocSyncEditor<E> | undefined => {
  const docSync = useMemo<DocSyncEditor<E> | undefined>(
    () => editor && withDocSync(editor, padId, { authSecret, onError }),
    [padId, editor, authSecret, onError]
  );
  return docSync;
};
