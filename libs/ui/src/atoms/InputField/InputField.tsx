import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { nanoid } from 'nanoid';
import { cssVar, p14Regular, setCssVar, p13Medium } from '../../primitives';
import { inputLabel } from '../../primitives/text';

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),

  ...p14Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  '&::placeholder': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  },
});

const inputStylesSmall = css(inputStyles, {
  height: '32px',
  padding: '10px 12px',
  backgroundColor: cssVar('backgroundColor'),

  ...p13Medium,
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
  readonly small?: boolean;

  readonly label?: string;
  readonly placeholder?: string;
  readonly name?: string;

  readonly value: string;
  readonly tabIndex?: number;
  readonly onChange?: (newValue: string) => void;
  readonly onEnter?: () => void;
};

export const InputField = ({
  type = 'text',
  required = false,
  autoFocus = false,
  disabled = false,
  small,

  label,
  placeholder,
  name,

  value,
  tabIndex,
  onChange = noop,
  onEnter = noop,
}: InputFieldProps): ReturnType<FC> => {
  const id = `input-${useState(nanoid)[0]}`;
  const labelEl = label ? (
    <label htmlFor={id} css={inputLabel}>
      {label}
    </label>
  ) : null;

  const inputEl = (
    <input
      id={id}
      autoFocus={autoFocus}
      disabled={disabled}
      css={[
        small ? inputStylesSmall : inputStyles,
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
      name={name}
      value={value}
      tabIndex={tabIndex}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onEnter();
        }
      }}
    />
  );

  return (
    <div css={containerStyles}>
      {labelEl}
      {inputEl}
    </div>
  );
};
