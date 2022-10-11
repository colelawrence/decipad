import { FC } from 'react';
import { css } from '@emotion/react';
import { CheckboxSelected, CheckboxUnselected } from '../../icons';

const wrapper = css({
  width: 16,
  height: 16,
});

export interface CheckboxProps {
  readonly checked: boolean;
  readonly size?: number;
}

export const Checkbox: FC<CheckboxProps> = ({ checked, size }) => {
  return (
    <div
      data-testid="checkbox"
      css={size ? { width: size, height: size } : wrapper}
    >
      {checked ? <CheckboxSelected /> : <CheckboxUnselected />}
    </div>
  );
};
