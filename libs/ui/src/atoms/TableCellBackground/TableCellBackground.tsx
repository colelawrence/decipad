import { css } from '@emotion/react';
import { cssVar } from '../../primitives/index';

const selectedStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
  opacity: 0.3,
});

export interface TableCellBackgroundProps {
  selected?: boolean;
}

export const TableCellBackground = (props: TableCellBackgroundProps) => {
  if (!props.selected) return null;

  return <div contentEditable={false} css={selectedStyles} />;
};
