import { css } from '@emotion/react';
import { FC } from 'react';
import { noop } from '@decipad/utils';
import { cssVar, p14Regular, setCssVar } from '../../primitives';

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '6px',

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

  readonly placeholder?: string;

  readonly value: string;
  readonly onChange?: (newValue: string) => void;
};

export const InputField = ({
  type = 'text',
  required = false,
  autoFocus = false,

  placeholder,

  value,
  onChange = noop,
}: InputFieldProps): ReturnType<FC> => {
  return (
    <input
      autoFocus={autoFocus}
      css={inputStyles}
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};
