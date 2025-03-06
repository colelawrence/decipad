import { createNormalizer, normalizeElement } from './element-normalizer';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_METRIC,
  ELEMENT_PLOT,
} from '@decipad/editor-types';
import { migrateIntegration } from './migrations/migrate-integrations';
import { integrationColumnNameNormalizer, metricNormalizer } from './special';
import {
  PlatePlugin,
  TEditor,
  TNodeEntry,
  hasNode,
} from '@udecode/plate-common';

const editorMigrations = [
  createNormalizer(ELEMENT_INTEGRATION, migrateIntegration),
];

const editorNormalizers = [
  createNormalizer(ELEMENT_PLOT, normalizeElement(ELEMENT_PLOT)),
  createNormalizer(ELEMENT_INTEGRATION, normalizeElement(ELEMENT_INTEGRATION)),
  createNormalizer(ELEMENT_INTEGRATION, integrationColumnNameNormalizer),
  createNormalizer(ELEMENT_METRIC, metricNormalizer),
];

export const genericEditorNormalizer = <T extends TEditor = TEditor>(
  name: string,
  normalizers: Array<(_editor: T) => (_entry: TNodeEntry<any>) => boolean>
): PlatePlugin => ({
  key: name,
  withOverrides: (editor) => {
    const { normalizeNode } = editor;

    const normalizersWithEditor = normalizers.map((normalizer) =>
      normalizer(editor as T)
    );

    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [, path] = entry;

      if (!hasNode(editor, path)) {
        // We haven't been properly inserted into the editor yet.
        // Skip.
        return;
      }

      for (const normalizer of normalizersWithEditor) {
        const op = normalizer(entry as any);

        if (op) {
          // Do not continue trying to normalize, since we have not normalized something.
          return;
        }
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});

export const generalEditorNormalizers = genericEditorNormalizer(
  'GENERAL_EDITOR_NORMALIZERS',
  [...editorMigrations, ...editorNormalizers]
);
