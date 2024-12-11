/* eslint decipad/css-prop-named-variable: 0 */
import { FC, InputHTMLAttributes, ReactNode } from 'react';
import { css } from '@emotion/react';
import { cssVar, p13Medium } from '../../../primitives';

const wrapperStyles = (hasIconLeft: boolean, hasIconRight: boolean) =>
  css({
    paddingLeft: hasIconLeft ? '6px' : undefined,
    paddingRight: hasIconRight ? '6px' : undefined,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: cssVar('backgroundDefault'),
    borderRadius: '6px',
  });

const iconStyles = css({ width: '16px', height: '16px' });

const inputStyles = css(p13Medium, {
  padding: '6px',
  width: '100%',
  height: '32px',
  backgroundColor: 'transparent',
});

export interface DropdownInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  readonly iconLeft?: ReactNode;
  readonly iconRight?: ReactNode;
}

export const DropdownInput: FC<DropdownInputProps> = ({
  iconLeft,
  iconRight,
  ...inputProps
}) => {
  return (
    <div css={wrapperStyles(!!iconLeft, !!iconRight)}>
      {iconLeft && <div css={iconStyles}>{iconLeft}</div>}
      <input type="text" css={inputStyles} {...inputProps} />
      {iconRight && <div css={iconStyles}>{iconRight}</div>}
    </div>
  );
};
