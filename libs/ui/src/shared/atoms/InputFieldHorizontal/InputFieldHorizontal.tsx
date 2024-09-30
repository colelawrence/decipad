/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode, useId } from 'react';
import { inputLabel } from '../../../primitives/text';
import { InputField, InputFieldProps } from '../InputField/InputField';
import { componentCssVars } from 'libs/ui/src/primitives';
import { Tooltip } from '../Tooltip/Tooltip';

const containerStyles = css({
  display: 'grid',
  gridTemplateColumns: 'max-content auto',
  gap: '8px 16px',
});

const labelStyles = css([
  inputLabel,
  {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 0,
  },
]);

const errorInputStyles = css({
  borderColor: componentCssVars('InputFieldDangerBorder'),
});

export const InputFieldHorizontalGroup = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div css={containerStyles}>{children}</div>;
};

export type InputFieldHorizontalProps = Omit<
  InputFieldProps,
  'size' | 'submitButton'
> & {
  readonly label: string;
};

export const InputFieldHorizontal = ({
  id: idProp,
  label,
  error,
  ...props
}: InputFieldHorizontalProps): ReturnType<FC> => {
  const defaultId = `input-${useId()}`;
  const id = idProp ?? defaultId;

  const labelEl = (
    <label htmlFor={id} css={labelStyles}>
      {label}
    </label>
  );

  // Needs a <div> to mount the tooltip onto
  const inputEl = (
    <div>
      <InputField
        id={id}
        size="small"
        inputCss={[error && errorInputStyles]}
        {...props}
      />
    </div>
  );

  return (
    <>
      {labelEl}
      <Tooltip open={error ? undefined : false} trigger={inputEl}>
        <p>{error}</p>
      </Tooltip>
    </>
  );
};
