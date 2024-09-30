/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { Interpolation, Theme, css } from '@emotion/react';
import { sanitizeInput } from 'libs/ui/src/utils';
import { FC, FocusEvent, ReactNode, useEffect, useId, useRef } from 'react';
import { cssVar, p13Medium, p14Regular } from '../../../primitives';
import { inputLabel } from '../../../primitives/text';

/**
 * Including 'button' in the template areas when no button is used causes an
 * unwanted padding to the right of the input. If no button is present, we
 * replace its area with 'input'.
 */
const containerStyles = (hasButton: boolean) =>
  css({
    display: 'grid',
    gap: '0px 8px',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: `
    "label error error"
    "input input ${hasButton ? 'button' : 'input'}"
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
  | 'url'
  | 'search'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'date';
export type InputFieldProps = {
  readonly type?: FieldType;
  readonly id?: string;
  readonly required?: boolean;
  readonly autoFocus?: boolean;
  readonly autocomplete?: 'off' | 'on';
  readonly disabled?: boolean;
  readonly size?: 'small' | 'regular' | 'full';
  readonly inputCss?: Interpolation<Theme>;

  readonly testId?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly name?: string;
  readonly pattern?: string;
  readonly title?: string;

  readonly value?: string;
  readonly error?: string;
  readonly submitButton?: ReactNode;
  readonly tabIndex?: number;
  readonly onChange?: (newValue: string) => void;
  readonly onEnter?: () => void;
  readonly onFocus?: (event: FocusEvent) => void;
  readonly onBlur?: (event: FocusEvent) => void;
};

export const InputField = ({
  type = 'text',
  id: idProp,
  required = false,
  autoFocus = false,
  disabled = false,
  autocomplete = 'on',
  size,
  inputCss,

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
  onFocus = noop,
  onBlur = noop,
}: InputFieldProps): ReturnType<FC> => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (unsanitized: string) => {
    const sanitizedValue = sanitizeInput({
      input: unsanitized,
      isURL: type === 'url',
    });
    onChange(sanitizedValue);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const defaultId = `input-${useId()}`;
  const id = idProp ?? defaultId;

  const labelEl = label && (
    <label htmlFor={id} css={labelStyles}>
      {label}
    </label>
  );

  const errorEl = error ? <span css={errorStyles}>{error}</span> : null;

  const inputEl = (
    <input
      id={id}
      ref={inputRef}
      data-testid={testId}
      autoFocus={autoFocus}
      disabled={disabled}
      autoComplete={autocomplete}
      css={[
        {
          color: cssVar('textDefault'),
          '::placeholder': {
            color: cssVar('textDisabled'),
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
        inputCss,
      ]}
      type={type}
      required={required}
      placeholder={placeholder}
      name={name}
      value={value}
      pattern={pattern}
      title={title}
      tabIndex={tabIndex}
      onChange={(event) => handleInputChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onEnter();
        }
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );

  return (
    <div
      className="input-field-container"
      css={containerStyles(!!submitButton)}
    >
      {labelEl}
      {errorEl}
      {inputEl}
      {submitButton}
    </div>
  );
};
