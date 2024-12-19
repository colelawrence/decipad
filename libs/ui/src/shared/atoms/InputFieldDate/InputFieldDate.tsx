/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useId, useState } from 'react';
import { DatePickerWrapper } from '../DatePickerWrapper/DatePickerWrapper';
import { DropdownFieldLabel, DropdownFieldTrigger } from 'libs/ui/src/modules';
import { assert, noop } from '@decipad/utils';

export type InputFieldDateProps = {
  readonly id?: string;
  readonly disabled?: boolean;

  readonly label?: ReactNode;
  readonly value?: string;
  readonly onChange: (value: string) => void;
};

export const InputFieldDate = ({
  id: idProp,
  label,
  value,
  onChange,
  disabled,
}: InputFieldDateProps): ReturnType<FC> => {
  const [open, setOpen] = useState<boolean>(false);

  const defaultId = `input-${useId()}`;
  const id = idProp ?? defaultId;

  const handleChange = (newDate: string) => {
    onChange(newDate);
    setOpen(false);
  };

  assert(value !== undefined, 'Data must be defined');

  return (
    <div id={id}>
      <DropdownFieldLabel id={id}>{label}</DropdownFieldLabel>
      <DatePickerWrapper
        granularity="day"
        value={value}
        open={open}
        onChange={handleChange}
        customInput={
          <>
            <div onClick={() => (disabled ? noop : setOpen(true))}>
              <DropdownFieldTrigger
                id={id}
                disabled={disabled}
                children={value as string}
              />
            </div>
          </>
        }
      />
    </div>
  );
};
