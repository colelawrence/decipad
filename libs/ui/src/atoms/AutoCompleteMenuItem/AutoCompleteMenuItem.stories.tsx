import { Meta, Story } from '@storybook/react';
import { inMenu } from '../../storybook-utils';
import { AutoCompleteMenuItem } from './AutoCompleteMenuItem';

const args = {
  title: 'Title',
  kind: 'variable',
  identifier: 'MyVariable',
  type: 'number',
};

export default {
  title: 'Atoms / Editor / Auto Complete Menu / Item',
  component: AutoCompleteMenuItem,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <AutoCompleteMenuItem {...props} />
);

export const Active: Story<typeof args> = (props) => (
  <AutoCompleteMenuItem focused={true} {...props} />
);
