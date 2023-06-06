import { Meta, Story } from '@storybook/react';
import { inMenu } from '../../storybook-utils';
import { ACItemType, AutoCompleteMenuItem } from './AutoCompleteMenuItem';

const args = {
  title: 'Title',
  kind: 'variable',
  identifier: 'MyVariable',
  type: 'number' as ACItemType,
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
