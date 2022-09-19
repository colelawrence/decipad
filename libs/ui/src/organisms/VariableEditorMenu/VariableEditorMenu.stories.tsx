import { Meta, Story } from '@storybook/react';
import { VariableEditorMenu } from './VariableEditorMenu';

export default {
  title: 'Organisms / Editor / Variable Editor / Menu',
  component: VariableEditorMenu,
} as Meta;

export const Normal: Story = () => (
  <VariableEditorMenu
    variant="expression"
    trigger={<button>click me</button>}
  />
);

export const SliderVariant: Story = () => (
  <VariableEditorMenu variant="slider" trigger={<button>click me</button>} />
);
