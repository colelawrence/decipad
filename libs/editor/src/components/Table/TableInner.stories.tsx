import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { TableInner } from './TableInner';
import { TableData } from './types';

export default {
  title: 'Editor/Table',
  component: TableInner,
} as Meta;

export const Normal: Story = () => {
  const [data, setData] = useState<TableData>({
    variableName: 'TableName',
    columns: [
      {
        columnName: 'FirstName',
        cells: ['Mary', 'Pena', 'Zé'],
        cellType: 'string',
      },
      {
        columnName: 'Numbers',
        cells: ['1', '2', '3'],
        cellType: 'number',
      },
    ],
  });

  return (
    <>
      <TableInner value={data} onChange={setData} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

Normal.storyName = 'Table';
