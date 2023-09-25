/* eslint decipad/css-prop-named-variable: 0 */
import { ToastStatus, ToastType, useToastContext } from '@decipad/toast';
import { css, keyframes } from '@emotion/react';
import { Success, Warning } from '../../icons';
import {
  brand100,
  brand700,
  cssVar,
  grey200,
  grey600,
  p14Regular,
  red200,
  red700,
  yellow200,
  yellow700,
} from '../../primitives';
import { useLayoutEffect, useRef } from 'react';

import * as ToastPrimitive from '@radix-ui/react-toast';

const slideDown = keyframes`
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    transform: translate3d(0, 64px, 0);
  }
`;
const slideUp = keyframes`
  from {
    transform: translate3d(0, var(--y), 0);
  }
  to {
    transform: translate3d(0, -64px, 0);
  }
`;
const slideRight = keyframes`
  from {
    transform: translate3d(var(--radix-toast-swipe-end-x), var(--y), 0);
  }
  to {
    transform: translate3d(100%, var(--y), 0);
  }
`;
const slideLeft = keyframes`
  from {
    transform: translate3d(var(--radix-toast-swipe-end-x), var(--y), 0);
  }
  to {
    transform: translate3d(-100%, var(--y), 0);
  }
`;

const outerStyles = css({
  '--opacity': 0,
  '--x': 'var(--radix-toast-swipe-move-x, 0)',
  '--y': 'calc(6px * var(--index))',
  '--scale': 'calc(1 - 0.05 * var(--index))',
  position: 'absolute',
  top: '16px',
  right: '16px',
  left: '16px',
  minWidth: '100%',
  width: 'fit-content',
  transitionProperty: 'transform, opacity',
  transitionDuration: '150ms',
  transitionTimingFunction: 'ease-out',
  opacity: 'var(--opacity)',
  transform: 'translate3d(var(--x), var(--height), 0)',
  outline: 'none',

  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    width: '100%',
    height: '1000px',
    background: 'transparent',
  },

  '&[data-front="true"]': {
    transform: 'translate3d(var(--x), var(--y, 0), 0)',
  },
  '&[data-front="false"]': {
    transform: 'translate3d(var(--x), var(--y, 0), 0) scale(var(--scale))',
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 50ms ease-out`,
  },
  '&[data-hidden="false"]': {
    '--opacity': 1,
  },
  '&[data-hidden="true"]': {
    '--opacity': 0,
  },
  '&[data-hovering="true"]': {
    '--scale': 1,
    '--y': 'calc(var(--hover-offset-y) + 6px * var(--index))',
    transitionDuration: '100ms',
  },
  '&[data-swipe="move"]': {
    transitionDuration: '0ms',
  },
  '&[data-swipe="cancel"]': {
    '--x': 0,
  },
  '&[data-swipe-direction="right"][data-swipe="end"]': {
    animation: `${slideRight} 50ms ease-out`,
  },

  '&[data-swipe-direction="up"][data-swipe="end"]': {
    animation: `${slideUp} 50ms ease-out`,
  },

  '&[data-swipe-direction="bottom"][data-swipe="end"]': {
    animation: `${slideDown} 50ms ease-out`,
  },

  '&[data-swipe-direction="left"][data-swipe="end"]': {
    animation: `${slideLeft} 50ms ease-out`,
  },

  '&[data-hovering="true"] .inner': {
    height: 'var(--height)',
  },
});

const innerStyles = css({
  ...p14Regular,
  borderRadius: '8px',
  padding: '6px 12px',
  height: 'var(--height)',
  display: 'grid',
  gridTemplateColumns: '16px auto',
  columnGap: '6px',
  alignItems: 'center',
  position: 'relative',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, 0.06)',
  boxShadow: '0px 2px 16px -4px rgba(0, 0, 0, 0.06)',

  '&:not([data-front="true"])': {
    height: 'var(--front-height)',
  },
});

const contentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2px',
});

const titleStyles = css({
  margin: 0,
});

const iconStyles = css({
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > span': {
    width: '16px',
    height: '16px',
    display: 'grid',
  },
});

const getAppearanceType = (status: ToastStatus) => {
  const type = {
    error: errorStyle,
    info: infoStyle,
    success: successStyle,
    warning: warningStyle,
    'soft-warning': infoStyle,
  };

  return type[status];
};

const errorStyle = css(innerStyles, {
  backgroundColor: cssVar('stateDangerBackground'),
  color: cssVar('stateDangerText'),
});

const infoStyle = css(innerStyles, {
  backgroundColor: cssVar('stateNeutralBackground'),
  color: cssVar('stateNeutralText'),
});

const successStyle = css(innerStyles, {
  backgroundColor: cssVar('stateOkBackground'),
  color: cssVar('stateOkText'),
});

const warningStyle = css(innerStyles, {
  backgroundColor: cssVar('stateWarningBackground'),
  color: cssVar('stateWarningText'),
});

type ToastItemProps = {
  id: string;
  toast: ToastType;
  onOpenChange: (open: boolean) => void;
};

export const ToastItem: React.FC<ToastItemProps> = ({
  onOpenChange,
  toast,
  id,
}) => {
  const ref = useRef<HTMLLIElement>(null);

  const context = useToastContext();

  const { sortToasts, toastElementsMapRef } = context;

  const { content, status, options } = toast;

  const { duration, autoDismiss } = options;

  const toastElementsMap = toastElementsMapRef.current;

  useLayoutEffect(() => {
    if (ref.current) {
      toastElementsMap.set(id, ref.current);
      sortToasts();
    }
  }, [id, sortToasts, toastElementsMap]);

  return (
    <ToastPrimitive.Root
      ref={ref}
      duration={autoDismiss ? duration : 1000 * 60 * 60}
      css={outerStyles}
      onOpenChange={onOpenChange}
    >
      <div css={getAppearanceType(status)} data-status={status}>
        <ToastIcon status={status} />
        <div css={contentStyles}>
          <ToastPrimitive.Title css={titleStyles}>
            {content}
          </ToastPrimitive.Title>
        </div>
      </div>
    </ToastPrimitive.Root>
  );
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

const getIconType = (status: ToastStatus) => {
  return type[status];
};

type ToastIconProps = {
  status: ToastStatus;
};

const ToastIcon = ({ status }: ToastIconProps) => {
  return (
    <div aria-hidden css={iconStyles}>
      {getIconType(status)}
    </div>
  );
};
