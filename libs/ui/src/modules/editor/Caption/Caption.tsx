/* eslint decipad/css-prop-named-variable: 0 */
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { generatedNames, noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as userIcons from '../../../icons/user-icons';

import {
  ComponentProps,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { UserIconKey } from '@decipad/editor-types';
import {
  cssVar,
  display,
  easingTiming,
  p13Medium,
  p13Regular,
  p14Regular,
  placeholderOpacity,
  smallScreenQuery,
} from '../../../primitives';
import { IconPopover } from '../../../shared';
import { AvailableSwatchColor } from '../../../utils';
import { Close, Sparkles } from '../../../icons';

interface CaptionProps
  extends Pick<
    ComponentProps<typeof IconPopover>,
    'onChangeColor' | 'onChangeIcon'
  > {
  readOnly?: boolean;
  color?: AvailableSwatchColor;
  icon?: UserIconKey;
  empty?: boolean;
  children: ReactNode;
  onGenerateName?: () => Promise<void>;
  onCancelGenerateName?: () => void;
}

const nameWrapperStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '4px',
});

const iconWrapperStyles = css({
  display: 'grid',
  height: '20px',
  width: '20px',
  flexShrink: 0,

  [smallScreenQuery]: {
    height: '16px',
    width: '16px',
  },
});

const aiButtonWrapperStyles = css(p13Medium, {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  right: 0,
  flexShrink: 0,
  opacity: 0,
  gap: 2,
  borderRadius: '4px',
  padding: '2px',
  paddingRight: 4,
  backgroundColor: cssVar('backgroundDefault'),
  transition: `all 50ms ${easingTiming.easeOut}`,
  boxShadow: `-4px 0px 8px 2px ${cssVar('backgroundSubdued')}`,

  '& > svg': {
    height: '16px',
    width: '16px',

    '& > path': {
      fill: cssVar('textDefault'),
      stroke: cssVar('textDefault'),
    },
  },

  '&:hover, &:focus': {
    backgroundColor: cssVar('backgroundHeavy'),
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
});

const textBoxWrapper = css({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden',
  flex: 1,
  padding: '2px',
  margin: '-2px',
  paddingRight: 0,
  marginRight: 0,
  borderRadius: '4px',

  '&:has(> button)': {
    '&:hover': {
      backgroundColor: cssVar('backgroundDefault'),
      button: {
        opacity: 1,
      },
    },
  },
});

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
  color = 'Catskill',
  icon = 'Pencil',
  onChangeColor = noop,
  onChangeIcon = noop,
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

  const Icon = userIcons[icon] ?? userIcons.Pencil;
  return (
    <div css={nameWrapperStyles}>
      {useIsEditorReadOnly() ? (
        <span contentEditable={false} css={iconWrapperStyles}>
          <Icon />
        </span>
      ) : (
        <IconPopover
          onChangeColor={onChangeColor}
          onChangeIcon={onChangeIcon}
          color={color}
          trigger={
            <button contentEditable={false} css={iconWrapperStyles}>
              <Icon />
            </button>
          }
        />
      )}
      <div css={textBoxWrapper}>
        <div
          role="textbox"
          contentEditable={!(isRenaming || readOnly)}
          css={placeholderStyles(isRenaming)}
          aria-placeholder={empty || isRenaming ? placeholder : ''}
          spellCheck={false}
          data-testid="input-widget-name"
        >
          <span>
            <span>{children}</span>
          </span>
        </div>
        {!readOnly &&
          (!isRenaming ? (
            <button
              contentEditable={false}
              aria-label="Rename"
              css={aiButtonWrapperStyles}
              onClick={handleGenerateName}
            >
              <Sparkles />
              <span>Rename</span>
            </button>
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
    </div>
  );
};
