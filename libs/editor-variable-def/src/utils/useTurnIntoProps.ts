import {
  MyEditor,
  MyElement,
  useTEditorRef,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { Result } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import {
  setNodes,
  findNodePath,
  getNodeEntry,
  getNodeString,
  removeNodes,
  focusEditor,
} from '@udecode/plate';
import { textify } from '@decipad/parse';
import { Path } from 'slate';
import { useMemo } from 'react';
import { createStructuredCodeLine, insertNodes } from '@decipad/editor-utils';

export const defaultWidgetConversions: { title: string; value: string }[] = [
  { title: 'Input', value: 'expression' },
  { title: 'Toggle', value: 'toggle' },
  { title: 'Date', value: 'date' },
  { title: 'Slider', value: 'slider' },
  { title: 'Dropdown', value: 'dropdown' },
];

export const defaultConvertInto =
  (editor: MyEditor, at?: Path, result?: Result.Result) => (value: string) => {
    if (!at) {
      return;
    }

    if (value === 'calculation' && result) {
      let code: string;
      try {
        code = textify(result);
      } catch {
        return;
      }

      const [node] = getNodeEntry<VariableDefinitionElement>(editor, at);
      const {
        id,
        children: [caption],
      } = node;
      const varName = getNodeString(caption);

      removeNodes(editor, { at });
      insertNodes(editor, createStructuredCodeLine({ id, varName, code }), {
        at,
      });
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
    focusEditor(editor);
  };

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useTEditorRef();
  const computer = useComputer();

  const result = computer.getBlockIdResult$.useWithSelector(
    (r) => r?.result,
    element.id
  );

  const onTurnInto = useMemo(
    () => defaultConvertInto(editor, findNodePath(editor, element), result),
    [editor, element, result]
  );
  const turnInto = useMemo(
    () => [
      ...(result ? [{ title: 'Calculation', value: 'calculation' }] : []),
      ...defaultWidgetConversions.filter(
        ({ value }) => value !== element.variant
      ),
    ],
    [element, result]
  );

  return {
    onTurnInto,
    turnInto,
  };
};
