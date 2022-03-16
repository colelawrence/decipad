import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { sidePadding } from '../../storybook-utils';
import { ListItemContent } from './ListItemContent';

const args = {
  children: 'Item',
};

export default {
  title: 'Atoms / List / Item Content',
  component: ListItemContent,
  args,
  decorators: [sidePadding(6)],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <ListItemContent {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <ListItemContent {...props} />
  </BlockIsActiveProvider>
);
