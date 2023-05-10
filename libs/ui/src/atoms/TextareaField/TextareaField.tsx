import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { nanoid } from 'nanoid';
import { cssVar, p14Regular, setCssVar } from '../../primitives';
import { inputLabel } from '../../primitives/text';

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),

  border: `1px solid ${cssVar('borderColor')}`,
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
  readonly label?: string;
  readonly name?: string;
  readonly onKeyUp?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readonly onKeyDown?: (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  readonly onChange?: (newValue: string) => void;
};

export const TextareaField = ({
  autoFocus = false,
  height = 3,
  placeholder,
  required = false,
  value,
  label,
  name,
  onChange = noop,
  onKeyUp = noop,
  onKeyDown = noop,
}: TextareaFieldProps): ReturnType<FC> => {
  const id = `input-${useState(nanoid)[0]}`;
  const labelEl = label ? (
    <label htmlFor={id} css={inputLabel}>
      {label}
    </label>
  ) : null;

  const inputEl = (
    <textarea
      css={inputStyles}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      required={required}
      rows={height}
      value={value}
      name={name}
    />
  );

  return (
    <div css={containerStyles}>
      {labelEl}
      {inputEl}
    </div>
  );
};
