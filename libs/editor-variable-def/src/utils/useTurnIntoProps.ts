import {
  MyEditor,
  MyElement,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import {
  setNodes,
  findNodePath,
  getNodeEntry,
  ELEMENT_CODE_LINE,
  getNodeString,
  insertNodes,
  removeNodes,
} from '@udecode/plate';
import { Path } from 'slate';
import { useMemo } from 'react';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';

export const defaultWidgetConversions: { title: string; value: string }[] = [
  { title: 'Input', value: 'expression' },
  { title: 'Toggle', value: 'toggle' },
  { title: 'Date', value: 'date' },
  { title: 'Slider', value: 'slider' },
  { title: 'Dropdown', value: 'dropdown' },
];

export const defaultConvertInto =
  (editor: MyEditor, at?: Path) => (value: string) => {
    if (!at) {
      return;
    }

    if (value === 'calculation') {
      const [node] = getNodeEntry<VariableDefinitionElement>(editor, at);
      const [caption, expression] = node.children;
      const symbol = getNodeString(caption);
      const code =
        node.variant === 'date'
          ? `date(${getNodeString(expression)})`
          : getNodeString(expression);

      insertNodes(
        editor,
        {
          id: nanoid(),
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: `${symbol} = ${code}`,
            },
          ],
        },
        { at: requirePathBelowBlock(editor, at) }
      );
      setTimeout(() => {
        removeNodes(editor, { at });
      }, 0);
    }

    const coercedKind =
      value === 'toggle'
        ? 'boolean'
        : value === 'date'
        ? 'date'
        : value === 'dropdown'
        ? 'string'
        : 'number';

    setNodes(
      editor,
      { variant: value, coerceToType: { kind: coercedKind, date: 'day' } },
      { at }
    );
  };

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useTEditorRef();

  const onTurnInto = useMemo(
    () => defaultConvertInto(editor, findNodePath(editor, element)),
    [editor, element]
  );
  const turnInto = useMemo(
    () => [
      { title: 'Calculation', value: 'calculation' },
      ...defaultWidgetConversions.filter(
        ({ value }) => value !== element.variant
      ),
    ],
    [element]
  );

  return {
    onTurnInto,
    turnInto,
  };
};
