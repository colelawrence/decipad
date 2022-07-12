import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { table } from '../../styles';

const border = `1px solid ${cssVar('strongHighlightColor')}`;

const tableRowStyles = css({
  '> th:nth-of-type(2)': {
    borderLeft: border,
  },
  '> th': {
    borderRight: border,
    borderBottom: border,
  },
  '> th:first-of-type': {
    border: 'unset',
  },
});

interface SmartRowProps {
  readonly smartCells: ReactNode[];
}

export const SmartRow: FC<SmartRowProps> = ({ smartCells }) => {
  return (
    <tr
      css={[
        tableRowStyles,
        css({
          position: 'relative',
          display: 'grid',
          gridTemplate: table.rowTemplate(smartCells.length, false),
        }),
      ]}
    >
      <th></th>
      {smartCells.map((smartCell, index) => (
        <th key={index}>{index > 0 && smartCell}</th>
      ))}
      <th></th>
    </tr>
  );
};
