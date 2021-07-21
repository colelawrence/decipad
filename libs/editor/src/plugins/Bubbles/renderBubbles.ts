import { Editor, Node, Path, Range, Text } from 'slate';

export const renderBubble =
  (editor: Editor) =>
  ([node, path]: [node: Node, path: Path]): Range[] => {
    const ranges: Range[] = [];

    if (node === editor) return ranges;

    const [parentNode] = Editor.parent(editor, path);

    if (!parentNode || (parentNode as any).type !== 'code_block') return ranges;

    if (!Text.isText(node)) {
      return ranges;
    }

    const lines = node.text.split('\n');
    let start = 0;

    for (const line of lines) {
      const variable = line.match(/^\s*(\w+)\s*(?:=[^=]+)$/)?.[1];
      const length = variable?.length || 0;
      const end = start + length;

      if (variable) {
        (ranges as any).push({
          bubble: true,
          variable,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }
      start = start + line.length + 1;
    }

    return ranges;
  };
