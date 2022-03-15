import { Meta, Story } from '@storybook/react';
import { EditorInteractiveInput } from './EditorInteractiveInput';

export default {
  title: 'Organisms / Editor / Interactive Input',
  component: EditorInteractiveInput,
} as Meta;

export const Normal: Story = () => <EditorInteractiveInput />;

const withNameArgs = { name: 'DiscountRate' };
export const WithName: Story<typeof withNameArgs> = (props) => (
  <EditorInteractiveInput {...props} />
);
WithName.args = withNameArgs;

const withValueArgs = { name: 'DiscountRate', value: '5' };
export const WithValue: Story<typeof withValueArgs> = (props) => (
  <EditorInteractiveInput {...props} />
);
WithValue.args = withValueArgs;

const withReadOnlyArgs = {
  name: 'DiscountRate',
  unit: 'percent',
  readOnly: true,
  value: '5',
};
export const ReadOnly: Story<typeof withReadOnlyArgs> = (props) => (
  <EditorInteractiveInput {...props} />
);
ReadOnly.args = withReadOnlyArgs;
