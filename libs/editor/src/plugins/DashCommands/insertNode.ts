import { autoformatBlock, unwrapList } from '@udecode/slate-plugins';
import { Editor, Element, Location, Text, Transforms } from 'slate';

export const insertNode = (
  editor: Editor,
  type: string,
  target: Location,
  mode: 'block' | 'inline' | 'inline-block',
  format?: (editor: Editor) => void
): void => {
  if (mode === 'block') {
    autoformatBlock(editor, type, target, {
      preFormat: (editor: Editor) => unwrapList(editor),
      format,
    });
  } else if (mode === 'inline') {
    const options: Partial<Editor> | Partial<Element> | Partial<Text> = {};
    options[type] = true;
    Transforms.delete(editor, { at: target });
    Transforms.setNodes(editor, options, {
      match: (n) => Text.isText(n),
      split: true,
    });
  }
};
