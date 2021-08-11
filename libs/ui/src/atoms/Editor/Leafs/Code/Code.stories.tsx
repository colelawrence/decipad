import { CodeLeaf } from './Code';

export default {
  title: 'Atoms/Editor/Leafs/Code',
  component: CodeLeaf,
  args: {
    text: '10 apples',
  },
};

export const Code = (args: { text: string }) => (
  <CodeLeaf
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
  </CodeLeaf>
);
