import type { Computer } from '@decipad/computer-interfaces';
import type { Parser } from '@decipad/remote-computer';
import type {
  MyElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
  useMyEditorRef,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { useCallback, useMemo } from 'react';

const getElementExpression = (element: MyElement): string => {
  if (element.type === ELEMENT_CODE_LINE_V2) {
    return getNodeString(element.children[1]);
  }
  return getNodeString(element).split('=')[1]?.trim() ?? getNodeString(element);
};

export const useTurnIntoProps = (
  element: MyElement,
  computer: Computer,
  lineId: string
) => {
  const editor = useMyEditorRef();

  const symbol = computer.getSymbolDefinedInBlock$.use(lineId);
  const parseableType = computer.getParseableTypeInBlock$.use(lineId);

  const onTurnInto = useCallback(
    (variant: string) => {
      const path = findNodePath(editor, element);

      if (!path || !symbol || !parseableType) {
        return;
      }

      const coercedKind =
        variant === 'toggle'
          ? 'boolean'
          : variant === 'expression'
          ? 'number'
          : variant;

      const date =
        parseableType.kind === 'date' ? parseableType.dateGranularity : 'day';

      const expression =
        parseableType.kind === 'date'
          ? parseableType.dateStr
          : getElementExpression(element);

      withoutNormalizing(editor, () => {
        insertNodes(
          editor,
          [
            {
              id: lineId,
              type: ELEMENT_VARIABLE_DEF,
              variant,
              coerceToType: { kind: coercedKind, date },
              children: [
                {
                  type: ELEMENT_CAPTION,
                  children: [{ text: symbol }],
                },
                {
                  type: ELEMENT_EXPRESSION,
                  children: [{ text: expression }],
                },
              ],
            } as VariableDefinitionElement,
          ],
          { at: requirePathBelowBlock(editor, path) }
        );
        removeNodes(editor, { at: path });
        focusEditor(editor);
      });
    },
    [editor, element, parseableType, symbol, lineId]
  );

  const turnInto = useMemo(() => {
    if (symbol && parseableType) {
      return getWidgetOptionByType(parseableType);
    }
    return undefined;
  }, [parseableType, symbol]);

  return {
    onTurnInto,
    turnInto,
  };
};

const getWidgetOptionByType = (
  type: Parser.Parseable | Parser.ParseableDate
) => {
  switch (type?.kind) {
    case 'boolean':
      return [{ title: 'Toggle Widget', value: 'toggle' }];
    case 'date':
      return [{ title: 'Date Widget', value: 'date' }];
    case 'number':
    case 'string':
      return [{ title: 'Input Widget', value: 'expression' }];
    default:
      return undefined;
  }
};
