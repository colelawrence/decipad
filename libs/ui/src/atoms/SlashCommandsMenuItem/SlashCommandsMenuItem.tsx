import { css } from '@emotion/react';
import { FC, ReactNode, useEffect } from 'react';
import { cssVar, p12Regular, p14Medium } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
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
  padding: '12px',

  backgroundColor: cssVar('iconBackgroundColor'),
  borderRadius: '6px',
});
const textStyles = css({
  display: 'grid',
  textAlign: 'start',
  rowGap: '6px',
});

interface SlashCommandsMenuItemProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;

  /**
   * Unfortunately, we canont use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly onExecute?: () => void;
}
export const SlashCommandsMenuItem = ({
  icon,
  title,
  description,

  focused,
  onExecute = noop,
}: SlashCommandsMenuItemProps): ReturnType<FC> => {
  useEffect(() => {
    if (focused) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (!event.shiftKey && (event.key === 'Enter' || event.key === 'Tab')) {
          onExecute();
          event.stopPropagation();
          event.preventDefault();
        }
      };

      window.addEventListener('keydown', onKeyDown, { capture: true });
      return () =>
        window.removeEventListener('keydown', onKeyDown, { capture: true });
    }

    return undefined;
  }, [focused, onExecute]);

  return (
    <button
      role="menuitem"
      css={styles}
      onClick={onExecute}
      data-focused={focused}
    >
      <span css={iconStyles}>{icon}</span>
      <div css={textStyles}>
        <strong css={css(p14Medium)}>{title}</strong>
        <span css={css(p12Regular)}>{description}</span>
      </div>
    </button>
  );
};
