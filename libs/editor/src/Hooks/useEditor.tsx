import { pipe } from '@udecode/slate-plugins';
import { useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { createEditor, Descendant, Editor } from 'slate';
import { HistoryEditor } from 'slate-history';
import { withPlugins } from '../Plugins';
import { useRuntimeEditor } from './useRuntimeEditor';

interface IUseEditor {
  workspaceId: string;
  padId: string;
  setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
  setValue: React.Dispatch<React.SetStateAction<Descendant[] | null>>;
}

export const useEditor = ({
  workspaceId,
  padId,
  setValue,
  setEditor,
}: IUseEditor) => {
  const [loading, setLoading] = useState(true);
  const { padEditor, onChangeResult } = useRuntimeEditor({
    workspaceId,
    padId,
  });

  useEffect(() => {
    let sub: Subscription;
    (async () => {
      if (padEditor) {
        if (padEditor.padId !== padId) {
          padEditor.stop();
          return;
        }
        const isRemote = padEditor.isOnlyRemote();
        const value = isRemote
          ? await padEditor.getValueEventually()
          : padEditor.getValue();
        if (value) {
          const editor: Editor = pipe(createEditor(), ...withPlugins);
          sub = padEditor.slateOps().subscribe((ops) => {
            Editor.withoutNormalizing(editor, () => {
              if (HistoryEditor.isHistoryEditor(editor)) {
                HistoryEditor.withoutSaving(editor, () => {
                  for (const op of ops) {
                    editor.apply(op);
                  }
                });
              } else {
                for (const op of ops) {
                  editor.apply(op);
                }
              }
            });
          });

          setValue(value);
          setEditor(editor);
          setLoading(false);
        }
      }
    })();
    return () => sub?.unsubscribe();
  }, [padEditor, padId, setValue, setEditor]);

  const onChange = useCallback(
    (editor: Editor) => {
      const ops = editor.operations;
      if (ops && ops.length && padEditor) {
        padEditor.sendSlateOperations(ops);
      }

      onChangeResult(editor);
    },
    [padEditor, onChangeResult]
  );

  return { loading, onChange };
};
