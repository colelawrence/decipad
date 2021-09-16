import { Meta, Story } from '@storybook/react';
import { ThElement } from './Th';

export default {
  title: 'Atoms/Editor/Elements/Th',
  component: ThElement,
  args: {
    children: 'Th Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Th: Story<ArgsType> = (args) => (
  <ThElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </ThElement>
);
