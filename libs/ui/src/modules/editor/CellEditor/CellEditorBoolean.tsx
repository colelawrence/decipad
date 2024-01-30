import isHotkey from 'is-hotkey';
import { useCallback } from 'react';
import { Toggle } from '../../../shared';
import type { CellProps } from './types';
import { useCellDOMEvents } from './useCellDOMEvents';
import { useIsCellEditable } from './useIsCellEditable';

export const CellEditorBoolean = (cellProps: CellProps) => {
  const { value, onChange, eventTarget } = cellProps;

  const editable = useIsCellEditable(cellProps);

  const toggleValue = useCallback(() => {
    onChange?.(value === 'true' ? 'false' : 'true');
  }, [onChange, value]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isHotkey(['space', 'enter'], event)) {
        toggleValue();
      }
    },
    [toggleValue]
  );

  useCellDOMEvents(eventTarget, { onKeyDown });

  return (
    <Toggle
      active={value === 'true'}
      onChange={(newValue) => onChange?.(newValue ? 'true' : 'false')}
      parentType="table"
      disabled={!editable}
    />
  );
};
