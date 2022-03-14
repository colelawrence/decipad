import { TableData } from '@decipad/editor-types';
import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { TableInner } from './TableInner';

export default {
  title: 'Legacy/Editor/Table',
  component: TableInner,
} as Meta;

export const Normal: Story = () => {
  const [data, setData] = useState<TableData>({
    variableName: 'TableName',
    columns: [
      {
        columnName: 'FirstName',
        cells: ['Mary', 'Pena', 'Zé'],
        cellType: { kind: 'string' },
      },
      {
        columnName: 'Numbers',
        cells: ['1', '2', '3'],
        cellType: { kind: 'number', unit: null },
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
