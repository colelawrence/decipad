import { Meta, StoryFn } from '@storybook/react';
import { TableDropLine } from './TableDropLine';

export default {
  title: 'Atoms / Editor / Void / Table Drop Line',
  component: TableDropLine,
} as Meta;

export const Row: StoryFn = () => (
  <>
    (above)
    <TableDropLine variant="row" />
    (below)
  </>
);

export const Column: StoryFn = () => (
  <span>
    (above)
    <TableDropLine variant="column" />
    (below)
  </span>
);
