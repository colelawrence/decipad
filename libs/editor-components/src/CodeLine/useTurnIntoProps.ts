import { Computer, Parseable, ParseableDate } from '@decipad/computer';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
  MyElement,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  insertNodes,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { useCallback, useMemo } from 'react';

export const useTurnIntoProps = (
  element: MyElement,
  computer: Computer,
  lineId: string
) => {
  const editor = useTEditorRef();

  const symbol = computer.getDefinedSymbolInBlock$.use(lineId);
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
          : getNodeString(element).split('=')[1].trim();

      withoutNormalizing(editor, () => {
        insertNodes(
          editor,
          {
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
          { at: requirePathBelowBlock(editor, path) }
        );
        removeNodes(editor, { at: path });
        focusEditor(editor);
      });
    },
    [editor, element, parseableType, symbol]
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

const getWidgetOptionByType = (type: Parseable | ParseableDate) => {
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
