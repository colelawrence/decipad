import { Meta, Story } from '@storybook/react';
import { inMenu } from '../../storybook-utils';
import { InputMenuItem } from './InputMenuItem';

const args = {
  placeholder: 'Write something here',
  type: 'number',
};

export default {
  title: 'Molecules / Input Menu Item',
  component: InputMenuItem,
  decorators: [inMenu],
  args,
} as Meta<typeof args>;

export const Normal: Story = (props) => <InputMenuItem {...props} />;

export const WithValue: Story = (props) => <InputMenuItem {...props} />;
WithValue.args = {
  value: 10,
};

export const WithLabel: Story = (props) => <InputMenuItem {...props} />;
WithLabel.args = {
  label: 'value',
  value: 10,
};

export const WithError: Story = (props) => <InputMenuItem {...props} />;
WithError.args = {
  error: 'Something went bananas',
  label: 'value',
  value: 10,
};
