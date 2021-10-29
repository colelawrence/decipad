import { Meta, Story } from '@storybook/react';
import { ThElement } from './Th';

export default {
  title: 'Legacy/Editor/Elements/Th',
  component: ThElement,
  args: {
    children: 'Th Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Th: Story<ArgsType> = (args) => (
  <ThElement>{args.children}</ThElement>
);
