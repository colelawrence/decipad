import { Meta, Story } from '@storybook/react';
import { TdElement } from './Td';

export default {
  title: 'Atoms/Editor/Elements/Td',
  component: TdElement,
  args: {
    children: 'Td Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Td: Story<ArgsType> = (args) => (
  <TdElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </TdElement>
);
