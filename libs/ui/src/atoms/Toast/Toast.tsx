import { css } from '@emotion/react';
import { AppearanceTypes } from 'react-toast-notifications';
import { Success, Warning } from '../../icons';
import { black, cssVar, p14Regular, transparency } from '../../primitives';

type ToastProps = {
  readonly appearance: AppearanceTypes;
};

const getAppearanceType = (appearance: AppearanceTypes) => {
  const type = {
    error: errorStyle,
    info: infoStyle,
    success: successStyle,
    warning: warningStyle,
  };

  return type[appearance] || type.info;
};

const getIconType = (appearance: AppearanceTypes) => {
  const type = {
    error: <Warning />,
    info: <Success />,
    success: <Success />,
    warning: <Warning />,
  };

  return type[appearance] || type.info;
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
  backgroundColor: cssVar('normalDangerColor'),
  color: cssVar('backgroundColor'),
});

const infoStyle = css(baseStyles, {
  backgroundColor: cssVar('strongTextColor'),
  color: cssVar('backgroundColor'),
});

const successStyle = css(baseStyles, {
  backgroundColor: cssVar('normalBrandColor'),
  color: cssVar('strongTextColor'),
});

const warningStyle = css(baseStyles, {
  backgroundColor: cssVar('normalWarningColor'),
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
