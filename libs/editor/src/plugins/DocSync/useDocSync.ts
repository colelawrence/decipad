import { useMemo } from 'react';
import { Editor } from 'slate';
import { withDocSync, DocSyncEditor } from '@decipad/docsync';

export type { DocSyncEditor };

interface IUseDocSync {
  padId: string;
  editor: Editor | undefined;
  authSecret?: string | undefined;
}

export const useDocSync = ({
  padId,
  editor,
  authSecret,
}: IUseDocSync): DocSyncEditor | undefined => {
  const docSync = useMemo<DocSyncEditor | undefined>(
    () => editor && withDocSync(editor, padId, { authSecret }),
    [padId, editor, authSecret]
  );
  return docSync;
};
