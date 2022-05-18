import { getText, TDescendant, Decorate, getAbove } from '@udecode/plate';
import {
  DECORATE_CODE_VARIABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE,
  Element,
  TableElement,
} from '@decipad/editor-types';
import { NodeEntry, Range } from 'slate';
import { Computer } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';

export const decorateTextSyntax =
  (computer: Computer, elementType: Element['type']): Decorate =>
  (editor) => {
    const syntaxErrorDecorations = ([
      node,
      path,
    ]: NodeEntry<TDescendant>): Range[] => {
      const lineResult = computer.results.getValue().blockResults[node.id];
      if (!lineResult) {
        return [];
      }
      return getSyntaxErrorRanges(path, lineResult);
    };

    const variableDecorations = (
      nodeId: string,
      [, path]: NodeEntry<TDescendant>
    ): Range[] => {
      return getVariableRanges(getText(editor, path), path, nodeId).map(
        (range) => ({
          ...range,
          [DECORATE_CODE_VARIABLE]: true,
        })
      );
    };

    return (entry: NodeEntry<TDescendant>) => {
      const [node, path] = entry;
      if (node.type !== elementType) {
        return [];
      }
      let nodeId = node.id;
      if (node.type === ELEMENT_TABLE_COLUMN_FORMULA) {
        const table = getAbove<TableElement>(editor, {
          at: path,
          match: (n) => isElementOfType(n, ELEMENT_TABLE),
        });
        if (table) {
          nodeId = table[0].id;
        }
      }

      const decorations = syntaxErrorDecorations(entry).concat(
        variableDecorations(nodeId, entry)
      );

      return decorations;
    };
  };
