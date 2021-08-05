import { Meta, Story } from '@storybook/react';
import { TitleElement } from './Title';

export default {
  title: 'Atoms/Editor/Elements/Title',
  component: TitleElement,
  args: {
    children: 'Notebook Title',
  },
} as Meta;

interface ArgTypes {
  children: string;
}

export const Title: Story<ArgTypes> = (args) => (
  <TitleElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </TitleElement>
);
