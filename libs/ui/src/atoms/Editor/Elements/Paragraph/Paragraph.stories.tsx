import { Meta, Story } from '@storybook/react';
import { ParagraphElement } from './Paragraph';

export default {
  title: 'Atoms/Editor/Elements/Paragraph',
  component: ParagraphElement,
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fringilla augue ac leo rhoncus aliquam. Cras facilisis vel mi vel sollicitudin. Aenean eget dapibus felis. Fusce in lectus id tellus accumsan maximus. Donec congue nisl augue, ut molestie dolor hendrerit in. Pellentesque nunc metus, euismod dignissim mollis ut, rutrum vel mi. Suspendisse nibh neque, elementum sed fringilla sit amet, laoreet sed velit. Suspendisse nec rhoncus mi. Duis pulvinar vel felis quis condimentum. Integer egestas mi ac dolor pharetra venenatis. Vivamus pharetra leo a luctus tincidunt. Aliquam id lacus tempus, malesuada augue id, hendrerit urna.',
  },
} as Meta;

interface ArgTypes {
  children: string;
}

export const Paragraph: Story<ArgTypes> = (args) => (
  <ParagraphElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </ParagraphElement>
);
