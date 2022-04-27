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
  showUnit: boolean;
  unit?: string;
}

export const TableCellWithUnit = ({
  children,
  showUnit,
  unit,
}: TableCellWithUnitProps): ReturnType<FC> => {
  return (
    <span
      css={showUnit && unit && unitStyles}
      data-unit={(showUnit && unit) || ''}
    >
      {children}
    </span>
  );
};
