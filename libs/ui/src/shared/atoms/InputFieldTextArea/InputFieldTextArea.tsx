/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { Interpolation, Theme } from '@emotion/react';
import { sanitizeInput } from 'libs/ui/src/utils';
import { FC, FocusEvent, ReactNode, useEffect, useId, useRef } from 'react';
import { cssVar, p13Medium, p14Regular } from '../../../primitives';
import { inputLabel, errorStyles } from '../../../primitives/text';
import styled from '@emotion/styled';

export type InputFieldTextAreaProps = {
  readonly id?: string;
  readonly required?: boolean;
  readonly autoFocus?: boolean;
  readonly autocomplete?: 'off' | 'on';
  readonly disabled?: boolean;
  readonly size?: 'small' | 'regular' | 'full';
  readonly inputCss?: Interpolation<Theme>;

  readonly testId?: string;
  readonly label?: ReactNode;
  readonly placeholder?: string;
  readonly name?: string;
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

export const InputFieldTextArea = ({
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
  title,

  value,
  error,
  submitButton = null,
  tabIndex,
  onChange = noop,
  onEnter = noop,
  onFocus = noop,
  onBlur = noop,
}: InputFieldTextAreaProps): ReturnType<FC> => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (unsanitized: string) => {
    const sanitizedValue = sanitizeInput({
      input: unsanitized,
      isURL: false,
    });
    onChange(sanitizedValue);
  };

  useEffect(() => {
    if (autoFocus && textAreaRef.current) {
      setTimeout(() => {
        textAreaRef?.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const defaultId = `textarea-${useId()}`;
  const id = idProp ?? defaultId;

  const labelEl = label && (
    <StyledTextAreaLabel htmlFor={id}>{label}</StyledTextAreaLabel>
  );

  const errorEl = error ? <span css={errorStyles}>{error}</span> : null;

  const inputEl = (
    <StyledTextArea
      id={id}
      ref={textAreaRef}
      data-testid={testId}
      autoFocus={autoFocus}
      disabled={disabled}
      aria-disabled={disabled}
      autoComplete={autocomplete}
      css={inputCss}
      required={required}
      placeholder={placeholder}
      name={name}
      value={value}
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
      data-size={size}
    />
  );

  return (
    <StyledTextAreaContainer
      className="input-field-container"
      data-has-button={!!submitButton}
    >
      {labelEl}
      {errorEl}
      {inputEl}
      {submitButton}
    </StyledTextAreaContainer>
  );
};

const StyledTextAreaLabel = styled.label({
  ...inputLabel,
  gridArea: 'label',
});

/**
 * Including 'button' in the template areas when no button is used causes an
 * unwanted padding to the right of the input. If no button is present, we
 * replace its area with 'input'.
 */
const StyledTextAreaContainer = styled.div({
  display: 'grid',
  gap: '0px 8px',
  gridTemplateColumns: 'auto 1fr auto',
  gridTemplateRows: 'auto auto',
  gridTemplateAreas: `
    "label error error"
    "input input input"
  `,
  button: {
    gridArea: 'button',
  },

  '& > *:only-child': {
    gridArea: '1 / 1 / 3 / 4',
  },

  '&[data-has-button="true"]': {
    gridTemplateAreas: `
      "label error error"
      "input input button"
    `,
  },
});

const StyledTextArea = styled.textarea({
  ...p14Regular,
  color: cssVar('textDefault'),
  padding: '12px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  backgroundColor: cssVar('backgroundMain'),
  gridArea: 'input',

  '::placeholder': {
    color: cssVar('textDisabled'),
  },

  '&[aria-disabled="true"]': {
    backgroundColor: cssVar('backgroundSubdued'),
    cursor: 'not-allowed',
  },

  '&[data-size="small"]': {
    ...p13Medium,
    minHeight: '80px',
    padding: '10px 12px',
    backgroundColor: cssVar('backgroundMain'),
  },

  '&[data-size="full"]': {
    width: '100%',
  },
});
