import { BaseEditor, createEditor } from 'slate';
import { ReactEditor, withReact } from 'slate-react';

export type TitleEditor = BaseEditor & ReactEditor;

export const createTitleEditor = (): TitleEditor => withReact(createEditor());
