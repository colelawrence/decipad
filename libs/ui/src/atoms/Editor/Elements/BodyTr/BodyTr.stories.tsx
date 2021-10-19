import { Meta, Story } from '@storybook/react';
import { BodyTrElement } from './BodyTr';

export default {
  title: 'Atoms/Editor/Elements/BodyTr',
  component: BodyTrElement,
  args: {
    children: 'Body Tr Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const BodyTr: Story<ArgsType> = (args) => (
  <BodyTrElement>{args.children}</BodyTrElement>
);
