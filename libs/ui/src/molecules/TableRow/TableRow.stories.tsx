import { css } from '@emotion/react';
import { Meta, StoryFn } from '@storybook/react';
import { TableData } from '../../atoms';
import { table } from '../../styles';
import { TableRow } from './TableRow';

const cellStyles = css({
  padding: `0 ${table.tdHorizontalPadding}px`,
});

export default {
  title: 'Molecules / Editor / Table / Row',
  component: TableRow,
} as Meta;

export const Normal: StoryFn = () => (
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

export const ReadOnly: StoryFn = () => (
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
