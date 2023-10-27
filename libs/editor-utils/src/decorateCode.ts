import {
  ENodeEntry,
  PlateEditor,
  TElement,
  TNodeEntry,
  TRange,
  Value,
  getNodeString,
  getPointAfter,
} from '@udecode/plate';
import {
  MyDecorate,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  DECORATE_CODE_VARIABLE,
  ELEMENT_TABLE_COLUMN_FORMULA,
  DECORATE_AUTO_COMPLETE_MENU,
  ELEMENT_SMART_REF,
  CodeLineV2Element,
  CodeLineElement,
  CodeLineV2ElementCode,
  TableColumnFormulaElement,
  MyValue,
} from '@decipad/editor-types';
import { BasePoint, Path, Range } from 'slate';
import { RemoteComputer, parseStatement } from '@decipad/remote-computer';
import { isExprRef } from 'libs/computer/src/exprRefs';
import { getVariableRanges } from './getVariableRanges';
import type { RangeWithVariableInfo } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';
import { filterDecorate } from './filterDecorate';
import { getCodeLineSource } from './getCodeLineSource';
import { memoizeDecorateWithSelection } from './memoizeDecorate';
import { getAboveNodeSafe } from './getAboveNodeSafe';
import { getTypeErrorRanges } from './getTypeErrorRanges';

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

const subNodeCoords = (entry: TNodeEntry<TElement>): SubNode[] => {
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

export const decorateCode = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  computer: RemoteComputer,
  elementType:
    | typeof ELEMENT_CODE_LINE
    | typeof ELEMENT_TABLE_COLUMN_FORMULA
    | typeof ELEMENT_CODE_LINE_V2_CODE
): MyDecorate<object, TV, TE> =>
  filterDecorate<object, TV, TE>(
    memoizeDecorateWithSelection<object, TV, TE>((editor) => {
      const syntaxErrorDecorations = (
        [, path]: TNodeEntry,
        source: string
      ): TRange[] => {
        const { error } = parseStatement(source);
        return getSyntaxErrorRanges(path, error);
      };

      const typeErrorDecorations = ([
        element,
        path,
      ]: TNodeEntry<TElement>): TRange[] => {
        const { id } = element;
        const result = computer.getBlockIdResult(id as string);
        if (!result || !result.result) {
          return [];
        }
        const { type } = result.result;
        if (type.kind !== 'type-error') {
          return [];
        }
        return getTypeErrorRanges(path, type);
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
        [, path]: TNodeEntry,
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

      const decorate = (_entry: ENodeEntry<TV>): Range[] => {
        const [_node, path] = _entry;
        if (_node.type !== elementType) {
          return [];
        }
        const node = _node as
          | CodeLineElement
          | TableColumnFormulaElement
          | CodeLineV2ElementCode;
        const entry = _entry as ENodeEntry<TV>;

        const nodeId = getRootNodeId<TV, TE>(editor as TE, entry);
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

        const subNodes = subNodeCoords(entry as TNodeEntry<TElement>);

        const decorations: TRange[] = [
          ...syntaxErrorDecorations(entry, sourceString).map((range) =>
            simpleRangeToSubNodeRange(range, subNodes)
          ),
          ...typeErrorDecorations(entry as TNodeEntry<TElement>),
          ...variableDecorations(variableRanges),
          ...autoCompleteMenuDecoration(
            entry as TNodeEntry<TElement>,
            variableRanges
          ),
        ];

        return decorations;
      };

      return decorate;
    }),
    ([node]) => node.type === elementType
  );

/** Get the node representing "this" element. To be fed into the Computer and avoid recursive references. */
export const getRootNodeId = <
  TV extends Value = MyValue,
  TE extends PlateEditor<TV> = PlateEditor<TV>
>(
  editor: TE,
  [node, path]: ENodeEntry<TV>
) => {
  if (node.type === ELEMENT_TABLE_COLUMN_FORMULA) {
    return node.columnId;
  }

  if (node.type === ELEMENT_CODE_LINE_V2_CODE) {
    const codeLine = getAboveNodeSafe<CodeLineV2Element>(editor, {
      at: path,
      match: (n) => isElementOfType(n, ELEMENT_CODE_LINE_V2),
    });
    if (codeLine) {
      return codeLine[0].id;
    }
  }

  return node.id;
};

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
