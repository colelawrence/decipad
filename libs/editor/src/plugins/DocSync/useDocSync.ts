import { useMemo } from 'react';
import { Editor } from 'slate';
import { withDocSync, DocSyncEditor } from '@decipad/docsync';

export type { DocSyncEditor };

interface IUseDocSync {
  padId: string;
  editor: Editor | undefined;
  authSecret?: string | undefined;
  onError?: (event: Error | Event) => void;
}

export const useDocSync = ({
  padId,
  editor,
  authSecret,
  onError,
}: IUseDocSync): DocSyncEditor | undefined => {
  const docSync = useMemo<DocSyncEditor | undefined>(
    () => editor && withDocSync(editor, padId, { authSecret, onError }),
    [padId, editor, authSecret, onError]
  );
  return docSync;
};
