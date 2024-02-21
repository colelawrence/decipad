/* eslint decipad/css-prop-named-variable: 0 */

import { MessageStatus, SingleEvent } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import { Caret, Check, Spinner, Warning } from '../../../icons';
import { cssVar, p12Bold, p13Medium, p13Regular } from '../../../primitives';

const wrapperStyles = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  margin: '4px 0px',
  marginLeft: 32,
  gap: '2px',
  padding: 4,
});

// Used to control border skew on transition
const wrapperBorderStyles = css({
  position: 'absolute',
  backgroundColor: cssVar('backgroundDefault'),
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
});

const headerStyles = css({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: 8,
  backgroundColor: cssVar('backgroundDefault'),
  padding: 4,
  gap: 4,
  zIndex: 2,
});

const titleStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const titleIconStyles = css({
  width: 20,
  height: 20,
  flexShrink: 0,
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 14,
    height: 14,

    path: {
      stroke: cssVar('textSubdued'),
    },
  },
});

const titleLabelStyles = css(p13Medium, {
  color: cssVar('textSubdued'),
  margin: 0,
  padding: 0,
});

const collapseButtonStyles = css(p12Bold, {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: 20,
  padding: '2px 2px 0px 6px',
  borderRadius: 6,
  color: cssVar('textSubdued'),
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
  },
});

const collapseButtonIconStyles = css({
  width: 16,
  height: 16,
  flexShrink: 0,
  marginBottom: 2,

  svg: {
    width: 16,
    height: 16,

    path: {
      fill: cssVar('textSubdued'),
    },
  },
});

const eventListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '4px 0px',
  margin: 0,
  listStyle: 'none',
  zIndex: 1,
});

const eventItemStyles = css({
  display: 'flex',
  alignItems: 'center',
  height: 20,
});

const eventIconStyles = css({
  width: 32,
  height: 32,
  flexShrink: 0,

  svg: {
    width: 32,
    height: 32,
    transform: 'translate(-2px, -12px)',

    path: {
      stroke: cssVar('textDisabled'),
    },
  },
});

const eventContentStyles = css(p13Regular, {
  lineHeight: '20px',
  color: cssVar('textSubdued'),
  margin: '0px -4px',
  padding: '1px 4px',
  borderRadius: 4,
  flex: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  '&:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textDefault'),
    cursor: 'pointer',
  },
});

const listMotionVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.0125,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.05,
    },
  },
};

const itemMotionVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
    },
  },
  hidden: { opacity: 0, transition: { duration: 0.05 } },
};

const nestIconMotionVariants = {
  visible: {
    strokeDasharray: '64, 0',
    transition: { duration: 2 },
  },
  hidden: { strokeDasharray: '0, 64', transition: { duration: 0.05 } },
};

type Props = {
  readonly status: MessageStatus;
  readonly events: SingleEvent[];
};

const getEventMeta = (status: MessageStatus) => {
  switch (status) {
    case 'success':
      return {
        label: 'Finished',
        icon: <Check />,
      };
    case 'pending':
      return {
        label: 'Hold on, working on it...',
        icon: <Spinner />,
      };
    case 'error':
      return {
        label: 'Something went wrong',
        icon: <Warning />,
      };
    default:
      return {
        label: 'Something went wrong',
        icon: <Warning />,
      };
  }
};

export const ChatEventGroupMessage: React.FC<Props> = ({ status, events }) => {
  const [collapsed, setCollapsed] = useState(true);

  useLayoutEffect(() => {
    setTimeout(() => {
      setCollapsed(!(status === 'pending'));
    }, 1000);
  }, [status]);

  return (
    <motion.div css={wrapperStyles} layout>
      <motion.div
        css={wrapperBorderStyles}
        layout
        transition={
          collapsed
            ? {
                delay: 0.15,
                duration: 0.09,
              }
            : {
                duration: 0.15,
              }
        }
        style={{
          borderRadius: 12,
        }}
      />
      <motion.div css={headerStyles} layout>
        <div css={titleStyles}>
          <div css={titleIconStyles}>{getEventMeta(status).icon}</div>

          <p css={titleLabelStyles}>{getEventMeta(status).label}</p>
        </div>
        {events.length > 0 && (
          <button
            css={collapseButtonStyles}
            onClick={() => setCollapsed(!collapsed)}
          >
            <span>{collapsed ? 'Open' : 'Collapse'}</span>
            <span css={collapseButtonIconStyles}>
              <Caret variant={collapsed ? 'down' : 'up'} />
            </span>
          </button>
        )}
      </motion.div>
      {events.length > 0 && (
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.ul
              layout="position"
              css={eventListStyles}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={listMotionVariants}
            >
              {events.map((event) => (
                <motion.li
                  css={eventItemStyles}
                  key={event.id}
                  variants={itemMotionVariants}
                >
                  <div css={eventIconStyles}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <motion.path
                        d="M8 0V12C8 13.1046 8.89543 14 10 14H13"
                        strokeWidth="0.5"
                        variants={nestIconMotionVariants}
                      />
                    </svg>
                  </div>
                  <p css={eventContentStyles}>
                    {event.uiContent ?? event.content}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
