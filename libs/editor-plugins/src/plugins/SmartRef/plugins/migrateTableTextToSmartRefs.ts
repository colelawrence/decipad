import {
  ELEMENT_SMART_REF,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  MyEditor,
  SmartRefElement,
  TableCaptionElement,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import type { Token } from 'moo';
import {
  assertElementType,
  isElementOfType,
  isEntryOfType,
} from '@decipad/editor-utils';
import { tokenize } from '@decipad/computer';
import {
  ELEMENT_TR,
  getChildren,
  getNodeEntry,
  getNodeString,
  nanoid,
  TNodeEntry,
} from '@udecode/plate';
import { BaseEditor, Range, Transforms } from 'slate';
import {
  NormalizerReturnValue,
  createNormalizerPluginFactory,
} from '../../../pluginFactories';

export const migrateTableTextRefsToSmartRefs = createNormalizerPluginFactory({
  name: 'MIGRATE_TABLE_TEXT_TO_SMART_REFS',
  elementType: ELEMENT_TABLE,
  plugin:
    (editor) =>
    ([tableNode, tablePath]): NormalizerReturnValue => {
      assertElementType(tableNode, ELEMENT_TABLE);

      if ((tableNode.version ?? 0) < 2) {
        const caption = getNodeEntry(editor, tablePath.concat(0));
        const headerRow = getNodeEntry(editor, tablePath.concat(1));

        if (
          !isEntryOfType(caption, ELEMENT_TABLE_CAPTION) ||
          !isEntryOfType(headerRow, ELEMENT_TR)
        ) {
          return false;
        }

        const [varName, ...formulas] = getChildren(caption) as [
          TNodeEntry<TableCaptionElement>,
          ...TNodeEntry<TableColumnFormulaElement>[]
        ];
        const columnHeaders = getChildren(
          headerRow
        ) as TNodeEntry<TableHeaderElement>[];

        const tableName = getNodeString(varName[0]);

        // We'll be checking this progressively, not adding all-at-once, because that would be backwards incompatible with the ill-defined existing behavior of the language.
        const availableSmartRefs = new Map<string, [string, string | null]>();
        // At the start, only the table name is available
        availableSmartRefs.set(tableName, [tableNode.id, null]);

        for (const header of columnHeaders) {
          const columnName = getNodeString(header[0]);
          const formulaForThisColumn = formulas.find(
            (f) => f[0].columnId === header[0].id
          );
          if (formulaForThisColumn) {
            const willReplace = replaceSomeToSmartRefs(
              editor,
              formulaForThisColumn,
              availableSmartRefs
            );

            if (willReplace) {
              return willReplace;
            }
          }

          // {col} and {table.col} are available from now on
          availableSmartRefs.set(columnName, [header[0].id, null]);
          availableSmartRefs.set(`${tableName}.${columnName}`, [
            tableNode.id,
            header[0].id,
          ]);
        }

        return () =>
          Transforms.setNodes<TableElement>(
            editor as BaseEditor,
            { version: 2 },
            { at: tablePath }
          );
      }
      return false;
    },
});

function replaceSomeToSmartRefs(
  editor: MyEditor,
  entry: TNodeEntry<TableColumnFormulaElement>,
  seen: Map<string, [string, string | null]>
): NormalizerReturnValue {
  for (const [range, key] of locateTextRefs(entry)) {
    const [blockId, columnId] = seen.get(key) ?? [null, null];
    if (blockId == null) {
      continue;
    }

    const ref: SmartRefElement = {
      id: nanoid(),
      type: ELEMENT_SMART_REF,
      blockId,
      columnId,
      children: [{ text: '' }],
    };

    return () =>
      Transforms.insertNodes(editor as BaseEditor, ref, { at: range });
  }

  return false;
}

function* locateTextRefs(formula: TNodeEntry<TableColumnFormulaElement>) {
  for (const childEntry of getChildren(formula)) {
    const [child] = childEntry;

    if (isElementOfType(child, ELEMENT_SMART_REF)) {
      continue;
    } else {
      // text
      const tokens = tokenize(getNodeString(child));

      const range = (startTok: Token, endTok: Token): Range => ({
        anchor: { path: childEntry[1], offset: startTok.offset },
        focus: {
          path: childEntry[1],
          offset: endTok.offset + endTok.text.length,
        },
      });

      let tok: Token | undefined;

      while ((tok = tokens.shift())) {
        if (tok.type === 'identifier') {
          const maybeDot = tokens.at(0);
          const next = tokens.at(1);

          if (maybeDot?.text === '.' && next?.type === 'identifier') {
            // {tok}.{next}
            tokens.splice(0, 2); // skip dot and next identifier
            yield [range(tok, next), `${tok.value}.${next.value}`] as const;
          } else {
            yield [
              range(tok, tok) /* tiktok's evil twin */,
              tok.value,
            ] as const;
          }
        }
      }
    }
  }
}
