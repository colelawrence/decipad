/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useCallback, useId, useRef, useState } from 'react';
import { DatePickerWrapper } from '../DatePickerWrapper/DatePickerWrapper';
import { DropdownFieldLabel, DropdownFieldTrigger } from 'libs/ui/src/modules';
import { noop } from '@decipad/utils';
import { useWindowListener } from '@decipad/react-utils';

export type InputFieldDateProps = {
  readonly id?: string;
  readonly disabled?: boolean;

  readonly label?: ReactNode;
  readonly value?: string;
  readonly size?: 'small' | 'medium';
  readonly placeholder?: string;
  readonly onChange: (value: string) => void;
};

export const InputFieldDate = ({
  id: idProp,
  label,
  value,
  onChange,
  disabled,
  size = 'medium',
  placeholder = 'Select date...',
}: InputFieldDateProps): ReturnType<FC> => {
  const [open, setOpen] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const defaultId = `input-${useId()}`;
  const id = idProp ?? defaultId;

  const handleChange = (newDate: string) => {
    onChange(newDate);
    setOpen(false);
  };

  const onWindowKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      switch (true) {
        case event.key === 'Escape':
          setOpen(false);
          break;
      }
    },
    [open, setOpen]
  );

  const onWindowClick = useCallback((event: Event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useWindowListener('keydown', onWindowKeyDown);
  useWindowListener('click', onWindowClick);

  return (
    <div id={id}>
      {label && <DropdownFieldLabel id={id}>{label}</DropdownFieldLabel>}
      <DatePickerWrapper
        granularity="day"
        value={value || ''}
        open={open}
        onChange={handleChange}
        customInput={
          <>
            <div
              onClick={() => (disabled ? noop : setOpen(!open))}
              ref={datePickerRef}
            >
              <DropdownFieldTrigger
                id={id}
                disabled={disabled}
                children={value || placeholder}
                size={size}
              />
            </div>
          </>
        }
      />
    </div>
  );
};
