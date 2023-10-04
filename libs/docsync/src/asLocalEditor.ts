import { MyEditor } from '@decipad/editor-types';
import { YjsEditor } from '@decipad/slate-yjs';

export const asLocalEditor = <T>(editor: MyEditor, fn: () => T): T => {
  return YjsEditor.asLocal(editor as unknown as YjsEditor, fn);
};
