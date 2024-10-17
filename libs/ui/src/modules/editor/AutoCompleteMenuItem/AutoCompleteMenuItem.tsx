/* eslint decipad/css-prop-named-variable: 0 */
import { AutocompleteName, SerializedType } from '@decipad/language-interfaces';
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Formula, Number, TableSmall, Text } from '../../../icons';
import { cssVar, p12Medium } from '../../../primitives';
import { useCancelingEvent } from '../../../utils';

const wrapperStyles = (focused: boolean) =>
  css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px',
    ':hover': {
      backgroundColor: cssVar('backgroundSubdued'),
      borderRadius: '6px',
    },
    ...(focused && {
      backgroundColor: cssVar('backgroundDefault'),
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

const iconStyles = css({
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
  color: cssVar('textSubdued'),
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  position: 'relative',
  overflow: 'hidden',
});

export interface AutoCompleteMenuItemProps {
  readonly item: AutocompleteName;

  /**
   * Unfortunately, we cannot use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly hoveringSome?: boolean;
  readonly onExecute?: () => void;

  readonly onHover?: () => void;
}

const getAutocompleteIconFor = (type: SerializedType['kind']) => {
  const icons: Partial<Record<SerializedType['kind'], ReactNode>> = {
    number: <Number />,
    string: <Text />,
    date: <Calendar />,
    table: <TableSmall />,
    column: <TableSmall />,
    function: <Formula />,
  };
  const selected = icons[type] || <Number />;
  return selected;
};

export const AutoCompleteMenuItem = ({
  item,
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
        onMouseDown={useCancelingEvent(onExecute)}
        ref={itemRef}
      >
        <span css={iconStyles}>{getAutocompleteIconFor(item.kind)}</span>
        <div css={textStyles} data-testid={`autocomplete-item:${item.name}`}>
          <strong css={identifierStyles}>{item.name}</strong>
        </div>
      </button>
    </div>
  );
};
