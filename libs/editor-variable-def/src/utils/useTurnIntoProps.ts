import { Result } from '@decipad/computer';
import {
  ELEMENT_VARIABLE_DEF,
  MyEditor,
  MyElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  getNodeEntrySafe,
  insertNodes,
  isElementOfType,
} from '@decipad/editor-utils';
import { textify } from '@decipad/parse';
import { useComputer } from '@decipad/react-contexts';
import {
  findNodePath,
  focusEditor,
  getNodeString,
  removeNodes,
  setNodes,
} from '@udecode/plate';
import { useMemo } from 'react';

export const defaultWidgetConversions: { title: string; value: string }[] = [
  { title: 'Input', value: 'expression' },
  { title: 'Toggle', value: 'toggle' },
  { title: 'Date', value: 'date' },
  { title: 'Slider', value: 'slider' },
  { title: 'Display', value: 'display' },
  { title: 'Dropdown', value: 'dropdown' },
];

export const convertInto =
  (editor: MyEditor, element: MyElement, result?: Result.Result) =>
  (value: string) => {
    const at = findNodePath(editor, element);
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

      const entry = getNodeEntrySafe(editor, at);
      if (entry) {
        const [node] = entry;
        if (isElementOfType(node, ELEMENT_VARIABLE_DEF)) {
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
      }
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

const turnIntoResultDebounceMs = 500;

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useTEditorRef();
  const computer = useComputer();

  const result = computer.getBlockIdResult$.useWithSelectorDebounced(
    turnIntoResultDebounceMs,
    (r) => r?.result,
    element.id
  );

  const onTurnInto = useMemo(
    () => convertInto(editor, element, result),
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
