import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { TableData, TableHeader } from '../../atoms';
import { TableHeaderRow, TableRow } from '../../molecules';
import { table } from '../../styles';
import { Table } from './Table';

const cellStyles = css({
  padding: `0 ${table.tdHorizontalPadding}`,
});

const headers = (
  <TableHeaderRow readOnly>
    <TableHeader>Header 1</TableHeader>
    <TableHeader>Header 2</TableHeader>
    <TableHeader>Header 3</TableHeader>
    <TableHeader>Header 4</TableHeader>
    <TableHeader>Header 5</TableHeader>
    <TableHeader>Header 6</TableHeader>
  </TableHeaderRow>
);
const body = (
  <>
    <TableRow readOnly>
      <TableData>
        <div css={cellStyles}>Cell 1.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 1.2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 2.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 2.2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 3.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 3.2</div>
      </TableData>
    </TableRow>
    <TableRow readOnly>
      <TableData>
        <div css={cellStyles}>Cell 4.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 4.2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 5.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 5.2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 6.1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 6.2</div>
      </TableData>
    </TableRow>
  </>
);

export default {
  title: 'Organisms / Editor / Table',
  component: Table,
} as Meta;

export const Normal: Story = () => <Table body={body} />;

export const NormalWithHeaders: Story = () => (
  <Table head={headers} body={body} />
);

export const InnerBorders: Story = () => <Table border="inner" body={body} />;
