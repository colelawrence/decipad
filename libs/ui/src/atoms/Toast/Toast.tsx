import { ToastType } from '@decipad/toast';
import { css } from '@emotion/react';
import { Success, Warning } from '../../icons';
import { black, cssVar, p14Regular, transparency } from '../../primitives';

type ToastProps = {
  readonly appearance: ToastType;
};

const getAppearanceType = (appearance: ToastType) => {
  const type = {
    error: errorStyle,
    info: infoStyle,
    success: successStyle,
    warning: warningStyle,
  };

  return type[appearance];
};

const getIconType = (appearance: ToastType) => {
  const type = {
    error: <Warning />,
    info: <Success />,
    success: <Success />,
    warning: <Warning />,
  };

  return type[appearance];
};

const baseStyles = css(p14Regular, {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',

  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${transparency(black, 0.08).rgba}`,

  padding: '6px 12px',
  marginBottom: '8px',
  maxWidth: '300px',
});

const errorStyle = css(baseStyles, {
  backgroundColor: cssVar('dangerColor'),
  color: cssVar('backgroundColor'),
});

const infoStyle = css(baseStyles, {
  backgroundColor: cssVar('strongTextColor'),
  color: cssVar('backgroundColor'),
});

const successStyle = css(baseStyles, {
  backgroundColor: cssVar('successColor'),
  color: cssVar('strongTextColor'),
});

const warningStyle = css(baseStyles, {
  backgroundColor: cssVar('warningColor'),
  color: cssVar('backgroundColor'),
});

const iconStyles = css({
  width: '16px',
  height: '16px',

  display: 'grid',
  marginRight: '6px',
});

export const Toast: React.FC<ToastProps> = ({ appearance, children }) => {
  return (
    <div css={getAppearanceType(appearance)}>
      <span css={iconStyles}>{getIconType(appearance)}</span>
      {children}
    </div>
  );
};
