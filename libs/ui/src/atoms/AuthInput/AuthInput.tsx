import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, grey250, p14Regular, setCssVar } from '../../primitives';
import { noop } from '../../utils';

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),

  border: `1px solid ${grey250.rgb}`,
  borderRadius: '6px',

  ...p14Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  '&::placeholder': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  },
});

export type AuthInputProps = {
  readonly placeholder: string;
  readonly type?: string;
  readonly required?: boolean;

  readonly value: string;
  readonly onChange?: (newValue: string) => void;
};

export const AuthInput = ({
  placeholder,
  type = 'text',
  required = false,

  value,
  onChange = noop,
}: AuthInputProps): ReturnType<FC> => {
  return (
    <input
      css={inputStyles}
      placeholder={placeholder}
      value={value}
      type={type}
      required={required}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};
