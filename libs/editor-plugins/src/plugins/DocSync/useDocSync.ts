import {
  OnLoadedCallback,
  DocSyncEditor,
  createDocSyncEditor,
} from '@decipad/docsync';
import { TEditor } from '@udecode/plate';
import { useEffect, useState } from 'react';

export type { DocSyncEditor };

interface UseDocSyncProps {
  notebookId: string;
  editor?: TEditor;
  authSecret?: string;
  readOnly?: boolean;
  onLoaded: (source: 'local' | 'remote') => void;
  onError?: (event: Error | Event) => void;
}

export const useDocSync = ({
  notebookId,
  editor,
  authSecret,
  readOnly = false,
  onLoaded,
  onError,
}: UseDocSyncProps): DocSyncEditor | undefined => {
  const [docSync, setDocSync] = useState<DocSyncEditor | undefined>(undefined);

  useEffect(() => {
    const syncEditor =
      editor &&
      createDocSyncEditor(editor, notebookId, {
        readOnly,
        authSecret,
        onError,
      });

    setDocSync(syncEditor);

    return () => {
      if (syncEditor) {
        syncEditor.disconnect();
        syncEditor.destroy();
        setDocSync(undefined);
      }
    };
  }, [authSecret, editor, notebookId, onError, onLoaded, readOnly]);

  useEffect(() => {
    let localOnLoaded: OnLoadedCallback;
    if (docSync) {
      localOnLoaded = (source) => {
        if (docSync) {
          docSync.offLoaded(onLoaded);
        }
        onLoaded(source);
      };

      docSync.onLoaded(localOnLoaded);
    }
    return () => {
      if (docSync && localOnLoaded) {
        docSync.offLoaded(localOnLoaded);
      }
    };
  }, [docSync, onLoaded]);

  return docSync;
};
