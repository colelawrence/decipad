import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { ListItemContent } from './ListItemContent';

const args = {
  children: 'Item',
};

export default {
  title: 'Atoms / Editor / List / Item',
  component: ListItemContent,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <ListItemContent {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <ListItemContent {...props} />
  </BlockIsActiveProvider>
);
