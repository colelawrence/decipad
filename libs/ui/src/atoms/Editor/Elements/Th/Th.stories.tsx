import { Meta, Story } from '@storybook/react';
import { ThElement, ThElementProps } from './Th';

export default {
  title: 'Legacy/Editor/Elements/Th',
  component: ThElement,
  args: {
    children: 'Th Element',
    type: 'string',
  },
} as Meta;

export const Th: Story<ThElementProps> = (args) => <ThElement {...args} />;
