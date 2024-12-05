import { TEditor, hasNode } from '@udecode/plate-common';
import { createNormalizer } from './element-normalizer';
import { ELEMENT_PLOT, MyPlatePlugin } from '@decipad/editor-types';

const editorNormalizers = <T extends TEditor = TEditor>(editor: T) =>
  [createNormalizer(ELEMENT_PLOT)].map((plugin) => plugin(editor));

export const generalEditorNormalizers: MyPlatePlugin = {
  key: 'GENERAL_EDITOR_NORMALIZERS',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;
    const withEditorNormalizers = editorNormalizers(editor);

    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [, path] = entry;

      if (!hasNode(editor, path)) {
        // We haven't been properly inserted into the editor yet.
        // Skip.
        return;
      }

      for (const normalizer of withEditorNormalizers) {
        const op = normalizer(entry);

        if (op) {
          // Do not continue trying to normalize, since we have not normalized something.
          return;
        }
      }

      return normalizeNode(entry);
    };

    return editor;
  },
};
