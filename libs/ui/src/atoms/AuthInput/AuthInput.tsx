import { css } from '@emotion/react';
import { ClassAttributes, FC, InputHTMLAttributes } from 'react';
import {
  cssVar,
  grey250,
  grey300,
  p14Regular,
  setCssVar,
} from '../../primitives';

const inputStyles = css({
  ...p14Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  border: '1px solid',
  borderColor: grey250.rgb,
  minWidth: '374px',
  padding: '12px',
  borderRadius: '6px',
  '&::placeholder': {
    color: grey300.rgb,
  },
});

export type AuthInputProps = ClassAttributes<HTMLInputElement> &
  InputHTMLAttributes<HTMLInputElement>;

export const AuthInput = (props: AuthInputProps): ReturnType<FC> => {
  return <input css={inputStyles} {...props} />;
};
