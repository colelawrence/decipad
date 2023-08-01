/* eslint decipad/css-prop-named-variable: 0 */
import { ToastType } from '@decipad/toast';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
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
  toastTransitionDelay,
  yellow200,
  yellow700,
} from '../../primitives';

type ToastProps = {
  readonly appearance: ToastType;
  readonly autoDismiss?: boolean | number;
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
  };

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
  maxWidth: '350px',
  gap: '6px',
});

const collapsedBaseStyles = css(baseStyles, {
  gap: '0px',
  borderRadius: '999px',
  padding: '6px',
  lineHeight: p14Regular.lineHeight,
  height: '28px',
  width: '28px',

  '& > p': {
    maxWidth: '0px',
    maxHeight: '0px',
    overflow: 'hidden',
  },

  '&:hover': {
    borderRadius: '8px',
    padding: '6px 12px',
    gap: '6px',
    width: 'unset',
    height: 'unset',
    '& > p': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
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
  children,
  autoDismiss = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!autoDismiss) {
        setCollapsed(true);
      }
    }, toastTransitionDelay);

    return () => {
      clearTimeout(t);
    };
  }, [autoDismiss]);

  return (
    <div
      css={[getAppearanceType(appearance), collapsed && collapsedBaseStyles]}
    >
      <span css={iconStyles}>{getIconType(appearance)}</span>
      <div>{children}</div>
    </div>
  );
};
