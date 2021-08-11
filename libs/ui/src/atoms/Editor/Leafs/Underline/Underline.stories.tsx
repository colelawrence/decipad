import { UnderlineLeaf } from './Underline';

export default {
  title: 'Atoms/Editor/Leafs/Underline',
  component: UnderlineLeaf,
  args: {
    text: 'Underlined text',
  },
};

export const Underline = (args: { text: string }) => (
  <UnderlineLeaf
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
  </UnderlineLeaf>
);
