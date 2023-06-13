import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, StoryFn } from '@storybook/react';
import { ListItemContent } from './ListItemContent';

const args = {
  children: 'Item',
};

export default {
  title: 'Atoms / Editor / List / Item',
  component: ListItemContent,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <ListItemContent {...props} />
);

export const Active: StoryFn<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <ListItemContent {...props} />
  </BlockIsActiveProvider>
);
