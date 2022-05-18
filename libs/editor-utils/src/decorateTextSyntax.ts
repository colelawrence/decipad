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
} from '@decipad/editor-types';
import { Range } from 'slate';
import { Computer } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';

export const decorateTextSyntax =
  (computer: Computer, elementType: MyElement['type']): MyDecorate =>
  (editor: MyEditor): MyDecorateEntry => {
    const syntaxErrorDecorations = ([node, path]: MyElementEntry): TRange[] => {
      const lineResult = computer.results.getValue().blockResults[node.id];
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
        (range) => ({
          ...range,
          [DECORATE_CODE_VARIABLE]: true,
        })
      );
    };

    const decorate = (entry: MyElementEntry): Range[] => {
      const [node, path] = entry;
      if (node.type !== elementType) {
        return [];
      }
      let nodeId = node.id;
      if (node.type === ELEMENT_TABLE_COLUMN_FORMULA) {
        const table = getAboveNode<TableElement>(editor, {
          at: path,
          match: (n) => isElementOfType(n, ELEMENT_TABLE),
        });
        if (table) {
          nodeId = table[0].id;
        }
      }

      const decorations: TRange[] = syntaxErrorDecorations(entry).concat(
        variableDecorations(nodeId, entry)
      );

      return decorations;
    };

    return decorate as MyDecorateEntry;
  };
