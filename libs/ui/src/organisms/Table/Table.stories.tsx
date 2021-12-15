import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { Table } from './Table';
import { table } from '../../styles';

const cellStyles = css({
  padding: `0 ${table.cellSidePadding}`,
});

const headers = (
  <thead>
    <TableHeaderRow readOnly>
      <TableHeader>Header 1</TableHeader>
      <TableHeader>Header 2</TableHeader>
    </TableHeaderRow>
  </thead>
);
const body = (
  <tbody>
    <TableRow readOnly>
      <TableData>
        <div css={cellStyles}>Cell 1.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 1.2</div>
      </TableData>
    </TableRow>
    <TableRow readOnly>
      <TableData>
        <div css={cellStyles}>Cell 2.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 2.2</div>
      </TableData>
    </TableRow>
  </tbody>
);

export default {
  title: 'Organisms / Table',
  component: Table,
} as Meta;

export const Normal: Story = () => <Table>{body}</Table>;

export const NormalWithHeaders: Story = () => (
  <Table>
    {headers}
    {body}
  </Table>
);

export const InnerBorders: Story = () => <Table border="inner">{body}</Table>;
