import {
  ELEMENT_SMART_REF,
  ELEMENT_TABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TH,
  MyEditor,
  MyValue,
  SmartRefElement,
} from '@decipad/editor-types';
import { assertElementType, isElementOfType } from '@decipad/editor-utils';
import { findNode } from '@udecode/plate';
import { BaseEditor, Editor, Transforms } from 'slate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../../pluginFactories';

export const migrateTableColumnSmartRefs = createNormalizerPluginFactory<
  MyValue,
  MyEditor
>({
  name: 'MIGRATE_TABLE_COLUMN_SMART_REFS',
  elementType: ELEMENT_SMART_REF,
  plugin:
    (editor) =>
    ([node, path]): NormalizerReturnValue => {
      assertElementType(node, ELEMENT_SMART_REF);

      if (node.columnId === undefined) {
        const blockAndColId = findColumnIdFor(editor, node);

        // Do we have something to update?
        const shouldUpdate =
          blockAndColId &&
          (blockAndColId[0] !== node.blockId ||
            (blockAndColId[1] ?? null) !== (node.columnId ?? null));

        if (shouldUpdate) {
          const [blockId, columnId] = blockAndColId;
          return () =>
            Transforms.setNodes<SmartRefElement>(
              editor as BaseEditor,
              { blockId, columnId },
              { at: path }
            );
        }
      }

      return false;
    },
});

/**
 * Create the columnId property for a smart ref that references a table column.
 * If it doesn't reference a table column, return null.
 */
function findColumnIdFor(
  editor: MyEditor,
  node: SmartRefElement
): [string, string | null] | null {
  const referencedThing = findNode(editor, {
    match: { id: node.blockId },
  })?.[0];
  if (
    !referencedThing ||
    (!isElementOfType(referencedThing, ELEMENT_TH) &&
      !isElementOfType(referencedThing, ELEMENT_TABLE_COLUMN_FORMULA))
  ) {
    return referencedThing ? [node.blockId, null] : null;
  }

  const referencedThId =
    // Attempt the legacy IDs first (they pointed to the formula)
    (isElementOfType(referencedThing, ELEMENT_TABLE_COLUMN_FORMULA)
      ? referencedThing.columnId
      : null) ??
    // Modern IDs point to the TH
    referencedThing.id;

  const th = findNode(editor, { match: { id: referencedThId } });
  if (!th || !isElementOfType(th?.[0], ELEMENT_TH)) {
    return th ? [referencedThId, null] : null;
  }

  const table = Editor.above(editor as BaseEditor, {
    at: th[1],
    match: (element) => isElementOfType(element, ELEMENT_TABLE),
  })?.[0];
  if (!table || !isElementOfType(table, ELEMENT_TABLE)) {
    return null;
  }

  return [table.id, referencedThId];
}
