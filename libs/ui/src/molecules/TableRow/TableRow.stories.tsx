import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { TableData } from '../../atoms';
import { table } from '../../styles';
import { TableRow } from './TableRow';

const cellStyles = css({
  padding: `0 ${table.cellSidePadding}`,
});

export default {
  title: 'Molecules / Editor / Table / Row',
  component: TableRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <TableRow>
      <TableData>
        <div css={cellStyles}>Cell 1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 3</div>
      </TableData>
    </TableRow>
  </table>
);

export const ReadOnly: Story = () => (
  <table>
    <TableRow readOnly>
      <TableData>
        <div css={cellStyles}>Cell 1</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 2</div>
      </TableData>
      <TableData>
        <div css={cellStyles}>Cell 3</div>
      </TableData>
    </TableRow>
  </table>
);
