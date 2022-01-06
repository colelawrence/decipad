import { css } from '@emotion/react';
import { ChangeEventHandler, FC } from 'react';
import { cssVar, grey250, p14Regular, setCssVar } from '../../primitives';

const inputStyles = css({
  ...p14Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  border: '1px solid',
  borderColor: grey250.rgb,
  minWidth: '374px',
  padding: '12px',
  borderRadius: '6px',
  '&::placeholder': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  },
});

export type AuthInputProps = {
  readonly placeholder: string;
  readonly value: string;
  readonly onChange?: ChangeEventHandler<HTMLInputElement>;
};

export const AuthInput = ({
  placeholder,
  value,
  onChange,
}: AuthInputProps): ReturnType<FC> => {
  return (
    <input
      css={inputStyles}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
