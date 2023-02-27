import { css } from '@emotion/react';
import { useWindowListener } from '@decipad/react-utils';
import { FC, useCallback, useRef, useState } from 'react';
import { noop } from '@decipad/utils';
import { Remark } from 'react-remark';
import { Calendar, Formula, Number, Table, Text } from '../../icons';
import {
  setCssVar,
  cssVar,
  p14Medium,
  teal600,
  smallCode,
} from '../../primitives';
import { Tooltip } from '../Tooltip/Tooltip';

const wrapperStyles = (focused: boolean) =>
  css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px',
    ':hover': {
      backgroundColor: cssVar('highlightColor'),
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

const identifierStyles = css(p14Medium);

const explanationWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
});

const explanationIdentifierStyles = css(identifierStyles, {
  color: cssVar('weakerTextColor'),
});

const explanationTextStyles = css({
  padding: '0.5rem 0.25rem 0.25rem',
  code: css(smallCode, {
    marginTop: '0.25rem',
    display: 'block',
    borderRadius: '3px',
    padding: '0.25rem',
    backgroundColor: cssVar('tooltipCodeBackground'),
    color: cssVar('strongTextColor'),
  }),
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
}

export const AutoCompleteMenuItem = ({
  identifier,
  type,
  explanation,
  focused = false,
  hoveringSome = false,
  onExecute = noop,
}: AutoCompleteMenuItemProps): ReturnType<FC> => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const [hovering, setHovering] = useState(false);
  const onMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);
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

  if (focused) {
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Tooltip
        side="right"
        theme="light"
        open={(hovering || (focused && !hoveringSome)) && explanation != null}
        trigger={
          <div css={wrapperStyles(focused)}>
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
                  table: <Table />,
                  function: <Formula />,
                }[type] || <Number />}
              </span>
              <div css={textStyles}>
                <strong css={identifierStyles}>{identifier}</strong>
              </div>
            </button>
          </div>
        }
      >
        <div css={explanationWrapperStyles}>
          <h2 css={explanationIdentifierStyles}>{identifier}</h2>
          <div css={explanationTextStyles}>
            <Remark>{explanation || ''}</Remark>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};
