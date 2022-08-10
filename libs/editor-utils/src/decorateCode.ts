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
import { Computer } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';
import { findWordStart, nextIsWordChar } from './autoComplete';

export const decorateCode =
  (computer: Computer, elementType: MyElement['type']): MyDecorate =>
  (editor: MyEditor): MyDecorateEntry => {
    const syntaxErrorDecorations = ([node, path]: MyElementEntry): TRange[] => {
      const lineResult =
        computer.results.getValue().blockResults[node.id as string];
      if (!lineResult) {
        return [];
      }
      return getSyntaxErrorRanges(path, lineResult);
    };

    const variableDecorations = (
      nodeId: string,
      [node, path]: MyNodeEntry
    ): Range[] => {
      return getVariableRanges(getNodeString(node), path, nodeId).map(
        (range) => ({ ...range, [DECORATE_CODE_VARIABLE]: true })
      );
    };

    const autoCompleteMenuDecoration = ([node, path]: MyNodeEntry): Range[] => {
      const { selection } = editor;

      if (
        // Slate seems to have an issue with decorators on empty lines so we're skipping them.
        getNodeString(node).length > 0 &&
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

      const decorations: TRange[] = syntaxErrorDecorations(entry)
        .concat(variableDecorations(nodeId, entry))
        .concat(autoCompleteMenuDecoration(entry));

      return decorations;
    };

    return decorate as MyDecorateEntry;
  };
