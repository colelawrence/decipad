/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { nanoid } from 'nanoid';
import { FC, ReactNode, useState } from 'react';
import { cssVar, p13Medium, p14Regular, setCssVar } from '../../primitives';
import { inputLabel } from '../../primitives/text';

const containerStyles = css({
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'auto 1fr auto',
  gridTemplateRows: 'auto auto',
  gridTemplateAreas: `
    "label error error"
    "input input button"
  `,
  button: {
    gridArea: 'button',
  },
  '& > *:only-child': {
    gridArea: '1 / 1 / 3 / 4',
  },
});

const inputStyles = css({
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),
  gridArea: 'input',

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

const labelStyles = css([{ gridArea: 'label' }, inputLabel]);
const errorStyles = css([
  inputLabel,
  { gridArea: 'error', color: cssVar('errorColor') },
]);

const disabledStyles = css({
  backgroundColor: cssVar('tintedBackgroundColor'),
  cursor: 'not-allowed',
});

const fullWidth = css({
  width: '100%',
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
  readonly size?: 'small' | 'regular' | 'full';

  readonly testId?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly name?: string;
  readonly pattern?: string;
  readonly title?: string;

  readonly value: string;
  readonly error?: string;
  readonly submitButton?: ReactNode;
  readonly tabIndex?: number;
  readonly onChange?: (newValue: string) => void;
  readonly onEnter?: () => void;
};

export const InputField = ({
  type = 'text',
  required = false,
  autoFocus = false,
  disabled = false,
  size,

  testId,
  label,
  placeholder,
  name,
  pattern,
  title,

  value,
  error,
  submitButton = null,
  tabIndex,
  onChange = noop,
  onEnter = noop,
}: InputFieldProps): ReturnType<FC> => {
  const id = `input-${useState(nanoid)[0]}`;
  const labelEl = label ? (
    <label htmlFor={id} css={labelStyles}>
      {label}
    </label>
  ) : null;

  const errorEl = error ? <span css={errorStyles}>{error}</span> : null;

  const inputEl = (
    <input
      id={id}
      data-testid={testId}
      autoFocus={autoFocus}
      disabled={disabled}
      css={[
        size === 'small' ? inputStylesSmall : inputStyles,
        size === 'full' && fullWidth,
        type !== 'search'
          ? {
              border: `1px solid ${cssVar('borderColor')}`,
              borderRadius: '6px',
            }
          : { width: '100%', padding: 0 },
        disabled && disabledStyles,
      ]}
      type={type}
      required={required}
      placeholder={placeholder}
      name={name}
      value={value}
      pattern={pattern}
      title={title}
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
    <div className="input-field-container" css={containerStyles}>
      {labelEl}
      {errorEl}
      {inputEl}
      {submitButton}
    </div>
  );
};
