/* eslint decipad/css-prop-named-variable: 0 */
import { ToastType } from '@decipad/toast';
import { css } from '@emotion/react';
import { Success, Warning } from '../../icons';
import {
  brand100,
  brand700,
  cssVar,
  grey200,
  grey600,
  mediumShadow,
  p14Regular,
  red200,
  red700,
  yellow200,
  yellow700,
} from '../../primitives';
import { ReactNode } from 'react';

type ToastProps = {
  readonly appearance: ToastType;
  readonly autoDismiss?: boolean | number;
  readonly icon?: ReactNode;
};

const getAppearanceType = (appearance: ToastType) => {
  const type = {
    error: errorStyle,
    info: infoStyle,
    success: successStyle,
    warning: warningStyle,
    'soft-warning': infoStyle,
  };

  return type[appearance];
};

const type = {
  error: (
    <span
      css={css({ '> svg > path': { stroke: red700.rgb, fill: red200.rgb } })}
    >
      <Warning />
    </span>
  ),
  info: (
    <span
      css={css({
        '> svg > path': { stroke: grey600.rgb, fill: grey200.rgb },
      })}
    >
      <Success />
    </span>
  ),
  success: (
    <span
      css={css({
        '> svg > path': { stroke: brand700.rgb, fill: brand100.rgb },
      })}
    >
      <Success />
    </span>
  ),
  warning: (
    <span
      css={css({
        '> svg > path': { stroke: yellow700.rgb, fill: yellow200.rgb },
      })}
    >
      <Warning />
    </span>
  ),
  'soft-warning': (
    <span
      css={css({
        '> svg > path': { stroke: grey600.rgb, fill: grey200.rgb },
      })}
    >
      <Warning />
    </span>
  ),
};

const getIconType = (appearance: ToastType) => {
  return type[appearance];
};

const baseStyles = css(p14Regular, {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',

  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,

  padding: '6px 12px',
  // HACK: So the toast is above the help button and undo component.
  marginRight: '8px',
  marginBottom: '64px',
  gap: '6px',
});

const errorStyle = css(baseStyles, {
  backgroundColor: cssVar('stateDangerBackground'),
  color: cssVar('stateDangerText'),
});

const infoStyle = css(baseStyles, {
  backgroundColor: cssVar('stateNeutralBackground'),
  color: cssVar('stateNeutralText'),
});

const successStyle = css(baseStyles, {
  backgroundColor: cssVar('stateOkBackground'),
  color: cssVar('stateOkText'),
});

const warningStyle = css(baseStyles, {
  backgroundColor: cssVar('stateWarningBackground'),
  color: cssVar('stateWarningText'),
});

const iconStyles = css({
  width: '16px',
  height: '16px',

  display: 'grid',
});

export const Toast: React.FC<React.PropsWithChildren<ToastProps>> = ({
  appearance,
  icon,
  children,
}) => {
  return (
    <div css={[getAppearanceType(appearance)]}>
      <span css={iconStyles}>{icon ?? getIconType(appearance)}</span>
      <div>{children}</div>
    </div>
  );
};
