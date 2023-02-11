import {
  TRange,
  getAboveNode,
  getNodeString,
  getPointAfter,
} from '@udecode/plate';
import {
  MyDecorate,
  MyElementEntry,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  DECORATE_CODE_VARIABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE,
  TableElement,
  MyNodeEntry,
  MyEditor,
  MyDecorateEntry,
  DECORATE_AUTO_COMPLETE_MENU,
  ELEMENT_SMART_REF,
} from '@decipad/editor-types';
import { BasePoint, Path, Range } from 'slate';
import { parseStatement } from '@decipad/computer';
import { isExprRef } from 'libs/computer/src/exprRefs';
import { getVariableRanges } from './getVariableRanges';
import type { RangeWithVariableInfo } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';
import { filterDecorate } from './filterDecorate';
import { getCodeLineSource } from './getCodeLineSource';
import { memoizeDecorateWithSelection } from './memoizeDecorate';

const isNotExpreRef = (range: RangeWithVariableInfo) =>
  !isExprRef(range.variableName);

interface SubNode {
  start: number;
  path: number[];
  length: number;
}

const simpleRangeToSubNodeRange = (range: Range, subNodes: SubNode[]) => {
  const subNode = subNodes
    .slice()
    .reverse()
    .find((node: SubNode) => node.start <= range.anchor.offset);

  if (subNode) {
    /* eslint-disable-next-line no-param-reassign */
    range.anchor = {
      path: subNode.path,
      offset: range.anchor.offset - subNode.start,
    };
    /* eslint-disable-next-line no-param-reassign */
    range.focus = {
      path: subNode.path,
      offset: range.focus.offset - subNode.start + subNode.length,
    };
  }
  return range;
};

const subNodeCoords = (entry: MyElementEntry): SubNode[] => {
  const [node, path] = entry;
  let offset = 0;
  return node.children.map((child, i) => {
    const sn = {
      start: offset,
      path: [...path, i],
      length: getNodeString(child).length,
    };
    offset += getNodeString(child).length;
    return sn;
  });
};

export interface AutocompleteDecorationProps {
  variableInfo: RangeWithVariableInfo;
  [DECORATE_AUTO_COMPLETE_MENU]: true;
}

export const decorateCode = (
  elementType:
    | typeof ELEMENT_CODE_LINE
    | typeof ELEMENT_TABLE_COLUMN_FORMULA
    | typeof ELEMENT_CODE_LINE_V2_CODE
): MyDecorate =>
  filterDecorate(
    memoizeDecorateWithSelection((editor: MyEditor): MyDecorateEntry => {
      const syntaxErrorDecorations = (
        [, path]: MyElementEntry,
        source: string
      ): TRange[] => {
        const { error } = parseStatement(source);
        const ranges = getSyntaxErrorRanges(path, error);
        return ranges;
      };

      const variableDecorations = (
        variableRanges: RangeWithVariableInfo[]
      ): RangeWithVariableInfo[] => {
        return variableRanges
          .map((range) => ({
            ...range,
            [DECORATE_CODE_VARIABLE]: true,
          }))
          .filter(isNotExpreRef);
      };

      const autoCompleteMenuDecoration = (
        [, path]: MyNodeEntry,
        variableRanges: RangeWithVariableInfo[]
      ): (Range & AutocompleteDecorationProps)[] => {
        const { selection } = editor;

        if (
          selection?.focus?.path &&
          Path.isCommon(path, selection.focus.path)
        ) {
          const variableInfo = getVariableUnderCursor(
            selection.focus,
            variableRanges
          );

          if (variableInfo != null) {
            const pointAfter = getPointAfter(editor, selection.focus, {
              distance: 1,
              unit: 'character',
            });

            if (!cursorInsideVariable(pointAfter, variableInfo)) {
              return [
                {
                  anchor: variableInfo.anchor,
                  focus: variableInfo.anchor,
                  variableInfo,
                  [DECORATE_AUTO_COMPLETE_MENU]: true,
                },
              ];
            }
          }
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

        const sourceString = getCodeLineSource(node);

        // Slate seems to have an issue with decorators on empty lines so we're skipping them.
        if (!sourceString.length) {
          return [];
        }

        const sourceStrings = node.children.map((c) =>
          isElementOfType(c, ELEMENT_SMART_REF) ? '' : getNodeString(c)
        );
        let firstDeclarationFound = false;
        const variableRanges: RangeWithVariableInfo[] = sourceStrings.flatMap(
          (source, i) => {
            const varPath = [...path, i];

            const varRanges = getVariableRanges(source, varPath, nodeId);
            const res = [];
            for (const vr of varRanges) {
              // if previously on this line there was a declaration,
              // following declarations are column declarations and should be ignored
              // THIS IS UGLY AND SHOULD BE DONE IN A BETTER WAY
              if (!firstDeclarationFound || !vr.isDeclaration) res.push(vr);
              if (vr.isDeclaration) {
                firstDeclarationFound = true;
              }
            }

            return res;
          }
        );

        const subNodes = subNodeCoords(entry);

        const decorations: TRange[] = [
          ...syntaxErrorDecorations(entry, sourceString).map((range) =>
            simpleRangeToSubNodeRange(range, subNodes)
          ),
          ...variableDecorations(variableRanges),
          ...autoCompleteMenuDecoration(entry, variableRanges),
        ];

        return decorations;
      };

      return decorate as MyDecorateEntry;
    }),
    ([node]) => node.type === elementType
  );

function getVariableUnderCursor(
  cursor: BasePoint,
  variableRanges: RangeWithVariableInfo[]
) {
  return variableRanges.find((varRange) => {
    return !varRange.isDeclaration && Range.includes(varRange, cursor);
  });
}

function cursorInsideVariable(
  pointAfter: BasePoint | undefined,
  varName: Range
) {
  return pointAfter != null && Range.includes(varName, pointAfter);
}
