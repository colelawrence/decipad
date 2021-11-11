import { css } from '@emotion/react';
import { FC } from 'react';
import { Number, Text, Placeholder } from '../../icons';
import { cssVar, grey250 } from '../../primitives';

const columnStyles = css({
  backgroundColor: cssVar('highlightColor'),
  // Keep hover effect when hovered, focused or the dropdown menu is opened.
  '&:hover, &:focus-within, &[data-highlight="true"]': {
    backgroundColor: cssVar('strongHighlightColor'),
  },

  boxShadow: `inset 0px -2px 0px ${grey250.rgb}`,

  paddingLeft: '12px',
  paddingRight: '8px',
  verticalAlign: 'middle',
});

const hasRightSlotStyles = css({
  '& > div > div:last-of-type': {
    opacity: 0,
  },

  // Display the right-side slot when hovering the cell, focusing the cell or
  // when the menu itself is opened.
  '&:hover > div > div:last-of-type, &:focus-within > div > div:last-of-type, &[data-highlight="true"] > div > div:last-of-type':
    {
      opacity: 1,
    },
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  minHeight: '100%',
});

const columnTypeStyles = css({
  '& > svg': {
    height: '16px',
    width: '16px',
  },
});

const rightSlotStyles = css({
  marginLeft: 'auto',
});

export const typeIcons = {
  string: Text,
  number: Number,
  'date/time': Placeholder,
  'date/day': Placeholder,
  'date/month': Placeholder,
  'date/year': Placeholder,
};

type Type = keyof typeof typeIcons;

export interface TableHeaderProps {
  children?: React.ReactNode;
  highlight?: boolean;
  rightSlot?: React.ReactNode;
  type?: Type;
}

export const TableHeader = ({
  children,
  highlight = false,
  rightSlot,
  type = 'string',
}: TableHeaderProps): ReturnType<FC> => {
  const Icon = typeIcons[type];
  return (
    <th
      css={[columnStyles, rightSlot != null && hasRightSlotStyles]}
      data-highlight={highlight}
    >
      <div css={headerWrapperStyles}>
        <span css={columnTypeStyles}>
          <Icon />
        </span>
        {children}
        {rightSlot != null && <div css={rightSlotStyles}>{rightSlot}</div>}
      </div>
    </th>
  );
};
