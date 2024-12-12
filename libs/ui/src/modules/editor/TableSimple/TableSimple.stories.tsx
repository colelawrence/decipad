import { Meta, StoryFn } from '@storybook/react';

import { TableCellSimple, TableHeadSimple, TableSimple } from './TableSimple';

export default {
  title: 'Organisms / UI / TableSimple',
  component: TableSimple,
} as Meta;

export const HorizontalTable: StoryFn = () => (
  <TableSimple>
    <tbody>
      <tr>
        <TableHeadSimple isTop isLeft topLeftRadius>
          Header 1
        </TableHeadSimple>
        <TableCellSimple isTop>Value 1</TableCellSimple>
        <TableCellSimple isTop topRightRadius>
          Value 1
        </TableCellSimple>
      </tr>
      <tr>
        <TableHeadSimple isLeft>Header 2</TableHeadSimple>
        <TableCellSimple>Value 2</TableCellSimple>
        <TableCellSimple>Value 2</TableCellSimple>
      </tr>
      <tr>
        <TableHeadSimple isLeft bottomLeftRadius>
          Header 3
        </TableHeadSimple>
        <TableCellSimple>Value 3</TableCellSimple>
        <TableCellSimple bottomRightRadius>Value 3</TableCellSimple>
      </tr>
    </tbody>
  </TableSimple>
);

export const VerticalTable: StoryFn = () => (
  <TableSimple>
    <thead>
      <tr>
        <TableHeadSimple isTop isLeft topLeftRadius>
          Header 1
        </TableHeadSimple>
        <TableHeadSimple isTop>Header 2</TableHeadSimple>
        <TableHeadSimple isTop>Header 3</TableHeadSimple>
        <TableHeadSimple isTop topRightRadius>
          Header 4
        </TableHeadSimple>
      </tr>
    </thead>
    <tbody>
      <tr>
        <TableCellSimple isLeft rowSpan={2} bottomLeftRadius>
          Row 2, Cell 1
        </TableCellSimple>
        <TableCellSimple>Row 2, Cell 2</TableCellSimple>
        <TableCellSimple>Row 2, Cell 3</TableCellSimple>
        <TableCellSimple>Row 2, Cell 4</TableCellSimple>
      </tr>
      <tr>
        <TableCellSimple isLeft>Row 3, Cell 2</TableCellSimple>
        <TableCellSimple>Row 3, Cell 3</TableCellSimple>
        <TableCellSimple bottomRightRadius>Row 3, Cell 4</TableCellSimple>
      </tr>
    </tbody>
  </TableSimple>
);

export const VerticalTableJustBody: StoryFn = () => (
  <TableSimple>
    <tbody>
      <tr>
        <TableCellSimple isTop isLeft topLeftRadius>
          Row 1, Cell 1
        </TableCellSimple>
        <TableCellSimple isTop>Row 1, Cell 2</TableCellSimple>
        <TableCellSimple isTop>Row 1, Cell 3</TableCellSimple>
        <TableCellSimple isTop topRightRadius>
          Row 1, Cell 4
        </TableCellSimple>
      </tr>
      <tr>
        <TableCellSimple isLeft>Row 2, Cell 1</TableCellSimple>
        <TableCellSimple>Row 2, Cell 2</TableCellSimple>
        <TableCellSimple>Row 2, Cell 3</TableCellSimple>
        <TableCellSimple>Row 2, Cell 4</TableCellSimple>
      </tr>
      <tr>
        <TableCellSimple isLeft bottomLeftRadius>
          Row 3, Cell 1
        </TableCellSimple>
        <TableCellSimple>Row 3, Cell 2</TableCellSimple>
        <TableCellSimple>Row 3, Cell 3</TableCellSimple>
        <TableCellSimple bottomRightRadius>Row 3, Cell 4</TableCellSimple>
      </tr>
    </tbody>
  </TableSimple>
);

export const VerticalTableWithFooter: StoryFn = () => (
  <TableSimple>
    <tbody>
      <tr>
        <TableCellSimple isTop isLeft topLeftRadius>
          Row 1, Cell 1
        </TableCellSimple>
        <TableCellSimple isTop>Row 1, Cell 2</TableCellSimple>
        <TableCellSimple isTop>Row 1, Cell 3</TableCellSimple>
        <TableCellSimple isTop topRightRadius>
          Row 1, Cell 4
        </TableCellSimple>
      </tr>
      <tr>
        <TableCellSimple isLeft>Row 2, Cell 1</TableCellSimple>
        <TableCellSimple>Row 2, Cell 2</TableCellSimple>
        <TableCellSimple>Row 2, Cell 3</TableCellSimple>
        <TableCellSimple>Row 2, Cell 4</TableCellSimple>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <TableHeadSimple isLeft bottomLeftRadius>
          Footer 1
        </TableHeadSimple>
        <TableHeadSimple>Footer 2</TableHeadSimple>
        <TableHeadSimple>Footer 3</TableHeadSimple>
        <TableHeadSimple bottomRightRadius>Footer 4</TableHeadSimple>
      </tr>
    </tfoot>
  </TableSimple>
);

export const VerticalTableWithAll: StoryFn = () => (
  <TableSimple>
    <thead>
      <tr>
        <TableHeadSimple isTop isLeft topLeftRadius>
          Header 1
        </TableHeadSimple>
        <TableHeadSimple isTop>Header 2</TableHeadSimple>
        <TableHeadSimple isTop>Header 3</TableHeadSimple>
        <TableHeadSimple isTop topRightRadius>
          Header 4
        </TableHeadSimple>
      </tr>
    </thead>
    <tbody>
      <tr>
        <TableCellSimple isLeft>Row 1, Cell 1</TableCellSimple>
        <TableCellSimple>Row 1, Cell 2</TableCellSimple>
        <TableCellSimple>Row 1, Cell 3</TableCellSimple>
        <TableCellSimple>Row 1, Cell 4</TableCellSimple>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <TableHeadSimple isLeft bottomLeftRadius>
          Footer 1
        </TableHeadSimple>
        <TableHeadSimple>Footer 2</TableHeadSimple>
        <TableHeadSimple>Footer 3</TableHeadSimple>
        <TableHeadSimple bottomRightRadius>Footer 4</TableHeadSimple>
      </tr>
    </tfoot>
  </TableSimple>
);
