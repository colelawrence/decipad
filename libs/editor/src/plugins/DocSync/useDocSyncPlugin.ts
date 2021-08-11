import { Subscription } from 'rxjs';
import { PlatePlugin } from '@udecode/plate';
import { useContext, useEffect, useMemo, useState } from 'react';
import { HistoryEditor } from 'slate-history';
import { Editor } from 'slate';
import { SyncEditor } from '@decipad/docsync';
import { DocSyncContext } from '../../contexts/DocSync';

function ghostApply(editor: Editor, applier: () => void) {
  Editor.withoutNormalizing(editor, () => {
    if (HistoryEditor.isHistoryEditor(editor)) {
      HistoryEditor.withoutSaving(editor, applier);
    } else {
      applier();
    }
  });
}

interface IUseDocSyncPlugin {
  padId: string;
  editor?: Editor | null;
}

export const useDocSyncPlugin = ({
  padId,
  editor,
}: IUseDocSyncPlugin): PlatePlugin => {
  const { docsync } = useContext(DocSyncContext);
  const [syncEditor, setSyncEditor] = useState<SyncEditor | null>(null);

  // Create a padEditor
  useEffect(() => {
    const syncEditor = docsync?.edit(padId) ?? null;
    setSyncEditor(syncEditor);

    return () => {
      setSyncEditor(null);
      syncEditor?.stop();
    };
  }, [docsync, padId]);

  // Plug the padEditor and the editor
  useEffect(() => {
    let sub: Subscription;

    if (editor != null && syncEditor != null) {
      sub = syncEditor.slateOps().subscribe((ops) => {
        ghostApply(editor, () => {
          for (const op of ops) {
            editor.apply(op);
          }
        });
      });

      // TODO this just happens to cause a render, but how to we make
      // sure one happens and the editor doesn't stay empty?
      editor.children = syncEditor.getValue();
    }

    return () => sub?.unsubscribe();
  }, [editor, syncEditor]);

  return useMemo(
    () => ({
      onChange: (editor) => () => {
        const ops = editor.operations;
        if (!ops || ops.length === 0 || syncEditor == null) {
          return;
        }

        editor.operations = [];
        syncEditor.sendSlateOperations(ops);
      },
    }),
    [syncEditor]
  );
};
