import stringify from 'json-stringify-safe';
import { MyEditor } from '@decipad/editor-types';

const serialize = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

export const serializeDocument = (editor: MyEditor): string => {
  return stringify({ children: editor.children }, serialize);
};
