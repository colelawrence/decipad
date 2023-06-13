import { Meta, StoryFn } from '@storybook/react';
import { getNumberType } from '../../utils';
import { TableColumnMenu } from './TableColumnMenu';

export default {
  title: 'Organisms / Editor / Table / Column Menu',
  component: TableColumnMenu,
} as Meta;

export const Normal: StoryFn = () => (
  <TableColumnMenu
    open
    trigger={<button>anchor</button>}
    type={getNumberType()}
  />
);
