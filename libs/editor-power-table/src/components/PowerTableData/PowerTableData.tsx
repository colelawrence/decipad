import { FC } from 'react';
import { SerializedType, Interpreter } from '@decipad/computer';
import { usePowerTableLayoutData } from '../../hooks';
import { PowerRow } from '../PowerRow';

interface PowerTableDataProps {
  data: Interpreter.ResultTable;
  columnTypes: SerializedType[];
}

export const PowerTableData: FC<PowerTableDataProps> = ({
  data,
  columnTypes,
}) => {
  const layoutData = usePowerTableLayoutData(data, columnTypes);

  return (
    <>
      {layoutData.map((row, index) => (
        <PowerRow
          key={index}
          row={row}
          isLastRow={index === layoutData.length - 1}
        />
      ))}
    </>
  );
};
