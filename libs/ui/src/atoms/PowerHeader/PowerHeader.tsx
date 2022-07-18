import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback } from 'react';
import { cssVar } from '../../primitives';

interface PowerHeaderProps {
  children?: ReactNode;
  hover: boolean;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
}

const powerHeaderStyles = css({
  height: '100%',
  padding: '10px',
});

const hoverStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

export const PowerHeader: FC<PowerHeaderProps> = ({
  rowSpan,
  colSpan,
  children,
  hover,
  onHover = noop,
}) => {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);
  return (
    <th
      css={[powerHeaderStyles, hover && hoverStyles]}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </th>
  );
};
