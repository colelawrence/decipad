import { Meta, StoryFn } from '@storybook/react';
import { VariableEditorMenu } from './VariableEditorMenu';

export default {
  title: 'Organisms / Editor / Variable Editor / Menu',
  component: VariableEditorMenu,
} as Meta;

export const Normal: StoryFn = () => (
  <VariableEditorMenu
    variant="expression"
    trigger={<button>click me</button>}
  />
);

export const SliderVariant: StoryFn = () => (
  <VariableEditorMenu variant="slider" trigger={<button>click me</button>} />
);
