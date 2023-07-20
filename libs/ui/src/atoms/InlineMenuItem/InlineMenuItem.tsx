/* eslint decipad/css-prop-named-variable: 0 */
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useRef } from 'react';
import { cssVar, p12Regular, p14Medium, setCssVar } from '../../primitives';
import { soonStyles } from '../../styles/menu';

const inlineMenuStyles = css({
  display: 'grid',
  alignItems: 'start',
  gridTemplateColumns: 'auto 1fr',
  columnGap: '12px',

  clipPath: 'inset(-8px -8px -8px -8px round 8px)',
  ':hover, &[data-focused="true"]': {
    backgroundColor: cssVar('highlightColor'),
    boxShadow: `0px 0px 0px 8px ${cssVar('highlightColor')}`,
  },
});

const iconStyles = css({
  width: '40px',
  height: '40px',
  display: 'grid',
  borderRadius: 8,
});

const textStyles = css({
  display: 'grid',
  textAlign: 'start',
  rowGap: '6px',
});

const inlineStyles = css({
  display: 'flex',
  gap: '8px',
});

const titleStyles = css(
  p14Medium,
  setCssVar('currentTextColor', 'strongTextColor')
);
const descriptionStyles = css(p12Regular);

const disabledStyles = css(
  setCssVar('currentTextColor', cssVar('weakerTextColor'))
);
const enabledStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor'))
);
const blackFontStyles = css(
  setCssVar('currentTextColor', cssVar('strongTextColor'))
);

interface InlineMenuItemProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly hidden?: boolean;
  /**
   * Unfortunately, we canont use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly onExecute?: () => void;
  readonly 'data-testid'?: string;
}
export const InlineMenuItem = ({
  icon,
  title,
  description,
  enabled,
  focused,
  onExecute = noop,
  'data-testid': testId,
}: InlineMenuItemProps): ReturnType<FC> => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (focused && event.key === 'Enter' && !event.shiftKey) {
        enabled && onExecute();
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [onExecute, focused, enabled]
  );
  useWindowListener('keydown', onKeyDown, true);

  if (focused) {
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  return (
    <button
      role="menuitem"
      data-testid={testId}
      css={inlineMenuStyles}
      onMouseDown={(event) => {
        enabled && onExecute();
        event.stopPropagation();
        event.preventDefault();
      }}
      data-focused={focused}
      ref={itemRef}
    >
      <span css={[iconStyles, !enabled && css({ opacity: '0.5' })]}>
        {icon}
      </span>
      <div css={textStyles}>
        <div css={inlineStyles}>
          <strong
            css={[titleStyles, enabled ? blackFontStyles : disabledStyles]}
          >
            {title}
          </strong>
          {!enabled && <span css={soonStyles}>SOON</span>}
        </div>
        <span
          css={[descriptionStyles, enabled ? enabledStyles : disabledStyles]}
        >
          {description}
        </span>
      </div>
    </button>
  );
};
