import { Strikethrough } from './Strikethrough.component';

export default {
  title: 'Editor/Leafs/Strikethrough',
  component: Strikethrough,
};

export const Default = (args: { text: string }) => (
  <Strikethrough
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
  >
    {args.text}
  </Strikethrough>
);

Default.args = {
  text: 'Strikethrough',
};

Default.storyName = 'Strikethrough';
