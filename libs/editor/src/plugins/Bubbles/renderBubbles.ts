import { ELEMENT_CODE_LINE } from '@udecode/plate';
import { Editor, Node, Path, Range, Text } from 'slate';

export const renderBubble =
  (editor: Editor) =>
  ([node, path]: [node: Node, path: Path]): Range[] => {
    const ranges: Range[] = [];

    if (node === editor) return ranges;

    const [parentNode] = Editor.parent(editor, path);

    if (!parentNode || (parentNode as any).type !== ELEMENT_CODE_LINE) {
      return ranges;
    }

    if (!Text.isText(node)) {
      return ranges;
    }

    let start = 0;

    parentNode.children.forEach((child) => {
      const line = (child as any).text;
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
    });

    return ranges;
  };
