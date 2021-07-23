import { Paragraph } from './Paragraph.component';

export default {
  title: 'Editor/Blocks/Paragraph',
  component: Paragraph,
};

export const Default = (args: { text: string }) => (
  <Paragraph
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
    nodeProps={{ styles: { root: { css: false } } }}
  >
    {args.text}
  </Paragraph>
);

Default.args = {
  text: 'Paragraph',
};

Default.storyName = 'Paragraph';
