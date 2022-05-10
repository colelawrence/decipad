import { Editor } from 'slate';

const serialize = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

export const serializeDocument = (editor: Editor): string => {
  return JSON.stringify({ children: editor.children }, serialize);
};
