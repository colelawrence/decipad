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

export type TextareaFieldProps = {
  readonly autoFocus?: boolean;
  readonly height?: number;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly value: string;
  readonly onChange?: (newValue: string) => void;
};

export const TextareaField = ({
  autoFocus = false,
  height = 3,
  placeholder,
  required = false,
  value,
  onChange = noop,
}: TextareaFieldProps): ReturnType<FC> => {
  return (
    <textarea
      css={inputStyles}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      required={required}
      rows={height}
      value={value}
    />
  );
};
