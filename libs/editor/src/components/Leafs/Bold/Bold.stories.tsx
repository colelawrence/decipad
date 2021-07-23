import { Bold } from './Bold.component';

export default {
  title: 'Editor/Leafs/Bold',
  component: Bold,
};

export const Default = (args: { text: string }) => (
  <Bold
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
  </Bold>
);

Default.args = {
  text: 'Bold',
};

Default.storyName = 'Bold';
