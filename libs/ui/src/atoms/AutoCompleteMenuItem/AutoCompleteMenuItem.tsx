/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { useWindowListener } from '@decipad/react-utils';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { noop } from '@decipad/utils';
import { Calendar, Formula, Number, Table, Text } from '../../icons';
import { setCssVar, cssVar, grey400, p12Medium } from '../../primitives';

const wrapperStyles = (focused: boolean) =>
  css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px',
    ':hover': {
      backgroundColor: cssVar('tintedBackgroundColor'),
      borderRadius: '6px',
    },
    ...(focused && {
      backgroundColor: cssVar('highlightColor'),
      borderRadius: '6px',
    }),
  });

const styles = css({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  columnGap: '4px',
});

const iconStyles = css(setCssVar('currentTextColor', grey400.rgb), {
  width: '16px',
  height: '16px',
  display: 'grid',
  borderRadius: '6px',
});

const textStyles = css({
  display: 'grid',
  textAlign: 'start',
});

const identifierStyles = css(p12Medium, {
  color: cssVar('weakTextColor'),
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  position: 'relative',
  overflow: 'hidden',
});

interface AutoCompleteMenuItemProps {
  readonly kind: string;
  readonly identifier: string;
  readonly type: string;
  readonly explanation?: string;

  /**
   * Unfortunately, we cannot use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly hoveringSome?: boolean;
  readonly onExecute?: () => void;

  readonly onHover?: () => void;
}

export const AutoCompleteMenuItem = ({
  identifier,
  type,
  focused = false,
  onExecute = noop,
  onHover = noop,
}: AutoCompleteMenuItemProps): ReturnType<FC> => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const [, setHovering] = useState(false);
  const onMouseEnter = useCallback(() => {
    setHovering(true);
    onHover();
  }, [onHover]);
  const onMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
        if (focused) {
          onExecute();
          event.stopPropagation();
          event.preventDefault();
        }
      }
    },
    [onExecute, focused]
  );
  useWindowListener('keydown', onKeyDown, true);

  useEffect(() => {
    if (focused) {
      itemRef.current?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [focused]);

  return (
    <div
      css={wrapperStyles(focused)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      spellCheck={false}
    >
      <button
        role="menuitem"
        css={styles}
        onMouseDown={(event) => {
          onExecute();
          event.stopPropagation();
          event.preventDefault();
        }}
        ref={itemRef}
      >
        <span css={iconStyles}>
          {{
            number: <Number />,
            string: <Text />,
            date: <Calendar />,
            table: (
              <Table strokeColor={cssVar('weakerTextColor')} noBackground />
            ),
            function: <Formula strokeColor={cssVar('weakerTextColor')} />,
          }[type] || <Number />}
        </span>
        <div css={textStyles}>
          <strong css={identifierStyles}>{identifier}</strong>
        </div>
      </button>
    </div>
  );
};
