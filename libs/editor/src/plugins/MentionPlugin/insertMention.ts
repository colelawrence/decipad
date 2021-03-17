import { Editor, Transforms } from 'slate';

export const insertMention = (editor: Editor, user: string): void => {
  const mention = { type: 'mention', user, children: [{ text: '' }] };

  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};
