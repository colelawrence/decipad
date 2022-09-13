import { TRange, getAboveNode, getNodeString } from '@udecode/plate';
import {
  MyDecorate,
  MyElement,
  MyElementEntry,
  DECORATE_CODE_VARIABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE,
  TableElement,
  MyNodeEntry,
  MyEditor,
  MyDecorateEntry,
  DECORATE_AUTO_COMPLETE_MENU,
} from '@decipad/editor-types';
import { Path, Range } from 'slate';
import { parseStatement } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';
import { findWordStart, nextIsWordChar } from './autoComplete';
import { filterDecorate } from './filterDecorate';
import { memoizeDecorate } from './memoizeDecorate';

export const decorateCode = (elementType: MyElement['type']): MyDecorate =>
  filterDecorate(
    memoizeDecorate((editor: MyEditor): MyDecorateEntry => {
      const syntaxErrorDecorations = (
        [, path]: MyElementEntry,
        source: string
      ): TRange[] => {
        const { error } = parseStatement(source);
        return getSyntaxErrorRanges(path, error);
      };

      const variableDecorations = (
        nodeId: string,
        [, path]: MyNodeEntry,
        source: string
      ): Range[] => {
        return getVariableRanges(source, path, nodeId).map((range) => ({
          ...range,
          [DECORATE_CODE_VARIABLE]: true,
        }));
      };

      const autoCompleteMenuDecoration = (
        [, path]: MyNodeEntry,
        source: string
      ): Range[] => {
        const { selection } = editor;

        if (
          // Slate seems to have an issue with decorators on empty lines so we're skipping them.
          source.length > 0 &&
          selection?.focus?.path &&
          Path.isCommon(path, selection.focus.path) &&
          !nextIsWordChar(editor, selection.focus)
        ) {
          const { start } = findWordStart(editor, selection.focus);

          const r = [
            {
              anchor: start,
              focus: start,
              [DECORATE_AUTO_COMPLETE_MENU]: true,
            },
          ];
          return r;
        }
        return [];
      };

      const decorate = (entry: MyElementEntry): Range[] => {
        const [node, path] = entry;
        if (node.type !== elementType) {
          return [];
        }
        let nodeId = node.id as string;
        if (node.type === ELEMENT_TABLE_COLUMN_FORMULA) {
          const table = getAboveNode<TableElement>(editor, {
            at: path,
            match: (n) => isElementOfType(n, ELEMENT_TABLE),
          });
          if (table) {
            nodeId = table[0].id;
          }
        }

        const sourceString = getNodeString(node);
        const decorations: TRange[] = [
          ...syntaxErrorDecorations(entry, sourceString),
          ...variableDecorations(nodeId, entry, sourceString),
          ...autoCompleteMenuDecoration(entry, sourceString),
        ];

        return decorations;
      };

      return decorate as MyDecorateEntry;
    }),
    ([node]) => node.type === elementType
  );
