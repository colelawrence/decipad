import { noop } from '@decipad/utils';
import { SerializedStyles, css } from '@emotion/react';
import { nanoid } from 'nanoid';
import { FC, useEffect, useRef, useState } from 'react';
import { cssVar, p13Medium } from '../../../primitives';
import { inputLabel } from '../../../primitives/text';

const textAreaInputStyles = css(p13Medium, {
  padding: '12px',
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  '::placeholder': {
    color: cssVar('textDisabled'),
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
  readonly disabled?: boolean;
  readonly styles?: SerializedStyles;
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
  disabled = false,
  onChange = noop,
  onKeyUp = noop,
  onKeyDown = noop,
  styles,
}: TextareaFieldProps): ReturnType<FC> => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef?.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const containerStyles = css([
    css({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }),
    styles,
  ]);

  const id = `input-${useState(nanoid)[0]}`;
  const labelEl = label ? (
    <label htmlFor={id} css={inputLabel}>
      {label}
    </label>
  ) : null;

  const inputEl = (
    <textarea
      css={textAreaInputStyles}
      ref={textareaRef}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      required={required}
      rows={height}
      value={value}
      name={name}
      disabled={disabled}
    />
  );

  return (
    <div css={containerStyles}>
      {labelEl}
      {inputEl}
    </div>
  );
};
