import type {
  MetricElement,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { ELEMENT_DISPLAY, ELEMENT_METRIC } from '@decipad/editor-types';
import { insertNodes, isElement, removeNodes } from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import { isFlagEnabled } from '@decipad/feature-flags';

export const createMigrateDisplayPlugin = createNormalizerPluginFactory({
  name: 'MIGRATE_DISPLAY_TO_METRIC',
  elementType: ELEMENT_DISPLAY,
  plugin:
    (editor: MyEditor) =>
    (entry: MyNodeEntry): NormalizerReturnValue => {
      if (!isFlagEnabled('METRIC_BLOCK')) return false;
      const [node, path] = entry;
      if (isElement(node) && node.type === ELEMENT_DISPLAY) {
        return () => {
          removeNodes(editor, { at: path });
          insertNodes(
            editor,
            {
              type: ELEMENT_METRIC,
              id: node.id as any,
              blockId: node.blockId,
              caption: node.varName || 'Metric',
              color: node.color,
              formatting: node.formatting,
              comparisonBlockId: '',
              comparisonDescription: '',
              migratedFromDisplayElement: node,
              children: [{ text: '' }],
            } satisfies MetricElement,
            { at: path }
          );
        };
      }
      return false;
    },
});
