import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';
import { useSelected } from 'slate-react';
import { useOverridableState } from '@decipad/react-utils';
import type { CellProps } from './types';
import { useIsCellEditable } from './useIsCellEditable';
import { CellEditorDefaultReadOnly } from './CellEditorDefaultReadOnly';
import { CellEditorDefaultEditing } from './CellEditorDefaultEditing';
import { focusEditor } from '@udecode/plate-common';
import { useTEditorRef } from '@decipad/editor-types';
import isHotkey from 'is-hotkey';
import { useCellDOMEvents } from './useCellDOMEvents';

export const CellEditorDefault = (cellProps: CellProps) => {
  const {
    value: initialValue,
    onChange,
    onEditingChange,
    eventTarget,
    onConvertToFormula,
  } = cellProps;

  const readOnlyComponent = <CellEditorDefaultReadOnly {...cellProps} />;

  const editor = useTEditorRef();
  const focused = useSelected();
  const editable = useIsCellEditable(cellProps);

  const [editing, setEditing] = useState(false);
  const [value, _setValue] = useOverridableState(initialValue);
  const valueRef = useRef(value);

  const setValue = useCallback(
    (newValue: string) => {
      valueRef.current = newValue;
      _setValue(newValue);
    },
    [_setValue]
  );

  const startEditing = useCallback(
    (replacementValue?: string) => {
      if (!editable) return;

      if (replacementValue !== undefined) {
        setValue(replacementValue);
      }

      setEditing(true);
    },
    [editable, setValue]
  );

  const stopEditing = useCallback(() => {
    setEditing(false);

    /**
     * Unless the stopEditing was caused by a blur event, we want to return
     * focus to the editor.
     */
    if (focused) {
      focusEditor(editor);
    }
  }, [editor, focused]);

  const cancelEdit = stopEditing;

  const confirmEdit = useCallback(() => {
    onChange?.(valueRef.current);
    stopEditing();
  }, [onChange, stopEditing]);

  // Keep onEditingChange up to date
  useLayoutEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  // Stop editing when focus is lost
  useEffect(() => {
    if (!focused && editing) {
      confirmEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Start editing on Enter
      if (isHotkey('enter', event)) {
        startEditing();
        event.preventDefault();
        return;
      }

      const { key, ctrlKey, metaKey, altKey } = event;
      const hasModifier = ctrlKey || metaKey || altKey;

      // Convert to formula on '='
      if (!hasModifier && key === '=') {
        onConvertToFormula?.();
        event.preventDefault();
        return;
      }

      // Start editing on type
      // Heuristic: Printable characters tend to have length 1
      if (!hasModifier && key.length === 1) {
        startEditing(key);
        event.preventDefault();
      }
    },
    [onConvertToFormula, startEditing]
  );

  const onDoubleClick = useCallback(() => startEditing(), [startEditing]);

  useCellDOMEvents(eventTarget, { onKeyDown, onDoubleClick });

  return editing ? (
    <CellEditorDefaultEditing
      value={value}
      cellProps={cellProps}
      onChange={setValue}
      onConfirm={confirmEdit}
      onCancel={cancelEdit}
    />
  ) : (
    readOnlyComponent
  );
};
