import { TEditor } from '@udecode/plate';
import { format } from './format';

export const formatText = (editor: TEditor, text: string): void => {
  format(editor, () => editor.insertText(text));
};
