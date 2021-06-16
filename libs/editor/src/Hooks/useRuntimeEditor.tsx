import { PadEditor } from '@decipad/runtime';
import { isCollapsed } from '@udecode/slate-plugins';
import { useCallback, useContext, useRef, useEffect, useState } from 'react';
import { Editor, Range, Text, Transforms } from 'slate';
import { dequal } from 'dequal';
import { RuntimeContext } from '../Contexts/Runtime';

interface IUseRuntimeEditor {
  workspaceId: string;
  padId: string;
}

export const useRuntimeEditor = ({ padId }: IUseRuntimeEditor) => {
  const { runtime } = useContext(RuntimeContext);
  const [padEditor, setPadEditor] = useState<PadEditor | null>(null);

  useEffect(() => {
    if (runtime) {
      const padEditor = runtime.startPadEditor(padId, true);
      setPadEditor(padEditor);
    }
  }, [runtime, padId]);

  const prevResultRef = useRef<unknown>(null);

  const onChangeResult = useCallback(
    (editor: Editor) => {
      if (!editor || !padEditor) {
        return;
      }

      async function evaluatePad() {
        const { selection } = editor;

        if (selection && isCollapsed(selection)) {
          const cursor = Range.start(selection);

          const [parentNode] = Editor.parent(editor, cursor) as any;
          if (parentNode.type !== 'code_block') return;

          const [node] = Editor.node(editor, cursor);

          if (!Text.isText(node)) {
            return;
          }
          const cumulativeSum = (
            (sum) => (value: number) =>
              (sum += value)
          )(0);
          const lines = node.text
            .split('\n')
            .map((line) => line.length)
            .map(cumulativeSum)
            .map((line, i) => line + i);

          let c = cursor.offset;
          let foundLine = lines.length + 1;
          lines.forEach((line) => {
            if (c > line) return;
            c -= line;
            foundLine--;
          });

          if (padEditor) {
            try {
              const result = await padEditor.resultAt(
                (parentNode as any).id as string,
                foundLine
              );

              if (dequal(prevResultRef.current, result)) {
                return;
              }
              prevResultRef.current = result;

              for (const error of result.errors ?? []) {
                console.error(error);
              }

              const [match] = Editor.nodes(editor, {
                match: (n: any) => n.id === parentNode.id,
              });

              Transforms.setNodes(
                editor,
                {
                  result: match ? result ?? null : null,
                },
                { match: (n) => Editor.isBlock(editor, n) }
              );
            } catch (err) {
              console.error(err);
            }
          }
        }
      }

      evaluatePad();
    },
    [padEditor]
  );

  return { padEditor, onChangeResult };
};
