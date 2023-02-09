import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p14Regular, setCssVar } from '../../primitives';

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),

  ...p14Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  '&::placeholder': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  },
});

type FieldType =
  | 'text'
  | 'search'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'date';
export type InputFieldProps = {
  readonly type?: FieldType;
  readonly required?: boolean;
  readonly autoFocus?: boolean;
  readonly disabled?: boolean;

  readonly placeholder?: string;

  readonly value: string;
  readonly onChange?: (newValue: string) => void;
  readonly onEnter?: () => void;
};

export const InputField = ({
  type = 'text',
  required = false,
  autoFocus = false,
  disabled = false,

  placeholder,

  value,
  onChange = noop,
  onEnter = noop,
}: InputFieldProps): ReturnType<FC> => {
  return (
    <input
      autoFocus={autoFocus}
      disabled={disabled}
      css={[
        inputStyles,
        type !== 'search'
          ? {
              border: `1px solid ${cssVar('borderColor')}`,
              borderRadius: '6px',
            }
          : { width: '100%', padding: 0 },
      ]}
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onEnter();
        }
      }}
    />
  );
};
