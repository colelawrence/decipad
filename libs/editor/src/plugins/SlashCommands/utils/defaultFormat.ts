import { Editor } from 'slate';
import { TEditor, setNodes } from '@udecode/plate';

export function defaultFormat(type: string) {
  return (editor: TEditor): void =>
    setNodes(editor, { type }, { match: (n) => Editor.isBlock(editor, n) });
}
