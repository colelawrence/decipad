import { css } from '@emotion/react';
import {
  black,
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
  readonly primary: true; // not all variants implemented yet
  readonly extraSlim?: boolean;

  readonly submit?: boolean;

  readonly disabled?: boolean;

  readonly children: TextChildren;
  readonly onClick?: () => void;
};

export const Button = ({
  primary,
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
