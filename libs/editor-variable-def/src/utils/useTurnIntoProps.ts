import type { MyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { useMemo } from 'react';
import { useComputer } from '@decipad/editor-hooks';
import { convertVariableDefInto } from '@decipad/editor-utils';

export const defaultWidgetConversions: { title: string; value: string }[] = [
  { title: 'Input', value: 'expression' },
  { title: 'Toggle', value: 'toggle' },
  { title: 'Date', value: 'date' },
  { title: 'Slider', value: 'slider' },
  { title: 'Display', value: 'display' },
  { title: 'Dropdown', value: 'dropdown' },
];

const turnIntoResultDebounceMs = 500;

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useMyEditorRef();
  const computer = useComputer();

  const result = computer.getBlockIdResult$.useWithSelectorDebounced(
    turnIntoResultDebounceMs,
    (r) => r?.result,
    element.id
  );

  const onTurnInto = useMemo(
    () => convertVariableDefInto(editor, element, result),
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
