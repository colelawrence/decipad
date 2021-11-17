import { css } from '@emotion/react';
import {
  black,
  cssVar,
  electricGreen200,
  p13SemiBold,
  shortAnimationDuration,
  transparency,
  white,
} from '../../primitives';
import { noop, TextChildren } from '../../utils';

const styles = css(p13SemiBold, {
  flexGrow: 1,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '8px 14px',
  borderRadius: '6px',

  backgroundColor: electricGreen200.rgb,
  color: black.rgb,
  boxShadow: `0 0 0 1px ${cssVar('backgroundColor')}`,

  transition: `box-shadow ${shortAnimationDuration} ease-out`,
  ':hover, :focus': {
    boxShadow: `0px 4px 8px ${transparency(black, 0.08).rgba}`,
  },
});

const primaryStyles = css({
  backgroundColor: black.rgb,
  color: white.rgb,
  boxShadow: `0 0 0 1px ${white.rgb}`,
});

const extraSlimStyles = css({
  padding: '6px 14px',
});

type ButtonProps = {
  readonly primary?: boolean;
  readonly extraSlim?: boolean;

  readonly submit?: boolean;

  readonly disabled?: boolean; // TODO styles

  readonly children: TextChildren;
  readonly onClick?: () => void;
};

export const Button = ({
  primary = false,
  extraSlim = false,
  submit = primary,
  disabled = false,

  children,
  onClick = noop,
}: ButtonProps): ReturnType<React.FC> => {
  return (
    <button
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
      css={[styles, primary && primaryStyles, extraSlim && extraSlimStyles]}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
};
