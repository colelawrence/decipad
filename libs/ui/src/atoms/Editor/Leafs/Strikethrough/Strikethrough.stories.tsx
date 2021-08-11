import { StrikethroughLeaf } from './Strikethrough';

export default {
  title: 'Atoms/Editor/Leafs/Strikethrough',
  component: StrikethroughLeaf,
  args: {
    text: 'This text is crossed out',
  },
};

export const Strikethrough = (args: { text: string }) => (
  <StrikethroughLeaf
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
  </StrikethroughLeaf>
);
