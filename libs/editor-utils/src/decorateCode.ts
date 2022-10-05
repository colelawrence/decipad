import { TRange, getAboveNode, getNodeString } from '@udecode/plate';
import {
  MyDecorate,
  MyElementEntry,
  ELEMENT_CODE_LINE,
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
import { Path, Range } from 'slate';
import { parseStatement } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import type { RangeWithVariableInfo } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { isElementOfType } from './isElementOfType';
import { findWordStart, nextIsWordChar } from './autoComplete';
import { filterDecorate } from './filterDecorate';
import { getCodeLineSource } from './getCodeLineSource';
import { memoizeDecorate } from './memoizeDecorate';

const isNotExpreRef = (range: RangeWithVariableInfo) => {
  return !range.variableName?.startsWith('exprRef_');
};

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

export const decorateCode = (
  elementType: typeof ELEMENT_CODE_LINE | typeof ELEMENT_TABLE_COLUMN_FORMULA
): MyDecorate =>
  filterDecorate(
    memoizeDecorate((editor: MyEditor): MyDecorateEntry => {
      const syntaxErrorDecorations = (
        [, path]: MyElementEntry,
        source: string
      ): TRange[] => {
        const { error } = parseStatement(source);
        const ranges = getSyntaxErrorRanges(path, error);
        return ranges;
      };

      const variableDecorations = (
        nodeId: string,
        [, path]: MyNodeEntry,
        source: string[]
      ): Range[] => {
        // const ranges = [];
        const ranges = source.flatMap((s, i) => {
          return getVariableRanges(s, [...path, i], nodeId)
            .map((range) => ({
              ...range,
              [DECORATE_CODE_VARIABLE]: true,
            }))
            .filter(isNotExpreRef);
        });
        return ranges;
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

        const sourceString = getCodeLineSource(node);
        const sourceStrings = node.children.map((c) =>
          isElementOfType(c, ELEMENT_SMART_REF) ? '' : getNodeString(c)
        );
        const subNodes = subNodeCoords(entry);

        const decorations: TRange[] = [
          ...syntaxErrorDecorations(entry, sourceString).map((range) =>
            simpleRangeToSubNodeRange(range, subNodes)
          ),
          ...variableDecorations(nodeId, entry, sourceStrings),
          ...autoCompleteMenuDecoration(entry, sourceString),
        ];

        return decorations;
      };

      return decorate as MyDecorateEntry;
    }),
    ([node]) => node.type === elementType
  );
