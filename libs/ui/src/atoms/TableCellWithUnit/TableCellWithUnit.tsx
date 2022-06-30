import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';

const unitStyles = css({
  '&::after': {
    content: 'attr(data-unit)',
    marginLeft: '0.25rem',
  },
});

interface TableCellWithUnitProps {
  children: ReactNode;
  unit?: string;
}

export const TableCellWithUnit = ({
  children,
  unit,
}: TableCellWithUnitProps): ReturnType<FC> => {
  return (
    <span css={unit && unitStyles} data-unit={unit || ''}>
      {children}
    </span>
  );
};
