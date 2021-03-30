import { createRuntime } from '@decipad/language';
import { isCollapsed } from '@udecode/slate-plugins';
import { useCallback, useMemo } from 'react';
import { Editor, Range, Text, Transforms } from 'slate';

const actorId = 'actor-1';

export const useRuntime = ({ docId }) => {
  const runtime = useMemo(() => createRuntime(actorId), []);
  const context = useMemo(() => runtime.contexts.create(docId), [
    runtime,
    docId,
  ]);

  const onChangeResult = useCallback(
    async (editor: Editor) => {
      const { selection } = editor;

      if (selection && isCollapsed(selection)) {
        const cursor = Range.start(selection);

        const [parentNode] = Editor.parent(editor, cursor);
        if (parentNode.type !== 'code_block') return;

        const [node] = Editor.node(editor, cursor);
        console.log(parentNode);

        if (!Text.isText(node)) {
          return;
        }
        const cumulativeSum = ((sum) => (value: number) => (sum += value))(0);
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
        try {
          context.compute();
          const result = await context.resultAt(
            parentNode.id as string,
            foundLine
          );
          console.log(result);
          const [match] = Editor.nodes(editor, {
            match: (n) => n.id === parentNode.id,
          });
          Transforms.setNodes(
            editor,
            {
              result: match
                ? result.value[0] + ' ' + result.type.unit[0].unit + '\n'
                : null,
            },
            { match: (n) => Editor.isBlock(editor, n) }
          );
        } catch (err) {
          console.log(err);
        }
      }
    },
    [context]
  );

  return { context, onChangeResult };
};
