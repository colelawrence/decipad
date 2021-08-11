import { BoldLeaf } from './Bold';

export default {
  title: 'Atoms/Editor/Leafs/Bold',
  component: BoldLeaf,
  children: {
    text: 'Bold text',
  },
};

export const Bold = (args: { text: string }) => (
  <BoldLeaf
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
  </BoldLeaf>
);
