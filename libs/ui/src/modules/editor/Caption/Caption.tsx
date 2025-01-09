/* eslint decipad/css-prop-named-variable: 0 */
import { generatedNames, noop } from '@decipad/utils';
import { css } from '@emotion/react';

import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { UserIconKey } from '@decipad/editor-types';
import {
  cssVar,
  display,
  hoverTransitionStyles,
  p13Medium,
  p13Regular,
  p14Regular,
  placeholderOpacity,
  smallScreenQuery,
} from '../../../primitives';
import { Tooltip } from '../../../shared';
import { AvailableSwatchColor } from '../../../utils';
import { Close, Sparkles } from '../../../icons';

export interface CaptionProps {
  readOnly?: boolean;
  color?: AvailableSwatchColor;
  icon?: UserIconKey;
  empty?: boolean;
  children: ReactNode;
  onGenerateName?: () => Promise<void>;
  onCancelGenerateName?: () => void;
}

const nameWrapperStyles = css(
  {
    display: 'flex',
    gap: '4px',
    height: 24,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    padding: '0 6px',
    borderRadius: '4px',
    backgroundColor: 'transparent',

    '&:has(> button)': {
      '&:hover': {
        backgroundColor: cssVar('backgroundHeavy'),
        button: {
          opacity: 1,
        },
      },
    },
  },
  hoverTransitionStyles('all')
);

const aiButtonWrapperStyles = css(
  p13Medium,
  {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    right: 0,
    flexShrink: 0,
    opacity: 0,
    gap: 4,
    borderRadius: '4px',
    padding: '4px 6px 4px 4px',

    '& > svg': {
      height: '16px',
      width: '16px',

      '& > path': {
        fill: cssVar('textSubdued'),
        stroke: cssVar('textSubdued'),
      },
    },

    '&:hover, &:focus': {
      '& > svg': {
        '& > path': {
          fill: cssVar('textDefault'),
          stroke: cssVar('textDefault'),
        },
      },
    },

    '&:active': {
      transform: 'scale(0.95)',
    },

    '&:disabled': {
      cursor: 'not-allowed',
      backgroundColor: cssVar('backgroundSubdued'),
      color: cssVar('textSubdued'),
      '& > svg': {
        height: '16px',
        width: '16px',

        '& > path': {
          fill: cssVar('textSubdued'),
          stroke: cssVar('textSubdued'),
        },
      },
    },

    [smallScreenQuery]: {
      height: '16px',
      width: '16px',
    },
  },
  hoverTransitionStyles('all')
);

const placeholderStyles = (isRenaming: boolean) =>
  css(
    p14Regular,

    {
      display: 'grid',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',

      '> span, ::before': {
        gridArea: '1 / 1',
      },

      '::before': {
        ...display,
        ...p14Regular,
        pointerEvents: 'none',
        content: 'attr(aria-placeholder)',
        opacity: placeholderOpacity,

        [smallScreenQuery]: p13Regular,
      },

      [smallScreenQuery]: p13Regular,
    },

    isRenaming && {
      '& > span': {
        opacity: 0,
      },
    }
  );

const DEFAULT_PLACEHOLDER = 'Name your input';

export const Caption: FC<CaptionProps> = ({
  empty = false,
  readOnly,
  children,
  onGenerateName = noop,
  onCancelGenerateName = noop,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [placeholder, setPlaceholder] = useState<string>(DEFAULT_PLACEHOLDER);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const handleGenerateName = useCallback(async () => {
    setIsRenaming(true);
    await onGenerateName();

    setIsRenaming(false);
  }, [onGenerateName]);

  const handleCancelGenerateName = useCallback(() => {
    setIsRenaming(false);
    onCancelGenerateName();
  }, [onCancelGenerateName]);

  useEffect(() => {
    if (isRenaming) {
      intervalRef.current = setInterval(() => {
        setPlaceholder(generatedNames());
      }, 100);
    } else {
      setPlaceholder(DEFAULT_PLACEHOLDER);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRenaming]);

  return (
    <div css={nameWrapperStyles}>
      <div
        role="textbox"
        contentEditable={!(isRenaming || readOnly)}
        css={placeholderStyles(isRenaming)}
        aria-placeholder={empty || isRenaming ? placeholder : ''}
        spellCheck={false}
        data-testid="input-widget-name"
      >
        <span>
          <span css={p13Medium}>{children}</span>
        </span>
      </div>
      {!readOnly &&
        (!isRenaming ? (
          <Tooltip
            trigger={
              <button
                contentEditable={false}
                aria-label="Rename"
                css={aiButtonWrapperStyles}
                onClick={handleGenerateName}
              >
                <Sparkles />
              </button>
            }
          >
            Rename with AI
          </Tooltip>
        ) : (
          <button
            contentEditable={false}
            aria-label="Cancel"
            css={aiButtonWrapperStyles}
            onClick={handleCancelGenerateName}
          >
            <Close />
            <span>Cancel</span>
          </button>
        ))}
    </div>
  );
};
