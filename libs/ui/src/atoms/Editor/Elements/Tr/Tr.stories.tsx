import { Meta, Story } from '@storybook/react';
import { TrElement } from './Tr';

export default {
  title: 'Atoms/Editor/Elements/Tr',
  component: TrElement,
  args: {
    children: 'Tr Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Tr: Story<ArgsType> = (args) => (
  <TrElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </TrElement>
);
