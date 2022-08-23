import { css } from '@emotion/react';
import { useWindowListener } from '@decipad/react-utils';
import { FC, useCallback, useRef } from 'react';
import { noop } from '@decipad/utils';
import { Calendar, Formula, Number, Table, Text } from '../../icons';
import { setCssVar, cssVar, p14Medium, teal600 } from '../../primitives';

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  columnGap: '4px',
  padding: '6px 4px',
  margin: '2px 0',
  ':hover, &[data-focused="true"]': {
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '6px',
  },
});

const iconStyles = css(setCssVar('currentTextColor', teal600.rgb), {
  width: '16px',
  height: '16px',
  display: 'grid',
  borderRadius: '6px',
});
const textStyles = css({
  display: 'grid',
  textAlign: 'start',
});

interface AutoCompleteMenuItemProps {
  readonly kind: string;
  readonly identifier: string;
  readonly type: string;

  /**
   * Unfortunately, we cannot use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly onExecute?: () => void;
}
export const AutoCompleteMenuItem = ({
  identifier,
  focused,
  type,
  onExecute = noop,
}: AutoCompleteMenuItemProps): ReturnType<FC> => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        focused &&
        (event.key === 'Enter' || event.key === 'Tab') &&
        !event.shiftKey
      ) {
        onExecute();
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [onExecute, focused]
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
      css={styles}
      onMouseDown={(event) => {
        onExecute();
        event.stopPropagation();
        event.preventDefault();
      }}
      data-focused={focused}
      ref={itemRef}
    >
      <span css={iconStyles}>
        {{
          number: <Number />,
          string: <Text />,
          date: <Calendar />,
          table: <Table />,
          function: <Formula />,
        }[type] || <Number />}
      </span>
      <div css={textStyles}>
        <strong css={css(p14Medium)}>{identifier}</strong>
      </div>
    </button>
  );
};
