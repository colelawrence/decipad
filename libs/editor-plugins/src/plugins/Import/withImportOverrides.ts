import { WithOverride } from '@udecode/plate';
import { isImportUrl } from '@decipad/import';
import { insertImport } from './insertImport';

export const withImportOverrides: WithOverride = (editor) => {
  const { insertData } = editor;

  // eslint-disable-next-line no-param-reassign
  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    const source = isImportUrl(text);
    if (source) {
      insertImport(editor, source, text);
    }
    insertData(data);
  };

  return editor;
};
