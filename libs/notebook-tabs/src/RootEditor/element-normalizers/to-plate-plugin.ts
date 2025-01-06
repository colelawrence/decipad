import { TEditor, hasNode } from '@udecode/plate-common';
import { createNormalizer, normalizeElement } from './element-normalizer';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_PLOT,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { migrateIntegration } from './migrations/migrate-integrations';

const editorMigrations = <T extends TEditor = TEditor>(editor: T) =>
  [createNormalizer(ELEMENT_INTEGRATION, migrateIntegration)].map((plugin) =>
    plugin(editor)
  );

const editorNormalizers = <T extends TEditor = TEditor>(editor: T) =>
  [
    createNormalizer(ELEMENT_PLOT, normalizeElement(ELEMENT_PLOT)),
    createNormalizer(
      ELEMENT_INTEGRATION,
      normalizeElement(ELEMENT_INTEGRATION)
    ),
  ].map((plugin) => plugin(editor));

export const generalEditorNormalizers: MyPlatePlugin = {
  key: 'GENERAL_EDITOR_NORMALIZERS',
  withOverrides: (editor) => {
    const { normalizeNode } = editor;

    // It is important that migrations come first.
    // Because normalisers will default to the current element type,
    // and therefore lose data if migration to new elements dont happen before.
    const withEditorMigrationsAndNormalizers = [
      ...editorMigrations(editor),
      ...editorNormalizers(editor),
    ];

    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [, path] = entry;

      if (!hasNode(editor, path)) {
        // We haven't been properly inserted into the editor yet.
        // Skip.
        return;
      }

      for (const normalizer of withEditorMigrationsAndNormalizers) {
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
