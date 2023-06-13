import { Meta, StoryFn } from '@storybook/react';
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

export const Normal: StoryFn = (props) => <InputMenuItem {...props} />;

export const WithValue: StoryFn = (props) => <InputMenuItem {...props} />;
WithValue.args = {
  value: 10,
};

export const WithLabel: StoryFn = (props) => <InputMenuItem {...props} />;
WithLabel.args = {
  label: 'value',
  value: 10,
};

export const WithError: StoryFn = (props) => <InputMenuItem {...props} />;
WithError.args = {
  error: 'Something went bananas',
  label: 'value',
  value: 10,
};
