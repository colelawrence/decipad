/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  inputLabel,
  p13Medium,
  p14Regular,
} from 'libs/ui/src/primitives';
import { FC, HTMLProps, useId } from 'react';

export interface InputProps extends HTMLProps<HTMLInputElement> {
  variant?: 'small' | 'regular';
  label?: string;
  onChangeValue?: (value: string) => void;
}

const commonStyles = css(p14Regular, {
  padding: '12px',
  backgroundColor: cssVar('backgroundMain'),

  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  transition: 'border-color 0.1s ease-in-out',

  color: cssVar('textDefault'),
  '::placeholder': {
    color: cssVar('textDisabled'),
  },

  '&:invalid': {
    borderColor: componentCssVars('InputFieldDangerBorder'),
  },

  '&:disabled': {
    backgroundColor: cssVar('backgroundSubdued'),
    cursor: 'not-allowed',
  },
});
const variantStyles: {
  [V in NonNullable<InputProps['variant']>]: SerializedStyles;
} = {
  small: css(commonStyles, p13Medium, {
    height: '32px',
    padding: '10px 12px',
  }),
  regular: css(commonStyles),
};

export const labelStyle = css(inputLabel, { marginBottom: 0 });

export const Input: FC<InputProps> = (props) => {
  const { variant = 'regular', label, onChange, onChangeValue } = props;
  const defaultId = `input-${useId()}`;
  const id = props.id ?? defaultId;
  return (
    <>
      {label && (
        <label htmlFor={id} css={labelStyle}>
          {label}
        </label>
      )}
      <input
        css={variantStyles[variant]}
        {...props}
        onChange={(e) => {
          onChange && onChange(e);
          onChangeValue && onChangeValue(e.currentTarget.value);
        }}
        id={id}
      />
    </>
  );
};
