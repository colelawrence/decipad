import { CellValueType } from '@decipad/editor-types';
import { useWindowListener } from '@decipad/react-utils';
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BooleanEditor } from './BooleanEditor';
import { DateEditor } from './DateEditor';

interface SpecificEditorProps {
  open: boolean;
  children: ReactNode;
  type?: CellValueType;
  value?: string;
  unit?: string;
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
}

const editorComponents: Record<string, FC<SpecificEditorProps>> = {
  boolean: BooleanEditor,
  date: DateEditor,
};

interface CellEditorProps {
  focused?: boolean;
  children: ReactNode;
  type?: CellValueType;
  unit?: string;
  value?: string;
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
}

export const CellEditor: FC<CellEditorProps> = ({
  focused = false,
  value,
  type,
  unit,
  onChangeValue: _onChangeValue,
  children,
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
    (event: React.MouseEvent) => {
      if (event.currentTarget.getAttribute('class')?.includes('datepicker')) {
        event.stopPropagation();
        return;
      }
      toggleOpened();
    },
    [toggleOpened]
  );

  const EditorComponent = useMemo(
    () => (type && editorComponents[type.kind]) || DateEditor,
    [type]
  );

  return (
    <div ref={wrapperRef} onClick={onClick} className="mycelleditorwrapper">
      <EditorComponent
        open={opened}
        type={type}
        value={value}
        unit={unit}
        onChangeValue={onChangeValue}
      >
        {children}
      </EditorComponent>
    </div>
  );
};
