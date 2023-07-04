/* eslint decipad/css-prop-named-variable: 0 */
import { AnyElement, CellValueType } from '@decipad/editor-types';
import { Result } from '@decipad/computer';
import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent as RMouseEvent,
} from 'react';
import { BooleanEditor } from './BooleanEditor';
import { DateEditor } from './DateEditor';
import { DropdownEditor } from './DropdownEditor';

interface SpecificEditorProps {
  open: boolean;
  children: ReactNode;
  type?: CellValueType;
  value?: string;
  unit?: string;
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
  element?: AnyElement;
}

const editorComponents = (): Record<string, FC<SpecificEditorProps>> => ({
  boolean: BooleanEditor,
  date: DateEditor,
  dropdown: DropdownEditor,
});

interface CellEditorProps {
  focused?: boolean;
  isEditable?: boolean;
  children: ReactNode;
  type?: CellValueType;
  unit?: string;
  value?: string;
  parentType?: 'table' | 'input';
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
  dropdownOptions?: Array<{ id: string; value: string; focused?: boolean }>;
  dropdownResult?: Result.Result;
  width?: number;
  element?: AnyElement;
}

export const CellEditor: FC<CellEditorProps> = ({
  focused = false,
  isEditable = false,
  value,
  type,
  unit,
  onChangeValue: _onChangeValue,
  children,
  dropdownOptions,
  dropdownResult,
  parentType = 'input',
  width,
  element,
}) => {
  const [opened, setOpened] = useState(false);

  const toggleOpened = useCallback(() => {
    setTimeout(() => {
      // we have to delay the closing because otherwise we may lose the new value
      setOpened((o) => !o);
    }, 0);
  }, []);

  useEffect(() => {
    if (!focused && opened) {
      toggleOpened();
    }
  }, [focused, opened, toggleOpened]);

  const onChangeValue = useCallback(
    (newValue: string | undefined) => {
      _onChangeValue(newValue);
      setOpened(false);
    },
    [_onChangeValue]
  );
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (opened) {
            setOpened(false);
            event.stopPropagation();
            event.preventDefault();
          }

          break;
      }
    },
    [opened]
  );

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const onGlobalClick = useCallback(
    (event: MouseEvent) => {
      const { target } = event;
      if (
        target &&
        (target as Element).getAttribute('class')?.includes('datepicker')
      ) {
        return;
      }
      if (opened) {
        toggleOpened();
      }
    },
    [opened, toggleOpened]
  );

  useWindowListener('keydown', onKeyDown, true);
  useWindowListener('click', onGlobalClick, true);

  const onClick = useCallback(
    (event: RMouseEvent) => {
      if (event.currentTarget.getAttribute('class')?.includes('datepicker')) {
        event.stopPropagation();
        return;
      }
      toggleOpened();
    },
    [toggleOpened]
  );

  const EditorComponent = useMemo(() => {
    if (type?.kind === 'dropdown') {
      return DropdownEditor;
    }
    return (type && editorComponents()[type.kind]) || DateEditor;
  }, [type]);

  return (
    <div
      ref={wrapperRef}
      onClick={onClick}
      css={[cellEditorStyles, width && { width }]}
      className="mycelleditorwrapper"
    >
      <EditorComponent
        open={opened}
        focused={focused}
        isEditable={isEditable}
        type={type}
        value={value}
        unit={unit}
        onChangeValue={onChangeValue}
        parentType={parentType}
        dropdownOptions={dropdownOptions}
        dropdownResult={dropdownResult}
        element={element}
      >
        {children}
      </EditorComponent>
    </div>
  );
};

const cellEditorStyles = css({ display: 'block' });
