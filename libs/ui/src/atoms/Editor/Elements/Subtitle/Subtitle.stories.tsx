import { Meta, Story } from '@storybook/react';
import { SubtitleElement } from './Subtitle';

export default {
  title: 'Legacy/Editor/Elements/Subtitle',
  component: SubtitleElement,
  args: { children: 'Subtitle Element' },
} as Meta;

interface ArgsType {
  children: string;
}

export const Subtitle: Story<ArgsType> = (args) => (
  <SubtitleElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </SubtitleElement>
);
