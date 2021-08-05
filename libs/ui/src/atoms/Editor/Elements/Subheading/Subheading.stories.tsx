import { Meta, Story } from '@storybook/react';
import { SubheadingElement } from './Subheading';

export default {
  title: 'Atoms/Editor/Elements/Subheading',
  component: SubheadingElement,
  args: {
    children: 'Subheading Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Subheading: Story<ArgsType> = (args) => (
  <SubheadingElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </SubheadingElement>
);
