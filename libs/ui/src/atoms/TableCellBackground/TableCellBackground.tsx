import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const selectedStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  cursor: 'default',
  zIndex: 1,
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
  opacity: 0.1,
});

export interface TableCellBackgroundProps {
  selected?: boolean;
  left?: number;
}

export const TableCellBackground = ({
  selected,
  left,
}: TableCellBackgroundProps) => {
  if (!selected) return null;

  return (
    <div
      contentEditable={false}
      css={[selectedStyles, left && css({ marginLeft: `${left}px` })]}
    />
  );
};
