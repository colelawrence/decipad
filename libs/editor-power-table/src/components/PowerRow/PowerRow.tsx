import { FC } from 'react';
import { atoms, molecules, organisms } from '@decipad/ui';
import { Result } from '@decipad/computer';
import { RowLayout } from '../../types';

interface PowerRowProps {
  row: RowLayout;
  isLastRow?: boolean;
}

export const PowerRow: FC<PowerRowProps> = ({
  row,
  isLastRow = false,
}: PowerRowProps) => (
  <>
    <molecules.PowerTableRow>
      <atoms.PowerTableHeader
        rowSpan={row.rowSpan}
        isBottomLeftHeader={isLastRow}
        isLastHeader={row.rest.length === 0}
      >
        <organisms.CodeResult
          value={row.value as Result.Result['value']}
          variant="inline"
          type={row.type}
        />
      </atoms.PowerTableHeader>
    </molecules.PowerTableRow>
    {row.rest.map((r, index) => (
      <PowerRow key={index} row={r}></PowerRow>
    ))}
  </>
);
