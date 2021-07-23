import { Subtitle } from './Subtitle.component';

export default {
  title: 'Editor/Blocks/Subtitle',
  component: Subtitle,
};

export const Default = (args: { text: string }) => (
  <Subtitle
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
  </Subtitle>
);

Default.args = {
  text: 'Subtitle',
};

Default.storyName = 'Subtitle';
