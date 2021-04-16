import React, { useState, useEffect, useCallback } from 'react';
import { useRuntimeEditor } from './useRuntimeEditor';
import { Node, createEditor, Editor } from 'slate';
import { HistoryEditor } from 'slate-history';
import { pipe } from '@udecode/slate-plugins';

export const useEditor = ({ workspaceId, padId, withPlugins, setValue }) => {
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const { padEditor, onChangeResult } = useRuntimeEditor({ workspaceId, padId });

  useEffect(() => {
    if (padEditor) {
      if (padEditor.padId !== padId) {
        padEditor.stop();
        setEditor(null);
        return
      }
      const value = padEditor.getValue();
      if (value) {
        const editor: Editor = pipe(createEditor(), ...withPlugins);

        const sub = padEditor.slateOps().subscribe((ops) => {
          Editor.withoutNormalizing(editor, () => {
            if (HistoryEditor.isHistoryEditor(editor)) {
              HistoryEditor.withoutSaving(editor, () => {
                for (const op of ops) {
                  editor.apply(op)
                }
              })
            } else {
              for (const op of ops) {
                editor.apply(op)
              }
            }
          })
        })

        setValue(value);
        setLoading(false)
        setEditor(editor);

        return () => sub.unsubscribe()
      }
    }
  }, [padEditor, padId, setValue, withPlugins]);

  const onChange = useCallback(
    (newValue: Node[]) => {
      const ops = editor.operations;
      if (ops && ops.length) {
        padEditor.sendSlateOperations(ops);
      }
    }, [editor, padEditor])

  return { loading, editor, onChange }
}