/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useId } from 'react';
import { cssVar, p13Medium, p14Regular } from '../../primitives';
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

const inputStyles = css(p14Regular, {
  padding: '12px',

  backgroundColor: cssVar('backgroundMain'),
  gridArea: 'input',

  '&::placeholder': {},
});

const inputStylesSmall = css(inputStyles, p13Medium, {
  height: '32px',
  padding: '10px 12px',
  backgroundColor: cssVar('backgroundMain'),
});

const labelStyles = css([{ gridArea: 'label' }, inputLabel]);
const errorStyles = css([
  inputLabel,
  { gridArea: 'error', color: cssVar('stateDangerBackground') },
]);

const disabledStyles = css({
  backgroundColor: cssVar('backgroundSubdued'),
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
  const id = `input-${useId()}`;
  const labelEl = label && (
    <label htmlFor={id} css={labelStyles}>
      {label}
    </label>
  );

  const errorEl = error ? <span css={errorStyles}>{error}</span> : null;

  const inputEl = (
    <input
      id={id}
      data-testid={testId}
      autoFocus={autoFocus}
      disabled={disabled}
      css={[
        {
          color: cssVar('textDefault'),
          '::placeholder': {
            color: cssVar('textSubdued'),
          },
        },
        size === 'small' ? inputStylesSmall : inputStyles,
        size === 'full' && fullWidth,
        type !== 'search'
          ? {
              border: `1px solid ${cssVar('borderSubdued')}`,
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
