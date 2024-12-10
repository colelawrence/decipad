/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useId, useState } from 'react';
import { DatePickerWrapper } from '../DatePickerWrapper/DatePickerWrapper';
import { InputField } from '../InputField/InputField';
import { css } from '@emotion/react';
import { cssVar } from 'libs/ui/src/primitives';
import { CaretDown } from 'libs/ui/src/icons';

export type InputFieldDateProps = {
  readonly id?: string;
  readonly size?: 'small' | 'regular' | 'full';
  readonly label?: ReactNode;
  readonly value?: string;
  readonly onChange: (value: string) => void;
};

export const InputFieldDate = ({
  id: idProp,
  size,
  label,
  value,
  onChange,
}: InputFieldDateProps): ReturnType<FC> => {
  const [open, setOpen] = useState<boolean>(false);

  const defaultId = `input-${useId()}`;
  const id = idProp ?? defaultId;

  const handleChange = (newDate: string) => {
    onChange(newDate);
    setOpen(false);
  };

  const hoverStyles = css({
    '&:hover': {
      backgroundColor: cssVar('backgroundSubdued'),
      cursor: 'pointer',
    },
  });

  const caretWrapper = css({
    width: 12,
    height: 12,
    position: 'absolute',
    top: '50%',
    right: 12,
    transform: 'translateY(50%)',
  });

  const inputWrapper = css({
    position: 'relative',
  });

  return (
    <div id={id}>
      <DatePickerWrapper
        granularity="day"
        value={value || ''}
        open={open}
        onChange={handleChange}
        customInput={
          <>
            <div onClick={() => setOpen(true)} css={inputWrapper}>
              <InputField
                type="text"
                size={size}
                label={label}
                value={value}
                inputCss={hoverStyles}
              />
              <div css={caretWrapper}>
                <CaretDown />
              </div>
            </div>
          </>
        }
      />
    </div>
  );
};
